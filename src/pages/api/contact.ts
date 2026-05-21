import type { APIContext } from 'astro';

export const prerender = false;

export async function POST({ request, locals }: APIContext) {
  const env = (locals as any).runtime?.env as Env;

  let name: string, email: string, message: string;
  try {
    const body = await request.json() as any;
    name = (body.name ?? '').trim();
    email = (body.email ?? '').trim();
    message = (body.message ?? '').trim();
  } catch {
    return Response.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }

  if (!name || !email || !message) {
    return Response.json({ error: 'Todos los campos son obligatorios' }, { status: 400 });
  }

  if (!env?.RESEND_API_KEY) {
    return Response.json({ error: 'Servicio de email no configurado' }, { status: 503 });
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `Contacto Venezuela Libertaria <${env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'}>`,
      to: ['anthony.propuestas@gmail.com'],
      subject: `Nuevo mensaje de ${name}`,
      html: `<p><strong>Nombre:</strong> ${name}</p><p><strong>Correo:</strong> ${email}</p><p><strong>Mensaje:</strong></p><p>${message.replace(/\n/g, '<br>')}</p>`,
    }),
  });

  if (!res.ok) {
    return Response.json({ error: 'Error al enviar el mensaje' }, { status: 502 });
  }

  return Response.json({ ok: true });
}
