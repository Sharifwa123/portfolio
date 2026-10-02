export type Link = { label: string; href: string };
export type Block = { title: string; body: string };

export interface CaseStudy {
  slug: string;
  index: string;
  name: string;
  kind: string;
  tagline: string;
  summary: string;
  status: { label: string; tone: 'live' | 'beta' | 'build' };
  facts: { k: string; v: string }[];
  stack: string[];
  problem: string;
  built: string[];
  architecture: { caption: string; tree: string; note?: string };
  decisions: Block[];
  limits: string[];
  links: Link[];
  seo: string;
}

export const FLAGSHIP: CaseStudy[] = [
  {
    slug: 'saiba',
    index: '01',
    name: 'SAIBA',
    kind: 'AI business assistant platform',
    tagline: 'A WhatsApp-first assistant that answers customers from a business’s own knowledge and hands over to a person when it should.',
    summary:
      'Multi-tenant platform: a web dashboard, a mobile app and a Python backend that connects WhatsApp and other channels to an assistant grounded in each business’s own documents, with commerce, billing tiers and human escalation.',
    status: { label: 'Platform live · Android APK · not on Play Store', tone: 'live' },
    facts: [
      { k: 'Role', v: 'Backend, web, mobile and deployment, built under Sharif Technologies' },
      { k: 'Scale of code', v: 'About 15,000 lines of Python in the app package; 31 backend test files' },
      { k: 'Source', v: 'Private repository' },
    ],
    stack: ['Python', 'FastAPI', 'PostgreSQL', 'Alembic', 'Qdrant', 'Gemini API', 'React + Vite', 'Tailwind 4', 'Expo / React Native', 'Docker + Caddy', 'Paystack'],
    problem:
      'Small businesses answer the same customer questions on WhatsApp all day, and a generic chatbot either invents answers or never lets a human step in. The product needs to answer from the business’s own policies and catalogue, know its limits, and escalate cleanly.',
    built: [
      'A retrieval-augmented assistant that ingests PDF, Word and spreadsheet files and answers from them through a vector store.',
      'A WhatsApp channel adapter, plus OAuth readers for Facebook, Instagram, TikTok and YouTube feeds.',
      'Escalation rules so a conversation reaches a person when the assistant should not answer, with overdue follow-up tracking.',
      'Commerce hooks and Paystack payment routing, with plan tiers (Starter, Growth, Scale) that gate features from one place.',
      'Authentication with passkeys (WebAuthn), Google Sign-In and web push notifications.',
      'A React dashboard, an Expo mobile app, Docker packaging behind Caddy, and APK releases published automatically to a public repository.',
    ],
    architecture: {
      caption: 'Backend folder map, from the project’s ARCHITECTURE document',
      tree: `app/
  core/            config, db session, hashing
  models/          SQLAlchemy models by domain
  billing/         tiers + the one feature gate
  ai/              RAG engine, provider resolver
                   (knows nothing about WhatsApp or Shopify)
  integrations/
    base.py        ChannelProvider · CommerceProvider · SocialProvider
    registry.py    the only file that lists every integration
    channels/whatsapp/
    commerce/      shopify · woocommerce · custom (stubs)
    social/        facebook · instagram · tiktok · youtube
  api/routers/     auth, bots, admin, support
  main.py          assembles the app, no business logic`,
      note: 'Shopify, WooCommerce and custom-shop commerce providers are stubs behind the contract. They are not shipped integrations.',
    },
    decisions: [
      {
        title: 'Three contracts instead of one growing file',
        body: 'The original service lived in one 1,000-line main module. Every integration is now a ChannelProvider, CommerceProvider or SocialProvider registered in one place, so a Shopify bug cannot break WhatsApp.',
      },
      {
        title: 'Billing is a single dependency, not scattered checks',
        body: 'Routes declare require_feature("name"). Changing a plan or gating a new feature touches the tier table only, never integration code.',
      },
      {
        title: 'Explicit model-provider resolution',
        body: 'A tenant’s own key is used first, then their backup key, then a platform fallback only if one is really configured. Otherwise the request fails with a clear configuration error. A local embedding fallback was removed because it bypassed that routing.',
      },
      {
        title: 'Migrations over startup ALTERs',
        body: 'The first version patched its schema with ALTER TABLE statements at every boot. The schema is now versioned with Alembic and applied by the container entrypoint.',
      },
    ],
    limits: [
      'The Android app is distributed as APK releases because it is not on Google Play yet.',
      'Commerce providers beyond the custom path are stubs.',
      'I could not load the live site from my research environment, so its availability is stated from the project’s own documentation.',
    ],
    links: [
      { label: 'saiba.shariftechnologies.online', href: 'https://saiba.shariftechnologies.online/' },
      { label: 'Android APK releases', href: 'https://github.com/Sharifwa123/Saiba' },
    ],
    seo: 'Case study: SAIBA, a multi-tenant WhatsApp-first AI assistant platform built with FastAPI, PostgreSQL, Qdrant, React and Expo.',
  },
  {
    slug: 'sink',
    index: '02',
    name: 'Sink',
    kind: 'Offline mesh messenger for Android',
    tagline: 'End-to-end encrypted messages relayed phone to phone with no server, account or phone number.',
    summary:
      'An Android-first messenger whose routing and cryptography live in a pure-Kotlin engine with no Android dependency, proven by simulated multi-hop networks. SMS is an explicit, user-confirmed last resort.',
    status: { label: 'Working build · debug releases', tone: 'build' },
    facts: [
      { k: 'Role', v: 'Design, protocol, engine, app and CI' },
      { k: 'Tests', v: '43 automated engine tests, run in CI' },
      { k: 'Code', v: '111 Kotlin files across engine, core and feature modules' },
      { k: 'Source', v: 'Public' },
    ],
    stack: ['Kotlin', 'Jetpack Compose', 'Room', 'Hilt', 'Nearby Connections', 'WorkManager', 'Android Keystore', 'JCA crypto', 'Gradle', 'GitHub Actions'],
    problem:
      'When connectivity fails, messaging usually fails with it. Sink asks how far people can still talk using only the phones around them, and what that costs in security and reliability.',
    built: [
      'A routing engine using TTL- and hop-bounded flooding, duplicate suppression, ACK propagation and store-and-forward retry with exponential backoff.',
      'A signed, versioned binary wire protocol with a self-certifying HELLO identity handshake.',
      'End-to-end encryption using ephemeral ECDH, HKDF-SHA256 and AES-256-GCM, with ECDSA signatures on packets.',
      'A hardware-backed device identity: a non-exportable Keystore signing key, with StrongBox where available.',
      'Nearby Connections and SMS transports, a foreground service, and a settings screen where each toggle is functionally wired.',
      'A real mesh view and honest connectivity states. It shows direct connections only and never fabricates a topology.',
    ],
    architecture: {
      caption: 'Repository layout',
      tree: `engine/                pure Kotlin/JVM, no Android dependency
  protocol/            packet format, ids, codecs
  crypto-core/         ECDH · ECDSA · AES-GCM · HKDF (JCA)
  mesh-engine/         RoutingEngine, TransportManager,
                       mesh simulator + tests
app/                   Compose entry point, DI wiring
core/                  common · crypto · database · datastore
                       networking · logging · permissions
feature/               onboarding · home · conversations · chat
                       contacts · discovery · mesh · settings`,
      note: 'The engine builds and tests anywhere with a JDK, without the Android SDK. The Android project includes it as a composite build.',
    },
    decisions: [
      {
        title: 'Flooding over topology-aware routing',
        body: 'Neighbours change as people walk and phones sleep, so keeping a current topology graph is costly. Bounded flooding with a dedup cache degrades gracefully: a lost relay removes one path, not a routing table. This is recorded as a deliberate MVP-scope decision.',
      },
      {
        title: 'Keep the engine free of Android',
        body: 'Routing, crypto and protocol code can be unit-tested on the JVM and exercised by a simulator that stands in for real radios.',
      },
      {
        title: 'Security documents ship inside the app',
        body: 'The security and threat-model documents are bundled as assets and readable from the About screen, so users see the limits as well as the claims.',
      },
      {
        title: 'Block enforcement at the routing layer',
        body: 'Blocked contacts have their keys withheld in the routing layer, not only hidden in the interface.',
      },
    ],
    limits: [
      'Traffic analysis is not defended against: packet size, timing and sender/destination ids are visible to relays. This is disclosed in the threat model.',
      'First contact relies on trust-on-first-use unless the user verifies a safety number.',
      'Published builds are debug-signed. A versioned signed release awaits release-signing setup.',
      'Throughput and battery behaviour in large real-world meshes have not been measured.',
    ],
    links: [
      { label: 'Source on GitHub', href: 'https://github.com/Sharifwa123/Sink' },
      { label: 'Threat model', href: 'https://github.com/Sharifwa123/Sink/blob/main/docs/THREAT_MODEL.md' },
      { label: 'Latest debug build', href: 'https://github.com/Sharifwa123/Sink/releases/tag/latest-debug' },
    ],
    seo: 'Case study: Sink, an Android offline mesh messenger with end-to-end encryption, a pure-Kotlin routing engine and 43 automated tests.',
  },
  {
    slug: 'nova',
    index: '03',
    name: 'NOVA',
    kind: 'Programming language and toolchain',
    tagline: 'A language that reads like plain instructions and compiles to pages and live HTTP services, with zero dependencies.',
    summary:
      'A complete pipeline from lexer to interpreter, plus a PAGE compiler that emits HTML and JavaScript and a SERVICE runtime that serves API routes and compiled pages from one file. Built decision-record first.',
    status: { label: 'Published on npm · repo ahead of npm', tone: 'beta' },
    facts: [
      { k: 'Role', v: 'Language design, implementation, tooling' },
      { k: 'Verification', v: '300+ unit tests and 57 examples run through the real CLI, per the repository handoff' },
      { k: 'Design record', v: '19 architecture decision records' },
      { k: 'Dependencies', v: 'None' },
    ],
    stack: ['JavaScript (ESM)', 'Node.js', 'npm', 'VS Code extension', 'MIT licence'],
    problem:
      'Most stacks need a different language for logic, data, pages and API. NOVA explores one readable language across those layers, small enough to specify and test completely.',
    built: [
      'Lexer, parser, AST, semantic analyzer and tree-walking interpreter for SHOW / SET / CHANGE / IF / FOR EACH / REPEAT / DO / RETURN.',
      'Lists, records, typed procedures, DATA named types, TRY / CATCH, a standard library and ASK input.',
      'Persistence with SAVE, GET and DELETE, durable across a real server restart.',
      'A PAGE compiler covering static HTML, data-bound content and interactive pages, where BUTTON and WHEN CLICKED compile to JavaScript.',
      'SERVICE / API: a live HTTP server with GET, POST with typed request bodies, DELETE and :id path parameters, serving compiled pages alongside the API.',
      'FORM and INPUT for typed user input, plus an editor extension for VS Code.',
    ],
    architecture: {
      caption: 'Compiler and runtime layout, from src/',
      tree: `src/
  lexer/  parser/  ast/
  analyzer/        semantic checks, diagnostics
  interpreter/     tree-walking evaluator
  stdlib/          standard library
  persistence/     SAVE / GET / DELETE, durable store
  pagecompiler/    NOVA -> HTML + JavaScript
  apiserver/       SERVICE / API -> live HTTP
  cli.js           nova run | build | serve`,
      note: 'Example source from the repository:\n\nSET total = 0\nFOR EACH product IN products\n    SHOW "{product.name}: {product.price}"\n    CHANGE total = total + product.price\nEND',
    },
    decisions: [
      {
        title: 'ADR before code',
        body: 'Every real design choice has a record with options and reasoning, and each record lists what is deferred, so a missing feature reads as a decision rather than an accident.',
      },
      {
        title: 'Smallest correct version per milestone',
        body: 'Features land one milestone at a time, from v0.1 to v0.18, and the repository handoff forbids bundling adjacent milestones.',
      },
      {
        title: 'Verify through the real CLI',
        body: 'Generated pages are executed rather than string-matched, durability is checked by killing a spawned server and reading back from a second process, and DELETE routes are checked with a real curl.',
      },
      {
        title: 'No dependencies',
        body: 'Installing it reports one package. Nothing transitive to audit, and the whole toolchain stays readable.',
      },
    ],
    limits: [
      'The npm registry lists 0.15.1 as latest while the repository is at v0.18. Install from the repository for the newest features.',
      'It is a tree-walking interpreter, not an optimising compiler. It is a language exploration, not a production runtime.',
      'The language is young and has no third-party users that I can point to.',
    ],
    links: [
      { label: 'Source on GitHub', href: 'https://github.com/Sharifwa123/nova-lang' },
      { label: 'npm: nova-lang', href: 'https://www.npmjs.com/package/nova-lang' },
      { label: 'Decision records', href: 'https://github.com/Sharifwa123/nova-lang/tree/main/docs/adr' },
    ],
    seo: 'Case study: NOVA, a dependency-free natural-reading programming language with a PAGE compiler and live HTTP services, published on npm.',
  },
  {
    slug: 'forge30',
    index: '04',
    name: 'Forge30',
    kind: 'Developer programme platform',
    tagline: 'Applications, status lookup, an admin area and verifiable student ID cards for a 30-day, 60-hour developer programme.',
    summary:
      'The full web system behind Sharif Technologies’ Developer Forge: apply, track, confirm, issue a printable card with a QR verification page, and administer the cohort, tested across six viewports.',
    status: { label: 'Public beta on Vercel', tone: 'beta' },
    facts: [
      { k: 'Role', v: 'Product, full-stack build, security, deployment' },
      { k: 'Testing', v: 'Unit, API and security, six-viewport browser and full-journey tests' },
      { k: 'Source', v: 'Public' },
    ],
    stack: ['Next.js 15 App Router', 'TypeScript', 'PostgreSQL (pg)', 'Zod', 'Plain CSS', 'Vercel'],
    problem:
      'Running a cohort needs more than a form: applicants need to check their status, organisers need control, and confirmed students need an identity that others can verify without exposing their data.',
    built: [
      'A multi-step application and a status lookup that signs a student in with a reference code and email, remembering the device for 30 days.',
      'A dashboard showing status, announcements, cohort info, group, class time and seat.',
      'On confirmation, an automatically issued student ID and a non-guessable serial. Students upload a passport photo that is re-encoded server-side with EXIF stripped, then download a CR80 card at 300 dpi.',
      'A QR code that opens a verify page showing only name, ID and active or inactive.',
      'An admin area for applications, cohort settings and exports, with an audit log of admin actions.',
    ],
    architecture: {
      caption: 'Application routes, from src/app',
      tree: `src/app/
  apply/  status/  dashboard/     applicant journey
  v/  verify/  scan/              card verification
  admin/                          cohort + applications
  api/                            validated endpoints
  opengraph-image.tsx  sitemap.ts  robots.ts
tests/   unit · e2e · browser (6 viewports) · journey · card`,
    },
    decisions: [
      {
        title: 'Security as a checklist in the codebase',
        body: 'Zod validation on every endpoint, parameterised SQL only, Origin checks on state-changing routes, SameSite=Strict admin cookie, database-backed rate limits, constant-time password comparison, CSV formula-injection neutralisation, and noindex plus no-store on admin.',
      },
      {
        title: 'Verification reveals the minimum',
        body: 'The public verify page shows name, ID and status only. Setting a student away from Confirmed deactivates the card, and admin notes are never returned by any public route.',
      },
      {
        title: 'No animation or UI libraries',
        body: 'Plain CSS keeps the bundle small and the behaviour predictable on low-end phones.',
      },
    ],
    limits: [
      'Public beta: the programme and its numbers are still being established.',
      'I could not load the deployed beta from my research environment, so its availability is stated from the repository.',
    ],
    links: [
      { label: 'Live beta', href: 'https://forge30-beta.vercel.app' },
      { label: 'Source on GitHub', href: 'https://github.com/Sharifwa123/Forge30' },
    ],
    seo: 'Case study: Forge30, a Next.js 15 and Postgres platform for a developer programme, with verifiable QR student cards and a hardened admin area.',
  },
];

export interface MinorProject {
  name: string;
  tier: 'Programme' | 'Publishing' | 'Experiment' | 'Earlier work';
  line: string;
  state: string;
  stack: string;
  href?: string;
}

export const OTHER: MinorProject[] = [
  {
    name: 'Git & GitHub: From Zero to Mastery',
    tier: 'Publishing',
    line: 'A beginner-to-expert book: 81 chapters, 14 appendices, exercises, solutions and a glossary. Its 356-row research ledger records the evidence class of each technical claim. PDF/UA and PDF/A screen and print editions and an EPUB are built and validated in CI.',
    state: 'Manuscript complete · ISBN pending',
    stack: 'Python tooling · veraPDF · EPUBCheck',
    href: 'https://github.com/Sharifwa123/Books',
  },
  {
    name: 'CodeCast',
    tier: 'Experiment',
    line: 'An Android app that turns a codebase into a video-tutorial plan. Clean architecture on Jetpack Compose and Room, with APKs built by GitHub Actions.',
    state: 'Early prototype',
    stack: 'Kotlin · Compose · Room',
    href: 'https://github.com/Sharifwa123/CodeCast',
  },
  {
    name: 'SignalHunter',
    tier: 'Earlier work',
    line: 'An Android app that detects and analyses nearby wireless signals and networks.',
    state: 'Built · not public',
    stack: 'Kotlin',
  },
  {
    name: 'Sharif TeamHub',
    tier: 'Earlier work',
    line: 'A team-management web product for small teams, aimed at coordinating work without heavyweight tooling.',
    state: 'Built · not public',
    stack: 'JavaScript',
  },
  {
    name: 'WAEC Study Intelligence System',
    tier: 'Earlier work',
    line: 'An AI-assisted study platform for students preparing for WAEC exams.',
    state: 'In development · no public repository',
    stack: 'Planned',
  },
];

export const OPEN_SOURCE = [
  { name: 'Sink', lang: 'Kotlin', note: 'Offline mesh messenger, with a CI-built debug release.', href: 'https://github.com/Sharifwa123/Sink' },
  { name: 'nova-lang', lang: 'JavaScript', note: 'Language, compiler and runtime. MIT. On npm.', href: 'https://github.com/Sharifwa123/nova-lang' },
  { name: 'Forge30', lang: 'TypeScript', note: 'Next.js 15 programme platform, deployed on Vercel.', href: 'https://github.com/Sharifwa123/Forge30' },
  { name: 'Books', lang: 'Python', note: 'Manuscript, research ledger and validated build pipeline.', href: 'https://github.com/Sharifwa123/Books' },
  { name: 'CodeCast', lang: 'Kotlin', note: 'Codebase-to-video tutorial studio prototype.', href: 'https://github.com/Sharifwa123/CodeCast' },
  { name: 'Saiba', lang: 'Releases', note: 'Signed Android APK downloads for SAIBA. No source.', href: 'https://github.com/Sharifwa123/Saiba' },
] as const;
