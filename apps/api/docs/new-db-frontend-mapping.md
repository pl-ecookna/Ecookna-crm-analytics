# Новая база данных и сопоставление с Supabase

Дата: 2026-04-11

Этот документ нужен для переезда фронтенда с прямого доступа к Supabase на новую внутреннюю Postgres-схему.

## 1. Что изменилось

Раньше фронтенд ходил в Supabase напрямую из браузера через `supabase-js`.

Теперь:
- основная БД для CRM данных - внутренняя Postgres;
- браузер не должен подключаться к Postgres напрямую;
- фронтенд должен получать данные через backend API;
- backend уже умеет читать и писать в новую БД.

Это важно по двум причинам:
- в браузер нельзя безопасно отдавать пароль к Postgres;
- новая БД не предоставляет Supabase REST/API, поэтому прежний `supabase-js`-подход больше не подходит.

## 2. Текущее разделение хранилищ

### 2.1 Внутренняя Postgres

Используется как основная база приложения.

Подключение на сервере:
- `DB_MAIN_URL`

Таблицы:
- `crm_analytics`
- `prompts`

### 2.2 Отдельный Postgres для потока `disaproov_calls`

Используется только для потока отказов и BI.

Подключение на сервере:
- `DB_DISAPPROVE_URL`

Таблица:
- `disaproov_calls`

### 2.3 Что больше не используется

Не переносим и не используем:
- `departments`
- `user_logs`
- `call_analysis`
- `sales_calls_analysis`
- `transcriptions`
- `auth`
- `functions`
- `triggers`

## 3. Основная таблица для фронтенда: `crm_analytics`

Это главная таблица, которую читает UI.

### 3.1 Что отображается в списке звонков

Фронтенд использует:
- `id`
- `call_id`
- `call_datetime`
- `user_name`
- `department`
- `brand`
- `overall_score`
- `call_success`
- `conversation_duration_minutes`
- `call_type`
- `file_status`
- `client_phone`

### 3.2 Что отображается в карточке детализации

Фронтенд использует:
- `call_id`
- `call_datetime`
- `uploaded_at`
- `analyzed_at`
- `client_id`
- `client_phone`
- `user_id`
- `user_name`
- `department`
- `brand`
- `call_type`
- `file_name`
- `file_url`
- `file_status`
- `tag`
- `is_first_contact`
- `transcription_crm`
- `transkription`
- `transkription_full_json`
- `greeting_correct`
- `operator_said_name`
- `cause_identified`
- `cause_clarified`
- `address_clarified`
- `active_listening_done`
- `answer_complete`
- `operator_thanked`
- `client_helped`
- `conflict_resolved`
- `conflict_moments`
- `conflict_risk_score`
- `operator_tonality`
- `final_conclusion`
- `compliance_score`
- `call_success`
- `overall_score`
- `burnout_level`
- `burnout_signs`
- `conversation_stage_greeting`
- `conversation_stage_request`
- `conversation_stage_solution`
- `conversation_stage_closing`
- `conversation_duration_total`
- `conversation_duration_minutes`
- `stages_score`
- `quality_score`
- `fcr_score`
- `csi_score`
- `dialog_agent_speech_percentage`
- `dialog_customer_speech_percentage`
- `dialog_silence_length_percentage`
- `dialog_interruptions_in_agent_speech_percentage`
- `agent_speech_speed_words_all_call_mean`
- `customer_emo_score_mean`
- `customer_emo_score_weighted_by_speech_length_mean`
- `customer_emotion_neg_speech_time_percentage`
- `customer_emotion_pos_speech_time_percentage`
- `customer_emotion_pos_utt_percentage`
- `operator_emotion_positive`
- `operator_emotion_neutral`
- `operator_emotion_negative`
- `client_emotion_positive`
- `client_emotion_neutral`
- `client_emotion_negative`
- `emotion_stress_index`

### 3.3 Что хранится в `transkription_full_json`

Фронтенд читает из него:
- `insight_result.call_features`

Именно из этого блока берутся речевые и эмоциональные метрики в карточке деталей.

Важно:
- фронтенд не должен ожидать старый Supabase-формат;
- в новом контракте достаточно передавать объект, совместимый по ключам с `insight_result.call_features`.

### 3.4 Что теперь не нужно фронтенду

Фронтенд не использует напрямую:
- `dialog_anybody_speech_length_percentage`
- `dialog_customer_speech_length_percentage`
- `operator_words_count`
- `client_words_count`
- `operator_speech_duration`
- `client_speech_duration`
- `operator_speech_rate`
- `client_speech_rate`
- `interruptions_operator`
- `interruptions_client`
- `percentage_speech_operator`
- `percentage_speech_client`
- `speech_ratio_operator_client`

## 4. Таблица `prompts`

Используется экраном управления промптами.

Поля:
- `id`
- `prompt_key`
- `prompt_name`
- `prompt_text`
- `created_at`

Фронтенд делает:
- список промптов;
- редактирование текста;
- удаление промпта;
- поиск по `prompt_name` и `prompt_key`.

## 5. Таблица `disaproov_calls`

Для текущего фронтенда не нужна напрямую.

Её использует:
- backend worker;
- BI-дашборд по отказам.

Если потом нужен UI для отказов, можно читать только:
- `id`
- `call_id`
- `call_datetime`
- `user_name`
- `department`
- `brand`
- `file_status`
- `reject_reasons`
- `user_notes`
- `file_name`
- `file_url`

## 6. Сопоставление со старым Supabase

### 6.1 Таблицы

- старый Supabase `crm_analytics` -> новая внутренняя `crm_analytics`
- старый Supabase `prompts` -> новая внутренняя `prompts`
- старый Supabase `disaproov_calls` -> отдельный Postgres `disaproov_calls`

Легаси-таблицы Supabase:
- `call_analysis`
- `sales_calls_analysis`
- `transcriptions`

Их больше нет в новой схеме.

### 6.2 Имена полей

Есть несколько старых и новых названий:

- `transcript` / `transcript_full` в старых типах -> `transkription` / `transkription_full_json`
- старый `call_analysis_crm` -> теперь `crm_analytics`

Если фронтенд ещё использует сгенерированные Supabase-типы, их нужно заменить.

## 7. Как фронтенду подключаться к новой БД

### 7.1 Не напрямую к Postgres

Нельзя подключать браузер к `DB_MAIN_URL`.

Причины:
- пароль к БД нельзя хранить в клиенте;
- Postgres не является публичным API для браузера;
- прямое подключение усложнит безопасность и деплой.

### 7.2 Правильная схема

Фронтенд -> backend API -> внутренняя Postgres

То есть фронтенду нужен HTTP-клиент, а не `supabase-js`.

## 8. Что нужно реализовать в backend API для фронтенда

Ниже минимальный контракт, который покрывает текущий UI.

### 8.1 Список звонков

`GET /api/crm/calls`

Параметры:
- `page`
- `pageSize`
- `callSuccess`
- `userName`
- `department`
- `brand`

Ответ:
- `items[]`
- `total`

Каждый элемент должен содержать:
- `id`
- `call_id`
- `call_datetime`
- `user_name`
- `department`
- `brand`
- `overall_score`
- `call_success`
- `conversation_duration_minutes`
- `call_type`
- `file_status`
- `client_phone`

### 8.2 Детали звонка

`GET /api/crm/calls/:id`

Ответ должен включать:
- все поля из раздела 3.2;
- `transkription_full_json.insight_result.call_features`.

### 8.3 Статистика по CRM

`GET /api/crm/metrics`

Нужно вернуть:
- количество успешных;
- количество неуспешных;
- количество звонков со средним результатом;
- средний `overall_score`;
- уникальные списки:
  - сотрудников;
  - подразделений;
  - брендов.

### 8.4 Промпты

`GET /api/prompts`

`PATCH /api/prompts/:id`

`DELETE /api/prompts/:id`

Нужно для экрана управления промптами.

## 9. Что нужно поменять во фронтенде

### 9.1 Удалить прямой Supabase-доступ

Заменить:
- `src/integrations/supabase/client.ts`
- `src/integrations/supabase/types.ts`

на API-клиент к backend.

### 9.2 Заменить запросы

Сейчас фронтенд читает:
- `crm_analytics`
- `prompts`

Через `supabase.from(...)`.

Нужно заменить на HTTP-запросы к backend API из раздела 8.

### 9.3 Обновить типы

Нужно либо:
- вручную описать DTO;
- либо сгенерировать типы от backend API.

Не стоит оставлять старые типы Supabase, потому что они содержат устаревшие таблицы вроде `call_analysis_crm`.

## 10. Проверка после переключения

Нужно убедиться, что:
- список звонков открывается;
- фильтры по сотруднику, отделу, бренду работают;
- карточка звонка открывается;
- транскрипция отображается;
- речевые метрики читаются из `transkription_full_json.insight_result.call_features`;
- экран промптов работает;
- нет обращения к Supabase из браузера.

## 11. Итоговая рекомендация

Для фронтенда правильная схема такая:

1. Браузер работает только с backend API.
2. Backend читает внутренний Postgres через `DB_MAIN_URL`.
3. Логика отображения остается прежней, меняется только способ получения данных.

Если нужно, следующим шагом можно сделать отдельный документ уже в формате:
- `frontend-api-contract.md`

Там я распишу точные DTO для `crm_analytics`, `prompts`, фильтров и деталки звонка.
