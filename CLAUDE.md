# CLAUDE.md — mibeko-site

## Contexte
Site public `mibeko.fr` (Astro en SSR, adaptateur `@astrojs/node` standalone) : portail citoyen et diaspora du droit congolais. Un des 7 dépôts du monorepo Mibeko — voir le `CLAUDE.md` racine pour la carte et les conventions communes.

Rôle économique : le site **vend**. C'est le **seul canal d'acquisition organique** de l'app mobile et de l'espace pro (SEO → article → App Link / bannière d'installation → compte gratuit → pro payant). Toute régression SEO ou tout lien mort coûte directement des installations. Répartition site / app / pro : `docs/produit/positionnement-site-app.md` (dépôt `docs/`) — s'y référer avant d'ajouter une surface.

## Règle absolue
**Pas de compte utilisateur sur `mibeko.fr`.** Ni login, ni inscription, ni état utilisateur persistant, ni IA conversationnelle. Tout ce qui exige une authentification vit sur `app.mibeko.fr` (le site n'y renvoie que par liens sortants : `/tarifs`, `/produits`, `/contact`). Les seuls `POST` du site sont `src/pages/api/contact.ts` et `api/newsletter.ts`, qui relaient vers l'API Laravel en serveur-à-serveur.

## Commandes
```bash
npm install
npm run dev      # serveur de dev (localhost:4321)
npm run check    # astro check (types + templates) — aussi exécuté en CI avant le build Docker
npm run build    # build SSR → dist/ (dist/server/entry.mjs + dist/client)
npm run preview  # prévisualise le build
```
Une seule variable requise : `MIBEKO_API_URL` (`cp .env.example .env`). Résolution : `process.env` (runtime prod) > `import.meta.env` (build/dev) > défaut **production**. La laisser vide en local tape donc la prod.

## Corpus : API d'un côté, markdown de l'autre (asymétrie structurante)
- **Le fonds juridique n'est jamais dupliqué localement.** Tout passe par l'API publique Laravel via `src/lib/api.ts` : `GET /legal-documents` (catalogue filtré, `filter[curation_status]=published`), `/legal-documents/slug/{slug}?article=`, `/document-types`, `/library/search`, `/library/themes[/{slug}]`, `/sitemap`, `/legal-documents/{id}/pdf` (proxy PDF intégré en `<iframe>`), plus `POST /contact` et `/newsletter-subscriptions`.
- **Guides (`/ressources`) et démarches (`/demarches`) sont des collections Astro locales** (`src/content/`, schémas Zod dans `src/content.config.ts`). Aucune API ne les expose : **aucune autre surface ne peut les afficher**. Toute idée d'« afficher les guides dans l'app » implique d'abord de les sortir d'ici — ne pas le supposer fait.
- Le texte d'article est assaini au vol par `src/lib/sanitize.ts` (artefacts LaTeX/OCR de l'ingestion) : le correctif amont reste côté `mibeko-python`, ne pas empiler un second nettoyage.

## Pièges vérifiés dans le code
1. **SSR page par page.** Seules les pages avec `export const prerender = false` interrogent l'API à la requête. **Tout le reste — dont la page d'accueil — est pré-rendu, donc ses appels API partent au BUILD** : `LatestUpdates.astro` (derniers textes) et `ThemesBand.astro` (thèmes) sont un instantané de l'image Docker. Un texte publié n'apparaît en home qu'après redéploiement, et si l'API est injoignable pendant le build les deux sections **disparaissent silencieusement** (`try/catch` → section masquée, le build ne casse pas).
2. **Contrat d'erreur volontairement asymétrique.** `fetchPublicDocument` renvoie `null` sur 404 (vrai 404 pour le SEO) mais **lève** sur le reste, pour que la page rende un 5xx et que Google réessaie au lieu de désindexer. `fetchDocumentTypes` est best-effort (`[]`). Ne pas « améliorer » en avalant les erreurs des pages SSR.
3. **`security.checkOrigin` est désactivé** dans `astro.config.mjs` (Traefik termine le TLS → faux 403). Le contrôle est refait à la main sur `Origin`/`Referer` dans `api/contact.ts` (`ALLOWED_HOSTS`). **Toute nouvelle route POST doit refaire ce contrôle**, sinon elle est ouverte.
4. **Umami est inactif tant que les variables ne sont pas des build-args Docker.** `Layout.astro` n'injecte le script que si `PUBLIC_UMAMI_URL` **et** `PUBLIC_UMAMI_WEBSITE_ID` sont définies ; comme elles sont lues via `import.meta.env`, elles sont inlinées **au build** → il faut les `ARG` du `Dockerfile` + les secrets passés en `build-args` dans `.github/workflows/deploy-prod.yml`. Les ajouter au `.env` runtime ne fait rien. L'URL est l'**origine de base**, sans `/script.js` (le layout l'ajoute). Ne pas proposer un autre outil d'analytics : décision actée dans `docs/decisions.md`.
5. **Conformité stores déjà subie** (rejet Play « Misleading Claims ») : **ne jamais promettre sur le site une capacité que l'app n'a pas**, et citer les sources officielles (sgg.cg, ohada.org) — déjà fait dans `/methode` et `/cgu`, à préserver. `src/pages/tarifs.astro` porte encore un `PLACEHOLDER PRIX — userAction` : ne pas inventer un tarif.
6. **Un seul nom pour l'IA : « Assistant Mibeko »** (cf. `mibeko-app-kmp/CLAUDE.md`). `src/pages/textes/index.astro` dit encore « Mibeko IA » — à corriger, pas à imiter.
7. Le renommage `/codes` → `/textes` est porté par des **redirections 301 dans `astro.config.mjs`** : ne jamais réintroduire de lien `/codes`, et ne pas générer de lien vers un document sans `slug` (`fetchPublishedDocuments` filtre déjà les slugs vides — garde-fou à conserver).
8. Les polices (Inter + Source Serif 4) sont chargées depuis Google Fonts, seul tiers externe du site : en tenir compte avant d'en ajouter un autre (posture affichée en `/confidentialite` : mesure d'audience sans cookies).

Déploiement : `main` → CI (`astro check` → image GHCR → SSH sur le VPS, compose `.deploy/docker-compose.yml`, Traefik). L'infra est provisionnée par le dépôt `vps_infra`, pas ici.

## Périmètre — non négociable
Congo-**Brazzaville** (jamais la RDC, jamais Kinshasa), droit national + **OHADA** (`ohada.org`, jamais `ohada.com`), devise **FCFA (XAF)** — jamais le franc congolais.

## Conventions de travail
- Docs du dépôt : `README.md`, `docs/architecture-site.md`, `docs/design-system.md` (chaque fichier commence par `# Titre` + `> Statut : à jour au <date>`). En cas de divergence, le code fait foi — mettre la doc à jour dans le même commit.
- Toute décision structurante = une ligne datée dans `docs/decisions.md` (dépôt `docs/`, transverse).
- Commits en français, `type(scope): titre court` à l'impératif, corps expliquant le **POURQUOI**. Un sujet cohérent par commit. **Jamais de commit sans l'accord explicite de l'utilisateur.**
