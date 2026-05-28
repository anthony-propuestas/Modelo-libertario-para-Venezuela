import type { APIRoute } from 'astro';
import { validateSession } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env;
  if (!await validateSession(request.headers.get('cookie'), env?.ADMIN_SECRET)) {
    return new Response('Unauthorized', { status: 401 });
  }
  const body = await request.json() as { nombre?: string };
  if (!body.nombre?.trim()) return new Response('nombre requerido', { status: 400 });

  const countRes = await env.DB.prepare('SELECT COUNT(*) as c FROM datos_secciones').first() as any;
  const order_index = (countRes?.c ?? 0) as number;

  const result = await env.DB.prepare(
    'INSERT INTO datos_secciones (nombre, order_index) VALUES (?, ?) RETURNING id'
  ).bind(body.nombre.trim(), order_index).first() as any;

  return Response.json({ ok: true, id: result.id });
};
