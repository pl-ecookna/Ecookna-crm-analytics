-- Add marketing channel field for CRM/disapprove webhook payload persistence.
-- Safe to run multiple times.

BEGIN;

ALTER TABLE IF EXISTS public.crm_analytics
  ADD COLUMN IF NOT EXISTS marketing_channel text NULL;

ALTER TABLE IF EXISTS public.disaproov_calls
  ADD COLUMN IF NOT EXISTS marketing_channel text NULL;

COMMIT;
