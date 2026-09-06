import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ProductsPageComponent } from './pages/products/products.component';
import { TrackOrderComponent } from './pages/track-order/track-order.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'products', component: ProductsPageComponent },
  { path: 'track-order', component: TrackOrderComponent },
  {
    path: 'privacy-policy',
    loadComponent: () =>
      import('./pages/privacy-policy/privacy-policy.component').then(
        (m) => m.PrivacyPolicyComponent,
      ),
  },
  {
    path: 'terms-of-service',
    loadComponent: () =>
      import('./pages/terms-of-service/terms-of-service.component').then(
        (m) => m.TermsOfServiceComponent,
      ),
  },
  { path: 'cookie-policy', redirectTo: 'privacy-policy', pathMatch: 'full' },
  { path: '**', redirectTo: '' },
];
