import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  readonly isDarkMode = signal(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

      this.isDarkMode.set(isDark);
      this.applyTheme(isDark);
    }
  }

  toggleDarkMode(): void {
    const nextState = !this.isDarkMode();
    this.isDarkMode.set(nextState);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('theme', nextState ? 'dark' : 'light');
      this.applyTheme(nextState);
    }
  }

  private applyTheme(isDark: boolean): void {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
}
