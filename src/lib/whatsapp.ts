/**
 * Canal WhatsApp professionnel (mibeko-site#90).
 *
 * Pour un avocat au Congo, la sortie la plus courte n'est pas un formulaire,
 * c'est WhatsApp. Le site n'envoie rien lui-même : `wa.me` est un lien
 * sortant, et le message prérempli ne contient aucune donnée du visiteur
 * (règle absolue : pas d'état utilisateur sur mibeko.fr).
 */

/** Numéro au format international, sans « + » ni espaces, comme l'attend `wa.me`. */
const NUMERO = '242066443279';

/** Le même numéro, lisible : indicatif, puis les chiffres groupés à la congolaise. */
export const WHATSAPP_AFFICHE = '+242 06 644 32 79';

export function whatsappUrl(message?: string): string {
  const url = `https://wa.me/${NUMERO}`;
  return message ? `${url}?text=${encodeURIComponent(message)}` : url;
}
