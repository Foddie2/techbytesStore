import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  initials: string;
  memberSince?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);

  public isLoggedIn = signal<boolean>(false);
  public currentUser = signal<UserProfile | null>(null);

  constructor() {
    this.restoreSession();
  }

  private restoreSession(): void {
    // Prevent SSR crashes by checking if code is running in the browser
    if (isPlatformBrowser(this.platformId)) {
      const savedUser = localStorage.getItem('keyanna_user');
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          this.currentUser.set(user);
          this.isLoggedIn.set(true);
        } catch (e) {
          this.logout();
        }
      }
    }
  }

  loginWithGoogleMock(userEmail = 'customer@keyanna.com', userName = 'Valued Customer'): void {
    const user: UserProfile = {
      id: '#SH-' + Math.floor(10000 + Math.random() * 90000),
      name: userName,
      email: userEmail,
      initials: userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
      memberSince: '2026',
    };

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('keyanna_user', JSON.stringify(user));
    }

    this.currentUser.set(user);
    this.isLoggedIn.set(true);
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('keyanna_user');
    }
    this.isLoggedIn.set(false);
    this.currentUser.set(null);
  }
}
