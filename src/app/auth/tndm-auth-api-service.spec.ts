import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthResponse, AuthTokenResponsePassword, SupabaseClient, User } from '@supabase/supabase-js';
import { TndmAuthApiService } from './tndm-auth-api-service';
import { SupabaseService } from '../core/supabase/supabase-service';
import { AuthProvider } from './types/types';
import { AUTH_ROUTES } from './constants/router';
import { environment } from '../../environments/environment';

describe('TndmAuthApiService', () => {
  let service: TndmAuthApiService;

  let supabaseClientMock: {
    rpc: ReturnType<typeof vi.fn>;
    auth: {
      signUp: ReturnType<typeof vi.fn>;
      signInWithPassword: ReturnType<typeof vi.fn>;
      signOut: ReturnType<typeof vi.fn>;
      signInWithOAuth: ReturnType<typeof vi.fn>;
      resetPasswordForEmail: ReturnType<typeof vi.fn>;
      updateUser: ReturnType<typeof vi.fn>;
    };
  };

  let supabaseServiceMock: { client: SupabaseClient };

  const mockUser: User = { id: 'id' } as User;

  beforeEach(() => {
    supabaseClientMock = {
      rpc: vi.fn(),
      auth: {
        signUp: vi.fn(),
        signInWithPassword: vi.fn(),
        signOut: vi.fn(),
        signInWithOAuth: vi.fn(),
        resetPasswordForEmail: vi.fn(),
        updateUser: vi.fn(),
      },
    };

    supabaseServiceMock = {
      client: supabaseClientMock as unknown as SupabaseClient,
    };

    TestBed.configureTestingModule({
      providers: [TndmAuthApiService, { provide: SupabaseService, useValue: supabaseServiceMock }],
    });

    service = TestBed.inject(TndmAuthApiService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('checkEmailExists', () => {
    it('should call rpc with correct params and not throw if email does not exist', async () => {
      supabaseClientMock.rpc.mockResolvedValue({ data: { exists: false } });

      await service.checkEmailExists('ololo@example.com');

      expect(supabaseClientMock.rpc).toHaveBeenCalledWith('check_email_exists', {
        p_email: 'ololo@example.com',
      });
    });
  });

  describe('register', () => {
    it('should call checkEmailExists and signUp and return user', async () => {
      const checkEmailExistsSpy = vi.spyOn(service, 'checkEmailExists').mockResolvedValue(undefined);

      supabaseClientMock.auth.signUp.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      } as AuthResponse);

      const result = await service.register('Login Paul', 'ololo@example.com', 'pAsswoRd8*ololo**');

      expect(checkEmailExistsSpy).toHaveBeenCalledWith('ololo@example.com');
      expect(supabaseClientMock.auth.signUp).toHaveBeenCalledWith({
        email: 'ololo@example.com',
        password: 'pAsswoRd8*ololo**',
        options: { data: { login: 'Login Paul' } },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw error from signUp', async () => {
      const err = new Error('signUp error');

      vi.spyOn(service, 'checkEmailExists').mockResolvedValue(undefined);

      supabaseClientMock.auth.signUp.mockResolvedValue({
        data: { user: null },
        error: err,
      } as unknown as AuthResponse);

      await expect(service.register('Login Paul', 'ololo@example.com', 'pAsswoRd8*ololo**')).rejects.toBe(err);
    });
  });

  describe('login', () => {
    it('should call signInWithPassword and return user', async () => {
      supabaseClientMock.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      } as AuthTokenResponsePassword);

      const result = await service.login('ololo@example.com', 'pAsswoRd8*ololo**');

      expect(supabaseClientMock.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'ololo@example.com',
        password: 'pAsswoRd8*ololo**',
      });

      expect(result).toEqual(mockUser);
    });

    it('should throw error from signInWithPassword', async () => {
      const err = new Error('login error');

      supabaseClientMock.auth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: err,
      } as unknown as AuthTokenResponsePassword);

      await expect(service.login('ololo@example.com', 'pAsswoRd8*ololo**')).rejects.toBe(err);
    });
  });

  describe('logout', () => {
    it('should call signOut', async () => {
      supabaseClientMock.auth.signOut.mockResolvedValue({ error: null });

      await service.logout();

      expect(supabaseClientMock.auth.signOut).toHaveBeenCalledTimes(1);
    });

    it('should throw error from signOut', async () => {
      const err = new Error('logout error');

      supabaseClientMock.auth.signOut.mockResolvedValue({ error: err });

      await expect(service.logout()).rejects.toBe(err);
    });
  });

  describe('signWithOAuth', () => {
    it('should call signInWithOAuth with provider and redirectUrl', async () => {
      supabaseClientMock.auth.signInWithOAuth.mockResolvedValue({ error: null });

      await service.signWithOAuth('google' as AuthProvider);

      expect(supabaseClientMock.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: `${environment.redirectUrl}`,
        },
      });
    });

    it('should throw error from signInWithOAuth', async () => {
      const err = new Error('error');

      supabaseClientMock.auth.signInWithOAuth.mockResolvedValue({ error: err });

      await expect(service.signWithOAuth('google' as AuthProvider)).rejects.toBe(err);
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should call resetPasswordForEmail with correct redirect and return true on success', async () => {
      supabaseClientMock.auth.resetPasswordForEmail.mockResolvedValue({
        data: {},
        error: null,
      });

      const result = await service.sendPasswordResetEmail('ololo@example.com');

      expect(supabaseClientMock.auth.resetPasswordForEmail).toHaveBeenCalledWith('ololo@example.com', {
        redirectTo: `${environment.redirectUrl}${AUTH_ROUTES.UPDATE_PASSWORD}`,
      });
      expect(result).toBe(true);
    });
  });

  describe('updatePassword', () => {
    it('should call updateUser and return true on success', async () => {
      supabaseClientMock.auth.updateUser.mockResolvedValue({
        data: {},
        error: null,
      });

      const result = await service.updatePassword('*ANATole01010Upyachka]');

      expect(supabaseClientMock.auth.updateUser).toHaveBeenCalledWith({
        password: '*ANATole01010Upyachka]',
      });
      expect(result).toBe(true);
    });

    it('should throw error from updateUser', async () => {
      const err = new Error('error');

      supabaseClientMock.auth.updateUser.mockResolvedValue({
        data: null,
        error: err,
      });

      await expect(service.updatePassword('*ANATole01010Upyachka]')).rejects.toBe(err);
    });
  });
});
