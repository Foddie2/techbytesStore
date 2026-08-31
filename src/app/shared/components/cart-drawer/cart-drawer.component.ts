import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../core/services/cart';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CommonModule],
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
                <h2 class="text-xl font-bold">Your Cart</h2>
                <span
                  class="bg-blue-600/10 text-blue-600 dark:text-blue-400 text-xs font-bold px-2.5 py-0.5 rounded-full"
                >
                  {{ cartService.itemCount() }}
                  {{ cartService.itemCount() === 1 ? 'item' : 'items' }}
                </span>
              </div>

              <button
                (click)="cartService.closeDrawer()"
                class="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
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
                Updating your order with Shopify...
              </div>
            }

            <!-- Drawer Content Body -->
            <div class="flex-1 overflow-y-auto p-6 space-y-6">
              <!-- Empty Cart State -->
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
                    class="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-6 py-3 rounded-xl transition"
                  >
                    Start Shopping
                  </button>
                </div>
              }

              <!-- Cart Line Items List -->
              @if (cartService.cart() && (cartService.cart()?.lines?.length || 0) > 0) {
                <div class="space-y-4">
                  @for (item of cartService.cart()?.lines; track item.id) {
                    <div
                      class="flex gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-800"
                    >
                      <!-- Product Image -->
                      <div
                        class="w-20 h-20 bg-slate-200 dark:bg-slate-900 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
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

                      <!-- Details & Controls -->
                      <div class="flex-1 flex flex-col justify-between">
                        <div>
                          <div class="flex justify-between items-start">
                            <h4 class="font-bold text-sm line-clamp-1">{{ item.productTitle }}</h4>

                            <!-- Remove Item Button -->
                            <button
                              (click)="cartService.removeItem(item.id)"
                              class="text-slate-400 hover:text-red-500 transition p-1"
                              title="Remove item"
                            >
                              <svg
                                class="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>

                          @if (item.variantTitle) {
                            <p class="text-xs text-slate-500 mt-0.5">{{ item.variantTitle }}</p>
                          }
                        </div>

                        <div class="flex justify-between items-center mt-2">
                          <!-- Price -->
                          <span class="font-extrabold text-sm">
                            {{ formatPrice(item.price) }}
                          </span>

                          <!-- Quantity Controls -->
                          <div
                            class="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1"
                          >
                            <button
                              (click)="cartService.updateQuantity(item.id, item.quantity - 1)"
                              class="text-slate-500 hover:text-slate-900 dark:hover:text-white px-1 text-xs font-bold"
                            >
                              -
                            </button>
                            <span class="text-xs font-bold w-4 text-center">{{
                              item.quantity
                            }}</span>
                            <button
                              (click)="cartService.updateQuantity(item.id, item.quantity + 1)"
                              class="text-slate-500 hover:text-slate-900 dark:hover:text-white px-1 text-xs font-bold"
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
            </div>

            <!-- Drawer Footer (Subtotal & Checkout CTA) -->
            @if (cartService.cart() && (cartService.cart()?.lines?.length || 0) > 0) {
              <div
                class="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 space-y-4"
              >
                <div class="flex justify-between items-center text-sm font-bold">
                  <span class="text-slate-500 dark:text-slate-400">Subtotal</span>
                  <span class="text-xl font-black">
                    {{ formatPrice(cartService.cart()?.subtotal) }}
                  </span>
                </div>

                <p class="text-[11px] text-slate-500 text-center">
                  Taxes and shipping calculated at checkout.
                </p>

                <button
                  (click)="cartService.proceedToCheckout()"
                  class="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 text-sm"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  Checkout with Shopify
                </button>
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

  formatPrice(priceObj: { amount: string; currencyCode: string } | undefined): string {
    if (!priceObj || !priceObj.amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: priceObj.currencyCode || 'USD',
    }).format(parseFloat(priceObj.amount));
  }
}
