# API сервиса Ecookna CRM Analytics

Этот сервис принимает webhook от CRM, сохраняет аудиофайл в S3, пишет запись в Postgres и запускает автоматический анализ.

## Что делает API

- принимает звонки через `POST /webhook/getcrmdata`;
- отдает данные для фронтенда через `/api/crm/*` и `/api/prompts`;
- управляет входом, сессиями и пользователями через `/auth/*`;
- запускает фоновые обработки через встроенный cron;
- работает с двумя потоками данных:
  - `crm_analytics`;
  - `disaproov_calls`.

## Ключевые документы

- [../../docs/INDEX.md](../../docs/INDEX.md)
- [../../docs/customer-handover.md](../../docs/customer-handover.md)
- [docs/INDEX.md](./docs/INDEX.md)
- [docs/project-spec.md](./docs/project-spec.md)

## Локальный запуск

### Через monorepo

```bash
pnpm install
pnpm dev
```

Если запускать из корня репозитория, можно использовать `pnpm dev:api`.

### Через Docker Compose

Перед запуском подготовьте `apps/api/.env`:

```bash
cp .env.example .env
```

Затем:

```bash
docker compose up -d --build
```

Файл `docker-compose.yml` поднимает только API-контейнер и healthcheck. База данных и внешние сервисы должны быть доступны отдельно.

## Доступные HTTP-ручки

- `GET /health`
- `POST /webhook/getcrmdata`
- `POST /api/webhook/getcrmdata`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- `GET /api/crm/calls`
- `GET /api/crm/calls/:id`
- `DELETE /api/crm/calls/:id`
- `DELETE /api/crm/calls/latest`
- `GET /api/crm/metrics`
- `GET /api/prompts`
- `PATCH /api/prompts/:id`
- `DELETE /api/prompts/:id`
- `GET /auth/users`
- `POST /auth/users`
- `PATCH /auth/users/:id`
- `DELETE /auth/users/:id`

## База данных

Схема создается SQL-файлами из `sql/`:

- `0001_drop_legacy_tables.sql`
- `0002_main_retry_and_claim.sql`
- `0003_disapprove_retry_cols.sql`
- `0004_internal_postgres_schema.sql`
- `0005_marketing_channel.sql`
- `0006_raw_audit_payloads.sql`
- `0007_auth_users.sql`

Основные таблицы:
- `crm_analytics`;
- `disaproov_calls`;
- `prompts`;
- `app_users`;
- `auth_sessions`.

## Внешние интеграции

- S3-compatible storage для аудио;
- Sber Speech для ASR и инсайтов;
- Deepgram для потока `disaproov_calls`;
- OpenAI для итоговой оценки и классификации;
- Postgres как основное хранилище.

## Переменные окружения

См. [`.env.example`](./.env.example).

Важные примечания:
- `DB_DISAPPROVE_URL` опционален, если не задан, используется `DB_MAIN_URL`;
- `CRM_WEBHOOK_PATH` сейчас только логируется при старте и не меняет маршрут;
- `CRM_WEBHOOK_MAX_FILE_AGE_DAYS` в текущем коде не читается;
- `AUTH_COOKIE_NAME` по умолчанию `ecookna_session`;
- `AUTH_SESSION_DAYS` по умолчанию `7`.

## Ретраи и фоновые задачи

- основной воркер обрабатывает записи `crm_analytics`;
- воркер отклоненных звонков обрабатывает `disaproov_calls`;
- статус задачи хранится в БД через `file_status`;
- повторные попытки управляются `retry_count`, `next_retry_at`, `last_error`;
- cron можно выключить через `CRON_ENABLED=false`.

## Тест webhook

Фикстуры лежат в `tests/fixtures/webhook/`, аудио - в `tests/audio/`.

Пример:

```bash
WEBHOOK_URL=http://localhost:3000/webhook/getcrmdata \
./tests/send_webhook_fixture.sh ./tests/fixtures/webhook/approve.json ./tests/audio/sample_approve.mp3
```
