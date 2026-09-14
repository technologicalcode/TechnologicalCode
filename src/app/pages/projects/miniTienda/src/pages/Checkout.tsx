import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { CartItem } from '../components/CartItem';
import { useCart } from '../context/CartContext';
import { soles } from '../lib/money';
import { orderHref } from '../lib/whatsapp';

export function Checkout() {
  const { lines, products, total, clear } = useCart();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [fulfillment, setFulfillment] = useState<'pickup' | 'delivery'>('pickup');
  const [address, setAddress] = useState('');

  if (lines.length === 0) {
    return (
      <div className="mx-auto w-[min(100%-2rem,40rem)] py-20 text-center">
        <p>No hay nada en el carrito.</p>
        <Link to="/catalogo" className="mt-4 inline-block text-[color:var(--color-cocoa)]">
          Ir al catálogo
        </Link>
      </div>
    );
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || (fulfillment === 'delivery' && !address.trim())) {
      return;
    }
    // Abre WhatsApp con el pedido. En un proyecto real aquí iría Culqi/MercadoPago.
    const href = orderHref({
      lines,
      products,
      name: name.trim(),
      phone: phone.trim(),
      fulfillment,
      address: address.trim(),
    });
    window.open(href, '_blank', 'noopener,noreferrer');
    clear();
  }

  return (
    <div className="mx-auto grid w-[min(100%-2rem,72rem)] gap-10 py-10 lg:grid-cols-2">
      <form onSubmit={onSubmit} className="space-y-4">
        <h1 className="text-4xl font-semibold">Checkout</h1>
        <p className="text-[color:var(--color-muted)]">
          Sin pasarela de pago: al confirmar se abre WhatsApp con el detalle del pedido.
        </p>
        <label className="block text-sm font-medium">
          Nombre
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5"
          />
        </label>
        <label className="block text-sm font-medium">
          Teléfono
          <input
            required
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5"
          />
        </label>
        <fieldset className="space-y-2 text-sm">
          <legend className="font-medium">Entrega</legend>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="fulfill"
              checked={fulfillment === 'pickup'}
              onChange={() => setFulfillment('pickup')}
            />
            Recojo en tienda
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="fulfill"
              checked={fulfillment === 'delivery'}
              onChange={() => setFulfillment('delivery')}
            />
            Delivery
          </label>
        </fieldset>
        {fulfillment === 'delivery' && (
          <label className="block text-sm font-medium">
            Dirección
            <input
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5"
            />
          </label>
        )}
        <button
          type="submit"
          className="rounded-full bg-[color:var(--color-cocoa)] px-6 py-3 font-semibold text-white"
        >
          Confirmar por WhatsApp · {soles(total)}
        </button>
      </form>
      <div>
        <h2 className="mb-3 text-lg font-semibold">Resumen</h2>
        <ul className="rounded-2xl bg-[color:var(--color-paper)] px-4">
          {lines.map((line) => (
            <CartItem key={`${line.productId}-${line.variantId ?? 'base'}`} line={line} />
          ))}
        </ul>
        <p className="mt-4 flex justify-between font-semibold">
          <span>Total</span>
          <span>{soles(total)}</span>
        </p>
      </div>
    </div>
  );
}
