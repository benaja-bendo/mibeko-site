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
  // Traefik termine le TLS : la connexion proxy → conteneur Astro est en HTTP
  // clair, donc le `checkOrigin` natif reconstruit `http://mibeko.fr` et rejette
  // le `Origin: https://mibeko.fr` du navigateur (faux positif → 403). On le
  // désactive et on refait un contrôle d'origine correct dans les routes POST
  // (cf. src/pages/api/contact.ts), basé sur le header Origin/Referer.
  security: {
    checkOrigin: false
  },
  vite: {
    plugins: [tailwindcss()]
  }
});
