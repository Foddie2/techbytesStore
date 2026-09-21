import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { createStorefrontApiClient, StorefrontApiClient } from '@shopify/storefront-api-client';
import { environment } from '../../../environments/environment.development';
import { Product, Cart } from '../models/shopify.model';

@Injectable({
  providedIn: 'root',
})
export class ShopifyService {
  private platformId = inject(PLATFORM_ID);
  private _client: StorefrontApiClient | null = null;

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /**
   * Lazy-initializes and validates the Storefront API Client
   */
  private get client(): StorefrontApiClient {
    if (!this._client) {
      const rawDomain = environment.shopifyDomain || '';
      const cleanDomain = rawDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
      const token = environment.shopifyToken || '';

      // Diagnostic Guardrail
      if (!cleanDomain || cleanDomain.includes('YOUR_') || !token || token.includes('YOUR_')) {
        console.error('❌ [Shopify Config Error] Missing or invalid domain/token in environment:', {
          shopifyDomain: rawDomain,
          cleanDomain,
          hasToken: !!token,
        });
      } else {
        console.log('✅ [Shopify Client Initialized]', {
          domain: cleanDomain,
          apiVersion: environment.apiVersion || '2026-01',
        });
      }

      this._client = createStorefrontApiClient({
        storeDomain: cleanDomain,
        apiVersion: environment.apiVersion || '2026-01',
        publicAccessToken: token,
      });
    }

    return this._client;
  }

  /**
   * Fetches products with price & compareAtPrice for discount calculation
   */
  async getProducts(limit: number = 12): Promise<Product[]> {
    const query = `
      query getProducts($limit: Int!) {
        products(first: $limit) {
          edges {
            node {
              id
              handle
              title
              description
              images(first: 2) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
              variants(first: 1) {
                edges {
                  node {
                    id
                    title
                    availableForSale
                    price {
                      amount
                      currencyCode
                    }
                    compareAtPrice {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    try {
      const { data, errors } = await this.client.request(query, {
        variables: { limit },
      });

      if (errors) {
        console.error('⚠️ [Shopify GraphQL Errors]:', errors);
        throw errors;
      }

      return data?.products?.edges?.map((edge: any) => edge.node) || [];
    } catch (error: any) {
      console.error('💥 [Shopify getProducts Failed]:', {
        message: error.message,
        domainUsed: environment.shopifyDomain,
      });
      return [];
    }
  }

  /**
   * Add variant to active cart session
   */
  async addToCart(variantId: string, quantity: number = 1): Promise<Cart> {
    const cartId = this.isBrowser ? localStorage.getItem('cart_id') : null;

    if (!cartId) {
      return this.createCart(variantId, quantity);
    }

    const mutation = `
      mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
          cart {
            id
            checkoutUrl
            totalQuantity
          }
        }
      }
    `;

    try {
      const { data, errors }: any = await this.client.request(mutation, {
        variables: {
          cartId,
          lines: [{ merchandiseId: variantId, quantity }],
        },
      });

      if (errors || !data?.cartLinesAdd?.cart) {
        if (this.isBrowser) localStorage.removeItem('cart_id');
        return this.createCart(variantId, quantity);
      }

      return data.cartLinesAdd.cart;
    } catch (error) {
      if (this.isBrowser) localStorage.removeItem('cart_id');
      return this.createCart(variantId, quantity);
    }
  }

  /**
   * Create new cart session
   */
  private async createCart(variantId: string, quantity: number = 1): Promise<Cart> {
    const mutation = `
      mutation cartCreate($input: CartInput) {
        cartCreate(input: $input) {
          cart {
            id
            checkoutUrl
            totalQuantity
          }
        }
      }
    `;

    const { data, errors }: any = await this.client.request(mutation, {
      variables: {
        input: {
          lines: [{ merchandiseId: variantId, quantity }],
        },
      },
    });

    if (errors) throw errors;
    const cart = data?.cartCreate?.cart;

    if (cart?.id && this.isBrowser) {
      localStorage.setItem('cart_id', cart.id);
    }

    return cart;
  }

  /**
   * Dropshipping Accelerator: Direct Redirect to Shopify Checkout
   */
  async buyNow(variantId: string): Promise<void> {
    const cart = await this.addToCart(variantId, 1);
    if (cart?.checkoutUrl && this.isBrowser) {
      window.location.href = cart.checkoutUrl;
    }
  }

  /**
   * Update Cart Buyer Identity using unified Storefront Client
   */
  async updateCartBuyerIdentity(
    cartId: string,
    buyerDetails: {
      email: string;
      phone?: string;
      firstName: string;
      lastName: string;
      address1: string;
      city: string;
      countryCode?: string;
    },
  ): Promise<string | null> {
    const mutation = `
      mutation cartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
        cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
          cart {
            id
            checkoutUrl
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      cartId,
      buyerIdentity: {
        email: buyerDetails.email,
        phone: buyerDetails.phone || undefined,
        deliveryAddressPreferences: [
          {
            deliveryAddress: {
              firstName: buyerDetails.firstName,
              lastName: buyerDetails.lastName,
              address1: buyerDetails.address1,
              city: buyerDetails.city,
              country: buyerDetails.countryCode || 'KE',
            },
          },
        ],
      },
    };

    try {
      const { data, errors }: any = await this.client.request(mutation, { variables });

      if (errors) {
        console.error('Shopify Buyer Identity GraphQL Errors:', errors);
        return null;
      }

      const cartData = data?.cartBuyerIdentityUpdate;

      if (cartData?.userErrors?.length > 0) {
        console.warn('Shopify Buyer Identity User Errors:', cartData.userErrors);
      }

      return cartData?.cart?.checkoutUrl || null;
    } catch (error) {
      console.error('Failed to sync buyer identity with Shopify:', error);
      return null;
    }
  }
}
