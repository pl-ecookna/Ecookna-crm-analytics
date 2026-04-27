import crypto from 'crypto';

const PASSWORD_ALGORITHM = 'scrypt';
const KEY_LENGTH = 64;

export const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(password), salt, KEY_LENGTH).toString('hex');
  return `${PASSWORD_ALGORITHM}$${salt}$${hash}`;
};

export const verifyPassword = (password, storedHash) => {
  const [algorithm, salt, hash] = String(storedHash || '').split('$');
  if (algorithm !== PASSWORD_ALGORITHM || !salt || !hash) return false;

  const computed = crypto.scryptSync(String(password), salt, KEY_LENGTH);
  const stored = Buffer.from(hash, 'hex');

  if (stored.length !== computed.length) return false;

  return crypto.timingSafeEqual(stored, computed);
};
