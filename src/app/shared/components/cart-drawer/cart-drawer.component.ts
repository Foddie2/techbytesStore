import { Component, inject, signal, effect, OnDestroy, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Core Services
import { CartService, BuyerIdentityInput } from '../../../core/services/cart';
import { CurrencyService } from '../../../core/services/currency';
import { AiChatbotService } from '../../../core/services/ai-chatbot';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (cartService.isOpen()) {
      <div class="relative z-50">
        <!-- Backdrop Overlay -->
        <div
          (click)="cartService.closeDrawer()"
          class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        ></div>

        <!-- Slide-Over Panel Container -->
        <div class="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <div
            class="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 flex flex-col shadow-2xl"
          >
            <!-- Drawer Header -->
            <div
              class="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50"
            >
              <div class="flex items-center gap-2">
                @if (step() === 'shipping') {
                  <button
                    (click)="step.set('cart')"
                    class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition flex items-center gap-1 text-xs font-bold"
                  >
                    ← Back
                  </button>
                }
                <h2 class="text-lg font-bold">
                  {{ step() === 'cart' ? 'Your Cart' : 'Express Checkout' }}
                </h2>
                @if (step() === 'cart') {
                  <span
                    class="bg-blue-600/10 text-blue-600 dark:text-blue-400 text-xs font-bold px-2.5 py-0.5 rounded-full"
                  >
                    {{ cartService.itemCount() }}
                    {{ cartService.itemCount() === 1 ? 'item' : 'items' }}
                  </span>
                }
              </div>

              <button
                (click)="cartService.closeDrawer()"
                class="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <!-- DUAL TRUST HEADER BANNER -->
            <div
              class="bg-slate-900 text-white px-4 py-2 text-[11px] font-bold flex items-center justify-between border-b border-slate-800"
            >
              <div class="flex items-center gap-1.5 text-emerald-400">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>💚 M-PESA & Global Card Ready</span>
              </div>
              <div class="flex items-center gap-1 text-slate-300">
                <span>🔒 256-Bit SSL Encrypted</span>
              </div>
            </div>

            <!-- Loading Banner -->
            @if (cartService.isLoading()) {
              <div
                class="bg-blue-600 text-white text-xs py-1.5 px-4 text-center font-medium animate-pulse"
              >
                Syncing with Shopify Storefront API...
              </div>
            }

            <!-- Drawer Body -->
            <div class="flex-1 overflow-y-auto p-5 space-y-5">
              <!-- STEP 1: CART ITEMS LIST -->
              @if (step() === 'cart') {
                @if (!cartService.cart() || cartService.cart()?.lines?.length === 0) {
                  <div
                    class="h-full flex flex-col items-center justify-center text-center space-y-4 py-16"
                  >
                    <div
                      class="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center text-2xl"
                    >
                      🛍️
                    </div>
                    <div>
                      <h3 class="text-base font-bold">Your cart is empty</h3>
                      <p class="text-xs text-slate-500 mt-1">
                        Explore verified hardware & high-margin tech accessories.
                      </p>
                    </div>
                    <button
                      (click)="cartService.closeDrawer()"
                      class="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-6 py-3 rounded-xl transition cursor-pointer"
                    >
                      Browse Full Catalog
                    </button>
                  </div>
                }

                @if (cartService.cart() && (cartService.cart()?.lines?.length || 0) > 0) {
                  <div class="space-y-4">
                    @for (item of cartService.cart()?.lines; track item.id) {
                      <div
                        class="flex gap-4 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-800"
                      >
                        <div
                          class="w-18 h-18 bg-slate-200 dark:bg-slate-900 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
                        >
                          @if (item.imageUrl) {
                            <img
                              [src]="item.imageUrl"
                              [alt]="item.productTitle"
                              class="w-full h-full object-cover"
                            />
                          } @else {
                            <span class="text-[10px] text-slate-400">No Image</span>
                          }
                        </div>

                        <div class="flex-1 flex flex-col justify-between">
                          <div>
                            <div class="flex justify-between items-start">
                              <h4 class="font-bold text-xs line-clamp-1">
                                {{ item.productTitle }}
                              </h4>

                              <button
                                (click)="cartService.removeItem(item.id)"
                                class="text-slate-400 hover:text-red-500 transition p-1 cursor-pointer"
                                title="Remove item"
                              >
                                ✕
                              </button>
                            </div>

                            @if (item.variantTitle) {
                              <p class="text-[11px] text-slate-500 mt-0.5">
                                {{ item.variantTitle }}
                              </p>
                            }
                          </div>

                          <div class="flex justify-between items-center mt-2">
                            <span class="font-extrabold text-xs">
                              {{ currencyService.formatPrice(item.price) }}
                            </span>

                            <div
                              class="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1"
                            >
                              <button
                                (click)="cartService.updateQuantity(item.id, item.quantity - 1)"
                                class="text-slate-500 hover:text-slate-900 dark:hover:text-white px-1 text-xs font-bold cursor-pointer"
                              >
                                -
                              </button>
                              <span class="text-xs font-bold w-4 text-center">{{
                                item.quantity
                              }}</span>
                              <button
                                (click)="cartService.updateQuantity(item.id, item.quantity + 1)"
                                class="text-slate-500 hover:text-slate-900 dark:hover:text-white px-1 text-xs font-bold cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    }

                    <!-- HIGH-MARGIN CART UPSELL CARD -->
                    @if (cartService.showUpsell()) {
                      <div
                        class="bg-gradient-to-r from-blue-900/10 via-indigo-900/10 to-blue-900/10 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-800/80 rounded-2xl p-3.5 space-y-3 shadow-xs"
                      >
                        <div class="flex items-center justify-between">
                          <span
                            class="bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider"
                          >
                            {{ cartService.upsellOffer().discountBadge }}
                          </span>
                          <span
                            class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold"
                          >
                            Frequently Added
                          </span>
                        </div>

                        <div class="flex gap-3 items-center">
                          <img
                            [src]="cartService.upsellOffer().imageUrl"
                            [alt]="cartService.upsellOffer().productTitle"
                            class="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                          <div class="flex-1 min-w-0">
                            <h5 class="text-xs font-bold truncate text-slate-900 dark:text-white">
                              {{ cartService.upsellOffer().productTitle }}
                            </h5>
                            <div class="flex items-center gap-2 mt-0.5">
                              <span class="text-xs font-black text-blue-600 dark:text-blue-400">
                                {{ currencyService.formatPrice(cartService.upsellOffer().price) }}
                              </span>
                              <span class="text-[10px] text-slate-400 line-through">
                                {{
                                  currencyService.formatPrice(
                                    cartService.upsellOffer().originalPrice
                                  )
                                }}
                              </span>
                            </div>
                          </div>

                          <button
                            (click)="addUpsellItem()"
                            [disabled]="cartService.isLoading()"
                            class="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3 py-2 rounded-xl shrink-0 cursor-pointer shadow-sm transition active:scale-95 disabled:opacity-50"
                          >
                            + Add Item
                          </button>
                        </div>
                      </div>
                    }
                  </div>
                }
              }

              <!-- STEP 2: SHIPPING & HYBRID PAYMENT PREFERENCE -->
              @if (step() === 'shipping') {
                <form (submit)="onNativeCheckoutSubmit($event)" class="space-y-4">
                  <!-- Country Selector -->
                  <div class="space-y-1">
                    <label class="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Destination Country / Region
                    </label>
                    <select
                      [(ngModel)]="shippingForm.countryCode"
                      name="countryCode"
                      class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 font-medium"
                    >
                      <option value="KE">Kenya 🇰🇪 (M-Pesa Express Available)</option>
                      <option value="US">United States 🇺🇸 (Credit Card / PayPal)</option>
                      <option value="GB">United Kingdom 🇬🇧 (Credit Card / Apple Pay)</option>
                      <option value="CA">Canada 🇨🇦 (Credit Card / PayPal)</option>
                      <option value="AU">Australia 🇦🇺 (Credit Card / Google Pay)</option>
                      <option value="DE">Germany 🇩🇪 (EUR Direct)</option>
                    </select>
                  </div>

                  <!-- M-PESA DYNAMIC CONTAINER FOR KENYA -->
                  @if (shippingForm.countryCode === 'KE') {
                    <div
                      class="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/80 rounded-2xl p-3.5 space-y-2"
                    >
                      <div class="flex items-center justify-between">
                        <label
                          class="text-xs font-extrabold text-emerald-900 dark:text-emerald-300"
                        >
                          💚 Safaricom M-Pesa Number
                        </label>
                        <span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          STK Push Ready
                        </span>
                      </div>

                      <input
                        type="tel"
                        [(ngModel)]="shippingForm.phone"
                        name="phone"
                        required
                        placeholder="0712345678 or 0799123456"
                        class="w-full bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700/80 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />

                      <p class="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed">
                        An instant payment prompt will be pushed to your phone. Unlock your handset
                        and enter your M-Pesa PIN to authorize payment.
                      </p>
                    </div>
                  } @else {
                    <!-- INTERNATIONAL PHONE FIELD -->
                    <div class="space-y-1">
                      <label class="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Phone Number (For Carrier Tracking Updates)
                      </label>
                      <input
                        type="tel"
                        [(ngModel)]="shippingForm.phone"
                        name="phone"
                        placeholder="+1 (555) 000-0000"
                        class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                      />
                    </div>
                  }

                  <div class="space-y-1">
                    <label class="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Email Address
                    </label>
                    <input
                      type="email"
                      [(ngModel)]="shippingForm.email"
                      name="email"
                      required
                      placeholder="buyer@example.com"
                      class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                    />
                  </div>

                  <div class="grid grid-cols-2 gap-3">
                    <div class="space-y-1">
                      <label class="text-xs font-bold text-slate-700 dark:text-slate-300">
                        First Name
                      </label>
                      <input
                        type="text"
                        [(ngModel)]="shippingForm.firstName"
                        name="firstName"
                        required
                        placeholder="John"
                        class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                      />
                    </div>
                    <div class="space-y-1">
                      <label class="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Last Name
                      </label>
                      <input
                        type="text"
                        [(ngModel)]="shippingForm.lastName"
                        name="lastName"
                        required
                        placeholder="Doe"
                        class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div class="space-y-1">
                    <label class="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Shipping Address
                    </label>
                    <input
                      type="text"
                      [(ngModel)]="shippingForm.address1"
                      name="address1"
                      required
                      placeholder="Street Address, Suite or Office No."
                      class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                    />
                  </div>

                  <div class="grid grid-cols-2 gap-3">
                    <div class="space-y-1">
                      <label class="text-xs font-bold text-slate-700 dark:text-slate-300">
                        City / Town
                      </label>
                      <input
                        type="text"
                        [(ngModel)]="shippingForm.city"
                        name="city"
                        required
                        placeholder="Nairobi or New York"
                        class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                      />
                    </div>
                    <div class="space-y-1">
                      <label class="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        [(ngModel)]="shippingForm.zip"
                        name="zip"
                        placeholder="00100 or 10001"
                        class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    [class.bg-emerald-600]="shippingForm.countryCode === 'KE'"
                    [class.hover:bg-emerald-500]="shippingForm.countryCode === 'KE'"
                    [class.bg-blue-600]="shippingForm.countryCode !== 'KE'"
                    [class.hover:bg-blue-500]="shippingForm.countryCode !== 'KE'"
                    class="w-full text-white font-bold py-3.5 rounded-xl shadow-lg transition text-sm cursor-pointer mt-4 flex items-center justify-center gap-2"
                  >
                    <span>
                      {{
                        shippingForm.countryCode === 'KE'
                          ? 'Proceed to M-Pesa STK Payment →'
                          : 'Proceed to Secure Payment →'
                      }}
                    </span>
                  </button>
                </form>
              }
            </div>

            <!-- Drawer Footer -->
            @if (cartService.cart() && (cartService.cart()?.lines?.length || 0) > 0) {
              <div
                class="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 space-y-4"
              >
                <!-- HYBRID TRUST BADGES -->
                <div
                  class="grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-slate-500"
                >
                  <div
                    class="p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800"
                  >
                    ✈️ Worldwide Shipping
                  </div>
                  <div
                    class="p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800"
                  >
                    💚 M-PESA STK
                  </div>
                  <div
                    class="p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800"
                  >
                    🔒 256-Bit SSL
                  </div>
                </div>

                <div class="flex justify-between items-center text-sm font-bold">
                  <span class="text-slate-500 dark:text-slate-400">Total Payable</span>
                  <span class="text-xl font-black">
                    {{ currencyService.formatPrice(cartService.cart()?.subtotal) }}
                  </span>
                </div>

                @if (step() === 'cart') {
                  <button
                    (click)="step.set('shipping')"
                    class="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 text-sm cursor-pointer"
                  >
                    <span>Checkout Now</span>
                    <span class="text-xs opacity-80">→</span>
                  </button>
                }
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
})
export class CartDrawerComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  public cartService = inject(CartService);
  public currencyService = inject(CurrencyService);
  public aiChatbotService = inject(AiChatbotService);
  public authService = inject(AuthService);

  step = signal<'cart' | 'shipping'>('cart');
  private abandonmentTimer: any = null;

  shippingForm: BuyerIdentityInput = {
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    address1: '',
    city: 'Nairobi',
    zip: '00100',
    countryCode: 'KE',
  };

  constructor() {
    effect(() => {
      const isOpen = this.cartService.isOpen();
      const count = this.cartService.itemCount();

      if (isOpen && count > 0) {
        this.checkAbandonmentIntent();
      } else {
        this.clearAbandonmentWatch();
      }
    });
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn() && this.authService.currentUser()) {
      const user = this.authService.currentUser();
      if (user?.email) this.shippingForm.email = user.email;
      if (user?.name) {
        const parts = user.name.split(' ');
        this.shippingForm.firstName = parts[0] || '';
        this.shippingForm.lastName = parts.slice(1).join(' ') || '';
      }
    }
  }

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  async addUpsellItem(): Promise<void> {
    const offer = this.cartService.upsellOffer();
    await this.cartService.addToCart(offer.variantId, 1);
  }

  /**
   * Proactive Cart Abandonment Trigger
   */
  private checkAbandonmentIntent(): void {
    if (!this.isBrowser) return;

    this.clearAbandonmentWatch();

    // 1. Inactivity Timer (20 Seconds)
    this.abandonmentTimer = setTimeout(() => {
      if (this.cartService.isOpen() && this.cartService.itemCount() > 0) {
        const count = this.cartService.itemCount();
        this.aiChatbotService.triggerProactiveNudge(
          `Hey! I noticed you have ${count} item${count > 1 ? 's' : ''} saved in your cart. Need any help setting up M-Pesa express payment or global shipping details?`,
        );
      }
    }, 20000);

    // 2. Mouse Exit-Intent Listener
    window.addEventListener('mouseleave', this.onMouseLeaveExitIntent);
  }

  private onMouseLeaveExitIntent = (e: MouseEvent): void => {
    if (e.clientY <= 10 && this.cartService.isOpen() && this.cartService.itemCount() > 0) {
      this.aiChatbotService.triggerProactiveNudge(
        `Wait! Before you leave, would an instant 10% discount voucher code help you complete your order today?`,
      );
      this.clearAbandonmentWatch();
    }
  };

  private clearAbandonmentWatch(): void {
    if (!this.isBrowser) return;

    if (this.abandonmentTimer) {
      clearTimeout(this.abandonmentTimer);
      this.abandonmentTimer = null;
    }
    window.removeEventListener('mouseleave', this.onMouseLeaveExitIntent);
  }

  async onNativeCheckoutSubmit(event: Event): Promise<void> {
    event.preventDefault();
    await this.cartService.updateBuyerIdentity(this.shippingForm);
    this.cartService.proceedToCheckout();
  }

  ngOnDestroy(): void {
    this.clearAbandonmentWatch();
  }
}
