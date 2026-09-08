/**
 * Liens sortants vers la surface authentifiée `app.mibeko.fr`.
 *
 * Le site ne porte aucun compte (règle absolue du dépôt) : ce sont des liens,
 * jamais un formulaire d'authentification ni un état utilisateur. Ce module
 * existe pour une seule raison — transporter l'INTENTION du visiteur jusqu'à
 * l'inscription. Quelqu'un qui vient de lire l'article 123 de l'AUDCG et clique
 * « poser une question » ne veut pas atterrir sur un catalogue.
 *
 * Le paramètre est **lu par personne aujourd'hui** : `mibeko-front#30` doit
 * encore le faire retenir par `/auth/register` et l'appliquer après création du
 * compte. Un paramètre inconnu est ignoré sans dommage, et le jour où ce ticket
 * est livré, tous les appels du site le portent déjà.
 */

const APP_ORIGIN = 'https://app.mibeko.fr';

/** Ce que le visiteur venait faire, conservé à travers l'inscription. */
export type Intention = 'assistant';

/** Page de création de compte, éventuellement porteuse d'une intention. */
export function registerUrl(intention?: Intention): string {
  return intention
    ? `${APP_ORIGIN}/auth/register?next=${intention}`
    : `${APP_ORIGIN}/auth/register`;
}

/** Page de connexion. */
export function loginUrl(): string {
  return `${APP_ORIGIN}/auth/login`;
}
