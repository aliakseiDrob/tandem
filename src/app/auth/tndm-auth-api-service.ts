import { inject, Injectable } from '@angular/core';
import { AuthError, AuthResponse, AuthTokenResponsePassword, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { AUTH_ERROR_KEYS } from './enums/auth-error-key';
import { AuthProvider } from './types/types';
import { AUTH_ROUTES } from '@auth/constants/router';
import { SupabaseService } from '../core/supabase/supabase-service';

@Injectable({
  providedIn: 'root',
})
export class TndmAuthApiService {
  private readonly supabaseService: SupabaseService = inject(SupabaseService);
  private readonly supabase: SupabaseClient = this.supabaseService.client;

  private readonly checkEmailExistsRPC = 'check_email_exists';

  async checkEmailExists(email: string): Promise<void> {
    const { data } = await this.supabase.rpc(this.checkEmailExistsRPC, { p_email: email });

    if (data.exists) {
      throw new AuthError(AUTH_ERROR_KEYS.UserAlreadyExists, 400);
    }
  }

  async register(login: string, email: string, password: string): Promise<User | null> {
    await this.checkEmailExists(email);

    const {
      data: { user },
      error,
    }: AuthResponse = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          login,
        },
      },
    });

    if (error) {
      throw error;
    }

    return user;
  }

  async login(email: string, password: string): Promise<User | null> {
    const {
      data: { user },
      error,
    }: AuthTokenResponsePassword = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return user;
  }

  async logout(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();

    if (error) {
      throw error;
    }
  }

  async signWithOAuth(provider: AuthProvider): Promise<void> {
    const { error } = await this.supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${environment.redirectUrl}`,
      },
    });

    if (error) {
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string): Promise<boolean> {
    const { data, error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${environment.redirectUrl}${AUTH_ROUTES.UPDATE_PASSWORD}`,
    });

    if (error) {
      throw error;
    }

    return !!data;
  }

  async updatePassword(newPassword: string): Promise<boolean> {
    const { data, error } = await this.supabase.auth.updateUser({ password: newPassword });

    if (error) {
      throw error;
    }

    return !!data;
  }
}
