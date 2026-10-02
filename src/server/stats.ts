import { getStore, type Cmd } from './store';

export const dayKey = (d = new Date()) => d.toISOString().slice(0, 10);
const TTL = 60 * 60 * 24 * 400;

export const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|lighthouse|pingdom|uptime|monitor|curl|wget|python-requests|node-fetch|axios|go-http/i;
export const ALLOWED_PATH = /^\/(work\/[a-z0-9-]{1,30}|privacy)?$/;

export interface EventIn { type: 'view' | 'click'; path: string; refHost: string; country: string; device: string; visitor: string; linkId?: string }

export async function record(e: EventIn): Promise<void> {
  const d = dayKey();
  const cmds: Cmd[] = [];
  const keys = new Set<string>();
  const add = (c: Cmd, k: string) => { cmds.push(c); keys.add(k); };
  if (e.type === 'view') {
    add(['HINCRBY', `pv:${d}`, e.path, 1], `pv:${d}`);
    if (e.refHost) add(['HINCRBY', `ref:${d}`, e.refHost, 1], `ref:${d}`);
    add(['HINCRBY', `cc:${d}`, e.country, 1], `cc:${d}`);
    add(['HINCRBY', `dev:${d}`, e.device, 1], `dev:${d}`);
    add(['PFADD', `uv:${d}`, e.visitor], `uv:${d}`);
  } else if (e.linkId) {
    add(['HINCRBY', `clk:${d}`, e.linkId, 1], `clk:${d}`);
  }
  cmds.push(['LPUSH', 'log', JSON.stringify({ t: Date.now(), k: e.type, p: e.path, r: e.refHost, c: e.country, d: e.device, l: e.linkId })], ['LTRIM', 'log', 0, 299]);
  for (const k of keys) cmds.push(['EXPIRE', k, TTL]);
  await getStore().run(cmds);
}

const pairs = (flat: unknown): Record<string, number> => {
  const o: Record<string, number> = {};
  const a = (flat as string[]) ?? [];
  for (let i = 0; i < a.length; i += 2) o[a[i]] = Number(a[i + 1]);
  return o;
};
const merge = (into: Record<string, number>, from: Record<string, number>) => { for (const [k, v] of Object.entries(from)) into[k] = (into[k] ?? 0) + v; };

export interface Stats {
  days: { day: string; views: number; visitors: number }[];
  views: number; visitorDays: number; clicks: number;
  paths: Record<string, number>; refs: Record<string, number>; countries: Record<string, number>; devices: Record<string, number>; linkClicks: Record<string, number>;
  log: { t: number; k: string; p: string; r: string; c: string; d: string; l?: string }[];
  audit: { t: number; e: string; d: string }[];
}

export async function getStats(n: number): Promise<Stats> {
  const days = Array.from({ length: n }, (_, i) => dayKey(new Date(Date.now() - (n - 1 - i) * 864e5)));
  const cmds: Cmd[] = [];
  for (const d of days) cmds.push(['HGETALL', `pv:${d}`], ['HGETALL', `ref:${d}`], ['HGETALL', `cc:${d}`], ['HGETALL', `dev:${d}`], ['HGETALL', `clk:${d}`], ['PFCOUNT', `uv:${d}`]);
  cmds.push(['LRANGE', 'log', 0, 99], ['LRANGE', 'audit', 0, 49]);
  const res = await getStore().run(cmds);
  const s: Stats = { days: [], views: 0, visitorDays: 0, clicks: 0, paths: {}, refs: {}, countries: {}, devices: {}, linkClicks: {}, log: [], audit: [] };
  days.forEach((day, i) => {
    const b = i * 6;
    const pv = pairs(res[b]);
    const views = Object.values(pv).reduce((a, v) => a + v, 0);
    const visitors = Number(res[b + 5] ?? 0);
    merge(s.paths, pv); merge(s.refs, pairs(res[b + 1])); merge(s.countries, pairs(res[b + 2])); merge(s.devices, pairs(res[b + 3]));
    const clk = pairs(res[b + 4]);
    merge(s.linkClicks, clk);
    s.clicks += Object.values(clk).reduce((a, v) => a + v, 0);
    s.views += views; s.visitorDays += visitors;
    s.days.push({ day, views, visitors });
  });
  const parse = (a: unknown) => ((a as string[]) ?? []).map((x) => { try { return JSON.parse(x); } catch { return null; } }).filter(Boolean);
  s.log = parse(res[n * 6]);
  s.audit = parse(res[n * 6 + 1]);
  return s;
}
