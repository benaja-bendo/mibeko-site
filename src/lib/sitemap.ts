/**
 * Aides partagées des sitemaps (index + sous-sitemaps thématiques).
 *
 * Le site sert un index (`/sitemap.xml`) qui référence des sitemaps par
 * pilier : pages stables + thèmes, guides, démarches, et le fonds juridique
 * (documents + articles). Chaque fichier reste généré à la demande (SSR).
 */

export interface UrlEntry {
  loc: string;
  lastmod?: string | null;
}

export const escapeXml = (value: string): string =>
  value.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]!));

/** Origine canonique du site (fallback production si `site` absent). */
export const siteOrigin = (site: URL | undefined): string =>
  (site ?? new URL('https://mibeko.fr')).origin;

/** Sérialise un `<urlset>` et l'enveloppe dans une réponse XML cacheable. */
export function urlsetResponse(urls: UrlEntry[]): Response {
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
  return xmlResponse(body);
}

/** Sérialise un `<sitemapindex>` (liste des sous-sitemaps). */
export function sitemapIndexResponse(locs: string[]): Response {
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${locs.map((loc) => `  <sitemap><loc>${escapeXml(loc)}</loc></sitemap>`).join('\n')}
</sitemapindex>
`;
  return xmlResponse(body);
}

function xmlResponse(body: string): Response {
  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
