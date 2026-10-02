import type { APIRoute } from 'astro';
import { audit, sameOrigin, sessionCookie } from '../../server/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  if (!sameOrigin(request)) return new Response('Blocked', { status: 403 });
  await audit('logout');
  const res = redirect('/admin/login', 303);
  res.headers.append('Set-Cookie', sessionCookie('', new URL(request.url).protocol === 'https:', 0));
  return res;
};
