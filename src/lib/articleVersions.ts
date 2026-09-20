/**
 * Logique pure du sélecteur de version par date (mibeko-dashboard#157/#167,
 * volet site — mibeko-site#60). Séparée des composants `.astro` pour rester
 * testable par `node --test` (`npm test`).
 */
import type { ArticleVersionRef } from './api';
// Extension explicite : résolution ESM stricte sous `node --test`
// (`--experimental-strip-types`), contrairement au bundler Vite d'Astro qui
// tolère l'omission.
import { formatFrenchDate } from './legalMetadata.ts';

/** Valide un `?au=` avant tout envoi à l'API — un format libre y renverrait 422. */
export function isValidDateParam(value: string | null | undefined): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/**
 * Version dont la période couvre `au`, ou `null` si `au` précède la toute
 * première version connue de l'article (seul cas possible : les périodes
 * d'un même article ne laissent jamais de trou une fois ouvertes).
 */
export function findVersionAt(versions: ArticleVersionRef[], au: string): ArticleVersionRef | null {
  return versions.find((v) => v.start <= au && (!v.end || au < v.end)) ?? null;
}

/**
 * Libellé du sélecteur pour une version, à sa position dans la liste
 * chronologique (`index === 0` = la plus ancienne).
 *
 * Par construction de l'API (`addVersion()`, dashboard#166), seule la toute
 * première version d'un article peut avoir `modifie_par` nul — toute version
 * suivante DOIT désigner le texte qui l'a fait naître. La première version
 * n'affiche donc jamais sa propre date de début comme une date de droit
 * (c'est la date d'ingestion, pas un fait juridique) : seulement sa date de
 * fin, elle choisie explicitement par l'éditeur au moment d'enregistrer
 * l'amendement suivant.
 */
export function versionSelectorLabel(version: ArticleVersionRef, index: number): string {
  const debut = formatFrenchDate(version.start);
  const fin = version.end ? formatFrenchDate(version.end) : null;

  if (index === 0 && !version.modifie_par) {
    return fin ? `Avant le ${fin}` : 'Texte actuel';
  }

  const periode = version.is_current ? `Depuis le ${debut}` : `Du ${debut} au ${fin}`;
  return version.modifie_par ? `${periode} — modifié par ${version.modifie_par}` : periode;
}
