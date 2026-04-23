# Документация проекта

Дата актуализации: 2026-04-11

## Основные документы

- [project-spec.md](./project-spec.md) - полная спецификация сервиса, потоков обработки, сервисов и переменных окружения
- [new-db-frontend-mapping.md](./new-db-frontend-mapping.md) - новая база данных, сопоставление со старой Supabase-схемой и план подключения фронтенда
- [frontend-metrics.md](./frontend-metrics.md) - карта метрик, которые реально использует UI
- [dokploy.md](./dokploy.md) - деплой и runtime-настройки в Dokploy

## Исторические и служебные документы

- [connections-audit.md](./connections-audit.md) - исторический аудит и проверка миграции таблиц
- [legacy-prompts.md](./legacy-prompts.md) - архив неиспользуемых prompt-записей, удалённых из рабочей таблицы `prompts`

## Быстрые ориентиры

- Новая основная БД: `DB_MAIN_URL`
- Отдельная БД для отказов: `DB_DISAPPROVE_URL`
- Фронтенд больше не должен ходить в Supabase напрямую
- Источник правды для UI: `crm_analytics`
- Источник правды для промптов: `prompts`
