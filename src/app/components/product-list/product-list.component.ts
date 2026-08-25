import { Component, OnInit, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShopifyService } from '../../services/shopify';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="products-container">
      <!-- Loading State -->
      @if (isLoading()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Fetching products from Shopify...</p>
        </div>
      }

      <!-- Error State -->
      @if (errorMessage()) {
        <div class="error-banner">
          <p>{{ errorMessage() }}</p>
        </div>
      }

      <!-- Product Grid -->
      @if (!isLoading() && products().length > 0) {
        <div class="product-grid">
          @for (product of products(); track product.id) {
            <article class="product-card">
              <div class="image-wrapper">
                @if (product.images?.edges?.[0]?.node?.url) {
                  <img
                    [src]="product.images.edges[0].node.url"
                    [alt]="product.title"
                    loading="lazy"
                  />
                } @else {
                  <div class="no-image">No Image Available</div>
                }
              </div>

              <div class="card-content">
                <h3 class="product-title">{{ product.title }}</h3>
                
                <p class="product-description">
                  {{ truncateText(product.description, 90) }}
                </p>

                <div class="card-footer">
                  <span class="price">
                    {{ formatPrice(product.variants?.edges?.[0]?.node?.price) }}
                  </span>

                  <button
                    class="add-cart-btn"
                    [disabled]="addingId() === getVariantId(product)"
                    (click)="addToCart(getVariantId(product))"
                  >
                    @if (addingId() === getVariantId(product)) {
                      Adding...
                    } @else {
                      Add to Cart
                    }
                  </button>
                </div>
              </div>
            </article>
          }
        </div>
      }

      <!-- Empty State -->
      @if (!isLoading() && products().length === 0 && !errorMessage()) {
        <div class="empty-state">
          <p>No products available right now.</p>
        </div>
      }
    </section>
  `,
  styles: [`
    .products-container {
      padding: 1rem 0;
    }

    .loading-state, .empty-state {
      text-align: center;
      padding: 3rem;
      color: #6b7280;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #e5e7eb;
      border-top-color: #2563eb;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .error-banner {
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      color: #dc2626;
      padding: 1rem;
      border-radius: 0.5rem;
      margin-bottom: 1.5rem;
    }

    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1.75rem;
    }

    .product-card {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 0.75rem;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 0.2s ease, box-shadow 0.2s ease;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      }
    }

    .image-wrapper {
      width: 100%;
      height: 220px;
      background-color: #f9fafb;
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .no-image {
        color: #9ca3af;
        font-size: 0.875rem;
      }
    }

    .card-content {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }

    .product-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #111827;
      margin: 0 0 0.5rem 0;
    }

    .product-description {
      font-size: 0.875rem;
      color: #6b7280;
      line-height: 1.4;
      margin: 0 0 1.25rem 0;
      flex-grow: 1;
    }

    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: auto;
    }

    .price {
      font-size: 1.25rem;
      font-weight: 700;
      color: #0f172a;
    }

    .add-cart-btn {
      background-color: #2563eb;
      color: #ffffff;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s ease;

      &:hover:not(:disabled) {
        background-color: #1d4ed8;
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
  `]
})
export class ProductListComponent implements OnInit {
  private shopifyService = inject(ShopifyService);

  @Output() onCartUpdated = new EventEmitter<void>();

  products = signal<any[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  addingId = signal<string | null>(null);

  async ngOnInit() {
    await this.fetchProducts();
  }

  async fetchProducts() {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const data = await this.shopifyService.getProducts();
      this.products.set(data);
    } catch (error: any) {
      console.error('Error fetching Shopify products:', error);
      this.errorMessage.set('Failed to load products. Check your configuration or publishing channels.');
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

  truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  }

  async addToCart(variantId: string) {
    if (!variantId) return;

    this.addingId.set(variantId);
    try {
      await this.shopifyService.addToCart(variantId);
      this.onCartUpdated.emit();
    } catch (err) {
      console.error('Error adding item to cart:', err);
    } finally {
      this.addingId.set(null);
    }
  }
}