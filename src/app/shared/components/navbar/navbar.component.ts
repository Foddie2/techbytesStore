import { Component, OnInit, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../../../core/services/cart';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header
      class="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors duration-200 sticky top-0 z-50"
    >
      <!-- 1. Top Utility Bar -->
      <div
        class="bg-slate-100 dark:bg-slate-950 text-xs text-slate-600 dark:text-slate-400 py-1.5 px-4 lg:px-8 border-b border-slate-200 dark:border-slate-800"
      >
        <div class="max-w-7xl mx-auto flex justify-between items-center">
          <p class="hidden sm:block">⚡ Express shipping on orders over $50</p>

          <div class="flex items-center gap-4 ml-auto">
            <a
              routerLink="/track-order"
              class="hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              Track Order
            </a>
            <span class="text-slate-300 dark:text-slate-700">|</span>

            <!-- Language Switcher -->
            <div class="relative">
              <button
                (click)="isLangOpen.set(!isLangOpen())"
                class="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 font-medium cursor-pointer"
              >
                🌐 {{ selectedLang() }}
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              @if (isLangOpen()) {
                <div
                  class="absolute right-0 mt-2 w-24 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg py-1 z-50"
                >
                  <button
                    (click)="selectLang('EN')"
                    class="w-full text-left px-3 py-1 hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    English
                  </button>
                  <button
                    (click)="selectLang('ES')"
                    class="w-full text-left px-3 py-1 hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    Español
                  </button>
                  <button
                    (click)="selectLang('FR')"
                    class="w-full text-left px-3 py-1 hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    Français
                  </button>
                </div>
              }
            </div>

            <span class="text-slate-300 dark:text-slate-700">|</span>

            <!-- Dark Mode Switcher -->
            <button
              (click)="toggleDarkMode()"
              class="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Toggle Theme"
            >
              @if (isDarkMode()) {
                <svg class="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z"
                    clip-rule="evenodd"
                  />
                </svg>
              } @else {
                <svg class="w-4 h-4 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              }
            </button>
          </div>
        </div>
      </div>

      <!-- 2. Main Navigation Bar -->
      <div class="max-w-7xl mx-auto px-4 lg:px-8 py-3 flex items-center justify-between gap-4">
        <!-- Brand Logo -->
        <a
          routerLink="/"
          class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-1"
        >
          <span class="text-blue-600 dark:text-blue-500">Tech</span>Bytes
        </a>

        <!-- Search Bar (Desktop) -->
        <div class="hidden md:flex flex-1 max-w-md relative">
          <input
            type="text"
            [value]="searchQuery()"
            (input)="searchQuery.set($any($event.target).value)"
            (keyup.enter)="onSearch()"
            placeholder="Search products, brands, categories..."
            class="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 pl-4 pr-10 py-2 rounded-full border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm transition"
          />
          <button
            (click)="onSearch()"
            class="absolute right-3 top-2.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>

        <!-- Actions: Cart Trigger & Mobile Toggle -->
        <div class="flex items-center gap-3">
          <!-- In-App Slide-Over Cart Trigger -->
          <button
            (click)="cartService.openDrawer()"
            class="relative p-2 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
            title="Open Cart"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            @if (cartService.itemCount() > 0) {
              <span
                class="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900"
              >
                {{ cartService.itemCount() }}
              </span>
            }
          </button>

          <!-- Mobile Hamburger Button -->
          <button
            (click)="isMobileOpen.set(!isMobileOpen())"
            class="md:hidden p-2 text-slate-700 dark:text-slate-200 hover:text-blue-600 cursor-pointer"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- 3. Lower Menu Links (Desktop) -->
      <nav
        class="hidden md:block bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200/60 dark:border-slate-800 text-sm"
      >
        <div class="max-w-7xl mx-auto px-4 lg:px-8 flex items-center gap-8 h-11">
          <!-- Mega Menu Trigger -->
          <div class="relative group" (mouseleave)="isMegaOpen.set(false)">
            <button
              (mouseenter)="isMegaOpen.set(true)"
              class="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 h-11 cursor-pointer"
            >
              Shop Menu
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            @if (isMegaOpen()) {
              <div
                class="absolute left-0 top-11 w-[600px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-b-xl shadow-xl p-6 grid grid-cols-3 gap-6 z-50"
              >
                <div>
                  <h4 class="font-bold text-slate-900 dark:text-white mb-2">Electronics</h4>
                  <ul class="space-y-2 text-slate-600 dark:text-slate-300">
                    <li>
                      <a
                        routerLink="/products"
                        [queryParams]="{ category: 'Laptops' }"
                        class="hover:text-blue-600"
                      >
                        Laptops
                      </a>
                    </li>
                    <li>
                      <a
                        routerLink="/products"
                        [queryParams]="{ category: 'Smartphones' }"
                        class="hover:text-blue-600"
                      >
                        Smartphones
                      </a>
                    </li>
                    <li>
                      <a
                        routerLink="/products"
                        [queryParams]="{ category: 'Headphones' }"
                        class="hover:text-blue-600"
                      >
                        Headphones
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 class="font-bold text-slate-900 dark:text-white mb-2">Accessories</h4>
                  <ul class="space-y-2 text-slate-600 dark:text-slate-300">
                    <li>
                      <a
                        routerLink="/products"
                        [queryParams]="{ category: 'Monitors' }"
                        class="hover:text-blue-600"
                      >
                        Monitors
                      </a>
                    </li>
                    <li>
                      <a
                        routerLink="/products"
                        [queryParams]="{ category: 'Keyboards' }"
                        class="hover:text-blue-600"
                      >
                        Keyboards
                      </a>
                    </li>
                    <li>
                      <a
                        routerLink="/products"
                        [queryParams]="{ category: 'Chargers' }"
                        class="hover:text-blue-600"
                      >
                        Chargers
                      </a>
                    </li>
                  </ul>
                </div>
                <div
                  class="bg-blue-50 dark:bg-slate-700/50 p-4 rounded-lg flex flex-col justify-between"
                >
                  <div>
                    <span class="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">
                      Featured
                    </span>
                    <h5 class="font-semibold text-slate-900 dark:text-white mt-1">
                      New M3 Laptops
                    </h5>
                  </div>
                  <a
                    routerLink="/products"
                    [queryParams]="{ q: 'M3' }"
                    class="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Shop Now →
                  </a>
                </div>
              </div>
            }
          </div>

          <!-- Categories Dropdown Trigger -->
          <div class="relative" (mouseleave)="isCatOpen.set(false)">
            <button
              (mouseenter)="isCatOpen.set(true)"
              class="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 h-11 cursor-pointer"
            >
              Categories
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            @if (isCatOpen()) {
              <div
                class="absolute left-0 top-11 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-b-lg shadow-lg py-2 z-50"
              >
                <a
                  routerLink="/products"
                  [queryParams]="{ category: 'Hardware' }"
                  class="block px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Hardware
                </a>
                <a
                  routerLink="/products"
                  [queryParams]="{ category: 'Software' }"
                  class="block px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Software
                </a>
                <a
                  routerLink="/products"
                  [queryParams]="{ category: 'Networking' }"
                  class="block px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Networking
                </a>
              </div>
            }
          </div>

          <!-- Standard Navigation Links -->
          <a
            routerLink="/best-sellers"
            routerLinkActive="text-blue-600 font-semibold"
            class="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
          >
            Best Sellers
          </a>
          <a
            routerLink="/new-arrivals"
            routerLinkActive="text-blue-600 font-semibold"
            class="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
          >
            New Arrivals
          </a>
        </div>
      </nav>

      <!-- 4. Mobile Drawer Menu -->
      @if (isMobileOpen()) {
        <div
          class="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 pt-3 pb-6 space-y-4"
        >
          <!-- Search Bar (Mobile) -->
          <div class="relative w-full">
            <input
              type="text"
              [value]="searchQuery()"
              (input)="searchQuery.set($any($event.target).value)"
              (keyup.enter)="onSearch()"
              placeholder="Search products..."
              class="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 pl-4 pr-10 py-2 rounded-lg text-sm border-none outline-none"
            />
            <button
              (click)="onSearch()"
              class="absolute right-3 top-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>

          <div class="flex flex-col gap-3 font-medium text-slate-700 dark:text-slate-200">
            <a routerLink="/" (click)="isMobileOpen.set(false)" class="py-1">Home</a>
            <a routerLink="/products" (click)="isMobileOpen.set(false)" class="py-1">Shop All</a>
            <a routerLink="/best-sellers" (click)="isMobileOpen.set(false)" class="py-1">
              Best Sellers
            </a>
            <a routerLink="/new-arrivals" (click)="isMobileOpen.set(false)" class="py-1">
              New Arrivals
            </a>
            <a
              routerLink="/track-order"
              (click)="isMobileOpen.set(false)"
              class="py-1 text-slate-500"
            >
              Track Order
            </a>
          </div>
        </div>
      }
    </header>
  `,
})
export class Navbar implements OnInit {
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  public cartService = inject(CartService);

  isMobileOpen = signal<boolean>(false);
  isMegaOpen = signal<boolean>(false);
  isCatOpen = signal<boolean>(false);
  isLangOpen = signal<boolean>(false);
  isDarkMode = signal<boolean>(false);
  selectedLang = signal<string>('EN');
  searchQuery = signal<string>('');

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // 1. Initialize & Persist Dark Mode State
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const enableDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

      this.isDarkMode.set(enableDark);
      document.documentElement.classList.toggle('dark', enableDark);

      // 2. Initialize Language State
      const savedLang = localStorage.getItem('lang');
      if (savedLang) {
        this.selectedLang.set(savedLang);
      }
    }
  }

  toggleDarkMode(): void {
    this.isDarkMode.update((v) => !v);
    const isDark = this.isDarkMode();

    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.classList.toggle('dark', isDark);
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }
  }

  selectLang(lang: string): void {
    this.selectedLang.set(lang);
    this.isLangOpen.set(false);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('lang', lang);
    }
  }

  onSearch(): void {
    const q = this.searchQuery().trim();
    if (q) {
      this.router.navigate(['/products'], { queryParams: { q } });
      this.isMobileOpen.set(false);
    }
  }
}
