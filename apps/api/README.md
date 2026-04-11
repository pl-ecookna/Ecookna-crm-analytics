# crm-analitics-back

Сервис без n8n для 2 потоков:
- `crm_analytics`: Webhook -> S3 -> Postgres -> SberSpeech -> OpenAI -> Postgres
- `disaproov_calls`: Webhook -> S3 -> Postgres -> Deepgram -> OpenAI -> Postgres

Подробная проектная документация:
- `docs/INDEX.md` (точка входа в документацию)
- `docs/project-spec.md`
- `docs/frontend-metrics.md` (карта используемых фронтендом метрик)
- `docs/new-db-frontend-mapping.md` (переезд фронтенда на новую БД)

## Быстрый старт

1. Установить зависимости:

```bash
npm install
```

2. Подготовить env:

```bash
cp .env.example .env
# затем заполнить значения
```

3. Запустить:

```bash
npm run dev
```

Для production (локально через Docker):

```bash
docker compose --env-file .env up -d --build
```

Сервис поднимает:
- `GET /health`
- `POST /webhook/getcrmdata` (`multipart/form-data`, бинарное поле `data`)

## SQL миграции

Если поднимаете новую пустую БД, примените:
- `sql/0004_internal_postgres_schema.sql` для основной базы
- `sql/0003_disapprove_retry_cols.sql` для базы `disaproov_calls`
- `sql/0005_marketing_channel.sql` для сохранения `marketing_channel`

Если переносите старые данные, используйте:
- `scripts/migrate_crm_analytics_to_internal_postgres.mjs`
- `sql/0004_internal_postgres_schema.sql`

## Dokploy

Инструкция деплоя: `docs/dokploy.md`.

## Ретраи

- Автоповторы: `RETRY_MAX_ATTEMPTS=3`
- Экспоненциальная пауза: `RETRY_BACKOFF_MS * 2^(attempt-1)`
- После исчерпания попыток: `file_status=failed`

## Важные текущие настройки

- `CRON_ENABLED=false` по умолчанию (безопасно для отладки, не трогает массово prod `new` записи)
- Sber ASR:
  - `SBER_MODEL=callcenter`
  - `SBER_INSIGHT_MODELS=csi,call_features`

## Тест webhook

Используйте фикстуры:
- `tests/fixtures/webhook/*.json`
- `tests/audio/sample_approve.mp3`
- `tests/audio/sample_disapprove.mp3`

Пример:

```bash
WEBHOOK_URL=http://localhost:3000/webhook/getcrmdata \
./tests/send_webhook_fixture.sh ./tests/fixtures/webhook/approve.json ./tests/audio/sample_approve.mp3
```
