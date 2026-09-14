import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { useCart } from '../context/CartContext';

export function Catalog() {
  const { products } = useCart();
  const [params] = useSearchParams();
  const initial = params.get('cat') ?? 'Todas';
  const [cat, setCat] = useState(initial);
  const [q, setQ] = useState('');

  const categories = useMemo(
    () => ['Todas', ...Array.from(new Set(products.map((p) => p.category)))],
    [products],
  );

  const list = products.filter((p) => {
    const okCat = cat === 'Todas' || p.category === cat;
    const okQ = p.name.toLowerCase().includes(q.trim().toLowerCase());
    return okCat && okQ;
  });

  return (
    <div className="mx-auto w-[min(100%-2rem,72rem)] py-10">
      <h1 className="text-4xl font-semibold">Catálogo</h1>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre"
          className="w-full rounded-full border border-black/10 bg-white px-4 py-2.5 sm:max-w-xs"
        />
        <div className="flex flex-wrap gap-2">
          {categories.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setCat(name)}
              className={`rounded-full px-3 py-1.5 text-sm ${
                cat === name ? 'bg-[color:var(--color-ink)] text-white' : 'bg-white ring-1 ring-black/10'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {list.length === 0 && (
        <p className="mt-10 text-center text-[color:var(--color-muted)]">No hay productos con ese filtro.</p>
      )}
    </div>
  );
}
