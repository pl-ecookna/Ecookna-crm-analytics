# Тестовый прогон метрик: `i4649817.mp3`

Дата прогона: 2026-04-11  
Аудио: `/Users/romangaleev/Desktop/i4649817.mp3`

Статус после обновления `salute_crm` промпта:
- промпт обновлен в БД `public.prompts`
- теперь он возвращает `overall_score`, `call_success`, `stages_score`, `quality_score`
- дополнительно промпт приведен в соответствие с текущим UI по `conversation_duration_total`, `conversation_duration_minutes` и `burnout_level`

## 1. Как запускался тест

Тест выполнен одноразовым локальным прогоном поверх текущего пайплайна проекта:

1. `Sber ASR` через `src/clients/sberClient.js`
2. сборка транскрипта через `src/services/transcriptBuilder.js`
3. получение OpenAI-промпта из `prompts.prompt_key='salute_crm'`
4. `OpenAI chat/completions` через `src/clients/openaiClient.js`

Для локального обращения к Sber понадобился сертификат:
- `apps/api/certs/russiantrustedca.pem`

Фактический режим Sber во время прогона:
- `SBER_MODEL=callcenter`
- `SBER_INSIGHT_MODELS=csi,call_features`

Фактический результат Insight:
- в `insight_result` вернулся только `call_features`
- `csi` в этом прогоне не вернулся

Официальная документация Sber по Insights:
- [Описание моделей Insights сервиса SaluteSpeech](https://developers.sber.ru/docs/ru/salutespeech/guides/recognition/insights-models)

Ключевые определения из документации:
- `CSI` — прогноз удовлетворенности клиента по итогам разговора
- `call_features` — подробная статистика речи: доли речи, тишина, перебивания, скорость речи, эмоции
- эмоции в `call_features` считаются только по репликам длиннее 2 секунд или где больше 2 слов

## 2. Что реально вернул Sber в этом прогоне

### 2.1 Ненулевые и непустые поля `insight_result.call_features`

| Метрика | Значение | Используется в UI | Краткий смысл |
|---|---:|---|---|
| `call_duration` | `326.448` | Нет | Общая длительность звонка в секундах |
| `agent_speech_length_sum` | `0` | Да | Суммарная длительность речи оператора |
| `agent_n_words_sum` | `0` | Да | Общее число слов оператора |
| `agent_utt_count` | `0` | Да | Количество реплик оператора |
| `agent_utt_length_sum` | `0` | Нет | Суммарная длительность всех реплик оператора |
| `agent_emotion_n_words_sum` | `0` | Нет | Число слов оператора в фрагментах, попавших в эмоц. анализ |
| `agent_emotion_speech_length_sum` | `0` | Нет | Длительность речи оператора в эмоц. анализе |
| `agent_emotion_utt_count` | `0` | Нет | Количество реплик оператора в эмоц. анализе |
| `agent_emotion_utt_length_sum` | `0` | Нет | Суммарная длительность эмоц. реплик оператора |
| `agent_long_speech_length_sum` | `0` | Нет | Суммарная длительность длинных реплик оператора |
| `agent_long_speech_n_words_sum` | `0` | Нет | Количество слов в длинных репликах оператора |
| `agent_long_speech_utt_count` | `0` | Нет | Количество длинных реплик оператора |
| `agent_long_speech_utt_length_sum` | `0` | Нет | Суммарная длительность длинных реплик оператора |
| `customer_speech_length_sum` | `0` | Да | Суммарная длительность речи клиента |
| `customer_n_words_sum` | `0` | Да | Общее число слов клиента |
| `customer_utt_count` | `0` | Да | Количество реплик клиента |
| `customer_utt_length_sum` | `0` | Нет | Суммарная длительность всех реплик клиента |
| `customer_emotion_n_words_sum` | `0` | Нет | Число слов клиента в фрагментах, попавших в эмоц. анализ |
| `customer_emotion_speech_length_sum` | `0` | Нет | Длительность речи клиента в эмоц. анализе |
| `customer_emotion_utt_count` | `0` | Нет | Количество реплик клиента в эмоц. анализе |
| `customer_emotion_utt_length_sum` | `0` | Нет | Суммарная длительность эмоц. реплик клиента |
| `customer_long_speech_length_sum` | `0` | Нет | Суммарная длительность длинных реплик клиента |
| `customer_long_speech_n_words_sum` | `0` | Нет | Количество слов в длинных репликах клиента |
| `customer_long_speech_utt_count` | `0` | Нет | Количество длинных реплик клиента |
| `customer_long_speech_utt_length_sum` | `0` | Нет | Суммарная длительность длинных реплик клиента |
| `dialog_anybody_speech_length_sum` | `0` | Нет | Суммарная длительность участков, где говорит хоть кто-то |
| `dialog_both_channels_speech_length_sum` | `0` | Нет | Суммарная длительность наложения речи двух каналов |
| `dialog_interruptions_count` | `0` | Да | Общее число перебиваний в диалоге |
| `dialog_interruptions_raw_speech_length_sum` | `0` | Нет | Суммарная длина “сырых” участков перебиваний |
| `dialog_interruptions_speech_length_sum` | `0` | Нет | Суммарная длина участков, распознанных как перебивания |
| `dialog_interruptions_list` | `[]` | Нет | Список эпизодов перебиваний |
| `conv_neg_list` | `[]` | Нет | Список негативных сегментов разговора |
| `id` | строка UUID | Нет | Внутренний идентификатор Insight-результата |

### 2.2 Что UI умеет показывать из `call_features`, но в этом прогоне не пришло

В интерфейсе есть чтение следующих Sber-метрик, но на тестовом аудио они вернулись `null`:

- `dialog_agent_speech_percentage`
- `dialog_customer_speech_percentage`
- `dialog_silence_length_percentage`
- `agent_speech_speed_words_all_call_mean`
- `agent_utt_length_mean`
- `dialog_interruptions_in_agent_speech_percentage`
- `customer_speech_speed_words_all_call_mean`
- `customer_utt_length_mean`
- `customer_emo_score_mean`
- `customer_emotion_neg_speech_time_percentage`

Краткий смысл по документации Sber:
- `dialog_agent_speech_percentage` — доля речи оператора в разговоре
- `dialog_customer_speech_percentage` — доля речи клиента в разговоре
- `dialog_silence_length_percentage` — доля тишины в разговоре
- `agent_speech_speed_words_all_call_mean` — средняя скорость речи оператора в словах
- `customer_speech_speed_words_all_call_mean` — средняя скорость речи клиента в словах
- `customer_emo_score_mean` — средний эмоциональный скор клиента от `-1` до `1`
- `customer_emotion_neg_speech_time_percentage` — доля негативной речи клиента

## 3. Что реально вернул OpenAI в этом прогоне

Источник: промпт `prompts.prompt_key='salute_crm'`.

### 3.1 Содержимое текущего промпта

Промпт просит вернуть только этот JSON-набор:

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
- `compliance_score`
- `conflict_risk_score`
- `conversation_stage_greeting`
- `conversation_stage_request`
- `conversation_stage_solution`
- `conversation_stage_closing`
- `operator_tonality`
- `burnout_level`
- `burnout_signs`
- `conflict_moments`
- `final_conclusion`

### 3.2 Фактически возвращенные OpenAI метрики

| Метрика | Значение | Используется в UI | Краткий смысл |
|---|---|---|---|
| `greeting_correct` | `false` | Да | Было ли корректное приветствие по стандарту бренда |
| `operator_said_name` | `false` | Да | Назвал ли оператор свое имя |
| `cause_identified` | `true` | Да | Понял ли оператор причину обращения |
| `cause_clarified` | `true` | Да | Уточнил ли детали причины обращения |
| `address_clarified` | `false` | Да | Уточнил ли адрес, если это нужно по сценарию |
| `active_listening_done` | `true` | Да | Использовал ли приемы активного слушания |
| `answer_complete` | `true` | Да | Дал ли полный ответ на запрос клиента |
| `operator_thanked` | `true` | Да | Поблагодарил ли оператор клиента |
| `client_helped` | `true` | Да | Решил ли вопрос клиента / помог ли по сути |
| `conflict_resolved` | `true` | Да | Снята ли конфликтность или напряжение |
| `compliance_score` | `2` | Да | Насколько разговор соответствует регламенту, шкала 1–5 |
| `conflict_risk_score` | `3` | Да | Оценка риска конфликта, шкала 1–10 |
| `conversation_stage_greeting` | `0 мин. 6 сек.` | Да | Длительность этапа приветствия |
| `conversation_stage_request` | `0 мин. 30 сек.` | Да | Длительность этапа выявления потребности |
| `conversation_stage_solution` | `4 мин. 30 сек.` | Да | Длительность основного этапа консультации |
| `conversation_stage_closing` | `0 мин. 20 сек.` | Да | Длительность завершения разговора |
| `operator_tonality` | `Профессиональная` | Да | Общая тональность оператора |
| `burnout_level` | `Не выявлено` | Да, но с mismatch | Оценка признаков выгорания |
| `burnout_signs` | `['Не выявлено']` | Да | Перечень признаков выгорания |
| `conflict_moments` | `Не выявлено` | Да | Описание конфликтных моментов |
| `final_conclusion` | текст | Да | Итоговый аналитический вывод |

Примечание по `burnout_level`:
- промпт возвращает строковую категорию (`Не выявлено / Легкие признаки / Явные признаки`)
- текущий UI сравнивает `burnout_level` как число, поэтому фактический формат поля и логика интерфейса сейчас не согласованы

### 3.3 Повторный прогон после обновления промпта

После обновления промпта на том же аудио OpenAI вернул уже полный набор нужных полей:

- `overall_score = 8.5`
- `call_success = "Успешный"`
- `stages_score = 5`
- `quality_score = 3.5`
- `conversation_duration_total = "5 мин. 16 сек."`
- `conversation_duration_minutes = 5.3`
- `burnout_level = 0.2`

Дополнительно вернулись:
- `greeting_correct = true`
- `operator_said_name = false`
- `compliance_score = 4`
- `conflict_risk_score = 2`

Это подтверждает, что проблема была именно в старом тексте промпта, а не в коде пайплайна.

### 3.4 Какие ожидаемые проектом поля OpenAI не возвращал до обновления промпта

Код проекта и UI ещё опираются на поля, которых в текущем промпте уже нет:

- `overall_score`
- `stages_score`
- `quality_score`
- `call_success`
- `conversation_duration_total`
- `conversation_duration_minutes`

Это означает:
- текущий `salute_crm` промпт не покрывает часть метрик, которые интерфейс пытается отображать
- эти значения должны либо приходить из другого источника, либо промпт нужно расширять отдельно

## 4. Что реально отражается в интерфейсе по этому аудио

### 4.1 Отразится в UI из OpenAI

Отразятся:
- все 10 булевых критериев диалога
- `compliance_score`
- `conflict_risk_score`
- все 4 временных этапа
- `operator_tonality`
- `burnout_level`
- `burnout_signs`
- `conflict_moments`
- `final_conclusion`

### 4.2 Отразится в UI из Sber

На этом файле из реально пришедших `call_features` интерфейс сможет использовать только:

- `agent_speech_length_sum`
- `agent_n_words_sum`
- `agent_utt_count`
- `customer_speech_length_sum`
- `customer_n_words_sum`
- `customer_utt_count`
- `dialog_interruptions_count`

Но все эти значения равны `0`, поэтому блок “Речевые метрики” формально заполнится, но по смыслу не даст полезной аналитики.

### 4.3 Не используется в UI вообще

На этом прогоне не используются интерфейсом:

- `call_duration`
- `agent_utt_length_sum`
- `customer_utt_length_sum`
- все `*_emotion_*_sum`
- все `*_long_speech_*`
- `dialog_anybody_speech_length_sum`
- `dialog_both_channels_speech_length_sum`
- `dialog_interruptions_raw_speech_length_sum`
- `dialog_interruptions_speech_length_sum`
- `dialog_interruptions_list`
- `conv_neg_list`
- `insight_result.call_features.id`

## 5. Почему Sber вернул так много нулей и null

### 5.1 Что удалось подтвердить фактически

По метаданным файла:
- `sampleRate = 8000`
- `numberOfChannels = 1`
- длительность около `326.5` сек

По результату самого распознавания:
- обнаружено `19` реплик
- все они попали только в `channel 0`
- второго активного канала в результате не появилось

### 5.2 Вывод по документации Sber

По документации SaluteSpeech Insights:
- модели Insights работают на одноканальных и двухканальных аудио с `8 кГц`
- для `call_features` сравнительная статистика «оператор vs клиент» корректно собирается по двум каналам
- для одноканального аудио доступна только статистика по одному каналу
- многие эмоциональные показатели считаются только по репликам длиннее 2 секунд или длиннее 2 слов

Практический вывод для этого файла:
- аудио моно, поэтому сравнительные двухканальные метрики (`dialog_*`, баланс оператор/клиент, часть customer/agent split-метрик) либо не определяются, либо становятся `null`
- так как Sber не разделил участников по отдельным каналам, интерфейсные метрики, завязанные на явное сравнение оператора и клиента, не получили полезных значений
- часть суммарных полей вернулась как `0`, что выглядит как деградация Insight-слоя на этом конкретном моно-сценарии, а не как отсутствие транскрипции
- это дополнительно подтверждается тем, что сам текст транскрипта был распознан, но все реплики оказались только в одном канале

Наиболее вероятная причина:
- файл моно и фактически не дал Sber достаточно данных для корректного расчета двухсторонних речевых характеристик клиента и оператора

## 6. Выводы по тестовому прогону

1. Текущий OpenAI-промпт стабильно возвращает критерии качества и текстовые выводы, которые в основном используются в деталях звонка.
2. После обновления `salute_crm` промпт теперь возвращает `overall_score`, `call_success`, `stages_score`, `quality_score`, а также длительности разговора.
3. Sber на этом файле вернул `call_features`, но практически все содержательные показатели пришли `null`, а ненулевые значения оказались нулями или служебными полями.
4. Основное объяснение — файл моно (`1 channel`) и все реплики распознаны только в `channel 0`, поэтому сравнительная аналитика по спикерам деградировала.
5. `csi` в тестовом прогоне не вернулся, несмотря на включенную модель `csi`.
6. Для локальных тестов Sber нужен `NODE_EXTRA_CA_CERTS` с `apps/api/certs/russiantrustedca.pem`.

## 7. Сравнительный прогон: `i5460570.mp3`

Дополнительный тест выполнен на файле:
- `/Users/romangaleev/CodeProject/Ecookna/ecookna-crm-analytics_clone/apps/api/test-audio/i5460570.mp3`

Метаданные файла:
- `numberOfChannels = 2`
- `sampleRate = 8000`
- `duration ≈ 91.08 сек`

### 7.1 Что вернул Sber

По этому файлу Sber отработал существенно лучше:
- распознано `7` реплик
- каналы разделились как `0` и `1`
- распределение: `channel 0 = 4`, `channel 1 = 3`
- в `insight_result` вернулись и `csi`, и `call_features`
- число ненулевых `call_features`: `357`

Ключевые полезные метрики:

| Метрика | Значение | Используется в UI | Краткий смысл |
|---|---:|---|---|
| `dialog_agent_speech_percentage` | `0.59` | Да | Доля речи оператора |
| `dialog_customer_speech_percentage` | `0.41` | Да | Доля речи клиента |
| `dialog_silence_length_percentage` | `0.68` | Да | Доля тишины в звонке |
| `agent_speech_length_sum` | `20.24` | Да | Суммарная длительность речи оператора |
| `customer_speech_length_sum` | `14.16` | Да | Суммарная длительность речи клиента |
| `agent_n_words_sum` | `44` | Да | Число слов оператора |
| `customer_n_words_sum` | `17` | Да | Число слов клиента |
| `agent_speech_speed_words_all_call_mean` | `2.17` | Да | Скорость речи оператора, слов/сек |
| `customer_speech_speed_words_all_call_mean` | `1.2` | Да | Скорость речи клиента, слов/сек |
| `agent_utt_count` | `4` | Да | Количество реплик оператора |
| `customer_utt_count` | `3` | Да | Количество реплик клиента |
| `dialog_interruptions_count` | `0` | Да | Количество перебиваний |
| `dialog_interruptions_in_agent_speech_percentage` | `0` | Да | Доля перебиваний в речи оператора |
| `customer_emo_score_mean` | `0` | Да | Средний эмоциональный скор клиента |
| `customer_emotion_neg_speech_time_percentage` | `0` | Да | Доля негативной речи клиента |
| `customer_emotion_pos_speech_time_percentage` | `0` | Нет | Доля позитивной речи клиента |
| `customer_emotion_pos_utt_percentage` | `0` | Нет | Доля позитивных реплик клиента |

### 7.2 Что вернул OpenAI

OpenAI на этом файле вернул:

- `overall_score = 4`
- `call_success = "Средний результат"`
- `stages_score = 3`
- `quality_score = 1`
- `compliance_score = 3`
- `conflict_risk_score = 2`
- `conversation_duration_total = "1 мин. 26 сек."`
- `conversation_duration_minutes = 1`
- `operator_tonality = "Профессиональная"`
- `burnout_level = 0.2`

### 7.3 Практический вывод по сравнению двух файлов

1. Для `call_features` наличие двух реальных каналов критично: на стерео-файле Sber возвращает заметно более богатый и осмысленный набор речевых метрик.
2. Моно-файлы можно использовать для транскрипции и LLM-анализа, но для детализированной речевой аналитики они сильно хуже.
3. Если цель — развивать блок речевых метрик, для тестов и ретроспектив лучше выбирать двухканальные записи.

## 8. Какие метрики, вероятно, лишние

### 8.1 Вероятно лишние в текущем UI

Эти поля либо не используются совсем, либо дают мало пользы в текущем интерфейсе:

- `dialog_interruptions_raw_speech_length_sum`
- `dialog_interruptions_speech_length_sum`
- `dialog_interruptions_list`
- `conv_neg_list`
- `dialog_anybody_speech_length_sum`
- `dialog_both_channels_speech_length_sum`
- `agent_utt_length_sum`
- `customer_utt_length_sum`
- все `*_long_speech_*`
- большая часть `*_emotion_*_sum`, если они не выводятся отдельным экраном
- `insight_result.call_features.id`

Причина:
- это низкоуровневые или служебные показатели
- пользователю их трудно интерпретировать без экспертного режима
- они не дают понятной бизнес-ценности на текущем экране

### 8.2 Кандидаты на скрытие из обычного интерфейса

Если нужна более компактная аналитика, можно рассмотреть скрытие или перенос в “экспертный режим”:

- `customer_emo_score_mean`
- `customer_emotion_neg_speech_time_percentage`
- `dialog_interruptions_in_agent_speech_percentage`

Причина:
- это полезные, но уже более “аналитические” показатели
- они лучше подходят для расширенной карточки или внутреннего QA-режима

## 9. Какие метрики стоит добавить

### 9.1 Из Sber

Логичные кандидаты на добавление в интерфейс:

- `call_duration`
  - полезно для явного показа длительности из первичного ASR-источника
- `customer_emotion_pos_speech_time_percentage`
  - дополняет текущую негативную эмоцию клиента
- `customer_emotion_pos_utt_percentage`
  - показывает долю позитивных клиентских реплик
- `dialog_both_channels_speech_length_sum`
  - можно использовать как показатель наложения речи / одновременного разговора

Если захочется развивать экспертный раздел речевой аналитики:

- `agent_speech_speed_letters_all_call_mean`
- `customer_speech_speed_letters_all_call_mean`
- `agent_letters_in_word_mean`
- `customer_letters_in_word_mean`

### 9.2 Из OpenAI

Из уже доступного OpenAI есть смысл явно использовать или сильнее подсветить:

- `final_conclusion`
  - можно сделать более заметным как summary блока деталей
- `conflict_moments`
  - полезно показывать даже при низком риске, если там есть конкретика
- `operator_thanked`
  - можно добавить в итоговую проверку регламента как отдельный маркер
- `conversation_duration_total`
  - можно показывать рядом с общей оценкой или в шапке деталки

### 9.3 Если развивать сам промпт дальше

Возможные безопасные расширения:

- `lead_capture_quality`
  - насколько качественно собраны контактные и сценарные данные
- `next_step_defined`
  - зафиксирован ли следующий шаг для клиента
- `transfer_quality`
  - отдельно оценивать качество перевода звонка на менеджера/следующую линию

Обновление после согласования с бизнесом:
- `transfer_quality` больше не считается опциональным расширением
- метрика признана важной для оценки оператора и должна жить отдельно от `quality_score`
- для реализации нужны связанные поля:
  - `transfer_required`
  - `transfer_done`
  - `transfer_quality`
  - `transfer_comment`
