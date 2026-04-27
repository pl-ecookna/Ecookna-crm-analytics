import crypto from 'crypto';
import express from 'express';
import {
  countAdmins,
  countActiveAdmins,
  createSession,
  createUser,
  deleteSessionByHash,
  deleteSessionsByUserId,
  deleteUserById,
  getActiveUserBySessionHash,
  getUserByEmail,
  getUserById,
  listUsers,
  updateUser,
} from '../db/authDb.js';
import { generatePassword, hashPassword, verifyPassword } from '../auth/password.js';
import {
  buildAuthCookie,
  buildClearAuthCookie,
  getSessionMaxAgeSeconds,
  getSessionTokenFromRequest,
  hashSessionToken,
} from '../auth/session.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();
const allowedRoles = new Set(['admin', 'call_center']);

const sanitizeUser = (user) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
  is_active: user.is_active,
  created_at: user.created_at,
  updated_at: user.updated_at,
});

const parseBoolean = (value, fallback = undefined) => {
  if (value === undefined) return fallback;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }
  return fallback;
};

const validateUserPayload = ({ email, password, name, role }) => {
  if (!email || !String(email).trim()) return 'Email обязателен';
  if (!name || !String(name).trim()) return 'Имя обязательно';
  if (!role || !allowedRoles.has(role)) return 'Некорректная роль';
  if (password !== undefined && String(password).trim().length > 0 && String(password).trim().length < 8) {
    return 'Пароль должен быть не короче 8 символов';
  }
  return null;
};

router.post('/login', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim();
    const password = String(req.body?.password || '');

    if (!email || !password) {
      return res.status(400).json({ error: 'Email и пароль обязательны' });
    }

    const user = await getUserByEmail(email);
    if (!user || !user.is_active || !verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const sessionToken = crypto.randomBytes(32).toString('base64url');
    const tokenHash = hashSessionToken(sessionToken);
    const expiresAt = new Date(Date.now() + getSessionMaxAgeSeconds() * 1000);

    await createSession({
      tokenHash,
      userId: user.id,
      expiresAt,
    });

    res.setHeader('Set-Cookie', buildAuthCookie(sessionToken));
    return res.json({ user: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ error: 'Не удалось выполнить вход', detail: error.message });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const token = getSessionTokenFromRequest(req);
    if (token) {
      await deleteSessionByHash(hashSessionToken(token));
    }

    res.setHeader('Set-Cookie', buildClearAuthCookie());
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: 'Не удалось выполнить выход', detail: error.message });
  }
});

router.get('/me', async (req, res) => {
  try {
    const token = getSessionTokenFromRequest(req);
    if (!token) {
      return res.json({ user: null });
    }

    const user = await getActiveUserBySessionHash(hashSessionToken(token));
    if (!user) {
      return res.json({ user: null });
    }

    return res.json({ user: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch current user', detail: error.message });
  }
});

router.get('/users', requireAuth, requireRole('admin'), async (_req, res) => {
  try {
    const users = await listUsers();
    return res.json({ users });
  } catch (error) {
    return res.status(500).json({ error: 'Не удалось загрузить пользователей', detail: error.message });
  }
});

router.post('/users', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const payload = {
      email: req.body?.email,
      password: req.body?.password,
      name: req.body?.name,
      role: req.body?.role,
      is_active: parseBoolean(req.body?.is_active, true),
    };

    const validationError = validateUserPayload(payload);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const explicitPassword = String(payload.password || '').trim();
    const generatedPassword = explicitPassword ? null : generatePassword();
    const passwordToStore = explicitPassword || generatedPassword;

    const user = await createUser({
      id: crypto.randomUUID(),
      email: payload.email,
      passwordHash: hashPassword(passwordToStore),
      name: String(payload.name).trim(),
      role: payload.role,
      isActive: payload.is_active,
    });

    return res.status(201).json({
      user,
      generatedPassword,
    });
  } catch (error) {
    if (error?.code === '23505') {
      return res.status(409).json({ error: 'Пользователь с таким email уже существует' });
    }
    return res.status(500).json({ error: 'Не удалось создать пользователя', detail: error.message });
  }
});

router.patch('/users/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const id = String(req.params.id || '').trim();
    const target = await getUserById(id);
    if (!target) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const patch = {};

    if (req.body?.email !== undefined) patch.email = String(req.body.email).trim();
    if (req.body?.name !== undefined) patch.name = String(req.body.name).trim();
    if (req.body?.role !== undefined) {
      if (!allowedRoles.has(req.body.role)) {
        return res.status(400).json({ error: 'Некорректная роль' });
      }
      patch.role = req.body.role;
    }
    if (req.body?.is_active !== undefined) {
      patch.is_active = parseBoolean(req.body.is_active);
    }
    if (req.body?.password !== undefined && String(req.body.password).length > 0) {
      if (String(req.body.password).length < 8) {
        return res.status(400).json({ error: 'Пароль должен быть не короче 8 символов' });
      }
      patch.password_hash = hashPassword(String(req.body.password));
    }

    if (req.authUser.id === id) {
      const requestedRole = patch.role ?? target.role;
      const requestedActive = patch.is_active ?? target.is_active;
      if (requestedRole !== target.role || requestedActive !== target.is_active) {
        return res.status(400).json({ error: 'Нельзя менять свою роль или статус активности' });
      }
    }

    if (target.role === 'admin') {
      const activeAdmins = await countActiveAdmins();
      const demotingAdmin = patch.role && patch.role !== 'admin';
      const deactivatingAdmin = patch.is_active === false;

      if (demotingAdmin && activeAdmins <= 1) {
        return res.status(400).json({ error: 'Нельзя убрать последнего активного админа' });
      }
      if (deactivatingAdmin && activeAdmins <= 1) {
        return res.status(400).json({ error: 'Нельзя отключить последнего активного админа' });
      }
    }

    const updated = await updateUser(id, patch);
    return res.json(updated);
  } catch (error) {
    if (error?.code === '23505') {
      return res.status(409).json({ error: 'Пользователь с таким email уже существует' });
    }
    return res.status(500).json({ error: 'Не удалось обновить пользователя', detail: error.message });
  }
});

router.delete('/users/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const id = String(req.params.id || '').trim();
    const target = await getUserById(id);
    if (!target) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    if (req.authUser.id === id) {
      return res.status(400).json({ error: 'Нельзя удалить собственную учетную запись' });
    }

    if (target.role === 'admin') {
      const totalAdmins = await countAdmins();
      if (totalAdmins <= 1) {
        return res.status(400).json({ error: 'Нельзя удалить последнего администратора' });
      }
    }

    await deleteSessionsByUserId(id);
    const deleted = await deleteUserById(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    return res.json({ deleted: true, id });
  } catch (error) {
    return res.status(500).json({ error: 'Не удалось удалить пользователя', detail: error.message });
  }
});

export const authRouter = router;
