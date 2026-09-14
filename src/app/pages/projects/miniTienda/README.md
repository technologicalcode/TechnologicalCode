# Mini-Tienda — Miga

Demo del paquete **Mini-Tienda** (S/1.200–S/1.500). Checkout por WhatsApp, sin pasarela de pago.

## Correr en local (React)

```bash
cd src/app/pages/projects/miniTienda
npm install
npm run dev
```

Abre la URL que imprima Vite (por defecto http://localhost:5173/).

## Verla dentro de TechnologicalCode

```bash
npm run build
```

Eso genera los estáticos en `public/projects/mini-tienda/`. Con `npm start` en la raíz del repo:

http://localhost:4200/projects/mini-tienda/

Usa HashRouter (`#/catalogo`) para que Angular no se coma las rutas.

## Ajustes frecuentes

- Número de WhatsApp: `src/lib/whatsapp.ts` → `WHATSAPP_NUMBER`
- Catálogo: `src/data/products.json`
