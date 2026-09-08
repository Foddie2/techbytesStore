import { Component, OnInit, signal, computed, inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShopifyService } from '../../core/services/shopify';
import { CartService } from '../../core/services/cart';
import { CurrencyService } from '../../core/services/currency';
import { HeroComponent } from '../../shared/components/hero/hero.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeroComponent, ProductCardComponent],
  template: `
    <div class="space-y-16 pb-16 overflow-x-hidden">
      <!-- Hero Section -->
      <app-hero />

      <!-- Trust / Benefits Bar -->
      <section class="max-w-7xl mx-auto px-4 pt-12">
        <div
          class="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-xs text-center"
        >
          <div class="space-y-1">
            <span class="text-2xl">🚚</span>
            <h4 class="font-bold text-slate-900 dark:text-white text-lg">
              Global Express Delivery
            </h4>
            <p class="text-sm text-slate-500">
              Tracked shipping on orders over
              {{ currencyService.formatPrice({ amount: 50, currencyCode: 'USD' }) }}
            </p>
          </div>
          <div class="space-y-1">
            <span class="text-2xl">🛡️</span>
            <h4 class="font-bold text-slate-900 dark:text-white text-lg">30-Day Money Back</h4>
            <p class="text-sm text-slate-500">Hassle-free return policy</p>
          </div>
          <div class="space-y-1">
            <span class="text-2xl">🔒</span>
            <h4 class="font-bold text-slate-900 dark:text-white text-lg">Encrypted Checkout</h4>
            <p class="text-sm text-slate-500">Protected via 256-bit SSL</p>
          </div>
          <div class="space-y-1">
            <span class="text-2xl">💬</span>
            <h4 class="font-bold text-slate-900 dark:text-white text-lg">24/7 Dedicated Support</h4>
            <p class="text-sm text-slate-500">Fast email response times</p>
          </div>
        </div>
      </section>

      <!-- Featured Products (Horizontal Left-to-Right Scroll with Flanking Arrows & Infinite Shimmer) -->
      <section id="featured-products" class="max-w-7xl mx-auto px-4">
        <div class="mb-8">
          <span class="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest"
            >Real-time Catalog</span
          >
          <h2 class="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Featured Drops
          </h2>
          <p class="text-slate-500 text-sm mt-1">
            Swipe or use flanking navigation arrows to explore featured hardware drops.
          </p>
        </div>

        @if (isLoading()) {
          <div class="text-center py-16 text-slate-500">
            <div
              class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"
            ></div>
            Syncing catalog...
          </div>
        }

        @if (!isLoading() && products().length > 0) {
          <!-- Relative Row Flanked by Side Navigation Arrows -->
          <div class="relative group">
            <!-- Left Flanking Arrow -->
            <button
              (click)="scrollFeatured('left')"
              aria-label="Scroll Left"
              class="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full border border-slate-200/80 dark:border-slate-700/80 bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 hover:scale-110 transition-all duration-200 shadow-md cursor-pointer backdrop-blur-xs opacity-90 sm:opacity-0 sm:group-hover:opacity-100 active:scale-95"
            >
              ←
            </button>

            <!-- Horizontal Scroll Container -->
            <div
              #featuredContainer
              (scroll)="onFeaturedScroll($event)"
              class="flex gap-6 overflow-x-auto scroll-smooth pb-4 px-1 no-scrollbar snap-x snap-mandatory"
            >
              @for (product of products(); track product.id) {
                <div class="w-72 sm:w-80 flex-shrink-0 snap-start">
                  <app-product-card
                    [product]="product"
                    (selectProduct)="openProductModal($event)"
                  />
                </div>
              }

              <!-- Infinite Loading Shimmer Skeleton Cards -->
              @if (isLoadingMore()) {
                @for (shimmer of [1, 2]; track shimmer) {
                  <div
                    class="w-72 sm:w-80 flex-shrink-0 snap-start bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 space-y-4 animate-pulse"
                  >
                    <div
                      class="w-full h-48 bg-slate-200 dark:bg-slate-700/60 rounded-xl relative overflow-hidden"
                    >
                      <div
                        class="absolute inset-0 bg-linear-to-r from-transparent via-white/20 dark:via-slate-600/20 to-transparent animate-shimmer"
                      ></div>
                    </div>
                    <div class="h-4 bg-slate-200 dark:bg-slate-700/60 rounded w-3/4"></div>
                    <div class="h-3 bg-slate-200 dark:bg-slate-700/60 rounded w-1/2"></div>
                    <div
                      class="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex justify-between items-center"
                    >
                      <div class="h-6 bg-slate-200 dark:bg-slate-700/60 rounded w-20"></div>
                      <div class="h-8 bg-slate-200 dark:bg-slate-700/60 rounded w-24"></div>
                    </div>
                  </div>
                }
              }
            </div>

            <!-- Right Flanking Arrow -->
            <button
              (click)="scrollFeatured('right')"
              aria-label="Scroll Right"
              class="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full border border-slate-200/80 dark:border-slate-700/80 bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 hover:scale-110 transition-all duration-200 shadow-md cursor-pointer backdrop-blur-xs opacity-90 sm:opacity-0 sm:group-hover:opacity-100 active:scale-95"
            >
              →
            </button>
          </div>
        }
      </section>

      <!-- Top Selling Items Showcase -->
      <section class="max-w-7xl mx-auto px-4">
        <div
          class="bg-linear-to-br from-slate-900 via-slate-900 to-blue-950 rounded-3xl p-6 sm:p-10 border border-slate-800 text-white shadow-2xl"
        >
          <div
            class="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4"
          >
            <div>
              <span
                class="inline-block bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider mb-2"
              >
                🔥 High Demand
              </span>
              <h2 class="text-2xl sm:text-3xl font-black text-white">Top Selling Items</h2>
              <p class="text-slate-400 text-sm mt-1">
                Most ordered hardware & gear based on customer re-order volume.
              </p>
            </div>
            <a
              href="#featured-products"
              class="text-xs font-bold text-blue-400 hover:text-blue-300 underline"
            >
              View Full Collection →
            </a>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            @for (product of topSellingProducts(); track product.id; let i = $index) {
              <div
                (click)="openProductModal(product)"
                class="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between hover:border-amber-500/60 hover:shadow-xl transition-all duration-300 cursor-pointer group"
              >
                <div>
                  <!-- Badge & Image Container -->
                  <div class="relative w-full h-48 bg-slate-900 rounded-xl overflow-hidden mb-4">
                    <span
                      class="absolute top-2 left-2 z-10 bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow"
                    >
                      #{{ i + 1 }} Bestseller
                    </span>
                    @if (getModalImages(product)[0]) {
                      <img
                        [src]="getModalImages(product)[0]"
                        [alt]="product.title"
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    }
                  </div>

                  <h3
                    class="font-bold text-white text-base truncate group-hover:text-blue-400 transition-colors"
                  >
                    {{ product.title }}
                  </h3>
                  <p class="text-slate-400 text-xs line-clamp-2 mt-1">
                    {{ product.description }}
                  </p>
                </div>

                <div
                  class="pt-4 border-t border-slate-700/60 flex items-center justify-between mt-4"
                >
                  <div>
                    <span class="text-xs text-slate-400 block">Price</span>
                    <span class="text-lg font-black text-white">
                      {{ currencyService.formatPrice(getProductPrice(product)) }}
                    </span>
                  </div>
                  <button
                    (click)="$event.stopPropagation(); addProductToCart(product)"
                    class="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-md cursor-pointer"
                  >
                    Quick Add
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- Top Brands Section -->
      <section class="max-w-7xl mx-auto px-4">
        <div class="bg-slate-900 rounded-3xl p-8 border border-slate-800">
          <p class="text-center text-xs font-bold text-blue-400 uppercase tracking-widest mb-6">
            Trusted Hardware Partners & Brands
          </p>
          <div
            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 items-center text-center opacity-70"
          >
            @for (brand of topBrands; track brand) {
              <div
                class="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:opacity-100 hover:border-blue-500 transition cursor-default"
              >
                <span class="font-extrabold text-slate-200 text-sm tracking-wider uppercase">{{
                  brand
                }}</span>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- Problem → Solution Section -->
      <section class="bg-slate-100 dark:bg-slate-900 py-16">
        <div class="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div class="space-y-4">
            <span class="text-sm font-bold text-blue-600 uppercase tracking-widest"
              >The Problem</span
            >
            <h3 class="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white">
              Overpriced Electronics With Unreliable Shipping Times.
            </h3>
            <p class="text-slate-600 dark:text-slate-400 text-md leading-relaxed">
              Most online electronics dropshippers use slow fulfillment channels with unverified
              product quality, resulting in weeks of waiting and defective gear.
            </p>
          </div>
          <div
            class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 rounded-2xl shadow-xs space-y-4"
          >
            <span class="text-sm font-bold text-emerald-500 uppercase tracking-widest"
              >Our Solution</span
            >
            <h4 class="text-xl font-bold text-slate-900 dark:text-white">
              Direct-API Verified Sourcing
            </h4>
            <p class="text-slate-600 dark:text-slate-400 text-md leading-relaxed">
              TechBytes integrates direct Shopify inventory pipelines to guarantee real-time stock
              levels, fast dispatching, and strict quality checks before items leave the warehouse.
            </p>
          </div>
        </div>
      </section>

      <!-- Top Rated Hardware (Marquee Scroll) -->
      <section class="max-w-7xl mx-auto px-4 overflow-hidden">
        <h2 class="text-2xl font-extrabold text-slate-900 dark:text-white mb-6">
          Top Rated Hardware
        </h2>

        <div class="relative w-full overflow-hidden group">
          <div
            class="flex gap-6 animate-marquee hover:[animation-play-state:paused] whitespace-nowrap"
          >
            @for (product of marqueeProducts(); track $index) {
              <div
                (click)="openProductModal(product)"
                class="w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex gap-4 items-center flex-shrink-0 cursor-pointer hover:border-blue-500 transition-all shadow-xs"
              >
                <div
                  class="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden flex-shrink-0"
                >
                  @if (getModalImages(product)[0]) {
                    <img
                      [src]="getModalImages(product)[0]"
                      [alt]="product.title"
                      class="w-full h-full object-cover"
                    />
                  }
                </div>
                <div class="flex-1 overflow-hidden">
                  <h4 class="font-bold text-slate-900 dark:text-white text-sm truncate">
                    {{ product.title }}
                  </h4>
                  <p class="text-xs font-bold text-blue-600 mt-1">
                    {{ currencyService.formatPrice(getProductPrice(product)) }}
                  </p>
                  <span class="text-xs text-slate-500 dark:text-slate-400 underline mt-2 block">
                    Quick View →
                  </span>
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- FAQ Section -->
      <section id="faq" class="max-w-4xl mx-auto px-4">
        <h2 class="text-2xl font-extrabold text-slate-900 dark:text-white text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div class="space-y-4">
          <details
            class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 cursor-pointer"
          >
            <summary class="font-bold text-slate-900 dark:text-white text-lg">
              How long does shipping take?
            </summary>
            <p class="text-sm text-slate-500 mt-2">
              Standard fulfillment processes orders within 24-48 hours. Delivery averages 3-7
              business days depending on location.
            </p>
          </details>
          <details
            class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 cursor-pointer"
          >
            <summary class="font-bold text-slate-900 dark:text-white text-lg">
              What is your return policy?
            </summary>
            <p class="text-sm text-slate-500 mt-2">
              We offer a 30-day return window on all unused hardware items in original packaging.
            </p>
          </details>
          <details
            class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 cursor-pointer"
          >
            <summary class="font-bold text-slate-900 dark:text-white text-lg">
              How do I track my order?
            </summary>
            <p class="text-sm text-slate-500 mt-2">
              Once dispatched, a tracking ID is generated and sent via email for live carrier status
              monitoring.
            </p>
          </details>
        </div>
      </section>
    </div>

    <!-- PRODUCT SHOWCASE MULTI-MODAL -->
    @if (selectedProduct()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-fadeIn"
        (click)="closeProductModal()"
      >
        <div
          (click)="$event.stopPropagation()"
          class="relative w-full max-w-4xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-y-auto p-6 sm:p-8 space-y-8 no-scrollbar"
        >
          <!-- Close Button -->
          <button
            (click)="closeProductModal()"
            aria-label="Close modal"
            class="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition cursor-pointer z-10"
          >
            ✕
          </button>

          <!-- Top Grid: Image Showcase Gallery & Product Info -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <!-- Left Column: Image Preview Gallery & Wishlist Toggle -->
            <div class="space-y-4">
              <div
                class="relative w-full h-80 bg-slate-100 dark:bg-slate-950 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 flex items-center justify-center"
              >
                @if (activeModalImage()) {
                  <img
                    [src]="activeModalImage()"
                    [alt]="selectedProduct()?.title"
                    class="w-full h-full object-cover transition-all duration-300"
                  />
                } @else {
                  <span class="text-slate-400 text-sm">No Preview Image</span>
                }

                <!-- Wishlist Heart Toggle Button -->
                <button
                  (click)="toggleWishlist()"
                  [class.text-red-500]="isWishlisted()"
                  [class.bg-red-50]="isWishlisted()"
                  class="absolute top-3 right-3 p-2.5 rounded-full bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-md hover:scale-110 transition cursor-pointer text-slate-400"
                  title="Toggle Wishlist"
                >
                  <svg
                    class="w-5 h-5"
                    [attr.fill]="isWishlisted() ? 'currentColor' : 'none'"
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
                </button>
              </div>

              <!-- Thumbnails Selector Row -->
              @if (getModalImages(selectedProduct()).length > 1) {
                <div class="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  @for (imgUrl of getModalImages(selectedProduct()); track $index) {
                    <button
                      (click)="activeImageIndex.set($index)"
                      [class.ring-2]="activeImageIndex() === $index"
                      class="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 flex-shrink-0 cursor-pointer ring-blue-600 transition"
                    >
                      <img
                        [src]="imgUrl"
                        [alt]="'Thumbnail ' + $index"
                        class="w-full h-full object-cover"
                      />
                    </button>
                  }
                </div>
              }
            </div>

            <!-- Right Column: Details, Brand Badge & Regional Pricing -->
            <div class="space-y-5">
              <div>
                <span
                  class="inline-block bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-2"
                >
                  {{ getBrandName(selectedProduct()) }}
                </span>
                <h3 class="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                  {{ selectedProduct()?.title }}
                </h3>
              </div>

              <!-- Regional Converted Pricing -->
              <div class="flex items-baseline gap-3">
                <span class="text-3xl font-black text-slate-900 dark:text-white">
                  {{ currencyService.formatPrice(getProductPrice(selectedProduct())) }}
                </span>
                @if (selectedProduct()?.variants?.edges?.[0]?.node?.compareAtPrice?.amount) {
                  <span class="text-sm text-slate-400 line-through">
                    {{
                      currencyService.formatPrice(
                        selectedProduct()?.variants?.edges?.[0]?.node?.compareAtPrice
                      )
                    }}
                  </span>
                }
                <span
                  class="text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800/60"
                >
                  Verified Stock
                </span>
              </div>

              <p
                class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-h-32 overflow-y-auto pr-2 no-scrollbar"
              >
                {{ selectedProduct()?.description }}
              </p>

              <!-- In-App Cart Action -->
              <button
                (click)="addProductToCart(selectedProduct())"
                [disabled]="isModalAdding()"
                class="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-blue-600/30 transition text-sm cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{{ isModalAdding() ? 'Adding to Cart...' : 'Add to Cart' }}</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </button>

              <!-- Safe Payment Trust Bar -->
              <div class="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  🔒 Guaranteed Safe & Encrypted Checkout
                </span>
                <div
                  class="flex flex-wrap gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  <span
                    class="px-2.5 py-1 bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-slate-700 rounded-md"
                  >
                    💚 M-PESA
                  </span>
                  <span
                    class="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md"
                  >
                    💳 Visa / Mastercard
                  </span>
                  <span
                    class="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md"
                  >
                    🛡️ 256-Bit SSL
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Grid: Smart Related Products Carousel -->
          <div class="pt-6 border-t border-slate-200 dark:border-slate-800">
            <div class="flex items-center justify-between mb-4">
              <h4 class="text-lg font-bold text-slate-900 dark:text-white">
                Related Items in Catalog
              </h4>
              <span class="text-xs font-medium text-slate-500">Matched by category & brand</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              @for (related of getSmartRelatedProducts(selectedProduct()); track related.id) {
                <div
                  (click)="openProductModal(related)"
                  class="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 p-3 rounded-2xl cursor-pointer hover:border-blue-500 transition group flex gap-3 items-center"
                >
                  <div
                    class="w-16 h-16 bg-white dark:bg-slate-900 rounded-xl overflow-hidden flex-shrink-0"
                  >
                    @if (getModalImages(related)[0]) {
                      <img
                        [src]="getModalImages(related)[0]"
                        [alt]="related.title"
                        class="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                    }
                  </div>
                  <div class="overflow-hidden">
                    <h5 class="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {{ related.title }}
                    </h5>
                    <p class="text-xs font-bold text-blue-600 dark:text-blue-400 mt-1">
                      {{ currencyService.formatPrice(getProductPrice(related)) }}
                    </p>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      @keyframes marquee {
        0% {
          transform: translateX(0%);
        }
        100% {
          transform: translateX(-50%);
        }
      }
      .animate-marquee {
        display: flex;
        width: max-content;
        animation: marquee 25s linear infinite;
      }
      .no-scrollbar::-webkit-scrollbar {
        display: none;
      }
      .no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      @keyframes shimmer {
        0% {
          transform: translateX(-100%);
        }
        100% {
          transform: translateX(100%);
        }
      }
      .animate-shimmer {
        animation: shimmer 1.5s infinite;
      }
    `,
  ],
})
export class HomeComponent implements OnInit {
  private shopifyService = inject(ShopifyService);
  public cartService = inject(CartService);
  public currencyService = inject(CurrencyService);

  @ViewChild('featuredContainer') featuredContainer!: ElementRef<HTMLDivElement>;

  products = signal<any[]>([]);
  isLoading = signal<boolean>(true);
  isLoadingMore = signal<boolean>(false);
  hasMore = signal<boolean>(true);

  // Modal State
  selectedProduct = signal<any | null>(null);
  activeImageIndex = signal<number>(0);
  isModalAdding = signal<boolean>(false);
  isWishlisted = signal<boolean>(false);

  topBrands: string[] = ['Apple', 'Samsung', 'Sony', 'Logitech', 'Asus', 'Dell'];

  topSellingProducts = computed(() => {
    return this.products().slice(0, 4);
  });

  activeModalImage = computed(() => {
    const prod = this.selectedProduct();
    if (!prod) return null;
    const images = this.getModalImages(prod);
    return images[this.activeImageIndex()] || images[0] || null;
  });

  async ngOnInit(): Promise<void> {
    try {
      const data = await this.shopifyService.getProducts(24);
      this.products.set(data || []);
    } catch (err) {
      console.error('Failed to load Shopify products:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  marqueeProducts = () => {
    const current = this.products();
    return [...current, ...current];
  };

  scrollFeatured(direction: 'left' | 'right'): void {
    if (!this.featuredContainer?.nativeElement) return;
    const amount = direction === 'left' ? -340 : 340;
    this.featuredContainer.nativeElement.scrollBy({ left: amount, behavior: 'smooth' });
  }

  onFeaturedScroll(event: Event): void {
    const target = event.target as HTMLElement;
    const scrollEndThreshold = target.scrollWidth - target.scrollLeft - target.clientWidth;

    if (scrollEndThreshold < 120 && !this.isLoadingMore() && this.hasMore()) {
      this.isLoadingMore.set(true);

      setTimeout(() => {
        this.isLoadingMore.set(false);
        if (this.products().length > 40) {
          this.hasMore.set(false);
        }
      }, 1200);
    }
  }

  openProductModal(product: any): void {
    this.selectedProduct.set(product);
    this.activeImageIndex.set(0);
    this.isWishlisted.set(false);
  }

  closeProductModal(): void {
    this.selectedProduct.set(null);
  }

  toggleWishlist(): void {
    this.isWishlisted.set(!this.isWishlisted());
  }

  getBrandName(product: any): string {
    if (!product) return 'TechBytes';
    if (product.vendor) return product.vendor;

    const title = (product.title || '').toLowerCase();
    if (title.includes('apple') || title.includes('iphone') || title.includes('macbook'))
      return 'Apple';
    if (title.includes('samsung') || title.includes('galaxy')) return 'Samsung';
    if (title.includes('dell')) return 'Dell';
    if (title.includes('hp')) return 'HP';
    if (title.includes('sony')) return 'Sony';
    if (title.includes('logitech')) return 'Logitech';
    if (title.includes('asus')) return 'Asus';

    return 'Premium Gear';
  }

  getModalImages(product: any): string[] {
    if (!product?.images?.edges) return [];
    return product.images.edges.map((edge: any) => edge.node.url);
  }

  getProductPrice(product: any): { amount: string; currencyCode: string } | null {
    if (!product) return null;
    return product.variants?.edges?.[0]?.node?.price || product.price || null;
  }

  getSmartRelatedProducts(currentProduct: any): any[] {
    if (!currentProduct) return [];
    const titleLower = (currentProduct.title || '').toLowerCase();

    const terms = [
      'dell',
      'hp',
      'lenovo',
      'apple',
      'samsung',
      'sony',
      'logitech',
      'asus',
      'headset',
      'headphones',
      'laptop',
      'monitor',
      'keyboard',
      'phone',
      'smartphone',
      'charger',
    ];

    const matchedTerm = terms.find((term) => titleLower.includes(term));

    let matches: any[] = [];
    if (matchedTerm) {
      matches = this.products().filter(
        (p) =>
          p.id !== currentProduct.id &&
          ((p.title || '').toLowerCase().includes(matchedTerm) ||
            (p.description || '').toLowerCase().includes(matchedTerm)),
      );
    }

    if (matches.length < 3) {
      const remaining = this.products().filter(
        (p) => p.id !== currentProduct.id && !matches.some((m) => m.id === p.id),
      );
      matches = [...matches, ...remaining];
    }

    return matches.slice(0, 3);
  }

  getVariantId(product: any): string {
    return product?.variants?.edges?.[0]?.node?.id || '';
  }

  async addProductToCart(product: any): Promise<void> {
    const variantId = this.getVariantId(product);
    if (!variantId) return;

    this.isModalAdding.set(true);
    try {
      await this.cartService.addToCart(variantId, 1);
      this.cartService.openDrawer();
      this.closeProductModal();
    } catch (err) {
      console.error('Failed to add product to cart:', err);
    } finally {
      this.isModalAdding.set(false);
    }
  }
}
