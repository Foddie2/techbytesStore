import {
  Component,
  OnInit,
  signal,
  computed,
  inject,
  ElementRef,
  ViewChildren,
  QueryList,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

// Core Services & Models
import { ShopifyService } from '../../core/services/shopify';
import { CartService } from '../../core/services/cart';
import { CurrencyService } from '../../core/services/currency';
import { Product } from '../../core/models/shopify.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

interface BrandCollection {
  brand: string;
  products: Product[];
  isLoadingMore: boolean;
  hasMore: boolean;
}

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <!-- 1. SEO & Filter Header -->
      <div
        class="border-b border-slate-200 dark:border-slate-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div>
          <span
            class="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest"
          >
            Verified Hardware Collections
          </span>
          <h1 class="text-3xl font-black text-slate-900 dark:text-white capitalize mt-1">
            {{ pageTitle() }}
          </h1>
          <p class="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Browse genuine inventory grouped by verified tech brands & partners.
          </p>
        </div>

        @if (activeFilter()) {
          <button
            (click)="clearFilter()"
            class="self-start md:self-auto text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-4 py-2 rounded-full transition cursor-pointer flex items-center gap-2"
          >
            <span>✕ Clear Filter: "{{ activeFilter() }}"</span>
          </button>
        }
      </div>

      <!-- 2. Initial Full-Page Loading Skeleton -->
      @if (isLoading()) {
        <div class="space-y-10 animate-pulse">
          @for (i of [1, 2, 3]; track i) {
            <div class="space-y-4">
              <div class="h-6 bg-slate-200 dark:bg-slate-800 rounded-md w-48"></div>
              <div class="flex gap-6 overflow-hidden">
                @for (j of [1, 2, 3, 4]; track j) {
                  <div
                    class="w-72 sm:w-80 h-96 bg-slate-200 dark:bg-slate-800/80 rounded-2xl shrink-0"
                  ></div>
                }
              </div>
            </div>
          }
        </div>
      }

      <!-- 3. Brand Collection Horizontal Scrolling Rows -->
      @if (!isLoading() && brandCollections().length > 0) {
        <div class="space-y-14">
          @for (collection of brandCollections(); track collection.brand; let brandIdx = $index) {
            <section class="space-y-4">
              <!-- Brand Collection Header -->
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {{ collection.brand }}
                  </h2>
                  <span
                    class="bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800/60"
                  >
                    {{ collection.products.length }} Items
                  </span>
                </div>
              </div>

              <!-- Relative Row Wrapper Flanked by End Navigation Buttons -->
              <div class="relative group">
                <!-- Left Flanking Navigation Arrow -->
                <button
                  (click)="scrollContainer(brandIdx, 'left')"
                  aria-label="Scroll left"
                  class="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full border border-slate-200/80 dark:border-slate-700/80 bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 hover:scale-110 transition-all duration-200 shadow-md cursor-pointer backdrop-blur-xs opacity-90 sm:opacity-0 sm:group-hover:opacity-100 active:scale-95"
                >
                  ←
                </button>

                <!-- Horizontal Scroll Container with Infinite End-Detection -->
                <div
                  #brandScrollContainer
                  (scroll)="onHorizontalScroll($event, brandIdx)"
                  class="flex gap-6 overflow-x-auto scroll-smooth pb-4 px-1 no-scrollbar snap-x snap-mandatory"
                >
                  @for (product of collection.products; track product.id) {
                    <div class="w-72 sm:w-80 shrink-0 snap-start">
                      <app-product-card
                        [product]="product"
                        (selectProduct)="openProductModal($event)"
                      />
                    </div>
                  }

                  <!-- Shimmer Loading Effect Card for Endless Scroll Feel -->
                  @if (collection.isLoadingMore) {
                    @for (shimmer of [1, 2]; track shimmer) {
                      <div
                        class="w-72 sm:w-80 shrink-0 snap-start bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 space-y-4 animate-pulse"
                      >
                        <div
                          class="w-full h-48 bg-slate-200 dark:bg-slate-700/60 rounded-xl relative overflow-hidden"
                        >
                          <div
                            class="absolute inset-0 bg-linear-to-r from-transparent via-white/20 dark:via-slate-600/20 to-transparent animate-shimmer"
                          ></div>
                        </div>
                        <div class="h-4 bg-slate-200 dark:bg-slate-700/60 rounded w-3/4"></div>
                        <div class="h-3 bg-slate-200 dark:bg-slate-700/60 rounded w-1/2"></div>
                        <div
                          class="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex justify-between items-center"
                        >
                          <div class="h-6 bg-slate-200 dark:bg-slate-700/60 rounded w-20"></div>
                          <div class="h-8 bg-slate-200 dark:bg-slate-700/60 rounded w-24"></div>
                        </div>
                      </div>
                    }
                  }
                </div>

                <!-- Right Flanking Navigation Arrow -->
                <button
                  (click)="scrollContainer(brandIdx, 'right')"
                  aria-label="Scroll right"
                  class="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full border border-slate-200/80 dark:border-slate-700/80 bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 hover:scale-110 transition-all duration-200 shadow-md cursor-pointer backdrop-blur-xs opacity-90 sm:opacity-0 sm:group-hover:opacity-100 active:scale-95"
                >
                  →
                </button>
              </div>
            </section>
          }
        </div>
      }

      <!-- 4. Empty Search State -->
      @if (!isLoading() && brandCollections().length === 0) {
        <div
          class="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3"
        >
          <span class="text-5xl block">🔎</span>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white">
            No products match your filter
          </h3>
          <p class="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
            We couldn't find hardware matching "{{ activeFilter() }}". Try adjusting your search or
            category filter.
          </p>
          <button
            (click)="clearFilter()"
            class="mt-2 inline-block bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-6 py-3 rounded-xl transition cursor-pointer"
          >
            Show All Catalog Items
          </button>
        </div>
      }
    </div>

    <!-- 5. MULTI-MODAL PRODUCT SHOWCASE -->
    @if (selectedProduct()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-fadeIn"
        (click)="closeProductModal()"
      >
        <div
          (click)="$event.stopPropagation()"
          class="relative w-full max-w-4xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-y-auto p-6 sm:p-8 space-y-8 no-scrollbar"
        >
          <!-- Close Button -->
          <button
            (click)="closeProductModal()"
            aria-label="Close modal"
            class="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition cursor-pointer z-10"
          >
            ✕
          </button>

          <!-- Top Grid: Gallery & Product Info -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <!-- Left: Multi-Image Gallery & Wishlist Action -->
            <div class="space-y-4">
              <div
                class="relative w-full h-80 bg-slate-100 dark:bg-slate-950 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 flex items-center justify-center"
              >
                @if (activeModalImage()) {
                  <img
                    [src]="activeModalImage()"
                    [alt]="selectedProduct()?.title"
                    class="w-full h-full object-cover transition-all duration-300"
                  />
                } @else {
                  <span class="text-slate-400 text-sm">No Preview Available</span>
                }

                <!-- Wishlist Heart Toggle Floating Badge -->
                <button
                  (click)="toggleWishlist()"
                  [class.text-red-500]="isWishlisted()"
                  [class.bg-red-50]="isWishlisted()"
                  class="absolute top-3 right-3 p-2.5 rounded-full bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-md hover:scale-110 transition cursor-pointer text-slate-400"
                  title="Toggle Wishlist"
                >
                  <svg
                    class="w-5 h-5"
                    [attr.fill]="isWishlisted() ? 'currentColor' : 'none'"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
              </div>

              <!-- Thumbnails Selector -->
              @if (getModalImages(selectedProduct()).length > 1) {
                <div class="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  @for (imgUrl of getModalImages(selectedProduct()); track $index) {
                    <button
                      (click)="activeImageIndex.set($index)"
                      [class.ring-2]="activeImageIndex() === $index"
                      class="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 shrink-0 cursor-pointer ring-blue-600 transition"
                    >
                      <img
                        [src]="imgUrl"
                        [alt]="'Thumbnail ' + $index"
                        class="w-full h-full object-cover"
                      />
                    </button>
                  }
                </div>
              }
            </div>

            <!-- Right: Details, Regional Price & Purchase CTA -->
            <div class="space-y-5">
              <div>
                <span
                  class="inline-block bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-2"
                >
                  {{ getBrandName(selectedProduct()) }}
                </span>
                <h3 class="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                  {{ selectedProduct()?.title }}
                </h3>
              </div>

              <!-- Unified Regional Price Display -->
              <div class="flex items-baseline gap-3">
                <span class="text-3xl font-black text-slate-900 dark:text-white">
                  {{ currencyService.formatPrice(selectedProduct()) }}
                </span>
                <span
                  class="text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800/60"
                >
                  In Stock & Ready To Dispatch
                </span>
              </div>

              <p
                class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-h-32 overflow-y-auto pr-2 no-scrollbar"
              >
                {{ selectedProduct()?.description }}
              </p>

              <!-- In-App Cart Trigger CTA -->
              <button
                (click)="addToCart(selectedProduct())"
                [disabled]="isModalAdding()"
                class="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-blue-600/30 transition text-sm cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{{ isModalAdding() ? 'Adding to Cart...' : 'Add to Cart' }}</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </button>

              <!-- Safe Payment Trust Bar -->
              <div class="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  🔒 Guaranteed Safe & Encrypted Checkout
                </span>
                <div
                  class="flex flex-wrap gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  <span
                    class="px-2.5 py-1 bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-slate-700 rounded-md"
                  >
                    💚 M-PESA
                  </span>
                  <span
                    class="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md"
                  >
                    💳 Visa / Mastercard
                  </span>
                  <span
                    class="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md"
                  >
                    🛡️ 256-Bit SSL
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom: Smart Related Products Carousel -->
          <div class="pt-6 border-t border-slate-200 dark:border-slate-800">
            <h4 class="text-lg font-bold text-slate-900 dark:text-white mb-4">
              More from {{ getBrandName(selectedProduct()) }}
            </h4>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              @for (related of getRelatedProducts(selectedProduct()); track related.id) {
                <div
                  (click)="openProductModal(related)"
                  class="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 p-3 rounded-2xl cursor-pointer hover:border-blue-500 transition group flex gap-3 items-center"
                >
                  <div
                    class="w-16 h-16 bg-white dark:bg-slate-900 rounded-xl overflow-hidden shrink-0"
                  >
                    @if (getModalImages(related)[0]) {
                      <img
                        [src]="getModalImages(related)[0]"
                        [alt]="related.title"
                        class="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                    }
                  </div>
                  <div class="overflow-hidden">
                    <h5 class="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {{ related.title }}
                    </h5>
                    <p class="text-xs font-bold text-blue-600 dark:text-blue-400 mt-1">
                      {{ currencyService.formatPrice(related) }}
                    </p>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .no-scrollbar::-webkit-scrollbar {
        display: none;
      }
      .no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      @keyframes shimmer {
        0% {
          transform: translateX(-100%);
        }
        100% {
          transform: translateX(100%);
        }
      }
      .animate-shimmer {
        animation: shimmer 1.5s infinite;
      }
    `,
  ],
})
export class ProductsPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private shopifyService = inject(ShopifyService);
  public cartService = inject(CartService);
  public currencyService = inject(CurrencyService);

  @ViewChildren('brandScrollContainer') scrollContainers!: QueryList<ElementRef<HTMLDivElement>>;

  allProducts = signal<Product[]>([]);
  isLoading = signal<boolean>(true);
  pageTitle = signal<string>('All Products');
  activeFilter = signal<string>('');

  // Brand Collections State
  brandCollections = signal<BrandCollection[]>([]);

  // Modal State
  selectedProduct = signal<Product | null>(null);
  activeImageIndex = signal<number>(0);
  isModalAdding = signal<boolean>(false);
  isWishlisted = signal<boolean>(false);

  // Computed Image for Showcase Modal
  activeModalImage = computed(() => {
    const prod = this.selectedProduct();
    if (!prod) return null;
    const images = this.getModalImages(prod);
    return images[this.activeImageIndex()] || images[0] || null;
  });

  async ngOnInit(): Promise<void> {
    try {
      const data = await this.shopifyService.getProducts(36);
      this.allProducts.set(data || []);

      this.route.queryParams.subscribe((params) => {
        const cat = params['category'];
        const q = params['q'];
        this.applyFilterAndGroup(cat, q);
      });
    } catch (err) {
      console.error('Failed to load products page catalog:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  private applyFilterAndGroup(category?: string, query?: string): void {
    let filtered = this.allProducts();
    const active = category || query || '';
    this.activeFilter.set(active);

    if (category) {
      this.pageTitle.set(`Category: ${category}`);
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(category.toLowerCase()) ||
          p.description.toLowerCase().includes(category.toLowerCase()),
      );
    } else if (query) {
      this.pageTitle.set(`Search: "${query}"`);
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase()),
      );
    } else {
      this.pageTitle.set('All Products');
    }

    // Group items dynamically into Brand Collections
    const groups: Record<string, Product[]> = {};
    filtered.forEach((product) => {
      const brand = this.getBrandName(product);
      if (!groups[brand]) groups[brand] = [];
      groups[brand].push(product);
    });

    const collections: BrandCollection[] = Object.keys(groups).map((brand) => ({
      brand,
      products: groups[brand],
      isLoadingMore: false,
      hasMore: true,
    }));

    this.brandCollections.set(collections);
  }

  clearFilter(): void {
    this.activeFilter.set('');
    this.applyFilterAndGroup();
  }

  // Extract brand or vendor name safely
  getBrandName(product: any): string {
    if (!product) return 'TechBytes';
    if (product.vendor) return product.vendor;

    const title = (product.title || '').toLowerCase();
    if (title.includes('apple') || title.includes('iphone') || title.includes('macbook'))
      return 'Apple';
    if (title.includes('samsung') || title.includes('galaxy')) return 'Samsung';
    if (title.includes('dell')) return 'Dell';
    if (title.includes('hp')) return 'HP';
    if (title.includes('sony')) return 'Sony';
    if (title.includes('logitech')) return 'Logitech';
    if (title.includes('asus')) return 'Asus';

    return 'Premium Gear';
  }

  // Scroll Container Left/Right Button Action
  scrollContainer(index: number, direction: 'left' | 'right'): void {
    const containers = this.scrollContainers.toArray();
    if (containers[index]) {
      const el = containers[index].nativeElement;
      const amount = direction === 'left' ? -340 : 340;
      el.scrollBy({ left: amount, behavior: 'smooth' });
    }
  }

  // Infinite Scroll Trigger on Horizontal End-Scroll
  onHorizontalScroll(event: Event, brandIndex: number): void {
    const target = event.target as HTMLElement;
    const scrollEndThreshold = target.scrollWidth - target.scrollLeft - target.clientWidth;

    // Trigger shimmer loader when scrolled within 100px of right boundary
    if (scrollEndThreshold < 100) {
      const current = this.brandCollections();
      const col = current[brandIndex];

      if (col && !col.isLoadingMore && col.hasMore) {
        // Activate shimmer effect
        col.isLoadingMore = true;
        this.brandCollections.set([...current]);

        // Mock lazy loading appended items
        setTimeout(() => {
          col.isLoadingMore = false;
          col.hasMore = col.products.length < 12; // Cap endless generation
          this.brandCollections.set([...current]);
        }, 1200);
      }
    }
  }

  // Multi-Modal Controls
  openProductModal(product: Product): void {
    this.selectedProduct.set(product);
    this.activeImageIndex.set(0);
    this.isWishlisted.set(false);
  }

  closeProductModal(): void {
    this.selectedProduct.set(null);
  }

  toggleWishlist(): void {
    this.isWishlisted.set(!this.isWishlisted());
  }

  getModalImages(product: any): string[] {
    if (!product?.images?.edges) return [];
    return product.images.edges.map((edge: any) => edge.node.url);
  }

  getRelatedProducts(currentProduct: any): Product[] {
    if (!currentProduct) return [];
    const brand = this.getBrandName(currentProduct);
    return this.allProducts()
      .filter((p) => p.id !== currentProduct.id && this.getBrandName(p) === brand)
      .slice(0, 3);
  }

  async addToCart(product: any): Promise<void> {
    const variantId = product?.variants?.edges?.[0]?.node?.id || '';
    if (!variantId) return;

    this.isModalAdding.set(true);
    try {
      await this.cartService.addToCart(variantId, 1);
      this.cartService.openDrawer();
      this.closeProductModal();
    } catch (err) {
      console.error('Failed to add product to cart:', err);
    } finally {
      this.isModalAdding.set(false);
    }
  }
}
