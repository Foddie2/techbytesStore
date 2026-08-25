import { Component, signal } from '@angular/core';
import { Navbar } from './components/navbar';
import { ProductList } from './components/product-list';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [Navbar, ProductList],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class AppComponent {
  cartCount = signal<number>(0);

  incrementCart() {
    this.cartCount.update((count) => count + 1);
  }
}
