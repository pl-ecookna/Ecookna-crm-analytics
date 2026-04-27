import { mainPool } from './mainDb.js';

const authBootstrapSql = `
CREATE TABLE IF NOT EXISTS public.app_users (
  id text PRIMARY KEY,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'call_center')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.auth_sessions (
  token_hash text PRIMARY KEY,
  user_id text NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  last_used_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_users_role_active
  ON public.app_users (role, is_active);

CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id
  ON public.auth_sessions (user_id);

INSERT INTO public.app_users (id, email, password_hash, name, role, is_active)
VALUES (
  '477a3c05-cef7-492b-a087-396ac59bfdef',
  'r.i.galeev@gmail.com',
  'scrypt$abf05a24458703156fe1f4b8d8f75b35$8fd0eda68c0b8453f5cc55887abf4d158b3e442892fa5954e35ffaf915a4c492e5362b4d6d6390d20b3177d5f54d6c8509c48bb301dfc9f49040b211d06f125a',
  'Roman Galeev',
  'admin',
  true
)
ON CONFLICT (email) DO NOTHING;
`;

export const ensureAuthSchema = async () => {
  await mainPool.query(authBootstrapSql);
};
