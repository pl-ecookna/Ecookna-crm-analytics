# Документация API

Дата актуализации: 2026-04-28

## Основные документы

- [project-spec.md](./project-spec.md) - подробная техническая спецификация API и потоков обработки
- [../../../docs/customer-handover.md](../../../docs/customer-handover.md) - сводный документ для заказчика
- [../../../docs/INDEX.md](../../../docs/INDEX.md) - общий индекс документации
- [frontend-metrics.md](./frontend-metrics.md) - карта метрик, которые читает UI
- [dokploy.md](./dokploy.md) - деплой и runtime-настройки в Dokploy

## Исторические и служебные документы

- [connections-audit.md](./connections-audit.md) - исторический аудит и проверка миграции таблиц
- [legacy-prompts.md](./legacy-prompts.md) - архив неиспользуемых prompt-записей
- [test-run-i4649817-metrics.md](./test-run-i4649817-metrics.md) - заметки по тестовому прогону метрик

## Быстрые ориентиры

- основная БД: `DB_MAIN_URL`
- база для отказов может совпадать с основной, если `DB_DISAPPROVE_URL` не задан
- фронтенд больше не ходит в Supabase напрямую
- источник правды для UI: `crm_analytics`
- источник правды для промптов: `prompts`
