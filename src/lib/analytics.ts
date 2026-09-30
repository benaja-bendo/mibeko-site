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
  // Clic vers WhatsApp (avocats, juristes) : une conversation plutôt qu'un
  // formulaire (mibeko-site#90).
  travaillerWhatsapp: 'travailler_whatsapp',
  compteCreer: 'compte_creer',
  // Clic vers l'Assistant depuis une page de texte lue (article ou document) :
  // le point d'intention maximale du site, jusqu'ici sans mesure (mibeko-site#24).
  travaillerAssistantTexte: 'travailler_assistant_texte',
  // Clic vers Google Play ou l'App Store, avec le store, l'emplacement et la
  // source du lien : le site est-il une porte d'entrée vers l'app ? (mibeko-site#72)
  installerApp: 'installer_app',
  // Bouton « Ouvrir » du bandeau mobile : il ouvre l'app, ou le store si elle
  // est absente, sans qu'on puisse savoir lequel des deux.
  ouvrirApp: 'ouvrir_app',
} as const;
