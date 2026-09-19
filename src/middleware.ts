import { isIP } from 'node:net';
import { defineMiddleware } from 'astro:middleware';
import { requestContext } from './lib/requestContext';

/**
 * IP du visiteur derrière Traefik (mibeko-dashboard#159).
 *
 * `Astro.clientAddress` ne lit `X-Forwarded-For` que si `security.allowedDomains`
 * est configuré (validation d'hôte, aux effets plus larges) ; sinon c'est
 * l'adresse de la socket — celle de Traefik, une IP unique pour tous les
 * visiteurs, ce qui reproduirait le défaut à corriger. On lit donc l'en-tête
 * ici, en prenant la DERNIÈRE valeur : c'est celle que pose Traefik, qu'il
 * supprime l'en-tête entrant d'une source non fiable (mode par défaut, une
 * seule valeur) ou qu'il le complète (mode « insecure », l'IP réelle en
 * dernier). La première valeur, elle, serait forgeable dans le second cas. Un
 * CDN devant mibeko.fr (vps_infra#1) ajoutera un saut : à revoir avec lui.
 * Sans en-tête (sonde `/_sante`, appel direct), l'adresse de la socket.
 */
function visitorAddress(request: Request, socketAddress: () => string | undefined): string | undefined {
  const forwarded = request.headers.get('x-forwarded-for');
  const last = forwarded
    ?.split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .at(-1);

  if (last && isIP(last) !== 0) {
    return last;
  }

  return socketAddress();
}

/**
 * Ouvre le contexte de requête (`src/lib/requestContext.ts`) autour du rendu :
 * tout `apiFetch()` déclenché par la page — frontmatter, composants, routes
 * `api/*` — y retrouve l'IP du visiteur à relayer à l'API. L'accès à
 * `clientAddress` lève sur une page pré-rendue au build (pas de requête) :
 * on n'y relaie rien.
 */
export const onRequest = defineMiddleware((context, next) => {
  const clientAddress = visitorAddress(context.request, () => {
    try {
      return context.clientAddress;
    } catch {
      return undefined;
    }
  });

  return requestContext.run({ clientAddress }, () => next());
});
