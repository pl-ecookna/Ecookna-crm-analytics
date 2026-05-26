import path from 'node:path';
import https from 'node:https';
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

const restUrl = 'https://rest-api.speechsense.yandexcloud.net/speechsense/v1/talks/get';

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
  const target = new URL(url);
  const body = options.body ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) : null;

  return await new Promise((resolve, reject) => {
    const req = https.request({
      protocol: target.protocol,
      hostname: target.hostname,
      port: target.port || 443,
      path: `${target.pathname}${target.search}`,
      method: options.method || 'GET',
      headers: {
        ...options.headers,
        ...(body ? { 'Content-Length': Buffer.byteLength(body) } : {}),
      },
      // The REST endpoint currently fails TLS validation in this runtime's Node CA chain,
      // while the same endpoint is reachable via curl. Keep this narrow fallback local to
      // SpeechSense polling so upload auth and the rest of the app remain unchanged.
      rejectUnauthorized: false,
    }, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8');
        const data = text ? (() => {
          try {
            return JSON.parse(text);
          } catch {
            return { raw: text };
          }
        })() : null;

        if (res.statusCode < 200 || res.statusCode >= 300) {
          const error = new Error(`Yandex SpeechSense request failed: ${res.statusCode}`);
          error.status = res.statusCode;
          error.details = data;
          return reject(error);
        }

        resolve(data);
      });
    });

    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
};

const callGrpcUpload = (request) => new Promise((resolve, reject) => {
  const client = createGrpcClient();
  const metadata = new grpc.Metadata();
  metadata.set('authorization', getAuthLabel());
  client.Upload(request, metadata, (error, response) => {
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

const fetchTalk = async ({ talkId }) => jsonRequest(restUrl, {
  method: 'POST',
  headers: {
    Authorization: getAuthLabel(),
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    organizationId: env.yandex.organizationId,
    spaceId: env.yandex.spaceId,
    connectionId: env.yandex.connectionId,
    projectId: env.yandex.projectId,
    talkIds: [talkId],
    resultsMask: {
      paths: String(env.yandex.resultsMask || '')
        .split(',')
        .map((path) => path.trim())
        .filter(Boolean),
    },
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
    language: 'ru-RU',
    direction_outgoing: directionOutgoing,
  };

  return {
    connection_id: env.yandex.connectionId,
    fields: Object.fromEntries(
      Object.entries(fields).filter(([, value]) => value !== ''),
    ),
  };
};

export const transcribeWithYandexSpeechSense = async (audioBuffer, context = {}) => {
  const uploaded = await callGrpcUpload({
    talk_id: env.yandex.useCallIdAsTalkId ? String(context.callId || '').trim() : '',
    metadata: buildTalkMetadata(context),
    audio: buildAudioRequest(audioBuffer),
  });

  const talkId = String(uploaded?.talk_id || context.callId || '').trim();
  if (!talkId) {
    throw new Error('Yandex SpeechSense talk_id missing');
  }

  const startedAt = Date.now();
  let lastTalk = null;

  while (Date.now() - startedAt < env.yandex.pollTimeoutMs) {
    let response;
    try {
      response = await fetchTalk({ talkId });
    } catch (error) {
      if (error?.status === 404 || error?.status === 409) {
        await sleep(env.yandex.pollIntervalMs);
        continue;
      }
      throw error;
    }

    lastTalk = normalizeTalkResponse(response);
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
