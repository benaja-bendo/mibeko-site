import type { DocumentMeta } from './api';

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

export interface LegalStatusPresentation {
  label: string;
  verified: boolean;
}

export function legalStatusPresentation(document?: DocumentMeta | null): LegalStatusPresentation {
  if (!document?.statut) {
    return { label: 'Statut juridique non renseigné', verified: false };
  }

  const verified = document.statut_verifie === true;
  if (!verified) {
    return { label: 'Statut juridique non vérifié', verified: false };
  }

  return {
    label: STATUS_LABELS[document.statut] ?? document.statut,
    verified: true,
  };
}

export function formatFrenchDate(iso?: string | null): string | null {
  if (!iso) return null;

  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso));
}
