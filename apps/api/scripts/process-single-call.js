import { processSingleCallById } from '../src/services/mainAnalysisService.js';
import { mainPool } from '../src/db/mainDb.js';

const callId = String(process.argv[2] || '').trim();

if (!callId) {
  console.error('Usage: node scripts/process-single-call.js <call_id>');
  process.exit(1);
}

try {
  const result = await processSingleCallById(callId);
  console.log(JSON.stringify({
    callId,
    status: result.status,
    transcriptLength: result.transcript.length,
    provider: result.speechAnalysis?.provider || null,
  }, null, 2));
} catch (error) {
  console.error(JSON.stringify({
    callId,
    message: error?.message || String(error),
  }, null, 2));
  process.exitCode = 1;
} finally {
  await mainPool.end();
}
