import { processMainBatch } from '../services/mainAnalysisService.js';
import { log } from '../utils/logger.js';

let running = false;

export const runMainWorker = async () => {
  if (running) {
    log.warn('Main worker skipped: already running');
    return;
  }

  running = true;
  try {
    const count = await processMainBatch();
    log.info('Main worker completed', { processed: count });
  } catch (error) {
    log.error('Main worker failed', { error: error?.message || String(error) });
  } finally {
    running = false;
  }
};
