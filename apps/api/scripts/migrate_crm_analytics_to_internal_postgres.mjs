import pg from 'pg';

const { Pool } = pg;

const TARGET_POSTGRES_URL = process.env.TARGET_POSTGRES_URL;
const SOURCE_SUPABASE_PROJECT_REF = process.env.SOURCE_SUPABASE_PROJECT_REF;
const SOURCE_SUPABASE_PAT = process.env.SOURCE_SUPABASE_PAT;

if (!TARGET_POSTGRES_URL) throw new Error('TARGET_POSTGRES_URL is required');
if (!SOURCE_SUPABASE_PROJECT_REF) throw new Error('SOURCE_SUPABASE_PROJECT_REF is required');
if (!SOURCE_SUPABASE_PAT) throw new Error('SOURCE_SUPABASE_PAT is required');

const targetPool = new Pool({ connectionString: TARGET_POSTGRES_URL });

const sourceColumns = [
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
  'updated_at',
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

const targetColumns = [
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
  'transkription_full_json',
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
  'retry_count',
  'next_retry_at',
  'last_error',
  'processing_started_at',
];

const sourceSelect = sourceColumns
  .filter((column) => column !== 'id')
  .map((column) => `"${column}"`)
  .concat(`transkription_full_json->'insight_result'->'call_features' as call_features`)
  .join(', ');

const normalize = (key, value) => {
  if (value === undefined) return null;
  if (value === null) return null;
  if (key === 'transkription_full_json' && typeof value === 'object') return JSON.stringify(value);
  return value;
};

const fetchCrmBatch = async (offset, limit) => {
  const query = `
    select id, ${sourceSelect}
    from public.crm_analytics
    order by call_datetime asc, id asc
    limit ${limit} offset ${offset}
  `;

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

const upsertCrmRow = async (client, row) => {
  const insertColumns = targetColumns;
  const values = insertColumns.map((column) => {
    if (column === 'transkription_full_json') {
      return row.call_features ? { insight_result: { call_features: row.call_features } } : null;
    }
    return normalize(column, row[column]);
  });
  const placeholders = insertColumns.map((_, idx) => `$${idx + 1}`).join(', ');
  const setClause = insertColumns
    .filter((column) => column !== 'id' && column !== 'call_id')
    .map((column) => `"${column}" = EXCLUDED."${column}"`)
    .join(', ');

  const query = `
    INSERT INTO public.crm_analytics (${insertColumns.map((column) => `"${column}"`).join(', ')})
    VALUES (${placeholders})
    ON CONFLICT ("call_id") DO UPDATE SET ${setClause}
  `;

  await client.query(query, values);
};

const resetSequence = async (client) => {
  await client.query(`
    SELECT setval(
      pg_get_serial_sequence('public.crm_analytics', 'id'),
      COALESCE((SELECT MAX(id) FROM public.crm_analytics), 1),
      true
    )
  `);
};

const main = async () => {
  const batchLimit = 10;
  const client = await targetPool.connect();

  try {
    let offset = 0;
    let total = 0;
    while (true) {
      const rows = await fetchCrmBatch(offset, batchLimit);
      if (rows.length === 0) break;

      await client.query('BEGIN');
      try {
        for (const row of rows) {
          row.retry_count = row.retry_count ?? 0;
          row.next_retry_at = row.next_retry_at ?? null;
          row.last_error = row.last_error ?? null;
          row.processing_started_at = row.processing_started_at ?? null;
          await upsertCrmRow(client, row);
        }
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }

      total += rows.length;
      offset += rows.length;
      console.log(`Migrated ${total} crm_analytics rows...`);
      if (rows.length < batchLimit) break;
    }

    await resetSequence(client);

    const { rows } = await client.query('SELECT count(*)::int AS count FROM public.crm_analytics');
    console.log(JSON.stringify({ crm_analytics: rows[0].count }, null, 2));
  } finally {
    client.release();
    await targetPool.end();
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
