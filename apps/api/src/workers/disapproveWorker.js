import { processDisapproveBatch } from '../services/disapproveAnalysisService.js';
import { log } from '../utils/logger.js';

let running = false;

export const runDisapproveWorker = async () => {
  if (running) {
    log.warn('Disapprove worker skipped: already running');
    return;
  }

  running = true;
  try {
    const count = await processDisapproveBatch();
    log.info('Disapprove worker completed', { processed: count });
  } catch (error) {
    log.error('Disapprove worker failed', { error: error?.message || String(error) });
  } finally {
    running = false;
  }
};
