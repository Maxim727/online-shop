import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { LanguageToolbarComponent } from './language-toolbar/language-toolbar.component';
import { OrdersListComponent } from './orders-list/orders-list.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-home',
  template: `
    <app-language-toolbar></app-language-toolbar>
    <h1>{{ 'common.title' | translate }}</h1>
    <app-orders-list></app-orders-list>
  `,
  imports: [
    MatToolbarModule,
    LanguageToolbarComponent,
    OrdersListComponent,
    TranslatePipe,
  ],
  styles: [
    `
      h1 {
        display: flex;
        justify-content: center;
        margin: 2rem;
      }
    `,
  ],
})
export default class HomeComponent {}
