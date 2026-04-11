-- Cleanup unused AI-related transcription artifacts.
-- Prompts are intentionally preserved because they are still used.

DROP TRIGGER IF EXISTS update_transcriptions_updated_at ON public.transcriptions;
DROP TABLE IF EXISTS public.transcriptions;
DROP FUNCTION IF EXISTS public.update_updated_at_column();
