# Monorepo

Этот документ фиксирует, что в текущем репозитории уже собран рабочий монорепозиторий:

- `apps/web` - frontend;
- `apps/api` - backend/API;
- `packages/shared-types` и `packages/api-client` - общие пакеты.

## Текущее runtime-состояние

- web ходит в API по HTTP;
- API работает с Postgres и внешними сервисами;
- cron и worker-логика живут внутри `apps/api`;
- деплой предполагает соседнее размещение web и API в Dokploy или другом аналогичном окружении.

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

## Что важно для интеграции

- web использует только `@ecookna/api-client`;
- API не зависит от web-рендера;
- `VITE_API_BASE_URL` должен быть совместим с маршрутизацией прокси или reverse proxy;
- `DB_DISAPPROVE_URL` может совпадать с `DB_MAIN_URL`.

## Документы в этой папке

- [root-package.json](./root-package.json)
- [pnpm-workspace.yaml](./pnpm-workspace.yaml)
- [turbo.json](./turbo.json)
- [root-env.example](./root-env.example)
- [deploy-notes.md](./deploy-notes.md)
