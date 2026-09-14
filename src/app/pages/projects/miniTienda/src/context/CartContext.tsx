import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import productsData from '../data/products.json';
import { linePrice } from '../lib/money';
import type { CartLine, Product } from '../types';

const products = productsData as Product[];

type CartContextValue = {
  products: Product[];
  lines: CartLine[];
  count: number;
  total: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (productId: string, qty: number, variantId?: string) => void;
  setQty: (productId: string, qty: number, variantId?: string) => void;
  remove: (productId: string, variantId?: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function sameLine(a: CartLine, productId: string, variantId?: string): boolean {
  return a.productId === productId && a.variantId === variantId;
}

export function CartProvider({ children }: { children: ReactNode }) {
  // Demo de sesión: el carrito vive en memoria.
  // Si más adelante quieres persistirlo: localStorage.setItem('miga-cart', JSON.stringify(lines))
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((n, l) => n + l.qty, 0);
    const total = lines.reduce((sum, line) => {
      const product = products.find((p) => p.id === line.productId);
      if (!product) {
        return sum;
      }
      const variant = product.variants?.find((v) => v.id === line.variantId);
      return sum + linePrice(product.price, variant?.price) * line.qty;
    }, 0);

    return {
      products,
      lines,
      count,
      total,
      open,
      setOpen,
      add(productId, qty, variantId) {
        setLines((prev) => {
          const found = prev.find((l) => sameLine(l, productId, variantId));
          if (found) {
            return prev.map((l) =>
              sameLine(l, productId, variantId) ? { ...l, qty: l.qty + qty } : l,
            );
          }
          return [...prev, { productId, variantId, qty }];
        });
        setOpen(true);
      },
      setQty(productId, qty, variantId) {
        setLines((prev) => {
          if (qty <= 0) {
            return prev.filter((l) => !sameLine(l, productId, variantId));
          }
          return prev.map((l) => (sameLine(l, productId, variantId) ? { ...l, qty } : l));
        });
      },
      remove(productId, variantId) {
        setLines((prev) => prev.filter((l) => !sameLine(l, productId, variantId)));
      },
      clear() {
        setLines([]);
      },
    };
  }, [lines, open]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart debe usarse dentro de CartProvider');
  }
  return ctx;
}
