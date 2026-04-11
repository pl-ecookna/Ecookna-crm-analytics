import pg from 'pg';
import { env } from '../config/env.js';
import { calcBackoffMs } from '../utils/time.js';

const { Pool } = pg;

export const disapprovePool = new Pool({ connectionString: env.db.disapproveUrl });

export const upsertDisapproveCall = async (payload) => {
  const q = `
    INSERT INTO public.disaproov_calls (
      call_id, call_datetime, client_id, client_phone, user_id, user_name,
      department, brand, call_type, deal_source, product_type, region,
      user_notes, marketing_channel, created_at, file_status, file_url, file_name,
      retry_count, next_retry_at, last_error
    ) VALUES (
      $1,$2,$3,$4,$5,$6,
      $7,$8,$9,$10,$11,$12,
      $13,$14,NOW(),'new',$15,$16,
      0,NULL,NULL
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
      deal_source = EXCLUDED.deal_source,
      product_type = EXCLUDED.product_type,
      region = EXCLUDED.region,
      user_notes = EXCLUDED.user_notes,
      marketing_channel = EXCLUDED.marketing_channel,
      file_url = EXCLUDED.file_url,
      file_name = EXCLUDED.file_name,
      file_status = 'new',
      retry_count = 0,
      next_retry_at = NULL,
      last_error = NULL;
  `;

  await disapprovePool.query(q, [
    payload.call_id,
    payload.call_datetime,
    payload.client_id || null,
    payload.client_phone || null,
    payload.user_id || null,
    payload.user_name || '',
    payload.department || null,
    payload.brand || null,
    payload.call_type || null,
    payload.deal_source || null,
    payload.product_type || null,
    payload.region || null,
    payload.user_notes || null,
    payload.marketing_channel || null,
    payload.file_url,
    payload.file_name,
  ]);
};

export const claimDisapproveCalls = async (limit) => {
  const q = `
    WITH picked AS (
      SELECT id
      FROM public.disaproov_calls
      WHERE file_status = 'new'
        AND (next_retry_at IS NULL OR next_retry_at <= NOW())
      ORDER BY created_at ASC
      LIMIT $1
      FOR UPDATE SKIP LOCKED
    )
    UPDATE public.disaproov_calls d
    SET file_status = 'processing', processing_started_at = NOW()
    FROM picked
    WHERE d.id = picked.id
    RETURNING d.*;
  `;

  const { rows } = await disapprovePool.query(q, [limit]);
  return rows;
};

export const completeDisapproveCall = async ({ id, rejectReasons }) => {
  const q = `
    UPDATE public.disaproov_calls
    SET
      reject_reasons = $2::jsonb,
      file_status = 'completed',
      last_error = NULL,
      next_retry_at = NULL,
      processing_started_at = NULL
    WHERE id = $1;
  `;
  await disapprovePool.query(q, [id, JSON.stringify(rejectReasons)]);
};

export const failDisapproveCall = async ({ id, currentRetryCount, errorText }) => {
  const nextRetryCount = (currentRetryCount || 0) + 1;
  const shouldFail = nextRetryCount >= env.retryMaxAttempts;

  const q = shouldFail
    ? `UPDATE public.disaproov_calls SET file_status='failed', retry_count=$2, last_error=$3, next_retry_at=NULL, processing_started_at=NULL WHERE id=$1;`
    : `UPDATE public.disaproov_calls SET file_status='new', retry_count=$2, last_error=$3, next_retry_at=NOW() + ($4 || ' milliseconds')::interval, processing_started_at=NULL WHERE id=$1;`;

  const params = shouldFail
    ? [id, nextRetryCount, errorText.slice(0, 2000)]
    : [id, nextRetryCount, errorText.slice(0, 2000), calcBackoffMs({ baseMs: env.retryBackoffMs, attempt: nextRetryCount })];

  await disapprovePool.query(q, params);
};
