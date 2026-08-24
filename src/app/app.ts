import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShopifyService } from './services/shopify';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class AppComponent implements OnInit {
  products: any[] = [];
  cartCount: number = 0;

  constructor(private shopifyService: ShopifyService) {}

  async ngOnInit() {
    try {
      this.products = await this.shopifyService.getProducts();
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  }

  async handleAddToCart(variantId: string) {
    try {
      const cart = await this.shopifyService.addToCart(variantId);
      this.cartCount++;
      console.log('Item added! Checkout here:', cart.checkoutUrl);
      alert('Added to cart!');
    } catch (error) {
      console.error('Cart error:', error);
    }
  }
}
