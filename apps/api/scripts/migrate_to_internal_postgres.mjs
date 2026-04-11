import { Pool } from 'pg';

const TARGET_POSTGRES_URL = process.env.TARGET_POSTGRES_URL;
const SOURCE_SUPABASE_PROJECT_REF = process.env.SOURCE_SUPABASE_PROJECT_REF;
const SOURCE_SUPABASE_PAT = process.env.SOURCE_SUPABASE_PAT;
const SOURCE_DISAPPROVE_URL = process.env.SOURCE_DISAPPROVE_URL;

if (!TARGET_POSTGRES_URL) throw new Error('TARGET_POSTGRES_URL is required');
if (!SOURCE_SUPABASE_PROJECT_REF) throw new Error('SOURCE_SUPABASE_PROJECT_REF is required');
if (!SOURCE_SUPABASE_PAT) throw new Error('SOURCE_SUPABASE_PAT is required');
if (!SOURCE_DISAPPROVE_URL) throw new Error('SOURCE_DISAPPROVE_URL is required');

const targetPool = new Pool({ connectionString: TARGET_POSTGRES_URL });
const disapproveSourcePool = new Pool({ connectionString: SOURCE_DISAPPROVE_URL });

const crmSelectColumns = [
  'id',
  'call_id',
  'call_datetime',
  'uploaded_at',
  'analyzed_at',
  'client_id',
  'client_phone',
  'user_id',
  'user_name',
  'department',
  'brand',
  'call_type',
  'file_name',
  'file_url',
  'file_status',
  'tag',
  'is_first_contact',
  'transcription_crm',
  'transkription',
  'greeting_correct',
  'operator_said_name',
  'cause_identified',
  'cause_clarified',
  'address_clarified',
  'active_listening_done',
  'answer_complete',
  'operator_thanked',
  'client_helped',
  'conflict_resolved',
  'conflict_moments',
  'conflict_risk_score',
  'operator_tonality',
  'final_conclusion',
  'compliance_score',
  'call_success',
  'overall_score',
  'burnout_level',
  'burnout_signs',
  'conversation_stage_greeting',
  'conversation_stage_request',
  'conversation_stage_solution',
  'conversation_stage_closing',
  'conversation_duration_total',
  'conversation_duration_minutes',
  'stages_score',
  'quality_score',
  'fcr_score',
  'csi_score',
  'dialog_agent_speech_percentage',
  'dialog_customer_speech_percentage',
  'dialog_silence_length_percentage',
  'dialog_interruptions_in_agent_speech_percentage',
  'agent_speech_speed_words_all_call_mean',
  'customer_emo_score_mean',
  'customer_emo_score_weighted_by_speech_length_mean',
  'customer_emotion_neg_speech_time_percentage',
  'customer_emotion_pos_speech_time_percentage',
  'customer_emotion_pos_utt_percentage',
  'operator_emotion_positive',
  'operator_emotion_neutral',
  'operator_emotion_negative',
  'client_emotion_positive',
  'client_emotion_neutral',
  'client_emotion_negative',
  'emotion_stress_index',
];

const promptSelectColumns = ['id', 'prompt_key', 'prompt_name', 'prompt_text', 'created_at'];

const disapproveSelectColumns = [
  'id',
  'call_id',
  'call_datetime',
  'client_id',
  'client_phone',
  'user_id',
  'user_name',
  'department',
  'brand',
  'call_type',
  'deal_source',
  'product_type',
  'region',
  'user_notes',
  'created_at',
  'file_status',
  'file_url',
  'file_name',
  'reject_reasons',
  'retry_count',
  'next_retry_at',
  'last_error',
  'processing_started_at',
];

const numericFields = new Set([
  'conflict_risk_score',
  'compliance_score',
  'overall_score',
  'burnout_level',
  'conversation_duration_minutes',
  'stages_score',
  'quality_score',
  'fcr_score',
  'csi_score',
  'dialog_agent_speech_percentage',
  'dialog_customer_speech_percentage',
  'dialog_silence_length_percentage',
  'dialog_interruptions_in_agent_speech_percentage',
  'agent_speech_speed_words_all_call_mean',
  'customer_emo_score_mean',
  'customer_emo_score_weighted_by_speech_length_mean',
  'customer_emotion_neg_speech_time_percentage',
  'customer_emotion_pos_speech_time_percentage',
  'customer_emotion_pos_utt_percentage',
  'operator_emotion_positive',
  'operator_emotion_neutral',
  'operator_emotion_negative',
  'client_emotion_positive',
  'client_emotion_neutral',
  'client_emotion_negative',
  'emotion_stress_index',
  'retry_count',
]);

const jsonFields = new Set(['reject_reasons']);

const buildFileUrl = (fileName) => (fileName
  ? `https://s3.ru1.storage.beget.cloud/1bf1b61c108f-entechais3/${fileName}`
  : null);

const toNumberOrNull = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const normalizeRow = (row, columns, tableName) => {
  const out = {};
  for (const col of columns) {
    let value = row[col];

    if (value === undefined) {
      value = null;
    }

    if (tableName === 'crm_analytics' && col === 'file_url' && !value) {
      value = buildFileUrl(row.file_name);
    }

    if (tableName === 'disaproov_calls' && col === 'file_url' && !value) {
      value = buildFileUrl(row.file_name);
    }

    if (numericFields.has(col)) {
      value = toNumberOrNull(value);
    }

    if (jsonFields.has(col) && typeof value === 'string') {
      try {
        value = JSON.parse(value);
      } catch {
        value = null;
      }
    }

    if (col === 'file_status' && !value) {
      value = 'new';
    }

    out[col] = value;
  }

  return out;
};

const runManagementQuery = async (query) => {
  const res = await fetch(`https://api.supabase.com/v1/projects/${SOURCE_SUPABASE_PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SOURCE_SUPABASE_PAT}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, read_only: true }),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Management query failed: ${res.status} ${text}`);
  }

  return JSON.parse(text);
};

const fetchAllCrmRows = async () => runManagementQuery(`
  select
    id,
    call_id,
    call_datetime,
    uploaded_at,
    analyzed_at,
    client_id,
    client_phone,
    user_id,
    user_name,
    department,
    brand,
    call_type,
    file_name,
    file_url,
    file_status,
    tag,
    is_first_contact,
    transcription_crm,
    transkription,
    greeting_correct,
    operator_said_name,
    cause_identified,
    cause_clarified,
    address_clarified,
    active_listening_done,
    answer_complete,
    operator_thanked,
    client_helped,
    conflict_resolved,
    conflict_moments,
    conflict_risk_score,
    operator_tonality,
    final_conclusion,
    compliance_score,
    call_success,
    overall_score,
    burnout_level,
    burnout_signs,
    conversation_stage_greeting,
    conversation_stage_request,
    conversation_stage_solution,
    conversation_stage_closing,
    conversation_duration_total,
    conversation_duration_minutes,
    stages_score,
    quality_score,
    fcr_score,
    csi_score,
    dialog_agent_speech_percentage,
    dialog_customer_speech_percentage,
    dialog_silence_length_percentage,
    dialog_interruptions_in_agent_speech_percentage,
    agent_speech_speed_words_all_call_mean,
    customer_emo_score_mean,
    customer_emo_score_weighted_by_speech_length_mean,
    customer_emotion_neg_speech_time_percentage,
    customer_emotion_pos_speech_time_percentage,
    customer_emotion_pos_utt_percentage,
    operator_emotion_positive,
    operator_emotion_neutral,
    operator_emotion_negative,
    client_emotion_positive,
    client_emotion_neutral,
    client_emotion_negative,
    emotion_stress_index
  from public.crm_analytics
  order by call_datetime asc, id asc;
`);

const fetchPromptRows = async () => {
  return runManagementQuery(`
    select id, prompt_key, prompt_name, prompt_text, created_at
    from public.prompts
    order by created_at asc, id asc;
  `);
};

const fetchDisapproveRows = async () => {
  const { rows } = await disapproveSourcePool.query(
    `SELECT ${disapproveSelectColumns.map((c) => `"${c}"`).join(', ')}
     FROM public.disaproov_calls
     ORDER BY created_at ASC, id ASC`,
  );
  return rows;
};

const insertRows = async (client, tableName, columns, rows, conflictTarget) => {
  if (rows.length === 0) return;

  await client.query('BEGIN');
  try {
    for (const row of rows) {
      const values = columns.map((col) => row[col] ?? null);
      const placeholders = columns.map((_, idx) => `$${idx + 1}`).join(', ');
      const query = `INSERT INTO public.${tableName} (${columns.map((c) => `"${c}"`).join(', ')}) VALUES (${placeholders}) ON CONFLICT ("${conflictTarget}") DO UPDATE SET ${columns
        .filter((c) => c !== 'id' && c !== conflictTarget)
        .map((c) => `"${c}" = EXCLUDED."${c}"`)
        .join(', ')}`;
      await client.query(query, values);
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
};

const resetSequences = async (client) => {
  await client.query(`SELECT setval(pg_get_serial_sequence('public.crm_analytics', 'id'), COALESCE((SELECT MAX(id) FROM public.crm_analytics), 1), true)`);
  await client.query(`SELECT setval(pg_get_serial_sequence('public.prompts', 'id'), COALESCE((SELECT MAX(id) FROM public.prompts), 1), true)`);
  await client.query(`SELECT setval(pg_get_serial_sequence('public.disaproov_calls', 'id'), COALESCE((SELECT MAX(id) FROM public.disaproov_calls), 1), true)`);
};

const main = async () => {
  const crmRaw = await fetchAllCrmRows();
  const crmRows = crmRaw.map((row) => normalizeRow(row, crmSelectColumns, 'crm_analytics'));

  const promptRaw = await fetchPromptRows();
  const promptRows = promptRaw.map((row) => normalizeRow(row, promptSelectColumns, 'prompts'));
  const disapproveRaw = await fetchDisapproveRows();
  const disapproveRows = disapproveRaw.map((row) => normalizeRow(row, disapproveSelectColumns, 'disaproov_calls'));

  const client = await targetPool.connect();
  try {
    await client.query('TRUNCATE TABLE public.crm_analytics RESTART IDENTITY CASCADE');
    await client.query('TRUNCATE TABLE public.prompts RESTART IDENTITY CASCADE');
    await client.query('TRUNCATE TABLE public.disaproov_calls RESTART IDENTITY CASCADE');

    await insertRows(client, 'crm_analytics', crmSelectColumns, crmRows, 'call_id');
    await insertRows(client, 'prompts', promptSelectColumns, promptRows, 'prompt_key');
    await insertRows(client, 'disaproov_calls', disapproveSelectColumns, disapproveRows, 'call_id');

    await resetSequences(client);

    const crmCount = await client.query('SELECT count(*)::int AS count FROM public.crm_analytics');
    const promptCount = await client.query('SELECT count(*)::int AS count FROM public.prompts');
    const disapproveCount = await client.query('SELECT count(*)::int AS count FROM public.disaproov_calls');

    console.log(JSON.stringify({
      crm_analytics: crmCount.rows[0].count,
      prompts: promptCount.rows[0].count,
      disaproov_calls: disapproveCount.rows[0].count,
    }, null, 2));
  } finally {
    client.release();
    await targetPool.end();
    await disapproveSourcePool.end();
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
