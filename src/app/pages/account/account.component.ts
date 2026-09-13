import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';

import { CartService } from '../../core/services/cart';
import { CurrencyService } from '../../core/services/currency';
import { AuthService } from '../../core/services/auth';

type TabType = 'overview' | 'cart' | 'orders' | 'wishlist' | 'privacy';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <!-- Account Central Header -->
      <div
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        <div class="flex items-center gap-4">
          <div
            class="w-16 h-16 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 font-black text-2xl flex items-center justify-center border border-blue-200 dark:border-blue-900/50 shadow-inner"
          >
            {{ userInitials() }}
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span
                class="text-xs font-extrabold uppercase text-blue-600 dark:text-blue-400 tracking-wider"
                >Account Central</span
              >
              <span
                class="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60"
              >
                Verified Customer
              </span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-0.5">
              My Customer Dashboard
            </h1>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {{ userName() }} ({{ userEmail() }})
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          @if (!authService.isLoggedIn()) {
            <button
              (click)="authService.loginWithGoogleMock()"
              class="flex items-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 shadow-xs transition cursor-pointer"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>
          } @else {
            <button
              (click)="authService.logout()"
              class="text-xs font-bold text-red-600 dark:text-red-400 hover:underline cursor-pointer px-3 py-2"
            >
              Sign Out
            </button>
          }

          <div
            class="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 px-4 py-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60"
          >
            <span class="text-lg">🛡️</span>
            <div class="text-xs">
              <span class="font-bold text-slate-900 dark:text-white block"
                >256-Bit Vault Security</span
              >
              <span class="text-slate-500">Shopify Checkout Active</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Bar -->
      <div
        class="flex border-b border-slate-200 dark:border-slate-800 gap-2 sm:gap-6 overflow-x-auto no-scrollbar"
      >
        <a
          [routerLink]="['/account']"
          [queryParams]="{ tab: 'overview' }"
          [class.border-blue-600]="activeTab() === 'overview'"
          [class.text-blue-600]="activeTab() === 'overview'"
          class="pb-3 px-2 text-sm font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition whitespace-nowrap"
          >My Account</a
        >
        <a
          [routerLink]="['/account']"
          [queryParams]="{ tab: 'cart' }"
          [class.border-blue-600]="activeTab() === 'cart'"
          [class.text-blue-600]="activeTab() === 'cart'"
          class="pb-3 px-2 text-sm font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition whitespace-nowrap flex items-center gap-2"
        >
          <span>Active Cart State</span>
          @if (cartService.itemCount() > 0) {
            <span class="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{{
              cartService.itemCount()
            }}</span>
          }
        </a>
        <a
          [routerLink]="['/account']"
          [queryParams]="{ tab: 'orders' }"
          [class.border-blue-600]="activeTab() === 'orders'"
          [class.text-blue-600]="activeTab() === 'orders'"
          class="pb-3 px-2 text-sm font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition whitespace-nowrap"
          >Orders Placed</a
        >
        <a
          [routerLink]="['/account']"
          [queryParams]="{ tab: 'wishlist' }"
          [class.border-blue-600]="activeTab() === 'wishlist'"
          [class.text-blue-600]="activeTab() === 'wishlist'"
          class="pb-3 px-2 text-sm font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition whitespace-nowrap"
          >Wishlist</a
        >
        <a
          [routerLink]="['/account']"
          [queryParams]="{ tab: 'privacy' }"
          [class.border-blue-600]="activeTab() === 'privacy'"
          [class.text-blue-600]="activeTab() === 'privacy'"
          class="pb-3 px-2 text-sm font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition whitespace-nowrap"
          >Data Protection & Privacy</a
        >
      </div>

      <!-- Content Tabs -->
      @if (activeTab() === 'overview') {
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3"
          >
            <span
              class="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block"
              >Live Cart Session</span
            >
            <h3 class="text-2xl font-black text-slate-900 dark:text-white">
              {{ cartService.itemCount() }} Items
            </h3>
            <p class="text-xs text-slate-500">Items saved in your active checkout session.</p>
            <button
              (click)="cartService.openDrawer()"
              class="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Inspect Cart Drawer →
            </button>
          </div>
          <div
            class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3"
          >
            <span
              class="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block"
              >Total Orders Placed</span
            >
            <h3 class="text-2xl font-black text-slate-900 dark:text-white">
              {{ orders().length }} Dispatches
            </h3>
            <p class="text-xs text-slate-500">Verified purchases tied to this customer account.</p>
            <a
              [routerLink]="['/account']"
              [queryParams]="{ tab: 'orders' }"
              class="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-block"
              >View Complete History →</a
            >
          </div>
          <div
            class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3"
          >
            <span
              class="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block"
              >Active Currency</span
            >
            <h3 class="text-2xl font-black text-slate-900 dark:text-white">
              {{ currencyService.selectedCurrency().code }}
            </h3>
            <p class="text-xs text-slate-500">Auto-detected regional currency rate.</p>
          </div>
        </div>
      }

      @if (activeTab() === 'orders') {
        <div
          class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6"
        >
          <div class="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">Orders Ever Placed</h3>
            <p class="text-xs text-slate-500">
              Official order fulfillment records synced directly with Shopify API.
            </p>
          </div>
          <div class="space-y-4">
            @for (order of orders(); track order.id) {
              <div
                class="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 bg-slate-50/50 dark:bg-slate-800/30"
              >
                <div
                  class="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-3"
                >
                  <div>
                    <span class="text-xs font-bold text-blue-600 dark:text-blue-400"
                      >Order {{ order.orderNumber }}</span
                    >
                    <span class="text-xs text-slate-400 block sm:inline sm:ml-2"
                      >Placed on {{ order.date }}</span
                    >
                  </div>
                  <span
                    class="text-xs font-bold px-3 py-1 rounded-full w-max"
                    [class]="order.statusClass"
                    >{{ order.fulfillmentStatus }}</span
                  >
                </div>
                <div class="flex items-center justify-between">
                  <div class="text-xs text-slate-600 dark:text-slate-300">
                    <span>{{ order.itemCount }} Items</span> •
                    <span class="font-bold text-slate-900 dark:text-white">{{
                      currencyService.formatPrice({
                        amount: order.totalAmount,
                        currencyCode: 'USD',
                      })
                    }}</span>
                  </div>
                  <a
                    [routerLink]="['/track-order']"
                    [queryParams]="{ order: order.orderNumber }"
                    class="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >Track Shipment →</a
                  >
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class AccountComponent implements OnInit {
  private route = inject(ActivatedRoute);
  public cartService = inject(CartService);
  public currencyService = inject(CurrencyService);
  public authService = inject(AuthService);

  activeTab = signal<TabType>('overview');

  userName = computed(() => this.authService.currentUser()?.name || 'Valued Customer');
  userEmail = computed(() => this.authService.currentUser()?.email || 'customer@keyanna.com');
  userInitials = computed(() => this.authService.currentUser()?.initials || 'VC');

  orders = signal([
    {
      id: 'gid://shopify/Order/1001',
      orderNumber: '#KA-1094',
      date: 'Sep 02, 2026',
      fulfillmentStatus: 'Dispatched & Tracked',
      statusClass:
        'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60',
      itemCount: 2,
      totalAmount: 180.0,
    },
    {
      id: 'gid://shopify/Order/1000',
      orderNumber: '#KA-1042',
      date: 'Aug 14, 2026',
      fulfillmentStatus: 'Delivered',
      statusClass:
        'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60',
      itemCount: 1,
      totalAmount: 65.0,
    },
  ]);

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const tab = params['tab'] as TabType;
      if (tab && ['overview', 'cart', 'orders', 'wishlist', 'privacy'].includes(tab)) {
        this.activeTab.set(tab);
      } else {
        this.activeTab.set('overview');
      }
    });
  }
}
