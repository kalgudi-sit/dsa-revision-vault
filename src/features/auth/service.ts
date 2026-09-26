import {
  LoginInputSchema,
  ForgotPasswordInputSchema,
  ResetPasswordInputSchema,
  type User,
  type LoginInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
  type PasswordResetToken,
  type AuthResult,
} from './types';
import { authRepository, type IAuthRepository } from './repository';

export class AuthService {
  constructor(private repo: IAuthRepository = authRepository) {}

  getCurrentUser(): User | null {
    const session = this.repo.getSession();
    if (!session) return null;
    const user = this.repo.getUser();
    return user.email.toLowerCase() === session.email.toLowerCase() ? user : null;
  }

  login(input: LoginInput): AuthResult<User> {
    const parsed = LoginInputSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid credentials' };
    }

    const user = this.repo.getUser();
    if (
      user.email.toLowerCase() !== parsed.data.email.toLowerCase() ||
      user.passwordHash !== parsed.data.password
    ) {
      return { success: false, error: 'Invalid email or password' };
    }

    this.repo.setSession({
      email: user.email,
      token: `session-${Date.now()}`,
    });

    return { success: true, data: user };
  }

  logout(): void {
    this.repo.setSession(null);
  }

  requestPasswordReset(input: ForgotPasswordInput): AuthResult<{ resetToken: string; expiresAt: string; resetUrl: string }> {
    const parsed = ForgotPasswordInputSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: 'Please enter a valid email address' };
    }

    const user = this.repo.getUser();
    if (user.email.toLowerCase() !== parsed.data.email.toLowerCase()) {
      // In production we return generic success, but for local vault personal feedback:
      return { success: false, error: 'No account registered with that email address.' };
    }

    const tokenString = 'rst_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes

    const tokenRecord: PasswordResetToken = {
      id: `tok-${Date.now()}`,
      token: tokenString,
      userId: user.id,
      userEmail: user.email,
      expiresAt,
      usedAt: null,
      createdAt: new Date().toISOString(),
    };

    this.repo.saveResetToken(tokenRecord);

    const resetUrl = `${window.location.origin}/#reset-token=${tokenString}`;

    return {
      success: true,
      data: {
        resetToken: tokenString,
        expiresAt,
        resetUrl,
      },
    };
  }

  resetPassword(input: ResetPasswordInput): AuthResult<boolean> {
    const parsed = ResetPasswordInputSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid password reset' };
    }

    const tokens = this.repo.getResetTokens();
    const tokenRecord = tokens.find((t) => t.token === parsed.data.token);

    if (!tokenRecord) {
      return { success: false, error: 'Invalid reset token' };
    }

    if (tokenRecord.usedAt) {
      return { success: false, error: 'This reset token has already been used' };
    }

    if (new Date(tokenRecord.expiresAt).getTime() < Date.now()) {
      return { success: false, error: 'This reset token has expired (30-minute limit exceeded)' };
    }

    const user = this.repo.getUser();
    user.passwordHash = parsed.data.newPassword;
    this.repo.saveUser(user);
    this.repo.markTokenUsed(tokenRecord.id);

    return { success: true, data: true };
  }
}

export const authService = new AuthService();
