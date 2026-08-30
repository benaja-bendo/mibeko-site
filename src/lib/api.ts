/**
 * Client de l'API Mibeko pour le site vitrine.
 *
 * Le site consomme la lecture publique du fonds juridique (mêmes endpoints que
 * le mobile et le pro). Base configurable via la variable d'environnement
 * `MIBEKO_API_URL` ; défaut = production.
 */
import { sanitizeLegalText } from './sanitize';
import type { ApiTable } from './tables';
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
  /**
   * Objet de l'acte DÉRIVÉ de son corps, pour les intitulés que le Journal
   * officiel réduit au type, au numéro et à la date (« actes en abrégé » :
   * « Décret n° 2025-240 du 20 juin 2025. »). Ces intitulés sont fidèles à la
   * source — c'est le JO qui n'imprime aucun objet, il n'y a rien à corriger.
   *
   * À AFFICHER À CÔTÉ DU TITRE OFFICIEL, JAMAIS À SA PLACE : utiliser
   * `documentLineLabel()` (`src/lib/sanitize.ts`) plutôt que de choisir.
   * Optionnel tant que tous les environnements n'exposent pas le champ.
   */
  libelle_descriptif?: string | null;
  reference_nor: string | null;
  type_code: string | null;
  legal_scope: string;
  /** Statut juridique (« vigueur », « abrogé »…) exposé par l'API. */
  statut?: string | null;
  /**
   * Vrai si un éditeur a réellement établi ce statut. `statut` vaut « vigueur »
   * par défaut en base : sans cette confirmation, il répète le défaut au lieu
   * d'affirmer quoi que ce soit. Optionnel tant que tous les environnements
   * n'exposent pas le champ.
   */
  statut_verifie?: boolean;
  /** Date à laquelle le statut a été vérifié, si elle l'a été. */
  statut_verifie_le?: string | null;
  date_publication: string | null;
  date_signature: string | null;
  date_entree_vigueur: string | null;
  /**
   * Date à laquelle Mibeko a arrêté cette version consolidée du texte. C'est
   * la seule notion de « version » que le fonds porte réellement : il n'existe
   * aucun historique de versions antérieures publiable.
   */
  consolidation_as_of?: string | null;
  /** Date d’intégration dans le fonds, distincte de la date juridique. */
  created_at?: string | null;
  updated_at?: string | null;
  /** Nombre d'articles publiés (présent sur la liste `legal-documents`). */
  articles_count?: number | null;
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
  /** Feuille spéciale : `preamble`, `signature`, `table`. Null pour un article ordinaire. */
  content_format?: string | null;
  /** Tableaux structurés portés par l'article (cf. `lib/tables.ts`). */
  tables?: ApiTable[];
  /**
   * Page du PDF source où cet article a été trouvé (marqueurs
   * `[[MIBEKO_PAGE:N]]` posés par l'ingestion). C'est la seule provenance
   * disponible à l'échelle de l'article — et la seule qui soit exacte : la
   * borne basse de `validity_period` vaut la date d'ingestion, pas une date
   * juridique, et ne peut donc jamais être affichée comme telle.
   */
  page?: number | null;
  related?: RelatedText[];
}

/** Référence légère d'un article dans le sommaire (numéro seul, sans texte). */
export interface StructureArticleRef {
  number: string;
  order: number;
}

/** Nœud de structure brut (à plat) renvoyé par l'API. */
export interface StructureNodeRaw {
  id: string;
  parent_id: string | null;
  type: string | null;
  number: string | null;
  title: string | null;
  order: number;
  articles: StructureArticleRef[];
}

export interface PublicStructure {
  nodes: StructureNodeRaw[];
  orphan_articles: StructureArticleRef[];
}

/** Nœud de sommaire imbriqué (reconstruit côté client par {@link buildTree}). */
export interface TreeNode {
  id: string;
  type: string | null;
  number: string | null;
  title: string | null;
  order: number;
  articles: StructureArticleRef[];
  children: TreeNode[];
}

/** Un maillon du fil d'une division : « LIVRE 1 », « CHAPITRE 2 — De la capacité ». */
export interface SectionPathPart {
  type: string | null;
  number: string | null;
  title: string | null;
}

/** Article servi avec son texte à l'intérieur d'une division. */
export interface SectionArticle {
  id: string;
  number: string;
  order: number;
  content: string | null;
  content_format?: string | null;
  tables?: ApiTable[];
  /** Page du PDF source (voir {@link CurrentArticle.page}). */
  page?: number | null;
}

/** Division voisine (navigation de lecture). */
export interface SectionRef {
  id: string | null;
  path: SectionPathPart[];
}

/**
 * Texte d'une division entière (`?section=`), pour la lecture continue.
 * `id` vaut `null` quand les articles pendent directement au document (actes
 * courts sans structure). `truncated` signale que la division dépassait le
 * plafond de caractères de l'API : les articles restants sont accessibles par
 * leur page propre.
 */
export interface PublicSection {
  id: string | null;
  path: SectionPathPart[];
  articles: SectionArticle[];
  total_articles: number;
  truncated: boolean;
  previous: SectionRef | null;
  next: SectionRef | null;
}

export interface PublicDocument {
  document: DocumentMeta;
  articles: ArticleIndexItem[];
  structure?: PublicStructure;
  has_pdf?: boolean;
  current_article: CurrentArticle | null;
  /**
   * Absent tant que `?section=` n'est pas demandé — et absent aussi tant que
   * l'API n'a pas été déployée avec cette évolution. Les pages doivent donc
   * toujours prévoir le repli, jamais supposer sa présence.
   */
  section?: PublicSection | null;
}

interface Envelope<T> {
  success: boolean;
  message: string | null;
  data: T;
}

interface PaginatedEnvelope<T> extends Envelope<T> {
  pagination?: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

export interface PaginationMeta {
  total: number;
  perPage: number;
  currentPage: number;
  lastPage: number;
}

/**
 * Récupère un document publié par son slug. Optionnellement le texte intégral
 * d'un article (par numéro) et/ou celui d'une division entière (`section` :
 * `first`, `auto` — celle de l'article demandé — ou un identifiant de nœud).
 * Renvoie `null` sur 404 (document absent ou non
 * publié) ; lève sur les autres erreurs pour que le rendu renvoie un 5xx
 * (Google réessaiera plutôt que de désindexer la page).
 */
export async function fetchPublicDocument(
  slug: string,
  articleNumber?: string,
  section?: 'first' | 'auto' | (string & {}),
): Promise<PublicDocument | null> {
  const url = new URL(`${API_BASE}/legal-documents/slug/${encodeURIComponent(slug)}`);
  if (articleNumber) {
    url.searchParams.set('article', articleNumber);
  }
  if (section) {
    url.searchParams.set('section', section);
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

  // Même traitement pour la division servie en lecture continue : c'est le
  // même texte, il ne doit pas être assaini d'un côté et brut de l'autre.
  if (data.section?.articles) {
    for (const article of data.section.articles) {
      article.content = sanitizeLegalText(article.content);
    }
  }

  return data;
}

export interface DocumentListFilters {
  /** Code du type de texte (CODE, LOI, ARRETE, DECRET…). */
  type?: string;
  /** Périmètre juridique (national, ohada, communautaire). */
  scope?: string;
  /** Année de publication minimale (incluse). */
  yearFrom?: number;
  /** Année de publication maximale (incluse). */
  yearTo?: number;
  /** Champ de tri (préfixe `-` pour décroissant). */
  sort?: string;
  /**
   * Filtre par titre (`AllowedFilter::partial('titre_officiel')` côté API) —
   * mode « Textes » du fonds fusionné : trouve les documents dont le titre
   * contient la requête, sans passer par le moteur de recherche d'articles.
   */
  titleQuery?: string;
  page?: number;
  perPage?: number;
}

export interface DocumentListResult {
  items: DocumentMeta[];
  meta: PaginationMeta;
}

/**
 * Liste paginée et filtrée des documents publiés du fonds (catalogue `/textes`).
 * Les filtres (type, périmètre, années) et la pagination sont délégués à l'API
 * (`allowedFilters` côté Laravel). Le tri par défaut place les dates
 * juridiques les plus récentes en tête et les dates inconnues à la fin.
 */
export async function fetchPublishedDocuments(filters: DocumentListFilters = {}): Promise<DocumentListResult> {
  const { type, scope, yearFrom, yearTo, sort = '-date_publication', titleQuery, page = 1, perPage = 24 } = filters;

  const url = new URL(`${API_BASE}/legal-documents`);
  url.searchParams.set('filter[curation_status]', 'published');
  if (type) url.searchParams.set('filter[type_code]', type);
  if (scope) url.searchParams.set('filter[legal_scope]', scope);
  if (yearFrom) url.searchParams.set('filter[date_from]', `${yearFrom}-01-01`);
  if (yearTo) url.searchParams.set('filter[date_to]', `${yearTo}-12-31`);
  if (titleQuery) url.searchParams.set('filter[titre_officiel]', titleQuery);
  url.searchParams.set('sort', sort);
  url.searchParams.set('per_page', String(perPage));
  url.searchParams.set('page', String(page));

  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    throw new Error(`API ${res.status} sur le catalogue`);
  }

  const json = (await res.json()) as PaginatedEnvelope<DocumentMeta[]>;
  const p = json.pagination;
  return {
    // Garde-fou : ne renvoie que les documents adressables (slug présent), pour
    // ne jamais générer de lien `/textes/undefined` (ex. doc ingéré sans slug).
    items: json.data.filter((doc) => Boolean(doc.slug)),
    meta: {
      total: p?.total ?? json.data.length,
      perPage: p?.per_page ?? perPage,
      currentPage: p?.current_page ?? page,
      lastPage: p?.last_page ?? 1,
    },
  };
}

export interface DocumentTypeOption {
  code: string;
  name: string;
}

/**
 * Types de texte du référentiel, pour alimenter le filtre « type » de `/textes`.
 * Best-effort : renvoie `[]` en cas d'erreur (le filtre disparaît, la page reste).
 */
export async function fetchDocumentTypes(): Promise<DocumentTypeOption[]> {
  try {
    const res = await fetch(`${API_BASE}/document-types`, { headers: { Accept: 'application/json' } });
    if (!res.ok) return [];
    const json = (await res.json()) as Envelope<Array<{ code: string; nom?: string; name?: string }>>;
    return json.data
      .map((t) => ({ code: t.code, name: t.name ?? t.nom ?? t.code }))
      .filter((t) => Boolean(t.code));
  } catch {
    return [];
  }
}

/**
 * Reconstruit l'arbre imbriqué (sommaire) à partir de la structure plate de
 * l'API. Les nœuds racine et les articles orphelins sont fusionnés et triés
 * par `order` pour respecter l'ordre d'affichage (préambule en tête, etc.).
 */
export function buildTree(structure?: PublicStructure): TreeNode[] {
  if (!structure) return [];

  const byId = new Map<string, TreeNode>();
  for (const node of structure.nodes) {
    byId.set(node.id, { ...node, children: [] });
  }

  const roots: TreeNode[] = [];
  for (const node of structure.nodes) {
    const current = byId.get(node.id)!;
    const parent = node.parent_id ? byId.get(node.parent_id) : null;
    if (parent) {
      parent.children.push(current);
    } else {
      roots.push(current);
    }
  }

  // Articles rattachés directement au document (actes courts sans structure) :
  // on les expose comme nœuds-feuilles « article » au niveau racine.
  for (const article of structure.orphan_articles) {
    roots.push({
      id: `orphan-${article.number}`,
      type: 'ARTICLE',
      number: article.number,
      title: null,
      order: article.order,
      articles: [article],
      children: [],
    });
  }

  const sortRec = (nodes: TreeNode[]): TreeNode[] => {
    nodes.sort((a, b) => a.order - b.order);
    for (const n of nodes) sortRec(n.children);
    return nodes;
  };

  // Élague les nœuds de structure vides (ni article, ni enfant) : un nœud de
  // section sans contenu n'est jamais navigable, seulement trompeur — par
  // exemple un titre corrompu par une extraction qui a mal isolé une section
  // (un fragment de texte pris pour un titre), sans article rattaché.
  const pruneEmpty = (nodes: TreeNode[]): TreeNode[] =>
    nodes
      .map((n) => ({ ...n, children: pruneEmpty(n.children) }))
      .filter((n) => n.type === 'ARTICLE' || n.articles.length > 0 || n.children.length > 0);

  return pruneEmpty(sortRec(roots));
}

/**
 * Articles d'une division ET de toutes ses sous-divisions, dans l'ordre de
 * lecture (les articles propres d'un nœud précèdent ceux de ses enfants —
 * c'est l'ordre que l'API produit par parcours en profondeur).
 *
 * Sert au sommaire : une division est un point de lecture, elle a donc besoin
 * d'un premier article (cible du lien) et d'une plage à afficher. Un LIVRE ne
 * porte souvent aucun article en propre — tout est dans ses chapitres.
 */
export function subtreeArticles(node: TreeNode): StructureArticleRef[] {
  const own = [...node.articles].sort((a, b) => a.order - b.order);
  // Un nœud « ARTICLE » (feuille orpheline) se porte lui-même.
  if (node.type === 'ARTICLE' && node.number && own.length === 0) {
    return [{ number: node.number, order: node.order }];
  }

  return [...own, ...node.children.flatMap(subtreeArticles)];
}

/** Compte les nœuds de structure « division » (hors articles), récursivement. */
export function countStructureDivisions(nodes: TreeNode[]): number {
  let count = 0;
  for (const node of nodes) {
    if (node.type !== 'ARTICLE') count += 1;
    count += countStructureDivisions(node.children);
  }
  return count;
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
  canonical_number: string;
  has_duplicate_suffix: boolean;
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
 *
 * Usage étroit : uniquement `api/suggest.ts` (autocomplétion). La page
 * `/textes` (mode « Articles ») utilise `fetchLibrarySearchPage` ci-dessous,
 * qui partage les mêmes filtres et la même pagination que le catalogue.
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

export interface LibrarySearchFilters {
  type?: string;
  scope?: string;
  yearFrom?: number;
  yearTo?: number;
  /** Vocabulaire propre au moteur de recherche (distinct du tri du catalogue). */
  sort?: 'relevance' | 'date_desc' | 'date_asc';
  page?: number;
  perPage?: number;
}

export interface LibrarySearchPageResult {
  items: LibrarySearchResult[];
  meta: PaginationMeta;
}

/**
 * Recherche plein-texte paginée et filtrée (mode « Articles » de `/textes`).
 * Ne passe jamais `semantic=1` : le rappel sémantique reste opt-in côté API
 * (mibeko-dashboard#50) pour garder une réponse interactive par défaut.
 */
export async function fetchLibrarySearchPage(
  query: string,
  filters: LibrarySearchFilters = {},
): Promise<LibrarySearchPageResult> {
  const { type, scope, yearFrom, yearTo, sort = 'relevance', page = 1, perPage = 12 } = filters;

  const url = new URL(`${API_BASE}/library/search`);
  url.searchParams.set('q', query);
  if (type) url.searchParams.set('type', type);
  if (scope) url.searchParams.set('legal_scope', scope);
  if (yearFrom) url.searchParams.set('date_from', `${yearFrom}-01-01`);
  if (yearTo) url.searchParams.set('date_to', `${yearTo}-12-31`);
  url.searchParams.set('sort', sort);
  url.searchParams.set('per_page', String(perPage));
  url.searchParams.set('page', String(page));

  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    throw new Error(`API ${res.status} sur la recherche`);
  }

  const json = (await res.json()) as PaginatedEnvelope<LibrarySearchResult[]>;
  const p = json.pagination;
  return {
    items: json.data.map((result) => ({ ...result, content: sanitizeLegalText(result.content) })),
    meta: {
      total: p?.total ?? json.data.length,
      perPage: p?.per_page ?? perPage,
      currentPage: p?.current_page ?? page,
      lastPage: p?.last_page ?? 1,
    },
  };
}

/**
 * Recherche plein-texte RESTREINTE à un document (rail « Rechercher dans ce
 * texte » de la page document).
 *
 * Le filtre `document_id` existe déjà côté API — aucune surface web ne s'en
 * servait. Best-effort : une erreur du moteur renvoie une liste vide plutôt
 * que de faire tomber une page qui, sans la recherche, reste parfaitement
 * lisible. Le back exige `q` ≥ 2 caractères : à filtrer côté appelant.
 */
export async function fetchDocumentSearch(
  documentId: string,
  query: string,
  perPage = 20,
): Promise<LibrarySearchPageResult> {
  const empty: LibrarySearchPageResult = {
    items: [],
    meta: { total: 0, perPage, currentPage: 1, lastPage: 1 },
  };

  if (query.trim().length < 2) return empty;

  const url = new URL(`${API_BASE}/library/search`);
  url.searchParams.set('q', query.trim());
  url.searchParams.set('document_id', documentId);
  url.searchParams.set('sort', 'relevance');
  url.searchParams.set('per_page', String(perPage));

  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return empty;

    const json = (await res.json()) as PaginatedEnvelope<LibrarySearchResult[]>;
    const p = json.pagination;
    return {
      items: json.data.map((result) => ({ ...result, content: sanitizeLegalText(result.content) })),
      meta: {
        total: p?.total ?? json.data.length,
        perPage: p?.per_page ?? perPage,
        currentPage: p?.current_page ?? 1,
        lastPage: p?.last_page ?? 1,
      },
    };
  } catch {
    return empty;
  }
}

export interface ReportPayload {
  documentId?: string;
  articleId?: string;
  problemType: string;
  description?: string;
}

/**
 * Signalement public d'une erreur dans un texte (`POST /reports`).
 *
 * L'endpoint est public, limité par le quota `reports`, et force côté serveur
 * `source='report'` + `severity='info'` : un signalement anonyme ne peut donc
 * jamais bloquer une publication. Appel serveur-à-serveur depuis la route
 * Astro, qui refait elle-même le contrôle d'origine.
 */
export async function submitReport(payload: ReportPayload): Promise<{ ok: boolean; status: number }> {
  const res = await fetch(`${API_BASE}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      document_id: payload.documentId,
      article_id: payload.articleId,
      type_probleme: payload.problemType,
      description: payload.description,
    }),
  });
  return { ok: res.ok, status: res.status };
}

export interface ThemeSummary {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  documents_count: number;
}

export interface EssentialDocument {
  id: string;
  slug: string;
  title: string;
  type_code: string | null;
  type_name: string | null;
  legal_scope: string;
  date_publication: string | null;
  articles_count: number;
}

export interface LibraryFundStats {
  documents: number;
  articles: number;
  latestLegalPublicationDate: string | null;
  /** Petite sélection de textes fondamentaux, choisie côté API (`library/home`). */
  essentialDocuments: EssentialDocument[];
}

/**
 * Compteurs publics du fonds affichés sur le premier écran. Les valeurs sont
 * produites par l'API et ne doivent jamais être recopiées en dur dans le site.
 */
export async function fetchLibraryFundStats(): Promise<LibraryFundStats> {
  const res = await fetch(`${API_BASE}/library/home`, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    throw new Error(`API ${res.status} sur les statistiques du fonds`);
  }

  const json = (await res.json()) as Envelope<{
    stats: { documents: number; articles: number };
    recent_documents: Array<{ date_publication?: string | null }>;
    essential_documents: EssentialDocument[];
  }>;

  return {
    documents: json.data.stats.documents,
    articles: json.data.stats.articles,
    latestLegalPublicationDate: json.data.recent_documents[0]?.date_publication ?? null,
    essentialDocuments: json.data.essential_documents ?? [],
  };
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
  // Défense côté consommateur : une taxonomie vide peut être recréée ou un
  // cache API ancien peut survivre quelques minutes. Elle ne doit jamais
  // devenir une destination publique sans texte publié.
  return ((await res.json()) as Envelope<ThemeSummary[]>).data.filter((theme) => theme.documents_count > 0);
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

/**
 * Construit le chemin d'un thème de vie. Le concept API reste « thèmes »
 * (`/library/themes`) ; seule l'URL publique a été renommée en `/situations`
 * le 18/08/2026 (« par votre situation » plutôt que le mot base de données).
 */
export function themePath(slug: string): string {
  return `/situations/${slug}`;
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

export interface NewsletterPayload {
  email: string;
  source?: string;
}

/**
 * Inscrit une adresse à la newsletter via l'API (`POST /newsletter-subscriptions`).
 * Contrat : 204 (ok, idempotent), 422 (e-mail invalide). Appel serveur-à-serveur
 * (relais SSR), donc pas de CORS. On expose le statut brut pour distinguer
 * « déjà inscrit » (204 idempotent) d'une erreur de validation (422).
 */
export async function submitNewsletter(
  payload: NewsletterPayload,
): Promise<{ ok: boolean; status: number }> {
  const res = await fetch(`${API_BASE}/newsletter-subscriptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  return { ok: res.ok, status: res.status };
}

/** Construit le chemin canonique d'un document. */
export function documentPath(slug: string): string {
  return `/textes/${slug}`;
}

/** Construit le chemin canonique d'un article. */
export function articlePath(slug: string, number: string): string {
  return `/textes/${slug}/article-${encodeURIComponent(number)}`;
}

/**
 * URL du PDF d'origine (proxy API). `download=true` force le téléchargement ;
 * sinon le PDF s'affiche en ligne (intégrable en <iframe> sur le site, cf.
 * l'en-tête `frame-ancestors` du PdfProxyController).
 */
export function pdfProxyUrl(documentId: string, opts: { download?: boolean } = {}): string {
  const url = new URL(`${API_BASE}/legal-documents/${documentId}/pdf`);
  if (opts.download) url.searchParams.set('download', 'true');
  return url.href;
}
