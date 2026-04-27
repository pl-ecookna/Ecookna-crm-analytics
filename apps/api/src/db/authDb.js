import { mainPool } from './mainDb.js';

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const allowedRoles = new Set(['admin', 'call_center']);

const mapUserRow = (row) => ({
  id: row.id,
  email: row.email,
  name: row.name,
  role: row.role,
  is_active: row.is_active,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

export const getUserByEmail = async (email) => {
  const { rows } = await mainPool.query(
    `
      SELECT id, email, password_hash, name, role, is_active, created_at, updated_at
      FROM public.app_users
      WHERE lower(email) = lower($1)
      LIMIT 1
    `,
    [normalizeEmail(email)],
  );
  return rows[0] || null;
};

export const getUserById = async (id) => {
  const { rows } = await mainPool.query(
    `
      SELECT id, email, name, role, is_active, created_at, updated_at
      FROM public.app_users
      WHERE id = $1
      LIMIT 1
    `,
    [id],
  );
  return rows[0] || null;
};

export const getActiveUserBySessionHash = async (sessionHash) => {
  const { rows } = await mainPool.query(
    `
      SELECT
        u.id, u.email, u.name, u.role, u.is_active, u.created_at, u.updated_at,
        s.expires_at
      FROM public.auth_sessions s
      JOIN public.app_users u ON u.id = s.user_id
      WHERE s.token_hash = $1
        AND s.expires_at > NOW()
        AND u.is_active = true
      LIMIT 1
    `,
    [sessionHash],
  );
  return rows[0] || null;
};

export const listUsers = async () => {
  const { rows } = await mainPool.query(
    `
      SELECT id, email, name, role, is_active, created_at, updated_at
      FROM public.app_users
      ORDER BY created_at DESC, email ASC
    `,
  );
  return rows.map(mapUserRow);
};

export const createUser = async ({ id, email, passwordHash, name, role, isActive = true }) => {
  if (!allowedRoles.has(role)) {
    throw new Error('Invalid role');
  }

  const { rows } = await mainPool.query(
    `
      INSERT INTO public.app_users (
        id, email, password_hash, name, role, is_active, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, NOW(), NOW()
      )
      RETURNING id, email, name, role, is_active, created_at, updated_at
    `,
    [id, normalizeEmail(email), passwordHash, name, role, isActive],
  );

  return mapUserRow(rows[0]);
};

export const updateUser = async (id, patch) => {
  const entries = Object.entries(patch).filter(([, value]) => value !== undefined);
  if (entries.length === 0) {
    return getUserById(id);
  }

  const allowedFields = new Set(['email', 'password_hash', 'name', 'role', 'is_active']);
  const fields = [];
  const values = [id];

  for (const [key, value] of entries) {
    if (!allowedFields.has(key)) continue;
    if (key === 'role' && !allowedRoles.has(value)) {
      throw new Error('Invalid role');
    }
    values.push(key === 'email' ? normalizeEmail(value) : value);
    fields.push(`${key} = $${values.length}`);
  }

  if (fields.length === 0) {
    return getUserById(id);
  }

  const { rows } = await mainPool.query(
    `
      UPDATE public.app_users
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $1
      RETURNING id, email, name, role, is_active, created_at, updated_at
    `,
    values,
  );

  return rows[0] ? mapUserRow(rows[0]) : null;
};

export const deleteUserById = async (id) => {
  const { rows } = await mainPool.query(
    'DELETE FROM public.app_users WHERE id = $1 RETURNING id',
    [id],
  );
  return rows[0] || null;
};

export const countActiveAdmins = async () => {
  const { rows } = await mainPool.query(
    `
      SELECT COUNT(*)::int AS total
      FROM public.app_users
      WHERE role = 'admin' AND is_active = true
    `,
  );
  return rows[0]?.total || 0;
};

export const countAdmins = async () => {
  const { rows } = await mainPool.query(
    `
      SELECT COUNT(*)::int AS total
      FROM public.app_users
      WHERE role = 'admin'
    `,
  );
  return rows[0]?.total || 0;
};

export const createSession = async ({ tokenHash, userId, expiresAt }) => {
  await mainPool.query(
    `
      INSERT INTO public.auth_sessions (token_hash, user_id, expires_at, created_at, last_used_at)
      VALUES ($1, $2, $3, NOW(), NOW())
    `,
    [tokenHash, userId, expiresAt],
  );
};

export const updateSessionLastUsed = async (tokenHash) => {
  await mainPool.query(
    'UPDATE public.auth_sessions SET last_used_at = NOW() WHERE token_hash = $1',
    [tokenHash],
  );
};

export const deleteSessionByHash = async (tokenHash) => {
  await mainPool.query(
    'DELETE FROM public.auth_sessions WHERE token_hash = $1',
    [tokenHash],
  );
};

export const deleteSessionsByUserId = async (userId) => {
  await mainPool.query(
    'DELETE FROM public.auth_sessions WHERE user_id = $1',
    [userId],
  );
};

export const getUserRowForAuth = mapUserRow;
