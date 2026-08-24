import { Injectable } from '@angular/core';
import { createStorefrontApiClient } from '@shopify/storefront-api-client';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ShopifyService {
  private client = createStorefrontApiClient({
    storeDomain: environment.shopifyDomain,
    apiVersion: environment.apiVersion || '2026-01',
    publicAccessToken: environment.shopifyToken,
  });

  async getProducts() {
    const productQuery = `
      query getProducts {
        products(first: 10) {
          edges {
            node {
              id
              title
              description
              images(first: 1) {
                edges {
                  node {
                    url
                  }
                }
              }
              variants(first: 1) {
                edges {
                  node {
                    id
                    price {
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
      const { data, errors } = await this.client.request(productQuery);
      if (errors) {
        console.error('Shopify GraphQL Errors:', errors);
        throw errors;
      }
      return data?.products?.edges?.map((edge: any) => edge.node) || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  async createCart(variantId: string) {
    const mutation = `
      mutation cartCreate($input: CartInput) {
        cartCreate(input: $input) {
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
      input: {
        lines: [{ quantity: 1, merchandiseId: variantId }],
      },
    };

    const { data, errors }: any = await this.client.request(mutation, { variables });
    if (errors) throw errors;

    const cart = data?.cartCreate?.cart;
    if (cart?.id) {
      localStorage.setItem('cart_id', cart.id);
    }
    return cart;
  }

  async addToCart(variantId: string) {
    const cartId = localStorage.getItem('cart_id');

    // If no cart exists, create one
    if (!cartId) {
      return this.createCart(variantId);
    }

    const mutation = `
      mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
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
      lines: [{ quantity: 1, merchandiseId: variantId }],
    };

    try {
      const { data, errors }: any = await this.client.request(mutation, { variables });

      // If the cart ID in localStorage expired or became invalid, reset and recreate
      if (errors || !data?.cartLinesAdd?.cart) {
        localStorage.removeItem('cart_id');
        return this.createCart(variantId);
      }

      return data.cartLinesAdd.cart;
    } catch (err) {
      localStorage.removeItem('cart_id');
      return this.createCart(variantId);
    }
  }

  constructor() {
    console.log('Domain:', environment.shopifyDomain);
    console.log('Token:', environment.shopifyToken);
  }
}
