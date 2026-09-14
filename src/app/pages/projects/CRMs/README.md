# Altura · Mini-CRM (demo)

Producto de muestra para el servicio de **Implementación de Flujos / CRM** de TechnologicalCode.

Cliente ficticio: **Altura**, inmobiliaria en Lima. El demo cubre el flujo base (login, dashboard, pipeline Kanban, lista, detalle y alta de leads). Un CRM real se cotiza a medida.

No hay base de datos. Usuarios, etapas, 15 leads e interacciones viven **hardcodeados en memoria**. En un proyecto real se migran a PostgreSQL (el modelo está comentado en `backend/src/data.js`).

El demo embebido en el sitio (`/projects/crm/`) corre solo el **frontend**. El backend es opcional, para probar la API en local.

## Credenciales

- Email: `admin@demo.com`
- Contraseña: `demo1234`

También existe `diego@demo.com` / `demo1234` (rol vendedor).

## Frontend

```bash
cd frontend
npm install --prefix .
npm run dev
```

Abre `http://localhost:5173`. Login → dashboard → pipeline (arrastra tarjetas) → clientes.

Para publicarlo dentro de TechnologicalCode:

```bash
npm run build
```

Sale en `public/projects/crm/` (HashRouter: `#/pipeline`, `#/clientes`, etc.).

## Backend (opcional)

```bash
cd backend
npm install --prefix .
npm start
```

API en `http://localhost:4178`.

Rutas útiles:

- `POST /api/auth/login` `{ email, password }` → JWT
- `GET /api/leads` (Bearer token)
- `PATCH /api/leads/:id` `{ stageId }` — cambio de etapa del Kanban
- `POST /api/leads/:id/interactions`

## Cómo correr ambos

En dos terminales: primero backend, luego frontend. El frontend del sitio no llama al API; usa el mismo seed en React para que el demo sea autocontenido.
