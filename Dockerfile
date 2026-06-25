# --- Étape 1 : Build ---
FROM node:22-alpine AS build

WORKDIR /app

# Optimisation du cache des calques Docker pour les dépendances
COPY package.json package-lock.json ./
RUN npm ci

# Copie du reste du code source
COPY . .

# Build SSR (adapter @astrojs/node, mode standalone)
# → produit dist/server/entry.mjs (serveur Node) + dist/client (assets)
RUN npm run build

# --- Étape 2 : Dépendances de production uniquement ---
FROM node:22-alpine AS deps

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# --- Étape 3 : Runtime ---
FROM node:22-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production
# Le serveur standalone d'Astro lit HOST/PORT ; 0.0.0.0 pour être joignable
# depuis Traefik. MIBEKO_API_URL est injecté au runtime (cf. docker-compose).
ENV HOST=0.0.0.0
ENV PORT=4321

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./

EXPOSE 4321

CMD ["node", "./dist/server/entry.mjs"]
