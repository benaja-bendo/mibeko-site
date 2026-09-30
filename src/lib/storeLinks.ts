/**
 * Liens vers les stores, marqués pour que chaque installation dise d'où elle
 * vient (mibeko-site#72).
 *
 * Sans marqueur, Firebase range toutes les installations en « (direct) » ou
 * « google-play / organic » (mesuré le 30/09/2026) : impossible de savoir ce
 * que rapportent le site ou une publication Facebook. Un mécanisme par store :
 * - Android : le paramètre `referrer` du Play Store transporte des UTM jusqu'à
 *   l'app installée. Firebase (source de la première ouverture) et la Play
 *   Console (acquisition par campagne) les lisent.
 * - iOS : un lien de campagne (`pt` + `ct`), lu par App Store Connect
 *   seulement. Apple ne transmet rien à l'app, donc rien à Firebase.
 *
 * Aucune donnée personnelle : source, support et campagne décrivent le lien,
 * jamais le visiteur.
 */

export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=cg.mibeko.app';
// ID App Store vérifié via https://itunes.apple.com/lookup?bundleId=cg.mibeko.app
export const APP_STORE_URL = 'https://apps.apple.com/app/id6768865781';

/**
 * Jeton fournisseur App Store Connect (Analytics → Acquisition → Campagnes →
 * « Générer un lien de campagne », valeur de `pt`). Il n'a rien de secret : il
 * figure en clair dans tout lien de campagne. Tant qu'il est vide, le lien iOS
 * part sans marqueur, car Apple n'attribue pas un `ct` sans `pt`.
 */
export const APP_STORE_PROVIDER_TOKEN = '';

export interface StoreOrigin {
  /** D'où vient le visiteur : `mibeko.fr`, `facebook`, `linkedin`… */
  source: string;
  /** Type de canal : `site`, `social`… */
  medium: string;
  /** Emplacement ou campagne : `page-application`, `2026-10`… */
  campaign: string;
  /** Variante facultative, par exemple l'auteur d'une publication. */
  content?: string;
}

/** Origines par défaut des liens du site, une par emplacement. */
export const SITE_PLACEMENTS = {
  pageApplication: { source: 'mibeko.fr', medium: 'site', campaign: 'page-application' },
  pageAssistant: { source: 'mibeko.fr', medium: 'site', campaign: 'page-assistant' },
  bandeauOuvrirApp: { source: 'mibeko.fr', medium: 'site', campaign: 'bandeau-ouvrir-app' },
} as const satisfies Record<string, StoreOrigin>;

/** Lien Play Store dont l'installation portera `origin` dans Firebase et la Play Console. */
export function playStoreUrl(origin: StoreOrigin): string {
  const utm = new URLSearchParams({
    utm_source: origin.source,
    utm_medium: origin.medium,
    utm_campaign: origin.campaign,
  });
  if (origin.content) utm.set('utm_content', origin.content);
  return `${PLAY_STORE_URL}&referrer=${encodeURIComponent(utm.toString())}`;
}

/** Jeton de campagne App Store (`ct`), borné aux 40 caractères qu'Apple accepte. */
export function appStoreCampaignToken(origin: StoreOrigin): string {
  return `${origin.source}-${origin.content || origin.campaign}`.slice(0, 40);
}

/** Lien App Store marqué, ou nu tant que le jeton fournisseur manque. */
export function appStoreUrl(origin: StoreOrigin, providerToken: string = APP_STORE_PROVIDER_TOKEN): string {
  if (!providerToken) return APP_STORE_URL;
  const params = new URLSearchParams({ pt: providerToken, ct: appStoreCampaignToken(origin), mt: '8' });
  return `${APP_STORE_URL}?${params.toString()}`;
}

/**
 * Origine portée par l'adresse de la page, sinon `fallback`.
 *
 * Un visiteur arrivé d'une publication avec `?utm_source=facebook` doit rester
 * « facebook » jusqu'au store, et non devenir « mibeko.fr ». Seule l'adresse
 * d'arrivée compte : rien n'est conservé d'une page à l'autre.
 */
export function originFromSearch(search: string, fallback: StoreOrigin): StoreOrigin {
  const params = new URLSearchParams(search);
  const source = marker(params.get('utm_source'));
  if (!source) return fallback;
  const content = marker(params.get('utm_content'));
  return {
    source,
    medium: marker(params.get('utm_medium')) || 'lien',
    campaign: marker(params.get('utm_campaign')) || fallback.campaign,
    ...(content ? { content } : {}),
  };
}

/** Réduit une valeur venue de l'URL à un marqueur court et inoffensif. */
function marker(value: string | null): string {
  return (value ?? '').toLowerCase().replace(/[^a-z0-9._-]/g, '').slice(0, 40);
}
