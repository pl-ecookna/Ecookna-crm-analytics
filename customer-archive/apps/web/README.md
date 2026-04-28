# Frontend приложения Ecookna CRM Analytics

Это пользовательский интерфейс аналитики звонков и админ-панели.

## Что есть в интерфейсе

- список звонков с KPI и фильтрами;
- карточка звонка с деталями и транскрипцией;
- экран входа;
- экран доступа запрещен;
- админ-панель с промптами и пользователями.

## Технологии

- React 18;
- TypeScript;
- Vite;
- React Router;
- TanStack Query;
- React Hook Form + Zod;
- shadcn/ui и Tailwind CSS.

## Запуск

```bash
pnpm install
pnpm dev
```

Если запускать из корня репозитория, можно использовать `pnpm dev:web`.

Для локального режима фронтенд использует базовый URL API из `VITE_API_BASE_URL`.
По умолчанию в проекте ожидается `/api`, а Vite проксирует этот путь на локальный API.

## Важные страницы

- `/` - аналитика звонков;
- `/login` - вход;
- `/admin` - админ-панель;
- `/forbidden` - нет доступа.

## Что подключено к API

Фронтенд использует общий клиент `@ecookna/api-client` и обращается к:
- auth;
- CRM calls;
- metrics;
- prompts;
- users.

## Полезные ссылки

- [../README.md](../README.md)
- [../../docs/customer-handover.md](../../docs/customer-handover.md)
- [../../docs/INDEX.md](../../docs/INDEX.md)
