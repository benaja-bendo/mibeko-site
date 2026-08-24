import type { APIRoute } from 'astro';
import { fetchThemes, themePath } from '../lib/api';
import { siteOrigin, urlsetResponse, type UrlEntry } from '../lib/sitemap';

export const prerender = false;

// Pages stables du site.
const STATIC_PATHS = ['/', '/textes', '/textes/nouveautes', '/guides', '/situations', '/application', '/professionnels', '/methode', '/contact', '/cgu', '/confidentialite', '/mentions-legales'];

/** Pages stables + thèmes de vie (parcours par situation). */
export const GET: APIRoute = async ({ site }) => {
  const origin = siteOrigin(site);
  const urls: UrlEntry[] = STATIC_PATHS.map((path) => ({ loc: origin + path }));

  try {
    const themes = await fetchThemes();
    for (const theme of themes) {
      urls.push({ loc: origin + themePath(theme.slug) });
    }
  } catch {
    // Thèmes indisponibles : on sert au moins les pages statiques.
  }

  return urlsetResponse(urls);
};
