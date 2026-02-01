import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // FIX: Required for *ngFor and property binding
import { ShopifyService } from './services/shopify'; // FIX: Correct filename is 'shopify', not 'shopify.service'

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [CommonModule], // FIX: Add CommonModule here
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent implements OnInit {
  products: any[] = [];

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
      console.log('Item added! Checkout here:', cart.checkoutUrl);
      alert('Added to cart!');
      // window.location.href = cart.checkoutUrl; // Uncomment to redirect to checkout
    } catch (error) {
      console.error('Cart error:', error);
    }
  }
}