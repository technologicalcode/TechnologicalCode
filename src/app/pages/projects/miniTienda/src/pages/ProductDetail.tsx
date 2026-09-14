import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { soles } from '../lib/money';

export function ProductDetail() {
  const { id } = useParams();
  const { products, add } = useCart();
  const product = products.find((p) => p.id === id);
  const [qty, setQty] = useState(1);
  const [variantId, setVariantId] = useState(product?.variants?.[0]?.id);

  if (!product) {
    return (
      <div className="mx-auto w-[min(100%-2rem,40rem)] py-20 text-center">
        <p>No encontramos ese producto.</p>
        <Link to="/catalogo" className="mt-4 inline-block text-[color:var(--color-cocoa)]">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const variant = product.variants?.find((v) => v.id === variantId);
  const price = variant?.price ?? product.price;

  return (
    <div className="mx-auto grid w-[min(100%-2rem,72rem)] gap-8 py-10 md:grid-cols-2">
      <img
        src={product.image}
        alt={product.name}
        width={900}
        height={900}
        className="aspect-square w-full rounded-3xl object-cover"
      />
      <div>
        <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--color-cocoa)]">
          {product.category}
        </p>
        <h1 className="mt-2 text-4xl font-semibold">{product.name}</h1>
        <p className="mt-3 text-2xl">{soles(price)}</p>
        <p className="mt-4 max-w-md text-[color:var(--color-muted)]">{product.description}</p>

        {product.variants && (
          <div className="mt-6">
            <p className="mb-2 text-sm font-medium">Tamaño</p>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVariantId(v.id)}
                  className={`rounded-full px-3 py-1.5 text-sm ${
                    variantId === v.id
                      ? 'bg-[color:var(--color-ink)] text-white'
                      : 'bg-white ring-1 ring-black/10'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center gap-3">
          <button type="button" className="h-10 w-10 rounded-full bg-white" onClick={() => setQty((n) => Math.max(1, n - 1))}>
            −
          </button>
          <span className="w-8 text-center">{qty}</span>
          <button type="button" className="h-10 w-10 rounded-full bg-white" onClick={() => setQty((n) => n + 1)}>
            +
          </button>
        </div>

        <button
          type="button"
          onClick={() => add(product.id, qty, variantId)}
          className="mt-6 rounded-full bg-[color:var(--color-cocoa)] px-6 py-3 font-semibold text-white"
        >
          Agregar al carrito
        </button>
      </div>
    </div>
  );
}
