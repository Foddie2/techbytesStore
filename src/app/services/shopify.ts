import { Injectable } from '@angular/core';
import { createStorefrontApiClient } from '@shopify/storefront-api-client';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ShopifyService {
  private client = createStorefrontApiClient({
    storeDomain: environment.shopifyDomain,
    apiVersion: environment.apiVersion,
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
              variants(first: 1) { # FIX: Added this to provide IDs for the cart
                edges {
                  node {
                    id
                  }
                }
              }
            }
          }
        }
      }
    `;

    const { data, errors } = await this.client.request(productQuery);
    if (errors) throw errors;
    return data.products.edges.map((edge: any) => edge.node);
  }

  //"Add to Cart" functionality using Shopify's Checkout API
  // Add these to your ShopifyService class

async createCart(variantId: string) {
  const mutation = `
    mutation cartCreate($input: CartInput) {
      cartCreate(input: $input) {
        cart {
          id
          checkoutUrl
        }
      }
    }
  `;

  const variables = {
    input: {
      lines: [{ quantity: 1, merchandiseId: variantId }]
    }
  };

  const { data }: any = await this.client.request(mutation, { variables });
  localStorage.setItem('cart_id', data.cartCreate.cart.id);
  return data.cartCreate.cart;
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
      }
    }
  `;

  const variables = {
    cartId,
    lines: [{ quantity: 1, merchandiseId: variantId }]
  };

  const { data }: any = await this.client.request(mutation, { variables });
  return data.cartLinesAdd.cart;
}
}
