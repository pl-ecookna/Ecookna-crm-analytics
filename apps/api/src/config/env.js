import dotenv from 'dotenv';

dotenv.config({ path: process.env.ENV_FILE || '.env' });

const mainDbUrl = process.env.DB_MAIN_URL || process.env.DB_URL;
if (mainDbUrl) {
  process.env.DB_MAIN_URL = mainDbUrl;
}
if (!process.env.DB_DISAPPROVE_URL) {
  process.env.DB_DISAPPROVE_URL = process.env.DB_MAIN_URL;
}

const speechProvider = (process.env.SPEECH_PROVIDER || 'sber').trim().toLowerCase();
if (!['sber', 'yandex'].includes(speechProvider)) {
  throw new Error(`Unsupported SPEECH_PROVIDER: ${speechProvider}`);
}

const toInt = (v, d) => Number.isFinite(Number(v)) ? Number(v) : d;
const toCsv = (v, fallback) => {
  const source = (v ?? fallback ?? '').toString();
  return source
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
};
const pickAllowed = (values, allowed) => values.filter((v) => allowed.includes(v));

const missing = [
  !process.env.DB_MAIN_URL ? 'DB_MAIN_URL' : null,
  !process.env.S3_ENDPOINT ? 'S3_ENDPOINT' : null,
  !process.env.S3_BUCKET ? 'S3_BUCKET' : null,
  !process.env.S3_ACCESS_KEY_ID ? 'S3_ACCESS_KEY_ID' : null,
  !process.env.S3_SECRET_ACCESS_KEY ? 'S3_SECRET_ACCESS_KEY' : null,
  !process.env.DEEPGRAM_API_KEY ? 'DEEPGRAM_API_KEY' : null,
  !process.env.OPENAI_API_KEY ? 'OPENAI_API_KEY' : null,
  speechProvider === 'sber' && !process.env.SBER_AUTH_KEY ? 'SBER_AUTH_KEY' : null,
  speechProvider === 'sber' && !process.env.SBER_SCOPE ? 'SBER_SCOPE' : null,
  speechProvider === 'yandex' && !process.env.YANDEX_ORGANIZATION_ID ? 'YANDEX_ORGANIZATION_ID' : null,
  speechProvider === 'yandex' && !process.env.YANDEX_SPEECHSENSE_SPACE_ID ? 'YANDEX_SPEECHSENSE_SPACE_ID' : null,
  speechProvider === 'yandex' && !process.env.YANDEX_SPEECHSENSE_CONNECTION_ID ? 'YANDEX_SPEECHSENSE_CONNECTION_ID' : null,
  speechProvider === 'yandex' && !process.env.YANDEX_SPEECHSENSE_PROJECT_ID ? 'YANDEX_SPEECHSENSE_PROJECT_ID' : null,
  speechProvider === 'yandex' && !process.env.YANDEX_SPEECHSENSE_API_KEY && !process.env.YANDEX_SPEECHSENSE_IAM_TOKEN
    ? 'YANDEX_SPEECHSENSE_API_KEY or YANDEX_SPEECHSENSE_IAM_TOKEN'
    : null,
].filter(Boolean);

if (missing.length > 0) {
  throw new Error(`Missing env vars: ${missing.join(', ')}`);
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: toInt(process.env.PORT, 3000),
  webhookPath: process.env.CRM_WEBHOOK_PATH || '/webhook/getcrmdata',
  cronEnabled: String(process.env.CRON_ENABLED || 'false').toLowerCase() === 'true',
  retryMaxAttempts: toInt(process.env.RETRY_MAX_ATTEMPTS, 3),
  retryBackoffMs: toInt(process.env.RETRY_BACKOFF_MS, 15000),
  cronMain: process.env.CRON_MAIN || '*/10 * * * *',
  cronDisapprove: process.env.CRON_DISAPPROVE || '45 * * * *',
  mainBatchLimit: toInt(process.env.MAIN_BATCH_LIMIT, 150),
  disapproveBatchLimit: toInt(process.env.DISAPPROVE_BATCH_LIMIT, 200),
  minDurationSeconds: toInt(process.env.MIN_CALL_DURATION_SECONDS, 60),
  speechProvider,

  db: {
    mainUrl: process.env.DB_MAIN_URL,
    disapproveUrl: process.env.DB_DISAPPROVE_URL,
  },

  s3: {
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION || 'ru1',
    bucket: process.env.S3_BUCKET,
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },

  sber: {
    authKey: process.env.SBER_AUTH_KEY,
    scope: process.env.SBER_SCOPE,
    model: process.env.SBER_MODEL || 'callcenter',
    insightModels: pickAllowed(
      toCsv(process.env.SBER_INSIGHT_MODELS, 'csi,call_features'),
      ['csi', 'call_features'],
    ),
    oauthUrl: process.env.SBER_OAUTH_URL || 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth',
    uploadUrl: process.env.SBER_UPLOAD_URL || 'https://smartspeech.sber.ru/rest/v1/data:upload',
    recognizeUrl: process.env.SBER_RECOGNIZE_URL || 'https://smartspeech.sber.ru/rest/v1/speech:async_recognize',
    taskUrl: process.env.SBER_TASK_URL || 'https://smartspeech.sber.ru/rest/v1/task:get',
    downloadUrl: process.env.SBER_DOWNLOAD_URL || 'https://smartspeech.sber.ru/rest/v1/data:download',
    sampleRate: toInt(process.env.SBER_SAMPLE_RATE, 0),
    channelsCount: toInt(process.env.SBER_CHANNELS_COUNT, 0),
    pollIntervalMs: toInt(process.env.SBER_POLL_INTERVAL_MS, 2500),
    pollTimeoutMs: toInt(process.env.SBER_POLL_TIMEOUT_MS, 180000),
  },

  yandex: {
    apiKey: process.env.YANDEX_SPEECHSENSE_API_KEY || '',
    iamToken: process.env.YANDEX_SPEECHSENSE_IAM_TOKEN || '',
    organizationId: process.env.YANDEX_ORGANIZATION_ID,
    spaceId: process.env.YANDEX_SPEECHSENSE_SPACE_ID,
    connectionId: process.env.YANDEX_SPEECHSENSE_CONNECTION_ID,
    projectId: process.env.YANDEX_SPEECHSENSE_PROJECT_ID,
    resultsMask: process.env.YANDEX_RESULTS_MASK
      || 'transcription,speechStatistics,silenceStatistics,interruptsStatistics,conversationStatistics,talkState',
    audioContainer: process.env.YANDEX_AUDIO_CONTAINER || 'mp3',
    operatorChannel: toInt(process.env.YANDEX_OPERATOR_CHANNEL, 0),
    customerChannel: toInt(process.env.YANDEX_CUSTOMER_CHANNEL, 1),
    uploadTimeoutMs: toInt(process.env.YANDEX_UPLOAD_TIMEOUT_MS, 60000),
    pollIntervalMs: toInt(process.env.YANDEX_POLL_INTERVAL_MS, 5000),
    pollTimeoutMs: toInt(process.env.YANDEX_POLL_TIMEOUT_MS, 900000),
    useCallIdAsTalkId: String(process.env.YANDEX_USE_CALL_ID_AS_TALK_ID || 'false').toLowerCase() === 'true',
  },

  deepgram: {
    apiKey: process.env.DEEPGRAM_API_KEY,
    url: process.env.DEEPGRAM_URL || 'https://api.deepgram.com/v1/listen',
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4o',
    url: process.env.OPENAI_URL || 'https://api.openai.com/v1/chat/completions',
    allowPartialOnQuotaFailure: String(process.env.OPENAI_ALLOW_PARTIAL_ON_QUOTA_FAILURE || 'false').toLowerCase() === 'true',
  },
};
