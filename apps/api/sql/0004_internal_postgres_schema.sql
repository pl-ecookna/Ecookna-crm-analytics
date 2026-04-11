-- Minimal schema for the internal Postgres backend.
-- This file is intentionally limited to what is actually used by:
-- - backend: crm_analytics upsert/update + retry columns; prompts lookup; disaproov_calls worker
-- - frontend: call cards + call details + prompt management UI
--
-- Notes:
-- - We keep `transkription_full_json` because the UI reads speech metrics from it.
-- - We do NOT add legacy/unused tables (auth/functions/triggers/call_analysis/etc).
-- - This migration is meant for a fresh internal DB. It drops and recreates the 3 tables.

BEGIN;

DROP TABLE IF EXISTS public.crm_analytics;
DROP TABLE IF EXISTS public.prompts;
DROP TABLE IF EXISTS public.disaproov_calls;

CREATE TABLE public.crm_analytics (
  id bigserial PRIMARY KEY,
  call_id text NOT NULL UNIQUE,
  call_datetime timestamptz NOT NULL,

  uploaded_at timestamptz NULL,
  analyzed_at timestamptz NULL,

  client_id text NULL,
  client_phone text NULL,
  user_id text NULL,

  user_name text NOT NULL,
  department text NULL,
  brand text NULL,
  call_type text NULL,

  file_name text NULL,
  file_url text NOT NULL,
  file_status text NOT NULL DEFAULT 'new',

  tag text NULL,
  marketing_channel text NULL,
  is_first_contact boolean NULL,

  transcription_crm text NULL,
  transkription text NULL,
  transkription_full_json jsonb NULL,

  -- LLM оценка (используется в UI + пишется бэкендом)
  greeting_correct boolean NULL,
  operator_said_name boolean NULL,
  cause_identified boolean NULL,
  cause_clarified boolean NULL,
  address_clarified boolean NULL,
  active_listening_done boolean NULL,
  answer_complete boolean NULL,
  operator_thanked boolean NULL,
  client_helped boolean NULL,
  conflict_resolved boolean NULL,

  conflict_moments text NULL,
  conflict_risk_score numeric NULL,
  operator_tonality text NULL,
  final_conclusion text NULL,

  compliance_score numeric NULL,
  call_success text NULL,
  overall_score numeric NULL,

  burnout_level numeric NULL,
  burnout_signs text NULL,

  conversation_stage_greeting text NULL,
  conversation_stage_request text NULL,
  conversation_stage_solution text NULL,
  conversation_stage_closing text NULL,
  conversation_duration_total text NULL,
  conversation_duration_minutes numeric NULL,

  stages_score numeric NULL,
  quality_score numeric NULL,
  fcr_score numeric NULL,

  -- Sber insight / эмоции (частично пишется бэкендом, используется UI)
  csi_score numeric NULL,
  dialog_agent_speech_percentage numeric NULL,
  dialog_customer_speech_percentage numeric NULL,
  dialog_silence_length_percentage numeric NULL,
  agent_speech_speed_words_all_call_mean numeric NULL,

  customer_emo_score_mean numeric NULL,
  customer_emo_score_weighted_by_speech_length_mean numeric NULL,
  customer_emotion_neg_speech_time_percentage numeric NULL,
  customer_emotion_pos_speech_time_percentage numeric NULL,
  customer_emotion_pos_utt_percentage numeric NULL,

  operator_emotion_positive numeric NULL,
  operator_emotion_neutral numeric NULL,
  operator_emotion_negative numeric NULL,
  client_emotion_positive numeric NULL,
  client_emotion_neutral numeric NULL,
  client_emotion_negative numeric NULL,
  emotion_stress_index numeric NULL,

  -- Retry/claim колонки (используются бэкендом)
  retry_count integer NOT NULL DEFAULT 0,
  next_retry_at timestamptz NULL,
  last_error text NULL,
  processing_started_at timestamptz NULL
);

CREATE INDEX idx_crm_analytics_status_retry
  ON public.crm_analytics (file_status, next_retry_at, call_datetime);

CREATE INDEX idx_crm_analytics_call_datetime
  ON public.crm_analytics (call_datetime DESC);

CREATE INDEX idx_crm_analytics_filters
  ON public.crm_analytics (user_name, department, brand);

CREATE TABLE public.prompts (
  id bigserial PRIMARY KEY,
  prompt_key text NOT NULL UNIQUE,
  prompt_name text NOT NULL,
  prompt_text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_prompts_prompt_key
  ON public.prompts (prompt_key);

CREATE TABLE public.disaproov_calls (
  id bigserial PRIMARY KEY,
  call_id text NOT NULL UNIQUE,
  call_datetime timestamptz NOT NULL,

  client_id text NULL,
  client_phone text NULL,
  user_id text NULL,

  user_name text NOT NULL,
  department text NULL,
  brand text NULL,
  call_type text NULL,

  deal_source text NULL,
  product_type text NULL,
  region text NULL,
  user_notes text NULL,
  marketing_channel text NULL,

  created_at timestamptz NOT NULL DEFAULT NOW(),

  file_status text NOT NULL DEFAULT 'new',
  file_url text NOT NULL,
  file_name text NULL,

  reject_reasons jsonb NULL,

  retry_count integer NOT NULL DEFAULT 0,
  next_retry_at timestamptz NULL,
  last_error text NULL,
  processing_started_at timestamptz NULL
);

CREATE INDEX idx_disaproov_calls_status_retry
  ON public.disaproov_calls (file_status, next_retry_at, created_at);

CREATE INDEX idx_disaproov_calls_created_at
  ON public.disaproov_calls (created_at DESC);

COMMIT;
