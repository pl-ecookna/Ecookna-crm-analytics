export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const calcBackoffMs = ({ baseMs, attempt }) => {
  const safeAttempt = Math.max(1, attempt);
  return baseMs * Math.pow(2, safeAttempt - 1);
};
