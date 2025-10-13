// language.service.ts
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private translate = inject(TranslateService);
  private platformId = inject(PLATFORM_ID);

  private readonly STORAGE_KEY = 'language';

  get currentLang(): string {
    if (isPlatformBrowser(this.platformId)) {
      return (
        localStorage.getItem(this.STORAGE_KEY) || this.getBrowserLanguage()
      );
    }
    return this.getBrowserLanguage();
  }

  set currentLang(lang: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.STORAGE_KEY, lang);
    }
    this.translate.use(lang);
  }

  getBrowserLanguage(): string {
    return this.translate.getBrowserLang() || 'en';
  }
}
