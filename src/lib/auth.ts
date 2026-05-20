const COOKIE_NAME = 'admin_session';
const PAYLOAD = 'authenticated';

async function hmacSign(message: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const buf = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

export async function createSessionCookie(secret: string): Promise<string> {
  const sig = await hmacSign(PAYLOAD, secret);
  const token = btoa(`${PAYLOAD}.${sig}`);
  return `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`;
}

export async function validateSession(cookieHeader: string | null, secret: string): Promise<boolean> {
  if (!cookieHeader || !secret) return false;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
  if (!match) return false;
  try {
    const decoded = atob(match[1]);
    const dot = decoded.lastIndexOf('.');
    if (dot < 0) return false;
    const payload = decoded.slice(0, dot);
    const sig = decoded.slice(dot + 1);
    if (payload !== PAYLOAD) return false;
    const expected = await hmacSign(payload, secret);
    return sig === expected;
  } catch {
    return false;
  }
}

export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}
