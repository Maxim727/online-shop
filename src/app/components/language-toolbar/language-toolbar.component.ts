// language-toolbar.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from 'src/app/shared/data-access/auth.service';
import { LanguageService } from './language-toolbar.service';

@Component({
  selector: 'app-language-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatSelectModule,
    MatIconModule,
    MatMenuModule,
    TranslateModule,
  ],
  templateUrl: './language-toolbar.component.html',
  styleUrls: ['./language-toolbar.component.scss'],
})
export class LanguageToolbarComponent {
  public authService = inject(AuthService);
  private langService = inject(LanguageService);

  currentLang = this.langService.currentLang;

  switchLanguage(lang: string) {
    this.currentLang = lang;
    this.langService.currentLang = lang;
  }
}
