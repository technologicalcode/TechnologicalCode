export type ProductVariant = {
  id: string;
  label: string;
  price: number;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  featured?: boolean;
  variants?: ProductVariant[];
};

export type CartLine = {
  productId: string;
  variantId?: string;
  qty: number;
};
