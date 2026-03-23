import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { inject } from '@angular/core';
import { TndmAuthStateStoreService } from './tndm-auth-state-store-service';

export const tndmAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authStoreService: TndmAuthStateStoreService = inject(TndmAuthStateStoreService);

  if (!req.url.includes(environment.supabaseUrl)) {
    return next(req);
  }

  const jwt: string | null = authStoreService.jwt();

  if (!jwt) {
    return next(req);
  }

  const authReq: HttpRequest<unknown> = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${jwt}`),
  });

  return next(authReq);
};
