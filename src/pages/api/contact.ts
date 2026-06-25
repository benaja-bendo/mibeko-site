import type { APIRoute } from 'astro';
import { submitContact } from '../../lib/api';

export const prerender = false;

// Reçoit le formulaire de contact (POST natif, même origine → pas de CORS) et
// relaie vers l'API Laravel. Redirige vers /contact avec un statut lisible
// côté serveur. Fonctionne sans JavaScript.
export const POST: APIRoute = async ({ request, redirect }) => {
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
