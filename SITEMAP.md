# 🗺️ Sitemap Mibeko Site

## Structure Recommandée

```
mibeko.app (ou votre domaine)
├── /                          [Page d'accueil]
│   └── CTA principal vers /produits
├── /produits                  [Hub central — Nos produits]
│   ├── #mobile                → Application Mobile (Grand public)
│   └── #pro                   → Plateforme Pro (Professionnels & Administrateurs)
├── /ressources                [Blog, guides, FAQ]
│   ├── /ressources/blog
│   ├── /ressources/guides
│   └── /ressources/faq
├── /contact                   [Formulaire de contact]
├── /mentions-legales          [Légal]
├── /confidentialite           [RGPD]
└── /cgu                       [Conditions d'utilisation]
```

## Logique de Navigation

### 1️⃣ Page d'Accueil (`/`)
- **Contenu :** Positioning général Mibeko, promesse, viralité
- **CTA primaire :** "Découvrir l'App Mobile" → `/produits#mobile`
- **CTA secondaire :** "Découvrir la Plateforme Pro" → `/produits#pro`
- **Public :** Grand public et professionnels

### 2️⃣ Produits (`/produits`) — HUB CENTRAL
- **Rôle :** Montre les produits mis à disposition par Mibeko
- **Sections ancrées :**
  - `#mobile` — Application Mobile (pour les citoyens)
  - `#pro` — Plateforme Pro (pour les professionnels et l'administration)
- **CTA :** Boutons vers les téléchargements, les essais ou `/contact`
- **Public :** Tous les segments

### 3️⃣ Ressources (`/ressources`)
- **Sous-sections futures :**
  - `/blog` — Actualités juridiques, cas d'usage
  - `/guides` — Guide utilisateur Mibeko, tutoriels
  - `/faq` — Questions fréquentes
- **Public :** Tous (SEO friendly)

### 4️⃣ Contact (`/contact`)
- **Rôle :** Formulaire d'accès bêta, démos, support
- **Linked from :** Chaque page via CTA

### 5️⃣ Légal
- `/mentions-legales` — CNIL, SARL info
- `/confidentialite` — RGPD, traitements de données
- `/cgu` — Conditions d'utilisation, responsabilités

---

## Hiérarchie des CTAs par Page

| Page | CTA Primaire | CTA Secondaire |
|------|---|---|
| `/` | "Découvrir l'App" → `/produits#mobile` | "Découvrir la Plateforme" → `/produits#pro` |
| `/produits` | "Commencer" → `/contact` | Spécifique par produit |
| `/ressources` | "Plus d'articles" (interne) | "Voir nos produits" → `/produits` |
| `/contact` | Form submit → Thank you | Return → `/` |

---

## Points Clés

1. **`/produits` est le hub** — Tous les visiteurs y découvrent l'écosystème Mibeko
2. **Clarification par produit** — L'App Mobile pour le grand public, la Plateforme Pro pour les experts
3. **Navigation claire** — Chaque produit a ses CTAs ciblés
4. **Mobile-first** — Sections à scroller
5. **SEO** — `/produits` et `/ressources` sont les pages ranking
