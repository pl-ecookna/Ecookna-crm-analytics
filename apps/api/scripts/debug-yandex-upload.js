import { mainPool, getCrmCallByCallId } from '../src/db/mainDb.js';
import { downloadFromS3 } from '../src/clients/s3Client.js';
import {
  getYandexTalk,
  searchYandexTalks,
  uploadTalkToYandexSpeechSense,
} from '../src/clients/yandexSpeechSenseClient.js';
import { detectAudioParams } from '../src/utils/audioMetadata.js';
import { sleep } from '../src/utils/time.js';

const callId = String(process.argv[2] || '').trim();

if (!callId) {
  console.error('Usage: node scripts/debug-yandex-upload.js <call_id>');
  process.exit(1);
}

const toIsoString = (value) => {
  if (!value) return '';
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? String(value).trim() : parsed.toISOString();
};

const normalizeIsoLike = (value) => {
  const iso = toIsoString(value);
  return iso.replace('.000Z', 'Z');
};

const readAllTalkIds = async () => {
  const ids = [];
  let pageToken = '';

  while (true) {
    const response = await searchYandexTalks({
      pageSize: 100,
      pageToken,
    });

    const pageIds = response?.talkIds || response?.talk_ids || [];
    ids.push(...pageIds);

    pageToken = String(response?.nextPageToken || response?.next_page_token || '').trim();
    if (!pageToken) break;
  }

  return [...new Set(ids)];
};

const talkFieldsToMap = (talk) => Object.fromEntries(
  (talk?.talkFields || talk?.talk_fields || [])
    .map((field) => [field.name, field.value]),
);

const buildExpectedMetadata = (row) => ({
  operator_name: String(row.user_name || '').trim(),
  operator_id: String(row.user_id || row.call_id || '').trim(),
  client_name: String(row.client_phone || row.client_id || row.call_id || '').trim(),
  client_id: String(row.client_id || row.client_phone || '').trim(),
  date: toIsoString(row.call_datetime),
  language: 'ru-ru',
  direction_outgoing: /out/i.test(String(row.call_type || '')) ? 'true' : 'false',
});

const pickComparableFields = (fields) => ({
  operator_name: fields.operator_name || '',
  operator_id: fields.operator_id || '',
  client_name: fields.client_name || '',
  client_id: fields.client_id || '',
  date: fields.date || '',
  language: fields.language || '',
  direction_outgoing: fields.direction_outgoing || '',
});

const sameMetadata = (left, right) => (
  left.operator_name === right.operator_name
  && left.operator_id === right.operator_id
  && left.client_name === right.client_name
  && left.client_id === right.client_id
  && normalizeIsoLike(left.date) === normalizeIsoLike(right.date)
  && left.language === right.language
  && left.direction_outgoing === right.direction_outgoing
);

const getTalkSnapshot = async (talkId) => {
  const response = await getYandexTalk({ talkId, resultsMask: [] });
  const talk = Array.isArray(response?.talk) ? response.talk[0] : null;

  return {
    talkId,
    visible: Boolean(talk),
    talkState: talk?.talkState?.processingState
      || talk?.talkState?.processing_state
      || talk?.talk_state?.processingState
      || talk?.talk_state?.processing_state
      || null,
    fields: talk ? pickComparableFields(talkFieldsToMap(talk)) : null,
  };
};

const readProjectTalks = async () => {
  const ids = await readAllTalkIds();
  const talks = [];

  for (const talkId of ids) {
    talks.push(await getTalkSnapshot(talkId));
  }

  return talks;
};

try {
  const row = await getCrmCallByCallId(callId);
  if (!row) {
    throw new Error(`Call not found: ${callId}`);
  }

  const audio = await downloadFromS3(row.file_name);
  const audioParams = await detectAudioParams(audio);
  const expected = buildExpectedMetadata(row);

  const beforeTalks = await readProjectTalks();
  const beforeMatches = beforeTalks.filter((talk) => sameMetadata(talk.fields || {}, expected));

  const { talkId: uploadedTalkId } = await uploadTalkToYandexSpeechSense(audio, {
    callId: row.call_id,
    callDatetime: row.call_datetime,
    operatorName: row.user_name,
    operatorId: row.user_id,
    clientId: row.client_id,
    clientPhone: row.client_phone,
    callType: row.call_type,
  });

  const immediateGet = await getTalkSnapshot(uploadedTalkId);
  const afterUploadTalks = await readProjectTalks();
  const afterUploadMatches = afterUploadTalks.filter((talk) => sameMetadata(talk.fields || {}, expected));
  const newTalkIdsAfterUpload = afterUploadTalks
    .map((talk) => talk.talkId)
    .filter((talkId) => !beforeTalks.some((beforeTalk) => beforeTalk.talkId === talkId));

  await sleep(10000);

  const delayedGet = await getTalkSnapshot(uploadedTalkId);
  const afterDelayTalks = await readProjectTalks();
  const afterDelayMatches = afterDelayTalks.filter((talk) => sameMetadata(talk.fields || {}, expected));
  const newTalkIdsAfterDelay = afterDelayTalks
    .map((talk) => talk.talkId)
    .filter((talkId) => !beforeTalks.some((beforeTalk) => beforeTalk.talkId === talkId));

  console.log(JSON.stringify({
    callId,
    fileName: row.file_name,
    audioParams,
    expectedMetadata: expected,
    before: {
      totalTalks: beforeTalks.length,
      matchingTalks: beforeMatches,
    },
    upload: {
      uploadedTalkId,
    },
    immediate: {
      get: immediateGet,
      totalTalks: afterUploadTalks.length,
      matchingTalks: afterUploadMatches,
      newTalkIds: newTalkIdsAfterUpload,
    },
    after10s: {
      get: delayedGet,
      totalTalks: afterDelayTalks.length,
      matchingTalks: afterDelayMatches,
      newTalkIds: newTalkIdsAfterDelay,
    },
  }, null, 2));
} catch (error) {
  console.error(JSON.stringify({
    callId,
    message: error?.message || String(error),
    status: error?.status || null,
    details: error?.details || null,
  }, null, 2));
  process.exitCode = 1;
} finally {
  await mainPool.end();
}
