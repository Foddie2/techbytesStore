import { Component, signal } from '@angular/core';
import { Navbar as NavbarComponent } from './components/navbar/navbar.component';
import { ProductList as ProductListComponent } from './components/product-list/product-list.component';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [NavbarComponent, ProductListComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class AppComponent {
  cartCount = signal<number>(0);

  incrementCart() {
    this.cartCount.update((count) => count + 1);
  }
}
