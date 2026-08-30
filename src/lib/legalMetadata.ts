import type { DocumentMeta, SectionPathPart } from './api';

// `TEXTE` (type de repli ingestion — rien n'a été reconnu) est volontairement
// absent des deux tables ci-dessous : il tombe sur le fallback honnête de
// `publicTypeLabel`/`documentChapeauSubject` plutôt que de se faire passer
// pour une classification réelle.
const TYPE_LABELS: Record<string, string> = {
  ACTE_UNIFORME: 'Acte uniforme',
  ARR: 'Arrêté',
  CODE: 'Code',
  CONST: 'Constitution',
  DEC: 'Décret',
  JO: 'Journal officiel',
  LOI: 'Loi',
  ORD: 'Ordonnance',
};

const CHAPEAU_SUBJECTS: Record<string, string> = {
  ACTE_UNIFORME: 'Cet acte uniforme',
  ARR: 'Cet arrêté',
  CODE: 'Ce code',
  CONST: 'Cette constitution',
  DEC: 'Ce décret',
  JO: 'Ce Journal officiel',
  LOI: 'Cette loi',
  ORD: 'Cette ordonnance',
};

const STATUS_LABELS: Record<string, string> = {
  vigueur: 'En vigueur',
  abroge: 'Abrogé',
  abrogé: 'Abrogé',
  suspendu: 'Suspendu',
};

/**
 * `TEXTE` est le type de repli côté ingestion quand rien n'a été reconnu —
 * pas une vraie classification. L'afficher comme « Texte juridique », avec
 * la même confiance visuelle qu'un Décret ou une Loi, ment sur ce que Mibeko
 * sait réellement du document (115 documents publiés dans ce cas au
 * 18/08/2026 — pas un cas isolé). Dans le doute, on le dit.
 */
export function isUnclassifiedType(code?: string | null): boolean {
  return !code || code === 'TEXTE';
}

export function publicTypeLabel(code?: string | null, apiLabel?: string | null): string {
  if (code && TYPE_LABELS[code]) return TYPE_LABELS[code];

  const cleanedLabel = apiLabel?.replace(/\s*\(Générique\)\s*/gi, '').trim();
  if (!cleanedLabel) return 'Non classé';
  // Un intitulé générique venu de l'API (« Texte Juridique ») n'est pas plus
  // fiable qu'un code absent : même traitement.
  return /^texte juridique$/i.test(cleanedLabel) ? 'Non classé' : cleanedLabel;
}

export function documentTypeLabel(document?: DocumentMeta | null): string {
  return publicTypeLabel(
    document?.type_code ?? document?.type?.code,
    document?.type?.name,
  );
}

export function documentChapeauSubject(document?: DocumentMeta | null): string {
  const code = document?.type_code ?? document?.type?.code;
  if (code && CHAPEAU_SUBJECTS[code]) return CHAPEAU_SUBJECTS[code];

  return 'Ce document';
}

export function formatFrenchDate(iso?: string | null): string | null {
  if (!iso) return null;

  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso));
}

/** Teintes de statut de la charte §4. Jamais employées pour autre chose. */
export type LegalStatusTone = 'vigueur' | 'modifie' | 'abroge' | 'inconnu';

export interface LegalStatusPresentation {
  /** Libellé long, hérité des puces existantes. */
  label: string;
  /** Libellé court du bandeau, sous un surtitre « Statut juridique ». */
  headline: string;
  /** Phrase en clair : le statut ne se lit jamais par la couleur seule. */
  sentence: string;
  tone: LegalStatusTone;
  verified: boolean;
}

/**
 * Présentation du statut juridique d'un texte (charte §4).
 *
 * **« Non vérifié » est l'état par défaut, et c'est un choix de doctrine.** La
 * base porte `vigueur` comme valeur par défaut de colonne : afficher « en
 * vigueur » sur cette seule base transformerait un défaut technique en
 * affirmation juridique. Tant qu'une vérification datée n'existe pas, le site
 * écrit qu'il ne sait pas.
 *
 * Aucun état « modifié par <texte> » n'est produit ici : le fonds ne porte
 * aucune donnée de modification sourcée, et on n'en invente pas.
 */
export function legalStatusPresentation(document?: DocumentMeta | null): LegalStatusPresentation {
  const unverified = (label: string): LegalStatusPresentation => ({
    label,
    headline: 'Statut non vérifié',
    sentence:
      'Ce texte n’a pas fait l’objet d’un contrôle d’abrogation par Mibeko. Seule la publication au Journal officiel fait foi.',
    tone: 'inconnu',
    verified: false,
  });

  if (!document?.statut) {
    return unverified('Statut juridique non renseigné');
  }

  if (document.statut_verifie !== true) {
    return unverified('Statut juridique non vérifié');
  }

  const label = STATUS_LABELS[document.statut] ?? document.statut;
  const checkedOn = formatFrenchDate(document.statut_verifie_le);
  const checked = checkedOn ? `Vérifié par Mibeko le ${checkedOn}.` : 'Statut vérifié par Mibeko.';

  const tone: LegalStatusTone =
    document.statut === 'abroge' || document.statut === 'abrogé'
      ? 'abroge'
      : document.statut === 'suspendu'
        ? 'modifie'
        : 'vigueur';

  const sentence =
    tone === 'abroge'
      ? `Ce texte n’est plus applicable. ${checked}`
      : tone === 'modifie'
        ? `L’application de ce texte est suspendue. ${checked}`
        : `Ce texte est applicable en l’état. ${checked}`;

  return { label, headline: label, sentence, tone, verified: true };
}


/**
 * Intitulé d'une division sur une ligne : « Livre 1 · Titre 1 · Chapitre 2 —
 * Capacité d'exercer le commerce ».
 *
 * Le fil des ancêtres porte les types et numéros ; seul le dernier maillon
 * apporte son titre. Sans le fil, « Chapitre 2 » ne dit pas de quel livre il
 * s'agit — un code en compte souvent plusieurs.
 */
export function formatSectionPath(path: SectionPathPart[]): string {
  if (path.length === 0) return '';

  const last = path[path.length - 1];
  const lineage = path
    .map((part) => [part.type, part.number].filter(Boolean).join(' '))
    .filter(Boolean)
    .join(' · ');

  return last.title ? (lineage ? `${lineage} — ${last.title}` : last.title) : lineage;
}
