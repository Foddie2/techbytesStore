import { Component, OnInit } from '@angular/core';
import { ShopifyService } from './services/shopify';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  standalone: true,
  imports: [CommonModule /*, other imports */],
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
}
