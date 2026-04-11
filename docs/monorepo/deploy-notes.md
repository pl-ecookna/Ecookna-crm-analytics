# Deploy Notes

## Dokploy target

После объединения в монорепо в Dokploy должны жить два сервиса в одном проекте:

1. `web`
2. `api`

## Рекомендуемая схема маршрутизации

- публичный домен фронтенда: `https://data.entechai.ru`
- `https://data.entechai.ru/api/*` маршрутизируется в `apps/api`
- `apps/api` не требует отдельного публичного домена, если доступ через `/api` достаточен

Это даёт:

- простой `VITE_API_BASE_URL=/api`
- отсутствие лишних CORS-настроек
- единый публичный origin для UI и API

## Build strategy

### `apps/api`

- Build type: `Dockerfile`
- Build path: `/`
- Dockerfile: `apps/api/Dockerfile`
- Docker context: `.`
- Port: `3000`

### `apps/web`

- Build type: `Dockerfile`
- Build path: `/`
- Dockerfile: `apps/web/Dockerfile`
- Docker context: `.`
- Port: `8000`

Оба сервиса собираются из корня монорепо, потому что Dockerfile копируют общие workspace-файлы и пакеты.

## Runtime notes

- проект использует только прямой `Postgres`, без Supabase runtime, auth или storage
- источник данных для `apps/api`: прямой `Postgres`
- если целевая Postgres-инфраструктура не поддерживает IPv6, для Dokploy нужен IPv4-доступный хост/пулер
- если API обслуживается только через `https://data.entechai.ru/api`, отдельный внешний `api`-домен не нужен

## Что проверить после cutover

1. `GET https://data.entechai.ru`
2. `GET /api/crm/calls`
3. `GET /api/crm/metrics`
4. `GET /api/prompts`
5. загрузку списка звонков во фронтенде
6. детализацию звонка
7. редактирование и удаление промптов
