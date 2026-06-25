import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Guides éditoriaux (`/ressources`).
 *
 * Couche de contenu locale (markdown) : chaque guide est un fichier dans
 * `src/content/guides/`. Le schéma est typé/validé au build. C'est volontairement
 * découplé du fonds juridique (servi par l'API) : un guide explique en langage
 * clair et **renvoie** vers les textes officiels via `fondsQuery` (recherche du
 * fonds) — la rédaction reste éditoriale et révisable par un juriste.
 */
const guides = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/guides' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      category: z.string(),
      publishedDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      cover: image().optional(),
      draft: z.boolean().default(false),
      featured: z.boolean().default(false),
      // Requête pré-remplie vers la recherche du fonds (« pour aller plus loin »).
      fondsQuery: z.string().optional(),
    }),
});

/**
 * Démarches (`/demarches`) — le pas-à-pas « comment faire X au Congo ».
 *
 * Troisième pilier de contenu (à côté du fonds et des guides) : une démarche
 * décrit une suite d'**étapes** structurées (frontmatter `steps`), rendues en
 * parcours guidé. 100 % éditable (markdown), évolutif : la même donnée pourra
 * alimenter un suivi dans l'app (dossier + rappels). Contenu à faire valider
 * par un juriste — éviter les chiffres/délais non vérifiés.
 */
const demarches = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/demarches' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      category: z.string(),
      audience: z.enum(['citoyen', 'entreprise', 'professionnel']).default('citoyen'),
      publishedDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      cover: image().optional(),
      draft: z.boolean().default(false),
      featured: z.boolean().default(false),
      fondsQuery: z.string().optional(),
      steps: z
        .array(
          z.object({
            title: z.string(),
            description: z.string(),
            documents: z.array(z.string()).default([]),
            law: z.object({ label: z.string(), query: z.string() }).optional(),
            tip: z.string().optional(),
          }),
        )
        .min(1),
    }),
});

export const collections = { guides, demarches };
