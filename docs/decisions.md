# Registre des décisions — site public (mibeko.fr)

> Statut : à jour au 2 octobre 2026 · **Fait autorité sur** : les décisions en vigueur qui ne changent que le code de ce dépôt. Les décisions qui touchent plusieurs dépôts (site sans compte, marque, partage par URL, provenance, schéma d'URL, quotas vus du site…) sont dans le registre transverse (`docs/decisions.md` du monorepo, dépôt `mibeko-docs`), qui donne aussi le gabarit et les règles (D-001).

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
**Statut** : en vigueur, titre remplacé par SITE-013 · **Réf.** : mibeko-site#25

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

### SITE-010 · 2026-09-30 · Le mouvement oriente le lecteur, il ne décore jamais
**Statut** : en vigueur · **Réf.** : [`design-system.md`](design-system.md) § 7, revue du site du 30/09/2026 (artifact « Chantier mibeko.fr »), D-046

**Contexte** : la charte v2 interdisait tout mouvement de position (« le survol change une couleur, jamais une position »). Elle visait les effets de start-up (flous, dégradés, cartes qui sautent) et ne disait rien du mouvement qui explique ce qui se passe. Or chaque article recharge la page d'un bloc, sans rien dire du sens de la lecture, et chaque future animation aurait rouvert le débat.
**Décision** : un mouvement n'est admis que s'il dit d'où vient ce qui arrive, confirme une action, ou évite un saut brusque. Il dure de 120 à 260 ms (400 ms pour l'unique apparition des sections de l'accueil) et suit une courbe de sortie forte. Rien ne bouge sur une action répétée des dizaines de fois (frappe, flèches du clavier). Les transitions entre pages passent par le CSS (`@view-transition`) et le préchargement par les speculation rules, sans application monopage : l'URL d'un article reste sa citation (D-046) et le site marche sans JavaScript. Avec `prefers-reduced-motion`, plus aucun déplacement : il ne reste qu'un fondu court (précisé le 30/09 : « moins de mouvement » ne veut pas dire « aucun »). Le survol, lui, ne change toujours qu'une couleur.
**Écarté** : garder l'interdit total ; une application monopage pour des transitions plus riches (elle casse l'URL-citation et le site sans JavaScript).
**Conséquences** : la charte gagne une sous-section « Mouvement » (§ 7) avec la liste des mouvements admis. Un navigateur qui ne gère pas les transitions entre pages charge la page comme avant.
**On rouvre si** : une mesure montre qu'une transition retarde l'affichage du texte de loi sur un Android d'entrée de gamme.

### SITE-011 · 2026-09-30 · Un menu « Outils » regroupe l'application, l'Assistant et l'espace pro
**Statut** : en vigueur · **Réf.** : revue du site du 30/09/2026, SITE-001, D-049, D-054, mibeko-site#80

**Contexte** : sur ordinateur, aucune entrée de menu ne menait à l'espace pro ; il n'apparaissait que dans le menu mobile et en petit sous le champ de l'accueil. Le regroupement proposé s'intitulait « Produits ».
**Décision** : un seul menu déroulant, « Outils », de trois entrées : l'application, l'Assistant Mibeko, l'espace pro. Panneau sur ordinateur (ouvert au clic, ou au survol après un court délai, fermé par Échap), accordéon sur téléphone. Chaque entrée dit à qui elle sert et ce qu'il en coûte pour commencer.
**Écarté** : « Produits » (contredit SITE-001 et sonne comme un catalogue à acheter) ; « Applications » (se confond avec « L'application ») ; « Services » (vague) ; un méga-menu (trois entrées ne le justifient pas).
**Conséquences** : l'espace de travail n'a pas de sous-marque (D-054) : la troisième entrée se nomme par ce qu'on y fait, « Travailler vos dossiers ». L'ancien lien « Cabinets et juristes » du menu mobile disparaît dans le menu « Outils ».
**On rouvre si** : le menu dépasse cinq entrées.

### SITE-012 · 2026-10-02 · Les démonstrations se jouent dans un vrai téléphone, et le visiteur les pilote
**Statut** : en vigueur · **Réf.** : canevas « Refonte mibeko.fr : Assistant et accueil » (planches 7, 7 bis, 8 et 8 bis), SITE-004, SITE-010, [`design-system.md`](design-system.md) § 7 et § 8

**Contexte** : le fondateur trouve le site trop sommaire. La page Assistant ne montrait jamais une réponse, et l'accueil ne disait pas ce qu'on peut y faire. L'écran de l'application rejoué sur l'accueil (SITE-004) était dessiné comme un appareil sobre, avec un simple filet de 1 px, et ne réagissait à rien.
**Décision** :
- le téléphone a un cadre noir plein, avec îlot, boutons latéraux et barre d'accueil. Il reste plat : ni ombre, ni reflet, ni dégradé ;
- la démonstration se pilote. Un repère ou un geste touché à côté du téléphone fait réagir l'écran, et un élément touché dans l'écran fait avancer la démonstration. Elle se joue seule tant que personne n'y touche, s'arrête dès qu'on y touche, et garde toujours « Pause » et « Rejouer » ;
- chaque écran montre une capacité vraie aujourd'hui dans le produit. Ce qui n'existe pas encore (statut dans le lecteur de l'application, différences surlignées entre deux versions) n'entre dans l'animation qu'une fois livré ;
- sur téléphone, le cadre est gardé mais réduit, les repères passent en pastilles défilantes au-dessus de l'écran, l'explication dessous, et la recherche reste le premier geste du premier écran ;
- les garde-fous de SITE-004 et SITE-010 restent : sans JavaScript ou avec `prefers-reduced-motion`, l'écran est rendu terminé et lisible ; la boucle s'arrête hors écran et dans un onglet masqué ; aucune réponse inventée en production.
**Écarté** : l'appareil au filet de 1 px de la charte v2 (il ne se lit pas comme un téléphone) ; retirer le cadre sur téléphone (proposé le 02/10, écarté : réduit, il reste lisible à 390 px) ; une vidéo (lourde, et rien à toucher) ; un assistant ouvert aux visiteurs (SITE-004).
**Conséquences** : la charte change au § 8 (« Écran de l'application, rejoué ») et gagne une ligne au § 7. D'autres pages pourront recevoir des démonstrations du même genre, avec les mêmes garde-fous. Le code repart des composants existants (`AssistantConversation.astro`, `Header.astro`) : les maquettes ne sont pas recopiées telles quelles.
**On rouvre si** : une mesure montre que la démonstration retarde l'affichage du champ de recherche, ou fait dépasser à la page son budget de 150 ko sur un Android d'entrée de gamme.

### SITE-013 · 2026-10-02 · Le titre de l'accueil devient une question : « Que dit la loi sur votre situation ? »
**Statut** : en vigueur · **Réf.** : mibeko-site#96, SITE-002, SITE-012, canevas « Refonte mibeko.fr » (planches 8 et 8 bis)

**Contexte** : SITE-002 mettait la promesse dans le titre (« Le droit congolais et OHADA, clair et cité à la source. ») et écartait un titre en forme de question, parce que la question testée nommait un seul litige (un bail). Avec la refonte (SITE-012), le téléphone du premier écran montre ce que ce titre affirmait : la source, le statut, la version. Le fondateur ne veut plus de « le droit congolais et OHADA » en titre.
**Décision** : le titre de l'accueil est « Que dit la loi sur votre situation ? », suivi de « Décrivez-la avec vos mots : Mibeko retrouve les articles qui en parlent. », puis du champ de recherche, qui reste le premier geste. Le périmètre passe dans la ligne de chiffres, sous le champ (« textes officiels du Congo et de l'OHADA »), et reste dans le `<title>` de la page pour le référencement. La signature unique de la charte (§ 13) ne change pas.
**Écarté** : garder le titre actuel (une affirmation que le téléphone prouve mieux) ; aucun titre visible (les premières secondes ne diraient plus rien, et Google comme les lecteurs d'écran perdraient le H1) ; une question qui nomme un seul litige (la raison de SITE-002 reste valable).
**Conséquences** : le reste de SITE-002 tient (promesse au lecteur, preuve sous le champ, porte latérale pour les professionnels). La question est générique : elle renvoie au champ, qui reçoit la situation de chacun.
**On rouvre si** : les recherches lancées depuis l'accueil baissent dans les 14 jours qui suivent la mise en ligne de mibeko-site#96, comparées aux 14 jours d'avant (Umami).
