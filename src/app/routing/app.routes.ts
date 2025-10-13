import { Routes } from '@angular/router';
import { isAuthenticatedGuard } from '../shared/guards/auth.guard';
import { ERoutes } from './routes.constants';

export const routes: Routes = [
  {
    path: ERoutes.PUBLIC_AUTH_LOGIN,
    loadComponent: () =>
      import('../auth/login/login.component').then((m) => m.default),
  },
  {
    path: ERoutes.PUBLIC_HOME,
    canActivate: [isAuthenticatedGuard],
    loadComponent: () =>
      import('../components/home.component').then((m) => m.default),
  },

  {
    path: ERoutes.PRIVATE_ORDERS,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../components/orders-list/orders-list.component').then(
            (m) => m.OrdersListComponent
          ),
      },
      {
        path: ERoutes.PRIVATE_ORDER_DETAIL,
        loadComponent: () =>
          import('../components/order-details/order-details.component').then(
            (m) => m.OrderDetailsComponent
          ),
      },
    ],
  },

  {
    path: '**',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
