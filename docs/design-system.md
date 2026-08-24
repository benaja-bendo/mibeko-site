---
name: Charte visuelle du site public Mibeko
version: 2
tokens:
  # — Fonds et textes —
  background: '#fcf9f8'
  surface: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-variant: '#e4e2e1'
  on-surface: '#1b1c1c'
  on-surface-variant: '#414844'
  on-surface-muted: '#676d69'
  # — Vert institutionnel —
  primary: '#03271a'
  on-primary: '#ffffff'
  primary-container: '#1b3d2f'
  inverse-primary: '#aacfbb'
  # — Terracotta : accent éditorial, jamais un statut —
  secondary: '#8f4c31'
  on-secondary: '#ffffff'
  secondary-tint: '#f7e9e2'
  # — Filets —
  outline: '#727974'
  outline-variant: '#c1c8c2'
  # — Statut juridique : réservé, jamais décoratif —
  statut-vigueur: '#2f6b4a'
  statut-vigueur-tint: '#e6f0ea'
  statut-modifie: '#8e640d'
  statut-modifie-tint: '#f7efdc'
  statut-abroge: '#a52a1a'
  statut-abroge-tint: '#f7e6e2'
  statut-inconnu: '#686d6a'
  statut-inconnu-tint: '#eeeeec'
  # — Erreur système (formulaires), distincte du statut juridique —
  error: '#ba1a1a'
typography:
  display:
    role: titre de page
    font: Inter
    size: 44px / 32px mobile
    weight: '700'
    tracking: -0.02em
  headline:
    role: titre de section
    font: Inter
    size: 28px / 24px mobile
    weight: '600'
    tracking: -0.01em
  title:
    role: titre de carte, nom de texte juridique
    font: Inter
    size: 18px
    weight: '600'
  legal:
    role: corps d'un article de loi
    font: Source Serif 4
    size: 18px
    line-height: 1.75
    measure: 68ch
  body:
    role: prose éditoriale du site
    font: Source Serif 4
    size: 17px
    line-height: 1.65
  ui:
    role: navigation, boutons, libellés
    font: Inter
    size: 15px
    weight: '500'
  label:
    role: surtitre, puce, métadonnée
    font: Inter
    size: 12px
    weight: '600'
    tracking: 0.08em
    transform: uppercase
  mono:
    role: référence, numéro d'article, numéro de JO
    font: ui-monospace
    size: 13px
radius:
  filet: 0
  controle: 4px
  carte: 8px
  max: 8px
spacing:
  base: 8px
  container-max: 1120px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

# Charte visuelle du site public Mibeko

> Statut : à jour au 17 août 2026 · **Fait autorité sur** : direction artistique, tokens de couleur, typographie, densité, composants et emplacements de conversion de `mibeko-site`. En cas de contradiction avec le code, **le code gagne** — corriger la charte dans le même commit.

## 0. Ce que cette version remplace

La version 1 était un export brut de Material Theme Builder, rédigé en anglais pour un site français : 47 tokens de couleur dont 25 n'ont jamais été appelés, aucun composant réel documenté, et une doctrine (« institutional presence », « flat elevation », « no pill-shaped elements ») que le code contredisait sur presque tous les points.

Cette version tranche la question restée ouverte — **institution, pas produit** — et en tire les conséquences chiffrées. Décision du 17 août 2026.

---

## 1. Doctrine

### La thèse : l'autorité est l'argument de vente

Mibeko ne vend pas *malgré* sa sobriété, il vend **par** elle. Ce qu'un citoyen ou un avocat achète — l'application, l'abonnement pro — c'est la certitude que le texte affiché est le texte réel, à jour, sourcé. C'est le seul actif de l'entreprise.

Il en découle que tout signe affaiblissant cette certitude détruit directement du chiffre d'affaires : une promesse absolue invérifiable, un badge de type erroné, un statut juridique passé sous silence, un costume de startup emprunté à un secteur qui ne répond de rien. **Ce qu'il faut retirer du site n'est pas la vente : c'est le déguisement.**

Une institution qui doit financer son indépendance n'a donc pas à choisir entre les deux. Elle a à faire une chose : rendre la preuve visible, et proposer l'offre au moment où la preuve vient d'être administrée.

### Les quatre lois

Elles tranchent tout arbitrage. En cas de conflit entre deux règles de cette charte, celle qui sert la loi la plus haute l'emporte.

1. **La preuve avant la promesse.** Aucune affirmation visible qui ne soit adossée à quelque chose que la page montre. On n'écrit pas « fonds rigoureusement vérifié » : on affiche la source, le numéro de Journal officiel et la date de publication, et on laisse le lecteur conclure.
2. **L'offre naît du service rendu, jamais avant.** Aucun appel à l'action ne s'interpose entre une personne et le texte qu'elle est venue lire. On propose l'application au bas d'un article effectivement lu, pas au-dessus du champ de recherche.
3. **Dans le doute, on dit le doute.** Un statut juridique non vérifié s'affiche « non vérifié ». C'est précisément ce qui sépare une institution d'un éditeur commercial : elle a le droit de ne pas savoir, à condition de l'écrire.
4. **On ne décore jamais avec ce qui informe.** Une couleur, une puce, un filet qui portent un sens quelque part sur le site ne peuvent servir d'ornement ailleurs. Une puce de statut juridique ne s'aligne pas avec des puces décoratives : elle cesserait d'être lue comme une information.

---

## 2. Interdits

Ces règles sont formulées pour être vérifiables. La commande donnée doit retourner **zéro** (ou le nombre justifié en commentaire) ; sinon le code a dérivé.

```bash
cd mibeko-site/src
grep -roE 'rounded-(xl|2xl|3xl|full)' . | wc -l   # attendu : 0
grep -roE 'shadow-(sm|md|lg|xl|2xl)' . | wc -l     # attendu : 0
grep -roE 'blur-(2xl|3xl)' . | wc -l               # attendu : 0
grep -roE 'bg-gradient-to-[a-z]+' . | wc -l        # attendu : 0
grep -ro 'hover-lift' . | wc -l                    # attendu : 0
```

Sont proscrits, sans exception :

- **Les dégradés et les flous décoratifs.** Le hero actuel pose deux taches colorées de 600 px et 500 px en `blur-3xl` plus une couche de bruit en `mix-blend-overlay` : c'est le vocabulaire visuel des sociétés qui ne répondent de rien. Une institution ne floute pas son fond.
- **Les formes en gélule** (`rounded-full`) sur tout élément porteur de contenu. Tolérées uniquement sur une pastille purement graphique sans texte (point d'état, puce de liste).
- **Les ombres portées.** La profondeur se fait par teinte de fond et par filet de 1 px. Une page de droit doit avoir l'air imprimée, pas empilée.
- **Les effets de survol qui déplacent un élément** (`translateY`, agrandissement). Le survol change la couleur du filet ou du fond, rien d'autre.
- **Les compteurs qui mesurent autre chose que ce que leur libellé annonce.** « Famille & personnes — 1 texte » laisse croire que le fonds contient un texte de droit de la famille, alors qu'il en compte 1 078 dont un seul est rattaché à ce thème. Un compteur de rattachement ne s'affiche pas sous un libellé de matière.
- **Le jargon de base de données visible.** `TEXTE JURIDIQUE (GÉNÉRIQUE)` n'est pas un mot français. Tout libellé exposé au public passe par le lexique éditorial.
- **Les superlatifs et les absolus** : « conformité totale », « exhaustif », « toujours à jour », « garanti ». Voir § 9.

---

## 3. Couleur

### Rôles

| Rôle | Token | Emploi |
| --- | --- | --- |
| Vert institutionnel | `primary` `#03271a` | En-tête, boutons principaux, blocs pleins, filets structurants. C'est la couleur de l'État et du sérieux : elle ne s'emploie pas pour attirer l'œil, elle s'emploie pour asseoir. |
| Terracotta | `secondary` `#8f4c31` | **Accent éditorial uniquement** : surtitres, liens dans la prose, soulignement de l'onglet actif. Jamais un statut, jamais une alerte, jamais un bouton principal. |
| Crème | `background` `#fcf9f8` | Fond général. Réduit la fatigue en lecture longue et distingue le site des fonds blancs administratifs. |
| Encres | `on-surface` `#1b1c1c`, `on-surface-variant` `#414844`, `on-surface-muted` `#676d69` | Trois niveaux, pas plus. |
| Filets | `outline` `#727974`, `outline-variant` `#c1c8c2` | Bordures uniquement. **Jamais comme couleur de texte.** |

### Correctif d'accessibilité obligatoire

`--color-outline` (#727974) est aujourd'hui employé à la fois comme filet et comme couleur de texte 12 px. En texte il donne **4,26:1 sur le crème et 4,47:1 sur le blanc** — sous le plancher AA de 4,5:1. C'est le seul défaut de contraste systémique du site.

Le correctif n'est pas d'assombrir `outline` (cela alourdirait toutes les bordures) mais de **séparer les deux rôles** : `outline` reste le filet, et le nouveau token `on-surface-muted` (#676d69) porte le petit texte secondaire — **5,05:1 sur crème, 5,29:1 sur blanc, 4,55:1 sur fond de puce**.

Le token `secondary-container` (#fda685) est retiré : ce saumon vif ne tient pas la ligne institutionnelle et ne passe AA qu'avec une seule encre. Il est remplacé par `secondary-tint` (#f7e9e2), qui porte le terracotta à **5,46:1**.

### Tokens morts à supprimer

25 des 47 tokens ne sont appelés nulle part (`on-tertiary-fixed-variant`, `secondary-fixed-dim`, `surface-tint`…). Ils sont retirés du frontmatter ci-dessus et doivent l'être de `src/styles/global.css`. Vérification :

```bash
cd mibeko-site && grep -c -- '--color-' src/styles/global.css   # doit correspondre au frontmatter
```

---

## 4. Le statut juridique — composant de signature

C'est le composant qui distingue Mibeko d'un dépôt de PDF, et il n'existe pas encore correctement. **94 % des pages indexables du site (16 841 pages article sur 17 919) n'affichent aujourd'hui aucun statut juridique**, alors que ce sont elles qui reçoivent le trafic de recherche.

### Règles

1. **Le statut est affiché sur toute page qui montre du texte de loi** — page document *et* page article. Une personne arrivée par Google sur un article isolé doit savoir, sans remonter d'un niveau, si le texte s'applique.
2. **Ce n'est pas une puce, c'est un bandeau.** Un filet vertical de 3 px dans la couleur du statut, un fond en teinte, un libellé en `label`, une phrase en clair. La forme diffère des puces de catégorie pour que l'œil ne les confonde jamais (loi 4).
3. **Le statut ne se lit jamais par la couleur seule** (WCAG 1.4.1) : le mot est toujours écrit.
4. **Quatre états, et le quatrième est obligatoire.**

| État | Couleur | Formulation | Quand |
| --- | --- | --- | --- |
| En vigueur | `statut-vigueur` #2f6b4a sur #e6f0ea | « En vigueur — vérifié le <date> » | Seulement si la vérification a eu lieu et est datée |
| Modifié | `statut-modifie` #8e640d sur #f7efdc | « Modifié par <texte> du <date> » | Modification identifiée et sourcée |
| Abrogé | `statut-abroge` #a52a1a sur #f7e6e2 | « Abrogé par <texte> du <date> » | Abrogation identifiée et sourcée |
| Non vérifié | `statut-inconnu` #686d6a sur #eeeeec | « Statut non vérifié — ce texte n'a pas fait l'objet d'un contrôle d'abrogation » | **État par défaut** |

**« Non vérifié » est l'état par défaut, et c'est un choix de doctrine, pas un pis-aller.** La base porte aujourd'hui `vigueur` comme valeur par défaut de colonne : afficher « en vigueur » sur cette base reviendrait à transformer un défaut technique en affirmation juridique. Tant qu'une vérification datée n'existe pas, le site écrit qu'il ne sait pas (loi 3).

Tous les couples de couleurs ci-dessus sont vérifiés ≥ 4,5:1 sur le crème, le blanc et le fond de puce.

---

## 5. Typographie

Deux familles, deux fonctions, aucune troisième.

- **Inter** — interface, navigation, titres, libellés, boutons. C'est l'outil.
- **Source Serif 4** — corps des articles de loi et prose éditoriale. C'est le livre.

L'échelle complète est dans le frontmatter. Elle est fermée : aucune taille hors échelle.

### Règles du français — non négociables

Le site vend de la rigueur juridique ; la typographie est un signal de sérieux au même titre que la source citée.

- **Bas de casse après le premier mot.** « Sources officielles », pas « Sources Officielles ». Le Title Case anglo-saxon est proscrit dans toute l'interface. Trois titres de l'accueil sont aujourd'hui fautifs.
- **Guillemets français** « … » avec espaces insécables intérieures.
- **Espace insécable** avant `:` `;` `!` `?` `»` et dans « n° 12 », « 24 août 2026 », « 15 000 FCFA ».
- **`n°`** avec o en exposant, jamais `N"` ni `No`.
- **Devise FCFA (XAF)**, jamais le franc congolais.
- Les intitulés officiels bruts (`ACTES EN ABREGE`) sont normalisés en casse de phrase **à l'affichage** — mais `titre_officiel` n'est jamais réécrit en base. Le libellé descriptif s'affiche **à côté** du titre officiel, jamais à sa place.

### Mesure

Le corps d'un article est plafonné à **68 caractères** de large. La prose éditoriale aussi. Aucune ligne de texte long ne dépasse cette mesure, quelle que soit la largeur de l'écran.

---

## 6. Mise en page et densité

C'est ici que se joue concrètement « institution, pas produit ».

- **La densité est une valeur.** L'accueil fait aujourd'hui 5 964 px pour huit sections : c'est le rythme d'une page d'atterrissage, pas d'un portail de référence. Cible : **une information utile par écran**, pas une affirmation par écran.
- **Pas de demi-écran vide en desktop.** Sur `/textes`, `/produits` et `/tarifs`, l'en-tête n'occupe que la colonne de gauche et la moitié droite reste vide au premier regard. Un en-tête de page porte, à droite, quelque chose d'utile : le compte réel, la dernière mise à jour, l'accès au filtre.
- **Le premier écran met le fonds au travail.** Le hero d'une institution n'est pas une phrase : c'est le champ de recherche, immédiatement utilisable, accompagné des chiffres réels du fonds (nombre de textes, nombre d'articles, date de dernière publication). Ces chiffres sont à la fois la preuve et l'argument commercial (loi 1).
- **Rythme de 8 px** pour toutes les marges et espacements. Conteneur 1120 px, gouttière 24 px, marges 16 px en mobile et 40 px en desktop.
- **Grille** 12 colonnes en desktop, 4 en mobile.
- **Les cartes d'une même rangée ne s'alignent pas sur la plus haute** en laissant de grands vides, comme aujourd'hui dans le catalogue. Hauteur intrinsèque, ou contenu de longueur bornée.

---

## 7. Formes et élévation

- **Rayons** : 0 pour les filets et les bandeaux, 4 px pour les contrôles (boutons, champs), 8 px maximum pour les cartes. **Aucun rayon supérieur à 8 px sur le site.**
- **Élévation plate.** Aucune ombre. La hiérarchie se lit par le fond (`surface-container-*`) et par un filet de 1 px.
- **États** : le focus est un filet de 2 px en `primary`, visible et non supprimé. Le survol change une couleur, jamais une position. L'état actif est un aplat, jamais un relief.

---

## 8. Composants

Les composants réels du site, et la règle qui s'applique à chacun. C'est cette section qui manquait entièrement à la version 1.

| Composant | Fichier | Règle |
| --- | --- | --- |
| En-tête | `Header.astro` | Persistant, filet bas de 1 px, onglet actif souligné en terracotta. La recherche y est accessible depuis toutes les pages. |
| Champ de recherche | `HomeHero.astro`, `recherche.astro` | Composant le plus important du site. Filet appuyé, libellé visible, **placeholder qui ne déborde jamais** (celui de l'accueil est tronqué en mobile). Formulaire GET natif : fonctionne sans JavaScript. |
| Carte de texte | catalogue, résultats | Type d'acte, année, titre normalisé, et le chemin (`CODE > CODE DE LA FAMILLE > …`) quand il existe. Le badge de type doit être **exact** : un arrêté ne porte pas « LOI ». |
| Bandeau de statut | à créer | Voir § 4. |
| Bloc de provenance | page document | Source officielle, numéro et date de JO, lien vers le PDF d'origine. C'est la preuve : il est visible sans déplier. |
| Sommaire | page document | **Hiérarchique** (livre / titre / chapitre / section), replié par défaut, avec filtre interne. La nappe plate de pastilles rend aujourd'hui 2 826 puces sur le Code civil — inutilisable, et cause directe des 1,58 Mo de la page. |
| Corps d'article | `LegalArticleBody.astro` | Source Serif, 68 ch, interlignage 1,75. Le texte est présenté en paragraphes : les retours à la ligne hérités du PDF source sont supprimés à l'affichage (le correctif de fond reste en amont, côté ingestion). |
| Puces de catégorie | partout | Terracotta sur `secondary-tint`, rayon 4 px. **Forme distincte du bandeau de statut.** |
| Boutons | partout | Plein `primary` pour l'action principale, filet `primary` pour la secondaire. **Le libellé ne casse jamais sur deux lignes** — cinq boutons du site sont aujourd'hui dans ce cas, dont le principal de `/tarifs` qui affiche « Créer un » sans son complément. Largeur dictée par le texte, `text-wrap: balance`, pas de largeur égale imposée. |
| Signalement d'erreur | à créer | Action discrète en fin d'article et en fin de document, jamais un bandeau. Voir § 9. |
| Mention d'indépendance | `Footer.astro` | Permanente, sur toutes les pages. Voir § 9. |
| Pied de page | `Footer.astro` | Vert plein. Cibles tactiles d'au moins 24 px de haut (16 liens sont aujourd'hui en dessous). |

---

## 9. Conversion

Le site est le seul canal d'acquisition organique de l'application et de l'offre pro. La conversion n'est donc pas tolérée : elle est **conçue**. Mais elle obéit à la loi 2.

### Les trois moments autorisés

1. **Après lecture** — au bas d'un article ou d'un document effectivement consulté. C'est le moment où la valeur vient d'être rendue, donc le seul où l'offre est légitime. Argument : emporter *ce* texte hors connexion, le retrouver, le partager.
2. **Devant une limite réelle** — lorsque la personne atteint ce que le site gratuit ne fait pas (recherche avancée, assistant sourcé, dossiers, suivi d'échéances). L'offre pro s'annonce **là**, en décrivant la limite avec exactitude, sans la dramatiser.
3. **En pied de page** — permanent, discret, sans insistance.

### Interdits de conversion

- Aucun interstitiel, aucune fenêtre modale à l'arrivée.
- Aucune bannière collante masquant le texte de loi.
- Aucun appel à l'action au-dessus du champ de recherche en page d'accueil.
- **Aucun compte requis pour lire.** La consultation du fonds est gratuite et le restera : c'est une position, et c'est aussi ce qui alimente le référencement qui nourrit l'acquisition.
- Aucune répétition du titre de la page comme argument final : le bloc de conversion apporte un élément neuf, sinon il ne sert à rien.

### Règle de la promesse

Héritage direct du rejet Play Store « Misleading Claims » : **tout bénéfice annoncé sur le site doit être vrai aujourd'hui dans le produit.** Pas « bientôt », pas « en cours ».

| On peut écrire | On ne peut pas écrire |
| --- | --- |
| « 1 078 textes publiés, sourcés du Journal officiel » | « Tout le droit congolais » |
| « Statut vérifié le 12 août 2026 » | « Toujours à jour » |
| « Conforme à la loi n° … du … sur les données personnelles » | « Conformité totale » |
| « Textes officiels issus de sgg.cg et ohada.org » | « Base juridique de référence certifiée » |

Les sources officielles (sgg.cg, ohada.org) sont citées sur `/methode` et `/cgu` : c'est un acquis de conformité, à préserver.

### Ce que le site dit de lui-même

Question tranchée le 17 août 2026, à partir d'une proposition de bandeau « Version Bêta » en tête de site.

**Le bandeau global d'avertissement est proscrit.** Quatre raisons :

1. **Il contredit la doctrine.** Un « bêta » permanent sur les 17 919 pages du site est une déclaration permanente de défiance envers son propre contenu. On paie une taxe de crédibilité sur l'ensemble pour avertir de défauts qui touchent des pages précises.
2. **La granularité est fausse.** Certains textes sont irréprochables — provenance JO complète, PDF d'origine joint ; d'autres sont de l'OCR dégradé. Un bandeau global sur-avertit sur les premiers et sous-avertit sur les seconds. L'instrument correct existe déjà : le **bandeau de statut par document** du § 4, dont « non vérifié » est l'état par défaut.
3. **Il exige un état utilisateur persistant.** Un bandeau refermable doit mémoriser sa fermeture (`localStorage`) — or la règle absolue du dépôt interdit tout état utilisateur persistant sur `mibeko.fr`. Un bandeau non refermable, lui, s'affiche à chaque page, décale le contenu et occupe le premier écran mobile au-dessus du champ de recherche : interdit par la loi 2.
4. **Il ne protège de rien.** La responsabilité se traite dans les CGU et les mentions légales, qui existent. Un bandeau n'ajoute que de l'inquiétude — et un « bêta » sans critère de sortie devient un aveu permanent qui autorise à ne pas corriger.

**Ce qui le remplace, en trois emplacements distincts.**

**a) Mention d'indépendance — permanente, en pied de page, sur toutes les pages.** C'est la divulgation réellement nécessaire : un service privé qui publie le droit national doit dire qu'il n'est pas l'éditeur officiel, faute de quoi il se fait passer pour une institution publique. Elle se formule en affirmant l'indépendance, jamais la petitesse — « initiative personnelle » invite le lecteur à escompter le contenu et rend l'offre professionnelle invendable.

> Mibeko est un service privé et indépendant. Il n'émane pas de l'État congolais. Seule la publication au *Journal officiel* fait foi.

**b) Signalement d'erreur — action par article, au point où l'erreur se voit.** C'est la partie la plus utile de l'idée initiale : elle transforme un défaut en contribution et ouvre un canal de curation sur tout le corpus. Elle ne prend pas la forme d'une phrase dans un encart d'avertissement, mais d'une action discrète en fin d'article et en fin de document.

> Une erreur dans ce texte ? **Signaler**
> — confirmation : « Merci. Nous comparons au *Journal officiel* et corrigeons. »

L'API existe déjà et n'est appelée par aucune surface web : `POST /api/v1/reports` est **public**, limité par le quota `reports`, et force côté serveur `source='report'` et `severity='info'` — un signalement anonyme ne peut donc jamais bloquer une publication. Charge utile : `document_id` **ou** `article_id` (au moins l'un des deux), `type_probleme` (obligatoire), `description` (facultative, 5 000 caractères).

Contraintes d'implémentation : toute nouvelle route `POST` du site doit refaire le contrôle `Origin`/`Referer` sur `ALLOWED_HOSTS`, car `security.checkOrigin` est désactivé dans `astro.config.mjs`. Une première version sans nouvelle route est possible en pointant vers `/contact` avec la référence du texte pré-remplie en paramètre — moins bien, mais livrable sans surface d'écriture supplémentaire.

**c) La provenance est une preuve, pas un avertissement.** La source officielle et le PDF d'origine ne se rangent pas dans un encart d'excuse : ils s'affichent en évidence sur la page document **et** sur la page article (loi 1).

**Si l'on veut malgré tout signaler la jeunesse du fonds**, on ne le fait pas avec le mot « bêta » — terme d'informaticien, sans traduction pour un citoyen et sans critère de fin — mais avec une **mesure datée**, qui s'améliore d'elle-même et disparaît quand le travail est fait :

> Fonds en cours de vérification : `<N>` textes publiés, `<M>` dont le statut a été contrôlé au `<date>`.

Les deux nombres sont produits par requête, jamais écrits à la main, et `<M>` compte les statuts **vérifiés**, à ne pas confondre avec le rattachement thématique. Cette ligne se place dans le bloc de provenance ou sur `/methode`, jamais en tête de page.

---

## 10. Accessibilité — plancher, pas objectif

**WCAG 2.1 niveau AA est un minimum contractuel**, pas une ambition. Le corpus s'adresse à des citoyens qui lisent au soleil, sur des écrans médiocres.

- Contraste **≥ 4,5:1** pour tout texte, ≥ 3:1 pour les grands titres et les composants d'interface. Aucune couleur de texte n'entre dans la charte sans son ratio mesuré.
- Cibles tactiles **≥ 24 × 24 px** (WCAG 2.5.8), y compris dans le fil d'Ariane et le pied de page.
- **Le site fonctionne sans JavaScript.** C'est le cas aujourd'hui — cinq formulaires natifs en GET/POST — et c'est un acquis à défendre : toute nouvelle interaction doit dégrader proprement.
- Un seul `h1` par page, hiérarchie sans saut, repères sémantiques, lien d'évitement, `lang="fr"`, alternative sur chaque image. Tous vérifiés conformes au 17 août 2026.
- `prefers-reduced-motion` respecté.

---

## 11. La performance est un matériau de design

Le public visé utilise des Android d'entrée de gamme et paie la donnée au mégaoctet. Une page qui n'arrive pas n'a pas de design.

- **Budget par page : 150 ko transférés**, HTML compressé compris. La page du Code civil en transfère aujourd'hui **1 575 104 octets non compressés** — dix fois le budget.
- Le HTML doit être servi **compressé** (`content-encoding`), et les assets à nom haché avec un cache long. Ils sont aujourd'hui en `cache-control: public, max-age=0`.
- **Aucune police supplémentaire.** Inter et Source Serif 4, et rien d'autre. Google Fonts reste le seul tiers externe du site : ne pas en ajouter un second.
- Aucune image décorative au-dessus de 100 ko ; formats modernes, dimensions déclarées.
- Toute liste longue est paginée ou repliée côté serveur. Un composant qui rend 2 826 éléments est un défaut de conception, pas un détail d'optimisation.

---

## 12. Marque, iconographie et imagerie

### L'emblème

Mibeko est un service **privé et indépendant, sans adossement institutionnel** (confirmé le 17 août 2026). L'emblème doit donc être cohérent avec cette déclaration.

- **Ne pas emprunter la grammaire visuelle de l'État.** Écu armorié, couleurs nationales disposées en drapeau, flambeau, banderole à devise : c'est le vocabulaire d'une institution publique. Un visiteur lit l'image avant de lire le pied de page — un emblème d'apparence officielle annule la mention d'indépendance du § 9, et pose une question juridique réelle, les emblèmes et drapeaux nationaux étant en général protégés. **Point à faire trancher par un juriste, pas par un designer.**
- **L'emblème actuel est dans ce cas** : bouclier armorié, vert/jaune/rouge en diagonale du drapeau congolais, flambeau, balance et banderole « LE BOUCLIER DU SAVOIR ». Il est à reprendre.
- **Lisible à 24 px.** L'emblème est affiché à 24, 32 et 40 px selon les surfaces, et sert de favicon. Tout détail invisible à cette taille n'a pas à exister.
- **Poids maximal : 20 ko.** L'actuel pèse **610 473 octets** transférés à chaque page — quatre fois le budget d'une page entière (§ 11) — parce qu'il s'agit d'une image matricielle vectorisée automatiquement en 1 715 tracés. Une marque se dessine, elle ne se décalque pas.

### La signature

**Une seule.** Le site en fait aujourd'hui coexister cinq : « Vos droits, simplifiés. » (données structurées), « Le droit congolais, clair et à portée de main » (titre d'accueil), « Vos droits, à portée de main » (bloc de conversion), « Le droit congolais, où que vous soyez » (section application) et « Le bouclier du savoir » (devise de l'emblème). Une marque qui se présente de cinq façons ne se mémorise d'aucune.

### Icônes et images

- **Icônes** monolinéaires, littérales, une seule graisse. Une balance pour la justice, un bouclier pour la protection. Pas d'illustration métaphorique.
- **Photographies** : représentation professionnelle congolaise — élégance tailleur de la Sape brazzavilloise, pagne et wax structurés — plutôt que le costume occidental générique. Cadres réels : bureaux, greffes, salles de conseil.
- **Jamais de référence à la RDC** (abacost, Kinshasa, franc congolais). Le périmètre est le Congo-Brazzaville et l'espace OHADA.
- Aucune image décorative rognée par le bord de son conteneur, comme l'illustration fantôme actuelle de la page document.

---

## 13. Arbitrages d’exécution tranchés le 17 août 2026

Le plan du portail a fait trancher les six points que la charte laissait ouverts. Les lignes datées correspondantes de `docs/decisions.md` font autorité :

- **Vitrine** : « Nouveautés du fonds », triées sur la date d’intégration et montrant celle-ci séparément de la date juridique.
- **Catalogue** : chronologie juridique décroissante, dates inconnues en dernier, puis titre officiel et UUID pour la stabilité.
- **Thèmes de vie** : pages et navigation conservées, entrée retirée de la première hiérarchie de l’accueil tant que la couverture n’est pas gouvernée ; aucun thème vide n’est rendu.
- **Prochain pas commercial** : comprendre par l’accès libre, agir par un pilote accompagné aux conditions confirmées avant engagement, travailler par une démonstration Pro ; aucun tarif fictif ni checkout simulé.
- **Emblème** : livre ouvert monolinéaire, monochrome, lisible à 16–24 px, sans écu, flambeau, balance, devise ni couleurs nationales disposées en drapeau.
- **Signature** : une seule — « Le droit congolais, clair et à portée de main ».

---

## Vérification de conformité

```bash
cd mibeko-site
npm run check                                        # types et templates
grep -roE 'rounded-(xl|2xl|3xl|full)|shadow-(sm|md|lg|xl|2xl)|blur-(2xl|3xl)' src | wc -l   # attendu : 0
grep -c -- '--color-' src/styles/global.css          # doit correspondre au frontmatter
```

Aucun chiffre de cette charte n'est à recopier à la main : les commandes ci-dessus font foi. Toute décision structurante prise sur la base de ce document appelle une ligne datée dans `docs/decisions.md` du dépôt `docs/`.
