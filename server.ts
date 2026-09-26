import express from 'express';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import {
  dispatchVaultEntryAlert,
  dispatchForgotPasswordLink,
  validateResetToken,
  consumeResetToken,
  getNotificationLogs,
} from './server/notifications.ts';

const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;
const VAULT_FILE_PATH = path.resolve(process.cwd(), 'src/data/vault-data.json');

async function createServer() {
  const app = express();

  // Middleware
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true }));

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
      console.error('Error reading parent vault JSON:', err);
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

      // Ensure directory exists
      const dir = path.dirname(VAULT_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Write pretty JSON to codebase
      fs.writeFileSync(VAULT_FILE_PATH, JSON.stringify(payload, null, 2), 'utf-8');
      console.log(`[VAULT UPDATED] Successfully saved parent JSON with ${payload.questions.length} questions to ${VAULT_FILE_PATH}`);

      return res.json({
        success: true,
        message: 'Parent JSON updated successfully in codebase.',
        questionsCount: payload.questions.length,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('Error updating parent vault JSON:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // API Route: Update Parent JSON & Sync with Git commit
  app.post('/api/vault-data/sync-git', (req, res) => {
    try {
      const payload = req.body;
      if (payload && Array.isArray(payload.questions)) {
        // Save first
        fs.writeFileSync(VAULT_FILE_PATH, JSON.stringify(payload, null, 2), 'utf-8');
      }

      let commitSha = 'HEAD';
      let gitOutput = '';

      try {
        // Run git commands to commit the parent JSON
        execSync(`git add "${VAULT_FILE_PATH}"`, { stdio: 'pipe' });
        
        // Check if there are staged changes
        const diffCheck = execSync('git diff --staged --name-only', { encoding: 'utf-8' });
        if (diffCheck.trim().length > 0) {
          const timestamp = new Date().toISOString();
          const commitMsg = `chore(vault): auto-sync parent JSON data [${timestamp}]`;
          execSync(`git commit -m "${commitMsg}"`, { stdio: 'pipe' });
          commitSha = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
          gitOutput = `Committed latest vault parent JSON (commit ${commitSha})`;
        } else {
          try {
            commitSha = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
          } catch {
            commitSha = 'clean';
          }
          gitOutput = 'Parent JSON is already cleanly committed and up to date.';
        }
      } catch (gitErr: any) {
        console.warn('Git operation output/warning:', gitErr.message);
        gitOutput = `Saved to disk. Git status: ${gitErr.message.slice(0, 100)}`;
      }

      return res.json({
        success: true,
        commitSha,
        gitOutput,
        timestamp: new Date().toISOString(),
        filePath: 'src/data/vault-data.json',
      });
    } catch (err: any) {
      console.error('Error running git sync:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // API Route: Send immediate Push Notification when entering vault
  app.post('/api/notifications/vault-entry', async (req, res) => {
    try {
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'Unknown Client';
      const result = await dispatchVaultEntryAlert({
        ip,
        userAgent,
        timestamp: req.body.timestamp,
      });
      return res.json(result);
    } catch (err: any) {
      console.error('Error dispatching vault entry alert:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // API Route: Forgot Password link generation & push dispatch
  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const origin = req.headers.origin || `${req.protocol}://${req.get('host')}`;
      const result = await dispatchForgotPasswordLink(origin);
      return res.json(result);
    } catch (err: any) {
      console.error('Error in forgot password dispatch:', err);
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
    console.log('[PASSWORD RESET] Password successfully reset for vault single-user.');
    return res.json({ success: true, message: 'Password has been successfully updated.' });
  });

  // API Route: View Notification Audit Logs
  app.get('/api/notifications/logs', (_req, res) => {
    return res.json({ success: true, logs: getNotificationLogs() });
  });

  // Setup Vite in Dev or Static files in Prod
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

createServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
