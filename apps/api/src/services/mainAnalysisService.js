import { env } from '../config/env.js';
import { sberTranscribe } from '../clients/sberClient.js';
import { openAiJsonCompletion } from '../clients/openaiClient.js';
import { downloadFromS3 } from '../clients/s3Client.js';
import { claimCrmCalls, getPromptText, updateCrmById } from '../db/mainDb.js';
import { buildTranscriptFromSber, extractSberCallFeatures } from './transcriptBuilder.js';
import { calcBackoffMs } from '../utils/time.js';

const markCompleted = async ({ row, sberJson, transcript, llm }) => {
  const features = extractSberCallFeatures(sberJson);

  await updateCrmById(row.id, {
    transkription_full_json: sberJson,
    transkription: transcript,
    file_status: 'completed',
    analyzed_at: new Date().toISOString(),

    greeting_correct: llm.greeting_correct ?? null,
    operator_said_name: llm.operator_said_name ?? null,
    cause_identified: llm.cause_identified ?? null,
    cause_clarified: llm.cause_clarified ?? null,
    address_clarified: llm.address_clarified ?? null,
    active_listening_done: llm.active_listening_done ?? null,
    answer_complete: llm.answer_complete ?? null,
    operator_thanked: llm.operator_thanked ?? null,
    conflict_resolved: llm.conflict_resolved ?? null,
    client_helped: llm.client_helped ?? null,

    conflict_moments: llm.conflict_moments ?? null,
    conflict_risk_score: llm.conflict_risk_score ?? null,
    operator_tonality: llm.operator_tonality ?? null,
    final_conclusion: llm.final_conclusion ?? null,
    compliance_score: llm.compliance_score ?? null,
    call_success: llm.call_success ?? null,
    overall_score: llm.overall_score ?? null,
    burnout_level: llm.burnout_level ?? null,
    burnout_signs: llm.burnout_signs ?? null,

    conversation_stage_greeting: llm.conversation_stage_greeting ?? null,
    conversation_stage_request: llm.conversation_stage_request ?? null,
    conversation_stage_solution: llm.conversation_stage_solution ?? null,
    conversation_stage_closing: llm.conversation_stage_closing ?? null,
    conversation_duration_total: llm.conversation_duration_total ?? null,
    conversation_duration_minutes: llm.conversation_duration_minutes ?? null,

    csi_score: features.csi_score,
    dialog_agent_speech_percentage: features.dialog_agent_speech_percentage,
    dialog_customer_speech_percentage: features.dialog_customer_speech_percentage,
    dialog_silence_length_percentage: features.dialog_silence_length_percentage,
    agent_speech_speed_words_all_call_mean: features.agent_speech_speed_words_all_call_mean,
    customer_emo_score_mean: features.customer_emo_score_mean,
    customer_emo_score_weighted_by_speech_length_mean: features.customer_emo_score_weighted_by_speech_length_mean,
    customer_emotion_neg_speech_time_percentage: features.customer_emotion_neg_speech_time_percentage,
    customer_emotion_pos_speech_time_percentage: features.customer_emotion_pos_speech_time_percentage,
    customer_emotion_pos_utt_percentage: features.customer_emotion_pos_utt_percentage,

    retry_count: row.retry_count || 0,
    next_retry_at: null,
    last_error: null,
    processing_started_at: null,
  });
};

const markFailedOrRetry = async ({ row, errorText }) => {
  const nextRetry = (row.retry_count || 0) + 1;
  const shouldFail = nextRetry >= env.retryMaxAttempts;

  const payload = shouldFail
    ? {
      file_status: 'failed',
      retry_count: nextRetry,
      last_error: errorText.slice(0, 2000),
      next_retry_at: null,
      processing_started_at: null,
    }
    : {
      file_status: 'new',
      retry_count: nextRetry,
      last_error: errorText.slice(0, 2000),
      next_retry_at: new Date(Date.now() + calcBackoffMs({ baseMs: env.retryBackoffMs, attempt: nextRetry })).toISOString(),
      processing_started_at: null,
    };

  await updateCrmById(row.id, payload);
};

export const processMainBatch = async () => {
  const rows = await claimCrmCalls(env.mainBatchLimit);

  for (const row of rows) {
    try {
      const audio = await downloadFromS3(row.file_name);
      const sberJson = await sberTranscribe(audio);
      const transcript = buildTranscriptFromSber({ sberJson, operatorName: row.user_name });
      if (!transcript.trim()) {
        throw new Error('Sber returned empty transcript');
      }

      const systemPrompt = await getPromptText('salute_crm');
      const llm = await openAiJsonCompletion({
        systemPrompt: systemPrompt || 'Верни только JSON с оценкой звонка.',
        userPrompt: `Информация о звонке:\nОператор: ${row.user_name}\nОтдел: ${row.department}\nБренд: ${row.brand}\nТип: ${row.call_type}\n\nТранскрипция:\n${transcript}`,
      });

      await markCompleted({ row, sberJson, transcript, llm });
    } catch (error) {
      await markFailedOrRetry({ row, errorText: error?.message || String(error) });
    }
  }

  return rows.length;
};
