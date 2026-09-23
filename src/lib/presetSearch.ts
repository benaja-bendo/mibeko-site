/**
 * Recherches que le site lance lui-même (mibeko-dashboard#177).
 *
 * Les étapes des démarches et le bouton « Rechercher » des situations mènent
 * à `/textes?q=…` avec une requête écrite par nous. Chaque passage d'un robot
 * sur ces liens s'écrivait dans le journal de recherche de l'API comme une
 * demande d'usager : mesuré en production le 23/09/2026, 80 % des lignes, et
 * les dix « requêtes fréquentes » de l'écran admin étaient exactement ces
 * liens.
 *
 * Le paramètre `origine` suit la navigation (`urlWith` de `/textes` le
 * conserve sur la pagination et le changement de vue) ; le formulaire ne le
 * reporte pas, donc une requête retouchée par l'usager redevient une
 * recherche comptée.
 */
export const PRESET_SEARCH_PARAM = 'origine';
export const PRESET_SEARCH_ORIGIN = 'lien';

/** En-tête lu par `SearchQueryLogger` côté API : la recherche est exécutée, pas journalisée. */
export const SEARCH_ORIGIN_HEADER = 'X-Mibeko-Search-Origin';

/** Chemin de recherche dans le fonds pour une requête pré-rédigée par le site. */
export function presetSearchPath(query: string): string {
  const params = new URLSearchParams({ q: query, [PRESET_SEARCH_PARAM]: PRESET_SEARCH_ORIGIN });
  return `/textes?${params}`;
}

/** Vrai si la page a été atteinte par un lien de {@link presetSearchPath}. */
export function isPresetSearch(params: URLSearchParams): boolean {
  return params.get(PRESET_SEARCH_PARAM) === PRESET_SEARCH_ORIGIN;
}
