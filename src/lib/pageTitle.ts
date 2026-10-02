import { casseDePhrase } from './sanitize.ts';

/**
 * Titres et descriptions des pages de texte (`<title>`, `og:title`,
 * `meta description`), mibeko-site#92.
 *
 * Google coupe un titre vers 60 caractères. L'intitulé officiel entier peut en
 * compter près de 300 : on n'en garde que de quoi reconnaître le texte (type,
 * numéro, date), et on renvoie l'objet dans la description. L'intitulé complet
 * reste dans le H1 et dans le JSON-LD, qui font foi. Aucun tiret cadratin
 * (D-057) : ni dans ces balises, ni comme séparateur.
 */

export const MARQUE = 'Mibeko';
export const SUFFIXE_MARQUE = ` | ${MARQUE}`;
/** Longueur visée pour un titre, marque comprise. */
export const TITRE_MAX = 65;
/** Longueur au-delà de laquelle Google coupe une description. */
export const DESCRIPTION_MAX = 160;

// Premier mot de l'objet d'un acte (« … du 15 septembre 2023 portant … ») : tout
// ce qui précède est la référence, qui suffit à identifier le texte.
const DEBUT_OBJET =
  /\s+(?:portant|relatifs?|relatives?|fixant|modifiant|complétant|instituant|créant|autorisant|approuvant|abrogeant|déterminant|organisant|établissant|ratifiant|promulguant|attribuant|nommant|concernant|rectifiant|définissant|réglementant)\b/i;

function nettoyer(texte: string): string {
  return texte.replace(/\s+/g, ' ').trim().replace(/[\s.,;:]+$/, '');
}

/** Coupe au dernier mot entier qui tient dans `max`, et le dit par « … ». */
function coupeAuMot(texte: string, max: number): string {
  if (texte.length <= max) return texte;
  const limite = Math.max(max - 1, 1);
  const coupe = texte.slice(0, limite);
  const espace = coupe.lastIndexOf(' ');
  const base = espace > limite / 2 ? coupe.slice(0, espace) : coupe;
  return `${base.replace(/[\s.,;:(]+$/, '')}…`;
}

/**
 * Référence d'un texte en `max` caractères au plus : l'intitulé tel quel s'il
 * tient, sinon la partie qui précède son objet, sinon une coupe au mot.
 */
export function intituleCourt(titreOfficiel: string, max: number): string {
  const titre = nettoyer(titreOfficiel);
  if (titre.length <= max) return titre;

  const objet = DEBUT_OBJET.exec(titre);
  if (objet && objet.index >= 8) {
    const tete = titre.slice(0, objet.index).replace(/[\s,;:]+$/, '');
    return coupeAuMot(tete, max);
  }
  return coupeAuMot(titre, max);
}

export function avecMarque(titre: string): string {
  return `${titre}${SUFFIXE_MARQUE}`;
}

/** « Article 7 : Arrêté n° 11428 du 15 septembre 2023 » (sans la marque). */
export function titreArticle(libelleArticle: string, titreOfficiel: string): string {
  const prefixe = `${libelleArticle} : `;
  const budget = Math.max(TITRE_MAX - prefixe.length - SUFFIXE_MARQUE.length, 20);
  return `${prefixe}${casseDePhrase(intituleCourt(titreOfficiel, budget))}`;
}

/**
 * Titre d'une page de texte (sans la marque). Le libellé descriptif (D-039)
 * vient À CÔTÉ de la référence, quand il reste de la place, jamais à sa place.
 */
export function titreTexte(titreOfficiel: string, libelleDescriptif?: string | null): string {
  const budget = TITRE_MAX - SUFFIXE_MARQUE.length;
  const tete = casseDePhrase(intituleCourt(titreOfficiel, budget));
  const libelle = nettoyer(libelleDescriptif ?? '');
  const reste = budget - tete.length - 3;

  if (libelle && reste >= 15 && !tete.endsWith('…')) {
    return `${tete} : ${coupeAuMot(libelle, reste)}`;
  }
  return tete;
}

/**
 * Description d'une page de texte : l'intitulé complet (avec l'objet dérivé,
 * quand il existe) d'abord, puis ce qu'on y trouve.
 */
export function descriptionTexte(options: {
  titreOfficiel: string;
  libelleDescriptif?: string | null;
  typeName: string;
  nbArticles: number;
}): string {
  const { titreOfficiel, libelleDescriptif, typeName, nbArticles } = options;
  const compte = nbArticles > 1 ? `${nbArticles} articles, ` : nbArticles === 1 ? '1 article, ' : '';
  const fin = `${typeName} de la République du Congo, ${compte}à lire librement sur ${MARQUE}.`;

  const libelle = nettoyer(libelleDescriptif ?? '');
  const intitule = casseDePhrase([nettoyer(titreOfficiel), libelle].filter(Boolean).join(' : '));
  const tete = coupeAuMot(intitule, DESCRIPTION_MAX - fin.length - 2);

  return tete.endsWith('…') ? `${tete} ${fin}` : `${tete}. ${fin}`;
}

/** Description de repli d'un article sans texte exploitable. */
export function descriptionArticleVide(libelleArticle: string, titreOfficiel: string): string {
  const tete = casseDePhrase(intituleCourt(titreOfficiel, 100));
  return `${libelleArticle} : ${tete}. République du Congo.`;
}
