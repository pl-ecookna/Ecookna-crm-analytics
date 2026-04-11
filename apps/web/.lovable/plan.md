
## Проблема
В таблице `auth.users` 5 пользователей, а в таблице `profiles` только 2. Для 3-х пользователей не созданы профили:

| Email | User ID | Профиль |
|-------|---------|---------|
| r.i.galeev@gmail.com | cdd67a71... | Есть |
| aoshmanovsky@gmail.com | a221275a... | Есть |
| test@test.ru | 086983f4... | **Отсутствует** |
| testuser@test.ru | 2519bf0f... | **Отсутствует** |
| n.korotkova@ecookna.ru | 85ae5259... | **Отсутствует** |

### Причина
При создании пользователей профили не были созданы из-за проблем с RLS или сессией админа.

## План исправления

### Шаг 1: Создать недостающие профили
Добавить записи в таблицу `profiles` для существующих пользователей.

```sql
INSERT INTO public.profiles (id, email, name, role, department_id)
VALUES 
  ('086983f4-8101-4623-82eb-b00dff4e9926', 'test@test.ru', 'Test User', 'auditor', NULL),
  ('2519bf0f-255f-462e-a64b-7ffe24d47900', 'testuser@test.ru', 'Test User 2', 'auditor', NULL),
  ('85ae5259-e3e5-4adc-a3eb-8c76daa914b6', 'n.korotkova@ecookna.ru', 'Коротковa Н.', 'auditor', NULL);
```

### Шаг 2: Добавить триггер автоматического создания профиля
Создать триггер в базе данных, который будет автоматически создавать запись в `profiles` при регистрации нового пользователя в `auth.users`.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    'auditor'::user_role  -- роль по умолчанию
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### Шаг 3: Обновить UserManagement.tsx
Упростить логику создания пользователя, так как профиль будет создаваться автоматически триггером. После создания пользователя через `signUp` нужно будет только обновить поля `name`, `role`, `department_id`.

### Результат
- Все 5 пользователей будут отображаться в админ-панели
- Новые пользователи будут автоматически получать профиль
- Исключены ошибки из-за потери сессии админа

### Технические детали
**Файлы для изменения:**
1. Миграция SQL - создать триггер и добавить недостающие профили
2. `src/components/admin/UserManagement.tsx` - обновить логику создания пользователя (использовать UPDATE вместо INSERT для профиля)
