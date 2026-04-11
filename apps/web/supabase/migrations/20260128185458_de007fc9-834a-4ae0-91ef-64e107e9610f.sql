-- Шаг 1: Добавить недостающие профили для существующих пользователей
INSERT INTO public.profiles (id, email, name, role, department_id)
VALUES 
  ('086983f4-8101-4623-82eb-b00dff4e9926', 'test@test.ru', 'Test User', 'auditor', NULL),
  ('2519bf0f-255f-462e-a64b-7ffe24d47900', 'testuser@test.ru', 'Test User 2', 'auditor', NULL),
  ('85ae5259-e3e5-4adc-a3eb-8c76daa914b6', 'n.korotkova@ecookna.ru', 'Коротковa Н.', 'auditor', NULL)
ON CONFLICT (id) DO NOTHING;

-- Шаг 2: Создать функцию для автоматического создания профиля
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
    'auditor'::user_role
  );
  RETURN NEW;
END;
$$;

-- Шаг 3: Создать триггер на таблице auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();