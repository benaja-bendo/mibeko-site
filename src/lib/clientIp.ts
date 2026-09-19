import { BlockList, isIP } from 'node:net';

/**
 * IP du visiteur derrière la chaîne de proxys (mibeko-dashboard#159, vps_infra#1).
 *
 * Chaîne aujourd'hui : visiteur → Traefik → site. Traefik, en mode par
 * défaut, supprime tout `X-Forwarded-For` entrant d'une source non fiable et
 * y pose l'adresse du pair TCP : la DERNIÈRE valeur de l'en-tête est donc
 * toujours celle que Traefik a vue (unique en mode par défaut ; l'IP réelle en
 * dernier s'il complétait l'en-tête au lieu de le remplacer). La première
 * valeur, elle, serait forgeable dans ce second cas.
 *
 * Chaîne avec un CDN devant mibeko.fr : visiteur → CDN → Traefik → site. Le
 * pair de Traefik est alors un relais du CDN, et l'IP du visiteur voyage dans
 * `CF-Connecting-IP`. On ne croit cet en-tête QUE si le pair est bien une
 * adresse du CDN : un client qui frappe l'origine directement peut écrire
 * n'importe quoi dedans, il ne peut pas usurper l'adresse d'un relais. Tant
 * qu'aucun CDN n'est en place, aucun pair ne vient de ces plages et cette
 * branche est inerte.
 */

/** Plages publiées par Cloudflare (https://www.cloudflare.com/ips), relevées le 19/09/2026. */
export const CLOUDFLARE_IP_RANGES = [
  '173.245.48.0/20',
  '103.21.244.0/22',
  '103.22.200.0/22',
  '103.31.4.0/22',
  '141.101.64.0/18',
  '108.162.192.0/18',
  '190.93.240.0/20',
  '188.114.96.0/20',
  '197.234.240.0/22',
  '198.41.128.0/17',
  '162.158.0.0/15',
  '104.16.0.0/13',
  '104.24.0.0/14',
  '172.64.0.0/13',
  '131.0.72.0/22',
  '2400:cb00::/32',
  '2606:4700::/32',
  '2803:f800::/32',
  '2405:b500::/32',
  '2405:8100::/32',
  '2a06:98c0::/29',
  '2c0f:f248::/32',
];

/** Liste d'adresses reconnues comme relais du CDN, construite depuis des CIDR. */
export function cdnAddressList(ranges: readonly string[]): BlockList {
  const list = new BlockList();
  for (const range of ranges) {
    const [address, prefix] = range.split('/');
    const family = isIP(address);
    if (family === 0) continue;
    list.addSubnet(address, Number(prefix), family === 4 ? 'ipv4' : 'ipv6');
  }
  return list;
}

/** Plages surchargeables par `MIBEKO_CDN_IP_RANGES` (CIDR séparés par des virgules). */
function rangesFromEnvironment(): readonly string[] {
  const env = (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }).process?.env
    ?.MIBEKO_CDN_IP_RANGES;
  if (!env) return CLOUDFLARE_IP_RANGES;
  return env
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

const DEFAULT_CDN = cdnAddressList(rangesFromEnvironment());

/** Vrai si l'adresse appartient aux plages du CDN. */
export function isCdnAddress(address: string, cdn: BlockList = DEFAULT_CDN): boolean {
  const family = isIP(address);
  if (family === 0) return false;
  return cdn.check(address, family === 4 ? 'ipv4' : 'ipv6');
}

/** Dernière valeur valide de `X-Forwarded-For`, ou `undefined`. */
export function lastForwardedFor(header: string | null | undefined): string | undefined {
  const last = header
    ?.split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .at(-1);
  return last && isIP(last) !== 0 ? last : undefined;
}

export interface VisitorHeaders {
  forwardedFor: string | null | undefined;
  cdnConnectingIp: string | null | undefined;
}

/**
 * IP du visiteur : le pair vu par Traefik (dernière valeur de
 * `X-Forwarded-For`, sinon la socket) — sauf si ce pair est un relais du CDN,
 * auquel cas l'IP réelle est celle que le CDN transmet.
 */
export function visitorAddress(
  headers: VisitorHeaders,
  socketAddress: () => string | undefined,
  cdn: BlockList = DEFAULT_CDN,
): string | undefined {
  const peer = lastForwardedFor(headers.forwardedFor) ?? socketAddress();

  if (peer && isCdnAddress(peer, cdn)) {
    const behindCdn = headers.cdnConnectingIp?.trim();
    if (behindCdn && isIP(behindCdn) !== 0) {
      return behindCdn;
    }
  }

  return peer;
}
