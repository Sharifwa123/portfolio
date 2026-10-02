// Audits a running preview: console errors, broken internal links, horizontal overflow, screenshots.
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
const BASE = process.env.BASE || 'http://localhost:4321';
const OUT = process.env.OUT || 'audit-shots';
mkdirSync(OUT, { recursive: true });
const pages = ['/', '/work/saiba', '/work/sink', '/work/nova', '/work/forge30', '/nope'];
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
let bad = 0;
for (const [name, vp, mobile] of [['desktop', { width: 1440, height: 900 }, false], ['mobile', { width: 390, height: 844 }, true]]) {
  for (const scheme of ['light', 'dark']) {
    const ctx = await browser.newContext({ viewport: vp, isMobile: mobile, deviceScaleFactor: 1, colorScheme: scheme });
    const page = await ctx.newPage();
    const errs = [];
    page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) errs.push(m.text()); });
    page.on('pageerror', (e) => errs.push(String(e)));
    page.on('requestfailed', (r) => errs.push('requestfailed ' + r.url()));
    for (const p of pages) {
      const before = errs.length;
      const res = await page.goto(BASE + p, { waitUntil: 'networkidle' });
      if (p === '/nope') errs.length = before; // the 404 page's own status is expected
      const expected = p === '/nope' ? 404 : 200;
      if (res.status() !== expected) { console.log('STATUS', p, res.status()); bad++; }
      await page.evaluate(() => document.querySelectorAll('.rv').forEach((e) => e.classList.add('in')));
      const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (over > 0) { console.log('OVERFLOW', name, scheme, p, over); bad++; }
      if (scheme === 'light' || p === '/') await page.screenshot({ path: `${OUT}/${name}-${scheme}-${p.replace(/\W+/g, '_')}.png`, fullPage: true });
    }
    if (errs.length) { console.log('CONSOLE', name, scheme, errs); bad++; }
    await ctx.close();
  }
}
// internal links
const ctx = await browser.newContext();
const page = await ctx.newPage();
const seen = new Set();
for (const p of pages.slice(0, 5)) {
  await page.goto(BASE + p);
  const hrefs = await page.$$eval('a[href]', (as) => as.map((a) => a.getAttribute('href')));
  for (const h of hrefs) {
    if (/^(mailto:|https?:)/.test(h)) continue;
    const [path, hash] = h.split('#');
    const target = path || p;
    const key = target + '#' + (hash || '');
    if (seen.has(key)) continue; seen.add(key);
    const r = await page.request.get(BASE + target);
    if (r.status() !== 200) { console.log('BROKEN', h, r.status()); bad++; }
    else if (hash) {
      const html = await r.text();
      if (!html.includes(`id="${hash}"`)) { console.log('NO ANCHOR', h); bad++; }
    }
  }
}
await browser.close();
console.log(bad ? `AUDIT FAILED (${bad})` : 'AUDIT OK');
process.exit(bad ? 1 : 0);
