import { deepgramTranscribe } from '../clients/deepgramClient.js';
import { openAiJsonCompletion } from '../clients/openaiClient.js';
import {
  claimDisapproveCalls,
  completeDisapproveCall,
  failDisapproveCall,
} from '../db/disapproveDb.js';
import { env } from '../config/env.js';
import { getPromptText } from '../db/mainDb.js';

const getTranscript = (deepgram) => deepgram?.results?.channels?.[0]?.alternatives?.[0]?.paragraphs?.transcript
  || deepgram?.results?.channels?.[0]?.alternatives?.[0]?.transcript
  || '';

export const processDisapproveBatch = async () => {
  const rows = await claimDisapproveCalls(env.disapproveBatchLimit);
  const prompt = await getPromptText('disapproved_calls');

  for (const row of rows) {
    try {
      const deepgram = await deepgramTranscribe({ audioUrl: row.file_url });
      const transcript = getTranscript(deepgram);

      const llm = await openAiJsonCompletion({
        systemPrompt: prompt || 'Верни JSON вида {"reasons":["..."]}.',
        userPrompt: `Стенограмма разговора: ${transcript}\n\nПримечание оператора: ${row.user_notes || ''}`,
      });

      const reasons = Array.isArray(llm?.reasons) ? llm.reasons : [];
      const mapped = Object.fromEntries(reasons.map((r) => [String(r), true]));
      await completeDisapproveCall({ id: row.id, rejectReasons: mapped });
    } catch (error) {
      await failDisapproveCall({
        id: row.id,
        currentRetryCount: row.retry_count || 0,
        errorText: error?.message || String(error),
      });
    }
  }

  return rows.length;
};
