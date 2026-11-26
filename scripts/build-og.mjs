// scripts/build-og.mjs
// Crop the (watermark-free) Gemini banner in art-raw/ to the 1200x630 OG image.
// Run via `node scripts/build-og.mjs`. Output: public/og.png

import sharp from 'sharp';

const out = await sharp('art-raw/og-banner.png')
  .resize(1200, 630, { fit: 'cover', position: 'centre' })
  .flatten({ background: '#ffffff' })
  .png({ compressionLevel: 9, palette: true, quality: 90, effort: 10 })
  .toFile('public/og.png');

console.log(`og: wrote public/og.png (${out.size} bytes)`);
