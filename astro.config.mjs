import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://portfolio.shariftechnologies.online',
  trailingSlash: 'never',
  adapter: vercel(),
  build: { format: 'file', inlineStylesheets: 'auto' },
  integrations: [sitemap({ filter: (page) => !/\/(admin|api)(\/|$)/.test(page) })],
});
