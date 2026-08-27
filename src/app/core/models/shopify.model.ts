export interface ShopifyPrice {
  amount: string;
  currencyCode: string;
}

export interface ShopifyImage {
  url: string;
}

export interface ShopifyVariant {
  id: string;
  price: ShopifyPrice;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  images: { edges: Array<{ node: ShopifyImage }> };
  variants: { edges: Array<{ node: ShopifyVariant }> };
}

export interface CartResponse {
  id: string;
  checkoutUrl: string;
}
