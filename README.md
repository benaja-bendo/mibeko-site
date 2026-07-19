# Site public Mibeko

> Statut : à jour au 2 juillet 2026 · portail public du droit congolais (site vitrine + fonds juridique consultable), servi en SSR sur `mibeko.fr`.

Ce dépôt contient le code du **site public Mibeko**, un des cinq dépôts de l'écosystème Mibeko. Il cible le **citoyen et la diaspora** de la République du **Congo-Brazzaville** (droit national, OHADA, CEMAC), par opposition au dashboard professionnel (`mibeko-front`) réservé aux avocats et juristes. Le domaine de production est **`mibeko.fr`**.

Contrairement à ce que décrivaient d'anciennes versions de ce fichier, le site n'est **pas** une simple landing page one-page : c'est un portail complet qui expose le fonds juridique en lecture libre, article par article, autour de trois piliers de contenu.

## Stack technique

- **Astro 7** (`astro@^7.0.2`) en **rendu à la demande (SSR)** via l'adaptateur `@astrojs/node` (mode `standalone`). Le rendu SSR est activé page par page avec `export const prerender = false` pour tout ce qui dépend de l'API ; les pages purement éditoriales restent pré-rendues.
- **Tailwind CSS v4** (plugin Vite `@tailwindcss/vite`), les tokens de couleur du design system étant exposés comme utilitaires (`bg-primary`, `text-on-surface`, `border-surface-variant`…).
- **Node ≥ 22.12** requis.
- **Collections de contenu Astro** (markdown local, chargeur `glob`) pour les guides et les démarches.
- **API Laravel** (`api.mibeko.fr`, base configurable par `MIBEKO_API_URL`) pour le fonds juridique, la recherche, les thèmes et le relais du formulaire de contact.

## Les trois piliers

Le site s'organise autour de trois piliers de contenu, complétés par la recherche et les thèmes de vie :

1. **Le fonds juridique — `/textes`** (anciennement `/codes`, redirigé en 301). Répertoire filtré et paginé des textes officiels publiés (codes, lois, arrêtés, décrets, national / OHADA / communautaire), puis un lecteur article par article. Données servies par l'API en SSR.
2. **Les guides — `/ressources`.** Contenu éditorial (collection `guides`, markdown local) expliquant le droit en français simple, relié au fonds.
3. **Les démarches — `/demarches`.** Parcours « comment faire X au Congo » pas à pas (collection `demarches`, markdown local avec étapes structurées).

À cela s'ajoutent la **recherche** plein-texte du fonds (`/recherche`) et les **thèmes de vie** (`/themes`), qui permettent d'entrer dans le droit par situation (famille, travail, logement, entreprise…) plutôt que par le nom d'un code.

L'arborescence complète, les routes dynamiques et le fonctionnement du lecteur sont décrits dans [`docs/architecture-site.md`](./docs/architecture-site.md).

## Design

Le design suit une esthétique institutionnelle et sobre (« Corporate Minimalism »), pensée pour de longues sessions de lecture et une identité congolaise.

- **Palette forêt** : vert profond primaire (`#03271A`), terracotta secondaire (`#8F4C31`), fond crème (`#FCF9F8`), neutres charbon. Le `theme-color` du navigateur est `#03271A`.
- **Typographie** : **Inter** pour l'interface et les titres, **Source Serif 4** pour le contenu légal (articles, textes longs). Polices chargées via Google Fonts.

Le système de design complet (tokens, échelles typographiques, composants) est documenté dans [`docs/design-system.md`](./docs/design-system.md).

## Structure du projet

```text
mibeko-site/
├── public/                 # Assets statiques (logo.svg, robots.txt…)
├── src/
│   ├── components/         # Composants Astro (Header, Footer, HomeHero, DocumentTree, ThemeIcon…)
│   ├── content/            # Collections markdown : guides/ et demarches/
│   ├── content.config.ts   # Schémas typés des collections (Zod)
│   ├── layouts/            # Layout.astro (SEO, Open Graph, JSON-LD, fonts)
│   ├── lib/                # api.ts (client API Laravel), sanitize.ts (nettoyage OCR/LaTeX), sitemap.ts (helpers sitemaps)
│   ├── pages/              # Routes du site (voir docs/architecture-site.md)
│   └── styles/             # global.css
├── astro.config.mjs        # SSR node, site mibeko.fr, redirections 301 /codes → /textes
├── package.json
└── docs/                   # Documentation technique (design-system, architecture)
```

## Configuration

La seule variable d'environnement requise est l'URL de base de l'API Laravel :

```bash
cp .env.example .env
# MIBEKO_API_URL=http://localhost:8000/api/v1   (API Laravel locale)
```

La priorité de résolution est : `process.env` (runtime, injecté au conteneur en prod) > `import.meta.env` (build/dev) > défaut production (`https://api.mibeko.fr/api/v1`). Laisser la variable vide en local reviendrait à taper la production ; elle est donc à renseigner.

## Commandes

Toutes les commandes s'exécutent depuis `mibeko-site/`.

| Commande | Action |
| :--- | :--- |
| `npm install` | Installe les dépendances |
| `npm run dev` | Serveur de développement local (`localhost:4321`) |
| `npm run check` | Vérification statique (`astro check` : types + templates), aussi exécutée en CI avant le build Docker |
| `npm run build` | Build de production (SSR node) dans `./dist/` |
| `npm run preview` | Prévisualise le build de production |

## Déploiement

Le site est déployé en **SSR** (serveur Node autonome, pas un export statique) : le build produit un serveur dans `dist/` lancé par le conteneur. En production, il est servi derrière **Traefik** (qui termine le TLS). Comme le proxy communique en HTTP clair avec le conteneur, le `checkOrigin` natif d'Astro est désactivé dans `astro.config.mjs` et un contrôle d'origine explicite (header `Origin`/`Referer`) est refait dans les routes POST (`src/pages/api/contact.ts`). Le domaine de production est `mibeko.fr` (les anciens domaines `mibeko.app` et `mibeko.cg` sont abandonnés).

## Documentation

- [`docs/README.md`](./docs/README.md) — index de la documentation.
- [`docs/design-system.md`](./docs/design-system.md) — système de design.
- [`docs/architecture-site.md`](./docs/architecture-site.md) — arborescence et rendu du site.
