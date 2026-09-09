import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

// Core Services
import { CartService } from '../../../core/services/cart';
import { ThemeService } from '../../../core/services/theme';
import { LanguageService } from '../../../core/services/language';
import { CurrencyService } from '../../../core/services/currency';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header
      class="w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors duration-300 sticky top-0 z-50 shadow-xs"
    >
      <!-- 1. Top Utility Bar -->
      <div
        class="bg-slate-100/90 dark:bg-slate-950 text-xs sm:text-sm text-slate-600 dark:text-slate-400 py-1.5 px-4 lg:px-8 border-b border-slate-200/60 dark:border-slate-800/80 transition-colors"
      >
        <div class="max-w-7xl mx-auto flex justify-between items-center">
          <p class="hidden sm:flex items-center gap-2 font-medium tracking-tight">
            <!-- <span class="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> -->
            ⚡ Express global shipping on all verified orders over
            {{ currencyService.formatPrice({ amount: 50, currencyCode: 'USD' }) }}
          </p>

          <div class="flex items-center gap-4 ml-auto font-medium">
            <!-- Track Order Link -->
            <a
              routerLink="/track-order"
              class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 flex items-center gap-1.5 py-0.5"
              title="Track live shipment status"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1"
                />
              </svg>
              <span>Track Order</span>
            </a>

            <span class="text-slate-300 dark:text-slate-800" aria-hidden="true">|</span>

            <!-- Language Selector Dropdown -->
            <div class="relative">
              <button
                (click)="toggleDropdown('lang')"
                aria-label="Select Language"
                [attr.aria-expanded]="isLangOpen()"
                class="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium cursor-pointer py-0.5"
              >
                <span>🌐 {{ languageService.selectedLang() }}</span>
                <svg
                  class="w-3 h-3 transition-transform duration-200"
                  [class.rotate-180]="isLangOpen()"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
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
                  (mouseleave)="isLangOpen.set(false)"
                  class="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xl py-1 z-50 animate-fadeIn"
                >
                  <button
                    (click)="selectLang('EN')"
                    class="w-full text-left px-3.5 py-1.5 hover:bg-blue-50 dark:hover:bg-slate-700/80 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-semibold transition-colors duration-150 cursor-pointer dark:text-slate-200"
                  >
                    English (EN)
                  </button>
                  <button
                    (click)="selectLang('ES')"
                    class="w-full text-left px-3.5 py-1.5 hover:bg-blue-50 dark:hover:bg-slate-700/80 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-semibold transition-colors duration-150 cursor-pointer dark:text-slate-200"
                  >
                    Español (ES)
                  </button>
                  <button
                    (click)="selectLang('FR')"
                    class="w-full text-left px-3.5 py-1.5 hover:bg-blue-50 dark:hover:bg-slate-700/80 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-semibold transition-colors duration-150 cursor-pointer dark:text-slate-200"
                  >
                    Français (FR)
                  </button>
                </div>
              }
            </div>

            <span class="text-slate-300 dark:text-slate-800" aria-hidden="true">|</span>

            <!-- Dark Mode Switcher -->
            <button
              (click)="themeService.toggleDarkMode()"
              class="p-1 rounded-md hover:bg-slate-200/80 dark:hover:bg-slate-800 transition-colors duration-200 cursor-pointer"
              [attr.aria-label]="
                themeService.isDarkMode() ? 'Switch to Light Mode' : 'Switch to Dark Mode'
              "
              title="Toggle Theme"
            >
              @if (themeService.isDarkMode()) {
                <svg
                  class="w-4 h-4 text-amber-400 transform hover:rotate-45 transition-transform duration-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z"
                    clip-rule="evenodd"
                  />
                </svg>
              } @else {
                <svg
                  class="w-4 h-4 text-slate-600 transform hover:-rotate-12 transition-transform duration-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              }
            </button>
          </div>
        </div>
      </div>

      <!-- 2. Main Header / Branding Section -->
      <div
        class="max-w-7xl mx-auto px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4 sm:gap-8"
      >
        <!-- Brand Logo -->
        <a
          routerLink="/"
          class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-1 group transition-transform duration-200 active:scale-95"
          aria-label="KeyAnna E-Commerce Home"
        >
          <span class="text-blue-600 dark:text-blue-500 group-hover:text-blue-500 transition-colors"
            >Key</span
          >Anna
        </a>

        <!-- Search Bar (Desktop - SEO & Adsense Optimized Input) -->
        <div class="hidden md:flex flex-1 max-w-lg relative">
          <input
            type="search"
            [value]="searchQuery()"
            (input)="searchQuery.set($any($event.target).value)"
            (keyup.enter)="onSearch()"
            placeholder="Search products, brands, tech categories..."
            aria-label="Search Catalog"
            class="w-full bg-slate-100/80 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 pl-4 pr-11 py-2.5 rounded-full border border-slate-200/80 dark:border-slate-700/60 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition-all duration-200 placeholder:text-slate-400"
          />
          <button
            (click)="onSearch()"
            aria-label="Submit Search"
            class="absolute right-1.5 top-1.5 p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 rounded-full cursor-pointer transition-colors duration-200"
            title="Execute Search"
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

        <!-- Action Items: Wishlist, Account, Cart Trigger & Mobile Toggle -->
        <div class="flex items-center gap-1 sm:gap-2">
          <!-- CUSTOMER ACCOUNT DROPDOWN MENU -->
          <div class="relative">
            <button
              (click)="toggleDropdown('account')"
              [attr.aria-expanded]="isAccountOpen()"
              aria-label="User Profile & Order Account Menu"
              class="p-2.5 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100/80 dark:hover:bg-slate-800 rounded-full transition-all duration-200 cursor-pointer flex items-center group"
              title="Customer Account"
            >
              <svg
                class="w-6 h-6 transition-transform duration-200 group-hover:scale-110"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </button>

            @if (isAccountOpen()) {
              <div
                (mouseleave)="isAccountOpen.set(false)"
                class="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-2xl py-2 z-50 divide-y divide-slate-100 dark:divide-slate-700/60 animate-fadeIn"
              >
                <!-- Greeting Header -->
                <div class="px-4 py-3 bg-slate-50/50 dark:bg-slate-800/50 rounded-t-2xl">
                  <p
                    class="text-[13px] font-bold uppercase text-blue-600 dark:text-blue-400 tracking-wider"
                  >
                    Account Central
                  </p>
                  <p class="text-[15px] font-bold text-slate-900 dark:text-white truncate">
                    My Customer Dashboard
                  </p>
                </div>

                <!-- Action Options with Tab Query Parameters -->
                <div class="py-1">
                  <a
                    routerLink="/account"
                    [queryParams]="{ tab: 'overview' }"
                    (click)="isAccountOpen.set(false)"
                    class="flex items-center gap-3 px-4 py-2 text-[15px] font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50/80 dark:hover:bg-slate-700/60 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-150"
                  >
                    <svg
                      class="w-4 h-4 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span>My Account Overview</span>
                  </a>

                  <a
                    routerLink="/account"
                    [queryParams]="{ tab: 'orders' }"
                    (click)="isAccountOpen.set(false)"
                    class="flex items-center gap-3 px-4 py-2 text-[15px] font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50/80 dark:hover:bg-slate-700/60 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-150"
                  >
                    <svg
                      class="w-4 h-4 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                    <span>Orders Ever Placed</span>
                  </a>

                  <a
                    routerLink="/account"
                    [queryParams]="{ tab: 'wishlist' }"
                    (click)="isAccountOpen.set(false)"
                    class="flex items-center gap-3 px-4 py-2 text-[15px] font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50/80 dark:hover:bg-slate-700/60 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-150"
                  >
                    <svg
                      class="w-4 h-4 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    <span>Saved Wishlist</span>
                  </a>
                </div>

                <!-- Authentication CTA -->
                <div class="py-1.5 px-4 bg-slate-50/30 dark:bg-slate-800/30 rounded-b-2xl">
                  <a
                    routerLink="/account"
                    [queryParams]="{ tab: 'overview' }"
                    (click)="isAccountOpen.set(false)"
                    class="text-[13px] font-extrabold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                  >
                    Sign In or Register →
                  </a>
                </div>
              </div>
            }
          </div>

          <!-- Slide-Over Shopping Cart Drawer Trigger -->
          <button
            (click)="cartService.openDrawer(); closeAllDropdowns()"
            class="relative p-2.5 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100/80 dark:hover:bg-slate-800 rounded-full transition-all duration-200 cursor-pointer group"
            title="Shopping Cart Drawer"
            aria-label="Open Shopping Cart Drawer"
          >
            <svg
              class="w-6 h-6 transition-transform duration-200 group-hover:scale-110"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            @if (cartService.itemCount() > 0) {
              <span
                class="absolute top-0.5 right-0.5 bg-blue-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm animate-pulse"
              >
                {{ cartService.itemCount() }}
              </span>
            }
          </button>

          <!-- Mobile Hamburger Menu Button -->
          <button
            (click)="isMobileOpen.set(!isMobileOpen())"
            class="md:hidden p-2 text-slate-700 dark:text-slate-200 hover:text-blue-600 cursor-pointer rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle Mobile Menu Navigation"
            [attr.aria-expanded]="isMobileOpen()"
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

      <!-- 3. Lower Menu Bar (Desktop Navigation with Both Mega Menu & Categories Dropdown) -->
      <nav
        class="hidden md:block bg-slate-50/80 dark:bg-slate-900/60 border-t border-slate-200/60 dark:border-slate-800 text-sm font-medium"
        aria-label="Primary Catalog Navigation"
      >
        <div class="max-w-7xl mx-auto px-4 lg:px-8 flex items-center gap-8 h-11">
          <!-- MEGA MENU DROPDOWN ("Shop Catalog") -->
          <div class="relative" (mouseleave)="isMegaOpen.set(false)">
            <button
              (mouseenter)="isMegaOpen.set(true); isCatOpen.set(false)"
              (click)="isMegaOpen.set(!isMegaOpen()); isCatOpen.set(false)"
              [attr.aria-expanded]="isMegaOpen()"
              class="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 h-11 cursor-pointer transition-colors duration-150"
            >
              <svg
                class="w-4 h-4 text-blue-600 dark:text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h7"
                />
              </svg>
              <span>Shop Catalog</span>
              <svg
                class="w-3.5 h-3.5 transition-transform duration-200"
                [class.rotate-180]="isMegaOpen()"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
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
                class="absolute left-0 top-11 w-170 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-2xl p-6 grid grid-cols-3 gap-6 z-50 animate-fadeIn"
              >
                <!-- Mega Column 1 -->
                <div>
                  <h4
                    class="font-bold text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-3"
                  >
                    Computers & Laptops
                  </h4>
                  <ul class="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <li>
                      <a
                        routerLink="/products"
                        [queryParams]="{ category: 'Laptops' }"
                        (click)="isMegaOpen.set(false)"
                        class="hover:text-blue-600 dark:hover:text-white transition-colors duration-150 block py-0.5"
                      >
                        High-Performance Laptops
                      </a>
                    </li>
                    <li>
                      <a
                        routerLink="/products"
                        [queryParams]="{ category: 'Desktops' }"
                        (click)="isMegaOpen.set(false)"
                        class="hover:text-blue-600 dark:hover:text-white transition-colors duration-150 block py-0.5"
                      >
                        Workstations & Towers
                      </a>
                    </li>
                    <li>
                      <a
                        routerLink="/products"
                        [queryParams]="{ category: 'Monitors' }"
                        (click)="isMegaOpen.set(false)"
                        class="hover:text-blue-600 dark:hover:text-white transition-colors duration-150 block py-0.5"
                      >
                        4K & Curved Monitors
                      </a>
                    </li>
                  </ul>
                </div>

                <!-- Mega Column 2 -->
                <div>
                  <h4
                    class="font-bold text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-3"
                  >
                    Mobile & Accessories
                  </h4>
                  <ul class="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <li>
                      <a
                        routerLink="/products"
                        [queryParams]="{ category: 'Smartphones' }"
                        (click)="isMegaOpen.set(false)"
                        class="hover:text-blue-600 dark:hover:text-white transition-colors duration-150 block py-0.5"
                      >
                        Flagship Smartphones
                      </a>
                    </li>
                    <li>
                      <a
                        routerLink="/products"
                        [queryParams]="{ category: 'Headphones' }"
                        (click)="isMegaOpen.set(false)"
                        class="hover:text-blue-600 dark:hover:text-white transition-colors duration-150 block py-0.5"
                      >
                        Noise-Canceling Audio
                      </a>
                    </li>
                    <li>
                      <a
                        routerLink="/products"
                        [queryParams]="{ category: 'Keyboards' }"
                        (click)="isMegaOpen.set(false)"
                        class="hover:text-blue-600 dark:hover:text-white transition-colors duration-150 block py-0.5"
                      >
                        Mechanical Keyboards
                      </a>
                    </li>
                  </ul>
                </div>

                <!-- Mega Column 3 (Promo Feature Banner) -->
                <div
                  class="bg-linear-to-br from-blue-50 to-indigo-50 dark:from-slate-700/50 dark:to-slate-700/30 p-4 flex flex-col justify-between border border-blue-100 dark:border-slate-600/50"
                >
                  <div>
                    <span
                      class="inline-block bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-xl uppercase tracking-wider mb-2"
                    >
                      Featured Drop
                    </span>
                    <h5 class="font-bold text-sm text-slate-900 dark:text-white">
                      Next-Gen Tech Gear
                    </h5>
                    <p class="text-xs text-slate-500 dark:text-slate-300 mt-1">
                      Directly sourced verified hardware releases.
                    </p>
                  </div>
                  <a
                    routerLink="/products"
                    (click)="isMegaOpen.set(false)"
                    class="text-xs font-extrabold text-blue-600 dark:text-blue-400 hover:underline mt-4 block"
                  >
                    Explore Hardware →
                  </a>
                </div>
              </div>
            }
          </div>

          <!-- COMPACT CATEGORIES DROPDOWN MENU (Preserved) -->
          <div class="relative" (mouseleave)="isCatOpen.set(false)">
            <button
              (mouseenter)="isCatOpen.set(true); isMegaOpen.set(false)"
              (click)="isCatOpen.set(!isCatOpen()); isMegaOpen.set(false)"
              [attr.aria-expanded]="isCatOpen()"
              class="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 h-11 cursor-pointer transition-colors duration-150"
            >
              <span>Categories</span>
              <svg
                class="w-3.5 h-3.5 transition-transform duration-200"
                [class.rotate-180]="isCatOpen()"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
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
                class="absolute left-0 top-11 w-52 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xl py-2 z-50 animate-fadeIn"
              >
                <a
                  routerLink="/products"
                  [queryParams]="{ category: 'Hardware' }"
                  (click)="isCatOpen.set(false)"
                  class="block px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700/80 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-150"
                >
                  💻 Hardware & Components
                </a>
                <a
                  routerLink="/products"
                  [queryParams]="{ category: 'Software' }"
                  (click)="isCatOpen.set(false)"
                  class="block px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700/80 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-150"
                >
                  ⚡ Software & Licenses
                </a>
                <a
                  routerLink="/products"
                  [queryParams]="{ category: 'Networking' }"
                  (click)="isCatOpen.set(false)"
                  class="block px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700/80 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-150"
                >
                  📡 Networking & Servers
                </a>
              </div>
            }
          </div>

          <!-- Standard Primary Nav Direct Links -->
          <a
            routerLink="/products"
            routerLinkActive="text-blue-600 dark:text-blue-400 font-bold"
            class="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-150"
          >
            All Products
          </a>
          <a
            routerLink="/best-sellers"
            routerLinkActive="text-blue-600 dark:text-blue-400 font-bold"
            class="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-150"
          >
            Best Sellers
          </a>
          <a
            routerLink="/new-arrivals"
            routerLinkActive="text-blue-600 dark:text-blue-400 font-bold"
            class="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-150"
          >
            New Arrivals
          </a>
        </div>
      </nav>

      <!-- 4. Mobile Drawer Navigation -->
      @if (isMobileOpen()) {
        <div
          class="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 pt-4 pb-6 space-y-5 shadow-2xl animate-fadeIn"
        >
          <!-- Mobile Search Field -->
          <div class="relative w-full">
            <input
              type="search"
              [value]="searchQuery()"
              (input)="searchQuery.set($any($event.target).value)"
              (keyup.enter)="onSearch()"
              placeholder="Search tech catalog..."
              aria-label="Mobile Search Bar"
              class="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 pl-4 pr-10 py-2.5 rounded-xl text-sm border-none outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <button
              (click)="onSearch()"
              aria-label="Search"
              class="absolute right-3 top-2.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
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

          <!-- Customer Shortcuts (Mobile) -->
          <div
            class="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl space-y-2 border border-slate-200/60 dark:border-slate-700/60"
          >
            <p
              class="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider px-1"
            >
              Customer Central
            </p>
            <div class="grid grid-cols-3 gap-2 text-center text-xs font-semibold">
              <a
                routerLink="/account"
                [queryParams]="{ tab: 'overview' }"
                (click)="isMobileOpen.set(false)"
                class="p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-2xs text-slate-700 dark:text-slate-200 active:bg-blue-50 transition"
              >
                Profile
              </a>
              <a
                routerLink="/account"
                [queryParams]="{ tab: 'orders' }"
                (click)="isMobileOpen.set(false)"
                class="p-2.5 bg-white dark:bg-slate-800 rounded-lg shadow-2xs text-slate-700 dark:text-slate-200 active:bg-blue-50 transition"
              >
                Orders
              </a>
              <a
                routerLink="/account"
                [queryParams]="{ tab: 'wishlist' }"
                (click)="isMobileOpen.set(false)"
                class="p-2.5 bg-white dark:bg-slate-800 rounded-lg shadow-2xs text-slate-700 dark:text-slate-200 active:bg-blue-50 transition"
              >
                Wishlist
              </a>
            </div>
          </div>

          <!-- Links Stream (Mobile) -->
          <div class="flex flex-col gap-2 font-medium text-slate-700 dark:text-slate-200 text-sm">
            <a
              routerLink="/"
              (click)="isMobileOpen.set(false)"
              class="py-2 border-b border-slate-100 dark:border-slate-800"
              >Home</a
            >
            <a
              routerLink="/products"
              (click)="isMobileOpen.set(false)"
              class="py-2 border-b border-slate-100 dark:border-slate-800"
              >Shop Full Catalog</a
            >
            <a
              routerLink="/best-sellers"
              (click)="isMobileOpen.set(false)"
              class="py-2 border-b border-slate-100 dark:border-slate-800"
              >Best Sellers</a
            >
            <a
              routerLink="/new-arrivals"
              (click)="isMobileOpen.set(false)"
              class="py-2 border-b border-slate-100 dark:border-slate-800"
              >New Arrivals</a
            >
            <a
              routerLink="/track-order"
              (click)="isMobileOpen.set(false)"
              class="py-2 text-blue-600 dark:text-blue-400 font-bold"
              >Track Live Shipment →</a
            >
          </div>
        </div>
      }
    </header>
  `,
})
export class Navbar {
  private router = inject(Router);

  public cartService = inject(CartService);
  public themeService = inject(ThemeService);
  public languageService: LanguageService = inject(LanguageService);
  public currencyService = inject(CurrencyService);

  isMobileOpen = signal<boolean>(false);
  isMegaOpen = signal<boolean>(false);
  isCatOpen = signal<boolean>(false);
  isAccountOpen = signal<boolean>(false);
  isLangOpen = signal<boolean>(false);
  searchQuery = signal<string>('');

  toggleDropdown(type: 'lang' | 'account' | 'mega' | 'cat'): void {
    this.isLangOpen.set(type === 'lang' ? !this.isLangOpen() : false);
    this.isAccountOpen.set(type === 'account' ? !this.isAccountOpen() : false);
    this.isMegaOpen.set(type === 'mega' ? !this.isMegaOpen() : false);
    this.isCatOpen.set(type === 'cat' ? !this.isCatOpen() : false);
  }

  closeAllDropdowns(): void {
    this.isLangOpen.set(false);
    this.isAccountOpen.set(false);
    this.isMegaOpen.set(false);
    this.isCatOpen.set(false);
  }

  selectLang(lang: string): void {
    this.languageService.setLanguage(lang);
    this.isLangOpen.set(false);
  }

  onSearch(): void {
    const q = this.searchQuery().trim();
    if (q) {
      this.router.navigate(['/products'], { queryParams: { q } });
      this.isMobileOpen.set(false);
      this.closeAllDropdowns();
    }
  }
}
