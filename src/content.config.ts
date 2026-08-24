import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import type { RefinementCtx } from 'zod';

const editorialFields = {
  author: z.string().min(1),
  reviewStatus: z.enum(['a_relire', 'relu']),
  reviewer: z.string().min(1).optional(),
  reviewedDate: z.coerce.date().optional(),
  sources: z
    .array(
      z.object({
        title: z.string().min(1),
        url: z.string().url(),
      }),
    )
    .min(1),
};

const requireCompletedReview = (
  data: { reviewStatus: 'a_relire' | 'relu'; reviewer?: string; reviewedDate?: Date },
  ctx: RefinementCtx,
) => {
  if (data.reviewStatus !== 'relu') return;

  if (!data.reviewer) {
    ctx.addIssue({ code: 'custom', path: ['reviewer'], message: 'Un contenu relu doit nommer son relecteur.' });
  }
  if (!data.reviewedDate) {
    ctx.addIssue({ code: 'custom', path: ['reviewedDate'], message: 'Un contenu relu doit dater sa relecture.' });
  }
};

/**
 * Guides éditoriaux (`/ressources`).
 *
 * Couche de contenu locale (markdown) : chaque guide est un fichier dans
 * `src/content/guides/`. Le schéma est typé/validé au build. C'est volontairement
 * découplé du fonds juridique (servi par l'API) : un guide explique en langage
 * clair et **renvoie directement** vers un texte du fonds (`fondsSlug`) ou une
 * source structurée — la rédaction reste éditoriale et révisable par un juriste.
 */
const guides = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/guides' }),
  schema: ({ image }) =>
    z.object({
      ...editorialFields,
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
      // Lien DIRECT vers un texte du fonds (slug d'un document publié) quand le
      // guide porte sur un texte précis. Mapping factuel vérifié à la main ;
      // sinon le pont utilise la première `source`. Ne renseigner qu'un
      // slug réellement publié (sinon lien mort → garder undefined).
      fondsSlug: z.string().optional(),
    }).superRefine(requireCompletedReview),
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
      ...editorialFields,
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
      // Lien direct vers un texte du fonds (slug publié), cf. commentaire côté
      // guides. Fallback recherche si absent.
      fondsSlug: z.string().optional(),
      officialDestination: z.object({ title: z.string().min(1), url: z.string().url() }).optional(),
      // Présence = cette démarche propose le pilote accompagné (paiement
      // ponctuel, périmètre/délai/coût confirmés avant engagement — jamais un
      // service automatisé). Absence = aucun encart en fin de page. Décision
      // du 18/08 : le pilote se propose après le service rendu (fin de
      // démarche), jamais dans une grille tarifaire.
      pilotPitch: z.string().min(1).optional(),
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
    }).superRefine(requireCompletedReview),
});

export const collections = { guides, demarches };
