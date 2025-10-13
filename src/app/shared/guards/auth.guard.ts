import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../data-access/auth.service';
import { ERoutes } from 'src/app/routing/routes.constants';

export const isAuthenticatedGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.user(); // read signal value

  if (user) {
    return true;
  }

  router.navigate([ERoutes.PUBLIC_AUTH_LOGIN]);
  return false; // block navigation
};
