import crypto from 'crypto';

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'ecookna_session';
const SESSION_DAYS = Number.isFinite(Number(process.env.AUTH_SESSION_DAYS))
  ? Number(process.env.AUTH_SESSION_DAYS)
  : 7;

export const getAuthCookieName = () => COOKIE_NAME;

export const createSessionToken = () => crypto.randomBytes(32).toString('base64url');

export const hashSessionToken = (token) =>
  crypto.createHash('sha256').update(String(token)).digest('hex');

export const getSessionMaxAgeSeconds = () => Math.max(1, SESSION_DAYS) * 24 * 60 * 60;

export const parseCookies = (cookieHeader = '') => {
  const cookies = {};
  String(cookieHeader)
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .forEach((part) => {
      const separatorIndex = part.indexOf('=');
      if (separatorIndex === -1) return;
      const name = part.slice(0, separatorIndex).trim();
      const value = part.slice(separatorIndex + 1).trim();
      cookies[name] = decodeURIComponent(value);
    });
  return cookies;
};

export const getSessionTokenFromRequest = (req) => {
  const cookies = parseCookies(req.headers.cookie || '');
  return cookies[COOKIE_NAME] || null;
};

export const buildAuthCookie = (token) => {
  const maxAge = getSessionMaxAgeSeconds();
  const parts = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    'HttpOnly',
    'Path=/',
    'SameSite=Lax',
    `Max-Age=${maxAge}`,
  ];

  if (process.env.NODE_ENV === 'production') {
    parts.push('Secure');
  }

  return parts.join('; ');
};

export const buildClearAuthCookie = () => {
  const parts = [
    `${COOKIE_NAME}=`,
    'HttpOnly',
    'Path=/',
    'SameSite=Lax',
    'Max-Age=0',
  ];

  if (process.env.NODE_ENV === 'production') {
    parts.push('Secure');
  }

  return parts.join('; ');
};
