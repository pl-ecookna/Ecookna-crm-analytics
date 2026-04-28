# Dokploy

## Контекст
- Платформа: Dokploy
- Проект в Dokploy: `Call-center app`
- Целевой публичный домен UI: `data.entechai.ru`
- Целевой маршрут API: `data.entechai.ru/api`

## Безопасное хранение доступов
Секреты для подключения к Dokploy хранятся только локально в файле:
- `docs/private/dokploy.secrets.md`

Этот путь добавлен в `.gitignore`, поэтому данные не попадут в GitHub.

## Рекомендуемые переменные окружения
Для локальной работы и CI используйте переменные окружения:
- `DOKPLOY_URL`
- `DOKPLOY_API_KEY`
- `DOKPLOY_PROJECT_NAME`

Пример (без секретов):

```bash
export DOKPLOY_URL="https://srv.entechai.ru/"
export DOKPLOY_PROJECT_NAME="Call-center app"
# export DOKPLOY_API_KEY="<set-locally>"
```

## Целевая конфигурация приложений

В проекте `Call-center app` поддерживаются два application-сервиса:

1. `cca`
2. `api`

### `cca`

- домен: `https://data.entechai.ru`
- build type: `Dockerfile`
- build path: `/`
- dockerfile: `apps/web/Dockerfile`
- env:
  - `VITE_API_BASE_URL=/api`

### `api`

- домен: `https://data.entechai.ru/api`
- build type: `Dockerfile`
- build path: `/`
- dockerfile: `apps/api/Dockerfile`
- env:
  - runtime-переменные из `apps/api/.env`
  - `DB_MAIN_URL` должен указывать на прямой `Postgres`

## Примечание по базе данных

Проект не использует Supabase runtime.

Правило для `DB_MAIN_URL`:
- локальная разработка: внешний PostgreSQL endpoint
- Dokploy / серверный деплой: внутренний контейнерный hostname Postgres

Источником истины для деплоя считается та строка подключения, которая реально доступна с production-сервера.
