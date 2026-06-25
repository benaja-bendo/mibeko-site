/**
 * Client de l'API Mibeko pour le site vitrine.
 *
 * Le site consomme la lecture publique du fonds juridique (mêmes endpoints que
 * le mobile et le pro). Base configurable via la variable d'environnement
 * `MIBEKO_API_URL` ; défaut = production.
 */
import { sanitizeLegalText } from './sanitize';
// Runtime (process.env, SSR Node — configurable sans rebuild) prioritaire sur
// le build-time (import.meta.env), puis défaut production.
const runtimeApiUrl = (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } })
  .process?.env?.MIBEKO_API_URL;
const API_BASE = (runtimeApiUrl ?? import.meta.env.MIBEKO_API_URL ?? 'https://api.mibeko.fr/api/v1').replace(/\/$/, '');

export interface DocumentTheme {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
}

export interface DocumentMeta {
  id: string;
  slug: string;
  titre_officiel: string;
  title: string;
  reference_nor: string | null;
  type_code: string | null;
  legal_scope: string;
  date_publication: string | null;
  date_signature: string | null;
  institution?: { nom?: string; sigle?: string } | null;
  type?: { code: string; name: string } | null;
  official_journal?: { id: string; title: string; publication_date: string | null } | null;
  themes?: DocumentTheme[];
}

export interface ArticleIndexItem {
  id: string;
  number: string;
  order: number;
}

export interface RelatedText {
  type: string;
  document_slug: string;
  document_title: string;
  article_number: string | null;
  comment: string | null;
}

export interface CurrentArticle {
  id: string;
  number: string;
  order: number;
  content: string | null;
  related?: RelatedText[];
}

export interface PublicDocument {
  document: DocumentMeta;
  articles: ArticleIndexItem[];
  current_article: CurrentArticle | null;
}

interface Envelope<T> {
  success: boolean;
  message: string | null;
  data: T;
}

/**
 * Récupère un document publié par son slug. Optionnellement le texte intégral
 * d'un article (par numéro). Renvoie `null` sur 404 (document absent ou non
 * publié) ; lève sur les autres erreurs pour que le rendu renvoie un 5xx
 * (Google réessaiera plutôt que de désindexer la page).
 */
export async function fetchPublicDocument(
  slug: string,
  articleNumber?: string,
): Promise<PublicDocument | null> {
  const url = new URL(`${API_BASE}/legal-documents/slug/${encodeURIComponent(slug)}`);
  if (articleNumber) {
    url.searchParams.set('article', articleNumber);
  }

  const res = await fetch(url, { headers: { Accept: 'application/json' } });

  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`API ${res.status} sur le document « ${slug} »`);
  }

  const json = (await res.json()) as Envelope<PublicDocument>;
  const data = json.data;

  // Assainit le texte de l'article (artefacts LaTeX/OCR de l'ingestion) à la
  // source : profite au corps rendu comme au texte SEO (description + JSON-LD),
  // tous deux dérivés de `current_article.content`.
  if (data.current_article) {
    data.current_article.content = sanitizeLegalText(data.current_article.content);
  }

  return data;
}

/**
 * Liste les documents publiés du fonds (catalogue `/codes`). Non paginé pour
 * l'instant (limité à `perPage`) ; à paginer quand le fonds grandira.
 */
export async function fetchPublishedDocuments(perPage = 100, sort = 'titre_officiel'): Promise<DocumentMeta[]> {
  const url = new URL(`${API_BASE}/legal-documents`);
  url.searchParams.set('filter[curation_status]', 'published');
  url.searchParams.set('sort', sort);
  url.searchParams.set('per_page', String(perPage));

  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    throw new Error(`API ${res.status} sur le catalogue`);
  }

  const json = (await res.json()) as Envelope<DocumentMeta[]>;
  // Garde-fou : ne renvoie que les documents adressables (slug présent), pour
  // ne jamais générer de lien `/codes/undefined` (ex. API pas encore migrée).
  return json.data.filter((doc) => Boolean(doc.slug));
}

export interface SitemapEntry {
  slug: string;
  updated_at: string | null;
  articles: string[];
}

/**
 * Plan compact du fonds publié (documents + numéros d'articles) pour générer le
 * `sitemap.xml`. Une seule requête côté API (mise en cache serveur).
 */
export async function fetchSitemap(): Promise<SitemapEntry[]> {
  const res = await fetch(`${API_BASE}/sitemap`, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    throw new Error(`API ${res.status} sur le sitemap`);
  }
  const json = (await res.json()) as Envelope<SitemapEntry[]>;
  return json.data;
}

export interface LibrarySearchResult {
  id: string;
  number: string;
  content: string | null;
  document_id: string;
  document_slug: string | null;
  document_title: string;
  breadcrumb: string;
}

/**
 * Recherche plein-texte publique dans le fonds (`library/search`). Renvoie la
 * 1ʳᵉ page de résultats, texte assaini. Le `q` doit faire ≥ 2 caractères (le
 * back l'exige) — à filtrer côté appelant.
 */
export async function fetchLibrarySearch(query: string, perPage = 20): Promise<LibrarySearchResult[]> {
  const url = new URL(`${API_BASE}/library/search`);
  url.searchParams.set('q', query);
  url.searchParams.set('per_page', String(perPage));

  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    throw new Error(`API ${res.status} sur la recherche`);
  }

  const json = (await res.json()) as Envelope<LibrarySearchResult[]>;
  return json.data.map((result) => ({ ...result, content: sanitizeLegalText(result.content) }));
}

export interface ThemeSummary {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  documents_count: number;
}

export interface ThemeDocument {
  id: string;
  slug: string | null;
  title: string;
  type_code: string | null;
  type_name: string | null;
  legal_scope: string;
  date_publication: string | null;
  articles_count: number;
}

export interface ThemeDetail {
  theme: { id: string; name: string; slug: string; icon: string | null; description: string | null };
  documents: ThemeDocument[];
}

/** Thèmes de vie (taxonomie éditoriale) + nombre de textes publiés rattachés. */
export async function fetchThemes(): Promise<ThemeSummary[]> {
  const res = await fetch(`${API_BASE}/library/themes`, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    throw new Error(`API ${res.status} sur les thèmes`);
  }
  return ((await res.json()) as Envelope<ThemeSummary[]>).data;
}

/** Textes publiés rattachés à un thème (parcours par situation). */
export async function fetchThemeDocuments(slug: string): Promise<ThemeDetail | null> {
  const res = await fetch(`${API_BASE}/library/themes/${encodeURIComponent(slug)}`, { headers: { Accept: 'application/json' } });
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`API ${res.status} sur le thème « ${slug} »`);
  }
  return ((await res.json()) as Envelope<ThemeDetail>).data;
}

/** Construit le chemin d'un thème de vie. */
export function themePath(slug: string): string {
  return `/themes/${slug}`;
}

export interface ContactPayload {
  name: string;
  email: string;
  profile?: string;
  message: string;
}

/** Relaie un message de contact à l'API (appel serveur-à-serveur, pas de CORS). */
export async function submitContact(payload: ContactPayload): Promise<{ ok: boolean; status: number }> {
  const res = await fetch(`${API_BASE}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  return { ok: res.ok, status: res.status };
}

/** Construit le chemin canonique d'un document. */
export function documentPath(slug: string): string {
  return `/codes/${slug}`;
}

/** Construit le chemin canonique d'un article. */
export function articlePath(slug: string, number: string): string {
  return `/codes/${slug}/article-${encodeURIComponent(number)}`;
}
