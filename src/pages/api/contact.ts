import type { APIRoute } from 'astro';
import { submitContact } from '../../lib/api';

export const prerender = false;

// Domaines autorisés à poster ce formulaire. On refait nous-mêmes le contrôle
// d'origine car le `checkOrigin` natif d'Astro est désactivé : derrière Traefik
// (TLS terminé), il reconstruit `http://` et rejette à tort le POST same-origin.
// Le header Origin/Referer du navigateur, lui, porte bien le `https` d'origine.
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

// Reçoit le formulaire de contact (POST natif, même origine → pas de CORS) et
// relaie vers l'API Laravel. Redirige vers /contact avec un statut lisible
// côté serveur. Fonctionne sans JavaScript.
export const POST: APIRoute = async ({ request, redirect }) => {
  if (!isTrustedOrigin(request)) {
    return new Response('Forbidden', { status: 403 });
  }

  const form = await request.formData();
  const payload = {
    name: String(form.get('name') ?? '').trim(),
    email: String(form.get('email') ?? '').trim(),
    profile: String(form.get('profile') ?? '').trim() || undefined,
    message: String(form.get('message') ?? '').trim(),
  };

  try {
    const { ok, status } = await submitContact(payload);
    if (ok) {
      return redirect('/contact?status=ok#contact', 303);
    }
    // 422 = champs invalides (faute de l'utilisateur) ; le reste = problème
    // côté service (API injoignable, endpoint non déployé, 5xx…).
    if (status === 422) {
      return redirect('/contact?status=invalid#contact', 303);
    }
    console.error(`[contact] l'API a répondu ${status} (endpoint déployé ? MIBEKO_API_URL correct ?)`);
    return redirect('/contact?status=error#contact', 303);
  } catch (error) {
    console.error('[contact] API injoignable :', error instanceof Error ? error.message : error);
    return redirect('/contact?status=error#contact', 303);
  }
};
