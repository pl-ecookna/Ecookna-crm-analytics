# Ecookna Monorepo

Текущий репозиторий переведён в структуру монорепо и теперь является точкой сборки для:

- `apps/web` - интерфейс CRM-аналитики
- `apps/api` - backend ingestion/API/worker сервис

Целевая архитектура:

`web -> api -> Postgres`

`Supabase` больше не рассматривается как целевой runtime и будет удалён после полного API-cutover фронтенда.

## Структура

```text
apps/
  web/
  api/
packages/
  shared-types/
  api-client/
docs/
```

## Ближайшие шаги

1. Реализовать API-контракт для фронтенда в `apps/api`
2. Перевести `apps/web` с `supabase-js` на HTTP API
3. Удалить legacy-артефакты `supabase/`
