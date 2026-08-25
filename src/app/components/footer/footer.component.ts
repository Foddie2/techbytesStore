import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="footer-section">
      <div class="container mx-auto px-4 lg:px-8">
        <div class="footer-grid">
          <div class="footer-col brand-col">
            <div class="logo-wrapper">
              <span class="text-2xl font-bold text-white">
                <span class="text-blue-500">i</span>Data
              </span>
              <p class="mt-4">7637 Laurel Dr. King Of Prussia, PA 19406</p>
              <p class="text-slate-400 mt-2 italic text-xs">
                Reliable automated data systems and infrastructure.
              </p>
            </div>
          </div>

          <div class="footer-col">
            <h6>About Company</h6>
            <p class="mb-6">
              Leading the industry in high-precision hardware and software integration.
            </p>
            <p>Phone: (123) 456-7890</p>
            <p>Email: support&#64;idata.com</p>
          </div>

          <div class="footer-col">
            <h6>Help & Links</h6>
            <div class="grid grid-cols-2 gap-4">
              <ul class="link-list">
                <li><a routerLink="/">Home</a></li>
                <li><a routerLink="/about">About</a></li>
                <li><a routerLink="/services">Service</a></li>
                <li><a routerLink="/team">Team</a></li>
              </ul>
              <ul class="link-list">
                <li><a routerLink="/terms">Terms</a></li>
              </ul>
            </div>
          </div>

          <div class="footer-col newsletter-col">
            <h6>Newsletter</h6>
            <div class="social-links mb-6">
              <a href="#"><i class="bi bi-facebook"></i></a>
              <a href="#"><i class="bi bi-instagram"></i></a>
              <a href="#"><i class="bi bi-linkedin"></i></a>
            </div>
            <form class="newsletter-form" (submit)="$event.preventDefault()">
              <input type="email" placeholder="Email address..." />
              <button type="submit">Go</button>
            </form>
            <p class="mt-4 text-[10px] uppercase tracking-widest text-slate-500">
              Subscribe for tech updates
            </p>
          </div>
        </div>

        <hr class="border-slate-800 my-8" />

        <div class="footer-bottom">
          <p>© 2026 iData. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  `,
  styles: [
    `
      .footer-section {
        background-color: #0f172a;
        color: #94a3b8;
        padding: 4rem 0 2rem;
        font-family:
          system-ui,
          -apple-system,
          sans-serif;
      }

      .footer-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 2.5rem;
      }

      .footer-col h6 {
        color: #ffffff;
        font-size: 1.125rem;
        font-weight: 600;
        margin-bottom: 1.25rem;
      }

      .link-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .link-list li {
        margin-bottom: 0.5rem;
      }

      .link-list a {
        color: #94a3b8;
        text-decoration: none;
        transition: color 0.2s ease;
      }

      .link-list a:hover {
        color: #3b82f6;
      }

      .social-links {
        display: flex;
        gap: 1rem;
      }

      .social-links a {
        color: #94a3b8;
        font-size: 1.25rem;
        transition: color 0.2s ease;
      }

      .social-links a:hover {
        color: #3b82f6;
      }

      .newsletter-form {
        display: flex;
        gap: 0.5rem;
      }

      .newsletter-form input {
        background-color: #1e293b;
        border: 1px solid #334155;
        color: #ffffff;
        padding: 0.5rem 0.75rem;
        border-radius: 0.375rem;
        outline: none;
        width: 100%;
      }

      .newsletter-form button {
        background-color: #2563eb;
        color: #ffffff;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 0.375rem;
        cursor: pointer;
        font-weight: 600;
      }

      .newsletter-form button:hover {
        background-color: #1d4ed8;
      }

      .footer-bottom {
        text-align: center;
        font-size: 0.875rem;
        color: #64748b;
      }
    `,
  ],
})
export class FooterComponent {}
