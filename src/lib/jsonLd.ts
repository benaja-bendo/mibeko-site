/**
 * Sérialisation des blocs JSON-LD (mibeko-site#66).
 *
 * `Layout.astro` les écrit par `set:html` dans `<script type="application/ld+json">`,
 * où rien n'est échappé. Or `JSON.stringify` laisse passer `<` et `/` : un
 * titre ou un texte d'article — l'OCR du corpus, modifiable par les éditeurs,
 * entre en entier dans le JSON-LD des pages article — qui contiendrait
 * `</script>` fermerait la balise, et la suite serait lue comme du HTML de la
 * page, donc exécutée chez chaque visiteur.
 *
 * `<`, `>` et `&` sont des échappements JSON valides : un
 * moteur de recherche relit exactement le même objet.
 */
const UNSAFE_IN_SCRIPT: Record<string, string> = {
  '<': '\\u003c',
  '>': '\\u003e',
  '&': '\\u0026',
};

/** JSON prêt à être posé tel quel dans un `<script type="application/ld+json">`. */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/[<>&]/g, (char) => UNSAFE_IN_SCRIPT[char]);
}
