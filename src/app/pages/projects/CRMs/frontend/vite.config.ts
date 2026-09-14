import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'node:path';

export default defineConfig(({ command }) => ({
  root: __dirname,
  plugins: [react(), tailwindcss()],
  // En el sitio principal se sirve desde /projects/crm/
  base: command === 'build' ? '/projects/crm/' : '/',
  build: {
    outDir: resolve(__dirname, '../../../../../../public/projects/crm'),
    emptyOutDir: true,
  },
}));
