/**
 * Événements Umami du portail public.
 *
 * Ils mesurent une intention, jamais son contenu : aucun titre de document,
 * terme de recherche, nom ou e-mail ne doit être ajouté aux attributs.
 */
export const UMAMI_EVENTS = {
  comprendreFonds: 'comprendre_fonds',
  comprendreSource: 'comprendre_source',
  agirDemarche: 'agir_demarche',
  agirPilote: 'agir_pilote',
  travaillerOffre: 'travailler_offre',
  travaillerDemo: 'travailler_demo',
  compteCreer: 'compte_creer',
  // Clic vers l'Assistant depuis une page de texte lue (article ou document) :
  // le point d'intention maximale du site, jusqu'ici sans mesure (mibeko-site#24).
  travaillerAssistantTexte: 'travailler_assistant_texte',
} as const;
