import crypto from 'crypto';

// Master decryption key and initialization vector for AES-256-CBC
const CIPHER_KEY = crypto.createHash('sha256').update('dsa-vault-master-key-2026').digest();
const CIPHER_IV = Buffer.from('1234567890123456', 'utf8');

// Encrypted recipients (plain text email addresses are NEVER stored in code or files)
export const ENCRYPTED_RECIPIENTS = [
  '06af851afbf27cc940da2aa862a4cd9e6c88ffca8e834d0234af5169abede1f9',
  '42a8c0889d6f21a722464969724352bca2161a3de83849f59bed9c3b7f9ae2b1',
];

/**
 * Decrypts an encrypted recipient cipher string using AES-256-CBC.
 * This is executed ONLY in the notification dispatcher right before pushing the notification.
 */
export function decryptRecipient(encryptedHex: string): string {
  try {
    const decipher = crypto.createDecipheriv('aes-256-cbc', CIPHER_KEY, CIPHER_IV);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Failed to decrypt recipient cipher:', error);
    throw new Error('Cryptographic decryption failed for notification recipient.');
  }
}

/**
 * Retrieves the live decrypted email addresses strictly at dispatch time.
 */
export function getDecryptedRecipients(): string[] {
  return ENCRYPTED_RECIPIENTS.map((cipher) => decryptRecipient(cipher));
}

/**
 * Masks an email for safe client logs (e.g. "abh****3@gmail.com")
 */
export function maskEmail(email: string): string {
  const parts = email.split('@');
  if (parts.length !== 2) return '***@***';
  const name = parts[0];
  const domain = parts[1];
  if (name.length <= 3) {
    return `${name.slice(0, 1)}***@${domain}`;
  }
  return `${name.slice(0, 3)}***${name.slice(-1)}@${domain}`;
}
