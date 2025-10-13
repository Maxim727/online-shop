import { Routes } from '@angular/router';
import { isAuthenticatedGuard } from '../shared/guards/auth.guard';
import { ERoutes } from './routes.constants';

export const routes: Routes = [
  {
    path: ERoutes.PUBLIC_AUTH_LOGIN,
    title: 'Login',
    loadComponent: () =>
      import('../auth/login/login.component').then((m) => m.default),
  },
  {
    path: ERoutes.PUBLIC_HOME,
    title: 'Home',
    canActivate: [isAuthenticatedGuard],
    loadComponent: () =>
      import('../components/home.component').then((m) => m.default),
  },
  {
    path: ERoutes.PRIVATE_ORDERS,
    children: [
      {
        path: '',
        title: 'Orders',
        loadComponent: () =>
          import('../components/orders-list/orders-list.component').then(
            (m) => m.OrdersListComponent
          ),
      },
      {
        path: ERoutes.PRIVATE_ORDER_DETAIL,
        title: 'Order Details',
        loadComponent: () =>
          import('../components/order-details/order-details.component').then(
            (m) => m.OrderDetailsComponent
          ),
      },
    ],
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: ERoutes.PUBLIC_HOME,
  },
  {
    path: '**',
    redirectTo: ERoutes.PUBLIC_HOME,
  },
];
