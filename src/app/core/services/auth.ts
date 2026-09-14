import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  initials: string;
  picture?: string;
}

declare const google: any;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);

  private readonly googleClientId =
    '148437308582-s7s39so50nalpo17o7q8oe1u5kjd1imo.apps.googleusercontent.com';

  public isLoggedIn = signal<boolean>(false);
  public currentUser = signal<UserProfile | null>(null);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.restoreSession();
      this.loadGoogleScript();
    }
  }

  private loadGoogleScript(): void {
    if (document.getElementById('google-jssdk')) return;
    const script = document.createElement('script');
    script.id = 'google-jssdk';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }

  /**
   * Opens the real Google Account Picker popup
   */
  loginWithGoogle(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (typeof google !== 'undefined' && google.accounts?.oauth2) {
      const client = google.accounts.oauth2.initTokenClient({
        client_id: this.googleClientId,
        scope: 'email profile openid',
        callback: async (response: any) => {
          if (response.access_token) {
            await this.fetchGoogleUserProfile(response.access_token);
          }
        },
      });
      client.requestAccessToken();
    } else {
      // Fallback local session for testing if Client ID is pending setup
      this.setMockUser('customer@keyanna.com', 'Valued Customer');
    }
  }

  private async fetchGoogleUserProfile(accessToken: string): Promise<void> {
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();

      const user: UserProfile = {
        id: data.sub,
        name: data.name || 'Google Customer',
        email: data.email,
        picture: data.picture,
        initials: (data.name || data.email)
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2),
      };

      this.setUserSession(user);
    } catch (err) {
      console.error('Failed to fetch Google profile:', err);
    }
  }

  private setMockUser(email: string, name: string): void {
    const mockUser: UserProfile = {
      id: '#G-' + Math.floor(10000 + Math.random() * 90000),
      name,
      email,
      initials: 'VC',
    };
    this.setUserSession(mockUser);
  }

  /**
   * Updates currentUser and isLoggedIn signals simultaneously
   */
  private setUserSession(user: UserProfile): void {
    this.currentUser.set(user);
    this.isLoggedIn.set(true);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('keyanna_customer', JSON.stringify(user));
    }
  }

  private restoreSession(): void {
    const saved = localStorage.getItem('keyanna_customer');
    if (saved) {
      try {
        const user = JSON.parse(saved);
        this.currentUser.set(user);
        this.isLoggedIn.set(true);
      } catch (e) {
        this.logout();
      }
    }
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('keyanna_customer');
    }
    this.isLoggedIn.set(false);
    this.currentUser.set(null);
  }
}
