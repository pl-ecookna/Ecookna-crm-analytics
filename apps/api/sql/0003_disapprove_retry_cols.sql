-- Disapprove flow: ensure columns for retries and idempotency.

ALTER TABLE public.disaproov_calls
  ADD COLUMN IF NOT EXISTS retry_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS next_retry_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS last_error text NULL,
  ADD COLUMN IF NOT EXISTS processing_started_at timestamptz NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_disaproov_calls_call_id
  ON public.disaproov_calls (call_id);

CREATE INDEX IF NOT EXISTS idx_disaproov_calls_status_retry
  ON public.disaproov_calls (file_status, next_retry_at, created_at);
