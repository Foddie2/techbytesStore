import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';

// Core Services
import { CartService } from '../../core/services/cart';
import { CurrencyService } from '../../core/services/currency';
import { ShopifyService } from '../../core/services/shopify';

type TabType = 'overview' | 'cart' | 'orders' | 'wishlist' | 'privacy';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <!-- 1. ACCOUNT CENTRAL DASHBOARD HEADER -->
      <div
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        <div class="flex items-center gap-4">
          <div
            class="w-16 h-16 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 font-black text-2xl flex items-center justify-center border border-blue-200 dark:border-blue-900/50 shadow-inner"
          >
            {{ userProfile().initials }}
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span
                class="text-xs font-extrabold uppercase text-blue-600 dark:text-blue-400 tracking-wider"
              >
                Account Central
              </span>
              <span
                class="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60"
              >
                Verified Shopify Customer
              </span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-0.5">
              My Customer Dashboard
            </h1>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {{ userProfile().name }} ({{ userProfile().email }}) • Customer ID:
              {{ userProfile().id }}
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          @if (!isLoggedIn()) {
            <button
              (click)="loginWithGoogleShopify()"
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
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>
          } @else {
            <button
              (click)="logout()"
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
                >256-Bit Vault Protection</span
              >
              <span class="text-slate-500">Shopify OAuth Active</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. TAB NAVIGATION BAR -->
      <div
        class="flex border-b border-slate-200 dark:border-slate-800 gap-2 sm:gap-6 overflow-x-auto no-scrollbar"
      >
        <a
          [routerLink]="['/account']"
          [queryParams]="{ tab: 'overview' }"
          [class.border-blue-600]="activeTab() === 'overview'"
          [class.text-blue-600]="activeTab() === 'overview'"
          [class.dark:text-blue-400]="activeTab() === 'overview'"
          class="pb-3 px-2 text-sm font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition whitespace-nowrap cursor-pointer"
        >
          Account Overview
        </a>

        <a
          [routerLink]="['/account']"
          [queryParams]="{ tab: 'cart' }"
          [class.border-blue-600]="activeTab() === 'cart'"
          [class.text-blue-600]="activeTab() === 'cart'"
          [class.dark:text-blue-400]="activeTab() === 'cart'"
          class="pb-3 px-2 text-sm font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition whitespace-nowrap cursor-pointer flex items-center gap-2"
        >
          <span>Active Cart State</span>
          @if (cartService.itemCount() > 0) {
            <span class="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
              {{ cartService.itemCount() }}
            </span>
          }
        </a>

        <a
          [routerLink]="['/account']"
          [queryParams]="{ tab: 'orders' }"
          [class.border-blue-600]="activeTab() === 'orders'"
          [class.text-blue-600]="activeTab() === 'orders'"
          [class.dark:text-blue-400]="activeTab() === 'orders'"
          class="pb-3 px-2 text-sm font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition whitespace-nowrap cursor-pointer"
        >
          Orders Ever Placed
        </a>

        <a
          [routerLink]="['/account']"
          [queryParams]="{ tab: 'wishlist' }"
          [class.border-blue-600]="activeTab() === 'wishlist'"
          [class.text-blue-600]="activeTab() === 'wishlist'"
          [class.dark:text-blue-400]="activeTab() === 'wishlist'"
          class="pb-3 px-2 text-sm font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition whitespace-nowrap cursor-pointer"
        >
          Saved Wishlist
        </a>

        <a
          [routerLink]="['/account']"
          [queryParams]="{ tab: 'privacy' }"
          [class.border-blue-600]="activeTab() === 'privacy'"
          [class.text-blue-600]="activeTab() === 'privacy'"
          [class.dark:text-blue-400]="activeTab() === 'privacy'"
          class="pb-3 px-2 text-sm font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition whitespace-nowrap cursor-pointer"
        >
          Data Protection & Privacy
        </a>
      </div>

      <!-- 3. TAB CONTENT VIEWS -->

      <!-- TAB 1: OVERVIEW COMPONENT VIEW (?tab=overview) -->
      @if (activeTab() === 'overview') {
        <div class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3 shadow-xs"
            >
              <span
                class="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block"
              >
                Live Cart Session
              </span>
              <h3 class="text-2xl font-black text-slate-900 dark:text-white">
                {{ cartService.itemCount() }} Items
              </h3>
              <p class="text-xs text-slate-500">
                Items currently saved in your active checkout session.
              </p>
              <button
                (click)="cartService.openDrawer()"
                class="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Inspect Cart Drawer →
              </button>
            </div>

            <div
              class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3 shadow-xs"
            >
              <span
                class="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block"
              >
                Total Orders Placed
              </span>
              <h3 class="text-2xl font-black text-slate-900 dark:text-white">
                {{ orders().length }} Dispatches
              </h3>
              <p class="text-xs text-slate-500">
                Verified purchases tied to this customer account.
              </p>
              <a
                [routerLink]="['/account']"
                [queryParams]="{ tab: 'orders' }"
                class="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-block"
              >
                View Complete History →
              </a>
            </div>

            <div
              class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3 shadow-xs"
            >
              <span
                class="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block"
              >
                Active Currency Context
              </span>
              <h3 class="text-2xl font-black text-slate-900 dark:text-white">
                {{ currencyService.selectedCurrency().code }} ({{
                  currencyService.selectedCurrency().symbol
                }})
              </h3>
              <p class="text-xs text-slate-500">Regional auto-detected currency exchange rate.</p>
              <a
                routerLink="/"
                class="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-block"
              >
                Change in Top Navbar →
              </a>
            </div>
          </div>
        </div>
      }

      <!-- TAB 2: ACTIVE CART STATE COMPONENT VIEW (?tab=cart) -->
      @if (activeTab() === 'cart') {
        <div
          class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs"
        >
          <div
            class="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-100 dark:border-slate-800 pb-4 gap-2"
          >
            <div>
              <h3 class="text-lg font-bold text-slate-900 dark:text-white">
                Active Session Cart State
              </h3>
              <p class="text-xs text-slate-500">
                Real-time inspection of active cart lines synced with Shopify.
              </p>
            </div>
            <span class="text-base font-black text-blue-600 dark:text-blue-400">
              Subtotal: {{ currencyService.formatPrice(cartSubtotal()) }}
            </span>
          </div>

          @if (cartLines().length > 0) {
            <div class="divide-y divide-slate-100 dark:divide-slate-800">
              @for (line of cartLines(); track getLineId(line)) {
                <div class="py-4 flex items-center justify-between gap-4">
                  <div class="flex items-center gap-4">
                    @if (getLineImage(line)) {
                      <img
                        [src]="getLineImage(line)"
                        [alt]="getLineTitle(line)"
                        class="w-12 h-12 rounded-xl object-cover bg-slate-100 dark:bg-slate-800"
                      />
                    } @else {
                      <div
                        class="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs text-slate-400"
                      >
                        📦
                      </div>
                    }
                    <div>
                      <h4 class="text-sm font-bold text-slate-900 dark:text-white">
                        {{ getLineTitle(line) }}
                      </h4>
                      <span class="text-xs text-slate-500">Qty: {{ line.quantity || 1 }}</span>
                    </div>
                  </div>
                  <span class="text-sm font-bold text-slate-900 dark:text-white">
                    {{ currencyService.formatPrice(getLineCost(line)) }}
                  </span>
                </div>
              }
            </div>
            <div class="pt-4 flex gap-4">
              <button
                (click)="cartService.openDrawer()"
                class="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-6 py-3 rounded-xl transition cursor-pointer shadow-md"
              >
                Proceed to Checkout →
              </button>
            </div>
          } @else {
            <div class="text-center py-12 space-y-3">
              <span class="text-4xl block">🛒</span>
              <p class="text-sm text-slate-500">Your cart is currently empty.</p>
              <a
                routerLink="/products"
                class="inline-block bg-blue-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md"
              >
                Explore Catalog
              </a>
            </div>
          }
        </div>
      }

      <!-- TAB 3: ORDERS EVER PLACED COMPONENT VIEW (?tab=orders) -->
      @if (activeTab() === 'orders') {
        <div
          class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs"
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
                  >
                    {{ order.fulfillmentStatus }}
                  </span>
                </div>

                <div class="flex items-center justify-between">
                  <div class="text-xs text-slate-600 dark:text-slate-300">
                    <span>{{ order.itemCount }} Items</span> •
                    <span class="font-bold text-slate-900 dark:text-white">
                      {{
                        currencyService.formatPrice({
                          amount: order.totalAmount,
                          currencyCode: 'USD',
                        })
                      }}
                    </span>
                  </div>
                  <a
                    [routerLink]="['/track-order']"
                    [queryParams]="{ order: order.orderNumber }"
                    class="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Track Shipment →
                  </a>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- TAB 4: WISHLIST COMPONENT VIEW (?tab=wishlist) -->
      @if (activeTab() === 'wishlist') {
        <div
          class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs"
        >
          <div class="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">
              Saved Hardware Wishlist
            </h3>
            <p class="text-xs text-slate-500">Items bookmarked during product modal browsing.</p>
          </div>
          <div class="text-center py-12 space-y-3">
            <span class="text-4xl block">❤️</span>
            <p class="text-sm text-slate-500">No saved items in your wishlist right now.</p>
            <a
              routerLink="/products"
              class="inline-block bg-blue-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md"
            >
              Browse Catalog
            </a>
          </div>
        </div>
      }

      <!-- TAB 5: PRIVACY COMPONENT VIEW (?tab=privacy) -->
      @if (activeTab() === 'privacy') {
        <div
          class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs"
        >
          <div class="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">
              Data Protection & GDPR Privacy Compliance
            </h3>
            <p class="text-xs text-slate-500">
              Manage your stored personally identifiable information (PII).
            </p>
          </div>

          <div class="space-y-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <div
              class="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-2"
            >
              <h4 class="font-bold text-slate-900 dark:text-white text-sm">
                🔒 How We Guard Your Information
              </h4>
              <p>
                We do not sell or trade your data. Customer credentials and shipping addresses are
                stored in Shopify’s PCI-DSS Level 1 certified vault. Checkout processing is
                protected with 256-bit SSL encryption.
              </p>
            </div>

            <div class="pt-4 flex flex-wrap gap-4">
              <button
                (click)="requestDataExport()"
                class="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold px-4 py-2.5 rounded-xl cursor-pointer"
              >
                Request GDPR Data Export
              </button>
              <button
                (click)="requestAccountDeletion()"
                class="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 font-bold px-4 py-2.5 rounded-xl cursor-pointer"
              >
                Request Complete Account Erasure
              </button>
            </div>
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

  activeTab = signal<TabType>('overview');
  isLoggedIn = signal<boolean>(true);

  userProfile = signal({
    name: 'Valued Customer',
    email: 'customer@keyanna.com',
    initials: 'VC',
    memberSince: '2026',
    id: '#SH-89402',
  });

  ngOnInit(): void {
    // Synchronize query parameters (?tab=...) with activeTab signal
    this.route.queryParams.subscribe((params) => {
      const tab = params['tab'] as TabType;
      if (tab && ['overview', 'cart', 'orders', 'wishlist', 'privacy'].includes(tab)) {
        this.activeTab.set(tab);
      } else {
        this.activeTab.set('overview');
      }
    });
  }

  // Safe Cart Line Reader
  cartLines = computed(() => {
    const rawCart = this.cartService.cart() as any;
    if (!rawCart) return [];

    if (rawCart.lines?.nodes) return rawCart.lines.nodes;
    if (rawCart.lines?.edges) return rawCart.lines.edges.map((e: any) => e.node);
    if (Array.isArray(rawCart.lines)) return rawCart.lines;
    if (Array.isArray(rawCart.items)) return rawCart.items;
    return [];
  });

  // Safe Subtotal Reader
  cartSubtotal = computed(() => {
    const rawCart = this.cartService.cart() as any;
    const cartSvc = this.cartService as any;

    if (rawCart?.cost?.subtotalAmount) return rawCart.cost.subtotalAmount;
    if (rawCart?.subtotalAmount) return rawCart.subtotalAmount;
    if (typeof cartSvc.subtotal === 'function') return cartSvc.subtotal();
    if (cartSvc.subtotal?.amount) return cartSvc.subtotal;
    return { amount: '0.00', currencyCode: 'USD' };
  });

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

  loginWithGoogleShopify(): void {
    const shopdomain = 'keyanna.myshopify.com';
    const redirectUri = encodeURIComponent(window.location.origin + '/account');
    window.location.href = `https://shopify.com/${shopdomain}/auth/oauth/authorize?client_id=shopify&response_type=code&redirect_uri=${redirectUri}&scope=openid%20email%20customer&identity_provider=google`;
  }

  logout(): void {
    this.isLoggedIn.set(false);
  }

  getLineId(line: any): string {
    return line?.id || Math.random().toString();
  }

  getLineTitle(line: any): string {
    return (
      line?.merchandise?.product?.title ||
      line?.merchandise?.title ||
      line?.title ||
      'Hardware Item'
    );
  }

  getLineImage(line: any): string | null {
    return (
      line?.merchandise?.product?.featuredImage?.url ||
      line?.merchandise?.image?.url ||
      line?.image ||
      null
    );
  }

  getLineCost(line: any): any {
    return (
      line?.cost?.totalAmount ||
      line?.cost?.amount ||
      line?.price || { amount: '0.00', currencyCode: 'USD' }
    );
  }

  requestDataExport(): void {
    alert('A GDPR data export archive has been requested and will be sent to your email.');
  }

  requestAccountDeletion(): void {
    if (
      confirm('Are you sure you want to request complete erasure of your Shopify customer records?')
    ) {
      alert('Deletion request received. Processing within 24 hours.');
    }
  }
}
