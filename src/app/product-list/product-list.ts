import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="storefront">
      <h1>Featured Products</h1>
      <div class="product-grid">
        <div *ngFor="let product of products" class="product-card">
          <img [src]="product.images.edges[0]?.node.url" [alt]="product.title" width="200" />
          <h3>{{ product.title }}</h3>
          <p>{{ product.description }}</p>
          <button (click)="onAddToCart(product.variants.edges[0]?.node.id)">Add to Cart</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .product-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 1.5rem;
        padding: 1rem;
      }
      .product-card {
        border: 1px solid #ccc;
        padding: 1rem;
        border-radius: 8px;
        text-align: center;
      }
    `,
  ],
})
export class ProductListComponent {
  @Input() products: any[] = [];
  @Output() addToCart = new EventEmitter<string>();

  onAddToCart(variantId: string) {
    this.addToCart.emit(variantId);
  }
}
