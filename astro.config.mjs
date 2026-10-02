import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://portfolio.shariftechnologies.online',
  trailingSlash: 'never',
  adapter: vercel(),
  // Astro's built-in check compares the full origin, so behind Vercel's proxy (http hop, https browser)
  // it rejects real logins. Every POST route runs its own same-origin check (src/server/auth.ts: sameOrigin).
  security: { checkOrigin: false },
  build: { format: 'file', inlineStylesheets: 'auto' },
});
