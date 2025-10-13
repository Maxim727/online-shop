import { Injectable, signal } from '@angular/core';
import { Observable, of, throwError, delay } from 'rxjs';
import { Credentials } from '../interfaces/credentials';

export interface User {
  id: number;
  email: string;
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<User | null>(null);
  public user = this._user.asReadonly();

  login(credentials: Credentials): Observable<User> {
    const { email, password } = credentials;
    const mockDelay = 500;

    if (email === 'test' && password === 'test') {
      const mockUser: User = {
        id: 1,
        email,
        token: 'mock-jwt-token-12345',
      };

      return of(mockUser).pipe(delay(mockDelay));
    } else {
      return throwError(() => new Error('Invalid credentials')).pipe(
        delay(mockDelay)
      );
    }
  }

  setUser(user: User | null): void {
    this._user.set(user);
  }

  logout(): void {
    this._user.set(null);
  }
}
