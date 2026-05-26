import { env } from '../config/env.js';
import { withRetry } from '../utils/retry.js';

const parseJsonFromText = (text) => {
  const cleaned = text.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
  return JSON.parse(cleaned);
};

export const openAiJsonCompletion = async ({ systemPrompt, userPrompt, returnRaw = false }) => {
  return withRetry(async () => {
    const res = await fetch(env.openai.url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.openai.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: env.openai.model,
        temperature: 0,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    const payload = await res.json();

    if (!res.ok) {
      const err = new Error(`OpenAI failed: ${res.status}`);
      err.status = res.status;
      err.details = payload;
      throw err;
    }

    const text = payload?.choices?.[0]?.message?.content;
    if (!text) throw new Error('OpenAI empty response');

    const parsed = parseJsonFromText(text);
    return returnRaw ? { parsed, raw: payload } : parsed;
  }, {
    maxAttempts: 4,
    baseDelayMs: 2000,
    maxDelayMs: 20000,
    shouldRetry: (error) => {
      const status = Number(error?.status || 0);
      return status === 429 || status >= 500 || /fetch failed/i.test(String(error?.message || ''));
    },
  });
};
