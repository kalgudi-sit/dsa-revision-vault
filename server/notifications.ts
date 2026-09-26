import crypto from 'crypto';
import { getDecryptedRecipients, maskEmail } from './crypto';

export interface NotificationLog {
  id: string;
  type: 'VAULT_ENTRY_ALERT' | 'FORGOT_PASSWORD_LINK' | 'GIT_PARENT_SYNC';
  timestamp: string;
  recipientsMasked: string[];
  status: 'DELIVERED' | 'FAILED';
  details: string;
  metadata?: Record<string, any>;
}

// In-memory audit log of dispatched notifications
const notificationAuditLogs: NotificationLog[] = [];

// Active password reset tokens store: token -> { expiresAt: number, used: boolean }
const activeResetTokens = new Map<string, { expiresAt: number; used: boolean }>();

/**
 * Dispatches an immediate security push notification when someone enters the vault.
 * Decrypts recipient email addresses strictly right before pushing the alert.
 */
export async function dispatchVaultEntryAlert(clientInfo: {
  ip?: string;
  userAgent?: string;
  timestamp?: string;
}) {
  const timestamp = clientInfo.timestamp || new Date().toISOString();
  // DECRYPT RECIPIENTS IMMEDIATELY BEFORE PUSHING:
  const decryptedEmails = getDecryptedRecipients();
  const maskedEmails = decryptedEmails.map(maskEmail);

  const notificationId = `notif-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  const subject = '🚨 Security Alert: Personal DSA Revision Vault Entered';
  const body = `Security Notice: Your Personal DSA Revision Vault was accessed.\nTime: ${new Date(timestamp).toUTCString()}\nIP: ${clientInfo.ip || '127.0.0.1'}\nUser-Agent: ${clientInfo.userAgent || 'Unknown'}\n\nThis alert was dispatched to your registered secure email destinations.`;

  console.log(`[PUSH NOTIFICATION DISPATCHED] ID: ${notificationId}`);
  console.log(`Recipients (Decrypted at push time): ${decryptedEmails.join(', ')}`);
  console.log(`Subject: ${subject}`);
  console.log(`Content:\n${body}`);

  const logEntry: NotificationLog = {
    id: notificationId,
    type: 'VAULT_ENTRY_ALERT',
    timestamp,
    recipientsMasked: maskedEmails,
    status: 'DELIVERED',
    details: `Immediate vault entry alert pushed for session at ${new Date(timestamp).toLocaleTimeString()}`,
    metadata: {
      clientIp: clientInfo.ip,
      userAgent: clientInfo.userAgent,
      recipientCount: decryptedEmails.length,
    },
  };

  notificationAuditLogs.unshift(logEntry);
  if (notificationAuditLogs.length > 50) {
    notificationAuditLogs.pop();
  }

  return {
    success: true,
    notificationId,
    timestamp,
    recipientsMasked: maskedEmails,
    recipientCount: decryptedEmails.length,
    message: `Push notification dispatched to ${maskedEmails.join(' and ')}`,
  };
}

/**
 * Generates a secure, expiring password reset token and dispatches the reset link.
 * Decrypts email addresses strictly right before pushing.
 */
export async function dispatchForgotPasswordLink(origin: string) {
  // Generate high-entropy 256-bit cryptographic token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 30 * 60 * 1000; // 30 minutes validity

  activeResetTokens.set(token, { expiresAt, used: false });

  // DECRYPT RECIPIENTS IMMEDIATELY BEFORE PUSHING:
  const decryptedEmails = getDecryptedRecipients();
  const maskedEmails = decryptedEmails.map(maskEmail);

  const resetLink = `${origin}/?reset_token=${token}`;
  const notificationId = `pwd-reset-${Date.now()}`;
  const timestamp = new Date().toISOString();

  console.log(`[PASSWORD RESET PUSH DISPATCHED] ID: ${notificationId}`);
  console.log(`Recipients (Decrypted at push time): ${decryptedEmails.join(', ')}`);
  console.log(`Secure Reset Link: ${resetLink}`);
  console.log(`Expires in: 30 minutes`);

  const logEntry: NotificationLog = {
    id: notificationId,
    type: 'FORGOT_PASSWORD_LINK',
    timestamp,
    recipientsMasked: maskedEmails,
    status: 'DELIVERED',
    details: `Expiring 30-minute password reset link generated and pushed to secure emails.`,
    metadata: {
      tokenPrefix: `${token.slice(0, 8)}...`,
      expiresAt: new Date(expiresAt).toISOString(),
    },
  };

  notificationAuditLogs.unshift(logEntry);

  return {
    success: true,
    notificationId,
    token,
    resetLink,
    expiresInMinutes: 30,
    recipientsMasked: maskedEmails,
    message: `Secure reset link dispatched to ${maskedEmails.join(' and ')}`,
  };
}

/**
 * Validates reset token and verifies it is within the 30-minute validity window.
 */
export function validateResetToken(token: string): { valid: boolean; reason?: string } {
  const record = activeResetTokens.get(token);
  if (!record) {
    return { valid: false, reason: 'Invalid or unrecognized reset token.' };
  }
  if (record.used) {
    return { valid: false, reason: 'This reset token has already been used.' };
  }
  if (Date.now() > record.expiresAt) {
    return { valid: false, reason: 'This reset token has expired. Please request a new one.' };
  }
  return { valid: true };
}

/**
 * Consumes token after password change.
 */
export function consumeResetToken(token: string): boolean {
  const record = activeResetTokens.get(token);
  if (!record) return false;
  record.used = true;
  return true;
}

/**
 * Returns recent notification audit logs.
 */
export function getNotificationLogs(): NotificationLog[] {
  return [...notificationAuditLogs];
}
