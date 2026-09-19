import { AsyncLocalStorage } from 'node:async_hooks';

/**
 * Contexte de la requête HTTP en cours, propagé aux appels API sans le faire
 * transiter par chaque signature (mibeko-dashboard#159).
 *
 * `clientAddress` : l'IP du visiteur telle qu'Astro la voit derrière Traefik.
 * Le client API la relaie en `X-Forwarded-For` pour que les quotas de l'API
 * (recherche, contact, signalements, lecture) restent par visiteur — sans ce
 * relais, tout le site n'est qu'une seule IP pour l'API.
 */
export interface RequestContext {
  clientAddress?: string;
}

export const requestContext = new AsyncLocalStorage<RequestContext>();
