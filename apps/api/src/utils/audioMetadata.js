import { parseBuffer } from 'music-metadata';

const toPositiveInt = (value) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
};

export const detectAudioParams = async (audioBuffer) => {
  try {
    const metadata = await parseBuffer(audioBuffer, undefined, { duration: false });
    const sampleRate = toPositiveInt(metadata?.format?.sampleRate);
    const channelsCount = toPositiveInt(metadata?.format?.numberOfChannels);
    return { sampleRate, channelsCount };
  } catch {
    return { sampleRate: null, channelsCount: null };
  }
};
