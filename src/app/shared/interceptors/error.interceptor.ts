import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message = 'An unexpected error occurred.';

      switch (error.status) {
        case 0:
          message = 'Cannot connect to the server. Please try again later.';
          break;
        case 400:
          message = error.error?.message || 'Bad Request.';
          break;
        case 401:
          message = 'Session expired. Please log in again.';
          router.navigate(['/login']);
          break;
        case 403:
          message = 'You do not have permission to access this resource.';
          router.navigate(['/forbidden']);
          break;
        case 404:
          message = 'The requested resource was not found.';
          router.navigate(['/not-found']);
          break;
        case 500:
          message = 'Server error. Please try again later.';
          break;
        default:
          console.error('Unhandled error:', error);
          break;
      }

      snackBar.open(message, 'Close', {
        duration: 4000,
        horizontalPosition: 'right',
        verticalPosition: 'bottom',
        panelClass: ['error-snackbar'],
      });

      return throwError(() => error);
    })
  );
};
