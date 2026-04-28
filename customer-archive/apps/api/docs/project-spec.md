# Проектная документация: crm-analitics-back

Дата актуализации: 2026-04-28

## 1. Назначение сервиса

`crm-analitics-back` заменяет n8n-процессы и реализует 2 независимых потока обработки звонков:

1. `crm_analytics` (основной поток):
`Webhook -> S3 -> Postgres -> Sber ASR -> OpenAI LLM -> Postgres`
2. `disaproov_calls` (поток отказов):
`Webhook -> S3 -> Postgres -> Deepgram -> OpenAI LLM -> Postgres`

Ключевая цель: принимать аудио и данные звонка из CRM, сохранять, асинхронно анализировать и писать результат в БД для дальнейшей аналитики.

## 2. Архитектура и компоненты

### 2.1 Входные HTTP-методы сервиса

- `GET /health`
- `POST /webhook/getcrmdata` (`multipart/form-data`, бинарный файл в поле `data`)

### 2.2 Внешние сервисы и используемые методы

1. **S3-compatible storage (Beget S3)**
- `PutObject` (загрузка аудио)
- `GetObject` (чтение аудио для анализа)

2. **Postgres (direct) для `crm_analytics` и `prompts`**
- Таблица `crm_analytics`: `INSERT ... ON CONFLICT DO UPDATE`, `UPDATE`, `SELECT`
- Таблица `prompts`: чтение промптов (`prompt_key`)
- Claim задач основного потока через `FOR UPDATE SKIP LOCKED`

3. **Postgres (direct) для `disaproov_calls`**
- `INSERT ... ON CONFLICT DO UPDATE` (upsert входящего звонка)
- claim пачки через `FOR UPDATE SKIP LOCKED`
- обновление статусов `new/processing/completed/failed`

4. **Sber Speech (ASR)**
- `POST /api/v2/oauth` (получение access token)
- `POST /rest/v1/data:upload` (загрузка аудио)
- `POST /rest/v1/speech:async_recognize` (запуск асинхронного распознавания)
- `GET /rest/v1/task:get?id=...` (poll статуса задачи)
- `GET /rest/v1/data:download?response_file_id=...` (получение результата)

5. **Deepgram**
- `POST /v1/listen` c `url` аудиофайла

6. **OpenAI**
- `POST /v1/chat/completions` для финальной оценки звонка и структурированного JSON

## 3. Бизнес-логика потоков

### 3.1 Общий ingestion (webhook)

Обязательные поля:
- `call_id`
- `call_datetime`
- `user_name`
- файл `data`

Логика:
1. Валидация payload.
2. Отсев коротких звонков (`MIN_CALL_DURATION_SECONDS`).
3. Загрузка файла в S3 как `<call_id>.mp3`.
4. Маршрутизация:
- если `deal_type === disapprove` -> запись в `disaproov_calls`;
- иначе -> запись в `crm_analytics` (статус `file_status=new`).

### 3.2 Основной поток (`crm_analytics`)

1. Claim `new` записей через `FOR UPDATE SKIP LOCKED`.
2. Скачивание аудио из S3.
3. Распознавание в Sber.
4. Построение транскрипции.
5. Оценка звонка в OpenAI по промпту `prompts.prompt_key='salute_crm'`.
6. Запись результата в `crm_analytics`:
- `transkription_full_json`
- `transkription`
- метрики и итоговые оценки
- `file_status=completed`

При ошибках:
- автоповторы (до `RETRY_MAX_ATTEMPTS`)
- backoff `RETRY_BACKOFF_MS * 2^(attempt-1)`
- затем `file_status=failed`

### 3.3 Поток отказов (`disaproov_calls`)

1. Claim `new` из Postgres.
2. Транскрибация Deepgram.
3. LLM-анализ по промпту `prompts.prompt_key='disapproved_calls'`.
4. Запись `reject_reasons` JSON и `file_status=completed`.

При ошибках:
- аналогичный retry/backoff
- затем `failed`

## 4. Текущая специфика Sber ASR (важно)

Проверено в боевых тестах:

1. Базовая модель для колл-центра:
- `SBER_MODEL=callcenter`

2. Insight-модели:
- безопасный набор: `csi,call_features`

3. Настройка по умолчанию в коде:
- `SBER_INSIGHT_MODELS=csi,call_features`

4. Формат ответа Sber может отличаться:
- для части сценариев данные приходят как массив в корне;
- парсер транскрипции учитывает оба формата (`root[]` и `result[]`).

## 5. Cron и режим отладки

Фоновая обработка управляется флагом:
- `CRON_ENABLED`

Текущее безопасное поведение по умолчанию:
- `CRON_ENABLED=false`

Это сделано, чтобы в период отладки сервис не обрабатывал массово продовые `new` записи.

## 6. TLS/сертификаты для Sber

Для корректной работы TLS со стороны Sber в Docker-образ добавлен корневой сертификат:
- `certs/russiantrustedca.pem`

В Dockerfile:
1. установка `ca-certificates`,
2. копирование сертификата в `/usr/local/share/ca-certificates/russiantrustedca.crt`,
3. `update-ca-certificates`,
4. `NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/russiantrustedca.crt`.

## 7. Переменные окружения (ядро)

### 7.1 Обязательные для прямого запуска API

- `DB_MAIN_URL`
- `S3_ENDPOINT`
- `S3_BUCKET`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`
- `SBER_AUTH_KEY`
- `SBER_SCOPE`
- `DEEPGRAM_API_KEY`
- `OPENAI_API_KEY`

### 7.2 Ключевые runtime

- `PORT=3000`
- `CRON_ENABLED=false` (рекомендуется для отладки)
- `CRON_MAIN=*/10 * * * *`
- `CRON_DISAPPROVE=45 * * * *`
- `RETRY_MAX_ATTEMPTS=3`
- `RETRY_BACKOFF_MS=15000`
- `MAIN_BATCH_LIMIT=150`
- `DISAPPROVE_BATCH_LIMIT=200`
- `MIN_CALL_DURATION_SECONDS=60`

### 7.3 Sber ASR

- `SBER_MODEL=callcenter`
- `SBER_INSIGHT_MODELS=csi,call_features`
- `SBER_POLL_INTERVAL_MS=2500`
- `SBER_POLL_TIMEOUT_MS=180000`

## 8. База данных и текущие ограничения

1. Во внутреннем Postgres используются:
- `crm_analytics`
- `prompts`

2. Legacy-таблицы удалены:
- `call_analysis`
- `sales_calls_analysis`
- `transcriptions`

3. `disaproov_calls` может жить в отдельном Postgres (`DB_DISAPPROVE_URL`) или в той же базе, что и основной поток.

4. Для `crm_analytics` используются retry-колонки:
- `retry_count`
- `next_retry_at`
- `last_error`
- `processing_started_at`

## 9. Наблюдаемость

Базовые логи:
- `Service started`
- `Cron jobs are disabled` (если `CRON_ENABLED=false`)
- `Main worker completed/failed`
- `Disapprove worker completed/failed`

Рекомендуется дополнительно вынести:
- счетчики `new/processing/completed/failed`
- latency Sber/Deepgram/OpenAI
- retry metrics

## 10. Практические примечания для отладки

1. Для точечного теста лучше использовать отдельный `call_id` и не запускать batch-воркер без фильтра.
2. Если нужен тест только одного кейса, выполняйте отдельный скрипт/режим по `call_id`.
## 11. Карта метрик фронтенда

Подробная карта того, какие метрики реально используются UI (и что потеряется при полном отключении insight-моделей), вынесена в:
- `docs/frontend-metrics.md`
