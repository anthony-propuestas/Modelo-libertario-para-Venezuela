import type { APIRoute } from 'astro';
import { validateSession } from '../../../../lib/auth';

export const PUT: APIRoute = async ({ request, locals, params }) => {
  const env = (locals as any).runtime?.env;
  if (!await validateSession(request.headers.get('cookie'), env?.ADMIN_SECRET)) {
    return new Response('Unauthorized', { status: 401 });
  }
  const id = Number(params.id);
  const body = await request.json() as { nombre?: string; valor?: string };
  if (!body.nombre?.trim() || body.valor === undefined) {
    return new Response('nombre y valor requeridos', { status: 400 });
  }

  await env.DB.prepare('UPDATE datos_items SET nombre=?, valor=? WHERE id=?')
    .bind(body.nombre.trim(), body.valor.trim(), id).run();
  return Response.json({ ok: true });
};

export const DELETE: APIRoute = async ({ request, locals, params }) => {
  const env = (locals as any).runtime?.env;
  if (!await validateSession(request.headers.get('cookie'), env?.ADMIN_SECRET)) {
    return new Response('Unauthorized', { status: 401 });
  }
  const id = Number(params.id);
  await env.DB.prepare('DELETE FROM datos_items WHERE id=?').bind(id).run();
  return Response.json({ ok: true });
};
