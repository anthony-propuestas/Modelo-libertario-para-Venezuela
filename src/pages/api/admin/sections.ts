import type { APIRoute } from 'astro';
import { validateSession } from '../../../lib/auth';
import * as db from '../../../lib/db';

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env;
  if (!await validateSession(request.headers.get('cookie'), env?.ADMIN_SECRET)) {
    return new Response('Unauthorized', { status: 401 });
  }
  const body = await request.json() as { page_id?: number; title?: string; slug?: string };
  const { page_id, title, slug } = body;
  if (!page_id || !title || !slug) {
    return new Response('page_id, title y slug son requeridos', { status: 400 });
  }
  const existing = await db.sections.listByPage(env.DB, page_id);
  const orderIndex = existing.results.length;
  try {
    const section = await db.sections.create(env.DB, page_id, title, slug, orderIndex);
    return Response.json(section, { status: 201 });
  } catch (e: any) {
    if (e?.message?.includes('UNIQUE')) {
      return new Response('Ese slug ya existe en esta página', { status: 409 });
    }
    throw e;
  }
};
