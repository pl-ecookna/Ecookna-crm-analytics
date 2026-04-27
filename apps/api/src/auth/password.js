import crypto from 'crypto';

const PASSWORD_ALGORITHM = 'scrypt';
const KEY_LENGTH = 64;
const PASSWORD_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*-_';
const PASSWORD_LENGTH = 14;

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

export const generatePassword = (length = PASSWORD_LENGTH) => {
  const size = Math.max(10, Number(length) || PASSWORD_LENGTH);
  let password = '';

  for (let i = 0; i < size; i += 1) {
    const byte = crypto.randomBytes(1)[0];
    password += PASSWORD_ALPHABET[byte % PASSWORD_ALPHABET.length];
  }

  return password;
};
