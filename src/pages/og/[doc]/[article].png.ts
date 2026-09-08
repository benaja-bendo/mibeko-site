import type { APIRoute } from 'astro';
import { fetchPublicDocument } from '../../../lib/api';
import { articleLeafLabel, documentLineLabel } from '../../../lib/sanitize';
import { documentTypeLabel, isUnclassifiedType } from '../../../lib/legalMetadata';
import { renderOgImage, ogSourceFromScope } from '../../../lib/ogImage';

export const prerender = false;

const ARTICLE_PREFIX = 'article-';

/** Image de partage d'un article (mibeko-site#27) : même logique de titre que la page. */
export const GET: APIRoute = async ({ params }) => {
  const { doc, article } = params;

  if (!doc || !article || !article.startsWith(ARTICLE_PREFIX)) {
    return new Response(null, { status: 404 });
  }

  const numero = decodeURIComponent(article.slice(ARTICLE_PREFIX.length));
  const payload = await fetchPublicDocument(doc, numero);
  const document = payload?.document;
  const current = payload?.current_article;

  if (!document || !current) {
    return new Response(null, { status: 404 });
  }

  const intituleParent = documentLineLabel(document.titre_officiel, document.libelle_descriptif);
  const title = `${articleLeafLabel(current.number)} — ${intituleParent}`;
  const kicker = isUnclassifiedType(document.type_code) ? '' : documentTypeLabel(document);

  const png = await renderOgImage({
    kicker,
    title,
    source: ogSourceFromScope(document.legal_scope),
  });

  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
