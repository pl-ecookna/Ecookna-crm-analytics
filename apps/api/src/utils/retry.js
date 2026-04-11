import { calcBackoffMs, sleep } from './time.js';

export const withRetry = async (task, {
  maxAttempts = 4,
  baseDelayMs = 500,
  maxDelayMs = 15000,
  jitterRatio = 0.2,
  shouldRetry = () => true,
} = {}) => {
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await task(attempt);
    } catch (error) {
      lastError = error;
      if (!shouldRetry(error, attempt)) break;
      if (attempt >= maxAttempts) break;

      const backoff = Math.min(calcBackoffMs({ baseMs: baseDelayMs, attempt }), maxDelayMs);
      const jitter = Math.round(backoff * jitterRatio * Math.random());
      await sleep(backoff + jitter);
    }
  }

  throw lastError;
};
