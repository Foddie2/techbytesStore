// export interface ShopifyPrice {
//   amount: string;
//   currencyCode: string;
// }

// export interface ShopifyImage {
//   url: string;
// }

// export interface ShopifyVariant {
//   id: string;
//   price: ShopifyPrice;
// }

// export interface Product {
//   id: string;
//   title: string;
//   description: string;
//   images: { edges: Array<{ node: ShopifyImage }> };
//   variants: { edges: Array<{ node: ShopifyVariant }> };
// }

// export interface CartResponse {
//   id: string;
//   checkoutUrl: string;
// }

export interface MoneyV2 {
  amount: string;
  currencyCode: string;
}

export interface ProductImage {
  url: string;
  altText?: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  price: MoneyV2;
  compareAtPrice?: MoneyV2 | null;
  availableForSale: boolean;
}

export interface Product {
  id: string;
  handle: string;
  title: string;
  description: string;
  images: {
    edges: Array<{ node: ProductImage }>;
  };
  variants: {
    edges: Array<{ node: ProductVariant }>;
  };
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity?: number;
}

//
export interface CartResponse {
  id: string;
  checkoutUrl: string;
}
