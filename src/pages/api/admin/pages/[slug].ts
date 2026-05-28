import type { APIRoute } from 'astro';
import { validateSession } from '../../../../lib/auth';
import * as db from '../../../../lib/db';

export const PUT: APIRoute = async ({ request, locals, params }) => {
  const env = (locals as any).runtime?.env;
  if (!await validateSession(request.headers.get('cookie'), env?.ADMIN_SECRET)) {
    return new Response('Unauthorized', { status: 401 });
  }
  const page = await db.pages.getBySlug(env.DB, params.slug!);
  if (!page) return new Response('Not found', { status: 404 });

  const body = await request.json() as { title?: string; description?: string; published?: number; show_in_nav?: number };
  await db.pages.update(
    env.DB,
    page.id,
    body.title ?? page.title,
    body.description !== undefined ? (body.description || null) : page.description,
    body.published ?? page.published
  );
  if (body.show_in_nav !== undefined) {
    await env.DB.prepare('UPDATE pages SET show_in_nav=? WHERE id=?')
      .bind(body.show_in_nav, page.id).run();
  }
  return Response.json({ ok: true });
};

export const DELETE: APIRoute = async ({ request, locals, params }) => {
  const env = (locals as any).runtime?.env;
  if (!await validateSession(request.headers.get('cookie'), env?.ADMIN_SECRET)) {
    return new Response('Unauthorized', { status: 401 });
  }
  const page = await db.pages.getBySlug(env.DB, params.slug!);
  if (!page) return new Response('Not found', { status: 404 });
  await db.pages.delete(env.DB, page.id);
  return Response.json({ ok: true });
};
