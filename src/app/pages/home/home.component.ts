import { Component, OnInit, signal, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShopifyService } from '../../core/services/shopify';
import { HeroComponent } from '../../shared/components/hero/hero.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeroComponent, ProductCardComponent],
  template: `
    <div class="space-y-16 pb-16">
      <!-- 2. Hero Section -->
      <app-hero (onCartUpdated)="handleCartUpdate()" />

      <!-- 3. Trust / Benefits Bar -->
      <section class="max-w-7xl mx-auto px-4">
        <div
          class="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm text-center"
        >
          <div class="space-y-1">
            <span class="text-2xl">🚚</span>
            <h4 class="font-bold text-slate-900 dark:text-white text-sm">
              Global Express Delivery
            </h4>
            <p class="text-xs text-slate-500">Tracked shipping on orders over $50</p>
          </div>
          <div class="space-y-1">
            <span class="text-2xl">🛡️</span>
            <h4 class="font-bold text-slate-900 dark:text-white text-sm">30-Day Money Back</h4>
            <p class="text-xs text-slate-500">Hassle-free return policy</p>
          </div>
          <div class="space-y-1">
            <span class="text-2xl">🔒</span>
            <h4 class="font-bold text-slate-900 dark:text-white text-sm">Encrypted Checkout</h4>
            <p class="text-xs text-slate-500">Protected via 256-bit SSL</p>
          </div>
          <div class="space-y-1">
            <span class="text-2xl">💬</span>
            <h4 class="font-bold text-slate-900 dark:text-white text-sm">24/7 Dedicated Support</h4>
            <p class="text-xs text-slate-500">Fast email response times</p>
          </div>
        </div>
      </section>

      <!-- 4. Featured Products (Direct from Shopify API using Reusable Product Card) -->
      <section id="featured-products" class="max-w-7xl mx-auto px-4">
        <div class="flex justify-between items-end mb-8">
          <div>
            <h2 class="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
              Featured Drops
            </h2>
            <p class="text-slate-500 text-sm mt-1">
              Direct storefront inventory synced in real-time.
            </p>
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
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            @for (product of products(); track product.id) {
              <app-product-card [product]="product" (cartUpdated)="handleCartUpdate()" />
            }
          </div>
        }
      </section>

      <!-- 5. Problem → Solution Section -->
      <section class="bg-slate-100 dark:bg-slate-900 py-16">
        <div class="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div class="space-y-4">
            <span class="text-xs font-bold text-blue-600 uppercase tracking-widest"
              >The Problem</span
            >
            <h3 class="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
              Overpriced Electronics With Unreliable Shipping Times.
            </h3>
            <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Most online electronics dropshippers use slow fulfillment channels with unverified
              product quality, resulting in weeks of waiting and defective gear.
            </p>
          </div>
          <div
            class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 rounded-2xl shadow-sm space-y-4"
          >
            <span class="text-xs font-bold text-emerald-500 uppercase tracking-widest"
              >Our Solution</span
            >
            <h4 class="text-xl font-bold text-slate-900 dark:text-white">
              Direct-API Verified Sourcing
            </h4>
            <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              TechBytes integrates direct Shopify inventory pipelines to guarantee real-time stock
              levels, fast dispatching, and strict quality checks before items leave the warehouse.
            </p>
          </div>
        </div>
      </section>

      <!-- 6. Best Sellers -->
      <section class="max-w-7xl mx-auto px-4">
        <h2 class="text-2xl font-extrabold text-slate-900 dark:text-white mb-6">
          Top Rated Hardware
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          @for (product of products().slice(0, 3); track product.id) {
            <div
              class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex gap-4 items-center"
            >
              <div
                class="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden flex-shrink-0"
              >
                @if (product.images?.edges?.[0]?.node?.url) {
                  <img
                    [src]="product.images.edges[0].node.url"
                    [alt]="product.title"
                    class="w-full h-full object-cover"
                  />
                }
              </div>
              <div class="flex-1">
                <h4 class="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">
                  {{ product.title }}
                </h4>
                <p class="text-xs font-bold text-blue-600 mt-1">
                  {{ formatPrice(product.variants?.edges?.[0]?.node?.price) }}
                </p>
                <button
                  (click)="addToCart(getVariantId(product))"
                  class="text-xs text-slate-600 dark:text-slate-300 font-semibold underline mt-2 hover:text-blue-600"
                >
                  Quick Buy
                </button>
              </div>
            </div>
          }
        </div>
      </section>

      <!-- 7. Promotional Banner -->
      <section class="max-w-7xl mx-auto px-4">
        <div
          class="bg-gradient-to-r from-blue-700 to-indigo-900 rounded-3xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl"
        >
          <div class="space-y-2 text-center md:text-left">
            <span class="text-xs font-bold uppercase tracking-wider text-blue-200"
              >Limited Time Offer</span
            >
            <h3 class="text-3xl font-extrabold">Get 15% Off Your First Store Order</h3>
            <p class="text-blue-100 text-sm">
              Apply code <span class="font-mono bg-white/20 px-2 py-1 rounded">TECH15</span> at
              checkout.
            </p>
          </div>
          <a
            href="#featured-products"
            class="bg-white text-blue-900 font-bold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition text-sm"
          >
            Shop Promotion
          </a>
        </div>
      </section>

      <!-- 8. Why Shop With Us -->
      <section class="max-w-7xl mx-auto px-4 text-center">
        <h2 class="text-2xl font-extrabold text-slate-900 dark:text-white mb-8">
          Why TechBytes Store?
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="space-y-2">
            <div
              class="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mx-auto text-xl font-bold"
            >
              1
            </div>
            <h4 class="font-bold text-slate-900 dark:text-white">Curated Tech Selection</h4>
            <p class="text-slate-500 text-xs leading-relaxed">
              We test every hardware line to ensure specs match description accuracy.
            </p>
          </div>
          <div class="space-y-2">
            <div
              class="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mx-auto text-xl font-bold"
            >
              2
            </div>
            <h4 class="font-bold text-slate-900 dark:text-white">Transparent Tracking</h4>
            <p class="text-slate-500 text-xs leading-relaxed">
              Receive automated delivery updates directly via SMS or email.
            </p>
          </div>
          <div class="space-y-2">
            <div
              class="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mx-auto text-xl font-bold"
            >
              3
            </div>
            <h4 class="font-bold text-slate-900 dark:text-white">Verified Satisfaction</h4>
            <p class="text-slate-500 text-xs leading-relaxed">
              Full refund guarantees if items arrive damaged or non-functional.
            </p>
          </div>
        </div>
      </section>

      <!-- 9. Customer Reviews -->
      <section class="max-w-7xl mx-auto px-4">
        <h2 class="text-2xl font-extrabold text-slate-900 dark:text-white text-center mb-8">
          Verified Customer Feedback
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl space-y-3"
          >
            <div class="text-amber-400 text-sm">★★★★★</div>
            <p class="text-slate-600 dark:text-slate-300 text-xs italic">
              "Order arrived in 4 days. Product quality matched the Shopify catalog description
              exactly."
            </p>
            <span class="block text-xs font-bold text-slate-900 dark:text-white"
              >— Alex M., Verified Buyer</span
            >
          </div>
          <div
            class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl space-y-3"
          >
            <div class="text-amber-400 text-sm">★★★★★</div>
            <p class="text-slate-600 dark:text-slate-300 text-xs italic">
              "Checkout was seamless and tracking links updated accurately throughout shipping."
            </p>
            <span class="block text-xs font-bold text-slate-900 dark:text-white"
              >— Sarah K., Verified Buyer</span
            >
          </div>
          <div
            class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl space-y-3"
          >
            <div class="text-amber-400 text-sm">★★★★★</div>
            <p class="text-slate-600 dark:text-slate-300 text-xs italic">
              "Excellent customer support response time when requesting an invoice."
            </p>
            <span class="block text-xs font-bold text-slate-900 dark:text-white"
              >— David R., Verified Buyer</span
            >
          </div>
        </div>
      </section>

      <!-- 10. FAQ Section (Crucial for AdSense Quality Audits) -->
      <section id="faq" class="max-w-4xl mx-auto px-4">
        <h2 class="text-2xl font-extrabold text-slate-900 dark:text-white text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div class="space-y-4">
          <details
            class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 cursor-pointer"
          >
            <summary class="font-bold text-slate-900 dark:text-white text-sm">
              How long does shipping take?
            </summary>
            <p class="text-xs text-slate-500 mt-2">
              Standard fulfillment processes orders within 24-48 hours. Delivery averages 3-7
              business days depending on location.
            </p>
          </details>
          <details
            class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 cursor-pointer"
          >
            <summary class="font-bold text-slate-900 dark:text-white text-sm">
              What is your return policy?
            </summary>
            <p class="text-xs text-slate-500 mt-2">
              We offer a 30-day return window on all unused hardware items in original packaging.
            </p>
          </details>
          <details
            class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 cursor-pointer"
          >
            <summary class="font-bold text-slate-900 dark:text-white text-sm">
              How do I track my order?
            </summary>
            <p class="text-xs text-slate-500 mt-2">
              Once dispatched, a tracking ID is generated and sent via email for live carrier status
              monitoring.
            </p>
          </details>
        </div>
      </section>

      <!-- 11. Newsletter Form -->
      <section class="max-w-3xl mx-auto px-4 text-center">
        <div class="bg-slate-900 text-white p-8 rounded-3xl space-y-4">
          <h3 class="text-xl font-bold">Subscribe to Tech Alerts</h3>
          <p class="text-xs text-slate-400">
            Get early notification of inventory drops and private discount codes.
          </p>
          <form
            (submit)="$event.preventDefault()"
            class="flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
          >
            <input
              type="email"
              placeholder="Enter your email"
              class="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white flex-1 outline-none"
            />
            <button
              class="bg-blue-600 hover:bg-blue-500 font-bold px-6 py-2.5 rounded-xl text-xs transition"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  `,
})
export class HomeComponent implements OnInit {
  private shopifyService = inject(ShopifyService);

  @Output() onCartUpdated = new EventEmitter<void>();

  products = signal<any[]>([]);
  isLoading = signal<boolean>(true);
  addingId = signal<string | null>(null);

  async ngOnInit() {
    try {
      const data = await this.shopifyService.getProducts();
      this.products.set(data || []);
    } catch (err) {
      console.error('Failed to load Shopify products:', err);
    } finally {
      this.isLoading.set(false);
    }
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

  async addToCart(variantId: string) {
    if (!variantId) return;
    this.addingId.set(variantId);
    try {
      await this.shopifyService.addToCart(variantId);
      this.onCartUpdated.emit();
    } catch (err) {
      console.error('Cart error:', err);
    } finally {
      this.addingId.set(null);
    }
  }

  handleCartUpdate() {
    this.onCartUpdated.emit();
  }
}
