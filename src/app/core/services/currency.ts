import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface CurrencyOption {
  code: string;
  symbol: string;
}

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private platformId = inject(PLATFORM_ID);

  private initialSetup = this.getInitialCurrency();

  readonly selectedCurrency = signal<CurrencyOption>({
    code: this.initialSetup.code,
    symbol: this.initialSetup.symbol,
  });

  readonly detectedCountry = signal<string>(this.initialSetup.country);
  readonly rates = signal<Record<string, number>>({ USD: 1.0, KES: 129.0, EUR: 0.92, GBP: 0.78 });

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initCurrencyAndRates();
    }
  }

  private getInitialCurrency(): { code: string; symbol: string; country: string } {
    if (isPlatformBrowser(inject(PLATFORM_ID))) {
      // 1. Respect explicit manual user language/currency override
      const savedOverride = localStorage.getItem('user_currency_override');
      if (savedOverride) {
        const symbol =
          savedOverride === 'KES'
            ? 'KSh'
            : savedOverride === 'EUR'
              ? '€'
              : savedOverride === 'GBP'
                ? '£'
                : '$';
        return { code: savedOverride, symbol, country: savedOverride === 'KES' ? 'KE' : 'US' };
      }

      // 2. Instant Local Timezone Geo-Check (Kenya -> KES, Others -> USD)
      try {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
        if (timeZone.includes('Nairobi') || timeZone.includes('Africa/Nairobi')) {
          return { code: 'KES', symbol: 'KSh', country: 'KE' };
        }
      } catch {}
    }

    // Default international region fallback to USD
    return { code: 'USD', symbol: '$', country: 'US' };
  }

  private async initCurrencyAndRates(): Promise<void> {
    // Background IP Geolocation lookup
    try {
      const geoRes = await fetch('https://ipwho.is/');
      const geoData = await geoRes.json();
      if (geoData?.success && geoData?.country_code) {
        const country = geoData.country_code;
        this.detectedCountry.set(country);

        // Auto-switch to KES if in Kenya and no manual override was set
        if (!localStorage.getItem('user_currency_override')) {
          if (country === 'KE') {
            this.setCurrencyCode('KES', false);
          } else {
            this.setCurrencyCode('USD', false);
          }
        }
      }
    } catch {
      console.warn('IP Geo-lookup skipped, using native timezone resolution.');
    }

    // Fetch live market conversion rates
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      const data = await res.json();
      if (data?.rates) {
        this.rates.set(data.rates);
      }
    } catch {
      console.warn('Rates API unavailable, using KES fallback conversion rate.');
    }
  }

  public setCurrencyCode(code: string, isManualOverride = true): void {
    const symbol = code === 'KES' ? 'KSh' : code === 'EUR' ? '€' : code === 'GBP' ? '£' : '$';
    this.selectedCurrency.set({ code, symbol });

    if (isManualOverride && isPlatformBrowser(this.platformId)) {
      localStorage.setItem('user_currency_override', code);
    }
  }

  /**
   * Universal price extractor & formatter for Hero, Drops, Top Selling & Cart Drawer
   */
  formatPrice(priceData: any): string {
    if (!priceData) return `${this.selectedCurrency().symbol} 0`;

    const priceObj = priceData?.variants?.edges?.[0]?.node?.price || priceData?.price || priceData;
    const rawAmount =
      typeof priceObj?.amount === 'string' ? parseFloat(priceObj.amount) : priceObj?.amount;

    if (rawAmount === undefined || rawAmount === null || isNaN(rawAmount)) {
      return `${this.selectedCurrency().symbol} 0`;
    }

    const baseCurrency = priceObj?.currencyCode || 'USD';
    const targetCurrency = this.selectedCurrency().code;
    const currentRates = this.rates();

    const baseRate = currentRates[baseCurrency] || 1.0;
    const targetRate = currentRates[targetCurrency] || (targetCurrency === 'KES' ? 129.0 : 1.0);

    const convertedAmount = (rawAmount / baseRate) * targetRate;
    const decimals = ['KES', 'JPY', 'UGX', 'TZS'].includes(targetCurrency) ? 0 : 2;

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: targetCurrency,
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals,
    }).format(convertedAmount);
  }
}
