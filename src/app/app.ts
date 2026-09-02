import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { CartDrawerComponent } from './shared/components/cart-drawer/cart-drawer.component';
import { CartService } from './core/services/cart';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, FooterComponent, CartDrawerComponent],
  template: `
    <app-navbar />
    <main
      class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200"
    >
      <router-outlet />
    </main>
    <app-footer />

    <!-- Global Slide-Over Cart Drawer -->
    <app-cart-drawer />
  `,
})
export class AppComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  public cartService = inject(CartService);

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.cartService.initCart();
    }
  }
}
