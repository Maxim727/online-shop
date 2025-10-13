import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Credentials } from 'src/app/shared/interfaces/credentials';
import { LoginStatus } from 'src/app/shared/interfaces/login-state';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-login-form',
  template: `
    <form
      [formGroup]="loginForm"
      (ngSubmit)="login.emit(loginForm.getRawValue())"
    >
      <mat-form-field appearance="fill">
        <mat-label>{{ 'auth.email' | translate }}</mat-label>
        <input
          matNativeControl
          formControlName="email"
          type="email"
          [placeholder]="'auth.loginButton' | translate"
        />
        <mat-icon matPrefix>mail</mat-icon>
      </mat-form-field>
      <mat-form-field appearance="fill">
        <mat-label>{{ 'auth.password' | translate }}</mat-label>
        <input
          matNativeControl
          formControlName="password"
          type="password"
          [placeholder]="'auth.password' | translate"
        />
        <mat-icon matPrefix>lock</mat-icon>
      </mat-form-field>

      @if (loginStatus === 'error'){
      <mat-error>Could not log you in with those details.</mat-error>
      } @if(loginStatus === 'authenticating'){
      <mat-spinner diameter="50"></mat-spinner>
      }

      <button
        mat-raised-button
        color="accent"
        type="submit"
        [disabled]="loginStatus === 'authenticating'"
      >
        {{ 'auth.loginButton' | translate }}
      </button>
    </form>
  `,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslatePipe,
  ],
  styles: [
    `
      form {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      button {
        width: 50%;
      }

      mat-error {
        margin: 5px 0;
      }

      mat-spinner {
        margin: 1rem 0;
      }
    `,
  ],
})
export class LoginFormComponent {
  @Input({ required: true }) loginStatus!: LoginStatus;
  @Output() login = new EventEmitter<Credentials>();

  private fb = inject(FormBuilder);

  loginForm = this.fb.nonNullable.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
  });
}
