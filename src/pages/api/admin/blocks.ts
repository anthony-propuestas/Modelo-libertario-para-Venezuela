import type { APIRoute } from 'astro';
import { validateSession } from '../../../lib/auth';
import * as db from '../../../lib/db';

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env;
  if (!await validateSession(request.headers.get('cookie'), env?.ADMIN_SECRET)) {
    return new Response('Unauthorized', { status: 401 });
  }
  const body = await request.json() as {
    page_id?: number;
    section_id?: number | null;
    type?: string;
    content?: string;
  };
  const { page_id, section_id, type, content } = body;
  if (!page_id || !type) {
    return new Response('page_id y type son requeridos', { status: 400 });
  }
  const validTypes = ['heading', 'text', 'image', 'video', 'table'];
  if (!validTypes.includes(type)) {
    return new Response('Tipo inválido', { status: 400 });
  }

  let orderIndex = 0;
  if (section_id) {
    const existing = await db.blocks.listBySection(env.DB, section_id);
    orderIndex = existing.results.length;
  }

  const block = await db.blocks.create(env.DB, page_id, section_id ?? null, type, content ?? '', orderIndex);
  return Response.json(block, { status: 201 });
};
