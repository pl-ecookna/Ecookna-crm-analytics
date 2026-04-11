-- Remove unnecessary columns from call_analysis_crm table
ALTER TABLE public.call_analysis_crm 
DROP COLUMN IF EXISTS deal_type,
DROP COLUMN IF EXISTS deal_source,
DROP COLUMN IF EXISTS product_type,
DROP COLUMN IF EXISTS region,
DROP COLUMN IF EXISTS user_notes;