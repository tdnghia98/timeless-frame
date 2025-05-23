import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.REFRESH_TOKEN_ENCRYPTION_KEY || '';
const IV_LENGTH = 16; // AES block size

export function encrypt(text: string): string {
  if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 32) {
    throw new Error('Encryption key must be 32 characters (256 bits)');
  }
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text: string): string {
  if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 32) {
    throw new Error('Encryption key must be 32 characters (256 bits)');
  }
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

// Utility to check if a Google API error is due to an invalid/expired refresh token
export function isInvalidGrantError(error: any): boolean {
  // Google returns 'invalid_grant' for expired/revoked refresh tokens
  if (!error) return false;
  if (error.response && error.response.data && error.response.data.error === 'invalid_grant') return true;
  if (error.message && error.message.includes('invalid_grant')) return true;
  return false;
}
