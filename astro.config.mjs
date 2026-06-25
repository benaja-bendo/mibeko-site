// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';

// https://astro.build/config
// Mode statique par défaut (pages vitrine pré-rendues), avec rendu à la
// demande (SSR) activé page par page via `export const prerender = false`
// pour le fonds juridique servi depuis l'API (`/codes/...`).
export default defineConfig({
  site: 'https://mibeko.fr',
  adapter: node({ mode: 'standalone' }),
  vite: {
    plugins: [tailwindcss()]
  }
});
