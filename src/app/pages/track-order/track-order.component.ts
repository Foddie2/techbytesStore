import { Component, signal, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface TrackingStep {
  title: string;
  description: string;
  date: string;
  completed: boolean;
  current: boolean;
}

export interface OrderStatusDetails {
  orderNumber: string;
  email: string;
  status: 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered';
  carrier: string;
  trackingNumber: string;
  estimatedDelivery: string;
  shippingAddress: string;
  items: { title: string; quantity: number; price: string }[];
  timeline: TrackingStep[];
}

@Component({
  selector: 'app-track-order',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <!-- Header -->
      <div class="text-center space-y-2">
        <span class="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
          Fulfillment Logistics
        </span>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          Track Your Shipment
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Enter your Shopify order number and email address to view real-time delivery status.
        </p>
      </div>

      <!-- Tracking Search Form -->
      <div
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6"
      >
        <form (ngSubmit)="onTrackOrder()" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-700 dark:text-slate-300">Order Number</label>
            <input
              type="text"
              [(ngModel)]="orderNumber"
              name="orderNumber"
              required
              placeholder="e.g. #TB-1024"
              class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 transition"
            />
          </div>

          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-700 dark:text-slate-300"
              >Email Address</label
            >
            <input
              type="email"
              [(ngModel)]="email"
              name="email"
              required
              placeholder="buyer@example.com"
              class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 transition"
            />
          </div>

          <div class="sm:col-span-2 pt-2">
            <button
              type="submit"
              [disabled]="isLoading() || !orderNumber() || !email()"
              class="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-xl transition shadow-lg shadow-blue-600/20 text-sm cursor-pointer flex items-center justify-center gap-2"
            >
              @if (isLoading()) {
                <div
                  class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                ></div>
                Locating Order...
              } @else {
                <span>Search Tracking Status</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              }
            </button>
          </div>
        </form>

        @if (errorMessage()) {
          <div
            class="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-medium p-3.5 rounded-xl text-center"
          >
            {{ errorMessage() }}
          </div>
        }
      </div>

      <!-- Order Tracking Results Card -->
      @if (orderResult()) {
        <div
          class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-8 shadow-2xl animate-fadeIn"
        >
          <!-- Summary Header -->
          <div
            class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6"
          >
            <div>
              <span class="text-xs font-bold text-slate-400 uppercase">Status Overview</span>
              <h2 class="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                Order {{ orderResult()?.orderNumber }}
              </h2>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Estimated Delivery:
                <strong class="text-slate-900 dark:text-white">{{
                  orderResult()?.estimatedDelivery
                }}</strong>
              </p>
            </div>

            <div
              class="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
            >
              ● {{ orderResult()?.status }}
            </div>
          </div>

          <!-- Timeline Stepper -->
          <div class="space-y-6">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Fulfillment Progress
            </h3>

            <div
              class="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800"
            >
              @for (step of orderResult()?.timeline; track step.title) {
                <div class="relative flex items-start gap-4">
                  <!-- Indicator Node -->
                  <div
                    [class.bg-blue-600]="step.completed || step.current"
                    [class.text-white]="step.completed || step.current"
                    [class.bg-slate-200]="!step.completed && !step.current"
                    [class.dark:bg-slate-800]="!step.completed && !step.current"
                    [class.text-slate-400]="!step.completed && !step.current"
                    class="absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold z-10 shadow-sm"
                  >
                    @if (step.completed) {
                      ✓
                    } @else {
                      •
                    }
                  </div>

                  <div>
                    <h4
                      [class.text-slate-900]="step.completed || step.current"
                      [class.dark:text-white]="step.completed || step.current"
                      [class.text-slate-400]="!step.completed && !step.current"
                      class="text-sm font-bold"
                    >
                      {{ step.title }}
                    </h4>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {{ step.description }}
                    </p>
                    <span class="text-[10px] font-mono text-slate-400 block mt-1">{{
                      step.date
                    }}</span>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Shipment & Carrier Details Grid -->
          <div
            class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-200 dark:border-slate-800"
          >
            <div
              class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-1"
            >
              <span class="text-[10px] font-bold text-slate-400 uppercase">Carrier Info</span>
              <p class="text-xs font-bold text-slate-900 dark:text-white">
                {{ orderResult()?.carrier }} — {{ orderResult()?.trackingNumber }}
              </p>
            </div>

            <div
              class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-1"
            >
              <span class="text-[10px] font-bold text-slate-400 uppercase">Destination</span>
              <p class="text-xs font-bold text-slate-900 dark:text-white truncate">
                {{ orderResult()?.shippingAddress }}
              </p>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class TrackOrderComponent {
  private platformId = inject(PLATFORM_ID);

  orderNumber = signal<string>('');
  email = signal<string>('');
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  orderResult = signal<OrderStatusDetails | null>(null);

  onTrackOrder(): void {
    if (!this.orderNumber() || !this.email()) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.orderResult.set(null);

    setTimeout(() => {
      const cleanNum = this.orderNumber().trim().replace('#', '');

      // Simulated tracking response matching typical Shopify Express fulfillment data
      if (cleanNum.length >= 3) {
        this.orderResult.set({
          orderNumber: `#TB-${cleanNum}`,
          email: this.email(),
          status: 'Shipped',
          carrier: 'DHL Express Global',
          trackingNumber: 'WAYBILL-94820193',
          estimatedDelivery: '3-5 Business Days',
          shippingAddress: '1024 Enterprise Way, Suite 400',
          items: [{ title: 'TechBytes Pro Wireless Headset', quantity: 1, price: '$129.00' }],
          timeline: [
            {
              title: 'Order Verified & Paid',
              description: 'Payment authorized via encrypted Shopify checkout.',
              date: 'Sep 04, 2026 - 10:14 AM',
              completed: true,
              current: false,
            },
            {
              title: 'Dispatched from Warehouse',
              description: 'Package scanned and handed off to carrier.',
              date: 'Sep 05, 2026 - 02:30 PM',
              completed: true,
              current: false,
            },
            {
              title: 'In Transit',
              description: 'Arrived at international distribution sorting hub.',
              date: 'Sep 06, 2026 - 08:45 AM',
              completed: false,
              current: true,
            },
            {
              title: 'Delivered',
              description: 'Package delivered to recipient destination.',
              date: 'Pending Delivery',
              completed: false,
              current: false,
            },
          ],
        });
      } else {
        this.errorMessage.set(
          'Order not found. Please verify your order number and email address.',
        );
      }

      this.isLoading.set(false);
    }, 1200);
  }
}
