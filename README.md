# Portfolio — Sharif Tingane Issah

Static site built with [Astro](https://astro.build) and deployed on Vercel at
<https://portfolio.shariftechnologies.online>.

## Develop

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # static output in dist/
npm run check      # type-check .astro and .ts files
```

`npm run audit:links` runs a Playwright audit (console errors, horizontal overflow, broken
internal links and anchors, light/dark, desktop/mobile) against a dev server on port 4322
(`npm run dev -- --port 4322`).
`node scripts/make-assets.mjs` regenerates the favicon, Apple touch icon and `og.png`.

## Structure

- `src/data/` — all content. `projects.ts` holds the four case studies and the lesser work;
  `site.ts` holds identity, capabilities, approach, timeline and current work.
- `src/styles/global.css` — the design system: tokens, elevation scale (flat / raised / inset),
  type scale, components. Neumorphic depth marks interaction and evidence, not every section.
- `src/pages/` — `index`, `work/[slug]` (one page per case study) and `404`.

## Content rules

Every claim comes from a public source: the author's GitHub repositories, their READMEs and
docs, or the npm registry. Private repositories are described only at the level the previous
site already published. Add no figures that the repositories do not state.

## Admin (`/admin`)

Sign-in, a dashboard and link management, all server-rendered on Vercel.

- **Dashboard:** page views, daily unique visitors, link clicks, top pages, referrers, countries,
  devices, a recent-activity log and a security log (sign-ins, link edits).
- **Links:** add, edit, reorder, hide and delete the links in the Contact section. Pick an icon
  from 50 presets (auto-chosen from the URL by default), paste your own SVG (sanitised to a strict
  shape allowlist), or point to an https image URL.
- **Analytics are first-party and privacy-preserving:** no cookies, no IP or user-agent stored,
  Do Not Track and Global Privacy Control respected, bots and the signed-in admin ignored. See `/privacy`.
- **Security:** one password (`ADMIN_PASSWORD`), HMAC-signed HttpOnly SameSite=Strict session cookie
  (8 h), same-origin check on every POST, login throttling, `no-store` and `noindex` on admin pages.

### Set it up on Vercel
1. Project → Storage → add **Upstash Redis** (sets `KV_REST_API_URL` / `KV_REST_API_TOKEN`).
2. Project → Settings → Environment Variables: add `ADMIN_PASSWORD` (12+ chars) and `SESSION_SECRET`
   (32+ random chars). Redeploy.
3. Open `/admin`. Without Redis the admin works but data lives in memory and is lost on redeploy.

Locally, `npm run dev` stores data in `.data/store.json`; copy `.env.example` values into your shell.
Home-page links are cached for about a minute at the edge, so edits appear within ~60 s.

## Deploy

Import the repo in Vercel (Astro is auto-detected). Set the production domain to
`portfolio.shariftechnologies.online`. Security headers and caching are in `vercel.json`.
