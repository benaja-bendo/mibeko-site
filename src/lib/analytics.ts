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
} as const;
