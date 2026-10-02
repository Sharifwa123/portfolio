import { FLAGSHIP, OTHER } from '../data/projects';
import { getStore } from './store';
import { normalizeUrl } from './links';

export const TIERS = ['Flagship', 'Programme', 'Publishing', 'Experiment', 'Earlier work'] as const;
export const TONES = [
  { v: 'live', label: 'Live (green)' },
  { v: 'beta', label: 'Beta / in progress (accent)' },
  { v: 'build', label: 'Early / not public (amber)' },
  { v: 'idle', label: 'Paused / archived (grey)' },
] as const;
export type Tone = (typeof TONES)[number]['v'];
export const MAX_PROJECTS = 60;

export interface Project {
  slug: string;
  caseStudy: boolean;
  tier: (typeof TIERS)[number];
  name: string;
  kind: string;
  summary: string;
  status: { label: string; tone: Tone };
  stack: string[];
  href: string;
  proof: string;
  now: boolean;
  nowNote: string;
  tagline: string;
  facts: { k: string; v: string }[];
  problem: string;
  built: string[];
  architecture: { caption: string; tree: string; note: string };
  decisions: { title: string; body: string }[];
  limits: string[];
  links: { label: string; href: string }[];
  seo: string;
}

/** Seed notes for the “Working on now” list. Editable per project in the admin. */
const NOW = [
  { name: 'Forge30', href: '/work/forge30', state: 'Public beta on Vercel. Applications, status lookup, admin area and student cards are built.' },
  { name: 'SAIBA', href: '/work/saiba', state: 'Android app distributed as APK releases. Not yet on Google Play.' },
  { name: 'NOVA', href: '/work/nova', state: 'Repository is at v0.18 with HTTP services, forms and durable persistence.' },
  { name: 'Git & GitHub: From Zero to Mastery', href: '', state: 'Manuscript complete. Waiting on an ISBN and a live-account verification pass.' },
];
const PROOF: Record<string, string> = {
  saiba: 'Web platform · Android APK · billing, RAG, escalation',
  sink: '43 engine tests · simulated multi-hop mesh',
  nova: 'On npm · 19 ADRs · zero dependencies',
  forge30: 'Public beta · six-viewport browser tests',
};
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30);
const empty = (): Omit<Project, 'slug' | 'name' | 'tier' | 'caseStudy' | 'summary' | 'status'> => ({
  kind: '', stack: [], href: '', proof: '', now: false, nowNote: '', tagline: '', facts: [], problem: '', built: [],
  architecture: { caption: '', tree: '', note: '' }, decisions: [], limits: [], links: [], seo: '',
});

export const DEFAULT_PROJECTS: Project[] = [
  ...FLAGSHIP.map((c): Project => {
    const now = NOW.find((n) => n.href === `/work/${c.slug}`);
    return {
      ...empty(), slug: c.slug, caseStudy: true, tier: 'Flagship', name: c.name, kind: c.kind, summary: c.summary,
      status: { label: c.status.label, tone: c.status.tone }, stack: c.stack, proof: PROOF[c.slug] ?? '', now: !!now, nowNote: now?.state ?? '',
      tagline: c.tagline, facts: c.facts, problem: c.problem, built: c.built,
      architecture: { caption: c.architecture.caption, tree: c.architecture.tree, note: c.architecture.note ?? '' },
      decisions: c.decisions, limits: c.limits, links: c.links, seo: c.seo,
    };
  }),
  ...OTHER.map((o): Project => {
    const now = NOW.find((n) => n.name === o.name);
    const tone: Tone = o.state.startsWith('Manuscript') ? 'beta' : 'build';
    return {
      ...empty(), slug: slugify(o.name), caseStudy: false, tier: o.tier, name: o.name, summary: o.line, status: { label: o.state, tone },
      stack: o.stack.split('·').map((s) => s.trim()).filter(Boolean), href: o.href ?? '', now: !!now, nowNote: now?.state ?? '',
    };
  }),
];

export async function getProjects(): Promise<Project[]> {
  try {
    const [raw] = (await getStore().run([['GET', 'projects']])) as (string | null)[];
    if (!raw) return DEFAULT_PROJECTS;
    const p = JSON.parse(raw);
    return Array.isArray(p) ? (p as Project[]) : DEFAULT_PROJECTS;
  } catch {
    return DEFAULT_PROJECTS;
  }
}
export const saveProjects = (p: Project[]) => getStore().run([['SET', 'projects', JSON.stringify(p.slice(0, MAX_PROJECTS))]]);

// ---- form <-> model -------------------------------------------------------
const lines = (s: string, max = 40) => s.split('\n').map((l) => l.trim()).filter(Boolean).slice(0, max);
export const toLines = (a: string[]) => a.join('\n');
export const factsText = (f: Project['facts']) => f.map((x) => `${x.k}: ${x.v}`).join('\n');
export const decisionsText = (d: Project['decisions']) => d.map((x) => `${x.title} :: ${x.body}`).join('\n');
export const linksText = (l: Project['links']) => l.map((x) => `${x.label} | ${x.href}`).join('\n');

export function statusOnly(f: FormData): Project['status'] | string {
  const label = String(f.get('status_label') ?? '').trim().slice(0, 80);
  const tone = String(f.get('status_tone') ?? '') as Tone;
  if (!label) return 'Status text cannot be empty.';
  if (!TONES.some((t) => t.v === tone)) return 'Pick a status colour.';
  return { label, tone };
}

export function projectFromForm(f: FormData, all: Project[], originalSlug?: string): Project | string {
  const g = (k: string) => String(f.get(k) ?? '').trim();
  const name = g('name').slice(0, 80);
  if (!name) return 'Give the project a name.';
  const slug = slugify(g('slug') || name);
  if (slug.length < 2) return 'The URL slug needs at least 2 letters or numbers.';
  if (all.some((p) => p.slug === slug && p.slug !== originalSlug)) return `Another project already uses “${slug}”.`;
  const tier = g('tier') as Project['tier'];
  if (!TIERS.includes(tier)) return 'Pick a tier.';
  const summary = g('summary').slice(0, 700);
  if (!summary) return 'Add a short summary.';
  const st = statusOnly(f);
  if (typeof st === 'string') return st;

  let href = '';
  if (g('href')) {
    const u = normalizeUrl(g('href'));
    if (!u || !/^https?:/.test(u)) return 'The project link must be an http(s) URL.';
    href = u;
  }
  const links: Project['links'] = [];
  for (const l of lines(g('links'), 12)) {
    const [label, ...rest] = l.split('|');
    const u = normalizeUrl(rest.join('|'));
    if (!label?.trim() || !u || !/^https?:/.test(u)) return `Link line “${l.slice(0, 40)}” must look like: Label | https://…`;
    links.push({ label: label.trim().slice(0, 60), href: u });
  }
  const facts = lines(g('facts'), 10).map((l) => { const i = l.indexOf(':'); return i > 0 ? { k: l.slice(0, i).trim().slice(0, 40), v: l.slice(i + 1).trim().slice(0, 200) } : null; });
  if (facts.some((x) => !x)) return 'Each fact line must look like: Key: value';
  const decisions = lines(g('decisions'), 12).map((l) => { const i = l.indexOf('::'); return i > 0 ? { title: l.slice(0, i).trim().slice(0, 100), body: l.slice(i + 2).trim().slice(0, 700) } : null; });
  if (decisions.some((x) => !x)) return 'Each decision line must look like: Title :: explanation';

  const caseStudy = f.get('caseStudy') === 'on';
  const p: Project = {
    slug, caseStudy, tier, name, kind: g('kind').slice(0, 100), summary, status: st,
    stack: g('stack').split(/[,·]/).map((s) => s.trim().slice(0, 30)).filter(Boolean).slice(0, 14), href,
    proof: g('proof').slice(0, 120), now: f.get('now') === 'on', nowNote: g('nowNote').slice(0, 220),
    tagline: g('tagline').slice(0, 300), facts: facts as Project['facts'], problem: g('problem').slice(0, 1500),
    built: lines(g('built')).map((x) => x.slice(0, 400)),
    architecture: { caption: g('arch_caption').slice(0, 120), tree: String(f.get('arch_tree') ?? '').replace(/\r/g, '').slice(0, 3000), note: g('arch_note').slice(0, 600) },
    decisions: decisions as Project['decisions'], limits: lines(g('limits')).map((x) => x.slice(0, 400)), links, seo: g('seo').slice(0, 200),
  };
  if (caseStudy && (!p.tagline || !p.problem)) return 'A case study needs a tagline and a problem statement.';
  return p;
}
