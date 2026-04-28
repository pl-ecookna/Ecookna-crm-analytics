# Карта метрик фронтенда (ecookna-crm-analytics_clone)

Дата проверки: 2026-04-11  
Источник (только чтение): `/Users/romangaleev/CodeProject/Ecookna/ecookna-crm-analytics_clone`

## 1) Где используются метрики

Основные точки:
- `src/pages/Index.tsx`
- `src/components/CrmCallCard.tsx`
- `src/components/CallDetailsAccordion.tsx`

Фронтенд читает данные из `crm_analytics` (`select('*')` для карточек/деталей и отдельный `select(...)` для агрегатов).

## 2) Метрики, критичные для дашборда/карточек

Используются всегда:
- `call_success`
- `overall_score`
- `user_name`
- `department`
- `brand`
- `call_datetime`
- `conversation_duration_minutes`
- `call_type`
- `file_status`
- `client_phone`

Назначение:
- KPI-виджеты в `Index.tsx` (успешные/неуспешные/средние, средний балл)
- карточки звонков (`CrmCallCard`)
- фильтры по сотруднику/отделу/бренду/статусу

## 3) Метрики, критичные для детальной карточки звонка

### 3.1 Критерии диалога (bool поля)
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

### 3.2 Баллы/оценки
- `overall_score`
- `stages_score`
- `quality_score`
- `compliance_score`
- `conflict_risk_score`
- `csi_score`

### 3.3 Качественные поля
- `call_success`
- `operator_tonality`
- `burnout_level`
- `burnout_signs`
- `transfer_required`
- `transfer_done`
- `transfer_quality`
- `transfer_comment`
- `conflict_moments`
- `final_conclusion`
- `tag`

### 3.4 Временные поля
- `conversation_duration_total`
- `conversation_duration_minutes`

## 4) Метрики речи из `transkription_full_json.insight_result.call_features`

`CallDetailsAccordion` читает их через `getCallFeature(...)`:

- `dialog_agent_speech_percentage`
- `dialog_customer_speech_percentage`
- `dialog_silence_length_percentage`
- `agent_speech_length_sum`
- `agent_n_words_sum`
- `agent_speech_speed_words_all_call_mean`
- `agent_utt_count`
- `agent_utt_length_mean`
- `dialog_interruptions_in_agent_speech_percentage`
- `customer_speech_length_sum`
- `customer_n_words_sum`
- `customer_speech_speed_words_all_call_mean`
- `customer_utt_count`
- `customer_utt_length_mean`
- `dialog_interruptions_count`

Важно: если `insight_result.call_features` отсутствует, блок «Речевые метрики» в UI отображается как «нет данных».

## 5) Эмоциональные метрики (из колонок таблицы)

- `operator_emotion_positive`
- `operator_emotion_neutral`
- `operator_emotion_negative`
- `client_emotion_positive`
- `client_emotion_neutral`
- `client_emotion_negative`
- `customer_emotion_neg_speech_time_percentage`
- `customer_emo_score_mean`
- `emotion_stress_index`

## 6) Транскрипция

- `transkription` — основной текст для `TranscriptDisplay`
- `transkription_full_json` — источник для speech-метрик

## 7) Вывод для режима "только callcenter"

Если использовать только `model=callcenter` и полностью отключить `insight_models`:

1. **Сохранится**:
- базовая транскрипция (если модель вернула текст)
- LLM-поля и большая часть колонок `crm_analytics` (при корректном post-processing)
- дашбордовые KPI на `overall_score/call_success`

2. **Потеряется/станет null**:
- `csi_score` (если не запрашивать `csi` insight)
- почти весь блок речевых метрик из `insight_result.call_features`
- часть эмоциональных агрегатов, если они завязаны на insight

3. Практический компромисс для текущего UI:
- `SBER_MODEL=callcenter`
- `SBER_INSIGHT_MODELS=csi,call_features`
- не использовать `is_solved` (вызывает `insight error` в текущем окружении)

Именно такой режим позволяет сохранить основную визуализацию метрик во фронтенде.

## 8) Рекомендации по метрикам после тестовых прогонов

Оставить как основные:
- `overall_score`
- `call_success`
- `stages_score`
- `quality_score`
- `compliance_score`
- `conflict_risk_score`
- `conversation_duration_total`
- `conversation_duration_minutes`
- `transfer_quality`

Показывать как отдельную прикладную метрику оператора:
- `transfer_required`
- `transfer_done`
- `transfer_quality`
- `transfer_comment`

Важное правило:
- `transfer_quality` не смешивается автоматически в `quality_score` и `overall_score`
- если перевод по сценарию не нужен, в UI должно показываться состояние `Не применимо`
