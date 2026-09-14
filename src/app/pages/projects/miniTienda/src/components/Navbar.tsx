import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export function Navbar() {
  const { count, setOpen } = useCart();

  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-[color:var(--color-paper)]/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-[min(100%-2rem,72rem)] items-center justify-between gap-4">
        <Link to="/" className="text-xl font-semibold tracking-tight">
          Miga
        </Link>
        <nav className="flex items-center gap-5 text-sm text-[color:var(--color-muted)]">
          <Link to="/" className="hover:text-[color:var(--color-ink)]">
            Inicio
          </Link>
          <Link to="/catalogo" className="hover:text-[color:var(--color-ink)]">
            Catálogo
          </Link>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="relative rounded-full border border-black/10 px-3 py-1.5 text-[color:var(--color-ink)]"
          >
            Carrito
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-[color:var(--color-cocoa)] px-1 text-[10px] font-semibold text-white">
                {count}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
