# Деплой в Dokploy

## 1) Источник
- Репозиторий: `crm-analitics-back`
- Build type: `Dockerfile`
- Dockerfile path: `./Dockerfile`
- Port: `3000`

## 2) Переменные окружения
Заполнить все переменные из `.env.example`.
Критичные:
- `DB_MAIN_URL`
- `DB_DISAPPROVE_URL`
- `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`
- `SBER_AUTH_KEY`, `SBER_SCOPE`
- `SBER_MODEL` (рекомендуется `callcenter`)
- `SBER_INSIGHT_MODELS` (рекомендуется `csi,call_features`)
- `DEEPGRAM_API_KEY`
- `OPENAI_API_KEY`

Рекомендуемые runtime:
- `PORT=3000`
- `CRON_ENABLED=false` (на время отладки)
- `RETRY_MAX_ATTEMPTS=3`
- `RETRY_BACKOFF_MS=15000`
- `CRON_MAIN=*/10 * * * *`
- `CRON_DISAPPROVE=45 * * * *`

## 3) База данных

Перед первым запуском убедиться, что:
- в основной БД уже созданы `crm_analytics` и `prompts`
- в базе `disaproov_calls` уже созданы служебные retry-колонки

Если нужна полная пересборка пустой среды:
1. выполнить `sql/0004_internal_postgres_schema.sql`
2. выполнить `sql/0003_disapprove_retry_cols.sql`
3. при необходимости загрузить данные скриптами миграции

Legacy-Supabase больше не участвует в runtime.

## 4) Проверка после деплоя
- `GET /health` -> `{ "ok": true }`
- отправить тестовый webhook через `tests/send_webhook_fixture.sh`

## 5) Наблюдаемость
Логи контейнера должны показывать:
- `Service started`
- `Cron jobs are disabled` (если `CRON_ENABLED=false`)
- `Main worker completed`
- `Disapprove worker completed`
