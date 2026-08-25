import { Component, signal } from '@angular/core';
import { Navbar } from './components/navbar/navbar.component';
import { ProductListComponent } from './components/product-list/product-list.component';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [Navbar, ProductListComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class AppComponent {
  cartCount = signal<number>(0);

  incrementCart() {
    this.cartCount.update((count) => count + 1);
  }
}
