import { Component, OnInit, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShopifyService } from '../services/shopify';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="product-grid">
      @for (product of products; track product.id) {
        <div class="product-card">
          @if (product.images?.edges?.[0]?.node?.url) {
            <img [src]="product.images.edges[0].node.url" [alt]="product.title" />
          }
          <h3>{{ product.title }}</h3>
          <p>{{ product.description }}</p>

          <button (click)="addToCart(product.variants?.edges?.[0]?.node?.id)">Add to Cart</button>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .product-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1.5rem;
        padding: 2rem 0;
      }
      .product-card {
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 1rem;
        text-align: center;
        img {
          max-width: 100%;
          height: 200px;
          object-fit: cover;
        }
        button {
          background: #10b981;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
        }
      }
    `,
  ],
})
export class ProductList implements OnInit {
  private shopifyService = inject(ShopifyService);

  products: any[] = [];
  onCartUpdated = output<void>(); // Modern output emitter

  async ngOnInit() {
    try {
      this.products = await this.shopifyService.getProducts();
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  }

  async addToCart(variantId: string) {
    if (!variantId) return;
    try {
      await this.shopifyService.addToCart(variantId);
      this.onCartUpdated.emit();
    } catch (error) {
      console.error('Cart error:', error);
    }
  }
}
