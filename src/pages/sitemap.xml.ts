import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { fetchSitemap, fetchThemes, documentPath, articlePath, themePath } from '../lib/api';

export const prerender = false;

// Pages stables du site.
const STATIC_PATHS = ['/', '/produits', '/codes', '/demarches', '/ressources', '/themes', '/contact', '/cgu', '/confidentialite', '/mentions-legales'];

const escapeXml = (value: string): string =>
  value.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]!));

interface UrlEntry {
  loc: string;
  lastmod?: string | null;
}

export const GET: APIRoute = async ({ site }) => {
  const origin = (site ?? new URL('https://mibeko.fr')).origin;
  const urls: UrlEntry[] = STATIC_PATHS.map((path) => ({ loc: origin + path }));

  // Guides éditoriaux (collection locale).
  const guides = await getCollection('guides', ({ data }) => !data.draft);
  for (const guide of guides) {
    urls.push({
      loc: `${origin}/ressources/${guide.id}`,
      lastmod: (guide.data.updatedDate ?? guide.data.publishedDate).toISOString(),
    });
  }

  // Démarches (collection locale).
  const demarches = await getCollection('demarches', ({ data }) => !data.draft);
  for (const demarche of demarches) {
    urls.push({
      loc: `${origin}/demarches/${demarche.id}`,
      lastmod: (demarche.data.updatedDate ?? demarche.data.publishedDate).toISOString(),
    });
  }

  // Thèmes de vie (parcours par situation).
  try {
    const themes = await fetchThemes();
    for (const theme of themes) {
      urls.push({ loc: origin + themePath(theme.slug) });
    }
  } catch {
    // Thèmes indisponibles : on n'interrompt pas le reste du sitemap.
  }

  try {
    const documents = await fetchSitemap();
    for (const doc of documents) {
      urls.push({ loc: origin + documentPath(doc.slug), lastmod: doc.updated_at });
      for (const number of doc.articles) {
        urls.push({ loc: origin + articlePath(doc.slug, number), lastmod: doc.updated_at });
      }
    }
  } catch {
    // Le fonds est momentanément indisponible : on sert au moins les pages
    // statiques plutôt qu'une 500 (Google reviendra).
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url><loc>${escapeXml(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`,
  )
  .join('\n')}
</urlset>
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
