# Registre des décisions — site public (mibeko.fr)

> Statut : à jour au 28 septembre 2026 · **Fait autorité sur** : les décisions en vigueur qui ne changent que le code de ce dépôt. Les décisions qui touchent plusieurs dépôts (site sans compte, marque, partage par URL, provenance, schéma d'URL, quotas vus du site…) sont dans le registre transverse (`docs/decisions.md` du monorepo, dépôt `mibeko-docs`), qui donne aussi le gabarit et les règles (D-001).

Identifiants `SITE-NNN`, jamais réutilisés ; une nouvelle décision s'ajoute à la fin. Les décisions reprises le 28/09/2026 ne portent « Écarté » et « On rouvre si » que si l'original les donnait ; texte d'origine : `docs/_archive/2026-09-28-journal-decisions-2026-07-a-09.md` (dépôt `mibeko-docs`).

### SITE-001 · 2026-08-17 · Le site est une institution, pas un produit, et c'est par là qu'il vend
**Statut** : en vigueur · **Réf.** : [`design-system.md`](design-system.md) v2, D-024

**Décision** : ce qui s'achète, c'est la certitude que le texte affiché est le texte réel. Tout ce qui l'affaiblit coûte donc du chiffre d'affaires. Quatre lois :
1. la preuve avant la promesse ;
2. l'offre naît du service rendu, et aucun appel à l'action ne s'interpose entre une personne et le texte ;
3. dans le doute, on dit le doute ;
4. on ne décore jamais avec ce qui informe.

Le statut juridique figure sur toute page qui montre du texte de loi ; par défaut, il est « non vérifié ». Les interdits de la charte s'écrivent en commandes `grep`, dont le résultat attendu est zéro.

### SITE-002 · 2026-09-20 · Le premier écran porte une promesse au lecteur, ni l'identité du site ni l'offre Pro
**Statut** : en vigueur · **Réf.** : mibeko-site#25

**Décision** : la promesse va dans le H1 et le champ de recherche, la preuve (textes officiels, chiffres du fonds) en sous-titre, l'offre dans des pages dédiées. Le premier écran ne promet que ce que le champ livre. Aucune situation n'est nommée avant d'avoir été tapée dans le champ en production. Les professionnels gardent une porte latérale (« Vous exercez le droit ? », événement `travailler_offre`).
**Écarté** : le registre « la référence du droit congolais » (Mibeko n'est pas l'État) ; un H1 en forme de question (un seul litige ne parle qu'à une seule personne).

### SITE-003 · 2026-08-27 · `/a-propos` dit qui édite le site ; `/methode` dit d'où viennent les textes
**Statut** : en vigueur

**Décision** : la page nomme l'éditeur, oppose ce que Mibeko est et n'est pas, énonce le modèle économique et ouvre le signalement d'erreur. Le JSON-LD `AboutPage` ne désigne qu'elle. Le nœud `Organization` porte un `@id` réutilisé.

### SITE-004 · 2026-08-25 · Les démonstrations de l'Assistant sont en HTML, avec de vrais liens, et jamais un bac à sable public
**Statut** : en vigueur · **Réf.** : mibeko-site#18

**Décision** :
- **pas de bac à sable IA public** (31/07) : ni coût IA exposé aux anonymes, ni réponse juridique non maîtrisée en vitrine ;
- **démonstrations en HTML natif**, dont les citations sont de vrais liens vers `/textes/…`. `npm run check:assistant-links` échoue si une citation cesse de répondre 200 ;
- **aucun texte de réponse inventé** tant qu'aucune réponse réelle n'est capturée ;
- **l'accueil rejoue l'écran Assistant de l'application mobile** (27/08), avec la géométrie de l'application confinée au composant. Sans JavaScript, la page montre la conversation terminée.

### SITE-005 · 2026-08-17 · La vitrine montre les « Nouveautés du fonds », jamais des « actualités juridiques »
**Statut** : en vigueur

**Décision** : l'accueil et `/actualites` suivent la date d'intégration (`created_at`), affichée à part de la date juridique. Le rendu est en SSR, pour que le flux évolue sans redéploiement.

### SITE-006 · 2026-08-17 · Le catalogue est trié par chronologie juridique décroissante, dates inconnues en dernier
**Statut** : en vigueur

**Décision** : les tris secondaires sont `titre_officiel`, puis l'UUID. Le tri alphabétique reste un choix explicite. Aucun score d'« importance » opaque.

### SITE-007 · 2026-08-17 · Les thèmes de vie quittent la première hiérarchie de l'accueil tant que leur couverture n'est pas gouvernée
**Statut** : en vigueur · **Réf.** : dashboard#16

**Décision** : les pages de thèmes et la navigation « Situations » restent accessibles, mais dix catégories inégalement remplies ne sont plus la première porte d'entrée.
**On rouvre si** : aucun thème affiché n'a zéro document.

### SITE-008 · 2026-08-07 · `apple-app-site-association` est servi par une route Astro
**Statut** : en vigueur · **Réf.** : D-020

**Décision** : le fichier, sans extension, partait en `application/octet-stream` depuis `public/`. Apple le rejetait, et aucun lien `mibeko.fr` n'ouvrait l'application sur iPhone. La route le sert en `application/json`.

### SITE-009 · 2026-09-19 · Cache HTTP des pages du fonds : court dans le navigateur, long dans un cache partagé
**Statut** : en vigueur · **Réf.** : mibeko-site#46, `src/lib/httpCache.ts`

**Décision** : `max-age` de 5 minutes pour un texte et d'une minute pour une liste ; `s-maxage` et `stale-while-revalidate` longs ; ETag faible sur le corps rendu. Jamais de cache sur `?q=` ni `?signalement=`. Aucune page du fonds ne varie selon le visiteur.
