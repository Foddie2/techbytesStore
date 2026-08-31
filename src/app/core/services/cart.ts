import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { createStorefrontApiClient } from '@shopify/storefront-api-client';
import { environment } from '../../../environments/environment';

export interface CartItem {
  id: string; // Line item ID in Shopify
  quantity: number;
  variantId: string;
  variantTitle: string;
  productTitle: string;
  price: { amount: string; currencyCode: string };
  imageUrl: string | null;
}

export interface CartDetails {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  subtotal: { amount: string; currencyCode: string };
  lines: CartItem[];
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private platformId = inject(PLATFORM_ID);

  private client = createStorefrontApiClient({
    storeDomain: environment.shopifyDomain,
    apiVersion: environment.apiVersion || '2026-01',
    publicAccessToken: environment.shopifyToken,
  });

  isOpen = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  cart = signal<CartDetails | null>(null);

  itemCount = computed(() => this.cart()?.totalQuantity || 0);

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  constructor() {
    if (this.isBrowser) {
      this.initCart();
    }
  }

  openDrawer(): void {
    this.isOpen.set(true);
  }

  closeDrawer(): void {
    this.isOpen.set(false);
  }

  toggleDrawer(): void {
    this.isOpen.update((v) => !v);
  }

  async initCart(): Promise<void> {
    const cartId = localStorage.getItem('cart_id');
    if (cartId) {
      await this.fetchCart(cartId);
    }
  }

  async fetchCart(cartId: string): Promise<void> {
    this.isLoading.set(true);
    const query = `
      query getCart($cartId: ID!) {
        cart(id: $cartId) {
          id
          checkoutUrl
          totalQuantity
          cost {
            subtotalAmount { amount currencyCode }
          }
          lines(first: 50) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    price { amount currencyCode }
                    product {
                      title
                      images(first: 1) { edges { node { url } } }
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
      const { data, errors }: any = await this.client.request(query, { variables: { cartId } });
      if (errors || !data?.cart) {
        localStorage.removeItem('cart_id');
        this.cart.set(null);
        return;
      }
      this.cart.set(this.parseShopifyCart(data.cart));
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      localStorage.removeItem('cart_id');
      this.cart.set(null);
    } finally {
      this.isLoading.set(false);
    }
  }

  async addToCart(variantId: string, quantity = 1): Promise<void> {
    this.isLoading.set(true);
    const cartId = localStorage.getItem('cart_id');

    if (!cartId) {
      await this.createCart(variantId, quantity);
    } else {
      const mutation = `
        mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
          cartLinesAdd(cartId: $cartId, lines: $lines) {
            cart {
              id checkoutUrl totalQuantity
              cost { subtotalAmount { amount currencyCode } }
              lines(first: 50) {
                edges {
                  node {
                    id quantity
                    merchandise {
                      ... on ProductVariant {
                        id title price { amount currencyCode }
                        product { title images(first: 1) { edges { node { url } } } }
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
        const { data, errors }: any = await this.client.request(mutation, {
          variables: { cartId, lines: [{ merchandiseId: variantId, quantity }] },
        });

        if (errors || !data?.cartLinesAdd?.cart) {
          localStorage.removeItem('cart_id');
          await this.createCart(variantId, quantity);
        } else {
          this.cart.set(this.parseShopifyCart(data.cartLinesAdd.cart));
        }
      } catch (err) {
        console.error('Add to cart error:', err);
      }
    }

    this.isLoading.set(false);
    this.openDrawer();
  }

  async updateQuantity(lineId: string, quantity: number): Promise<void> {
    if (quantity <= 0) {
      return this.removeItem(lineId);
    }

    const cartId = this.cart()?.id;
    if (!cartId) return;

    this.isLoading.set(true);
    const mutation = `
      mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) {
          cart {
            id checkoutUrl totalQuantity
            cost { subtotalAmount { amount currencyCode } }
            lines(first: 50) {
              edges {
                node {
                  id quantity
                  merchandise {
                    ... on ProductVariant {
                      id title price { amount currencyCode }
                      product { title images(first: 1) { edges { node { url } } } }
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
      const { data }: any = await this.client.request(mutation, {
        variables: { cartId, lines: [{ id: lineId, quantity }] },
      });
      if (data?.cartLinesUpdate?.cart) {
        this.cart.set(this.parseShopifyCart(data.cartLinesUpdate.cart));
      }
    } catch (err) {
      console.error('Update quantity error:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  async removeItem(lineId: string): Promise<void> {
    const cartId = this.cart()?.id;
    if (!cartId) return;

    this.isLoading.set(true);
    const mutation = `
      mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
          cart {
            id checkoutUrl totalQuantity
            cost { subtotalAmount { amount currencyCode } }
            lines(first: 50) {
              edges {
                node {
                  id quantity
                  merchandise {
                    ... on ProductVariant {
                      id title price { amount currencyCode }
                      product { title images(first: 1) { edges { node { url } } } }
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
      const { data }: any = await this.client.request(mutation, {
        variables: { cartId, lineIds: [lineId] },
      });
      if (data?.cartLinesRemove?.cart) {
        this.cart.set(this.parseShopifyCart(data.cartLinesRemove.cart));
      }
    } catch (err) {
      console.error('Remove item error:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  private async createCart(variantId: string, quantity: number): Promise<void> {
    const mutation = `
      mutation cartCreate($input: CartInput) {
        cartCreate(input: $input) {
          cart {
            id checkoutUrl totalQuantity
            cost { subtotalAmount { amount currencyCode } }
            lines(first: 50) {
              edges {
                node {
                  id quantity
                  merchandise {
                    ... on ProductVariant {
                      id title price { amount currencyCode }
                      product { title images(first: 1) { edges { node { url } } } }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const { data }: any = await this.client.request(mutation, {
      variables: { input: { lines: [{ merchandiseId: variantId, quantity }] } },
    });

    const newCart = data?.cartCreate?.cart;
    if (newCart?.id) {
      localStorage.setItem('cart_id', newCart.id);
      this.cart.set(this.parseShopifyCart(newCart));
    }
  }

  private parseShopifyCart(rawCart: any): CartDetails {
    const lines: CartItem[] = rawCart.lines.edges.map((edge: any) => {
      const node = edge.node;
      const merch = node.merchandise;
      return {
        id: node.id,
        quantity: node.quantity,
        variantId: merch.id,
        variantTitle: merch.title !== 'Default Title' ? merch.title : '',
        productTitle: merch.product?.title || 'Product',
        price: merch.price,
        imageUrl: merch.product?.images?.edges?.[0]?.node?.url || null,
      };
    });

    return {
      id: rawCart.id,
      checkoutUrl: rawCart.checkoutUrl,
      totalQuantity: rawCart.totalQuantity,
      subtotal: rawCart.cost?.subtotalAmount || { amount: '0.00', currencyCode: 'USD' },
      lines,
    };
  }

  proceedToCheckout(): void {
    const url = this.cart()?.checkoutUrl;
    if (url && this.isBrowser) {
      window.location.href = url;
    }
  }
}
