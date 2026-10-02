import { defineMiddleware } from 'astro:middleware';
import { isAuthed } from './server/auth';

export const onRequest = defineMiddleware(async (ctx, next) => {
  const p = ctx.url.pathname;
  if (!p.startsWith('/admin')) return next();
  if (p !== '/admin/login' && !isAuthed(ctx.request)) return ctx.redirect('/admin/login');
  const res = await next();
  res.headers.set('Cache-Control', 'no-store');
  res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  res.headers.set('Referrer-Policy', 'same-origin');
  return res;
});
