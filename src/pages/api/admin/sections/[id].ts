import type { APIRoute } from 'astro';
import { validateSession } from '../../../../lib/auth';
import * as db from '../../../../lib/db';

export const PUT: APIRoute = async ({ request, locals, params }) => {
  const env = (locals as any).runtime?.env;
  if (!await validateSession(request.headers.get('cookie'), env?.ADMIN_SECRET)) {
    return new Response('Unauthorized', { status: 401 });
  }
  const id = Number(params.id);
  const current = await db.sections.getById(env.DB, id);
  if (!current) return new Response('Not found', { status: 404 });

  const body = await request.json() as { title?: string; slug?: string; order_index?: number };
  await db.sections.update(
    env.DB,
    id,
    body.title ?? current.title,
    body.slug ?? current.slug,
    body.order_index ?? current.order_index
  );
  return Response.json({ ok: true });
};

export const DELETE: APIRoute = async ({ request, locals, params }) => {
  const env = (locals as any).runtime?.env;
  if (!await validateSession(request.headers.get('cookie'), env?.ADMIN_SECRET)) {
    return new Response('Unauthorized', { status: 401 });
  }
  const id = Number(params.id);

  // Limpiar imágenes de R2 que pertenecen a esta sección
  const imageBlocks = await env.DB.prepare(
    "SELECT content FROM blocks WHERE section_id=? AND type='image'"
  ).bind(id).all();
  for (const block of (imageBlocks.results ?? [])) {
    if (block.content) await env.R2?.delete(block.content);
  }

  // Borrar bloques antes de borrar la sección (evita huérfanos con section_id=NULL)
  await env.DB.prepare('DELETE FROM blocks WHERE section_id=?').bind(id).run();

  await db.sections.delete(env.DB, id);
  return Response.json({ ok: true });
};
