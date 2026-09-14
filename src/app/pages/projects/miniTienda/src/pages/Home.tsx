import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { useCart } from '../context/CartContext';

const CATEGORIES = [
  { name: 'Tortas', img: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=70' },
  { name: 'Galletas', img: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=600&q=70' },
  { name: 'Panes', img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=70' },
  { name: 'Estacional', img: 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?auto=format&fit=crop&w=600&q=70' },
];

export function Home() {
  const { products } = useCart();
  const featured = products.filter((p) => p.featured).slice(0, 6);

  return (
    <div>
      <section className="relative min-h-[72dvh] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=1800&q=70"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/15" />
        <div className="relative mx-auto flex min-h-[72dvh] w-[min(100%-2rem,40rem)] flex-col justify-end pb-14 text-white">
          <p className="text-xs uppercase tracking-[0.18em] text-orange-100">Miraflores · Lima</p>
          <h1 className="mt-2 text-5xl font-semibold leading-tight">Pan de verdad. Pedidos por WhatsApp.</h1>
          <p className="mt-3 max-w-md text-white/80">
            Tortas, galletas y hogazas del día. Armas el carrito y nos llega el pedido al chat.
          </p>
          <Link
            to="/catalogo"
            className="mt-6 inline-flex w-fit rounded-full bg-white px-5 py-3 text-sm font-semibold text-[color:var(--color-ink)]"
          >
            Ver catálogo completo
          </Link>
        </div>
      </section>

      <section className="mx-auto w-[min(100%-2rem,72rem)] py-14">
        <h2 className="mb-6 text-3xl font-semibold">Categorías</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              to={`/catalogo?cat=${encodeURIComponent(cat.name)}`}
              className="group overflow-hidden rounded-2xl bg-black"
            >
              <img
                src={cat.img}
                alt={cat.name}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover opacity-90 transition group-hover:scale-105"
              />
              <p className="-mt-10 px-3 pb-3 text-lg font-semibold text-white">{cat.name}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto w-[min(100%-2rem,72rem)] pb-8">
        <h2 className="mb-6 text-3xl font-semibold">Destacados</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
