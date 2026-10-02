import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { env, adminConfigured } from './env';
import { getStore } from './store';

const TTL_MS = 8 * 60 * 60 * 1000;
const b64 = (s: string) => Buffer.from(s).toString('base64url');
const sign = (body: string) => createHmac('sha256', env('SESSION_SECRET') ?? '').update(body).digest('base64url');
const sha = (s: string) => createHash('sha256').update(s).digest();

export const cookieName = (secure: boolean) => (secure ? '__Host-admin' : 'admin');

export function mintSession(): string {
  const body = b64(JSON.stringify({ exp: Date.now() + TTL_MS }));
  return `${body}.${sign(body)}`;
}

function readCookie(req: Request, secure: boolean): string | undefined {
  const name = cookieName(secure);
  for (const part of (req.headers.get('cookie') ?? '').split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return v.join('=');
  }
}

export function isAuthed(req: Request): boolean {
  if (!adminConfigured()) return false;
  const secure = new URL(req.url).protocol === 'https:';
  const tok = readCookie(req, secure);
  if (!tok) return false;
  const [body, mac] = tok.split('.');
  if (!body || !mac) return false;
  const good = Buffer.from(sign(body));
  const given = Buffer.from(mac);
  if (good.length !== given.length || !timingSafeEqual(good, given)) return false;
  try { return JSON.parse(Buffer.from(body, 'base64url').toString()).exp > Date.now(); } catch { return false; }
}

export const sessionCookie = (value: string, secure: boolean, maxAge = TTL_MS / 1000) =>
  `${cookieName(secure)}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure ? '; Secure' : ''}`;

export function passwordOk(input: string): boolean {
  const real = env('ADMIN_PASSWORD') ?? '';
  return timingSafeEqual(sha(input), sha(real)) && real.length >= 12;
}

/** Same-origin check for state-changing requests. */
export function sameOrigin(req: Request): boolean {
  const o = req.headers.get('origin');
  if (o && o !== 'null') {
    try { return new URL(o).host === new URL(req.url).host; } catch { return false; }
  }
  return req.headers.get('sec-fetch-site') === 'same-origin';
}

/** Opaque, non-reversible client fingerprint: only ever used as a counter key. */
export function clientHash(req: Request, salt: string): string {
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || req.headers.get('x-real-ip') || '';
  return createHash('sha256').update(`${env('SESSION_SECRET') ?? 'dev'}|${salt}|${ip}|${req.headers.get('user-agent') ?? ''}`).digest('hex').slice(0, 20);
}

/** Fixed-window counter; returns the new count. */
export async function hit(key: string, windowSec: number): Promise<number> {
  const [n] = (await getStore().run([['INCR', key], ['EXPIRE', key, windowSec]])) as number[];
  return n;
}

export async function audit(event: string, detail = ''): Promise<void> {
  try {
    await getStore().run([['LPUSH', 'audit', JSON.stringify({ t: Date.now(), e: event, d: detail.slice(0, 120) })], ['LTRIM', 'audit', 0, 99]]);
  } catch { /* never block on logging */ }
}
