import { useCart } from '../context/CartContext';
import { linePrice, soles } from '../lib/money';
import type { CartLine } from '../types';

export function CartItem({ line }: { line: CartLine }) {
  const { products, setQty, remove } = useCart();
  const product = products.find((p) => p.id === line.productId);
  if (!product) {
    return null;
  }
  const variant = product.variants?.find((v) => v.id === line.variantId);
  const unit = linePrice(product.price, variant?.price);

  return (
    <li className="flex gap-3 border-b border-black/5 py-3">
      <img
        src={product.image}
        alt=""
        width={72}
        height={72}
        className="h-16 w-16 rounded-lg object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="font-medium">{product.name}</p>
        {variant && <p className="text-xs text-[color:var(--color-muted)]">{variant.label}</p>}
        <p className="text-sm text-[color:var(--color-muted)]">{soles(unit)}</p>
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            className="h-7 w-7 rounded border border-black/10"
            onClick={() => setQty(line.productId, line.qty - 1, line.variantId)}
          >
            −
          </button>
          <span className="w-6 text-center text-sm">{line.qty}</span>
          <button
            type="button"
            className="h-7 w-7 rounded border border-black/10"
            onClick={() => setQty(line.productId, line.qty + 1, line.variantId)}
          >
            +
          </button>
          <button
            type="button"
            className="ml-auto text-xs text-[color:var(--color-cocoa)]"
            onClick={() => remove(line.productId, line.variantId)}
          >
            Quitar
          </button>
        </div>
      </div>
      <p className="text-sm font-semibold">{soles(unit * line.qty)}</p>
    </li>
  );
}
