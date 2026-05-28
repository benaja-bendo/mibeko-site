# Mibeko - Site Vitrine

Ce dépôt contient le code source du site vitrine officiel de **Mibeko**, la première plateforme d'intelligence juridique en République du Congo.

## 🚀 À propos du projet

Mibeko a pour mission de démocratiser l'accès au droit congolais grâce à l'intelligence artificielle (vectorisation sémantique, RAG) et à une application mobile accessible 100% hors-ligne. 

Ce site web sert de **Landing Page** (One-Page) pour :
- Présenter les fonctionnalités clés de l'application (Recherche IA, Mode Hors-Ligne, Alertes).
- Rediriger les utilisateurs vers les applications mobiles (App Store, Google Play).
- Expliquer la mission et la technologie derrière l'entreprise.
- Informer les différents publics (Professionnels du droit, Étudiants, Citoyens).

Le site est construit avec **[Astro](https://astro.build/)** pour garantir des performances optimales (génération de site statique par défaut, vitesse de chargement extrêmement rapide) et un SEO de premier plan.

## 📁 Structure du projet

```text
mibeko-site/
├── public/            # Ressources statiques (favicon, etc.)
├── src/
│   ├── components/    # Composants d'interface modulaires (Header, Hero, Features, About, Audience, Footer)
│   ├── layouts/       # Layouts globaux (Layout.astro incluant le CSS global et la typo Montserrat)
│   └── pages/         # Pages de l'application (index.astro rassemble tous les composants)
├── package.json       # Dépendances et scripts NPM
└── astro.config.mjs   # Configuration d'Astro
```

## 🎨 Design System

Le design est conçu pour être institutionnel, rassurant et moderne, conformément au `DESIGN.md` :
- **Couleur Dominante** : Bleu Marine (`#0A192F`, `#112240`, `#233554`) - Évoque la confiance et le sérieux.
- **Couleur d'Accentuation** : Or/Jaune (`#D4AF37`) - Symbole traditionnel de la Justice.
- **Couleurs Secondaires** : Blanc et Gris clair pour la clarté de l'interface.
- **Typographie** : Montserrat (sans-serif) - Rendu moderne et excellente lisibilité sur écran.

## 🧞 Commandes utiles

Toutes les commandes doivent être exécutées depuis le répertoire `mibeko-site`.

| Commande                  | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installe les dépendances du projet               |
| `npm run dev`             | Lance le serveur de développement local (`localhost:4321`) |
| `npm run build`           | Construit le site optimisé pour la production dans `./dist/` |
| `npm run preview`         | Prévisualise le build de production en local     |

## 🌍 Déploiement

Le site généré par la commande `npm run build` est entièrement statique. Les fichiers générés dans le dossier `dist/` peuvent être déployés sur n'importe quel hébergeur (Nginx, Apache, Vercel, Netlify, Cloudflare Pages). Le domaine principal cible de la production est `mibeko.fr` / `mibeko.cg`.
