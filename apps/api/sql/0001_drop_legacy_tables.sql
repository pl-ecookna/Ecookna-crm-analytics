-- Remove legacy tables that are no longer needed in the new architecture.
DROP TABLE IF EXISTS public.call_analysis CASCADE;
DROP TABLE IF EXISTS public.sales_calls_analysis CASCADE;
DROP TABLE IF EXISTS public.transcriptions CASCADE;
