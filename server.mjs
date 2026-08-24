import compression from 'compression';
import express from 'express';
import { handler as astroHandler } from './dist/server/entry.mjs';

const app = express();
const host = process.env.HOST ?? '0.0.0.0';
const port = Number(process.env.PORT ?? 4321);

// Compresse les réponses textuelles suffisamment grandes. Le middleware gère
// Accept-Encoding, Vary, HEAD et les réponses qui portent déjà un encodage.
app.use(compression({ threshold: 1024 }));

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
  express.static('dist/client', {
    maxAge: '1h',
    fallthrough: true,
  }),
);

app.use(astroHandler);

app.listen(port, host, () => {
  console.log(`Mibeko écoute sur http://${host}:${port}`);
});
