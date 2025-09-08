-- Обновляем структуру таблицы sales_calls_analysis для соответствия требованиям
ALTER TABLE sales_calls_analysis 
-- Добавляем недостающие поля
ADD COLUMN IF NOT EXISTS object_type character varying,
ADD COLUMN IF NOT EXISTS object_score integer,
ADD COLUMN IF NOT EXISTS construction_score integer,
ADD COLUMN IF NOT EXISTS window_needed_when character varying,
ADD COLUMN IF NOT EXISTS timing_score integer,
ADD COLUMN IF NOT EXISTS measurement_scheduled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS measurement_score integer,
ADD COLUMN IF NOT EXISTS next_contact_date character varying,
ADD COLUMN IF NOT EXISTS next_contact_method character varying,
ADD COLUMN IF NOT EXISTS client_requirements text,
ADD COLUMN IF NOT EXISTS client_emotion character varying,
ADD COLUMN IF NOT EXISTS client_warmth character varying,
ADD COLUMN IF NOT EXISTS transcript_text text;

-- Изменяем тип construction_count с integer на varchar для поддержки текстовых значений
ALTER TABLE sales_calls_analysis 
ALTER COLUMN construction_count TYPE character varying USING construction_count::text;

-- Переименовываем некоторые поля для соответствия ожидаемой структуре  
ALTER TABLE sales_calls_analysis 
RENAME COLUMN telegram_file_id TO file_id;