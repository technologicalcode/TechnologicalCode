import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { soles } from '../lib/money';
import { CartItem } from './CartItem';

export function CartDrawer() {
  const { open, setOpen, lines, total } = useCart();

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Cerrar carrito"
        onClick={() => setOpen(false)}
      />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-[color:var(--color-paper)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
          <h2 className="text-lg font-semibold">Tu pedido</h2>
          <button type="button" onClick={() => setOpen(false)} className="text-sm">
            Cerrar
          </button>
        </div>
        <ul className="flex-1 overflow-auto px-5">
          {lines.length === 0 && (
            <li className="py-10 text-center text-[color:var(--color-muted)]">El carrito está vacío.</li>
          )}
          {lines.map((line) => (
            <CartItem key={`${line.productId}-${line.variantId ?? 'base'}`} line={line} />
          ))}
        </ul>
        <div className="border-t border-black/5 p-5">
          <p className="mb-3 flex justify-between text-sm">
            <span>Subtotal</span>
            <strong>{soles(total)}</strong>
          </p>
          <Link
            to="/checkout"
            onClick={() => setOpen(false)}
            className={`block rounded-full py-3 text-center text-sm font-semibold text-white ${
              lines.length ? 'bg-[color:var(--color-cocoa)]' : 'pointer-events-none bg-black/20'
            }`}
          >
            Ir al checkout
          </Link>
        </div>
      </aside>
    </div>
  );
}
