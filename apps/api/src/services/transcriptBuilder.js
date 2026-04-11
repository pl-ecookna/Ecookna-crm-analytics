const toSeconds = (value) => {
  if (!value) return 0;
  const n = parseFloat(String(value).replace('s', ''));
  return Number.isFinite(n) ? n : 0;
};

const formatTs = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export const buildTranscriptFromSber = ({ sberJson, operatorName }) => {
  const rows = Array.isArray(sberJson)
    ? sberJson
    : (Array.isArray(sberJson?.result) ? sberJson.result : []);

  const segments = rows
    .filter((item) => item?.eou === true && item?.results?.[0]?.normalized_text)
    .map((item) => ({
      channel: Number(item.channel ?? 0),
      start: toSeconds(item.results[0].start),
      text: item.results[0].normalized_text,
    }))
    .sort((a, b) => a.start - b.start);

  const name0 = operatorName || 'Оператор';
  const name1 = 'Клиент';

  const lines = segments.map((s) => {
    const speaker = s.channel === 0 ? name0 : name1;
    return `[${formatTs(s.start)}] ${speaker}:\n${s.text}`;
  });

  return lines.join('\n\n');
};

export const extractSberCallFeatures = (sberJson) => {
  const features = sberJson?.insight_result?.call_features || {};

  return {
    csi_score: sberJson?.insight_result?.csi?.csi_score ?? null,

    dialog_agent_speech_percentage: features.dialog_agent_speech_percentage ?? null,
    dialog_customer_speech_percentage: features.dialog_customer_speech_percentage ?? null,
    dialog_silence_length_percentage: features.dialog_silence_length_percentage ?? null,

    agent_speech_speed_words_all_call_mean: features.agent_speech_speed_words_all_call_mean ?? null,
    customer_emo_score_mean: features.customer_emo_score_mean ?? null,
    customer_emo_score_weighted_by_speech_length_mean: features.customer_emo_score_weighted_by_speech_length_mean ?? null,
    customer_emotion_neg_speech_time_percentage: features.customer_emotion_neg_speech_time_percentage ?? null,
    customer_emotion_pos_speech_time_percentage: features.customer_emotion_pos_speech_time_percentage ?? null,
    customer_emotion_pos_utt_percentage: features.customer_emotion_pos_utt_percentage ?? null,
  };
};
