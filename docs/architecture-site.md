# Architecture du site public Mibeko

> Statut : à jour au 2 juillet 2026 · arborescence réelle du site `mibeko-site`, ses trois piliers, la recherche, les thèmes de vie, le lecteur `/textes` et le rendu SSR.

Le site public (`mibeko.fr`) est un portail citoyen et diaspora du droit congolais. Il expose en lecture libre le fonds juridique servi par l'API Laravel et l'enrichit de contenu éditorial (guides, démarches). Ce document décrit l'arborescence des routes telle qu'implémentée dans `src/pages/`, le mode de rendu et le flux de données.

## Modèle de rendu

Le site est bâti sur **Astro 7** avec l'adaptateur `@astrojs/node` (mode `standalone`) : c'est un **serveur SSR**, pas un export statique.

- Les pages éditoriales (accueil, guides, démarches, pages légales) sont **pré-rendues** par défaut.
- Les pages qui dépendent de l'API (fonds juridique, recherche, thèmes, sitemap, relais de contact) déclarent `export const prerender = false` et sont **rendues à la demande**. Elles interrogent l'API côté serveur (Node), ce qui évite le CORS et permet un vrai statut HTTP (404, 5xx) pour le SEO.
- `astro.config.mjs` fixe `site: 'https://mibeko.fr'`, désactive `security.checkOrigin` (TLS terminé par Traefik en amont) et déclare les redirections 301 du renommage `/codes` → `/textes`.

Le `Layout.astro` global gère `<head>` : titre, description, canonical, Open Graph, Twitter Card, `theme-color` (`#03271A`), chargement des polices (Inter + Source Serif 4) et données structurées JSON-LD (`Organization`, `WebSite` avec `SearchAction` pointant vers `/recherche`, plus les schémas passés par page). Il expose un lien d'évitement « Aller au contenu principal » et l'ossature `flex` de la page.

## Arborescence des routes

```
/                              Accueil — page d'orientation (SSR pré-rendu)
├── /textes                    PILIER 1 · Fonds juridique — répertoire filtré + paginé (SSR)
│   └── /textes/[doc]          Page document = lecteur (sommaire + PDF original) (SSR)
│       └── /textes/[doc]/[article]   Article = texte officiel intégral + navigation (SSR)
├── /ressources                PILIER 2 · Guides éditoriaux (collection markdown)
│   └── /ressources/[slug]     Guide (rendu markdown)
├── /demarches                 PILIER 3 · Démarches pas à pas (collection markdown)
│   └── /demarches/[slug]      Démarche (parcours d'étapes)
├── /themes                    Thèmes de vie — entrée par situation (SSR)
│   └── /themes/[slug]         Textes rattachés à un thème (SSR)
├── /recherche                 Recherche plein-texte du fonds (SSR, noindex)
├── /produits                  Présentation des produits Mibeko (app mobile, plateforme pro)
├── /contact                   Formulaire de contact
├── /cgu, /confidentialite,    Pages légales
│   /mentions-legales
├── /404                       Page d'erreur
├── /api/contact               Endpoint POST — relais du formulaire vers l'API (SSR)
└── /sitemap.xml               Sitemap généré à la demande (SSR)
```

La navigation principale (`Header.astro`) expose quatre entrées — **Textes officiels** (`/textes`), **Démarches** (`/demarches`), **Guides** (`/ressources`), **Contact** (`/contact`) — plus une icône de recherche (`/recherche`), un lien `/produits` et un bouton vers l'espace pro (`app.mibeko.fr`).

## Pilier 1 — Le fonds juridique (`/textes`)

Renommé depuis `/codes` (le répertoire mêle codes, lois, arrêtés et décrets) ; les anciens chemins sont redirigés en 301 par `astro.config.mjs`.

- **Répertoire `/textes/index.astro`** : catalogue paginé des documents publiés. Formulaire GET (fonctionne sans JavaScript) filtrant par **type** (référentiel chargé via l'API), **périmètre** (national / OHADA / communautaire), **plage d'années** et **tri** (titre A→Z, plus récents, plus anciens). Chaque document est une carte liée vers son lecteur. La pagination est déléguée à l'API (24 par page par défaut). Un garde-fou exclut les documents sans `slug` pour ne jamais produire de lien cassé.
- **Lecteur `/textes/[doc]/index.astro`** : page document. Récupère le document par slug (`fetchPublicDocument`), renvoie un vrai **404** si absent ou non publié. Affiche un bandeau-titre (type, périmètre, date, référence NOR, institution, source Journal Officiel), le **sommaire réel** du texte — l'arbre est reconstruit côté serveur par `buildTree` à partir de la structure à plat renvoyée par l'API, articles orphelins entrelacés par ordre d'affichage — et, quand il existe, le **PDF original** intégré en `<iframe>` (desktop) ou ouvert nativement (mobile) via un proxy API (`pdfProxyUrl`). Émet un JSON-LD `Legislation` + `BreadcrumbList`.
- **Article `/textes/[doc]/[article].astro`** : le lecteur d'un article. Le paramètre d'URL a la forme `article-<numéro>` (préfixe `article-`, numéro décodé). Affiche le **texte officiel intégral** de l'article (police serif, contenu assaini des artefacts OCR/LaTeX par `sanitize.ts`), le sommaire sticky, la navigation article précédent / suivant, les **textes liés** (maillage interne : références, modifications, abrogations… publiés uniquement), les thèmes rattachés, et un mur de conversion vers l'espace pro (expliquer avec l'IA, ajouter à un dossier, lire hors-ligne). JSON-LD `Legislation` (avec `isPartOf` le document) + `BreadcrumbList`.

## Pilier 2 — Les guides (`/ressources`)

Contenu **éditorial local** : collection Astro `guides` (fichiers markdown de `src/content/guides/`, schéma Zod dans `content.config.ts` : titre, description, catégorie, dates, image de couverture, `draft`, `featured`, et `fondsQuery` — une requête pré-remplie vers la recherche du fonds). La page `/ressources.astro` liste les guides non brouillon, met un guide « à la une » en avant, propose un filtrage par catégorie côté client, et renvoie vers le fonds. Chaque guide est rendu par `/ressources/[slug].astro`. Ce pilier est volontairement découplé du fonds : un guide explique en langage clair puis **renvoie** vers les textes officiels.

## Pilier 3 — Les démarches (`/demarches`)

Contenu **éditorial local** : collection Astro `demarches` (markdown de `src/content/demarches/`). Le schéma impose une suite d'**étapes** structurées (`steps` : titre, description, documents à fournir, base légale optionnelle avec requête vers le fonds, astuce). Chaque démarche cible une audience (`citoyen`, `entreprise`, `professionnel`). La page `/demarches/index.astro` liste les démarches en cartes (catégorie, audience, nombre d'étapes) ; `/demarches/[slug].astro` rend le parcours pas à pas. La même donnée est destinée à alimenter, à terme, un suivi dans l'app (dossier + rappels).

## Recherche (`/recherche`)

Page SSR, marquée `noindex`. Formulaire GET (`?q=`) exigeant au moins deux caractères. Interroge la recherche plein-texte publique de l'API (`fetchLibrarySearch`, `library/search`), affiche jusqu'à 20 résultats (fil d'Ariane, numéro d'article, titre du document, extrait assaini) liés vers l'article correspondant, et propose un renvoi vers l'assistant IA de l'espace pro. Elle est aussi la cible de la `SearchAction` déclarée dans le JSON-LD `WebSite`.

## Thèmes de vie (`/themes`)

Entrée du droit **par situation** plutôt que par nom de code (famille, travail, logement, entreprise, justice…). Page SSR : `/themes/index.astro` affiche la grille des thèmes (taxonomie éditoriale servie par l'API `library/themes`, icône par `ThemeIcon.astro`, nombre de textes rattachés) ; `/themes/[slug].astro` liste les textes publiés d'un thème. Les thèmes réutilisent le modèle de tags promu en taxonomie côté back.

## Pages transverses

- **Accueil `/`** : page d'orientation composée de blocs (`HomeHero`, `ThemesBand`, `IntentionPillars`, `AudienceSplit`, `LatestUpdates`, `WhyMibeko`, `CTASection`) qui présentent les piliers et dirigent citoyens et professionnels.
- **Contact `/contact`** + **`/api/contact`** : formulaire natif (fonctionne sans JavaScript). Le POST est traité par la route serveur `api/contact.ts`, qui refait un contrôle d'origine (`Origin`/`Referer` sur une liste d'hôtes autorisés) puis relaie le message à l'API Laravel, avec redirection vers `/contact?status=…` (ok / invalid / error).
- **Pages légales** : `/cgu`, `/confidentialite`, `/mentions-legales`.
- **`/produits`** : présentation de l'app mobile et de la plateforme pro.

## Flux de données et SEO

Le client d'API (`src/lib/api.ts`) centralise tous les appels serveur-à-serveur vers Laravel : documents et articles (`fetchPublicDocument`), catalogue (`fetchPublishedDocuments`), types (`fetchDocumentTypes`), recherche (`fetchLibrarySearch`), thèmes (`fetchThemes`, `fetchThemeDocuments`), plan du sitemap (`fetchSitemap`), proxy PDF (`pdfProxyUrl`) et relais de contact (`submitContact`). Les enveloppes de réponse sont normalisées, les contenus légaux passent par `sanitizeLegalText`, et les chemins canoniques sont produits par `documentPath` / `articlePath` / `themePath`.

Le référencement est natif : chaque page pertinente émet du JSON-LD, `robots.txt` autorise l'indexation et pointe le sitemap, et `sitemap.xml.ts` génère à la demande l'ensemble des URL — pages statiques, guides, démarches, thèmes, puis tous les documents et articles du fonds (via `fetchSitemap`), avec dégradation gracieuse si l'API est momentanément indisponible.
