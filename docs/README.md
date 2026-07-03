# Documentation du site public Mibeko

> Statut : à jour au 2 juillet 2026 · index de la documentation technique du site vitrine `mibeko-site`.

Ce dossier regroupe la documentation de référence du site public Mibeko (`mibeko.fr`), le portail citoyen et diaspora du droit congolais.

## Documents

| Document | Description |
| :--- | :--- |
| [design-system.md](./design-system.md) | Système de design (palette forêt, typographie Inter + Source Serif 4, espacements, composants). Fichier de référence, fiable. |
| [architecture-site.md](./architecture-site.md) | Arborescence réelle du site : les trois piliers (`/textes`, `/ressources`, `/demarches`), la recherche, les thèmes de vie, le lecteur d'articles et le rendu SSR. |

## Conventions

La documentation de ce dossier est datée : chaque fichier commence par un titre puis une ligne « Statut » indiquant sa date de mise à jour et sa portée. Elle est évolutive et doit refléter l'état réel du code — en cas de divergence, le code et la configuration (`astro.config.mjs`, `package.json`, `src/`) font foi. Les liens entre documents sont relatifs.
