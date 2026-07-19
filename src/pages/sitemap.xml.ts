import type { APIRoute } from 'astro';
import { siteOrigin, sitemapIndexResponse } from '../lib/sitemap';

export const prerender = false;

/**
 * Index de sitemaps (`robots.txt` pointe ici). Le fonds juridique pouvant
 * atteindre des dizaines de milliers d'URL, chaque pilier a son propre
 * sitemap ; l'index reste stable quand le fonds grossit.
 */
export const GET: APIRoute = async ({ site }) => {
  const origin = siteOrigin(site);
  return sitemapIndexResponse([
    `${origin}/sitemap-pages.xml`,
    `${origin}/sitemap-guides.xml`,
    `${origin}/sitemap-demarches.xml`,
    `${origin}/sitemap-textes.xml`,
  ]);
};
