import type { CartLine, Product } from '../types';
import { linePrice, soles } from './money';

/** Cambia este número (51 + 9 dígitos) cuando el cliente sea real. */
export const WHATSAPP_NUMBER = '51944443322';

export function consultHref(text = 'Hola, quiero consultar por un pedido en Miga'): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

/**
 * Arma el pedido y lo manda a WhatsApp.
 * No hay pasarela: el cliente confirma por chat.
 */
export function orderHref(input: {
  lines: CartLine[];
  products: Product[];
  name: string;
  phone: string;
  fulfillment: 'pickup' | 'delivery';
  address: string;
}): string {
  const rows = input.lines.map((line) => {
    const product = input.products.find((p) => p.id === line.productId);
    if (!product) {
      return '';
    }
    const variant = product.variants?.find((v) => v.id === line.variantId);
    const unit = linePrice(product.price, variant?.price);
    const label = variant ? `${product.name} (${variant.label})` : product.name;
    return `- ${line.qty}x ${label} — ${soles(unit * line.qty)}`;
  });

  const total = input.lines.reduce((sum, line) => {
    const product = input.products.find((p) => p.id === line.productId);
    if (!product) {
      return sum;
    }
    const variant = product.variants?.find((v) => v.id === line.variantId);
    return sum + linePrice(product.price, variant?.price) * line.qty;
  }, 0);

  const fulfillment =
    input.fulfillment === 'pickup'
      ? 'Recojo en tienda (Av. La Mar 850, Miraflores)'
      : `Delivery: ${input.address}`;

  const message = [
    'Hola, quiero este pedido en *Miga*:',
    '',
    ...rows.filter(Boolean),
    '',
    `Total: *${soles(total)}*`,
    `Nombre: ${input.name}`,
    `Teléfono: ${input.phone}`,
    fulfillment,
  ].join('\n');

  return consultHref(message);
}
