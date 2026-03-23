import { Routes } from '@angular/router';
import { AUTH_ROUTES_SEGMENTS } from '@auth';

export const authRoutes: Routes = [
  { path: '', redirectTo: AUTH_ROUTES_SEGMENTS.LOGIN, pathMatch: 'full' },
  {
    path: AUTH_ROUTES_SEGMENTS.LOGIN,
    loadComponent: () => import('./forms/tndm-login-form/tndm-login-form').then(m => m.TndmLoginForm),
  },
  {
    path: AUTH_ROUTES_SEGMENTS.REGISTER,
    loadComponent: () => import('./forms/tndm-register-form/tndm-register-form').then(m => m.TndmRegisterForm),
  },
  {
    path: AUTH_ROUTES_SEGMENTS.FORGOT_PASSWORD,
    loadComponent: () =>
      import('./forms/tndm-forgot-password-form/tndm-forgot-password-form').then(m => m.TndmForgotPasswordForm),
  },
  {
    path: AUTH_ROUTES_SEGMENTS.UPDATE_PASSWORD,
    loadComponent: () =>
      import('./forms/tndm-update-password-form/tndm-update-password-form').then(m => m.TndmUpdatePasswordForm),
  },
];
