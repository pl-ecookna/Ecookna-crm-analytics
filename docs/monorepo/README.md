# Monorepo Target

Этот документ фиксирует целевую структуру монорепо для объединения:

- фронтенда `ecookna-crm-analytics_clone`
- бэкенда `crm-analitics-back`

Целевое runtime-состояние:

- `apps/web` работает только через `apps/api`
- `apps/web` ходит только в `apps/api`
- `apps/api` работает с `Postgres`
- фронт и бэк деплоятся рядом в Dokploy

## Целевая структура

```text
ecookna-monorepo/
  apps/
    web/
      src/
      public/
      package.json
      vite.config.ts
      .env.example
    api/
      src/
      sql/
      scripts/
      tests/
      package.json
      Dockerfile
      .env.example
  packages/
    shared-types/
      src/
      package.json
      tsconfig.json
    api-client/
      src/
      package.json
      tsconfig.json
  docs/
    architecture/
    infrastructure/
    migration/
  package.json
  pnpm-workspace.yaml
  turbo.json
  .gitignore
  .npmrc
  .env.example
  README.md
```

## Маппинг текущих репозиториев

### В `apps/web`

Переносится содержимое текущего фронтенд-репозитория:

- `src/`
- `public/`
- `components.json`
- `tailwind.config.ts`
- `postcss.config.js`
- `vite.config.ts`
- `tsconfig*.json`
- `eslint.config.js`

После API-cutover удаляются:

- любые Supabase runtime-артефакты и переменные окружения

### В `apps/api`

Переносится содержимое backend-репозитория:

- `src/`
- `sql/`
- `scripts/`
- `tests/`
- `certs/`
- `Dockerfile`
- `docker-compose.yml`

## Обязательные API-границы

Фронтенд должен использовать только HTTP API:

- `GET /api/crm/calls`
- `GET /api/crm/calls/:id`
- `GET /api/crm/metrics`
- `GET /api/prompts`
- `PATCH /api/prompts/:id`
- `DELETE /api/prompts/:id`

## Что выносим в shared packages

### `packages/shared-types`

Содержит DTO и общие типы:

- `CrmCallListItem`
- `CrmCallDetails`
- `CrmMetricsResponse`
- `PromptDto`
- `CallsQueryParams`
- `PaginatedResponse<T>`

### `packages/api-client`

Содержит общий клиент для `apps/web`:

- `getCalls`
- `getCallById`
- `getMetrics`
- `getPrompts`
- `updatePrompt`
- `deletePrompt`

## Документы в этой папке

- [root-package.json](./root-package.json) - шаблон корневого `package.json`
- [pnpm-workspace.yaml](./pnpm-workspace.yaml) - workspace-конфиг
- [turbo.json](./turbo.json) - оркестрация задач
- [root-env.example](./root-env.example) - пример root env
- [deploy-notes.md](./deploy-notes.md) - заметки по Dokploy
