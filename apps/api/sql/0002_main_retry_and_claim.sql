-- Main flow: retry metadata + atomic claim function for Supabase (crm_analytics).

ALTER TABLE public.crm_analytics
  ADD COLUMN IF NOT EXISTS retry_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS next_retry_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS last_error text NULL,
  ADD COLUMN IF NOT EXISTS processing_started_at timestamptz NULL;

CREATE INDEX IF NOT EXISTS idx_crm_analytics_status_retry
  ON public.crm_analytics (file_status, next_retry_at, call_datetime);

CREATE OR REPLACE FUNCTION public.claim_crm_calls(p_limit integer DEFAULT 150)
RETURNS SETOF public.crm_analytics
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH picked AS (
    SELECT id
    FROM public.crm_analytics
    WHERE file_status = 'new'
      AND (next_retry_at IS NULL OR next_retry_at <= NOW())
    ORDER BY call_datetime ASC
    LIMIT p_limit
    FOR UPDATE SKIP LOCKED
  )
  UPDATE public.crm_analytics c
  SET
    file_status = 'processing',
    processing_started_at = NOW()
  FROM picked
  WHERE c.id = picked.id
  RETURNING c.*;
END;
$$;
