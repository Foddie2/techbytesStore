import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product, ProductVariant } from '../../../core/models/shopify.model';
import { ShopifyService } from '../../../core/services/shopify';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (product) {
      <div class="group relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl overflow-hidden flex flex-col justify-between hover:shadow-xl hover:border-blue-500/50 transition-all duration-300">
        
        <!-- Top Image & Badges Container -->
        <div class="relative w-full h-60 bg-slate-100 dark:bg-slate-900 overflow-hidden">
          
          <!-- Product Image -->
          @if (mainImageUrl) {
            <img 
              [src]="mainImageUrl" 
              [alt]="product.title"
              class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          } @else {
            <div class="w-full h-full flex items-center justify-center text-slate-400 text-xs font-medium">
              No Preview Image
            </div>
          }

          <!-- Discount Savings Badge (High Converting dropshipping trigger) -->
          @if (discountPercentage > 0) {
            <span class="absolute top-3 left-3 bg-red-600 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md">
              Save {{ discountPercentage }}%
            </span>
          }

          <!-- Stock Status Badge -->
          @if (!defaultVariant?.availableForSale) {
            <span class="absolute top-3 right-3 bg-slate-900/90 text-slate-300 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase backdrop-blur-sm">
              Sold Out
            </span>
          }
        </div>

        <!-- Content Area -->
        <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div>
            <h3 class="text-slate-900 dark:text-white font-bold text-base line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {{ product.title }}
            </h3>
            <p class="text-slate-500 dark:text-slate-400 text-xs leading-relaxed line-clamp-2 mt-1">
              {{ product.description }}
            </p>
          </div>

          <!-- Pricing & Direct Actions -->
          <div class="pt-3 border-t border-slate-100 dark:border-slate-700/60 space-y-3">
            
            <!-- Price Display with Compare At Price -->
            <div class="flex items-baseline gap-2">
              <span class="text-xl font-black text-slate-900 dark:text-white">
                {{ formatPrice(defaultVariant?.price) }}
              </span>

              @if (defaultVariant?.compareAtPrice?.amount) {
                <span class="text-xs text-slate-400 line-through font-medium">
                  {{ formatPrice(defaultVariant?.compareAtPrice) }}
                </span>
              }
            </div>

            <!-- Action Buttons -->
            <div class="grid grid-cols-2 gap-2">
              <!-- Add to Cart (Standard) -->
              <button 
                (click)="onAddToCart()"
                [disabled]="isAdding() || !defaultVariant?.availableForSale"
                class="w-full bg-slate-100 dark:bg-slate-700/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold py-2.5 px-3 rounded-xl transition-all disabled:opacity-50 cursor-pointer text-center"
              >
                {{ isAdding() ? 'Adding...' : 'Add to Cart' }}
              </button>

              <!-- Buy Now (Direct Checkout Redirect) -->
              <button 
                (click)="onBuyNow()"
                [disabled]="isBuying() || !defaultVariant?.availableForSale"
                class="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 px-3 rounded-xl shadow-md shadow-blue-600/20 transition-all disabled:opacity-50 cursor-pointer text-center"
              >
                {{ isBuying() ? 'Redirecting...' : 'Buy Now' }}
              </button>
            </div>

          </div>

        </div>

      </div>
    }
  `
})
export class ProductCardComponent {
  private shopifyService = inject(ShopifyService);

  @Input({ required: true }) product!: Product;
  @Output() cartUpdated = new EventEmitter<void>();

  isAdding = signal<boolean>(false);
  isBuying = signal<boolean>(false);

  get defaultVariant(): ProductVariant | undefined {
    return this.product?.variants?.edges?.[0]?.node;
  }

  get mainImageUrl(): string | null {
    return this.product?.images?.edges?.[0]?.node?.url || null;
  }

  get discountPercentage(): number {
    const price = parseFloat(this.defaultVariant?.price?.amount || '0');
    const compareAt = parseFloat(this.defaultVariant?.compareAtPrice?.amount || '0');

    if (compareAt > price) {
      return Math.round(((compareAt - price) / compareAt) * 100);
    }
    return 0;
  }

  formatPrice(priceObj: any): string {
    if (!priceObj || !priceObj.amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: priceObj.currencyCode || 'USD',
    }).format(parseFloat(priceObj.amount));
  }

  async onAddToCart(): Promise<void> {
    const variantId = this.defaultVariant?.id;
    if (!variantId) return;

    this.isAdding.set(true);
    try {
      await this.shopifyService.addToCart(variantId);
      this.cartUpdated.emit();
    } catch (err) {
      console.error('Failed to add item to cart:', err);
    } finally {
      this.isAdding.set(false);
    }
  }

  async onBuyNow(): Promise<void> {
    const variantId = this.defaultVariant?.id;
    if (!variantId) return;

    this.isBuying.set(true);
    try {
      await this.shopifyService.buyNow(variantId);
    } catch (err) {
      console.error('Buy Now checkout error:', err);
      this.isBuying.set(false);
    }
  }
}