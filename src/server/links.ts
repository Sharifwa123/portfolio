import { randomBytes } from 'node:crypto';
import { SITE } from '../data/site';
import { ICONS, guessIcon } from '../data/icons';
import { getStore } from './store';

export type LinkIcon = { kind: 'preset'; name: string } | { kind: 'svg'; svg: string } | { kind: 'img'; src: string };
export type LinkGroup = 'contact' | 'profile';
export const GROUPS: { v: LinkGroup; label: string }[] = [
  { v: 'contact', label: 'Contact (Contact section)' },
  { v: 'profile', label: 'Public profile (Public record section)' },
];
export interface LinkItem { id: string; label: string; url: string; icon: LinkIcon; visible: boolean; group?: LinkGroup }
export const groupOf = (l: LinkItem): LinkGroup => (l.group === 'profile' ? 'profile' : 'contact');

export const MAX_LINKS = 40;

export const DEFAULT_LINKS: LinkItem[] = [
  { id: 'email', label: 'Email', url: `mailto:${SITE.email}`, icon: { kind: 'preset', name: 'mail' }, visible: true, group: 'contact' },
  { id: 'cmail', label: 'Company email', url: `mailto:${SITE.companyEmail}`, icon: { kind: 'preset', name: 'mail' }, visible: true, group: 'contact' },
  { id: 'whatsapp', label: 'WhatsApp', url: SITE.whatsapp.href, icon: { kind: 'preset', name: 'whatsapp' }, visible: true, group: 'contact' },
  { id: 'github', label: 'GitHub', url: SITE.github, icon: { kind: 'preset', name: 'github' }, visible: true, group: 'profile' },
  { id: 'company', label: 'Sharif Technologies', url: SITE.company.url, icon: { kind: 'preset', name: 'globe' }, visible: true, group: 'profile' },
  { id: 'npm', label: 'npm', url: 'https://www.npmjs.com/~sharif-technologies', icon: { kind: 'preset', name: 'npm' }, visible: true, group: 'profile' },
];

export async function getLinks(): Promise<LinkItem[]> {
  try {
    const [raw] = (await getStore().run([['GET', 'links']])) as (string | null)[];
    if (!raw) return DEFAULT_LINKS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LinkItem[]) : DEFAULT_LINKS;
  } catch {
    return DEFAULT_LINKS;
  }
}

export async function saveLinks(links: LinkItem[]): Promise<void> {
  await getStore().run([['SET', 'links', JSON.stringify(links.slice(0, MAX_LINKS))]]);
}

export const newId = () => randomBytes(4).toString('hex');
export const validId = (s: string) => /^[a-z0-9]{3,12}$/.test(s);

/** Accept http(s), mailto and tel only. Bare domains get https://, bare emails get mailto:. */
export function normalizeUrl(input: string): string | null {
  let u = input.trim();
  if (!u || u.length > 500) return null;
  if (/^[^\s@/:]+@[^\s@/:]+\.[^\s@/:]+$/.test(u)) u = `mailto:${u}`;
  else if (/^\+?[\d\s()-]{7,20}$/.test(u)) u = `tel:${u.replace(/[\s()-]/g, '')}`;
  else if (!/^[a-z][a-z0-9+.-]*:/i.test(u)) u = `https://${u}`;
  try {
    const p = new URL(u);
    if (!['https:', 'http:', 'mailto:', 'tel:'].includes(p.protocol)) return null;
    if ((p.protocol === 'https:' || p.protocol === 'http:') && !p.hostname.includes('.')) return null;
    return p.protocol === 'mailto:' || p.protocol === 'tel:' ? u : p.toString();
  } catch {
    return null;
  }
}

const ELEMENTS = new Set(['svg', 'g', 'path', 'circle', 'ellipse', 'rect', 'line', 'polyline', 'polygon']);
const ATTRS = new Set(['viewbox', 'd', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'width', 'height', 'points', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'fill-rule', 'clip-rule', 'transform', 'opacity', 'fill-opacity', 'stroke-opacity']);
const SAFE_VALUE = /^[\w\s.,#%()+\-]*$/;

/**
 * Strict allowlist sanitizer for admin-pasted SVG. Rebuilds the markup from scratch: only
 * known shape elements and presentation attributes survive; text, styles, scripts, links,
 * references (url(...)), event handlers and unknown tags are dropped or rejected.
 */
export function sanitizeSvg(input: string): string | null {
  const src = input.trim();
  if (!src || src.length > 8000) return null;
  if (/<!|<\?|<script|<style|<foreignObject|<use|<image|javascript:|data:|on\w+\s*=/i.test(src)) return null;
  const tag = /<(\/?)([a-zA-Z][\w:-]*)((?:\s+[^<>]*?)?)\s*(\/?)>/g;
  let out = '';
  let depth = 0;
  let sawRoot = false;
  let m: RegExpExecArray | null;
  let last = 0;
  while ((m = tag.exec(src))) {
    if (src.slice(last, m.index).replace(/\s+/g, '')) return null; // stray text between tags
    last = tag.lastIndex;
    const [, closing, rawName, rawAttrs, selfClose] = m;
    const name = rawName.toLowerCase();
    if (!ELEMENTS.has(name)) return null;
    if (closing) {
      if (!depth) return null;
      depth--;
      out += `</${name}>`;
      continue;
    }
    const isRoot = name === 'svg';
    if (isRoot !== !sawRoot) return null; // exactly one svg, and it must come first
    sawRoot = true;
    const attrs: Record<string, string> = {};
    const attrRe = /([a-zA-Z][\w:-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
    let a: RegExpExecArray | null;
    while ((a = attrRe.exec(rawAttrs))) {
      const k = a[1].toLowerCase();
      const v = a[2] ?? a[3] ?? '';
      if (!ATTRS.has(k)) continue;
      if (!SAFE_VALUE.test(v) || /url\(/i.test(v)) return null;
      attrs[k] = v;
    }
    if (isRoot) {
      const vb = attrs['viewbox'];
      attrs['viewbox'] = vb && /^-?[\d.]+[\s,]+-?[\d.]+[\s,]+[\d.]+[\s,]+[\d.]+$/.test(vb) ? vb : '0 0 24 24';
      delete attrs['width']; delete attrs['height'];
      attrs['fill'] ??= 'currentColor';
    }
    const rendered = Object.entries(attrs).map(([k, v]) => ` ${k === 'viewbox' ? 'viewBox' : k}="${v}"`).join('');
    const extra = isRoot ? ' xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"' : '';
    if (selfClose || !['svg', 'g'].includes(name)) out += `<${name}${extra}${rendered}/>`;
    else { depth++; out += `<${name}${extra}${rendered}>`; }
  }
  if (src.slice(last).replace(/\s+/g, '') || depth || !sawRoot) return null;
  return out;
}

export function parseImgSrc(input: string): string | null {
  try {
    const u = new URL(input.trim());
    return u.protocol === 'https:' && input.length <= 400 ? u.toString() : null;
  } catch {
    return null;
  }
}

/** Build an icon from the admin form fields; 'auto' guesses from the URL. */
export function iconFromForm(choice: string, svg: string, img: string, url: string): LinkIcon | string {
  if (choice === 'custom-svg') return sanitizeSvg(svg) ? { kind: 'svg', svg: sanitizeSvg(svg)! } : 'That SVG could not be used. Paste a simple SVG made of paths and shapes only.';
  if (choice === 'custom-img') return parseImgSrc(img) ? { kind: 'img', src: parseImgSrc(img)! } : 'The icon image must be a full https:// URL.';
  const name = choice === 'auto' || !(choice in ICONS) ? guessIcon(url) : choice;
  return { kind: 'preset', name };
}

/** Short human value shown under a link label. */
export function displayValue(url: string): string {
  if (url.startsWith('mailto:')) return url.slice(7);
  if (url.startsWith('tel:')) return url.slice(4);
  try {
    const u = new URL(url);
    return (u.hostname.replace(/^www\./, '') + u.pathname).replace(/\/$/, '');
  } catch {
    return url;
  }
}
