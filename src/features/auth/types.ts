import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  passwordHash: z.string(),
  createdAt: z.string(),
});

export type User = z.infer<typeof UserSchema>;

export const PasswordResetTokenSchema = z.object({
  id: z.string(),
  token: z.string(),
  userId: z.string(),
  userEmail: z.string().email(),
  expiresAt: z.string(),
  usedAt: z.string().nullable(),
  createdAt: z.string(),
});

export type PasswordResetToken = z.infer<typeof PasswordResetTokenSchema>;

export const LoginInputSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginInput = z.infer<typeof LoginInputSchema>;

export const ForgotPasswordInputSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordInputSchema>;

export const ResetPasswordInputSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

export type ResetPasswordInput = z.infer<typeof ResetPasswordInputSchema>;

export type AuthResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
