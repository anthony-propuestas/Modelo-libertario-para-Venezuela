import type { APIRoute } from 'astro';
import { validateSession } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env;
  if (!await validateSession(request.headers.get('cookie'), env?.ADMIN_SECRET)) {
    return new Response('Unauthorized', { status: 401 });
  }
  const body = await request.json() as { seccion_id?: number; nombre?: string; valor?: string };
  if (!body.seccion_id || !body.nombre?.trim() || body.valor === undefined) {
    return new Response('seccion_id, nombre y valor requeridos', { status: 400 });
  }

  const countRes = await env.DB.prepare(
    'SELECT COUNT(*) as c FROM datos_items WHERE seccion_id=?'
  ).bind(body.seccion_id).first() as any;
  const order_index = (countRes?.c ?? 0) as number;

  const result = await env.DB.prepare(
    'INSERT INTO datos_items (seccion_id, nombre, valor, order_index) VALUES (?, ?, ?, ?) RETURNING id'
  ).bind(body.seccion_id, body.nombre.trim(), body.valor.trim(), order_index).first() as any;

  return Response.json({ ok: true, id: result.id });
};
