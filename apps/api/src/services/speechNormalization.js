const toNumber = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toSecondsFromDuration = (value) => {
  if (value === null || value === undefined || value === '') return null;

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return null;

    if (normalized.endsWith('ms')) {
      const parsed = Number(normalized.slice(0, -2));
      return Number.isFinite(parsed) ? parsed / 1000 : null;
    }

    if (normalized.endsWith('s')) {
      const parsed = Number(normalized.slice(0, -1));
      return Number.isFinite(parsed) ? parsed : null;
    }
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const pick = (object, ...keys) => {
  for (const key of keys) {
    if (object?.[key] !== undefined) return object[key];
  }
  return undefined;
};

const toSeconds = (value) => {
  const parsed = toNumber(value);
  return parsed === null ? null : parsed;
};

const toMillis = (value) => {
  const parsed = toNumber(value);
  return parsed === null ? null : parsed;
};

const formatTs = (seconds) => {
  const totalSeconds = Math.max(0, Math.floor(seconds || 0));
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const getTextFromPhrase = (phrase) => {
  const normalizedText = pick(phrase?.phrase, 'normalizedText', 'normalized_text');
  const text = pick(phrase?.phrase, 'text');
  return String(normalizedText || text || '').trim();
};

const getWordsCountFromPhrase = (phrase) => {
  const words = Array.isArray(phrase?.phrase?.words) ? phrase.phrase.words : [];
  return words.length;
};

const getDurationMsFromPhrase = (phrase) => {
  const start = toMillis(pick(phrase, 'startTimeMs', 'start_time_ms'));
  const end = toMillis(pick(phrase, 'endTimeMs', 'end_time_ms'));
  if (start === null || end === null) return 0;
  return Math.max(0, end - start);
};

const normalizeChannel = (value) => {
  const parsed = toNumber(value);
  return parsed === null ? 0 : parsed;
};

const buildTranscriptLines = ({ segments, operatorName, customerName, operatorChannel, customerChannel }) => {
  const operatorLabel = operatorName || 'Оператор';
  const customerLabel = customerName || 'Клиент';

  return segments.map((segment) => {
    const speaker = segment.channel === operatorChannel
      ? operatorLabel
      : segment.channel === customerChannel
        ? customerLabel
        : `Канал ${segment.channel}`;

    return `[${formatTs(segment.start)}] ${speaker}:\n${segment.text}`;
  });
};

export const buildTranscriptFromSber = ({ sberJson, operatorName }) => {
  const rows = Array.isArray(sberJson)
    ? sberJson
    : (Array.isArray(sberJson?.result) ? sberJson.result : []);

  const segments = rows
    .filter((item) => item?.eou === true && item?.results?.[0]?.normalized_text)
    .map((item) => ({
      channel: normalizeChannel(item.channel ?? 0),
      start: toSecondsFromDuration(item.results[0].start) ?? 0,
      text: String(item.results[0].normalized_text || '').trim(),
    }))
    .sort((a, b) => a.start - b.start);

  return buildTranscriptLines({
    segments,
    operatorName,
    customerName: 'Клиент',
    operatorChannel: 0,
    customerChannel: 1,
  }).join('\n\n');
};

export const buildTranscriptFromYandexTalk = ({
  talk,
  operatorName,
  customerName = 'Клиент',
  operatorChannel = 0,
  customerChannel = 1,
}) => {
  const phrases = Array.isArray(talk?.transcription?.phrases) ? talk.transcription.phrases : [];

  const segments = phrases
    .map((phrase) => ({
      channel: normalizeChannel(pick(phrase, 'channelNumber', 'channel_number')),
      start: (toMillis(pick(phrase, 'startTimeMs', 'start_time_ms')) ?? 0) / 1000,
      text: getTextFromPhrase(phrase),
    }))
    .filter((segment) => segment.text.length > 0)
    .sort((a, b) => a.start - b.start);

  return buildTranscriptLines({
    segments,
    operatorName,
    customerName,
    operatorChannel,
    customerChannel,
  }).join('\n\n');
};

const getConversationDurationMs = (talk, phrases) => {
  const conversationStatistics = pick(talk, 'conversationStatistics', 'conversation_statistics');
  const boundaries = pick(conversationStatistics, 'conversationBoundaries', 'conversation_boundaries');
  const fromBoundaries = toMillis(pick(boundaries, 'durationSeconds', 'duration_seconds'));
  if (fromBoundaries !== null && fromBoundaries > 0) {
    return fromBoundaries * 1000;
  }

  const starts = phrases.map((phrase) => toMillis(pick(phrase, 'startTimeMs', 'start_time_ms'))).filter((value) => value !== null);
  const ends = phrases.map((phrase) => toMillis(pick(phrase, 'endTimeMs', 'end_time_ms'))).filter((value) => value !== null);
  if (starts.length === 0 || ends.length === 0) return null;

  const minStart = Math.min(...starts);
  const maxEnd = Math.max(...ends);
  return Math.max(0, maxEnd - minStart);
};

const accumulateChannelStats = ({ phrases, operatorChannel, customerChannel }) => {
  const stats = new Map([
    [operatorChannel, { speechMs: 0, words: 0, utterances: 0, utteranceDurations: [], interruptsMs: 0, interruptedMs: 0 }],
    [customerChannel, { speechMs: 0, words: 0, utterances: 0, utteranceDurations: [], interruptsMs: 0, interruptedMs: 0 }],
  ]);

  const sorted = [...phrases].sort(
    (a, b) => (toMillis(pick(a, 'startTimeMs', 'start_time_ms')) ?? 0) - (toMillis(pick(b, 'startTimeMs', 'start_time_ms')) ?? 0),
  );
  const lastEndByChannel = new Map();

  let totalInterruptions = 0;

  for (const phrase of sorted) {
    const channel = normalizeChannel(pick(phrase, 'channelNumber', 'channel_number'));
    const startMs = toMillis(pick(phrase, 'startTimeMs', 'start_time_ms')) ?? 0;
    const endMs = toMillis(pick(phrase, 'endTimeMs', 'end_time_ms')) ?? startMs;
    const durationMs = Math.max(0, endMs - startMs);
    const wordsCount = getWordsCountFromPhrase(phrase);
    const current = stats.get(channel) || { speechMs: 0, words: 0, utterances: 0, utteranceDurations: [], interruptsMs: 0, interruptedMs: 0 };

    current.speechMs += durationMs;
    current.words += wordsCount;
    current.utterances += 1;
    current.utteranceDurations.push(durationMs);

    for (const [otherChannel, lastEnd] of lastEndByChannel.entries()) {
      if (otherChannel === channel) continue;
      if (lastEnd > startMs) {
        const overlapMs = Math.min(lastEnd, endMs) - startMs;
        if (overlapMs > 0) {
          totalInterruptions += 1;
          current.interruptsMs += overlapMs;
          const interrupted = stats.get(otherChannel) || { speechMs: 0, words: 0, utterances: 0, utteranceDurations: [], interruptsMs: 0, interruptedMs: 0 };
          interrupted.interruptedMs += overlapMs;
          stats.set(otherChannel, interrupted);
        }
      }
    }

    lastEndByChannel.set(channel, Math.max(lastEndByChannel.get(channel) || 0, endMs));
    stats.set(channel, current);
  }

  return { stats, totalInterruptions };
};

const buildSpeechMetricsFromChannelStats = ({ stats, channel, conversationDurationMs }) => {
  const current = stats.get(channel) || { speechMs: 0, words: 0, utterances: 0, utteranceDurations: [], interruptsMs: 0, interruptedMs: 0 };
  const utteranceDurationMean = current.utterances > 0
    ? current.speechMs / current.utterances / 1000
    : null;
  const speechSeconds = current.speechMs / 1000;

  return {
    speechMs: current.speechMs,
    words: current.words,
    utterances: current.utterances,
    utteranceDurationMean,
    speechRatio: conversationDurationMs && conversationDurationMs > 0
      ? current.speechMs / conversationDurationMs
      : null,
    wordsPerSecondMean: speechSeconds > 0 ? current.words / speechSeconds : null,
    interruptsMs: current.interruptsMs,
    interruptedMs: current.interruptedMs,
  };
};

export const extractSberCallFeatures = (sberJson) => {
  const features = sberJson?.insight_result?.call_features || {};

  return {
    dialog_agent_speech_percentage: features.dialog_agent_speech_percentage ?? null,
    dialog_customer_speech_percentage: features.dialog_customer_speech_percentage ?? null,
    dialog_silence_length_percentage: features.dialog_silence_length_percentage ?? null,
    agent_speech_length_sum: features.agent_speech_length_sum ?? null,
    agent_n_words_sum: features.agent_n_words_sum ?? null,
    agent_speech_speed_words_all_call_mean: features.agent_speech_speed_words_all_call_mean ?? null,
    agent_utt_count: features.agent_utt_count ?? null,
    agent_utt_length_mean: features.agent_utt_length_mean ?? null,
    dialog_interruptions_in_agent_speech_percentage: features.dialog_interruptions_in_agent_speech_percentage ?? null,
    customer_speech_length_sum: features.customer_speech_length_sum ?? null,
    customer_n_words_sum: features.customer_n_words_sum ?? null,
    customer_speech_speed_words_all_call_mean: features.customer_speech_speed_words_all_call_mean ?? null,
    customer_utt_count: features.customer_utt_count ?? null,
    customer_utt_length_mean: features.customer_utt_length_mean ?? null,
    dialog_interruptions_count: features.dialog_interruptions_count ?? null,
  };
};

const stripLegacyInsightFields = (callFeatures) => {
  const {
    csi_score,
    customer_emo_score_mean,
    customer_emo_score_weighted_by_speech_length_mean,
    customer_emotion_neg_speech_time_percentage,
    customer_emotion_pos_speech_time_percentage,
    customer_emotion_pos_utt_percentage,
    operator_emotion_positive,
    operator_emotion_neutral,
    operator_emotion_negative,
    client_emotion_positive,
    client_emotion_neutral,
    client_emotion_negative,
    emotion_stress_index,
    ...rest
  } = callFeatures || {};

  return rest;
};

export const extractYandexCallFeatures = ({ talk, operatorChannel = 0, customerChannel = 1 }) => {
  const phrases = Array.isArray(talk?.transcription?.phrases) ? talk.transcription.phrases : [];
  const conversationDurationMs = getConversationDurationMs(talk, phrases);
  const { stats, totalInterruptions } = accumulateChannelStats({
    phrases,
    operatorChannel,
    customerChannel,
  });

  const agent = buildSpeechMetricsFromChannelStats({
    stats,
    channel: operatorChannel,
    conversationDurationMs,
  });
  const customer = buildSpeechMetricsFromChannelStats({
    stats,
    channel: customerChannel,
    conversationDurationMs,
  });

  const silenceStatistics = pick(talk, 'silenceStatistics', 'silence_statistics');
  const silenceRatio = toNumber(pick(silenceStatistics, 'totalSimultaneousSilenceRatio', 'total_simultaneous_silence_ratio'));

  const agentInterruptsPct = agent.speechMs > 0
    ? agent.interruptedMs / agent.speechMs
    : null;

  return {
    csi_score: null,
    dialog_agent_speech_percentage: agent.speechRatio,
    dialog_customer_speech_percentage: customer.speechRatio,
    dialog_silence_length_percentage: silenceRatio,
    agent_speech_length_sum: agent.speechMs > 0 ? agent.speechMs / 1000 : null,
    agent_n_words_sum: agent.words,
    agent_speech_speed_words_all_call_mean: agent.wordsPerSecondMean,
    agent_utt_count: agent.utterances,
    agent_utt_length_mean: agent.utteranceDurationMean,
    dialog_interruptions_in_agent_speech_percentage: agentInterruptsPct,
    customer_speech_length_sum: customer.speechMs > 0 ? customer.speechMs / 1000 : null,
    customer_n_words_sum: customer.words,
    customer_speech_speed_words_all_call_mean: customer.wordsPerSecondMean,
    customer_utt_count: customer.utterances,
    customer_utt_length_mean: customer.utteranceDurationMean,
    dialog_interruptions_count: totalInterruptions,
  };
};

export const normalizeSpeechAnalysisResult = ({
  provider,
  rawResult,
  operatorName,
  operatorChannel = 0,
  customerChannel = 1,
}) => {
  if (provider === 'yandex') {
    const talk = Array.isArray(rawResult?.talk) ? rawResult.talk[0] : rawResult?.talk?.[0];
    const callFeatures = extractYandexCallFeatures({
      talk,
      operatorChannel,
      customerChannel,
    });

    return {
      schema_version: 1,
      provider,
      provider_result: rawResult,
      insight_result: {
        call_features: callFeatures,
      },
    };
  }

  return {
    schema_version: 1,
    provider,
    provider_result: rawResult,
    insight_result: {
      ...rawResult?.insight_result,
      call_features: stripLegacyInsightFields(rawResult?.insight_result?.call_features),
      csi: null,
    },
  };
};

export const buildTranscriptFromSpeechAnalysis = ({
  provider,
  rawResult,
  operatorName,
  operatorChannel = 0,
  customerChannel = 1,
}) => {
  if (provider === 'yandex') {
    const talk = Array.isArray(rawResult?.talk) ? rawResult.talk[0] : rawResult?.talk?.[0];
    return buildTranscriptFromYandexTalk({
      talk,
      operatorName,
      operatorChannel,
      customerChannel,
    });
  }

  return buildTranscriptFromSber({
    sberJson: rawResult,
    operatorName,
  });
};
