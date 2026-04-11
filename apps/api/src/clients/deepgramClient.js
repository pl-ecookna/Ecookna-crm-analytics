import { env } from '../config/env.js';

export const deepgramTranscribe = async ({ audioUrl }) => {
  const url = new URL(env.deepgram.url);
  url.searchParams.set('diarize', 'true');
  url.searchParams.set('language', 'ru');
  url.searchParams.set('punctuate', 'true');
  url.searchParams.set('smart_format', 'true');

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      Authorization: `Token ${env.deepgram.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url: audioUrl }),
  });

  const data = await res.json();
  if (!res.ok) {
    const err = new Error(`Deepgram failed: ${res.status}`);
    err.details = data;
    throw err;
  }

  return data;
};
