/**
 * Renvois internes (mibeko-site#82) : dans le texte d'un article, « l'article
 * 136 » devient un lien vers l'article 136 du même texte.
 *
 * Tout est prudent, parce qu'un faux lien est pire que pas de lien : il
 * enverrait le lecteur vers un article qui ne dit pas ce que le texte cite.
 *
 * - **Même texte seulement.** Un renvoi suivi de « de la loi… », « du
 *   décret… », « du code… », « dudit… » vise un autre texte : il reste du
 *   texte. « Du présent code », « de la présente loi » visent le texte lu.
 * - **Codes, Constitution, Actes uniformes seulement** (`renvoisPermis`). Dans
 *   une loi modificative, « l'article 2 » désigne le plus souvent l'article
 *   du texte modifié, pas celui de la loi qu'on lit.
 * - **« Article 12 nouveau »** est la nouvelle rédaction d'un autre texte :
 *   jamais de lien.
 * - **La cible doit exister** dans le texte (liste des articles publiés) ; un
 *   article ne renvoie pas vers lui-même.
 *
 * La fonction ne fait que découper : la concaténation des morceaux redonne le
 * texte d'origine, caractère pour caractère. Le rendu reste en nœuds de texte,
 * jamais en HTML (voir `LegalArticleBody.astro`).
 */

export type Morceau =
  | { kind: 'texte'; texte: string }
  | { kind: 'renvoi'; texte: string; numero: string };

/** Numéros publiés d'un texte, indexés par leur forme normalisée. */
export type IndexNumeros = Map<string, string>;

const SUFFIXE = '(?:bis|ter|quater|quinquies|sexies|septies|octies|nonies|decies)';
const NUM = `(?:premier|\\d+(?:\\s?(?:er|ᵉʳ))?(?:-\\d+)*(?:\\s+${SUFFIXE})?)`;
const SEP = '\\s*(?:,|et|à|ou)\\s*';

const RENVOI = new RegExp(`\\b(articles?|art\\.)(\\s+)(${NUM})((?:${SEP}${NUM})*)`, 'giu');
const SUITE = new RegExp(`(${SEP})(${NUM})`, 'giu');

/** Ce qui suit le renvoi désigne un autre texte. */
const EXTERNE = new RegExp(
  '^[\\s,]*' +
    // « , alinéa 2, », « 3° », « paragraphe 1er »… avant la mention du texte
    '(?:(?:alinéas?|al\\.|paragraphes?|§|points?|\\d+°|\\d+e\\b)[^.;:]{0,40}?)?' +
    '\\s*(?:' +
    '(?:de\\s+ladite|dudit|desdits|desdites|de\\s+la\\s+même|du\\s+même|des\\s+mêmes)\\b' +
    "|(?:de\\s+la|de\\s+l['’]|du|des|d['’])\\s*(?!présente?s?\\b)" +
    '(?:loi|décret|ordonnance|code|acte|constitution|traité|convention|arrêté|règlement|directive|accord|charte|statuts?|protocole|décision|circulaire|instruction|annexe)' +
    ')',
  'iu',
);

/** « Article 12 nouveau », « article 5 (ancien) ». */
const REDACTION = /^\s*\(?\s*(?:nouveau|nouvelle|ancien|ancienne)\b/iu;

/** Forme de comparaison d'un numéro : « 1er », « premier » et « 1 » se valent. */
export function cleNumero(numero: string): string {
  const cle = numero.normalize('NFKC').toLowerCase().replace(/\s+/g, '');
  if (cle === 'premier' || cle === '1er') return '1';
  return cle;
}

export function indexNumeros(numeros: readonly string[]): IndexNumeros {
  const index: IndexNumeros = new Map();
  for (const numero of numeros) {
    const cle = cleNumero(numero);
    if (!index.has(cle)) index.set(cle, numero);
  }
  return index;
}

/** Les textes où un renvoi « article N » vise, sauf mention contraire, le texte lui-même. */
export function renvoisPermis(document: { type_code: string | null; document_role?: string | null }): boolean {
  return document.document_role === 'STOCK' || ['CODE', 'CONST', 'AU'].includes(document.type_code ?? '');
}

export function decouperRenvois(texte: string, numeros: IndexNumeros, courant?: string): Morceau[] {
  const morceaux: Morceau[] = [];
  const cleCourante = courant === undefined ? undefined : cleNumero(courant);
  let curseur = 0;

  const ajouterTexte = (fin: number) => {
    if (fin > curseur) morceaux.push({ kind: 'texte', texte: texte.slice(curseur, fin) });
    curseur = fin;
  };
  const cible = (brut: string) => {
    const cle = cleNumero(brut);
    return cle === cleCourante ? undefined : numeros.get(cle);
  };

  for (const m of texte.matchAll(RENVOI)) {
    const debut = m.index ?? 0;
    const fin = debut + m[0].length;
    const apres = texte.slice(fin);
    if (EXTERNE.test(apres) || REDACTION.test(apres)) continue;

    const [, mot, espace, premier, suite] = m;
    const numeroPremier = cible(premier);
    if (numeroPremier) {
      ajouterTexte(debut);
      const longueur = mot.length + espace.length + premier.length;
      morceaux.push({ kind: 'renvoi', texte: texte.slice(debut, debut + longueur), numero: numeroPremier });
      curseur = debut + longueur;
    }

    const debutSuite = debut + mot.length + espace.length + premier.length;
    for (const s of suite.matchAll(SUITE)) {
      const [, separateur, numero] = s;
      const debutNumero = debutSuite + (s.index ?? 0) + separateur.length;
      const numeroCible = cible(numero);
      if (numeroCible) {
        ajouterTexte(debutNumero);
        morceaux.push({ kind: 'renvoi', texte: numero, numero: numeroCible });
        curseur = debutNumero + numero.length;
      }
    }
  }

  ajouterTexte(texte.length);
  return morceaux;
}
