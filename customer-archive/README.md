# Ecookna CRM Analytics

Монорепозиторий для системы аналитики звонков и управления доступом.

Состав проекта:
- `apps/web` - пользовательский интерфейс аналитики и админ-панель;
- `apps/api` - HTTP API, ingest webhook, auth и фоновые обработчики;
- `packages/shared-types` - общие TypeScript-типы;
- `packages/api-client` - общий клиент для фронтенда.

Актуальная сводка для заказчика и ИТ-службы:
- [docs/INDEX.md](docs/INDEX.md)
- [docs/customer-handover.md](docs/customer-handover.md)

Поток системы:

`CRM webhook -> S3 -> Postgres -> Sber Speech / Deepgram -> OpenAI -> Postgres -> web UI`

## Быстрый старт

```bash
pnpm install
pnpm dev
```

Для локального запуска API отдельно:

```bash
pnpm dev:api
```

Для локального запуска фронтенда отдельно:

```bash
pnpm dev:web
```

## Документация

- [apps/api/README.md](apps/api/README.md)
- [apps/web/README.md](apps/web/README.md)
- [apps/api/docs/INDEX.md](apps/api/docs/INDEX.md)
- [docs/monorepo/README.md](docs/monorepo/README.md)
