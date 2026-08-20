BEGIN;
ALTER TABLE public.usage_snapshots ADD COLUMN IF NOT EXISTS gateway_ip text NOT NULL DEFAULT '';
ALTER TABLE public.usage_snapshots ADD COLUMN IF NOT EXISTS wifi_band text NOT NULL DEFAULT '';
ALTER TABLE public.usage_snapshots ADD COLUMN IF NOT EXISTS security_type text NOT NULL DEFAULT '';
ALTER TABLE public.usage_snapshots ADD COLUMN IF NOT EXISTS signal_percent integer;
ALTER TABLE public.usage_snapshots ADD COLUMN IF NOT EXISTS link_speed_mbps integer;
ALTER TABLE public.usage_snapshots ADD COLUMN IF NOT EXISTS tracking_started_at timestamptz;
ALTER TABLE public.usage_snapshots ADD COLUMN IF NOT EXISTS baseline_rx_bytes bigint NOT NULL DEFAULT 0;
ALTER TABLE public.usage_snapshots ADD COLUMN IF NOT EXISTS baseline_tx_bytes bigint NOT NULL DEFAULT 0;
COMMIT;
BEGIN;
GRANT UPDATE ON public.households TO authenticated;
DROP POLICY IF EXISTS households_update_owner ON public.households;
CREATE POLICY households_update_owner
ON public.households FOR UPDATE TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());
COMMIT;
