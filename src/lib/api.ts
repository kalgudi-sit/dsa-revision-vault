import { type VaultBackup } from './storage';

export interface GitSyncResult {
  success: boolean;
  commitSha?: string;
  gitOutput?: string;
  timestamp?: string;
  filePath?: string;
  error?: string;
}

export interface NotificationResponse {
  success: boolean;
  notificationId?: string;
  timestamp?: string;
  recipientsMasked?: string[];
  message?: string;
  error?: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  notificationId?: string;
  token?: string;
  resetLink?: string;
  expiresInMinutes?: number;
  recipientsMasked?: string[];
  message?: string;
  error?: string;
}

export const vaultApi = {
  /**
   * Fetches latest parent JSON from the codebase
   */
  async getParentVaultData(): Promise<VaultBackup | null> {
    try {
      const res = await fetch('/api/vault-data');
      if (!res.ok) return null;
      const json = await res.json();
      return json.success ? json.data : null;
    } catch (e) {
      console.warn('Could not fetch parent vault data from server:', e);
      return null;
    }
  },

  /**
   * Updates parent JSON in the codebase
   */
  async updateParentVaultData(backup: VaultBackup): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await fetch('/api/vault-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backup),
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  },

  /**
   * Directly updates parent JSON and runs git commit command
   */
  async syncParentJsonWithGit(backup: VaultBackup): Promise<GitSyncResult> {
    try {
      const res = await fetch('/api/vault-data/sync-git', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backup),
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  /**
   * Sends immediate push notification alert when entering vault.
   * Decrypts recipient email addresses strictly right before pushing.
   */
  async sendVaultEntryAlert(): Promise<NotificationResponse> {
    try {
      const res = await fetch('/api/notifications/vault-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timestamp: new Date().toISOString() }),
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  /**
   * Generates a 30-minute secure token and dispatches reset link to decrypted emails
   */
  async requestForgotPassword(): Promise<ForgotPasswordResponse> {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  /**
   * Resets password using token
   */
  async resetPasswordWithToken(token: string, newPassword: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },
};
