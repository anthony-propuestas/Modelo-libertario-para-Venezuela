import type { APIRoute } from 'astro';
import { createSessionCookie } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env;
  const form = await request.formData();
  const password = String(form.get('password') ?? '');

  if (!env?.ADMIN_SECRET || password !== env.ADMIN_SECRET) {
    return new Response(null, {
      status: 303,
      headers: { Location: '/admin?error=1' },
    });
  }

  const cookie = await createSessionCookie(env.ADMIN_SECRET);
  return new Response(null, {
    status: 303,
    headers: {
      Location: '/admin/dashboard',
      'Set-Cookie': cookie,
    },
  });
};
