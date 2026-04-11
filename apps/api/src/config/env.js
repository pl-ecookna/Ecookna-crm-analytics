import dotenv from 'dotenv';

dotenv.config({ path: process.env.ENV_FILE || '.env' });

const required = [
  'DB_MAIN_URL',
  'DB_DISAPPROVE_URL',
  'S3_ENDPOINT',
  'S3_BUCKET',
  'S3_ACCESS_KEY_ID',
  'S3_SECRET_ACCESS_KEY',
  'SBER_AUTH_KEY',
  'SBER_SCOPE',
  'DEEPGRAM_API_KEY',
  'OPENAI_API_KEY',
];

const missing = required.filter((k) => !process.env[k]);
if (missing.length > 0) {
  throw new Error(`Missing env vars: ${missing.join(', ')}`);
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

  deepgram: {
    apiKey: process.env.DEEPGRAM_API_KEY,
    url: process.env.DEEPGRAM_URL || 'https://api.deepgram.com/v1/listen',
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4o',
    url: process.env.OPENAI_URL || 'https://api.openai.com/v1/chat/completions',
  },
};
