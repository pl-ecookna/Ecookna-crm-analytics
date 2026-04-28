# Webhook fixtures

Файлы:
- `webhook/approve.json`
- `webhook/disapprove.json`
- `webhook/duplicate_call_id.json`
- `webhook/missing_required_field.json`
- `webhook/short_call_should_skip.json`

Аудио:
- `../audio/sample_approve.mp3`
- `../audio/sample_disapprove.mp3`

## Быстрый запуск

```bash
WEBHOOK_URL=http://localhost:3000/webhook/getcrmdata \
./tests/send_webhook_fixture.sh ./tests/fixtures/webhook/approve.json ./tests/audio/sample_approve.mp3
```

```bash
WEBHOOK_URL=http://localhost:3000/webhook/getcrmdata \
./tests/send_webhook_fixture.sh ./tests/fixtures/webhook/disapprove.json ./tests/audio/sample_disapprove.mp3
```

Проверки:
- `approve` -> запись в `crm_analytics` со статусом `new`
- `disapprove` -> запись в `disaproov_calls` со статусом `new`
- `duplicate_call_id` -> идемпотентный upsert без дублей
- `missing_required_field` -> 4xx валидация
- `short_call_should_skip` -> пропуск/soft reject согласно правилу >59 сек
