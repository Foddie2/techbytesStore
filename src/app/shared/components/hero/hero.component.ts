import { Component, OnInit, signal, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
// Adjust import path below if your service file is named 'shopify' or 'shopify.service'
import { ShopifyService } from '../../../core/services/shopify';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section
      class="relative overflow-hidden bg-slate-900 text-slate-100 py-16 lg:py-24 px-4 sm:px-6 lg:px-8 border-b border-slate-800"
    >
      <!-- Ambient Background Glows -->
      <div
        aria-hidden="true"
        class="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"
      ></div>
      <div
        aria-hidden="true"
        class="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"
      ></div>

      <div
        class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10"
      >
        <!-- Left Column: Copy, CTAs, and Trust Indicators -->
        <div class="lg:col-span-7 space-y-8 text-center lg:text-left">
          <!-- Category Pill -->
          <!--  <div
            class="inline-flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-full px-4 py-1.5 backdrop-blur-md shadow-sm"
          >
            <span class="flex h-2 w-2 rounded-full bg-blue-400 animate-pulse"></span>
            <span class="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Smart Products • Everyday Solutions
            </span>
          </div> -->

          <!-- Headline -->
          <h1
            class="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight sm:leading-tight"
          >
            Practical Tools Designed to Make Daily Tasks
            <span
              class="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400 mt-1"
            >
              Easier, Faster &amp; Better.
            </span>
          </h1>

          <!-- Supporting Copy -->
          <p
            class="text-slate-300 text-md sm:text-lg lg:text-2xl font-light leading-relaxed max-w-2xl mx-auto lg:mx-0"
          >
            Eliminate daily friction with intelligent gadgets, automated home gear, and practical
            productivity devices engineered for seamless convenience.
          </p>

          <!-- Dual CTAs -->
          <div
            class="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
          >
            <a
              href="#featured-products"
              class="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-blue-600/30 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 text-md"
            >
              <span>Explore Practical Products</span>
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </a>

            <a
              href="#why-us"
              class="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700 font-semibold px-7 py-4 rounded-xl transition-all duration-200 text-md"
            >
              How It Works
            </a>
          </div>

          <!-- Trust Badges -->
          <div
            class="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-center lg:text-left max-w-lg mx-auto lg:mx-0"
          >
            <div>
              <div
                class="flex items-center justify-center lg:justify-start gap-1 text-amber-400 text-sm font-bold"
              >
                <span>★</span> 4.9/5
              </div>
              <p class="text-xs text-slate-400 mt-0.5">2,400+ Verified Buyers</p>
            </div>

            <div>
              <div class="text-sm font-bold text-slate-200">30 Days</div>
              <p class="text-xs text-slate-400 mt-0.5">Risk-Free Guarantee</p>
            </div>

            <div>
              <div class="text-sm font-bold text-slate-200">Direct Delivery</div>
              <p class="text-xs text-slate-400 mt-0.5">Tracked Express Shipping</p>
            </div>
          </div>
        </div>

        <!-- Right Column: Product Showcase Visual Area -->
        <div class="lg:col-span-5 flex justify-center">
          <div class="relative w-full max-w-md">
            <!-- Glow Outline -->
            <div
              aria-hidden="true"
              class="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl blur opacity-30"
            ></div>

            <!-- Main Product Visual Card -->
            <div
              class="relative bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 shadow-2xl backdrop-blur-xl"
            >
              @if (product()) {
                <div class="space-y-4">
                  <!-- Product Image Container -->
                  <div
                    class="relative h-64 w-full bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800"
                  >
                    @if (product()?.images?.edges?.[0]?.node?.url) {
                      <img
                        [src]="product().images.edges[0].node.url"
                        [alt]="product().title || 'Product Image'"
                        class="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                        loading="eager"
                      />
                    } @else {
                      <div class="text-slate-500 text-xs">Shopify Product Preview</div>
                    }

                    <span
                      class="absolute top-3 right-3 bg-blue-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow"
                    >
                      Top Daily Pick
                    </span>
                  </div>

                  <!-- Product Info -->
                  <div>
                    <h3 class="text-lg font-bold text-white line-clamp-1">
                      {{ product()?.title }}
                    </h3>
                    <p class="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {{ product()?.description }}
                    </p>
                  </div>

                  <!-- Price & Action -->
                  <div class="flex items-center justify-between pt-2 border-t border-slate-700/60">
                    <div>
                      <span class="text-xs text-slate-400 block">Retail Price</span>
                      <span class="text-2xl font-black text-white">
                        {{ formatPrice(product()?.variants?.edges?.[0]?.node?.price) }}
                      </span>
                    </div>

                    <button
                      (click)="addToCart(getVariantId(product()))"
                      [disabled]="isAdding()"
                      class="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs px-5 py-3 rounded-lg shadow-md transition cursor-pointer"
                    >
                      {{ isAdding() ? 'Adding...' : 'Add to Cart' }}
                    </button>
                  </div>
                </div>
              } @else {
                <!-- Skeleton Loader -->
                <div class="space-y-4 animate-pulse py-4">
                  <div class="h-60 bg-slate-700/50 rounded-xl w-full"></div>
                  <div class="h-4 bg-slate-700/50 rounded w-3/4"></div>
                  <div class="h-3 bg-slate-700/50 rounded w-1/2"></div>
                  <div class="h-10 bg-slate-700/50 rounded w-full mt-4"></div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class HeroComponent implements OnInit {
  private shopifyService = inject(ShopifyService);

  @Output() onCartUpdated = new EventEmitter<void>();

  featuredProduct = signal<any>(null);
  isAdding = signal<boolean>(false);

  // Helper accessor for safer signal reading in templates
  get product() {
    return this.featuredProduct;
  }

  async ngOnInit(): Promise<void> {
    try {
      const products = await this.shopifyService.getProducts();
      if (products && products.length > 0) {
        this.featuredProduct.set(products[0]);
      }
    } catch (err) {
      console.error('Failed to load hero shopify product:', err);
    }
  }

  getVariantId(item: any): string {
    return item?.variants?.edges?.[0]?.node?.id || '';
  }

  formatPrice(priceObj: { amount: string; currencyCode: string } | undefined): string {
    if (!priceObj || !priceObj.amount) return '$0.00';
    const amount = parseFloat(priceObj.amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: priceObj.currencyCode || 'USD',
    }).format(amount);
  }

  async addToCart(variantId: string): Promise<void> {
    if (!variantId) return;
    this.isAdding.set(true);
    try {
      await this.shopifyService.addToCart(variantId);
      this.onCartUpdated.emit();
    } catch (err) {
      console.error('Hero add-to-cart failed:', err);
    } finally {
      this.isAdding.set(false);
    }
  }
}
