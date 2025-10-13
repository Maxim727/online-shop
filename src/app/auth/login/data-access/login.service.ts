import { Injectable, computed, inject, signal } from '@angular/core';
import { EMPTY, Subject, merge, switchMap, tap } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Credentials } from 'src/app/shared/interfaces/credentials';
import { connect } from 'ngxtension/connect';
import { AuthService } from 'src/app/shared/data-access/auth.service';
import { LoginState } from 'src/app/shared/interfaces/login-state';

@Injectable()
export class LoginService {
  private authService = inject(AuthService);

  // sources
  error$ = new Subject<any>();
  login$ = new Subject<Credentials>();

  userAuthenticated$ = this.login$.pipe(
    switchMap((credentials) =>
      this.authService.login(credentials).pipe(
        tap((user) => this.authService.setUser(user)),
        catchError((err) => {
          this.error$.next(err);
          return EMPTY;
        })
      )
    )
  );

  // state
  private state = signal<LoginState>({
    status: 'pending',
  });

  // selectors
  status = computed(() => this.state().status);

  constructor() {
    // reducers
    const nextState$ = merge(
      this.userAuthenticated$.pipe(map(() => ({ status: 'success' as const }))),
      this.login$.pipe(map(() => ({ status: 'authenticating' as const }))),
      this.error$.pipe(map(() => ({ status: 'error' as const })))
    );

    connect(this.state).with(nextState$);
  }
}
