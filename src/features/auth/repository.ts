import { type User, type PasswordResetToken } from './types';
import { vaultStorage, INITIAL_USER } from '../../lib/storage';

export interface IAuthRepository {
  getUser(): User;
  saveUser(user: User): void;
  getResetTokens(): PasswordResetToken[];
  saveResetToken(token: PasswordResetToken): void;
  markTokenUsed(tokenId: string): void;
  getSession(): { email: string; token: string } | null;
  setSession(session: { email: string; token: string } | null): void;
}

export class LocalAuthRepository implements IAuthRepository {
  getUser(): User {
    return vaultStorage.getUser();
  }

  saveUser(user: User): void {
    vaultStorage.setUser(user);
  }

  getResetTokens(): PasswordResetToken[] {
    return vaultStorage.getResetTokens();
  }

  saveResetToken(token: PasswordResetToken): void {
    vaultStorage.saveResetToken(token);
  }

  markTokenUsed(tokenId: string): void {
    vaultStorage.markTokenUsed(tokenId);
  }

  getSession(): { email: string; token: string } | null {
    return vaultStorage.getAuthSession();
  }

  setSession(session: { email: string; token: string } | null): void {
    vaultStorage.setAuthSession(session);
  }
}

export const authRepository = new LocalAuthRepository();
