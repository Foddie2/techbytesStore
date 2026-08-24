import { Component, input } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  template: `
    <nav class="navbar">
      <div class="brand">TechBytes Store</div>
      <div class="cart-badge">🛒 Cart ({{ cartCount() }})</div>
    </nav>
  `,
  styles: [
    `
      .navbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 2rem;
        background: #111827;
        color: #ffffff;
      }
      .brand {
        font-weight: 700;
        font-size: 1.25rem;
      }
      .cart-badge {
        background: #10b981;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        font-weight: 600;
      }
    `,
  ],
})
export class Navbar {
  // Modern Angular input signal
  cartCount = input<number>(0);
}
