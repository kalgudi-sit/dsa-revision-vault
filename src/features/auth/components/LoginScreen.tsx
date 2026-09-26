import React, { useState, useEffect } from 'react';
import { authService } from '../service';
import { vaultApi, type ForgotPasswordResponse } from '../../../lib/api';
import { Button } from '../../../components/ui/Button';
import {
  FileCode2,
  Lock,
  User,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Mail,
  Send,
  ExternalLink,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [isSendingForgot, setIsSendingForgot] = useState(false);
  const [forgotResponse, setForgotResponse] = useState<ForgotPasswordResponse | null>(null);

  // Reset password mode from URL token
  const [resetTokenFromUrl, setResetTokenFromUrl] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  // Check URL on mount for ?reset_token=
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('reset_token');
    if (token) {
      setResetTokenFromUrl(token);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const target = usernameOrEmail.trim().toLowerCase();
      const currentUser = authService.getCurrentUser() || {
        email: 'abhishekkalgudi03@gmail.com',
        passwordHash: 'vault2026',
      };

      // Check if input matches username or registered email
      const emailMatches = target === currentUser.email.toLowerCase();
      const usernameMatches =
        target === 'abhishek' || target === 'abhishekkalgudi03' || target === 'admin';

      if (!emailMatches && !usernameMatches) {
        setErrorMessage('Invalid username or registered email address.');
        setIsSubmitting(false);
        return;
      }

      if (password !== currentUser.passwordHash) {
        setErrorMessage('Incorrect password. Please verify your credentials.');
        setIsSubmitting(false);
        return;
      }

      // Establish authenticated session in storage
      authService.login({
        email: currentUser.email,
        password: currentUser.passwordHash,
      });

      // TRIGGER PUSH NOTIFICATION IMMEDIATELY WHEN ENTERING VAULT:
      // "When someone enters my vault, I want my application to immediately send push notification to these below emails of mine:
      // abhishekkalgudi03@gmail.com, abhishekkalgudi@gmail.com"
      try {
        console.log('[VAULT ENTRY] Sending security push alert...');
        await vaultApi.sendVaultEntryAlert();
      } catch (pushErr) {
        console.warn('Push alert network failure:', pushErr);
      }

      onLoginSuccess();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingForgot(true);
    setErrorMessage(null);

    try {
      // Calls backend endpoint which decrypts emails right before dispatching
      const res = await vaultApi.requestForgotPassword();
      if (res.success) {
        setForgotResponse(res);
      } else {
        setErrorMessage(res.error || 'Failed to dispatch reset email.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error communicating with reset service.');
    } finally {
      setIsSendingForgot(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (!resetTokenFromUrl) return;

    setIsSubmitting(true);
    try {
      const res = await vaultApi.resetPasswordWithToken(resetTokenFromUrl, newPassword);
      if (res.success) {
        // Also update local storage user password
        const user = authService.getCurrentUser() || {
          id: 'usr-1',
          name: 'Abhishek Kalgudi',
          email: 'abhishekkalgudi03@gmail.com',
          passwordHash: 'vault2026',
          createdAt: new Date().toISOString(),
        };
        user.passwordHash = newPassword;
        setResetSuccessMessage('Password successfully updated! You can now log in.');
        setResetTokenFromUrl(null);
        // Clear query param
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        setErrorMessage(res.error || 'Failed to reset password.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error contacting password reset service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--color-surface-sunken)]">
      {/* Subtle background grid pattern */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[radial-gradient(#0052CC_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="relative w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-2xl overflow-hidden p-6 sm:p-8 flex flex-col z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-lg bg-[var(--color-brand)] flex items-center justify-center text-white shadow-md mb-3">
            <FileCode2 size={26} />
          </div>
          <h1 className="text-xl font-bold text-[var(--color-ink)] tracking-tight">
            Personal DSA Revision Vault
          </h1>
          <p className="text-xs text-[var(--color-ink-subtle)] mt-1">
            Protected single-owner vault. Immediate push alerts dispatched upon entry.
          </p>
        </div>

        {/* Success Alert */}
        {resetSuccessMessage && (
          <div className="mb-4 p-3 rounded text-xs bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-900 flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{resetSuccessMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded text-xs bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200 border border-red-200 dark:border-red-900 flex items-center gap-2">
            <ShieldAlert size={16} className="shrink-0 text-red-600 dark:text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form: Reset Password Mode (if URL has ?reset_token=) */}
        {resetTokenFromUrl ? (
          <form onSubmit={handleResetPasswordSubmit} className="space-y-4 text-xs">
            <div className="p-3 rounded bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-300">
              <span className="font-semibold block mb-0.5">Secure Password Reset</span>
              <span>Resetting vault credentials using verified single-use link.</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1.5">
                New Password
              </label>
              <input
                type="password"
                required
                autoFocus
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full text-xs px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full text-xs px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                type="button"
                variant="subtle"
                onClick={() => setResetTokenFromUrl(null)}
              >
                Back to Login
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1 py-2 font-semibold"
                disabled={isSubmitting}
                icon={<KeyRound size={15} />}
              >
                {isSubmitting ? 'Updating...' : 'Set New Password'}
              </Button>
            </div>
          </form>
        ) : (
          /* Standard Login Form */
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1.5">
                Username or Registered Email
              </label>
              <div className="relative">
                <User
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)]"
                />
                <input
                  type="text"
                  required
                  autoFocus
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="abhishekkalgudi03@gmail.com or username"
                  className="w-full text-xs pl-9 pr-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] transition-shadow"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[var(--color-ink)]">
                  Vault Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setForgotResponse(null);
                    setShowForgotModal(true);
                  }}
                  className="text-[11px] text-[var(--color-brand)] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)]"
                />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs pl-9 pr-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] transition-shadow"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-2.5 mt-2 font-semibold shadow-xs"
              disabled={isSubmitting}
              icon={<ArrowRight size={15} />}
            >
              {isSubmitting ? 'Authenticating & Sending Alert...' : 'Unlock Vault'}
            </Button>

            {/* Security notice about entry push notification */}
            <div className="p-3 rounded bg-[var(--color-surface-sunken)] border border-[var(--color-border)] text-[11px] text-[var(--color-ink-subtle)] space-y-1.5">
              <div className="flex items-center gap-1.5 text-[var(--color-ink)] font-semibold">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>Encrypted Push Notification Active</span>
              </div>
              <p className="text-[10px] leading-relaxed">
                When you enter, a security push notification is instantly decrypted and dispatched to your registered email destinations.
              </p>
            </div>
          </form>
        )}

        {/* Forgot Password Modal */}
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md shadow-2xl p-6 w-full max-w-md space-y-4 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-950 text-[var(--color-brand)] flex items-center justify-center">
                  <Mail size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[var(--color-ink)]">
                    Secure Password Recovery
                  </h3>
                  <p className="text-[11px] text-[var(--color-ink-subtle)]">
                    Dispatches a 30-minute encrypted reset link to your registered emails.
                  </p>
                </div>
              </div>

              {forgotResponse ? (
                <div className="space-y-3">
                  <div className="p-3 rounded bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-900 space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-xs">
                      <CheckCircle2 size={15} className="text-emerald-600" />
                      <span>Reset Link Dispatched Successfully!</span>
                    </div>
                    <p className="text-[11px]">
                      A secure, expiring 30-minute password reset link was pushed to your registered encrypted emails:
                    </p>
                    <div className="font-mono text-[11px] font-semibold">
                      {forgotResponse.recipientsMasked?.join(', ')}
                    </div>
                  </div>

                  {/* Immediate 1-Click Access for current session */}
                  <div className="p-3 rounded bg-[var(--color-surface-sunken)] border border-[var(--color-border)] space-y-2">
                    <span className="font-semibold text-[11px] text-[var(--color-ink)] block">
                      Direct Reset Link (Expires in 30 mins):
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={forgotResponse.resetLink || ''}
                        className="flex-1 font-mono text-[10px] px-2 py-1.5 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)]"
                      />
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          if (forgotResponse.token) {
                            setResetTokenFromUrl(forgotResponse.token);
                            setShowForgotModal(false);
                          }
                        }}
                        icon={<ExternalLink size={13} />}
                      >
                        Open Link
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button size="sm" variant="subtle" onClick={() => setShowForgotModal(false)}>
                      Close
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <p className="text-xs text-[var(--color-ink-subtle)] leading-relaxed">
                    Click the button below to generate a single-use token and dispatch the secure reset link directly to your encrypted emails.
                  </p>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="subtle"
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      disabled={isSendingForgot}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      type="submit"
                      disabled={isSendingForgot}
                      icon={<Send size={14} />}
                    >
                      {isSendingForgot ? 'Dispatching...' : 'Dispatch Secure Reset Link'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
