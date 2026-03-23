import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { AUTH_ROUTES } from './constants/router';
import { TndmAuthService } from './tndm-auth-service';

export const tndmAuthGuard: CanActivateFn = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Promise<boolean | UrlTree> => {
  const authService: TndmAuthService = inject(TndmAuthService);
  const router: Router = inject(Router);

  await authService.initSession();

  const isAuth: boolean = authService.isAuthenticated;

  const url: string = state.url;
  const isAuthRoute: boolean = url.startsWith(AUTH_ROUTES.AUTH);

  const isUpdatePasswordRoute: boolean = url.startsWith(AUTH_ROUTES.UPDATE_PASSWORD);

  if (!isAuth) {
    if (isUpdatePasswordRoute || !isAuthRoute) {
      return router.parseUrl(AUTH_ROUTES.LOGIN);
    }

    return true;
  }

  if (isAuth && isAuthRoute && !isUpdatePasswordRoute) {
    return router.parseUrl('/');
  }

  return true;
};
