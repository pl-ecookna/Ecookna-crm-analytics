import path from 'node:path';
import { fileURLToPath } from 'node:url';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import { env } from '../config/env.js';
import { sleep } from '../utils/time.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const protoPath = path.join(__dirname, 'protos', 'talk_service.proto');

const packageDefinition = protoLoader.loadSync(protoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const loaded = grpc.loadPackageDefinition(packageDefinition);
const TalkService = loaded?.yandex?.cloud?.speechsense?.v1?.TalkService;

if (!TalkService) {
  throw new Error('Failed to load Yandex SpeechSense proto');
}

const getTalkRestUrl = 'https://rest-api.speechsense.yandexcloud.net/speechsense/v1/talks/get';
const searchTalksRestUrl = 'https://rest-api.speechsense.yandexcloud.net/speechsense/v1/talks/search';
const debugPolling = String(process.env.YANDEX_DEBUG_POLLING || 'false').toLowerCase() === 'true';

const getAuthLabel = () => {
  if (env.yandex.apiKey) return `Api-Key ${env.yandex.apiKey}`;
  if (env.yandex.iamToken) return `Bearer ${env.yandex.iamToken}`;
  throw new Error('Yandex SpeechSense auth is not configured');
};

const createGrpcClient = () => new TalkService(
  'api.speechsense.yandexcloud.net:443',
  grpc.credentials.createSsl(),
);

const jsonRequest = async (url, options = {}) => {
  const body = options.body ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) : null;
  const response = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      ...options.headers,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body,
  });

  const text = await response.text();
  const data = text ? (() => {
    try {
      return JSON.parse(text);
    } catch {
      return { raw: text };
    }
  })() : null;

  if (!response.ok) {
    const error = new Error(`Yandex SpeechSense request failed: ${response.status}`);
    error.status = response.status;
    error.details = data;
    throw error;
  }

  return data;
};

const callGrpcUpload = (request) => new Promise((resolve, reject) => {
  const client = createGrpcClient();
  const metadata = new grpc.Metadata();
  metadata.set('authorization', getAuthLabel());
  client.Upload(request, metadata, { deadline: Date.now() + env.yandex.uploadTimeoutMs }, (error, response) => {
    client.close();
    if (error) return reject(error);
    resolve(response);
  });
});

const buildAudioRequest = (audioBuffer, detectedAudio) => {
  const containerType = String(env.yandex.audioContainer || 'mp3').toLowerCase();

  if (containerType === 'raw') {
    return {
      audio_metadata: {
        raw_audio: {
          audio_encoding: 1,
          sample_rate_hertz: detectedAudio?.sampleRate || 16000,
          audio_channel_count: detectedAudio?.channelsCount || 1,
        },
      },
      audio_data: { data: audioBuffer },
    };
  }

  const normalizedContainerType = containerType === 'wav'
    ? 1
    : containerType === 'ogg' || containerType === 'ogg_opus'
      ? 2
      : 3;

  return {
    audio_metadata: {
      container_audio: {
        container_audio_type: normalizedContainerType,
      },
    },
    audio_data: { data: audioBuffer },
  };
};

const getTalkState = (talk) => talk?.talk_state?.processing_state
  || talk?.talk_state?.processingState
  || talk?.talkState?.processing_state
  || talk?.talkState?.processingState
  || null;

const getAlgorithmProcessingState = (talk, algorithm) => {
  const infos = talk?.talk_state?.algorithm_processing_infos
    || talk?.talk_state?.algorithmProcessingInfos
    || talk?.talkState?.algorithm_processing_infos
    || talk?.talkState?.algorithmProcessingInfos
    || [];

  const matched = infos.find((item) => item?.algorithm === algorithm);
  return matched?.processing_state || matched?.processingState || null;
};

const toIsoString = (value) => {
  if (!value) return '';
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? '' : value.toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? String(value).trim() : parsed.toISOString();
};

const normalizeTalkResponse = (data) => {
  const talk = Array.isArray(data?.talk) ? data.talk[0] : null;
  if (!talk) return null;
  return talk;
};

const hasReadyTranscription = (talk) => {
  const phrases = talk?.transcription?.phrases;
  return Array.isArray(phrases) && phrases.length > 0;
};

const hasTalkData = (talk) => Boolean(talk && typeof talk === 'object');

const buildResultsMaskPaths = (resultsMask) => {
  if (Array.isArray(resultsMask)) {
    return resultsMask.map((path) => String(path || '').trim()).filter(Boolean);
  }

  if (typeof resultsMask === 'string') {
    return resultsMask
      .split(',')
      .map((path) => path.trim())
      .filter(Boolean);
  }

  return String(env.yandex.resultsMask || '')
    .split(',')
    .map((path) => path.trim())
    .filter(Boolean);
};

const buildTalkScope = () => ({
  organizationId: env.yandex.organizationId,
  spaceId: env.yandex.spaceId,
  connectionId: env.yandex.connectionId,
  projectId: env.yandex.projectId,
});

export const getYandexTalk = async ({ talkId, resultsMask } = {}) => jsonRequest(getTalkRestUrl, {
  method: 'POST',
  headers: {
    Authorization: getAuthLabel(),
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    ...buildTalkScope(),
    talkIds: [talkId],
    resultsMask: {
      paths: buildResultsMaskPaths(resultsMask),
    },
  }),
});

export const searchYandexTalks = async ({
  pageSize = 100,
  pageToken = '',
  queryText = '',
  filters = [],
} = {}) => jsonRequest(searchTalksRestUrl, {
  method: 'POST',
  headers: {
    Authorization: getAuthLabel(),
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    ...buildTalkScope(),
    pageSize,
    pageToken,
    ...(queryText ? { query: { text: queryText } } : {}),
    ...(Array.isArray(filters) && filters.length > 0 ? { filters } : {}),
  }),
});

const buildTalkMetadata = (context = {}) => {
  const callDate = toIsoString(context.callDatetime);
  const directionOutgoing = String(
    context.directionOutgoing ?? (
      /out/i.test(String(context.callType || '')) ? 'true' : 'false'
    ),
  ).toLowerCase();
  const fields = {
    operator_name: String(context.operatorName || '').trim(),
    operator_id: String(context.operatorId || context.callId || '').trim(),
    client_name: String(context.clientName || context.clientPhone || context.clientId || context.callId || '').trim(),
    client_id: String(context.clientId || context.clientPhone || '').trim(),
    date: callDate,
    language: 'ru-ru',
    direction_outgoing: directionOutgoing,
  };

  return {
    connection_id: env.yandex.connectionId,
    fields: Object.fromEntries(
      Object.entries(fields).filter(([, value]) => value !== ''),
    ),
  };
};

export const uploadTalkToYandexSpeechSense = async (audioBuffer, context = {}) => {
  const uploaded = await callGrpcUpload({
    talk_id: env.yandex.useCallIdAsTalkId ? String(context.callId || '').trim() : '',
    metadata: buildTalkMetadata(context),
    audio: buildAudioRequest(audioBuffer),
  });

  const talkId = String(uploaded?.talk_id || context.callId || '').trim();
  if (!talkId) {
    throw new Error('Yandex SpeechSense talk_id missing');
  }

  return { talkId, uploaded };
};

export const transcribeWithYandexSpeechSense = async (audioBuffer, context = {}) => {
  const { talkId } = await uploadTalkToYandexSpeechSense(audioBuffer, context);

  const startedAt = Date.now();
  let lastTalk = null;
  let pollCount = 0;

  while (Date.now() - startedAt < env.yandex.pollTimeoutMs) {
    pollCount += 1;
    let response;
    try {
      response = await getYandexTalk({ talkId });
    } catch (error) {
      if (error?.status === 404 || error?.status === 409) {
        await sleep(env.yandex.pollIntervalMs);
        continue;
      }
      throw error;
    }

    lastTalk = normalizeTalkResponse(response);
    if (debugPolling) {
      const phrasesCount = Array.isArray(lastTalk?.transcription?.phrases) ? lastTalk.transcription.phrases.length : 0;
      console.log(JSON.stringify({
        talkId,
        pollCount,
        elapsedMs: Date.now() - startedAt,
        talkState: getTalkState(lastTalk),
        speechkitState: getAlgorithmProcessingState(lastTalk, 'ALGORITHM_SPEECHKIT'),
        phrasesCount,
        hasTalkData: hasTalkData(lastTalk),
      }));
    }
    if (!hasTalkData(lastTalk)) {
      await sleep(env.yandex.pollIntervalMs);
      continue;
    }

    const state = getTalkState(lastTalk);
    const speechkitState = getAlgorithmProcessingState(lastTalk, 'ALGORITHM_SPEECHKIT');
    if (speechkitState === 'PROCESSING_STATE_SUCCESS' && hasReadyTranscription(lastTalk)) {
      return response;
    }
    if (speechkitState === 'PROCESSING_STATE_FAILED') {
      throw new Error('Yandex SpeechSense speech recognition failed');
    }
    if (state === 'PROCESSING_STATE_SUCCESS') {
      return response;
    }
    if (state === 'PROCESSING_STATE_FAILED') {
      throw new Error('Yandex SpeechSense processing failed');
    }

    await sleep(env.yandex.pollIntervalMs);
  }

  const timeoutState = getTalkState(lastTalk) || 'unknown';
  throw new Error(`Yandex SpeechSense polling timeout (${timeoutState})`);
};
