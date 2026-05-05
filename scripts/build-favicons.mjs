// scripts/build-favicons.mjs
// Generate favicon set from public/MinecraftPFP-BigBadVamp.png.
// Outputs: favicon.png (32×32), favicon-16.png, favicon-180.png (apple-touch-icon).

import sharp from 'sharp';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const root = join(__dirname, '..');
const src = join(root, 'public', 'MinecraftPFP-BigBadVamp.png');

const targets = [
  { name: 'favicon.png', size: 32 },
  { name: 'favicon-16.png', size: 16 },
  { name: 'favicon-180.png', size: 180 }, // apple-touch-icon
  { name: 'favicon-192.png', size: 192 }, // android-chrome
  { name: 'favicon-512.png', size: 512 }, // android-chrome
];

for (const t of targets) {
  const out = join(root, 'public', t.name);
  await sharp(src)
    .resize(t.size, t.size, { kernel: 'nearest' })  // pixel art — no smoothing
    .png({ compressionLevel: 9 })
    .toFile(out);
  console.log(`favicon: wrote ${t.name} (${t.size}×${t.size})`);
}
