import { env } from '../config/env.js';

const parseJsonFromText = (text) => {
  const cleaned = text.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
  return JSON.parse(cleaned);
};

export const openAiJsonCompletion = async ({ systemPrompt, userPrompt }) => {
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
    err.details = payload;
    throw err;
  }

  const text = payload?.choices?.[0]?.message?.content;
  if (!text) throw new Error('OpenAI empty response');

  return parseJsonFromText(text);
};
