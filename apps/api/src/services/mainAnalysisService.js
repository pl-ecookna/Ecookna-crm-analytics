import { env } from '../config/env.js';
import { transcribeSpeechAudio } from '../clients/speechClient.js';
import { openAiJsonCompletion } from '../clients/openaiClient.js';
import { downloadFromS3 } from '../clients/s3Client.js';
import {
  claimCrmCalls,
  getCrmCallByCallId,
  getCrmCallById,
  getPromptText,
  updateCrmById,
} from '../db/mainDb.js';
import { buildTranscriptFromSpeechAnalysis, normalizeSpeechAnalysisResult } from './transcriptBuilder.js';
import { calcBackoffMs } from '../utils/time.js';

export const markCompleted = async ({ row, speechAnalysis, transcript, llm, openAiRaw }) => {
  const features = speechAnalysis?.insight_result?.call_features || {};

  await updateCrmById(row.id, {
    openai_full_json: openAiRaw || null,
    transkription_full_json: speechAnalysis,
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
    stages_score: llm.stages_score ?? null,
    quality_score: llm.quality_score ?? null,
    transfer_required: llm.transfer_required ?? null,
    transfer_done: llm.transfer_done ?? null,
    transfer_quality: llm.transfer_quality ?? null,
    transfer_comment: llm.transfer_comment ?? null,

    csi_score: null,
    dialog_agent_speech_percentage: features.dialog_agent_speech_percentage ?? null,
    dialog_customer_speech_percentage: features.dialog_customer_speech_percentage ?? null,
    dialog_silence_length_percentage: features.dialog_silence_length_percentage ?? null,
    agent_speech_speed_words_all_call_mean: features.agent_speech_speed_words_all_call_mean ?? null,
    customer_emo_score_mean: null,
    customer_emo_score_weighted_by_speech_length_mean: null,
    customer_emotion_neg_speech_time_percentage: null,
    customer_emotion_pos_speech_time_percentage: null,
    customer_emotion_pos_utt_percentage: null,
    operator_emotion_positive: null,
    operator_emotion_neutral: null,
    operator_emotion_negative: null,
    client_emotion_positive: null,
    client_emotion_neutral: null,
    client_emotion_negative: null,
    emotion_stress_index: null,

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

const isOpenAiQuotaFailure = (error) => {
  const status = Number(error?.status || 0);
  const code = String(error?.details?.error?.code || '');
  return status === 429 && code === 'insufficient_quota';
};

const getStoredSpeechAnalysis = (row) => {
  const stored = row?.transkription_full_json;
  return stored && typeof stored === 'object' ? stored : null;
};

const getStoredSpeechRawResult = (speechAnalysis) => (
  speechAnalysis?.provider_result
  || speechAnalysis?.rawResult
  || speechAnalysis
);

const getTranscriptFromStoredRow = (row) => {
  if (typeof row?.transkription === 'string' && row.transkription.trim()) {
    return row.transkription.trim();
  }

  const speechAnalysis = getStoredSpeechAnalysis(row);
  if (!speechAnalysis) return '';

  return buildTranscriptFromSpeechAnalysis({
    provider: speechAnalysis.provider || env.speechProvider,
    rawResult: getStoredSpeechRawResult(speechAnalysis),
    operatorName: row.user_name,
    operatorChannel: env.yandex.operatorChannel,
    customerChannel: env.yandex.customerChannel,
  });
};

const runOpenAiAnalysis = async ({
  row,
  transcript,
  allowPartialOnQuotaFailure = env.openai.allowPartialOnQuotaFailure,
  getPrompt = getPromptText,
  completeJson = openAiJsonCompletion,
}) => {
  const systemPrompt = await getPrompt('salute_crm');

  try {
    const llmRes = await completeJson({
      systemPrompt: systemPrompt || 'Верни только JSON с оценкой звонка.',
      userPrompt: `Информация о звонке:\nОператор: ${row.user_name}\nОтдел: ${row.department}\nБренд: ${row.brand}\nТип: ${row.call_type}\n\nТранскрипция:\n${transcript}`,
      returnRaw: true,
    });

    return { llmParsed: llmRes.parsed, openAiRaw: llmRes.raw };
  } catch (error) {
    if (!(allowPartialOnQuotaFailure && isOpenAiQuotaFailure(error))) {
      throw error;
    }

    return {
      llmParsed: {},
      openAiRaw: {
        error: {
          status: error.status || null,
          message: error.message || 'OpenAI quota failure',
          details: error.details || null,
        },
      },
    };
  }
};

const finalizeCompletedCall = async ({
  row,
  speechAnalysis,
  transcript,
  llmParsed,
  openAiRaw,
  saveResult = markCompleted,
}) => {
  await saveResult({ row, speechAnalysis, transcript, llm: llmParsed, openAiRaw });
  return { status: 'completed', transcript, speechAnalysis };
};

export const processMainRow = async (row) => {
  try {
    const audio = await downloadFromS3(row.file_name);
    const speechResult = await transcribeSpeechAudio(audio, {
      callId: row.call_id,
      callDatetime: row.call_datetime,
      operatorName: row.user_name,
      operatorId: row.user_id,
      clientId: row.client_id,
      clientPhone: row.client_phone,
      department: row.department,
      brand: row.brand,
      callType: row.call_type,
    });
    const transcript = buildTranscriptFromSpeechAnalysis({
      provider: speechResult.provider,
      rawResult: speechResult.rawResult,
      operatorName: row.user_name,
      operatorChannel: env.yandex.operatorChannel,
      customerChannel: env.yandex.customerChannel,
    });
    if (!transcript.trim()) {
      throw new Error(`${speechResult.provider} returned empty transcript`);
    }

    const speechAnalysis = normalizeSpeechAnalysisResult({
      provider: speechResult.provider,
      rawResult: speechResult.rawResult,
      operatorName: row.user_name,
      operatorChannel: env.yandex.operatorChannel,
      customerChannel: env.yandex.customerChannel,
    });

    const { llmParsed, openAiRaw } = await runOpenAiAnalysis({
      row,
      transcript,
      allowPartialOnQuotaFailure: env.openai.allowPartialOnQuotaFailure,
    });

    await finalizeCompletedCall({ row, speechAnalysis, transcript, llmParsed, openAiRaw });
    return { status: 'completed', transcript, speechAnalysis };
  } catch (error) {
    await markFailedOrRetry({ row, errorText: error?.message || String(error) });
    throw error;
  }
};

export const reprocessLlmForRow = async (row, deps = {}) => {
  const speechAnalysis = getStoredSpeechAnalysis(row);
  if (!speechAnalysis) {
    throw new Error(`Speech analysis is missing for call ${row?.call_id || row?.id || 'unknown'}`);
  }

  const transcript = getTranscriptFromStoredRow(row);
  if (!transcript.trim()) {
    throw new Error(`Transcript is missing for call ${row?.call_id || row?.id || 'unknown'}`);
  }

  const { llmParsed, openAiRaw } = await runOpenAiAnalysis({
    row,
    transcript,
    allowPartialOnQuotaFailure: false,
    getPrompt: deps.getPrompt || getPromptText,
    completeJson: deps.completeJson || openAiJsonCompletion,
  });

  return finalizeCompletedCall({
    row,
    speechAnalysis,
    transcript,
    llmParsed,
    openAiRaw,
    saveResult: deps.saveResult || markCompleted,
  });
};

export const reprocessLlmOnlyById = async (id, deps = {}) => {
  const row = await getCrmCallById(id);
  if (!row) {
    throw new Error(`Call not found: ${id}`);
  }

  await reprocessLlmForRow(row, deps);

  return getCrmCallById(id);
};

export const reprocessCallById = async (id, deps = {}) => {
  const getCallById = deps.getCallById || getCrmCallById;
  const runLlm = deps.reprocessLlmForRow || reprocessLlmForRow;
  const runFull = deps.processSingleCallById || processSingleCallById;

  const row = await getCallById(id);
  if (!row) {
    throw new Error(`Call not found: ${id}`);
  }

  const hasSpeechAnalysis = Boolean(row.transkription_full_json && typeof row.transkription_full_json === 'object');

  if (hasSpeechAnalysis) {
    await runLlm(row, deps);
    return getCallById(id);
  }

  if (!row.call_id) {
    throw new Error(`Call id is missing for row ${row.id}`);
  }

  await runFull(row.call_id, deps);
  return getCallById(id);
};

export const processSingleCallById = async (callId) => {
  const row = await getCrmCallByCallId(callId);
  if (!row) {
    throw new Error(`Call not found: ${callId}`);
  }

  await updateCrmById(row.id, {
    file_status: 'processing',
    processing_started_at: new Date().toISOString(),
    last_error: null,
  });

  return processMainRow({ ...row, retry_count: row.retry_count || 0 });
};

export const processMainBatch = async () => {
  const rows = await claimCrmCalls(env.mainBatchLimit);

  for (const row of rows) {
    try {
      await processMainRow(row);
    } catch {
      // Row-specific failure is already persisted inside processMainRow.
    }
  }

  return rows.length;
};
