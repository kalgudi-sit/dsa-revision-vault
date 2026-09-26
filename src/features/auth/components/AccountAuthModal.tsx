import React, { useState } from 'react';
import { authService } from '../service';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { KeyRound, Mail, CheckCircle2, ShieldCheck, AlertCircle, Copy, Check } from 'lucide-react';

interface AccountAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AccountAuthModal({ isOpen, onClose }: AccountAuthModalProps) {
  const currentUser = authService.getCurrentUser();
  const [activeTab, setActiveTab] = useState<'profile' | 'forgot' | 'reset'>('profile');

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState(currentUser?.email || 'abhishekkalgudi03@gmail.com');
  const [generatedReset, setGeneratedReset] = useState<{
    token: string;
    expiresAt: string;
    resetUrl: string;
  } | null>(null);
  const [forgotMsg, setForgotMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Reset password state
  const [resetTokenInput, setResetTokenInput] = useState('');
  const [resetNewPass, setResetNewPass] = useState('');
  const [resetMsg, setResetMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (currentUser.passwordHash !== currentPassword) {
      setPasswordMsg({ type: 'error', text: 'Current password does not match.' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }

    currentUser.passwordHash = newPassword;
    setPasswordMsg({ type: 'success', text: 'Password successfully changed!' });
    setCurrentPassword('');
    setNewPassword('');
  };

  const handleRequestReset = (e: React.FormEvent) => {
    e.preventDefault();
    const result = authService.requestPasswordReset({ email: forgotEmail });
    if (!result.success) {
      setForgotMsg({ type: 'error', text: result.error });
      setGeneratedReset(null);
    } else {
      setGeneratedReset({
        token: result.data.resetToken,
        expiresAt: result.data.expiresAt,
        resetUrl: result.data.resetUrl,
      });
      setResetTokenInput(result.data.resetToken);
      setForgotMsg({
        type: 'success',
        text: `Secure reset link generated and simulated for ${forgotEmail}. Expires in 30 minutes.`,
      });
    }
  };

  const handleExecuteReset = (e: React.FormEvent) => {
    e.preventDefault();
    const result = authService.resetPassword({
      token: resetTokenInput.trim(),
      newPassword: resetNewPass,
    });

    if (!result.success) {
      setResetMsg({ type: 'error', text: result.error });
    } else {
      setResetMsg({ type: 'success', text: 'Password successfully reset! You can now log in with the new password.' });
      setResetNewPass('');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Single-User Vault Account & Security"
      subtitle="Credentials, password recovery, and email reset flow."
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex border-b border-[var(--color-border)] text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'profile'
                ? 'border-[var(--color-brand)] text-[var(--color-brand)] font-semibold'
                : 'border-transparent text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)]'
            }`}
          >
            Account Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('forgot')}
            className={`px-3 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'forgot'
                ? 'border-[var(--color-brand)] text-[var(--color-brand)] font-semibold'
                : 'border-transparent text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)]'
            }`}
          >
            Forgot Password (Email Link)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reset')}
            className={`px-3 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'reset'
                ? 'border-[var(--color-brand)] text-[var(--color-brand)] font-semibold'
                : 'border-transparent text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)]'
            }`}
          >
            Apply Token Reset
          </button>
        </div>

        {/* Tab 1: Profile & Direct Change */}
        {activeTab === 'profile' && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-[var(--color-surface-sunken)] rounded border border-[var(--color-border)] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-ink-subtle)]">Registered Vault Owner:</span>
                <span className="font-semibold text-[var(--color-ink)]">
                  {currentUser?.name || 'Abhishek Kalgudi'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-ink-subtle)]">Recovery Gmail:</span>
                <span className="font-mono text-[var(--color-ink)]">
                  {currentUser?.email || 'abhishekkalgudi03@gmail.com'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-ink-subtle)]">Cost per month:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  ₹0 (Forever free single user)
                </span>
              </div>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-3">
              <h4 className="font-semibold text-[var(--color-ink)] flex items-center gap-1.5">
                <KeyRound size={13} className="text-[var(--color-brand)]" />
                Change Vault Password
              </h4>

              {passwordMsg && (
                <div
                  className={`p-2 rounded text-xs ${
                    passwordMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300'
                  }`}
                >
                  {passwordMsg.text}
                </div>
              )}

              <div>
                <label className="block text-[var(--color-ink-subtle)] mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password (default: vault2026)"
                  className="w-full text-xs px-3 py-1.5 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                />
              </div>

              <div>
                <label className="block text-[var(--color-ink-subtle)] mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full text-xs px-3 py-1.5 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                />
              </div>

              <div className="flex justify-end pt-1">
                <Button size="sm" variant="primary" type="submit">
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Forgot Password Flow */}
        {activeTab === 'forgot' && (
          <form onSubmit={handleRequestReset} className="space-y-3 text-xs">
            <p className="text-[var(--color-ink-subtle)]">
              Per PRD §5.1, submit your Gmail address to generate an authenticated, 30-minute expiring secure reset token.
            </p>

            {forgotMsg && (
              <div
                className={`p-2.5 rounded text-xs flex items-start gap-2 ${
                  forgotMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300'
                }`}
              >
                <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
                <span>{forgotMsg.text}</span>
              </div>
            )}

            <div>
              <label className="block text-[var(--color-ink-subtle)] mb-1">Your Registered Gmail</label>
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full text-xs px-3 py-1.5 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
              />
            </div>

            <Button size="sm" variant="primary" type="submit" icon={<Mail size={14} />}>
              Send Secure Reset Link
            </Button>

            {generatedReset && (
              <div className="p-3 bg-[var(--color-surface-sunken)] rounded border border-[var(--color-border)] space-y-2 mt-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[var(--color-ink)]">
                    Simulated Email Dispatch (Resend API)
                  </span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">
                    Expires in 30 min
                  </span>
                </div>
                <div className="p-2 bg-[var(--color-surface)] rounded border border-[var(--color-border)] font-mono text-[11px] break-all select-all flex items-center justify-between gap-2">
                  <span>{generatedReset.resetUrl}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedReset.resetUrl);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    className="p-1 text-[var(--color-ink-subtle)] hover:text-[var(--color-brand)] shrink-0"
                    title="Copy Link"
                  >
                    {copiedLink ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  </button>
                </div>
                <p className="text-[11px] text-[var(--color-ink-subtle)]">
                  Token: <code className="font-mono text-[var(--color-brand)]">{generatedReset.token}</code>. Switch to the "Apply Token Reset" tab to test setting a new password.
                </p>
              </div>
            )}
          </form>
        )}

        {/* Tab 3: Apply Token Reset */}
        {activeTab === 'reset' && (
          <form onSubmit={handleExecuteReset} className="space-y-3 text-xs">
            <p className="text-[var(--color-ink-subtle)]">
              Validate token and set a fresh password for your vault.
            </p>

            {resetMsg && (
              <div
                className={`p-2 rounded text-xs ${
                  resetMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300'
                }`}
              >
                {resetMsg.text}
              </div>
            )}

            <div>
              <label className="block text-[var(--color-ink-subtle)] mb-1">Reset Token</label>
              <input
                type="text"
                required
                value={resetTokenInput}
                onChange={(e) => setResetTokenInput(e.target.value)}
                placeholder="rst_..."
                className="w-full font-mono text-xs px-3 py-1.5 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
              />
            </div>

            <div>
              <label className="block text-[var(--color-ink-subtle)] mb-1">New Password</label>
              <input
                type="password"
                required
                value={resetNewPass}
                onChange={(e) => setResetNewPass(e.target.value)}
                placeholder="Enter your new password"
                className="w-full text-xs px-3 py-1.5 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button size="sm" variant="primary" type="submit" icon={<ShieldCheck size={14} />}>
                Confirm Password Reset
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
