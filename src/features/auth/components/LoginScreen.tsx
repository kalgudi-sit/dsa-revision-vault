import React, { useState } from 'react';
import { authService } from '../service';
import { Button } from '../../../components/ui/Button';
import { FileCode2, KeyRound, Lock, User, ArrowRight, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const target = usernameOrEmail.trim().toLowerCase();
    const currentUser = authService.getCurrentUser() || {
      email: 'abhishekkalgudi03@gmail.com',
      passwordHash: 'vault2026',
    };

    // Check if input matches username or email
    const emailMatches = target === currentUser.email.toLowerCase();
    const usernameMatches = target === 'abhishek' || target === 'abhishekkalgudi03' || target === 'admin';

    if (!emailMatches && !usernameMatches) {
      setErrorMessage('Invalid username or email address.');
      return;
    }

    if (password !== currentUser.passwordHash) {
      setErrorMessage('Incorrect password. Please verify your credentials.');
      return;
    }

    // Set authenticated session in storage
    authService.login({
      email: currentUser.email,
      password: currentUser.passwordHash,
    });

    onLoginSuccess();
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = authService.requestPasswordReset({ email: forgotEmail });
    if (!res.success) {
      setErrorMessage(res.error);
    } else {
      setForgotSuccess(`Password reset link created for ${forgotEmail}: Token: ${res.data.resetToken}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--color-surface-sunken)]">
      {/* Decorative background grid pattern */}
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
            Protected single-user vault. Please log in to access your problem repository.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded text-xs bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200 border border-red-200 dark:border-red-900 flex items-center gap-2">
            <ShieldAlert size={16} className="shrink-0 text-red-600 dark:text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1.5">
              Username or Registered Email
            </label>
            <div className="relative">
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)]" />
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
                  setForgotEmail(usernameOrEmail || 'abhishekkalgudi03@gmail.com');
                  setShowForgotModal(true);
                }}
                className="text-[11px] text-[var(--color-brand)] hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)]" />
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
            icon={<ArrowRight size={15} />}
          >
            Unlock Vault
          </Button>

          {/* Quick Credential Hint for the single owner */}
          <div className="p-2.5 rounded bg-[var(--color-surface-sunken)] border border-[var(--color-border)] text-[11px] text-[var(--color-ink-subtle)] space-y-1">
            <div className="flex items-center justify-between">
              <span>Single User:</span>
              <strong className="text-[var(--color-ink)] font-mono">abhishekkalgudi03@gmail.com</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Default Key:</span>
              <strong className="text-[var(--color-ink)] font-mono">vault2026</strong>
            </div>
          </div>
        </form>

        {/* Forgot Password Modal */}
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md shadow-xl p-5 w-full max-w-sm space-y-3 text-xs">
              <h3 className="font-semibold text-sm text-[var(--color-ink)]">Reset Vault Access</h3>
              <p className="text-[var(--color-ink-subtle)]">
                Enter your Gmail to send a single-use 30-minute token.
              </p>
              {forgotSuccess ? (
                <div className="p-2.5 rounded bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-200 text-xs">
                  {forgotSuccess}
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-3">
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full text-xs px-3 py-1.5 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)]"
                  />
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="subtle" onClick={() => setShowForgotModal(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" variant="primary" type="submit">
                      Send Token
                    </Button>
                  </div>
                </form>
              )}
              {forgotSuccess && (
                <div className="flex justify-end">
                  <Button size="sm" variant="primary" onClick={() => setShowForgotModal(false)}>
                    Done
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
