import { createHash } from 'node:crypto';

/**
 * Politique de cache HTTP des pages rendues à la demande (mibeko-site#46).
 *
 * Sans en-tête, chaque visite, chaque rechargement, chaque passage de
 * Googlebot coûtait un rendu Node complet, ses appels API et leurs requêtes
 * Postgres — pour un texte de loi qui n'a pas changé depuis des années
 * (mesure du 17/09/2026 : Code civil à 2 340 ms sous 10 requêtes simultanées).
 *
 * Deux durées, deux publics :
 *  - `max-age` (navigateur) court : une correction publiée par un éditeur doit
 *    apparaître vite au lecteur ; au-delà, le navigateur revalide par `ETag` et
 *    reçoit un 304 sans corps — c'est le gain qui ne dépend d'aucun CDN.
 *  - `s-maxage` (cache partagé) plus long, avec `stale-while-revalidate` :
 *    servir l'ancienne copie instantanément pendant qu'on rafraîchit. Traefik
 *    OSS n'a pas de cache HTTP : cet en-tête n'agit qu'avec un CDN devant
 *    mibeko.fr (vps_infra#1).
 *
 * Aucune page du fonds ne varie par visiteur : la détection d'appareil de la
 * bannière « ouvrir dans l'app » est côté client, et les identifiants de
 * formulaire sont déterministes. Ce qui varie, ce sont des paramètres d'URL
 * (recherche dans le texte, retour d'un signalement) : ces pages ne vont dans
 * aucun cache.
 */
export interface CachePolicy {
  cacheControl: string;
  /** Faux quand la réponse ne doit pas être mise en cache : pas d'ETag non plus. */
  etag: boolean;
}

/** Paramètres qui rendent la page propre à une action ou à une saisie. */
const PARAMETRES_SANS_CACHE = ['q', 'signalement', 'status'];

/** Texte et article : le corps du fonds, stable pendant des mois. */
const POLITIQUE_TEXTE = 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400';

/** Listes (catalogue, nouveautés, situations) : bougent à chaque publication. */
const POLITIQUE_LISTE = 'public, max-age=60, s-maxage=600, stale-while-revalidate=3600';

const PAGE_TEXTE = /^\/textes\/[^/]+(?:\/article-[^/]+)?$/;
const PAGE_LISTE = /^\/(?:textes|textes\/nouveautes|situations|situations\/[^/]+)$/;

/** Politique applicable à une URL, ou `null` si la page n'est pas concernée. */
export function cachePolicyFor(url: URL): CachePolicy | null {
  const path = url.pathname.replace(/\/+$/, '') || '/';

  if (!PAGE_TEXTE.test(path) && !PAGE_LISTE.test(path)) {
    return null;
  }

  if (PARAMETRES_SANS_CACHE.some((name) => url.searchParams.has(name))) {
    return { cacheControl: 'no-store', etag: false };
  }

  // Les listes d'abord : `/textes/nouveautes` a la forme d'une page de texte.
  return { cacheControl: PAGE_LISTE.test(path) ? POLITIQUE_LISTE : POLITIQUE_TEXTE, etag: true };
}

/**
 * ETag faible dérivé du corps rendu. Faible, parce que le corps servi peut
 * différer par l'encodage (compression Express) sans que la ressource change.
 */
export function etagFor(body: string): string {
  return `W/"${createHash('sha1').update(body).digest('base64url')}"`;
}

/** Comparaison faible d'`If-None-Match` (liste, `*`, préfixe `W/` ignoré). */
export function etagMatches(ifNoneMatch: string | null | undefined, etag: string): boolean {
  if (!ifNoneMatch) {
    return false;
  }

  const normalize = (value: string) => value.trim().replace(/^W\//, '');
  const wanted = normalize(etag);

  return ifNoneMatch
    .split(',')
    .map((value) => value.trim())
    .some((value) => value === '*' || normalize(value) === wanted);
}
