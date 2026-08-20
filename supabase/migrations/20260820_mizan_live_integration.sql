BEGIN;

CREATE TABLE IF NOT EXISTS public.gateway_system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id text NOT NULL UNIQUE REFERENCES public.households(id) ON DELETE CASCADE,
  target_ssid text NOT NULL DEFAULT '',
  gateway_ip text NOT NULL DEFAULT '',
  wifi_band text NOT NULL DEFAULT '',
  security_type text NOT NULL DEFAULT '',
  auto_cutoff boolean NOT NULL DEFAULT true,
  notify_on_near_limit boolean NOT NULL DEFAULT true,
  notify_on_block boolean NOT NULL DEFAULT true,
  daily_digest boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS tracking_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS tracking_started_at timestamptz;
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS baseline_rx_bytes bigint NOT NULL DEFAULT 0;
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS baseline_tx_bytes bigint NOT NULL DEFAULT 0;
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS latest_ssid text NOT NULL DEFAULT '';
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS latest_gateway_ip text NOT NULL DEFAULT '';
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS latest_wifi_band text NOT NULL DEFAULT '';
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS latest_security_type text NOT NULL DEFAULT '';
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS latest_signal_percent integer;
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS latest_link_speed_mbps integer;
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS network_updated_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_gateway_settings_household_id
  ON public.gateway_system_settings (household_id);
CREATE INDEX IF NOT EXISTS idx_devices_household_last_seen
  ON public.devices (household_id, last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_snapshots_device_timestamp
  ON public.usage_snapshots (device_key, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_app_usage_records_device_date
  ON public.app_usage_records (device_key, recorded_date DESC);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_gateway_system_settings_updated_at ON public.gateway_system_settings;
CREATE TRIGGER set_gateway_system_settings_updated_at
BEFORE UPDATE ON public.gateway_system_settings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.is_household_owner(p_household_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.households h
    WHERE h.id = p_household_id AND h.owner_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_household_member(p_household_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.household_members hm
    WHERE hm.household_id = p_household_id
      AND hm.user_id = auth.uid()
      AND COALESCE(hm.is_active, true)
  );
$$;

REVOKE ALL ON FUNCTION public.is_household_owner(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_household_member(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_household_owner(text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_household_member(text) TO authenticated, service_role;

GRANT SELECT, INSERT, UPDATE ON public.gateway_system_settings TO authenticated;
GRANT UPDATE ON public.devices TO authenticated;
GRANT UPDATE, INSERT ON public.quota_policies TO authenticated;

DROP POLICY IF EXISTS gateway_settings_select_household ON public.gateway_system_settings;
DROP POLICY IF EXISTS gateway_settings_insert_owner ON public.gateway_system_settings;
DROP POLICY IF EXISTS gateway_settings_update_owner ON public.gateway_system_settings;
CREATE POLICY gateway_settings_select_household
ON public.gateway_system_settings FOR SELECT TO authenticated
USING (public.is_household_member(household_id) OR public.is_household_owner(household_id));
CREATE POLICY gateway_settings_insert_owner
ON public.gateway_system_settings FOR INSERT TO authenticated
WITH CHECK (public.is_household_owner(household_id));
CREATE POLICY gateway_settings_update_owner
ON public.gateway_system_settings FOR UPDATE TO authenticated
USING (public.is_household_owner(household_id))
WITH CHECK (public.is_household_owner(household_id));

DROP POLICY IF EXISTS devices_select_own ON public.devices;
DROP POLICY IF EXISTS devices_update_own ON public.devices;
CREATE POLICY devices_select_own
ON public.devices FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_household_owner(household_id));
CREATE POLICY devices_update_own
ON public.devices FOR UPDATE TO authenticated
USING (user_id = auth.uid() OR public.is_household_owner(household_id))
WITH CHECK (user_id = auth.uid() OR public.is_household_owner(household_id));

DROP POLICY IF EXISTS quota_policies_select_own_device ON public.quota_policies;
DROP POLICY IF EXISTS quota_policies_update_owner ON public.quota_policies;
DROP POLICY IF EXISTS quota_policies_insert_owner ON public.quota_policies;
CREATE POLICY quota_policies_select_own_device
ON public.quota_policies FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR public.is_household_owner(household_id)
  OR EXISTS (
    SELECT 1 FROM public.devices d
    WHERE d.device_key = quota_policies.device_key AND d.user_id = auth.uid()
  )
);
CREATE POLICY quota_policies_update_owner
ON public.quota_policies FOR UPDATE TO authenticated
USING (public.is_household_owner(household_id))
WITH CHECK (public.is_household_owner(household_id));
CREATE POLICY quota_policies_insert_owner
ON public.quota_policies FOR INSERT TO authenticated
WITH CHECK (public.is_household_owner(household_id));

DROP POLICY IF EXISTS household_members_select_own ON public.household_members;
CREATE POLICY household_members_select_own
ON public.household_members FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_household_owner(household_id));

DROP POLICY IF EXISTS usage_snapshots_select_own_device ON public.usage_snapshots;
CREATE POLICY usage_snapshots_select_own_device
ON public.usage_snapshots FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.devices d
    WHERE d.device_key = usage_snapshots.device_key
      AND (d.user_id = auth.uid() OR public.is_household_owner(d.household_id))
  )
);

DROP POLICY IF EXISTS app_usage_records_select_own ON public.app_usage_records;
CREATE POLICY app_usage_records_select_own
ON public.app_usage_records FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.devices d
    WHERE d.device_key = app_usage_records.device_key
      AND public.is_household_owner(d.household_id)
  )
);

CREATE OR REPLACE FUNCTION public.create_household(
  p_name text,
  p_monthly_quota_gb numeric DEFAULT 0,
  p_target_ssid text DEFAULT ''
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_household_id text := gen_random_uuid()::text;
  v_invite_code text := 'MZN-' || upper(substr(encode(gen_random_bytes(12), 'hex'), 1, 20));
BEGIN
  IF v_user_id IS NULL OR NULLIF(trim(p_name), '') IS NULL THEN
    RAISE EXCEPTION 'invalid_household_request';
  END IF;

  INSERT INTO public.households (id, name, owner_id, invite_code, monthly_quota_gb)
  VALUES (v_household_id, trim(p_name), v_user_id, v_invite_code, greatest(coalesce(p_monthly_quota_gb, 0), 0));

  INSERT INTO public.household_members (household_id, user_id, role, display_name, is_active, joined_at)
  SELECT v_household_id, v_user_id, 'owner',
         coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name'),
         true, timezone('utc'::text, now())
  FROM auth.users u WHERE u.id = v_user_id;

  INSERT INTO public.gateway_system_settings (household_id, target_ssid)
  VALUES (v_household_id, coalesce(trim(p_target_ssid), ''));

  RETURN v_household_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_household_invite(
  p_household_id text,
  p_display_name text DEFAULT ''
)
RETURNS TABLE(invite_token text, deep_link text, web_link text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_token text;
BEGIN
  IF NOT public.is_household_owner(p_household_id) THEN
    RAISE EXCEPTION 'not_household_owner';
  END IF;

  v_token := 'MZN-' || upper(substr(encode(gen_random_bytes(24), 'hex'), 1, 40));
  INSERT INTO public.household_members (
    household_id, role, display_name, is_active, joined_at, invite_token
  ) VALUES (
    p_household_id, 'member', NULLIF(trim(p_display_name), ''), true,
    timezone('utc'::text, now()), v_token
  );

  RETURN QUERY SELECT v_token, 'mizan://join/' || v_token, 'https://mizan.app/join/' || v_token;
END;
$$;

REVOKE ALL ON FUNCTION public.create_household(text, numeric, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.create_household_invite(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_household(text, numeric, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_household_invite(text, text) TO authenticated, service_role;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='gateway_system_settings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.gateway_system_settings;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='devices'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.devices;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='usage_snapshots'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.usage_snapshots;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='household_members'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.household_members;
  END IF;
END;
$$;

COMMIT;
