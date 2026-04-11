import crypto from 'node:crypto';
import { env } from '../config/env.js';
import { sleep } from '../utils/time.js';
import { detectAudioParams } from '../utils/audioMetadata.js';

const jsonRequest = async (url, options = {}) => {
  const res = await fetch(url, options);
  const text = await res.text();
  const data = text ? (() => {
    try { return JSON.parse(text); } catch { return { raw: text }; }
  })() : null;

  if (!res.ok) {
    const error = new Error(`Sber request failed: ${res.status}`);
    error.status = res.status;
    error.details = data;
    throw error;
  }

  return data;
};

export const getSberToken = async () => {
  const body = new URLSearchParams({ scope: env.sber.scope });

  const data = await jsonRequest(env.sber.oauthUrl, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${env.sber.authKey}`,
      RqUID: crypto.randomUUID(),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!data?.access_token) throw new Error('Sber access_token missing');
  return data.access_token;
};

export const sberTranscribe = async (audioBuffer) => {
  const token = await getSberToken();
  const detected = await detectAudioParams(audioBuffer);

  const upload = await jsonRequest(env.sber.uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/octet-stream',
    },
    body: audioBuffer,
  });

  const requestFileId = upload?.result?.request_file_id;
  if (!requestFileId) throw new Error('Sber request_file_id missing');

  const recognizePayload = {
    options: {
      model: env.sber.model,
      audio_encoding: 'MP3',
      language: 'ru-RU',
      speaker_separation_options: {
        enable: true,
        enable_only_main_speaker: false,
        count: 2,
      },
    },
    request_file_id: requestFileId,
  };
  const sampleRate = env.sber.sampleRate > 0 ? env.sber.sampleRate : detected.sampleRate;
  const channelsCount = env.sber.channelsCount > 0 ? env.sber.channelsCount : detected.channelsCount;
  if (sampleRate) recognizePayload.options.sample_rate = sampleRate;
  if (channelsCount) recognizePayload.options.channels_count = channelsCount;
  if (env.sber.insightModels.length > 0) {
    recognizePayload.options.insight_models = env.sber.insightModels;
  }

  const task = await jsonRequest(env.sber.recognizeUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(recognizePayload),
  });

  const taskId = task?.result?.id;
  if (!taskId) throw new Error('Sber task id missing');

  const startedAt = Date.now();
  let statusData = null;

  while (Date.now() - startedAt < env.sber.pollTimeoutMs) {
    statusData = await jsonRequest(`${env.sber.taskUrl}?id=${encodeURIComponent(taskId)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const status = statusData?.result?.status;
    if (status === 'DONE') break;
    if (status === 'ERROR' || status === 'CANCELED') throw new Error(`Sber task ${status}`);

    await sleep(env.sber.pollIntervalMs);
  }

  if (statusData?.result?.status !== 'DONE') throw new Error('Sber polling timeout');

  const responseFileId = statusData?.result?.response_file_id;
  if (!responseFileId) throw new Error('Sber response_file_id missing');

  return jsonRequest(`${env.sber.downloadUrl}?response_file_id=${encodeURIComponent(responseFileId)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
