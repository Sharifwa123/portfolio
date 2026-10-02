import type { APIRoute } from 'astro';
import { getProjects } from '../server/projects';
import { SITE } from '../data/site';

export const prerender = false;

export const GET: APIRoute = async () => {
  const slugs = (await getProjects()).filter((p) => p.caseStudy).map((p) => `/work/${p.slug}`);
  const urls = ['/', '/privacy', ...slugs].map((u) => `<url><loc>${SITE.url}${u === '/' ? '/' : u}</loc></url>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, {
    headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600' },
  });
};
