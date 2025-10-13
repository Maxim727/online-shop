import { Component, effect, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { LoginFormComponent } from './ui/login-form.component';
import { LoginService } from './data-access/login.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from 'src/app/shared/data-access/auth.service';
import { MatCardModule } from '@angular/material/card';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageToolbarComponent } from 'src/app/components/language-toolbar/language-toolbar.component';

@Component({
  standalone: true,
  selector: 'app-login',
  template: `
    <app-language-toolbar></app-language-toolbar>
    <mat-card>
      <div class="container gradient-bg">
        @if (authService.user() === null) {
        <app-login-form
          [loginStatus]="loginService.status()"
          (login)="loginService.login$.next($event)"
        />
        <a>{{ 'auth.noAccount' | translate }}</a>
        <a routerLink="/auth/register">{{ 'auth.registerLink' | translate }}</a>
        } @else {
        <mat-spinner diameter="50"></mat-spinner>
        <p>{{ 'auth.loading' | translate }}</p>
        }
      </div>
    </mat-card>
  `,
  providers: [LoginService],
  imports: [
    RouterModule,
    LoginFormComponent,
    MatProgressSpinnerModule,
    MatCardModule,
    TranslatePipe,
    LanguageToolbarComponent,
  ],
  styles: [
    `
      a {
        display: flex;
        justify-content: center;
        margin: 2rem;
        color: var(--accent-darker-color);
      }
    `,
  ],
})
export default class LoginComponent {
  public loginService = inject(LoginService);
  public authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    effect(() => {
      const user = this.authService.user();
      if (user) {
        setTimeout(() => this.router.navigate(['/home']), 300);
      } else {
        return;
      }
    });
  }
}
