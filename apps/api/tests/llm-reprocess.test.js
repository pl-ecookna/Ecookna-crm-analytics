import test from 'node:test';
import assert from 'node:assert/strict';

process.env.DB_MAIN_URL = process.env.DB_MAIN_URL || 'postgres://postgres:postgres@localhost:5432/postgres';
process.env.S3_ENDPOINT = process.env.S3_ENDPOINT || 'http://localhost:9000';
process.env.S3_BUCKET = process.env.S3_BUCKET || 'test-bucket';
process.env.S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID || 'test-access-key';
process.env.S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY || 'test-secret-key';
process.env.DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY || 'test-deepgram-key';
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'test-openai-key';
process.env.SPEECH_PROVIDER = process.env.SPEECH_PROVIDER || 'yandex';
process.env.YANDEX_ORGANIZATION_ID = process.env.YANDEX_ORGANIZATION_ID || 'org';
process.env.YANDEX_SPEECHSENSE_SPACE_ID = process.env.YANDEX_SPEECHSENSE_SPACE_ID || 'space';
process.env.YANDEX_SPEECHSENSE_CONNECTION_ID = process.env.YANDEX_SPEECHSENSE_CONNECTION_ID || 'connection';
process.env.YANDEX_SPEECHSENSE_PROJECT_ID = process.env.YANDEX_SPEECHSENSE_PROJECT_ID || 'project';
process.env.YANDEX_SPEECHSENSE_API_KEY = process.env.YANDEX_SPEECHSENSE_API_KEY || 'api-key';

const { reprocessCallById, reprocessLlmForRow } = await import('../src/services/mainAnalysisService.js');

const storedTalk = {
  provider: 'yandex',
  provider_result: {
    talk: [
      {
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
          ],
        },
      },
    ],
  },
  insight_result: {
    call_features: {
      dialog_agent_speech_percentage: 0.1,
    },
  },
};

test('reprocesses only LLM using stored speech analysis and transcript', async () => {
  const row = {
    id: 42,
    call_id: 'call-42',
    call_datetime: '2026-05-26T10:00:00.000Z',
    user_name: 'Оператор',
    department: 'Отдел продаж',
    brand: 'Бренд',
    call_type: 'входящий',
    transkription: '',
    transkription_full_json: storedTalk,
  };

  const calls = [];
  const result = await reprocessLlmForRow(row, {
    getPrompt: async () => 'prompt text',
    completeJson: async (payload) => {
      calls.push(payload);
      return {
        parsed: {
          overall_score: 9,
          stages_score: 5,
          quality_score: 4,
          call_success: 'Успешный',
        },
        raw: { id: 'completion-1' },
      };
    },
    saveResult: async (payload) => {
      calls.push(payload);
    },
  });

  assert.equal(result.status, 'completed');
  assert.equal(result.transcript.includes('Здравствуйте'), true);
  assert.equal(calls.length, 2);
  assert.equal(calls[0].returnRaw, true);
  assert.match(calls[0].userPrompt, /Транскрипция:/);
  assert.equal(calls[1].row.id, 42);
  assert.equal(calls[1].llm.overall_score, 9);
  assert.equal(calls[1].llm.stages_score, 5);
  assert.equal(calls[1].llm.quality_score, 4);
  assert.equal(calls[1].speechAnalysis, storedTalk);
});

test('reprocessCallById uses LLM-only path when speech analysis is already stored', async () => {
  const row = {
    id: 7,
    call_id: 'call-7',
    transkription: 'готовая стенограмма',
    transkription_full_json: storedTalk,
  };

  const calls = [];
  const result = await reprocessCallById(7, {
    getCallById: async () => row,
    reprocessLlmForRow: async (selectedRow) => {
      calls.push(selectedRow);
      return { status: 'completed' };
    },
    processSingleCallById: async () => {
      throw new Error('full path must not be called');
    },
  });

  assert.equal(result, row);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].id, 7);
});
