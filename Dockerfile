# --- Étape 1 : Build ---
FROM node:22-alpine AS build

WORKDIR /app

# Optimisation du cache des calques Docker pour les dépendances
COPY package.json package-lock.json ./
RUN npm ci

# Copie du reste du code source
COPY . .

# Build du site statique
RUN npm run build

# --- Étape 2 : Runtime ---
FROM nginx:1.27-alpine

# Configuration Nginx optimisée pour Astro
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf

# Copie des fichiers générés depuis l'étape de build
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# Nginx démarre par défaut via l'image de base
