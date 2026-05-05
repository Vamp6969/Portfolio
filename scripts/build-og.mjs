// scripts/build-og.mjs
// Generate the 1200x630 OG image once. Run via `node scripts/build-og.mjs`.
// Output: public/og.png

import sharp from 'sharp';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const root = join(__dirname, '..');

const W = 1200;
const H = 630;

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#050505"/>
      <stop offset="100%" stop-color="#0a0a14"/>
    </linearGradient>
    <radialGradient id="glow1" cx="20%" cy="40%" r="40%">
      <stop offset="0%" stop-color="rgba(59,130,246,0.25)"/>
      <stop offset="100%" stop-color="rgba(59,130,246,0)"/>
    </radialGradient>
    <radialGradient id="glow2" cx="80%" cy="70%" r="40%">
      <stop offset="0%" stop-color="rgba(6,182,212,0.22)"/>
      <stop offset="100%" stop-color="rgba(6,182,212,0)"/>
    </radialGradient>
    <linearGradient id="textgrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#9ca3af"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow1)"/>
  <rect width="${W}" height="${H}" fill="url(#glow2)"/>

  <text x="80" y="180" fill="#06b6d4" font-family="ui-monospace, monospace" font-size="22" letter-spacing="2">// SYSTEMS ENGINEER &#38; FOUNDER</text>

  <text x="80" y="320" fill="url(#textgrad)" font-family="system-ui, -apple-system, sans-serif" font-size="120" font-weight="800" letter-spacing="-4">Tushar A.</text>

  <text x="80" y="410" fill="#9ca3af" font-family="system-ui, -apple-system, sans-serif" font-size="56" font-weight="800" letter-spacing="-2">I scale infrastructure.</text>

  <text x="80" y="500" fill="#9ca3af" font-family="system-ui, -apple-system, sans-serif" font-size="26">Founded a game-hosting ISP at 17 → 10,000 users on bare-metal.</text>

  <rect x="80" y="540" width="280" height="44" rx="22" fill="rgba(59,130,246,0.12)" stroke="#3b82f6" stroke-opacity="0.6"/>
  <circle cx="106" cy="562" r="6" fill="#00ff7a"/>
  <text x="124" y="569" fill="#3b82f6" font-family="ui-monospace, monospace" font-size="18">Available — full-time</text>

  <text x="${W - 80}" y="${H - 60}" text-anchor="end" fill="#666" font-family="ui-monospace, monospace" font-size="22">tushar-a.dev</text>
</svg>
`;

const avatarPath = join(root, 'public', 'MinecraftPFP-BigBadVamp.png');

const base = await sharp(Buffer.from(svg)).png().toBuffer();

// Place avatar in top-right
const AV = 200;
const avatar = await sharp(avatarPath).resize(AV, AV, { kernel: 'nearest' }).png().toBuffer();

const out = await sharp(base)
  .composite([
    { input: avatar, left: W - AV - 80, top: 80 },
  ])
  .png({ compressionLevel: 9, palette: true, quality: 90, effort: 10 })
  .toBuffer();

const outPath = join(root, 'public', 'og.png');
await sharp(out).toFile(outPath);

console.log(`og: wrote ${outPath} (${out.length} bytes)`);
