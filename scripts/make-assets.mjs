import sharp from 'sharp';
import { writeFileSync } from 'node:fs';
const mono = (s) => Buffer.from(s);
const icon = (size) => mono(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#e4e8ee"/><text x="32" y="45" text-anchor="middle" font-family="Georgia, serif" font-size="40" font-weight="700" fill="#0a5563">S</text></svg>`);
await sharp(icon(32)).resize(32, 32).png().toFile('public/favicon-32.png');
await sharp(icon(180)).resize(180, 180).png().toFile('public/apple-touch-icon.png');
const og = mono(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="#e4e8ee"/>
<rect x="72" y="72" width="1056" height="486" rx="20" fill="#dde2e9" stroke="#c4ccd8" stroke-width="2"/>
<text x="120" y="150" font-family="DejaVu Sans Mono, monospace" font-size="22" letter-spacing="3" fill="#566075">FOUNDER, SHARIF TECHNOLOGIES · GHANA</text>
<text x="120" y="270" font-family="Georgia, serif" font-size="76" fill="#1a2130">Sharif Tingane Issah</text>
<text x="120" y="350" font-family="Georgia, serif" font-size="38" fill="#404a5c">Founder building technology, securing it,</text>
<text x="120" y="398" font-family="Georgia, serif" font-size="38" fill="#404a5c">and teaching it.</text>
<line x1="120" y1="450" x2="1080" y2="450" stroke="#c4ccd8" stroke-width="2"/>
<text x="120" y="505" font-family="DejaVu Sans Mono, monospace" font-size="24" fill="#0a5563">SAIBA  ·  Sink  ·  NOVA  ·  Forge30</text>
</svg>`);
await sharp(og).png().toFile('public/og.png');
console.log('assets written');
