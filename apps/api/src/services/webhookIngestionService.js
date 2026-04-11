import { getPublicS3Url, uploadToS3 } from '../clients/s3Client.js';
import { upsertDisapproveCall } from '../db/disapproveDb.js';
import { upsertCrmCall } from '../db/mainDb.js';
import { env } from '../config/env.js';

const requireField = (source, key) => {
  const val = source[key];
  if (val === undefined || val === null || String(val).trim() === '') {
    throw new Error(`Missing required field: ${key}`);
  }
  return String(val);
};

export const ingestWebhookCall = async ({ file, fields }) => {
  if (!file?.buffer || file.size === 0) throw new Error('Missing binary field data');

  const callId = requireField(fields, 'call_id');
  const callDatetime = requireField(fields, 'call_datetime');
  const userName = requireField(fields, 'user_name');

  const durationSec = Number(fields.duration_seconds || 0);
  if (Number.isFinite(durationSec) && durationSec > 0 && durationSec < env.minDurationSeconds) {
    return { skipped: true, reason: `Call duration ${durationSec}s is below ${env.minDurationSeconds}s` };
  }

  const fileName = `${callId}.mp3`;
  await uploadToS3({ key: fileName, body: file.buffer, contentType: file.mimetype || 'audio/mpeg' });

  const payload = {
    call_id: callId,
    call_datetime: callDatetime,
    client_id: fields.client_id || null,
    client_phone: fields.client_phone || null,
    user_id: fields.user_id || null,
    user_name: userName,
    department: fields.department || null,
    brand: fields.brand || null,
    call_type: fields.call_type || null,
    deal_id: fields.deal_id || null,
    deal_type: fields.deal_type || null,
    deal_source: fields.deal_source || null,
    product_type: fields.product_type || null,
    region: fields.region || null,
    user_notes: fields.user_notes || null,
    marketing_channel: fields.marketing_channel || null,
    disapprove_reason: fields.disapprove_reason || null,
    lead_status: fields.lead_status || null,
    lead_ammount: fields.lead_ammount || null,
    tag: fields.tag || null,
    transcription: fields.transcription || null,
    file_name: fileName,
    file_url: getPublicS3Url(fileName),
    webhook_payload_json: fields || {},
    webhook_payload_text: JSON.stringify(fields || {}),
  };

  if (payload.deal_type === 'disapprove') {
    await upsertDisapproveCall(payload);
    return { flow: 'disapprove', callId, fileName };
  }

  await upsertCrmCall({
    call_id: payload.call_id,
    call_datetime: payload.call_datetime,
    client_id: payload.client_id,
    client_phone: payload.client_phone,
    user_id: payload.user_id,
    user_name: payload.user_name,
    department: payload.department,
    brand: payload.brand,
    call_type: payload.call_type,
    file_name: payload.file_name,
    file_url: payload.file_url,
    tag: payload.tag,
    marketing_channel: payload.marketing_channel,
    is_first_contact: payload.tag !== 'Лид',
    transcription_crm: payload.transcription,
    webhook_payload_json: payload.webhook_payload_json,
    webhook_payload_text: payload.webhook_payload_text,
  });

  return { flow: 'main', callId, fileName };
};
