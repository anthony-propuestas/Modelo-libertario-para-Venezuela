import type { APIRoute } from 'astro';
import { validateSession } from '../../../../lib/auth';
import * as db from '../../../../lib/db';

export const PUT: APIRoute = async ({ request, locals, params }) => {
  const env = (locals as any).runtime?.env;
  if (!await validateSession(request.headers.get('cookie'), env?.ADMIN_SECRET)) {
    return new Response('Unauthorized', { status: 401 });
  }
  const id = Number(params.id);
  const current = await db.blocks.getById(env.DB, id);
  if (!current) return new Response('Not found', { status: 404 });

  const body = await request.json() as { content?: string; order_index?: number };
  await db.blocks.update(
    env.DB,
    id,
    body.content ?? current.content,
    body.order_index ?? current.order_index
  );
  return Response.json({ ok: true });
};

export const DELETE: APIRoute = async ({ request, locals, params }) => {
  const env = (locals as any).runtime?.env;
  if (!await validateSession(request.headers.get('cookie'), env?.ADMIN_SECRET)) {
    return new Response('Unauthorized', { status: 401 });
  }
  await db.blocks.delete(env.DB, Number(params.id));
  return Response.json({ ok: true });
};
