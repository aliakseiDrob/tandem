import { inject, Injectable } from '@angular/core';
import { TndmAuthStateStoreService } from '@auth/tndm-auth-state-store-service';
import { TndmAuthApiService } from '@auth/tndm-auth-api-service';
import { AuthError, User } from '@supabase/supabase-js';
import { handleSupabaseAuthError } from '@auth/helpers/supabase-error-messages';
import { AuthProvider } from '@auth/types/types';

@Injectable({
  providedIn: 'root',
})
export class TndmAuthService {
  private readonly authState: TndmAuthStateStoreService = inject(TndmAuthStateStoreService);
  private readonly authApi: TndmAuthApiService = inject(TndmAuthApiService);

  get isAuthenticated(): boolean {
    return this.authState.isAuthenticated();
  }

  async initSession(): Promise<void> {
    return this.authState.initSession();
  }

  async register(username: string, email: string, password: string): Promise<User | null> {
    return this.withErrorHandling((): Promise<User | null> => this.authApi.register(username, email, password));
  }

  async login(username: string, password: string): Promise<User | null> {
    return this.withErrorHandling((): Promise<User | null> => this.authApi.login(username, password));
  }

  async logout(): Promise<void | null> {
    return this.withErrorHandling((): Promise<void> => this.authApi.logout());
  }

  async signWithOAuth(provider: AuthProvider): Promise<void | null> {
    return this.withErrorHandling((): Promise<void> => this.authApi.signWithOAuth(provider));
  }

  async sendPasswordResetEmail(email: string): Promise<boolean> {
    const response: boolean | null = await this.withErrorHandling(
      (): Promise<boolean> => this.authApi.sendPasswordResetEmail(email)
    );

    return response !== null;
  }

  async updatePassword(password: string): Promise<boolean> {
    const response: boolean | null = await this.withErrorHandling(
      (): Promise<boolean> => this.authApi.updatePassword(password)
    );

    return response !== null;
  }

  private async withErrorHandling<T>(fn: () => Promise<T>): Promise<T | null> {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof AuthError) {
        throw new Error(handleSupabaseAuthError(error));
      }

      if (error instanceof Error) {
        throw error;
      }

      throw new Error('Something went wrong');
    }
  }
}
