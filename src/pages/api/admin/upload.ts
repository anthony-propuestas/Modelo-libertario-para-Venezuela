import type { APIRoute } from 'astro';
import { validateSession } from '../../../lib/auth';

const ALLOWED_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env;
  if (!await validateSession(request.headers.get('cookie'), env?.ADMIN_SECRET)) {
    return new Response('Unauthorized', { status: 401 });
  }
  const form = await request.formData();
  const file = form.get('file') as File | null;
  if (!file || !file.size) {
    return new Response('No se recibió archivo', { status: 400 });
  }
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!ALLOWED_EXTS.includes(ext)) {
    return new Response('Tipo de archivo no permitido', { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return new Response('El archivo supera el límite de 5MB', { status: 400 });
  }
  const key = `images/${crypto.randomUUID()}.${ext}`;
  await env.BUCKET.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });
  return Response.json({ key, url: `/api/image/${key}` });
};
