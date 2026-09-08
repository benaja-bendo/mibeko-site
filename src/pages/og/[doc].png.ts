import type { APIRoute } from 'astro';
import { fetchPublicDocument } from '../../lib/api';
import { documentLineLabel } from '../../lib/sanitize';
import { documentTypeLabel, isUnclassifiedType } from '../../lib/legalMetadata';
import { renderOgImage, ogSourceFromScope } from '../../lib/ogImage';

export const prerender = false;

/** Image de partage d'un document (mibeko-site#27) : même logique de titre que la page. */
export const GET: APIRoute = async ({ params }) => {
  const { doc } = params;
  if (!doc) return new Response(null, { status: 404 });

  const payload = await fetchPublicDocument(doc);
  const document = payload?.document;
  if (!document) return new Response(null, { status: 404 });

  const png = await renderOgImage({
    kicker: isUnclassifiedType(document.type_code) ? '' : documentTypeLabel(document),
    title: documentLineLabel(document.titre_officiel, document.libelle_descriptif),
    source: ogSourceFromScope(document.legal_scope),
  });

  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
