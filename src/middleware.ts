import { defineMiddleware } from 'astro:middleware';
import { visitorAddress } from './lib/clientIp';
import { cachePolicyFor, etagFor, etagMatches } from './lib/httpCache';
import { requestContext } from './lib/requestContext';

/**
 * Ouvre le contexte de requête (`src/lib/requestContext.ts`) autour du rendu :
 * tout `apiFetch()` déclenché par la page — frontmatter, composants, routes
 * `api/*` — y retrouve l'IP du visiteur à relayer à l'API. L'accès à
 * `clientAddress` lève sur une page pré-rendue au build (pas de requête) :
 * on n'y relaie rien.
 */
export const onRequest = defineMiddleware((context, next) => {
  // Logique et pièges dans `src/lib/clientIp.ts` (testé par `npm test`).
  // L'accès à `clientAddress` lève sur une page pré-rendue au build (pas de
  // requête) : on n'y relaie rien.
  const clientAddress = visitorAddress(
    {
      forwardedFor: context.request.headers.get('x-forwarded-for'),
      cdnConnectingIp: context.request.headers.get('cf-connecting-ip'),
    },
    () => {
      try {
        return context.clientAddress;
      } catch {
        return undefined;
      }
    },
  );

  return requestContext.run({ clientAddress }, () => withHttpCache(context.request, next));
});

/**
 * En-têtes de cache et ETag des pages du fonds (mibeko-site#46, politique
 * dans `src/lib/httpCache.ts`). Seules les réponses 200 aux GET/HEAD sont
 * concernées : une page 404 ou 503 garde ses propres en-têtes (la 503 pose
 * déjà `no-store`). L'ETag se calcule sur le corps rendu — il faut donc le
 * lire en entier avant de répondre, ce qui renonce au flux pour ces pages ;
 * le rendu attend de toute façon l'API avant d'émettre quoi que ce soit
 * d'utile. Sur `If-None-Match` concordant, 304 sans corps : le navigateur
 * garde sa copie, le serveur s'épargne le transfert (710 Ko sur le Code
 * civil), pas le rendu — c'est le CDN qui épargnera le rendu.
 */
async function withHttpCache(request: Request, next: () => Promise<Response>): Promise<Response> {
  const response = await next();

  if ((request.method !== 'GET' && request.method !== 'HEAD') || response.status !== 200) {
    return response;
  }

  const policy = cachePolicyFor(new URL(request.url));
  if (!policy) {
    return response;
  }

  if (!policy.etag) {
    response.headers.set('Cache-Control', policy.cacheControl);
    return response;
  }

  const body = await response.text();
  const etag = etagFor(body);
  const headers = new Headers(response.headers);
  headers.set('Cache-Control', policy.cacheControl);
  headers.set('ETag', etag);

  if (etagMatches(request.headers.get('if-none-match'), etag)) {
    const notModified = new Headers({ 'Cache-Control': policy.cacheControl, ETag: etag });
    const vary = headers.get('Vary');
    if (vary) notModified.set('Vary', vary);
    return new Response(null, { status: 304, headers: notModified });
  }

  return new Response(body, { status: 200, headers });
}
