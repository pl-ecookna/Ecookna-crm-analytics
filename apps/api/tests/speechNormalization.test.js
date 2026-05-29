import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildTranscriptFromSpeechAnalysis,
  extractYandexCallFeatures,
  normalizeSpeechAnalysisResult,
} from '../src/services/speechNormalization.js';

const yandexTalk = {
  transcription: {
    phrases: [
      {
        channelNumber: '0',
        startTimeMs: '0',
        endTimeMs: '1000',
        phrase: {
          text: 'Здравствуйте',
          normalizedText: 'Здравствуйте',
          words: [{ word: 'Здравствуйте' }],
        },
      },
      {
        channelNumber: '1',
        startTimeMs: '800',
        endTimeMs: '2000',
        phrase: {
          text: 'Да, слушаю',
          normalizedText: 'Да, слушаю',
          words: [{ word: 'Да' }, { word: 'слушаю' }],
        },
      },
    ],
  },
  silenceStatistics: {
    totalSimultaneousSilenceRatio: '0.2',
  },
  conversationStatistics: {
    conversationBoundaries: {
      durationSeconds: '10',
    },
  },
};

const yandexTalkRest = {
  transcription: {
    phrases: [
      {
        channel_number: '0',
        start_time_ms: '0',
        end_time_ms: '1000',
        phrase: {
          text: 'Здравствуйте',
          normalized_text: 'Здравствуйте',
          words: [{ word: 'Здравствуйте' }],
        },
      },
      {
        channel_number: '1',
        start_time_ms: '800',
        end_time_ms: '2000',
        phrase: {
          text: 'Да, слушаю',
          normalized_text: 'Да, слушаю',
          words: [{ word: 'Да' }, { word: 'слушаю' }],
        },
      },
    ],
  },
  silence_statistics: {
    total_simultaneous_silence_ratio: '0.2',
  },
  conversation_statistics: {
    conversation_boundaries: {
      duration_seconds: '10',
    },
  },
};

test('extracts Yandex speech metrics in UI-compatible shape', () => {
  const features = extractYandexCallFeatures({
    talk: yandexTalk,
    operatorChannel: 0,
    customerChannel: 1,
  });

  assert.equal(features.csi_score, null);
  assert.equal(features.dialog_agent_speech_percentage, 0.1);
  assert.equal(features.dialog_customer_speech_percentage, 0.12);
  assert.equal(features.dialog_silence_length_percentage, 0.2);
  assert.equal(features.agent_speech_length_sum, 1);
  assert.equal(features.customer_speech_length_sum, 1.2);
  assert.equal(features.agent_n_words_sum, 1);
  assert.equal(features.customer_n_words_sum, 2);
  assert.equal(features.agent_utt_count, 1);
  assert.equal(features.customer_utt_count, 1);
  assert.equal(features.dialog_interruptions_count, 1);
  assert.equal(features.dialog_interruptions_in_agent_speech_percentage, 0.2);
});

test('builds a transcript and normalized payload for Yandex talk response', () => {
  const transcript = buildTranscriptFromSpeechAnalysis({
    provider: 'yandex',
    rawResult: { talk: [yandexTalk] },
    operatorName: 'Оператор',
    operatorChannel: 0,
    customerChannel: 1,
  });

  assert.match(transcript, /\[00:00\] Оператор:/);
  assert.match(transcript, /\[00:00\] Клиент:/);

  const normalized = normalizeSpeechAnalysisResult({
    provider: 'yandex',
    rawResult: { talk: [yandexTalk] },
    operatorName: 'Оператор',
    operatorChannel: 0,
    customerChannel: 1,
  });

  assert.equal(normalized.schema_version, 1);
  assert.equal(normalized.provider, 'yandex');
  assert.equal(normalized.provider_result.talk.length, 1);
  assert.equal(normalized.insight_result.call_features.csi_score, null);
  assert.equal(normalized.insight_result.call_features.dialog_interruptions_count, 1);
});

test('supports snake_case Yandex REST talk payloads', () => {
  const transcript = buildTranscriptFromSpeechAnalysis({
    provider: 'yandex',
    rawResult: { talk: [yandexTalkRest] },
    operatorName: 'Оператор',
    operatorChannel: 0,
    customerChannel: 1,
  });

  assert.match(transcript, /\[00:00\] Оператор:/);
  assert.match(transcript, /Здравствуйте/);

  const features = extractYandexCallFeatures({
    talk: yandexTalkRest,
    operatorChannel: 0,
    customerChannel: 1,
  });

  assert.equal(features.dialog_agent_speech_percentage, 0.1);
  assert.equal(features.dialog_customer_speech_percentage, 0.12);
  assert.equal(features.dialog_interruptions_count, 1);
});

test('strips legacy CSI and emotion fields from Sber normalized payload', () => {
  const normalized = normalizeSpeechAnalysisResult({
    provider: 'sber',
    rawResult: {
      insight_result: {
        csi: { csi_score: 1 },
        call_features: {
          dialog_agent_speech_percentage: 0.42,
          csi_score: 1,
          operator_emotion_positive: 0.7,
          customer_emo_score_mean: 0.2,
        },
      },
    },
  });

  assert.equal(normalized.schema_version, 1);
  assert.equal(normalized.provider, 'sber');
  assert.equal(normalized.insight_result.csi, null);
  assert.equal(normalized.insight_result.call_features.dialog_agent_speech_percentage, 0.42);
  assert.equal(normalized.insight_result.call_features.csi_score, undefined);
  assert.equal(normalized.insight_result.call_features.operator_emotion_positive, undefined);
  assert.equal(normalized.insight_result.call_features.customer_emo_score_mean, undefined);
});
