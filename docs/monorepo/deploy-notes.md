# Deploy Notes

## Dokploy target

После объединения в монорепо в Dokploy должны жить два сервиса в одном проекте:

1. `web`
2. `api`

## Рекомендуемая схема маршрутизации

- публичный домен фронтенда обслуживает `apps/web`
- запросы на `/api/*` проксируются в `apps/api`

Это даёт:

- простой `VITE_API_BASE_URL=/api`
- отсутствие лишних CORS-настроек
- единый публичный origin для UI и API

## Build strategy

### `apps/api`

- Build type: `Dockerfile`
- Working directory: `apps/api`
- Port: `3000`

### `apps/web`

Два допустимых варианта:

1. отдельный Dockerfile для Vite static build и раздачи через nginx
2. native/static deploy в Dokploy, если он удобнее в конкретной конфигурации

Рекомендуемый вариант: отдельный Dockerfile для `apps/web`, чтобы деплой был симметричным и воспроизводимым.

## Что проверить после cutover

1. `GET /health`
2. `GET /api/crm/calls`
3. `GET /api/crm/metrics`
4. `GET /api/prompts`
5. загрузку списка звонков во фронтенде
6. детализацию звонка
7. редактирование и удаление промптов
