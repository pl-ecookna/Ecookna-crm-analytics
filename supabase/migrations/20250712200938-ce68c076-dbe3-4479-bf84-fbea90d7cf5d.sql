-- Create transcriptions table for storing audio call transcriptions
CREATE TABLE public.transcriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  title TEXT NOT NULL,
  summary_short TEXT NOT NULL,
  summary_full TEXT NOT NULL,
  goal_achieved BOOLEAN NOT NULL,
  steno TEXT NOT NULL,
  audio_id TEXT,
  source TEXT
);

-- Enable Row Level Security
ALTER TABLE public.transcriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for CRUD operations
CREATE POLICY "Allow all operations on transcriptions" 
ON public.transcriptions 
FOR ALL 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at column for tracking modifications
ALTER TABLE public.transcriptions 
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_transcriptions_updated_at
BEFORE UPDATE ON public.transcriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();