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
            }
          }
        }
      }
    `;

    const { data, errors } = await this.client.request(productQuery);
    if (errors) throw errors;
    return data.products.edges.map((edge: any) => edge.node);
  }
}
