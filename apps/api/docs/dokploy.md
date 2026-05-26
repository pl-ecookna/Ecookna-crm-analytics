# Деплой в Dokploy

## 1) Источник
- Репозиторий: монорепо `Ecookna-crm-analytics`
- Build type: `Dockerfile`
- Build path: `/`
- Dockerfile path: `apps/api/Dockerfile`
- Docker context: `.`
- Port: `3000`

## 2) Переменные окружения
Заполнить все переменные из `.env.example`.
Критичные:
- `DB_MAIN_URL`
- `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`
- `SPEECH_PROVIDER=yandex`
- `YANDEX_SPEECHSENSE_API_KEY` или `YANDEX_SPEECHSENSE_IAM_TOKEN`
- `YANDEX_ORGANIZATION_ID`
- `YANDEX_SPEECHSENSE_SPACE_ID`
- `YANDEX_SPEECHSENSE_CONNECTION_ID`
- `YANDEX_SPEECHSENSE_PROJECT_ID`
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

Для `DB_MAIN_URL` используйте:
- локально: внешний Postgres endpoint
- в Dokploy: внутренний hostname контейнера Postgres

Опционально:
- `DB_DISAPPROVE_URL` (если не задан, сервис будет использовать `DB_MAIN_URL`, потому что таблица `disaproov_calls` может жить в той же базе)

Перед первым запуском убедиться, что:
- в основной БД уже созданы `crm_analytics` и `prompts`
- в базе `disaproov_calls` уже созданы служебные retry-колонки
- в SpeechSense уже созданы `space`, `connection` и `project` для выбранной организации

Если нужна полная пересборка пустой среды:
1. выполнить `sql/0004_internal_postgres_schema.sql`
2. выполнить `sql/0003_disapprove_retry_cols.sql`
3. выполнить `sql/0005_marketing_channel.sql`
4. выполнить `sql/0006_raw_audit_payloads.sql`
5. при необходимости загрузить данные скриптами миграции

Проект использует прямой `Postgres`.

Важно:
- если `apps/api` публикуется за фронтендом, рекомендуемый публичный путь это `https://data.entechai.ru/api`
- в Dokploy для path-based routing не нужно дублировать `/api` во внутреннем `internalPath`
- `DB_MAIN_URL` должен быть доступен с Dokploy-сервера по сети и TLS

## 4) Проверка после деплоя
- `GET https://data.entechai.ru/api/prompts`
- `GET https://data.entechai.ru/api/crm/metrics`
- отправить тестовый webhook через `tests/send_webhook_fixture.sh`

## 5) Наблюдаемость
Логи контейнера должны показывать:
- `Service started`
- `Cron jobs are disabled` (если `CRON_ENABLED=false`)
- `Main worker completed`
- `Disapprove worker completed`
