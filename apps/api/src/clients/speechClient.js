import { env } from '../config/env.js';
import { sberTranscribe } from './sberClient.js';
import { transcribeWithYandexSpeechSense } from './yandexSpeechSenseClient.js';

export const transcribeSpeechAudio = async (audioBuffer, context = {}) => {
  if (env.speechProvider === 'yandex') {
    const rawResult = await transcribeWithYandexSpeechSense(audioBuffer, context);
    return { provider: 'yandex', rawResult };
  }

  const rawResult = await sberTranscribe(audioBuffer);
  return { provider: 'sber', rawResult };
};
