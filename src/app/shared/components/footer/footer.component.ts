import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <footer
      class="bg-slate-900 text-slate-300 border-t border-slate-800 transition-colors duration-200"
    >
      <div class="max-w-7xl mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <!-- Brand Column -->
          <div class="lg:col-span-2 space-y-4">
            <a
              routerLink="/"
              class="text-2xl font-extrabold text-white tracking-tight flex items-center gap-1"
            >
              <span class="text-blue-500">Tech</span>Bytes
            </a>
            <p class="text-sm text-slate-400 leading-relaxed max-w-sm">
              Your destination for high-performance electronics and verified accessories. Synced
              directly via Shopify Storefront APIs for fast global dispatch.
            </p>
            <div class="flex items-center gap-3 pt-2">
              <span
                class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              >
                🛡️ 256-Bit SSL Encrypted
              </span>
              <span
                class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20"
              >
                🚚 Tracked Express Shipping
              </span>
            </div>
          </div>

          <!-- Quick Navigation -->
          <div class="space-y-3">
            <h4 class="text-sm font-bold text-white uppercase tracking-wider">Catalog</h4>
            <ul class="space-y-2 text-sm">
              <li>
                <a
                  routerLink="/products"
                  [queryParams]="{ category: 'Laptops' }"
                  class="hover:text-white transition"
                  >Laptops</a
                >
              </li>
              <li>
                <a
                  routerLink="/products"
                  [queryParams]="{ category: 'Smartphones' }"
                  class="hover:text-white transition"
                  >Smartphones</a
                >
              </li>
              <li>
                <a
                  routerLink="/products"
                  [queryParams]="{ category: 'Headphones' }"
                  class="hover:text-white transition"
                  >Headphones</a
                >
              </li>
              <li>
                <a
                  routerLink="/products"
                  [queryParams]="{ category: 'Accessories' }"
                  class="hover:text-white transition"
                  >Accessories</a
                >
              </li>
              <li>
                <a routerLink="/best-sellers" class="hover:text-white transition">Best Sellers</a>
              </li>
            </ul>
          </div>

          <!-- Customer Service -->
          <div class="space-y-3">
            <h4 class="text-sm font-bold text-white uppercase tracking-wider">Customer Care</h4>
            <ul class="space-y-2 text-sm">
              <li>
                <a
                  routerLink="/track-order"
                  class="hover:text-white transition font-semibold text-blue-400"
                  >Track Order</a
                >
              </li>
              <li>
                <a routerLink="/#faq" class="hover:text-white transition">Shipping & Delivery</a>
              </li>
              <li>
                <a routerLink="/#faq" class="hover:text-white transition">30-Day Money Back</a>
              </li>
              <li>
                <a routerLink="/#faq" class="hover:text-white transition">Help Center / FAQ</a>
              </li>
            </ul>
          </div>

          <!-- Store Policies -->
          <div class="space-y-3">
            <h4 class="text-sm font-bold text-white uppercase tracking-wider">Legal</h4>
            <ul class="space-y-2 text-sm">
              <li>
                <a routerLink="/products" class="hover:text-white transition">Privacy Policy</a>
              </li>
              <li>
                <a routerLink="/products" class="hover:text-white transition">Terms of Service</a>
              </li>
              <li>
                <a routerLink="/products" class="hover:text-white transition">Refund Policy</a>
              </li>
            </ul>
          </div>
        </div>

        <!-- Divider -->
        <div class="border-t border-slate-800 my-10"></div>

        <!-- Bottom Bar -->
        <div
          class="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500"
        >
          <p>
            © {{ currentYear }} TechBytes Store. All rights reserved. Headless Shopify Integration.
          </p>

          <!-- Supported Payment Badges -->
          <div class="flex items-center gap-2 font-mono text-slate-400">
            <span class="px-2 py-1 bg-slate-800 rounded text-[10px] font-bold">VISA</span>
            <span class="px-2 py-1 bg-slate-800 rounded text-[10px] font-bold">MASTERCARD</span>
            <span class="px-2 py-1 bg-slate-800 rounded text-[10px] font-bold">AMEX</span>
            <span class="px-2 py-1 bg-slate-800 rounded text-[10px] font-bold">PAYPAL</span>
            <span class="px-2 py-1 bg-slate-800 rounded text-[10px] font-bold">APPLE PAY</span>
          </div>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  currentYear: number = new Date().getFullYear();
}
