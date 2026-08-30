import type { APIRoute } from 'astro';
import { submitReport } from '../../lib/api';

export const prerender = false;

// Même contrôle d'origine que `api/contact.ts` : `security.checkOrigin` est
// désactivé dans `astro.config.mjs` (derrière Traefik, TLS terminé, il
// reconstruit `http://` et rejette à tort le POST same-origin). Toute nouvelle
// route POST du site DOIT refaire ce contrôle, sinon elle est ouverte.
const ALLOWED_HOSTS = new Set(['mibeko.fr', 'www.mibeko.fr', 'localhost', '127.0.0.1']);

function isTrustedOrigin(request: Request): boolean {
  const source = request.headers.get('origin') ?? request.headers.get('referer');
  if (!source) return false;
  try {
    return ALLOWED_HOSTS.has(new URL(source).hostname);
  } catch {
    return false;
  }
}

/**
 * Types de problème proposés au public. Liste fermée côté site : l'API accepte
 * n'importe quelle chaîne de 50 caractères, on ne lui laisse pas remonter du
 * texte libre dans un champ qui sert ensuite au triage éditorial.
 */
const PROBLEM_TYPES = new Set([
  'texte_errone',
  'texte_manquant',
  'mauvais_numero',
  'statut_juridique',
  'autre',
]);

/** Retour à la page d'origine, en conservant l'ancre du formulaire. */
function backTo(rawPath: string | null, status: string): string {
  // Le chemin vient du champ caché du formulaire : on n'accepte qu'un chemin
  // interne, jamais une URL absolue (sinon redirection ouverte).
  const path = rawPath && rawPath.startsWith('/') && !rawPath.startsWith('//') ? rawPath : '/textes';
  const [pathname, query] = path.split('?');
  const params = new URLSearchParams(query ?? '');
  params.set('signalement', status);
  return `${pathname}?${params.toString()}#signaler`;
}

/**
 * Reçoit le formulaire « Signaler une erreur » (POST natif, même origine) et
 * relaie vers l'API Laravel. Fonctionne sans JavaScript ; redirige vers la page
 * du texte avec un statut lisible côté serveur.
 */
export const POST: APIRoute = async ({ request, redirect }) => {
  if (!isTrustedOrigin(request)) {
    return new Response('Forbidden', { status: 403 });
  }

  const form = await request.formData();
  const returnTo = String(form.get('return_to') ?? '');
  const problemType = String(form.get('type_probleme') ?? '').trim();
  const documentId = String(form.get('document_id') ?? '').trim();
  const articleId = String(form.get('article_id') ?? '').trim();
  const description = String(form.get('description') ?? '').trim();

  if (!PROBLEM_TYPES.has(problemType) || (!documentId && !articleId)) {
    return redirect(backTo(returnTo, 'invalid'), 303);
  }

  try {
    const { ok, status } = await submitReport({
      documentId: documentId || undefined,
      articleId: articleId || undefined,
      problemType,
      description: description.slice(0, 5000) || undefined,
    });

    if (ok) {
      return redirect(backTo(returnTo, 'ok'), 303);
    }
    // 422 = cible ou type refusés par l'API ; 429 = quota `reports` atteint.
    if (status === 422) {
      return redirect(backTo(returnTo, 'invalid'), 303);
    }
    if (status === 429) {
      return redirect(backTo(returnTo, 'throttled'), 303);
    }
    console.error(`[report] l'API a répondu ${status}`);
    return redirect(backTo(returnTo, 'error'), 303);
  } catch (error) {
    console.error('[report] API injoignable :', error instanceof Error ? error.message : error);
    return redirect(backTo(returnTo, 'error'), 303);
  }
};
