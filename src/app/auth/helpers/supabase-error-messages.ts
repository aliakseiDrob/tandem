import { AuthError } from '@supabase/supabase-js';
import { AUTH_ERROR_KEYS } from '../enums/auth-error-key';

export const handleSupabaseAuthError = (error: AuthError): string => {
  const message: string = error.message.toLowerCase();

  if (message.includes(AUTH_ERROR_KEYS.InvalidCredentials)) {
    return 'Неверный email или пароль'; //t(key) Hint for translations Wrong email or password
  }

  if (message.includes(AUTH_ERROR_KEYS.UserAlreadyExists)) {
    return 'Пользователь с таким email уже существует'; // t(key) User with this email already exists
  }

  if (message.includes(AUTH_ERROR_KEYS.EmailNotConfirmed)) {
    return 'Подтвердите email перед входом'; // t(key) Please confirm your email before logging in
  }

  if (message.includes(AUTH_ERROR_KEYS.WeakPassword)) {
    return 'Слишком простой пароль'; // t(key) Password is too weak
  }

  return error.message;
};
