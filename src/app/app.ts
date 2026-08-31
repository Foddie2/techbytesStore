import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/components/navbar/navbar.component';
import { CartDrawerComponent } from './shared/components/cart-drawer/cart-drawer.component';
import { CartService } from './core/services/cart';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, CartDrawerComponent],
  template: `
    <app-navbar [cartCount]="cartService.itemCount()" />
    <main
      class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200"
    >
      <router-outlet (activate)="onRouteActivate($event)" />
    </main>

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

  onRouteActivate(componentRef: any) {
    if (componentRef?.onCartUpdated) {
      componentRef.onCartUpdated.subscribe(() => {
        this.cartService.openDrawer();
      });
    }
  }
}
