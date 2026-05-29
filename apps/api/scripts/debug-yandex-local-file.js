import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const apiRoot = path.resolve(__dirname, '..');
const defaultEnvFile = path.join(apiRoot, '.env');
const defaultAudioFile = path.join(apiRoot, 'test-audio', 'i5460570.mp3');

process.env.ENV_FILE = process.env.ENV_FILE || defaultEnvFile;
dotenv.config({ path: process.env.ENV_FILE });

process.env.SPEECH_PROVIDER = process.env.SPEECH_PROVIDER || 'yandex';

const dummyRequiredEnv = {
  DB_MAIN_URL: 'postgresql://debug:debug@localhost:5432/debug',
  S3_ENDPOINT: 'https://debug.local',
  S3_BUCKET: 'debug',
  S3_ACCESS_KEY_ID: 'debug',
  S3_SECRET_ACCESS_KEY: 'debug',
  DEEPGRAM_API_KEY: 'debug',
  OPENAI_API_KEY: 'debug',
};

for (const [key, value] of Object.entries(dummyRequiredEnv)) {
  process.env[key] = process.env[key] || value;
}

const usage = [
  'Usage:',
  '  node scripts/debug-yandex-local-file.js [audio-file]',
  '',
  'Optional env:',
  '  ENV_FILE=./.env',
  '  YANDEX_DEBUG_CALL_ID=<custom-talk-id>',
  '  YANDEX_DEBUG_DIRECTION_OUTGOING=false',
  '  YANDEX_DEBUG_SEARCH_TIMEOUT_MS=15000',
  '  YANDEX_DEBUG_POLL_TIMEOUT_MS=180000',
  '  YANDEX_DEBUG_POLL_INTERVAL_MS=5000',
].join('\n');

const fail = (message) => {
  console.error(message);
  console.error(usage);
  process.exit(1);
};

const nowStamp = () => new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);

const getState = (talk) => talk?.talkState?.processingState
  || talk?.talkState?.processing_state
  || talk?.talk_state?.processingState
  || talk?.talk_state?.processing_state
  || null;

const getAlgorithmState = (talk, algorithm) => {
  const infos = talk?.talkState?.algorithmProcessingInfos
    || talk?.talkState?.algorithm_processing_infos
    || talk?.talk_state?.algorithmProcessingInfos
    || talk?.talk_state?.algorithm_processing_infos
    || [];

  return infos.find((item) => item?.algorithm === algorithm)?.processingState
    || infos.find((item) => item?.algorithm === algorithm)?.processing_state
    || null;
};

const getPhrasesCount = (talk) => (
  Array.isArray(talk?.transcription?.phrases) ? talk.transcription.phrases.length : 0
);

const getTalk = (response) => (Array.isArray(response?.talk) ? response.talk[0] : null);

const sleep = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

const logStep = (message, data = {}) => {
  console.error(JSON.stringify({
    step: message,
    at: new Date().toISOString(),
    ...data,
  }));
};

const withTimeout = async (label, timeoutMs, fn) => {
  let timeoutId;
  try {
    return await Promise.race([
      fn(),
      new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          const error = new Error(`${label} timed out after ${timeoutMs}ms`);
          error.code = 'DEBUG_TIMEOUT';
          reject(error);
        }, timeoutMs);
      }),
    ]);
  } finally {
    clearTimeout(timeoutId);
  }
};

const safeCall = async (label, fn) => {
  try {
    return { ok: true, value: await fn() };
  } catch (error) {
    return {
      ok: false,
      error: {
        label,
        message: error?.message || String(error),
        status: error?.status || null,
        details: error?.details || null,
        code: error?.code || null,
      },
    };
  }
};

const readProjectTalksPage = async (searchYandexTalks) => {
  const response = await searchYandexTalks({ pageSize: 100 });
  return response?.talkIds || response?.talk_ids || [];
};

const main = async () => {
  const audioArg = String(process.argv.slice(2).find((arg) => arg !== '--') || defaultAudioFile).trim();
  if (!audioArg || audioArg === '-h' || audioArg === '--help') fail('');

  const audioPath = path.resolve(process.cwd(), audioArg);
  const stat = await fs.stat(audioPath).catch(() => null);
  if (!stat?.isFile()) {
    fail(`Audio file not found: ${audioPath}`);
  }

  const callId = String(process.env.YANDEX_DEBUG_CALL_ID || `speechsense-debug-${nowStamp()}`).trim();
  const directionOutgoing = String(process.env.YANDEX_DEBUG_DIRECTION_OUTGOING || 'false').toLowerCase() === 'true';
  const searchTimeoutMs = Number(process.env.YANDEX_DEBUG_SEARCH_TIMEOUT_MS || 15000);
  const pollTimeoutMs = Number(process.env.YANDEX_DEBUG_POLL_TIMEOUT_MS || process.env.YANDEX_POLL_TIMEOUT_MS || 180000);
  const pollIntervalMs = Number(process.env.YANDEX_DEBUG_POLL_INTERVAL_MS || process.env.YANDEX_POLL_INTERVAL_MS || 5000);

  logStep('load modules');
  const [
    { env },
    { detectAudioParams },
    {
      getYandexTalk,
      searchYandexTalks,
      uploadTalkToYandexSpeechSense,
    },
  ] = await Promise.all([
    import('../src/config/env.js'),
    import('../src/utils/audioMetadata.js'),
    import('../src/clients/yandexSpeechSenseClient.js'),
  ]);

  const audioBuffer = await fs.readFile(audioPath);
  const audioParams = await detectAudioParams(audioBuffer).catch((error) => ({
    detectionError: error?.message || String(error),
  }));

  logStep('search before upload');
  const beforeSearch = await safeCall('search before upload', () => (
    withTimeout('search before upload', searchTimeoutMs, () => readProjectTalksPage(searchYandexTalks))
  ));

  logStep('upload start', { callId, audioPath, bytes: stat.size });
  const uploadStartedAt = Date.now();
  const uploadResult = await uploadTalkToYandexSpeechSense(audioBuffer, {
    callId,
    callDatetime: new Date().toISOString(),
    operatorName: 'SpeechSense Debug',
    operatorId: 'speechsense-debug',
    clientId: callId,
    clientPhone: callId,
    directionOutgoing,
  });

  const uploadElapsedMs = Date.now() - uploadStartedAt;
  const talkId = uploadResult.talkId;
  logStep('upload complete', { talkId, elapsedMs: uploadElapsedMs });
  const pollEvents = [];
  let finalGet = null;
  let finalError = null;
  const pollStartedAt = Date.now();

  while (Date.now() - pollStartedAt < pollTimeoutMs) {
    const attempt = pollEvents.length + 1;
    logStep('poll get start', { talkId, attempt });
    const result = await safeCall(`get poll ${attempt}`, () => getYandexTalk({ talkId }));

    if (!result.ok) {
      pollEvents.push({
        attempt,
        elapsedMs: Date.now() - pollStartedAt,
        error: result.error,
      });
      logStep('poll get error', { attempt, error: result.error });

      if (![404, 409].includes(Number(result.error.status))) {
        finalError = result.error;
        break;
      }

      await sleep(pollIntervalMs);
      continue;
    }

    const talk = getTalk(result.value);
    const event = {
      attempt,
      elapsedMs: Date.now() - pollStartedAt,
      visible: Boolean(talk),
      talkState: getState(talk),
      speechkitState: getAlgorithmState(talk, 'ALGORITHM_SPEECHKIT'),
      phrasesCount: getPhrasesCount(talk),
    };
    pollEvents.push(event);
    logStep('poll get result', event);
    finalGet = result.value;

    if (event.speechkitState === 'PROCESSING_STATE_FAILED' || event.talkState === 'PROCESSING_STATE_FAILED') {
      finalError = {
        label: 'speechsense processing',
        message: 'SpeechSense returned failed processing state',
        status: null,
        details: event,
        code: null,
      };
      break;
    }

    if (event.phrasesCount > 0 || event.speechkitState === 'PROCESSING_STATE_SUCCESS' || event.talkState === 'PROCESSING_STATE_SUCCESS') {
      break;
    }

    await sleep(pollIntervalMs);
  }

  logStep('search after upload');
  const afterSearch = await safeCall('search after upload', () => (
    withTimeout('search after upload', searchTimeoutMs, () => readProjectTalksPage(searchYandexTalks))
  ));
  const beforeIds = beforeSearch.ok ? beforeSearch.value : [];
  const afterIds = afterSearch.ok ? afterSearch.value : [];
  const finalTalk = getTalk(finalGet);
  const finalTalkState = getState(finalTalk);
  const finalSpeechkitState = getAlgorithmState(finalTalk, 'ALGORITHM_SPEECHKIT');
  const finalPhrasesCount = getPhrasesCount(finalTalk);
  const hasSuccessfulTalk = Boolean(finalTalk) && (
    finalPhrasesCount > 0
    || finalSpeechkitState === 'PROCESSING_STATE_SUCCESS'
    || finalTalkState === 'PROCESSING_STATE_SUCCESS'
  );

  const summary = {
    ok: hasSuccessfulTalk && !finalError,
    envFile: process.env.ENV_FILE,
    authMode: env.yandex.apiKey ? 'apiKey' : env.yandex.iamToken ? 'iamToken' : 'missing',
    scope: {
      organizationId: env.yandex.organizationId,
      spaceId: env.yandex.spaceId,
      connectionId: env.yandex.connectionId,
      projectId: env.yandex.projectId,
    },
    audio: {
      path: audioPath,
      bytes: stat.size,
      params: audioParams,
      container: env.yandex.audioContainer,
    },
    upload: {
      requestedCallId: callId,
      returnedTalkId: talkId,
      elapsedMs: uploadElapsedMs,
      raw: uploadResult.uploaded,
    },
    projectSearch: {
      before: beforeSearch.ok ? { ok: true, total: beforeIds.length } : beforeSearch,
      after: afterSearch.ok ? { ok: true, total: afterIds.length } : afterSearch,
      newTalkIds: afterIds.filter((id) => !beforeIds.includes(id)),
      returnedTalkIdVisibleInSearch: afterIds.includes(talkId),
    },
    polling: {
      timeoutMs: pollTimeoutMs,
      intervalMs: pollIntervalMs,
      events: pollEvents,
      finalVisible: Boolean(finalTalk),
      finalTalkState,
      finalSpeechkitState,
      finalPhrasesCount,
      finalError,
    },
    finalResponse: finalGet,
  };

  console.log(JSON.stringify(summary, null, 2));
  if (!summary.ok) process.exitCode = 1;
};

main().catch((error) => {
  console.error(JSON.stringify({
    message: error?.message || String(error),
    status: error?.status || null,
    details: error?.details || null,
    code: error?.code || null,
    stack: error?.stack || null,
  }, null, 2));
  process.exitCode = 1;
});
