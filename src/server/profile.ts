import { SITE } from '../data/site';
import { getStore } from './store';

export interface Profile {
  role: string;
  location: string;
  headline: string; // *text* is shown in italic accent
  lede: string;
  description: string; // meta description / search snippet
  about: string; // paragraphs separated by a blank line
  services: string[];
}

export const DEFAULT_PROFILE: Profile = {
  role: SITE.role,
  location: SITE.location,
  headline: 'I build *technology*, secure it, and teach it.',
  lede: 'Founder of Sharif Technologies, based in Ghana. I build AI products, encrypted offline messaging and a programming language, run a developer programme, and write a technical book. Each is documented with what works, what does not, and how it was tested.',
  description: SITE.description,
  about:
    'Sharif Tingane Issah is the founder of Sharif Technologies, working from Wenchi in Ghana’s Bono Region and with clients remotely.\n\nThe company does software development, cybersecurity and IT training, with cloud setup and network support on request. The products on this page are the company’s own, and the same process applies to client work.',
  services: ['Software development', 'Cybersecurity', 'IT training', 'Cloud & network'],
};

export async function getProfile(): Promise<Profile> {
  try {
    const [raw] = (await getStore().run([['GET', 'profile']])) as (string | null)[];
    return raw ? { ...DEFAULT_PROFILE, ...JSON.parse(raw) } : DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}
export const saveProfile = (p: Profile) => getStore().run([['SET', 'profile', JSON.stringify(p)]]);

export function profileFromForm(f: FormData): Profile | string {
  const g = (k: string) => String(f.get(k) ?? '').replace(/\r/g, '').trim();
  const p: Profile = {
    role: g('role').slice(0, 100), location: g('location').slice(0, 100), headline: g('headline').slice(0, 160),
    lede: g('lede').slice(0, 600), description: g('description').slice(0, 220), about: g('about').slice(0, 2500),
    services: g('services').split(',').map((s) => s.trim().slice(0, 40)).filter(Boolean).slice(0, 12),
  };
  if (!p.role || !p.headline || !p.lede) return 'Role, headline and intro are required.';
  if ((p.headline.match(/\*/g)?.length ?? 0) % 2) return 'Headline: close every * (use *word* for the highlighted part).';
  if (!p.description) return 'Add a search description.';
  return p;
}
