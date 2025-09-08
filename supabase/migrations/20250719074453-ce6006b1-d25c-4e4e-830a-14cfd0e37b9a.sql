-- Создаем таблицу sales_calls_analysis с правильной структурой
CREATE TABLE IF NOT EXISTS public.sales_calls_analysis (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now(),
  
  -- Основные данные звонка
  call_duration_seconds integer,
  transcript_text text,
  
  -- Анализ объекта
  object_type character varying,
  object_score integer,
  construction_count character varying,
  construction_score integer,
  
  -- Временные рамки
  window_needed_when character varying,
  timing_score integer,
  
  -- Процесс продаж
  measurement_scheduled boolean DEFAULT false,
  measurement_score integer,
  
  -- Планирование контактов
  next_contact_date character varying,
  next_contact_method character varying,
  
  -- Характеристики клиента
  client_requirements text,
  client_emotion character varying,
  emotion_score integer,
  
  -- Итоговые показатели
  total_score integer,
  client_warmth character varying,
  
  -- Технические поля
  telegram_chat_id bigint,
  file_id text
);

-- Включаем RLS
ALTER TABLE public.sales_calls_analysis ENABLE ROW LEVEL SECURITY;

-- Создаем политику для чтения (для демо - разрешить всем)
CREATE POLICY "Allow public read access" ON public.sales_calls_analysis
  FOR SELECT USING (true);

-- Создаем политику для вставки (для демо - разрешить всем)
CREATE POLICY "Allow public insert" ON public.sales_calls_analysis
  FOR INSERT WITH CHECK (true);

-- Создаем политику для обновления (для демо - разрешить всем)
CREATE POLICY "Allow public update" ON public.sales_calls_analysis
  FOR UPDATE USING (true);

-- Создаем политику для удаления (для демо - разрешить всем)  
CREATE POLICY "Allow public delete" ON public.sales_calls_analysis
  FOR DELETE USING (true);