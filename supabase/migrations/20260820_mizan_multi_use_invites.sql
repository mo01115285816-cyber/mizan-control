BEGIN;

CREATE TABLE IF NOT EXISTS public.household_invite_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id text NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  invite_token text NOT NULL UNIQUE,
  max_uses integer NOT NULL DEFAULT 5 CHECK (max_uses >= 0),
  use_count integer NOT NULL DEFAULT 0 CHECK (use_count >= 0),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_household_invite_links_household
  ON public.household_invite_links (household_id, created_at DESC);

ALTER TABLE public.household_invite_links ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.household_invite_links TO authenticated;

DROP POLICY IF EXISTS household_invite_links_select_owner ON public.household_invite_links;
CREATE POLICY household_invite_links_select_owner
ON public.household_invite_links FOR SELECT TO authenticated
USING (public.is_household_owner(household_id));

DROP TRIGGER IF EXISTS set_household_invite_links_updated_at ON public.household_invite_links;
CREATE TRIGGER set_household_invite_links_updated_at
BEFORE UPDATE ON public.household_invite_links
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.create_household_invite(
  p_household_id text,
  p_display_name text DEFAULT '',
  p_max_uses integer DEFAULT 5
)
RETURNS TABLE(invite_token text, deep_link text, web_link text, max_uses integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_token text;
  v_max_uses integer := greatest(coalesce(p_max_uses, 5), 0);
BEGIN
  IF NOT public.is_household_owner(p_household_id) THEN
    RAISE EXCEPTION 'not_household_owner';
  END IF;
  v_token := 'MZN-' || upper(substr(encode(extensions.gen_random_bytes(24), 'hex'), 1, 40));
  INSERT INTO public.household_invite_links (household_id, invite_token, max_uses)
  VALUES (p_household_id, v_token, v_max_uses);
  RETURN QUERY SELECT v_token, 'mizan://join/' || v_token, 'https://mizan.app/join/' || v_token, v_max_uses;
END;
$$;

CREATE OR REPLACE FUNCTION public.accept_invite(p_invite_token text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions, pg_temp
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_household_id text;
  v_member_id uuid;
  v_link_id uuid;
  v_max_uses integer;
  v_use_count integer;
  v_name text;
  v_avatar text;
BEGIN
  IF v_user_id IS NULL OR NULLIF(trim(p_invite_token), '') IS NULL THEN
    RETURN false;
  END IF;

  SELECT l.id, l.household_id, l.max_uses, l.use_count
    INTO v_link_id, v_household_id, v_max_uses, v_use_count
  FROM public.household_invite_links l
  WHERE l.invite_token = trim(p_invite_token)
    AND l.is_active
    AND (l.max_uses = 0 OR l.use_count < l.max_uses)
  FOR UPDATE;

  IF v_link_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM public.household_members hm
      WHERE hm.household_id = v_household_id AND hm.user_id = v_user_id AND COALESCE(hm.is_active, true)
    ) THEN
      RETURN true;
    END IF;

    SELECT COALESCE(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name'),
           COALESCE(u.raw_user_meta_data ->> 'avatar_url', u.raw_user_meta_data ->> 'picture')
      INTO v_name, v_avatar
    FROM auth.users u WHERE u.id = v_user_id;

    INSERT INTO public.household_members (
      household_id, user_id, role, display_name, avatar_url, is_active, joined_at
    ) VALUES (
      v_household_id, v_user_id, 'member', v_name, v_avatar, true, timezone('utc'::text, now())
    ) ON CONFLICT (household_id, user_id) DO UPDATE
      SET is_active = true,
          display_name = COALESCE(EXCLUDED.display_name, household_members.display_name),
          avatar_url = COALESCE(EXCLUDED.avatar_url, household_members.avatar_url),
          joined_at = timezone('utc'::text, now());

    UPDATE public.household_invite_links
    SET use_count = use_count + 1,
        is_active = CASE WHEN max_uses > 0 AND use_count + 1 >= max_uses THEN false ELSE true END
    WHERE id = v_link_id;
    RETURN true;
  END IF;

  -- Backward-compatible one-time invite path.
  SELECT hm.id, hm.household_id
    INTO v_member_id, v_household_id
  FROM public.household_members hm
  WHERE hm.invite_token = trim(p_invite_token)
    AND COALESCE(hm.is_active, true)
    AND (hm.user_id IS NULL OR hm.user_id = v_user_id)
  FOR UPDATE;

  IF v_member_id IS NOT NULL THEN
    SELECT COALESCE(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name'),
           COALESCE(u.raw_user_meta_data ->> 'avatar_url', u.raw_user_meta_data ->> 'picture')
      INTO v_name, v_avatar
    FROM auth.users u WHERE u.id = v_user_id;
    UPDATE public.household_members
    SET user_id = v_user_id,
        role = COALESCE(NULLIF(role, ''), 'member'),
        display_name = COALESCE(NULLIF(display_name, ''), v_name),
        avatar_url = COALESCE(NULLIF(avatar_url, ''), v_avatar),
        is_active = true,
        invite_token = NULL,
        joined_at = timezone('utc'::text, now())
    WHERE id = v_member_id;
    RETURN true;
  END IF;

  SELECT h.id INTO v_household_id
  FROM public.households h
  WHERE h.invite_code = trim(p_invite_token);
  IF v_household_id IS NULL THEN RETURN false; END IF;

  SELECT COALESCE(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name'),
         COALESCE(u.raw_user_meta_data ->> 'avatar_url', u.raw_user_meta_data ->> 'picture')
    INTO v_name, v_avatar
  FROM auth.users u WHERE u.id = v_user_id;

  INSERT INTO public.household_members (household_id, user_id, role, display_name, avatar_url, is_active, joined_at)
  VALUES (v_household_id, v_user_id, 'member', v_name, v_avatar, true, timezone('utc'::text, now()))
  ON CONFLICT (household_id, user_id) DO UPDATE
    SET is_active = true,
        display_name = COALESCE(EXCLUDED.display_name, household_members.display_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, household_members.avatar_url),
        joined_at = timezone('utc'::text, now());
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.create_household_invite(text, text, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_household_invite(text, text, integer) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.accept_invite(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.accept_invite(text) TO authenticated, service_role;

COMMIT;
