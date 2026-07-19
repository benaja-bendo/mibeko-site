import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { siteOrigin, urlsetResponse } from '../lib/sitemap';

export const prerender = false;

/** Guides éditoriaux (collection markdown locale). */
export const GET: APIRoute = async ({ site }) => {
  const origin = siteOrigin(site);
  const guides = await getCollection('guides', ({ data }) => !data.draft);

  return urlsetResponse(
    guides.map((guide) => ({
      loc: `${origin}/ressources/${guide.id}`,
      lastmod: (guide.data.updatedDate ?? guide.data.publishedDate).toISOString(),
    })),
  );
};
