import { Component, OnInit, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/components/navbar/navbar.component';
// import { FooterComponent } from './shared/components/footer/footer.component';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet, Navbar /*, FooterComponent */],
  template: `
    <app-navbar [cartCount]="cartCount()" />
    <main class="min-h-screen bg-slate-50 dark:bg-slate-950">
      <router-outlet (activate)="onRouteActivate($event)" />
    </main>
    <!-- <app-footer /> -->
  `,
})
export class AppComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  cartCount = signal<number>(0);

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const savedCount = localStorage.getItem('cart_count');
      if (savedCount) {
        this.cartCount.set(parseInt(savedCount, 10));
      }
    }
  }

  incrementCart() {
    this.cartCount.update((count) => {
      const newCount = count + 1;
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('cart_count', newCount.toString());
      }
      return newCount;
    });
  }

  onRouteActivate(componentRef: any) {
    if (componentRef?.onCartUpdated) {
      componentRef.onCartUpdated.subscribe(() => this.incrementCart());
    }
  }
}
