import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CurrencyService } from './currency';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private platformId = inject(PLATFORM_ID);
  private currencyService = inject(CurrencyService);

  readonly selectedLang = signal<string>('EN');

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const savedLang = localStorage.getItem('lang');
      if (savedLang) {
        this.selectedLang.set(savedLang);
      }
    }
  }

  setLanguage(lang: string): void {
    this.selectedLang.set(lang);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('lang', lang);
    }

    // Dynamic Language-to-Currency Mapping
    if (lang === 'ES' || lang === 'FR') {
      this.currencyService.setCurrencyCode('EUR', true);
    } else if (lang === 'EN') {
      const isKenya = this.currencyService.detectedCountry() === 'KE';
      this.currencyService.setCurrencyCode(isKenya ? 'KES' : 'USD', true);
    }
  }
}
