import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://portfolio.shariftechnologies.online',
  trailingSlash: 'never',
  adapter: vercel(),
  build: { format: 'file', inlineStylesheets: 'auto' },
});
