import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ShopifyService } from '../../core/services/shopify';
import { Product } from '../../core/models/shopify.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <!-- Page Header -->
      <div class="border-b border-slate-200 dark:border-slate-800 pb-6">
        <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white capitalize">
          {{ pageTitle() }}
        </h1>
        <p class="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Showing curated inventory directly synced with Shopify.
        </p>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="text-center py-20">
          <div
            class="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"
          ></div>
          <p class="text-slate-500 text-sm">Filtering inventory...</p>
        </div>
      }

      <!-- Product Grid -->
      @if (!isLoading() && filteredProducts().length > 0) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          @for (product of filteredProducts(); track product.id) {
            <app-product-card [product]="product" />
          }
        </div>
      }

      <!-- Empty State -->
      @if (!isLoading() && filteredProducts().length === 0) {
        <div
          class="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl"
        >
          <span class="text-4xl mb-3 block">🔍</span>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">No products found</h3>
          <p class="text-slate-500 text-xs mt-1">
            Try adjusting your category filter or search query.
          </p>
        </div>
      }
    </div>
  `,
})
export class ProductsPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private shopifyService = inject(ShopifyService);

  allProducts = signal<Product[]>([]);
  filteredProducts = signal<Product[]>([]);
  isLoading = signal<boolean>(true);
  pageTitle = signal<string>('All Products');

  async ngOnInit() {
    try {
      const data = await this.shopifyService.getProducts(24);
      this.allProducts.set(data || []);

      // Listen to route query parameter changes (?category=... or ?q=...)
      this.route.queryParams.subscribe((params) => {
        this.filterCatalog(params['category'], params['q']);
      });
    } catch (err) {
      console.error('Failed to fetch catalog:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  private filterCatalog(category?: string, query?: string) {
    let results = this.allProducts();

    if (category) {
      this.pageTitle.set(`${category}`);
      results = results.filter(
        (p) =>
          p.title.toLowerCase().includes(category.toLowerCase()) ||
          p.description.toLowerCase().includes(category.toLowerCase()),
      );
    } else if (query) {
      this.pageTitle.set(`Search: "${query}"`);
      results = results.filter(
        (p) =>
          p.title.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase()),
      );
    } else {
      this.pageTitle.set('All Products');
    }

    this.filteredProducts.set(results);
  }
}
