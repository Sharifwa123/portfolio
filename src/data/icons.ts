import * as si from 'simple-icons';

export interface IconDef { label: string; path?: string; stroke?: string }

const brand = (label: string, i: { path: string }): IconDef => ({ label, path: i.path });
const line = (label: string, stroke: string): IconDef => ({ label, stroke });

/** Preset icons. Brand marks come from the CC0 simple-icons set; the rest are plain line icons. */
export const ICONS: Record<string, IconDef> = {
  globe: line('Website', '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/>'),
  link: line('Link', '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'),
  mail: line('Email', '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'),
  phone: line('Phone', '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>'),
  user: line('Profile', '<circle cx="12" cy="9" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>'),
  briefcase: line('Work', '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 13h18"/>'),
  file: line('Document / CV', '<path d="M7 3h7l5 5v13H7zM14 3v5h5"/>'),
  book: line('Book', '<path d="M5 4h14v16H7a2 2 0 0 1-2-2zM9 8h6"/>'),
  code: line('Code', '<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>'),
  download: line('Download', '<path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14"/>'),
  play: line('Video', '<path d="M8 5v14l11-7z"/>'),
  linkedin: line('LinkedIn', '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 11v6M8 7.5v.01M12 17v-6M12 13.5a2.5 2.5 0 0 1 5 0V17"/>'),
  github: brand('GitHub', si.siGithub),
  gitlab: brand('GitLab', si.siGitlab),
  x: brand('X', si.siX),
  instagram: brand('Instagram', si.siInstagram),
  facebook: brand('Facebook', si.siFacebook),
  youtube: brand('YouTube', si.siYoutube),
  tiktok: brand('TikTok', si.siTiktok),
  whatsapp: brand('WhatsApp', si.siWhatsapp),
  telegram: brand('Telegram', si.siTelegram),
  signal: brand('Signal', si.siSignal),
  discord: brand('Discord', si.siDiscord),
  threads: brand('Threads', si.siThreads),
  bluesky: brand('Bluesky', si.siBluesky),
  mastodon: brand('Mastodon', si.siMastodon),
  reddit: brand('Reddit', si.siReddit),
  snapchat: brand('Snapchat', si.siSnapchat),
  pinterest: brand('Pinterest', si.siPinterest),
  twitch: brand('Twitch', si.siTwitch),
  spotify: brand('Spotify', si.siSpotify),
  npm: brand('npm', si.siNpm),
  vercel: brand('Vercel', si.siVercel),
  googleplay: brand('Google Play', si.siGoogleplay),
  stackoverflow: brand('Stack Overflow', si.siStackoverflow),
  medium: brand('Medium', si.siMedium),
  devto: brand('DEV', si.siDevdotto),
  hashnode: brand('Hashnode', si.siHashnode),
  substack: brand('Substack', si.siSubstack),
  behance: brand('Behance', si.siBehance),
  dribbble: brand('Dribbble', si.siDribbble),
  producthunt: brand('Product Hunt', si.siProducthunt),
  patreon: brand('Patreon', si.siPatreon),
  kofi: brand('Ko-fi', si.siKofi),
  buymeacoffee: brand('Buy Me a Coffee', si.siBuymeacoffee),
  upwork: brand('Upwork', si.siUpwork),
  fiverr: brand('Fiverr', si.siFiverr),
  paypal: brand('PayPal', si.siPaypal),
  orcid: brand('ORCID', si.siOrcid),
  googlescholar: brand('Google Scholar', si.siGooglescholar),
};

const HOSTS: [RegExp, string][] = [
  [/(^|\.)github\.com$/, 'github'], [/(^|\.)gitlab\.com$/, 'gitlab'], [/(^|\.)linkedin\.com$/, 'linkedin'],
  [/(^|\.)(x|twitter)\.com$/, 'x'], [/(^|\.)instagram\.com$/, 'instagram'], [/(^|\.)(facebook|fb)\.com$/, 'facebook'],
  [/(^|\.)(youtube\.com|youtu\.be)$/, 'youtube'], [/(^|\.)tiktok\.com$/, 'tiktok'], [/(^|\.)(wa\.me|whatsapp\.com)$/, 'whatsapp'],
  [/(^|\.)(t\.me|telegram\.org)$/, 'telegram'], [/(^|\.)signal\.(me|org)$/, 'signal'], [/(^|\.)discord\.(gg|com)$/, 'discord'],
  [/(^|\.)threads\.net$/, 'threads'], [/(^|\.)bsky\.app$/, 'bluesky'], [/(^|\.)reddit\.com$/, 'reddit'], [/(^|\.)snapchat\.com$/, 'snapchat'],
  [/(^|\.)pinterest\.com$/, 'pinterest'], [/(^|\.)twitch\.tv$/, 'twitch'], [/(^|\.)spotify\.com$/, 'spotify'],
  [/(^|\.)npmjs\.com$/, 'npm'], [/(^|\.)vercel\.app$/, 'vercel'], [/^play\.google\.com$/, 'googleplay'],
  [/(^|\.)stackoverflow\.com$/, 'stackoverflow'], [/(^|\.)medium\.com$/, 'medium'], [/(^|\.)dev\.to$/, 'devto'],
  [/(^|\.)hashnode\.(com|dev)$/, 'hashnode'], [/(^|\.)substack\.com$/, 'substack'], [/(^|\.)behance\.net$/, 'behance'],
  [/(^|\.)dribbble\.com$/, 'dribbble'], [/(^|\.)producthunt\.com$/, 'producthunt'], [/(^|\.)patreon\.com$/, 'patreon'],
  [/(^|\.)ko-fi\.com$/, 'kofi'], [/(^|\.)buymeacoffee\.com$/, 'buymeacoffee'], [/(^|\.)upwork\.com$/, 'upwork'],
  [/(^|\.)fiverr\.com$/, 'fiverr'], [/(^|\.)paypal\.(com|me)$/, 'paypal'], [/(^|\.)orcid\.org$/, 'orcid'],
  [/(^|\.)scholar\.google\.com$/, 'googlescholar'],
];

/** Pick a sensible preset from the URL when the admin leaves the icon on Auto. */
export function guessIcon(url: string): string {
  if (url.startsWith('mailto:')) return 'mail';
  if (url.startsWith('tel:')) return 'phone';
  try {
    const host = new URL(url).hostname.toLowerCase();
    for (const [re, name] of HOSTS) if (re.test(host)) return name;
  } catch { /* fall through */ }
  return 'globe';
}
