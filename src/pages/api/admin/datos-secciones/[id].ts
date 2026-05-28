import type { APIRoute } from 'astro';
import { validateSession } from '../../../../lib/auth';

export const PUT: APIRoute = async ({ request, locals, params }) => {
  const env = (locals as any).runtime?.env;
  if (!await validateSession(request.headers.get('cookie'), env?.ADMIN_SECRET)) {
    return new Response('Unauthorized', { status: 401 });
  }
  const id = Number(params.id);
  const body = await request.json() as { nombre?: string };
  if (!body.nombre?.trim()) return new Response('nombre requerido', { status: 400 });

  await env.DB.prepare('UPDATE datos_secciones SET nombre=? WHERE id=?')
    .bind(body.nombre.trim(), id).run();
  return Response.json({ ok: true });
};

export const DELETE: APIRoute = async ({ request, locals, params }) => {
  const env = (locals as any).runtime?.env;
  if (!await validateSession(request.headers.get('cookie'), env?.ADMIN_SECRET)) {
    return new Response('Unauthorized', { status: 401 });
  }
  const id = Number(params.id);
  await env.DB.prepare('DELETE FROM datos_secciones WHERE id=?').bind(id).run();
  return Response.json({ ok: true });
};
