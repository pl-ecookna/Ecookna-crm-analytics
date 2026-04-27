import {
  getActiveUserBySessionHash,
  updateSessionLastUsed,
} from '../db/authDb.js';
import {
  buildClearAuthCookie,
  getSessionTokenFromRequest,
  hashSessionToken,
} from '../auth/session.js';

const clearAuthCookie = (res) => {
  res.setHeader('Set-Cookie', buildClearAuthCookie());
};

export const requireAuth = async (req, res, next) => {
  try {
    const token = getSessionTokenFromRequest(req);
    if (!token) {
      clearAuthCookie(res);
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const tokenHash = hashSessionToken(token);
    const user = await getActiveUserBySessionHash(tokenHash);
    if (!user) {
      clearAuthCookie(res);
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.authUser = user;
    req.authSessionHash = tokenHash;

    void updateSessionLastUsed(tokenHash).catch(() => {});

    return next();
  } catch (error) {
    return res.status(500).json({ error: 'Failed to authenticate', detail: error.message });
  }
};

export const requireRole = (role) => (req, res, next) => {
  const user = req.authUser;
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (user.role !== role) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  return next();
};
