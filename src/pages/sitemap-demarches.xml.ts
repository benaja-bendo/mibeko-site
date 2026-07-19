import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { siteOrigin, urlsetResponse } from '../lib/sitemap';

export const prerender = false;

/** Démarches pas à pas (collection markdown locale). */
export const GET: APIRoute = async ({ site }) => {
  const origin = siteOrigin(site);
  const demarches = await getCollection('demarches', ({ data }) => !data.draft);

  return urlsetResponse(
    demarches.map((demarche) => ({
      loc: `${origin}/demarches/${demarche.id}`,
      lastmod: (demarche.data.updatedDate ?? demarche.data.publishedDate).toISOString(),
    })),
  );
};
