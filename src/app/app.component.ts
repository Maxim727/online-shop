import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import translationsEN from '../../public/i18n/en.json';
import translationsRU from '../../public/i18n/ru.json';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: ` <router-outlet></router-outlet> `,
  styles: [],
})
export class AppComponent {
  private translate = inject(TranslateService);

  constructor() {
    this.translate.setTranslation('en', translationsEN);
    this.translate.setTranslation('ru', translationsRU);

    this.translate.addLangs(['ru', 'en']);
    this.translate.setFallbackLang('en');
    this.translate.use('en');
  }
}
