import type { APIRoute } from 'astro';
import { clientHash, hit, isAuthed, sameOrigin } from '../../server/auth';
import { ALLOWED_PATH, BOT, dayKey, record } from '../../server/stats';
import { validId } from '../../server/links';

export const prerender = false;

const none = () => new Response(null, { status: 204 });

/**
 * Cookieless first-party analytics beacon. Stores aggregate counters and a capped event log.
 * No IP address, user agent or fingerprint is ever stored: the visitor hash is only used as
 * an input to an approximate daily unique counter and a short-lived rate-limit key.
 * Honours Do Not Track and Global Privacy Control; ignores bots and the signed-in admin.
 */
export const POST: APIRoute = async ({ request }) => {
  const h = request.headers;
  if (!sameOrigin(request)) return none();
  if (h.get('dnt') === '1' || h.get('sec-gpc') === '1') return none();
  if (BOT.test(h.get('user-agent') ?? '') || isAuthed(request)) return none();

  let b: { t?: string; p?: string; r?: string; id?: string };
  try { b = JSON.parse(await request.text()); } catch { return none(); }

  const path = String(b.p ?? '').split(/[?#]/)[0].replace(/(.)\/$/, '$1');
  if (!ALLOWED_PATH.test(path)) return none();

  const visitor = clientHash(request, dayKey());
  try {
    if ((await hit(`rl:e:${visitor}`, 60)) > 120) return new Response(null, { status: 429 });

    let refHost = 'direct';
    const self = new URL(request.url).host;
    if (b.r) {
      try {
        const rh = new URL(b.r).host.replace(/^www\./, '');
        refHost = rh === self.replace(/^www\./, '') ? '' : rh;
      } catch { refHost = 'direct'; }
    }
    const country = /^[A-Z]{2}$/.test(h.get('x-vercel-ip-country') ?? '') ? h.get('x-vercel-ip-country')! : 'unknown';
    const ua = h.get('user-agent') ?? '';
    const device = /ipad|tablet/i.test(ua) ? 'tablet' : /mobi|android|iphone/i.test(ua) ? 'mobile' : 'desktop';

    if (b.t === 'click' && b.id && validId(b.id)) await record({ type: 'click', path, refHost: '', country, device, visitor, linkId: b.id });
    else if (b.t === 'view') await record({ type: 'view', path, refHost, country, device, visitor });
  } catch { /* analytics must never break the site */ }
  return none();
};
