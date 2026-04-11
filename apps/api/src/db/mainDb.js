import pg from 'pg';
import { env } from '../config/env.js';
import { withRetry } from '../utils/retry.js';

const { Pool } = pg;

export const mainPool = new Pool({
  connectionString: env.db.mainUrl,
});

const TRANSIENT_HINTS = [
  'timeout',
  'timed out',
  'connection terminated',
  'connection refused',
  'connection reset',
  'econnreset',
  'econnrefused',
  'etimedout',
  'too many clients',
  'could not connect',
  'server closed the connection unexpectedly',
];

const TRANSIENT_SQLSTATE = new Set([
  '40001',
  '40P01',
  '55P03',
  '57P01',
  '57P02',
  '57P03',
  '53300',
]);

const hasTransientHint = (text) => TRANSIENT_HINTS.some((hint) => text.includes(hint));

const isTransientDbError = (error) => {
  const code = String(error?.code || '');
  if (TRANSIENT_SQLSTATE.has(code)) return true;

  const msg = `${error?.message || ''} ${error?.details || ''}`.toLowerCase();
  return hasTransientHint(msg);
};

const queryWithRetry = (runner) => withRetry(
  async () => runner(),
  {
    maxAttempts: env.retryMaxAttempts,
    baseDelayMs: env.retryBackoffMs,
    maxDelayMs: 15000,
    jitterRatio: 0.25,
    shouldRetry: (error) => isTransientDbError(error),
  },
);

const JSONB_COLUMNS = new Set([
  'transkription_full_json',
  'webhook_payload_json',
  'openai_full_json',
]);

const normalizeValue = (key, value) => {
  if (value === undefined) return null;
  if (value === null) return null;
  if (JSONB_COLUMNS.has(key) && typeof value === 'object') return JSON.stringify(value);
  return value;
};

const buildPatchQuery = (tableName, id, patch) => {
  const entries = Object.entries(patch).filter(([, value]) => value !== undefined);
  if (entries.length === 0) return null;

  const columns = entries.map(([key]) => key);
  const values = entries.map(([key, value]) => normalizeValue(key, value));
  const setClause = columns
    .map((column, idx) => (
      JSONB_COLUMNS.has(column)
        ? `"${column}" = $${idx + 2}::jsonb`
        : `"${column}" = $${idx + 2}`
    ))
    .join(', ');

  return {
    text: `UPDATE public.${tableName} SET ${setClause} WHERE id = $1`,
    values: [id, ...values],
  };
};

export const getPromptText = async (promptKey) => {
  const res = await queryWithRetry(() => mainPool.query(
    'SELECT prompt_text FROM public.prompts WHERE prompt_key = $1 LIMIT 1',
    [promptKey],
  ));

  return res.rows[0]?.prompt_text || '';
};

export const upsertCrmCall = async (payload) => {
  const q = `
    INSERT INTO public.crm_analytics (
      call_id, call_datetime, client_id, client_phone, user_id, user_name,
      department, brand, call_type, file_name, file_url, uploaded_at,
      file_status, tag, marketing_channel, is_first_contact, transcription_crm,
      webhook_payload_json, webhook_payload_text,
      retry_count, next_retry_at, last_error, processing_started_at
    ) VALUES (
      $1,$2,$3,$4,$5,$6,
      $7,$8,$9,$10,$11,NOW(),
      'new',$12,$13,$14,$15,$16::jsonb,$17,
      0,NULL,NULL,NULL
    )
    ON CONFLICT (call_id) DO UPDATE SET
      call_datetime = EXCLUDED.call_datetime,
      client_id = EXCLUDED.client_id,
      client_phone = EXCLUDED.client_phone,
      user_id = EXCLUDED.user_id,
      user_name = EXCLUDED.user_name,
      department = EXCLUDED.department,
      brand = EXCLUDED.brand,
      call_type = EXCLUDED.call_type,
      file_name = EXCLUDED.file_name,
      file_url = EXCLUDED.file_url,
      uploaded_at = EXCLUDED.uploaded_at,
      file_status = 'new',
      tag = EXCLUDED.tag,
      marketing_channel = EXCLUDED.marketing_channel,
      is_first_contact = EXCLUDED.is_first_contact,
      transcription_crm = EXCLUDED.transcription_crm,
      webhook_payload_json = EXCLUDED.webhook_payload_json,
      webhook_payload_text = EXCLUDED.webhook_payload_text,
      retry_count = 0,
      next_retry_at = NULL,
      last_error = NULL,
      processing_started_at = NULL;
  `;

  await queryWithRetry(() => mainPool.query(q, [
    payload.call_id,
    payload.call_datetime,
    payload.client_id || null,
    payload.client_phone || null,
    payload.user_id || null,
    payload.user_name || '',
    payload.department || null,
    payload.brand || null,
    payload.call_type || null,
    payload.file_name,
    payload.file_url,
    payload.tag || null,
    payload.marketing_channel || null,
    payload.is_first_contact ?? null,
    payload.transcription_crm || null,
    JSON.stringify(payload.webhook_payload_json || {}),
    payload.webhook_payload_text || null,
  ]));
};

export const claimCrmCalls = async (limit) => queryWithRetry(async () => {
  const client = await mainPool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `
      WITH picked AS (
        SELECT id
        FROM public.crm_analytics
        WHERE file_status = 'new'
          AND (next_retry_at IS NULL OR next_retry_at <= NOW())
        ORDER BY call_datetime ASC, id ASC
        LIMIT $1
        FOR UPDATE SKIP LOCKED
      )
      UPDATE public.crm_analytics c
      SET file_status = 'processing',
          processing_started_at = NOW()
      FROM picked
      WHERE c.id = picked.id
      RETURNING c.*;
      `,
      [limit],
    );
    await client.query('COMMIT');
    return rows;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});

export const updateCrmById = async (id, patch) => {
  const built = buildPatchQuery('crm_analytics', id, patch);
  if (!built) return;
  await queryWithRetry(() => mainPool.query(built.text, built.values));
};
