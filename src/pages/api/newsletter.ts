import type { APIRoute } from 'astro';
import { submitNewsletter } from '../../lib/api';

export const prerender = false;

// Domaines autorisés à poster ce formulaire. On refait le contrôle d'origine
// nous-mêmes (le `checkOrigin` natif d'Astro est désactivé derrière Traefik,
// cf. src/pages/api/contact.ts) — le header Origin/Referer du navigateur porte
// bien le `https` d'origine.
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

type Outcome = 'ok' | 'invalid' | 'error';

const STATUS_CODE: Record<Outcome, number> = { ok: 200, invalid: 422, error: 502 };

const json = (status: Outcome) =>
  new Response(JSON.stringify({ status }), {
    status: STATUS_CODE[status],
    headers: { 'Content-Type': 'application/json' },
  });

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

// Page de confirmation autonome pour la soumission SANS JavaScript (POST natif).
// Le navigateur navigue vers cet endpoint : on lui rend une vraie page (pas du
// JSON brut) avec un message et un retour vers la page d'où il venait.
const MESSAGES: Record<Outcome, { title: string; body: string }> = {
  ok: { title: 'Inscription confirmée', body: 'Merci ! Votre adresse est bien enregistrée.' },
  invalid: { title: 'Adresse invalide', body: 'Cette adresse e-mail semble invalide. Revenez en arrière et réessayez.' },
  error: { title: 'Momentanément indisponible', body: "L'inscription est momentanément indisponible. Réessayez dans un instant." },
};

const htmlPage = (status: Outcome, backHref: string) => {
  const { title, body } = MESSAGES[status];
  return new Response(
    `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>${title} — Mibeko</title><style>body{font-family:system-ui,sans-serif;max-width:32rem;margin:4rem auto;padding:0 1.25rem;color:#1a2b23;line-height:1.6}h1{font-size:1.4rem}a{color:#1e6b47}</style></head><body><h1>${title}</h1><p>${body}</p><p><a href="${escapeHtml(backHref)}">← Retour</a></p></body></html>`,
    { status: STATUS_CODE[status], headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  );
};

// Reçoit l'inscription newsletter et la relaie vers l'API Laravel
// (`POST /newsletter-subscriptions` → 204 / 422). Deux chemins :
//  - fetch same-origin (JSON) depuis l'îlot → réponse JSON, sans rechargement ;
//  - POST natif (form-urlencoded, sans JS) → page de confirmation HTML.
export const POST: APIRoute = async ({ request }) => {
  const contentType = request.headers.get('content-type') ?? '';
  const wantsJson = contentType.includes('application/json');
  // Retour sûr (same-origin) pour le chemin sans JS.
  const referer = request.headers.get('referer');
  let backHref = '/';
  if (referer) {
    try {
      const url = new URL(referer);
      if (ALLOWED_HOSTS.has(url.hostname)) backHref = url.pathname + url.search;
    } catch {
      /* referer illisible → retour à l'accueil */
    }
  }
  const respond = (status: Outcome) => (wantsJson ? json(status) : htmlPage(status, backHref));

  if (!isTrustedOrigin(request)) {
    return respond('error');
  }

  let email = '';
  let source: string | undefined;
  try {
    if (wantsJson) {
      const body = (await request.json()) as { email?: unknown; source?: unknown };
      email = String(body.email ?? '').trim();
      const rawSource = typeof body.source === 'string' ? body.source.trim() : '';
      source = rawSource || undefined;
    } else {
      // Fallback natif : corps application/x-www-form-urlencoded (ou multipart).
      const form = await request.formData();
      email = String(form.get('email') ?? '').trim();
      const rawSource = String(form.get('source') ?? '').trim();
      source = rawSource || undefined;
    }
  } catch {
    return respond('invalid');
  }

  // Garde-fou léger côté relais (l'API valide de toute façon).
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return respond('invalid');
  }

  try {
    const { ok, status } = await submitNewsletter({ email, source });
    if (ok) {
      // 204 : inscrit (idempotent — « déjà inscrit » est aussi un succès).
      return respond('ok');
    }
    if (status === 422) {
      return respond('invalid');
    }
    console.error(`[newsletter] l'API a répondu ${status} (endpoint déployé ? MIBEKO_API_URL correct ?)`);
    return respond('error');
  } catch (error) {
    console.error('[newsletter] API injoignable :', error instanceof Error ? error.message : error);
    return respond('error');
  }
};
