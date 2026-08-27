import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { createStorefrontApiClient } from '@shopify/storefront-api-client';
import { environment } from '../../../environments/environment';
import { Product, CartResponse } from '../models/shopify.model';

@Injectable({
  providedIn: 'root',
})
export class ShopifyService {
  private platformId = inject(PLATFORM_ID);
  private client = createStorefrontApiClient({
    storeDomain: environment.shopifyDomain,
    apiVersion: environment.apiVersion || '2026-01',
    publicAccessToken: environment.shopifyToken,
  });

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  async getProducts(): Promise<Product[]> {
    const query = `
      query getProducts {
        products(first: 10) {
          edges {
            node {
              id title description
              images(first: 1) { edges { node { url } } }
              variants(first: 1) { edges { node { id price { amount currencyCode } } } }
            }
          }
        }
      }
    `;
    const { data, errors } = await this.client.request(query);
    if (errors) throw errors;
    return data?.products?.edges?.map((edge: any) => edge.node) || [];
  }

  async addToCart(variantId: string): Promise<CartResponse> {
    const cartId = this.isBrowser ? localStorage.getItem('cart_id') : null;
    if (!cartId) return this.createCart(variantId);

    const mutation = `
      mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) { cart { id checkoutUrl } }
      }
    `;
    const { data, errors }: any = await this.client.request(mutation, {
      variables: { cartId, lines: [{ quantity: 1, merchandiseId: variantId }] },
    });

    if (errors || !data?.cartLinesAdd?.cart) {
      if (this.isBrowser) localStorage.removeItem('cart_id');
      return this.createCart(variantId);
    }
    return data.cartLinesAdd.cart;
  }

  private async createCart(variantId: string): Promise<CartResponse> {
    const mutation = `
      mutation cartCreate($input: CartInput) {
        cartCreate(input: $input) { cart { id checkoutUrl } }
      }
    `;
    const { data, errors }: any = await this.client.request(mutation, {
      variables: { input: { lines: [{ quantity: 1, merchandiseId: variantId }] } },
    });
    if (errors) throw errors;
    const cart = data?.cartCreate?.cart;
    if (cart?.id && this.isBrowser) {
      localStorage.setItem('cart_id', cart.id);
    }
    return cart;
  }
}
