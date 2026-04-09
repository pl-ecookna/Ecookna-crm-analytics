# Dokploy

## Контекст
- Платформа: Dokploy
- Проект в Dokploy: `Call-center app`

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
