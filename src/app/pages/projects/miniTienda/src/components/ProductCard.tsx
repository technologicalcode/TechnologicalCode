import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { soles } from '../lib/money';
import type { Product } from '../types';

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const from = product.variants?.[0]?.price ?? product.price;

  return (
    <article className="overflow-hidden rounded-2xl bg-[color:var(--color-paper)] shadow-sm ring-1 ring-black/5">
      <Link to={`/producto/${product.id}`} className="block">
        <img
          src={product.image}
          alt={product.name}
          width={600}
          height={480}
          loading="lazy"
          className="aspect-[5/4] w-full object-cover"
        />
      </Link>
      <div className="flex flex-col gap-2 p-4">
        <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--color-cocoa)]">
          {product.category}
        </p>
        <Link to={`/producto/${product.id}`} className="text-lg font-semibold">
          {product.name}
        </Link>
        <p className="text-[color:var(--color-muted)]">
          {product.variants ? `Desde ${soles(from)}` : soles(product.price)}
        </p>
        <button
          type="button"
          onClick={() => add(product.id, 1, product.variants?.[0]?.id)}
          className="mt-1 rounded-full bg-[color:var(--color-ink)] px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
        >
          Agregar al carrito
        </button>
      </div>
    </article>
  );
}
