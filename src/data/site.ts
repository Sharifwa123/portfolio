export const SITE = {
  url: 'https://portfolio.shariftechnologies.online',
  name: 'Sharif Tingane Issah',
  short: 'Sharif T. Issah',
  role: 'Software engineer · Founder, Sharif Technologies',
  title: 'Sharif Tingane Issah — AI systems, secure offline software, language tooling',
  description:
    'Software engineer and founder of Sharif Technologies in Ghana. Builds AI business platforms (SAIBA), end-to-end encrypted offline messaging (Sink) and a programming language (NOVA).',
  location: 'Wenchi, Bono Region, Ghana',
  company: { name: 'Sharif Technologies', url: 'https://www.shariftechnologies.online' },
  github: 'https://github.com/Sharifwa123',
  email: 'hello@shariftechnologies.online',
  whatsapp: { label: '+233 53 702 4244', href: 'https://wa.me/233537024244' },
} as const;

export const NAV = [
  { href: '/#work', label: 'Work', id: 'work' },
  { href: '/#approach', label: 'Approach', id: 'approach' },
  { href: '/#record', label: 'Record', id: 'record' },
  { href: '/#contact', label: 'Contact', id: 'contact' },
] as const;

/** Capabilities are listed with the work that demonstrates them, never as self-rated bars. */
export const CAPABILITIES = [
  {
    area: 'AI systems',
    skills: ['Retrieval-augmented generation', 'Multi-provider model routing with fallback', 'Bring-your-own-key tenancy', 'Escalation rules for human handoff'],
    used: 'SAIBA',
  },
  {
    area: 'Backend & data',
    skills: ['Python / FastAPI', 'SQLAlchemy + Alembic migrations', 'PostgreSQL', 'Qdrant vector store', 'Node / TypeScript'],
    used: 'SAIBA, Forge30',
  },
  {
    area: 'Security & cryptography',
    skills: ['ECDH / HKDF / AES-GCM / ECDSA', 'Android Keystore identity', 'Threat modelling', 'Passkeys (WebAuthn)', 'Origin checks, rate limits, audit logs'],
    used: 'Sink, SAIBA, Forge30',
  },
  {
    area: 'Mobile',
    skills: ['Kotlin, Jetpack Compose, Room, Hilt', 'Nearby Connections, WorkManager', 'React Native / Expo'],
    used: 'Sink, CodeCast, SAIBA app',
  },
  {
    area: 'Web',
    skills: ['Next.js 15 (App Router)', 'React + Vite + Tailwind', 'Zod validation', 'Accessible, responsive UI'],
    used: 'Forge30, SAIBA',
  },
  {
    area: 'Languages & tooling',
    skills: ['Lexer, parser, analyzer, interpreter', 'HTML/JS code generation', 'CLI design', 'Architecture decision records'],
    used: 'NOVA',
  },
  {
    area: 'Delivery',
    skills: ['Docker + Caddy', 'GitHub Actions CI and APK releases', 'Vercel', 'CI-built PDF/EPUB with validators'],
    used: 'SAIBA, Sink, Forge30, Books',
  },
] as const;

export const APPROACH = [
  {
    title: 'Say what stage it is at',
    body: 'Sink’s status document opens with “Read this before trusting any other claim” and splits work into completed, partial and not implemented. Its threat model lists what is not protected, including traffic analysis.',
    ref: { label: 'Sink · IMPLEMENTATION_STATUS', href: 'https://github.com/Sharifwa123/Sink/blob/main/docs/IMPLEMENTATION_STATUS.md' },
  },
  {
    title: 'Prove behaviour, do not assert it',
    body: 'Sink’s routing engine is tested on a simulated multi-hop mesh where nodes disappear and reappear. NOVA’s server persistence is verified by killing a real process and reading the data back from a second one.',
    ref: { label: 'Sink · TESTING', href: 'https://github.com/Sharifwa123/Sink/blob/main/docs/TESTING.md' },
  },
  {
    title: 'Write the decision down first',
    body: 'NOVA has 19 architecture decision records. Each sets out the problem, the options considered, the decision with reasoning, and what is deliberately deferred.',
    ref: { label: 'NOVA · docs/adr', href: 'https://github.com/Sharifwa123/nova-lang/tree/main/docs/adr' },
  },
  {
    title: 'Keep change local',
    body: 'SAIBA was split from a single 1,000-line module into channel, commerce and social integrations behind three contracts. Adding an integration touches one folder and one registry line.',
    ref: { label: 'SAIBA case study', href: '/work/saiba' },
  },
] as const;

export type TimelineItem = { when: string; what: string; href?: string };

/** Dates are repository creation dates or dates written inside the repositories. */
export const RECORD: TimelineItem[] = [
  { when: 'Mar 2023', what: 'GitHub account created.' },
  { when: 'Jul 2026', what: 'SignalHunter, an Android wireless-signal analyser, started (private repository).' },
  { when: 'Aug 2026', what: 'TeamHub, a small-team management product, started (private). SAIBA platform build, security-hardening and commerce notes dated 17–26 August.' },
  { when: 'Sep 2026', what: 'SAIBA source moved to GitHub; Android APK releases published.', href: 'https://github.com/Sharifwa123/Saiba' },
  { when: 'Sep 2026', what: 'Sink offline mesh messenger and NOVA language repositories created (16 September).', href: '/work/sink' },
  { when: 'Sep 2026', what: 'CodeCast prototype (28 Sep). Git & GitHub book manuscript repository (29 Sep).', href: 'https://github.com/Sharifwa123/Books' },
  { when: 'Sep 2026', what: 'Forge30 programme platform created (30 Sep) and deployed as a public beta.', href: '/work/forge30' },
];

export const NOW = [
  { name: 'Forge30', state: 'Public beta on Vercel. Applications, status lookup, admin area and student cards are built.', href: '/work/forge30' },
  { name: 'SAIBA', state: 'Android app distributed as APK releases. Not yet on Google Play.', href: '/work/saiba' },
  { name: 'NOVA', state: 'Repository is at v0.18 with HTTP services, forms and durable persistence.', href: '/work/nova' },
  { name: 'Git & GitHub: From Zero to Mastery', state: 'Manuscript complete. Waiting on an ISBN and a live-account verification pass.', href: 'https://github.com/Sharifwa123/Books' },
] as const;
