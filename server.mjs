import fs from 'node:fs';
import path from 'node:path';
import compression from 'compression';
import express from 'express';
import { handler as astroHandler } from './dist/server/entry.mjs';

const app = express();
const host = process.env.HOST ?? '0.0.0.0';
const port = Number(process.env.PORT ?? 4321);
const clientDir = path.resolve('dist/client');

// Compresse les réponses textuelles suffisamment grandes. Le middleware gère
// Accept-Encoding, Vary, HEAD et les réponses qui portent déjà un encodage.
app.use(compression({ threshold: 1024 }));

// Le format de build `directory` (défaut, cf. astro.config.mjs) sort
// `page/index.html` : `express.static` redirige alors en 301 toute requête
// `/page` (sans barre oblique) vers `/page/`, alors que tous les liens
// internes et le sitemap utilisent la forme sans barre oblique
// (mibeko-site#33). On réécrit l'URL en interne côté serveur (jamais visible
// du client, donc jamais un aller-retour réseau) plutôt que de changer de
// format de build, qui casse les pages de redirection de `redirects`.
app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();
  if (req.path.endsWith('/') || path.extname(req.path) !== '') return next();
  const indexFile = path.join(clientDir, req.path, 'index.html');
  if (fs.existsSync(indexFile)) req.url = req.path + '/' + req.url.slice(req.path.length);
  next();
});

// Les fichiers Astro sous /_astro portent un hash de contenu : ils peuvent
// donc être conservés un an sans revalidation. Les autres actifs gardent une
// politique courte pour ne pas figer une URL publique non versionnée.
app.use(
  '/_astro',
  express.static('dist/client/_astro', {
    immutable: true,
    maxAge: '1y',
    fallthrough: true,
  }),
);
app.use(
  express.static(clientDir, {
    maxAge: '1h',
    fallthrough: true,
    // Le rewrite ci-dessus gère déjà l'ajout interne de la barre oblique
    // pour les répertoires qui ont un contenu réel. Sans `redirect: false`,
    // `express.static` redirigerait quand même en 301 les préfixes qui n'en
    // ont pas mais existent comme répertoire de rangement de sous-routes
    // (`/ressources`, `/demarches`, propriétaires des pages `[slug]`) avant
    // même d'atteindre la redirection `redirects` réelle vers `/guides`.
    redirect: false,
  }),
);

app.use(astroHandler);

app.listen(port, host, () => {
  console.log(`Mibeko écoute sur http://${host}:${port}`);
});
