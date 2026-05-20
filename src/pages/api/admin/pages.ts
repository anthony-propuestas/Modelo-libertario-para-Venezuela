import type { APIRoute } from 'astro';
import { validateSession } from '../../../lib/auth';
import * as db from '../../../lib/db';

export const GET: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env;
  if (!await validateSession(request.headers.get('cookie'), env?.ADMIN_SECRET)) {
    return new Response('Unauthorized', { status: 401 });
  }
  const result = await db.pages.listAll(env.DB);
  return Response.json(result.results);
};

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env;
  if (!await validateSession(request.headers.get('cookie'), env?.ADMIN_SECRET)) {
    return new Response('Unauthorized', { status: 401 });
  }
  const body = await request.json() as { slug?: string; title?: string; description?: string };
  const { slug, title, description } = body;
  if (!slug || !title) {
    return new Response('slug y title son requeridos', { status: 400 });
  }
  try {
    const page = await db.pages.create(env.DB, slug, title, description ?? null);
    return Response.json(page, { status: 201 });
  } catch (e: any) {
    if (e?.message?.includes('UNIQUE')) {
      return new Response('Ese slug ya existe', { status: 409 });
    }
    throw e;
  }
};
