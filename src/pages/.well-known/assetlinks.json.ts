import type { APIRoute } from 'astro';

export const prerender = false;

/**
 * App Links Android — déclare que l'app `cg.mibeko.app` peut ouvrir les liens
 * mibeko.fr (pathPrefix `/textes`, `androidApp/src/main/AndroidManifest.xml`,
 * `android:autoVerify="true"`).
 *
 * Servi par une route, comme l'AASA iOS voisin, et non depuis `public/` :
 * `server.mjs` sert `dist/client` avec `express.static`, dont l'option
 * `dotfiles` vaut `ignore` par défaut. Tout chemin sous `/.well-known/` y
 * était ignoré puis rendu en 404 par Astro — le fichier de `public/` n'a
 * jamais atteint Android depuis ce serveur (mibeko-site#70).
 *
 * Empreintes SHA-256 :
 * - la clé de signature **Play** (Play Console → Signature d'application →
 *   « Fichier JSON Digital Asset Links ») : c'est elle qui signe l'app
 *   installée depuis le store, donc la seule qu'Android compare réellement ;
 * - la clé d'importation, pour les builds qu'on signerait soi-même.
 * Le fichier d'origine ne portait que la seconde : même servi, il n'aurait
 * validé aucune installation Play.
 */
const STATEMENTS = [
  {
    relation: ['delegate_permission/common.handle_all_urls'],
    target: {
      namespace: 'android_app',
      package_name: 'cg.mibeko.app',
      sha256_cert_fingerprints: [
        // Clé de signature Play.
        '4E:AB:02:3F:8A:48:95:DA:78:E1:AC:18:F6:1C:99:F4:BD:E1:5A:D7:CB:C8:5E:F7:75:CD:71:75:FF:99:9E:C7',
        // Clé d'importation.
        '4C:11:49:0C:93:10:68:06:DC:00:3C:89:F4:63:74:00:B7:FF:B7:A0:70:5D:C7:B6:F7:29:5D:5A:FE:83:12:A1',
      ],
    },
  },
];

export const GET: APIRoute = () =>
  new Response(JSON.stringify(STATEMENTS, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      // Même politique que l'AASA : une heure absorbe la charge sans figer une
      // correction d'empreinte pendant des jours.
      'Cache-Control': 'public, max-age=3600',
    },
  });
