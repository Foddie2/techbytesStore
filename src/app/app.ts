import { Component, forwardRef, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/components/navbar/navbar.component';
import { Footer } from './shared/components/footer/footer';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet, forwardRef(() => Navbar), forwardRef(() => Footer)],
  template: `
    <app-navbar [cartCount]="cartCount()" />
    <main class="min-h-screen bg-slate-50 dark:bg-slate-950">
      <router-outlet />
    </main>
    <app-footer />
  `,
})
export class AppComponent {
  cartCount = signal<number>(0);

  incrementCart() {
    this.cartCount.update((count) => count + 1);
  }
}
