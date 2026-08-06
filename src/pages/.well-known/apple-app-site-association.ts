import type { APIRoute } from 'astro';

export const prerender = false;

/**
 * Universal Links iOS — déclaration des chemins que l'app Mibeko prend en
 * charge sur mibeko.fr.
 *
 * Servi par une route et non depuis `public/` pour une seule raison : Apple
 * exige un `Content-Type: application/json`, et le fichier n'ayant pas
 * d'extension, le serveur statique le renvoyait en `application/octet-stream`
 * (vérifié en production le 06/08/2026). Le CDN d'Apple rejette alors la
 * déclaration, et aucun lien mibeko.fr n'ouvre l'app sur iPhone.
 *
 * L'`appID` est `<Team ID>.<bundle id>` : `G2VC572UTM.cg.mibeko.app`.
 * Les chemins doivent rester alignés sur l'App Link Android
 * (`androidApp/src/main/AndroidManifest.xml`, pathPrefix `/textes`) et sur les
 * `navDeepLink` de `composeApp/.../App.kt` — les trois se corrigent ensemble.
 */
const ASSOCIATION = {
  applinks: {
    apps: [],
    details: [
      {
        appID: 'G2VC572UTM.cg.mibeko.app',
        paths: ['/textes/*'],
      },
    ],
  },
};

export const GET: APIRoute = () =>
  new Response(JSON.stringify(ASSOCIATION, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      // Le CDN d'Apple met le fichier en cache : une heure suffit à absorber la
      // charge sans figer une correction de chemin pendant des jours.
      'Cache-Control': 'public, max-age=3600',
    },
  });
