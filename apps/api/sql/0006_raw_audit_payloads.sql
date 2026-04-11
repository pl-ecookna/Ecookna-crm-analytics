-- Store raw webhook + vendor payloads for manual audits (no UI dependency).
-- Safe to run multiple times.

BEGIN;

ALTER TABLE IF EXISTS public.crm_analytics
  ADD COLUMN IF NOT EXISTS webhook_payload_json jsonb NULL;
ALTER TABLE IF EXISTS public.crm_analytics
  ADD COLUMN IF NOT EXISTS webhook_payload_text text NULL;
ALTER TABLE IF EXISTS public.crm_analytics
  ADD COLUMN IF NOT EXISTS openai_full_json jsonb NULL;

ALTER TABLE IF EXISTS public.disaproov_calls
  ADD COLUMN IF NOT EXISTS webhook_payload_json jsonb NULL;
ALTER TABLE IF EXISTS public.disaproov_calls
  ADD COLUMN IF NOT EXISTS webhook_payload_text text NULL;
ALTER TABLE IF EXISTS public.disaproov_calls
  ADD COLUMN IF NOT EXISTS deepgram_full_json jsonb NULL;
ALTER TABLE IF EXISTS public.disaproov_calls
  ADD COLUMN IF NOT EXISTS openai_full_json jsonb NULL;

COMMIT;

