import type { APIRoute } from 'astro';
import { fetchLibrarySearch, articlePath } from '../../lib/api';
import { articleLeafLabel } from '../../lib/sanitize';

export const prerender = false;

/**
 * Suggestions de recherche en direct (complément progressif du formulaire
 * GET natif — celui-ci reste l'unique dépendance fonctionnelle, cf. § 9 de
 * la charte : « le site fonctionne sans JavaScript »).
 *
 * Best-effort à dessein, comme `fetchDocumentTypes` : une panne ici masque
 * juste la liste déroulante, jamais la recherche elle-même.
 */

const SUGGEST_LIMIT = 6;

export const GET: APIRoute = async ({ url }) => {
  const q = (url.searchParams.get('q') ?? '').trim();
  const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };

  if (q.length < 2) {
    return new Response(JSON.stringify({ results: [] }), { headers });
  }

  try {
    const results = await fetchLibrarySearch(q, SUGGEST_LIMIT);
    const payload = results
      .filter((r): r is typeof r & { document_slug: string } => Boolean(r.document_slug))
      .map((r) => ({
        label: articleLeafLabel(r.number),
        title: r.document_title,
        breadcrumb: r.breadcrumb,
        href: articlePath(r.document_slug, r.number),
      }));
    return new Response(JSON.stringify({ results: payload }), { headers });
  } catch {
    return new Response(JSON.stringify({ results: [] }), { headers });
  }
};
