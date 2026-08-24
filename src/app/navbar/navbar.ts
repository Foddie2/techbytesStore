import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="navbar">
      <div class="logo">
        <h2>techbytesStore</h2>
      </div>
      <div class="cart-status">
        <span>Cart Items: {{ cartCount }}</span>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      background-color: #1a1a1a;
      color: white;
    }
    .logo h2 { margin: 0; }
  `]
})
export class NavbarComponent {
  @Input() cartCount: number = 0;
}