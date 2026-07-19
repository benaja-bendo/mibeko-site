import type { APIRoute } from 'astro';
import { fetchSitemap, documentPath, articlePath } from '../lib/api';
import { siteOrigin, urlsetResponse, type UrlEntry } from '../lib/sitemap';

export const prerender = false;

/** Le fonds juridique : documents publiés + leurs articles. */
export const GET: APIRoute = async ({ site }) => {
  const origin = siteOrigin(site);
  const urls: UrlEntry[] = [];

  try {
    const documents = await fetchSitemap();
    for (const doc of documents) {
      urls.push({ loc: origin + documentPath(doc.slug), lastmod: doc.updated_at });
      for (const number of doc.articles) {
        urls.push({ loc: origin + articlePath(doc.slug, number), lastmod: doc.updated_at });
      }
    }
  } catch {
    // Le fonds est momentanément indisponible : on sert un sitemap vide plutôt
    // qu'une 500 (Google reviendra).
  }

  return urlsetResponse(urls);
};
