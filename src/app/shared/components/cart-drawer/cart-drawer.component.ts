import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../core/services/cart';
import { CurrencyService } from '../../../core/services/currency';

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
              class="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between"
            >
              <div class="flex items-center gap-2">
                @if (step() === 'shipping') {
                  <button
                    (click)="step.set('cart')"
                    class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    ←
                  </button>
                }
                <h2 class="text-xl font-bold">
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

            <!-- Loading Banner -->
            @if (cartService.isLoading()) {
              <div
                class="bg-blue-600 text-white text-xs py-1.5 px-4 text-center font-medium animate-pulse"
              >
                Syncing with Shopify Storefront API...
              </div>
            }

            <!-- Drawer Body -->
            <div class="flex-1 overflow-y-auto p-6 space-y-6">
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
                        Discover smart tools designed for everyday life.
                      </p>
                    </div>
                    <button
                      (click)="cartService.closeDrawer()"
                      class="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-6 py-3 rounded-xl transition cursor-pointer"
                    >
                      Start Shopping
                    </button>
                  </div>
                }

                @if (cartService.cart() && (cartService.cart()?.lines?.length || 0) > 0) {
                  <div class="space-y-4">
                    @for (item of cartService.cart()?.lines; track item.id) {
                      <div
                        class="flex gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-800"
                      >
                        <div
                          class="w-20 h-20 bg-slate-200 dark:bg-slate-900 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
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
                              <h4 class="font-bold text-sm line-clamp-1">
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
                              <p class="text-xs text-slate-500 mt-0.5">{{ item.variantTitle }}</p>
                            }
                          </div>

                          <div class="flex justify-between items-center mt-2">
                            <span class="font-extrabold text-sm">
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
                  </div>
                }
              }

              <!-- STEP 2: NATIVE IN-APP SHIPPING & CUSTOMER DETAILS -->
              @if (step() === 'shipping') {
                <form (submit)="onNativeCheckoutSubmit($event)" class="space-y-4">
                  <div class="space-y-1">
                    <label class="text-xs font-bold text-slate-700 dark:text-slate-300"
                      >Email Address</label
                    >
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
                      <label class="text-xs font-bold text-slate-700 dark:text-slate-300"
                        >First Name</label
                      >
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
                      <label class="text-xs font-bold text-slate-700 dark:text-slate-300"
                        >Last Name</label
                      >
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
                    <label class="text-xs font-bold text-slate-700 dark:text-slate-300"
                      >Shipping Address</label
                    >
                    <input
                      type="text"
                      [(ngModel)]="shippingForm.address1"
                      name="address1"
                      required
                      placeholder="123 Commerce St"
                      class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                    />
                  </div>

                  <div class="grid grid-cols-2 gap-3">
                    <div class="space-y-1">
                      <label class="text-xs font-bold text-slate-700 dark:text-slate-300"
                        >City</label
                      >
                      <input
                        type="text"
                        [(ngModel)]="shippingForm.city"
                        name="city"
                        required
                        placeholder="New York"
                        class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                      />
                    </div>
                    <div class="space-y-1">
                      <label class="text-xs font-bold text-slate-700 dark:text-slate-300"
                        >Zip / Postal Code</label
                      >
                      <input
                        type="text"
                        [(ngModel)]="shippingForm.zip"
                        name="zip"
                        required
                        placeholder="10001"
                        class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    class="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition text-sm cursor-pointer mt-4"
                  >
                    Proceed to Encrypted Payment →
                  </button>
                </form>
              }
            </div>

            <!-- Drawer Footer -->
            @if (cartService.cart() && (cartService.cart()?.lines?.length || 0) > 0) {
              <div
                class="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 space-y-4"
              >
                <div class="flex justify-between items-center text-sm font-bold">
                  <span class="text-slate-500 dark:text-slate-400">Subtotal</span>
                  <span class="text-xl font-black">
                    {{ currencyService.formatPrice(cartService.cart()?.subtotal) }}
                  </span>
                </div>

                @if (step() === 'cart') {
                  <button
                    (click)="step.set('shipping')"
                    class="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 text-sm cursor-pointer"
                  >
                    Checkout Now
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
export class CartDrawerComponent {
  public cartService = inject(CartService);
  public currencyService = inject(CurrencyService);

  step = signal<'cart' | 'shipping'>('cart');

  shippingForm = {
    email: '',
    firstName: '',
    lastName: '',
    address1: '',
    city: '',
    zip: '',
  };

  formatPrice(priceObj: { amount: string; currencyCode: string } | undefined): string {
    if (!priceObj || !priceObj.amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: priceObj.currencyCode || 'USD',
    }).format(parseFloat(priceObj.amount));
  }

  async onNativeCheckoutSubmit(event: Event): Promise<void> {
    event.preventDefault();
    // Pre-fills customer info on Shopify cart before finalizing checkout
    await this.cartService.updateBuyerIdentity(this.shippingForm);
    this.cartService.proceedToCheckout();
  }
}
