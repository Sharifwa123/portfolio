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
internal links and anchors, light/dark, desktop/mobile) against `npm run preview` on port 4321.
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

## Deploy

Import the repo in Vercel (Astro is auto-detected). Set the production domain to
`portfolio.shariftechnologies.online`. Security headers and caching are in `vercel.json`.
