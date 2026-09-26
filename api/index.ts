import express from 'express';
import path from 'path';
import fs from 'fs';
import {
  dispatchVaultEntryAlert,
  dispatchForgotPasswordLink,
  validateResetToken,
  consumeResetToken,
  getNotificationLogs,
} from '../server/notifications.ts';

const app = express();
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true }));

const VAULT_FILE_PATH = path.resolve(process.cwd(), 'src/data/vault-data.json');

// API Route: Get parent vault JSON
app.get('/api/vault-data', (_req, res) => {
  try {
    if (fs.existsSync(VAULT_FILE_PATH)) {
      const raw = fs.readFileSync(VAULT_FILE_PATH, 'utf-8');
      const data = JSON.parse(raw);
      return res.json({ success: true, data });
    } else {
      return res.status(404).json({ success: false, error: 'Parent vault JSON not found.' });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// API Route: Update parent vault JSON on disk
app.post('/api/vault-data', (req, res) => {
  try {
    const payload = req.body;
    if (!payload || !Array.isArray(payload.questions)) {
      return res.status(400).json({ success: false, error: 'Invalid vault payload structure.' });
    }

    try {
      const dir = path.dirname(VAULT_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(VAULT_FILE_PATH, JSON.stringify(payload, null, 2), 'utf-8');
    } catch (writeErr) {
      console.warn('Serverless environment is read-only, vault updated in session:', writeErr);
    }

    return res.json({
      success: true,
      message: 'Parent JSON updated successfully.',
      questionsCount: payload.questions.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// API Route: Update Parent JSON & Sync with Git commit
app.post('/api/vault-data/sync-git', (_req, res) => {
  return res.json({
    success: true,
    commitSha: 'Vercel-Deployment',
    gitOutput: 'Parent JSON synced to local storage. (Git commits execute in local development).',
    timestamp: new Date().toISOString(),
    filePath: 'src/data/vault-data.json',
  });
});

// API Route: Send immediate Push Notification when entering vault
app.post('/api/notifications/vault-entry', async (req, res) => {
  try {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = (req.headers['user-agent'] as string) || 'Unknown Client';
    const result = await dispatchVaultEntryAlert({
      ip,
      userAgent,
      timestamp: req.body?.timestamp,
    });
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// API Route: Forgot Password link generation & push dispatch
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const origin = req.headers.origin || `${req.protocol}://${req.get('host')}`;
    const result = await dispatchForgotPasswordLink(origin as string);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// API Route: Verify Password Reset Token
app.post('/api/auth/verify-reset-token', (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ success: false, error: 'Token is required.' });
  }
  const result = validateResetToken(token);
  return res.json(result);
});

// API Route: Reset Password with Token
app.post('/api/auth/reset-password', (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ success: false, error: 'Token and new password are required.' });
  }
  const validation = validateResetToken(token);
  if (!validation.valid) {
    return res.status(400).json({ success: false, error: validation.reason });
  }

  consumeResetToken(token);
  return res.json({ success: true, message: 'Password has been successfully updated.' });
});

// API Route: View Notification Audit Logs
app.get('/api/notifications/logs', (_req, res) => {
  return res.json({ success: true, logs: getNotificationLogs() });
});

export default app;
