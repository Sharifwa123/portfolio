/**
 * Minimal Redis-command store.
 *  - Production: Upstash Redis over REST (Vercel Marketplace → Upstash / KV). No dependency.
 *  - Local dev: JSON file at .data/store.json.
 *  - Vercel without Redis configured: in-memory (NOT persistent, admin warns).
 * Commands used: HINCRBY HGETALL PFADD PFCOUNT LPUSH LTRIM LRANGE GET SET INCR EXPIRE.
 */
import { env } from './env';

export type Cmd = (string | number)[];
export interface Store {
  kind: 'upstash' | 'file' | 'memory';
  persistent: boolean;
  run(cmds: Cmd[]): Promise<unknown[]>;
}

class UpstashStore implements Store {
  kind = 'upstash' as const;
  persistent = true;
  constructor(private url: string, private token: string) {}
  async run(cmds: Cmd[]) {
    if (!cmds.length) return [];
    const res = await fetch(`${this.url}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(cmds),
    });
    if (!res.ok) throw new Error(`store ${res.status}`);
    const out = (await res.json()) as { result?: unknown; error?: string }[];
    return out.map((o) => {
      if (o.error) throw new Error(o.error);
      return o.result;
    });
  }
}

type Data = { s: Record<string, string>; h: Record<string, Record<string, number>>; l: Record<string, string[]>; p: Record<string, Set<string>>; x: Record<string, number> };

class MemoryStore implements Store {
  kind: 'file' | 'memory' = 'memory';
  persistent = false;
  protected d: Data = { s: {}, h: {}, l: {}, p: {}, x: {} };
  protected async save() {}
  async run(cmds: Cmd[]) {
    const out: unknown[] = [];
    const now = Date.now();
    for (const [c, k, ...a] of cmds) {
      const key = String(k);
      if (this.d.x[key] && this.d.x[key] < now) for (const t of ['s', 'h', 'l', 'p'] as const) delete (this.d[t] as Record<string, unknown>)[key];
      switch (String(c).toUpperCase()) {
        case 'HINCRBY': { const h = (this.d.h[key] ??= {}); const f = String(a[0]); h[f] = (h[f] ?? 0) + Number(a[1]); out.push(h[f]); break; }
        case 'HGETALL': { const h = this.d.h[key] ?? {}; out.push(Object.entries(h).flatMap(([f, v]) => [f, String(v)])); break; }
        case 'PFADD': { (this.d.p[key] ??= new Set()).add(String(a[0])); out.push(1); break; }
        case 'PFCOUNT': out.push(this.d.p[key]?.size ?? 0); break;
        case 'LPUSH': { (this.d.l[key] ??= []).unshift(String(a[0])); out.push(this.d.l[key].length); break; }
        case 'LTRIM': { const l = this.d.l[key]; if (l) this.d.l[key] = l.slice(Number(a[0]), Number(a[1]) + 1); out.push('OK'); break; }
        case 'LRANGE': { const l = this.d.l[key] ?? []; out.push(l.slice(Number(a[0]), Number(a[1]) + 1)); break; }
        case 'GET': out.push(this.d.s[key] ?? null); break;
        case 'SET': this.d.s[key] = String(a[0]); out.push('OK'); break;
        case 'INCR': { const n = Number(this.d.s[key] ?? 0) + 1; this.d.s[key] = String(n); out.push(n); break; }
        case 'EXPIRE': this.d.x[key] = now + Number(a[0]) * 1000; out.push(1); break;
        default: throw new Error(`unsupported ${c}`);
      }
    }
    await this.save();
    return out;
  }
}

class FileStore extends MemoryStore {
  kind = 'file' as const;
  persistent = true;
  private path = '.data/store.json';
  private loaded = false;
  async run(cmds: Cmd[]) {
    if (!this.loaded) {
      this.loaded = true;
      try {
        const { readFile } = await import('node:fs/promises');
        const raw = JSON.parse(await readFile(this.path, 'utf8'));
        this.d = { s: raw.s ?? {}, h: raw.h ?? {}, l: raw.l ?? {}, x: raw.x ?? {}, p: Object.fromEntries(Object.entries(raw.p ?? {}).map(([k, v]) => [k, new Set(v as string[])])) };
      } catch { /* first run */ }
    }
    return super.run(cmds);
  }
  protected async save() {
    const { writeFile, mkdir } = await import('node:fs/promises');
    await mkdir('.data', { recursive: true });
    const p = Object.fromEntries(Object.entries(this.d.p).map(([k, v]) => [k, [...v]]));
    await writeFile(this.path, JSON.stringify({ ...this.d, p }));
  }
}

let cached: Store | undefined;
export function getStore(): Store {
  if (cached) return cached;
  const url = env('UPSTASH_REDIS_REST_URL') ?? env('KV_REST_API_URL');
  const token = env('UPSTASH_REDIS_REST_TOKEN') ?? env('KV_REST_API_TOKEN');
  if (url && token) cached = new UpstashStore(url.replace(/\/$/, ''), token);
  else if (env('VERCEL')) cached = new MemoryStore();
  else cached = new FileStore();
  return cached;
}
