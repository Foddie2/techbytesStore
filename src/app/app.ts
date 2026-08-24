import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RouterModule } from '@angular/router';
import { Footer } from './footer/footer';
@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule, Footer],
  template: `
    <nav class="navbar navbar-expand-lg sticky-top custom-nav" [class.scrolled]="isScrolled">
      <div class="container">
        <a class="navbar-brand" routerLink="/"> <span class="brand-i">Tech</span>bytesStore </a>

        <button
          class="navbar-toggler border-0 shadow-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navContent"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navContent">
          <ul class="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center">
            <li class="nav-item">
              <a
                class="nav-link"
                routerLink="/"
                routerLinkActive="active"
                [routerLinkActiveOptions]="{ exact: true }"
                >Home</a
              >
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/products" routerLinkActive="active">Products</a>
            </li>

            <li class="nav-item dropdown custom-dropdown">
              <a
                class="nav-link dropdown-toggle"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Solutions
              </a>
              <ul class="dropdown-menu animate slideIn shadow-lg border-0">
                <li>
                  <a class="dropdown-item py-2" href="#"
                    ><i class="bi bi-qr-code-scan me-2 text-primary"></i> Barcode Scanners</a
                  >
                </li>
                <li>
                  <a class="dropdown-item py-2" href="#"
                    ><i class="bi bi-device-ssd me-2 text-primary"></i> Barcode Devices</a
                  >
                </li>
                <li>
                  <a class="dropdown-item py-2" href="#"
                    ><i class="bi bi-printer me-2 text-primary"></i> Barcode Printers</a
                  >
                </li>
                <li><hr class="dropdown-divider opacity-50" /></li>
                <li>
                  <a class="dropdown-item py-2 fw-bold text-primary" href="#"
                    >View All Solutions →</a
                  >
                </li>
              </ul>
            </li>

            <li class="nav-item">
              <a class="nav-link" routerLink="/services" routerLinkActive="active">Services</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/blog" routerLinkActive="active">Blog</a>
            </li>
            <li class="nav-item ms-lg-4">
              <a routerLink="/contact" class="btn contact-btn shadow-sm"> Contact Us </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <router-outlet></router-outlet>
    <app-footer></app-footer>
  `,
  styleUrl: './app.scss',
})
export class AppComponent {
  // <-- Must match 'AppComponent'
  isScrolled = false;
  cartCount = signal<number>(0);

  incrementCart() {
    this.cartCount.update((count) => count + 1);
  }
}
