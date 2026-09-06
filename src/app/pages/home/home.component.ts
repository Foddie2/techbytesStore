import { Component, OnInit, signal, computed, inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShopifyService } from '../../core/services/shopify';
import { CartService } from '../../core/services/cart';
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
          class="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm text-center"
        >
          <div class="space-y-1">
            <span class="text-2xl">🚚</span>
            <h4 class="font-bold text-slate-900 dark:text-white text-lg">
              Global Express Delivery
            </h4>
            <p class="text-sm text-slate-500">Tracked shipping on orders over $50</p>
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

      <!-- Featured Products (Horizontal Left-to-Right Scroll) -->
      <section id="featured-products" class="max-w-7xl mx-auto px-4">
        <div class="flex justify-between items-end mb-8">
          <div>
            <span class="text-xs font-bold text-blue-600 uppercase tracking-widest"
              >Real-time Catalog</span
            >
            <h2 class="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Featured Drops
            </h2>
            <p class="text-slate-500 text-sm mt-1">
              Swipe or scroll horizontally to explore featured gear.
            </p>
          </div>

          <!-- Scroll Controls -->
          <div class="flex gap-2">
            <button
              (click)="scrollFeatured('left')"
              class="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition shadow-sm cursor-pointer"
            >
              ←
            </button>
            <button
              (click)="scrollFeatured('right')"
              class="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition shadow-sm cursor-pointer"
            >
              →
            </button>
          </div>
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
          <div
            #featuredContainer
            class="flex gap-6 overflow-x-auto scroll-smooth pb-4 no-scrollbar snap-x snap-mandatory"
          >
            @for (product of products(); track product.id) {
              <div class="w-72 sm:w-80 flex-shrink-0 snap-start">
                <app-product-card [product]="product" (selectProduct)="openProductModal($event)" />
              </div>
            }
          </div>
        }
      </section>

      <!-- NEW SECTION: Top Selling Items (High Converting Dropshipping Showcase) -->
      <section class="max-w-7xl mx-auto px-4">
        <div
          class="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 rounded-3xl p-6 sm:p-10 border border-slate-800 text-white shadow-2xl"
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
                      {{ formatPrice(product.variants?.edges?.[0]?.node?.price) }}
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
            class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 rounded-2xl shadow-sm space-y-4"
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

      <!-- Top Rated Hardware (Infinite Horizontal Marquee Scroll) -->
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
                class="w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex gap-4 items-center flex-shrink-0 cursor-pointer hover:border-blue-500 transition-all shadow-sm"
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
                    {{ formatPrice(product.variants?.edges?.[0]?.node?.price) }}
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

    <!-- PRODUCT DETAILS MODAL (Multi-Image Gallery & Smart Related Products) -->
    @if (selectedProduct()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn"
      >
        <div
          class="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6"
        >
          <!-- Close Button -->
          <button
            (click)="closeProductModal()"
            class="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition cursor-pointer z-10"
          >
            ✕
          </button>

          <!-- Main Product Layout -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <!-- Image Gallery Column -->
            <div class="space-y-3">
              <!-- Active Image Display -->
              <div
                class="w-full h-72 bg-slate-100 dark:bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-200/50 dark:border-slate-800"
              >
                @if (activeModalImage()) {
                  <img
                    [src]="activeModalImage()"
                    [alt]="selectedProduct().title"
                    class="w-full h-full object-cover transition-all duration-300"
                  />
                } @else {
                  <span class="text-slate-400 text-sm">No Preview Image</span>
                }
              </div>

              <!-- Thumbnails Carousel/Row -->
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

            <!-- Details & Actions Column -->
            <div class="space-y-4">
              <div>
                <span
                  class="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider"
                  >Product Overview</span
                >
                <h3 class="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {{ selectedProduct().title }}
                </h3>
              </div>

              <div class="flex items-baseline gap-3">
                <span class="text-2xl font-black text-slate-900 dark:text-white">
                  {{ formatPrice(selectedProduct().variants?.edges?.[0]?.node?.price) }}
                </span>
                @if (selectedProduct().variants?.edges?.[0]?.node?.compareAtPrice?.amount) {
                  <span class="text-sm text-slate-400 line-through">
                    {{ formatPrice(selectedProduct().variants?.edges?.[0]?.node?.compareAtPrice) }}
                  </span>
                }
              </div>

              <p
                class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-h-36 overflow-y-auto pr-2"
              >
                {{ selectedProduct().description }}
              </p>

              <!-- Modal In-App Cart CTA -->
              <div class="pt-4 border-t border-slate-200 dark:border-slate-800 flex gap-3">
                <button
                  (click)="addProductToCart(selectedProduct())"
                  [disabled]="isModalAdding()"
                  class="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-600/20 transition disabled:opacity-50 text-sm cursor-pointer"
                >
                  {{ isModalAdding() ? 'Adding...' : 'Add to Cart' }}
                </button>
              </div>
            </div>
          </div>

          <!-- SMART RELATED PRODUCTS SECTION -->
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
                  class="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 p-3 rounded-2xl cursor-pointer hover:border-blue-500 transition group"
                >
                  <div
                    class="w-full h-28 bg-slate-200 dark:bg-slate-900 rounded-xl overflow-hidden mb-2"
                  >
                    @if (getModalImages(related)[0]) {
                      <img
                        [src]="getModalImages(related)[0]"
                        [alt]="related.title"
                        class="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                    }
                  </div>
                  <h5 class="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {{ related.title }}
                  </h5>
                  <p class="text-xs text-blue-600 dark:text-blue-400 font-bold mt-1">
                    {{ formatPrice(related.variants?.edges?.[0]?.node?.price) }}
                  </p>
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
    `,
  ],
})
export class HomeComponent implements OnInit {
  private shopifyService = inject(ShopifyService);
  public cartService = inject(CartService);

  @ViewChild('featuredContainer') featuredContainer!: ElementRef<HTMLDivElement>;

  products = signal<any[]>([]);
  isLoading = signal<boolean>(true);
  selectedProduct = signal<any | null>(null);
  activeImageIndex = signal<number>(0);
  isModalAdding = signal<boolean>(false);

  topBrands: string[] = ['Apple', 'Samsung', 'Sony', 'Logitech', 'Asus', 'Dell'];

  // Top Selling Products computed slice
  topSellingProducts = computed(() => {
    return this.products().slice(0, 4);
  });

  // Currently displayed modal image URL
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
    const amount = direction === 'left' ? -320 : 320;
    this.featuredContainer.nativeElement.scrollBy({ left: amount, behavior: 'smooth' });
  }

  openProductModal(product: any): void {
    this.selectedProduct.set(product);
    this.activeImageIndex.set(0);
  }

  closeProductModal(): void {
    this.selectedProduct.set(null);
  }

  /**
   * Extracts all image URLs from a Shopify Product object
   */
  getModalImages(product: any): string[] {
    if (!product?.images?.edges) return [];
    return product.images.edges.map((edge: any) => edge.node.url);
  }

  /**
   * Smart Related Products Engine: Matches product title keywords (brands/types like Dell, Headset, Phone)
   */
  getSmartRelatedProducts(currentProduct: any): any[] {
    if (!currentProduct) return [];
    const titleLower = (currentProduct.title || '').toLowerCase();

    // Key classification terms for hardware
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

    // Fallback if not enough matches are found
    if (matches.length < 3) {
      const remaining = this.products().filter(
        (p) => p.id !== currentProduct.id && !matches.some((m) => m.id === p.id),
      );
      matches = [...matches, ...remaining];
    }

    return matches.slice(0, 3);
  }

  getVariantId(product: any): string {
    return product.variants?.edges?.[0]?.node?.id || '';
  }

  formatPrice(priceObj: { amount: string; currencyCode: string } | undefined): string {
    if (!priceObj) return '$0.00';
    const amount = parseFloat(priceObj.amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: priceObj.currencyCode || 'USD',
    }).format(amount);
  }

  /**
   * Adds an item to the in-app CartService and pops open the Cart Drawer
   */
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
