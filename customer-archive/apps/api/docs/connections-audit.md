# Connections Audit (2026-04-11)

## Result
Исторический audit для старого Supabase проекта `ldiooykwootoeigapfkk`.

Проверено перед миграцией через Supabase Management API (`/database/query`):
- таблицы присутствовали: `crm_analytics`, `prompts`
- таблицы были удалены: `call_analysis`, `sales_calls_analysis`, `transcriptions`

Текущее состояние после миграции:
- основная рабочая БД - внутренняя Postgres;
- `crm_analytics` и `prompts` уже перенесены в новую базу;
- `disaproov_calls` живёт в отдельном Postgres.

## Actions performed
Выполнен SQL:

```sql
DROP TABLE IF EXISTS public.call_analysis CASCADE;
DROP TABLE IF EXISTS public.sales_calls_analysis CASCADE;
DROP TABLE IF EXISTS public.transcriptions CASCADE;
```

Проверочный SQL:

```sql
select tablename
from pg_tables
where schemaname='public'
  and tablename in ('crm_analytics','prompts','call_analysis','sales_calls_analysis','transcriptions')
order by tablename;
```

Результат проверки на момент аудита: только `crm_analytics` и `prompts`.

## Notes
- `disaproov_calls` находится не в Supabase (отдельный Postgres `DB_DISAPPROVE_URL`).
- Для webhook-тестов используется файл `/Users/romangaleev/Downloads/o13265577.mp3` (скопирован в `tests/audio/`).
