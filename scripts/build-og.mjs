// scripts/build-og.mjs
// Build the 1200x630 OG image: the (watermark-free) Gemini banner in art-raw/,
// with a taped polaroid of the hand-drawn portrait placed over the banner's right side.
// Needs Google Chrome (override with CHROME=/path). Output: public/og.jpg

import sharp from 'sharp';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

// Render the polaroid caption in the site's own handwriting font. Sharp can't load
// web fonts without fontconfig, so a headless Chrome screenshot does the lettering.
function caption(text, w, h) {
  const dir = mkdtempSync(join(tmpdir(), 'og-'));
  const font = resolve('public/fonts/GochiHand-Regular.woff2');
  writeFileSync(join(dir, 'c.html'), `<style>@font-face{font-family:G;src:url('file://${font}')}
    html,body{margin:0;background:transparent}
    p{margin:0;width:${w}px;height:${h}px;display:grid;place-items:center;white-space:nowrap;font:32px G;color:#1f1d1a}</style><p>${text}</p>`);
  const out = join(dir, 'c.png');
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--default-background-color=00000000',
    `--window-size=${w},${h}`, `--screenshot=${out}`, `file://${join(dir, 'c.html')}`], { stdio: 'ignore' });
  return out;
}

const CLEAR = { r: 0, g: 0, b: 0, alpha: 0 };
const PW = 340, PH = 410, PHOTO = 300, M = 20; // polaroid size, photo size, frame margin

const photo = await sharp('src/assets/portrait.webp').resize(PHOTO, PHOTO, { fit: 'cover', position: 'top' }).png().toBuffer();

const frame = await sharp({ create: { width: PW, height: PH, channels: 4, background: '#ffffff' } })
  .composite([
    { input: Buffer.from(`<svg width="${PW}" height="${PH}"><rect x="0.5" y="0.5" width="${PW - 1}" height="${PH - 1}" fill="none" stroke="#000" stroke-opacity="0.08"/><rect x="${M - 1}" y="${M - 1}" width="${PHOTO + 2}" height="${PHOTO + 2}" fill="#1f1d1a"/></svg>`) },
    { input: photo, left: M, top: M },
    { input: await sharp(caption('fig. 1: me (@vamp)', PW - 2 * M, PH - PHOTO - 2 * M)).png().toBuffer(), left: M, top: PHOTO + M + 6 },
  ])
  .png()
  .toBuffer();

// tape strip + soft shadow, then tilt the whole thing
const T = 60; // room around the polaroid for tape, shadow and rotation
const polaroid = await sharp({ create: { width: PW + T * 2, height: PH + T * 2, channels: 4, background: CLEAR } })
  .composite([
    { input: await sharp({ create: { width: PW, height: PH, channels: 4, background: { r: 60, g: 40, b: 10, alpha: 0.35 } } }).png().toBuffer(), left: T + 6, top: T + 14 },
  ])
  .blur(10)
  .composite([
    { input: frame, left: T, top: T },
    { input: Buffer.from(`<svg width="150" height="40"><rect width="150" height="40" fill="#ffe27a" fill-opacity="0.75" transform="rotate(-4 75 20)"/></svg>`), left: T + PW / 2 - 75, top: T - 18 },
  ])
  .png()
  .toBuffer();

const tilted = await sharp(polaroid).rotate(4, { background: CLEAR }).png().toBuffer();
const tm = await sharp(tilted).metadata();

const out = await sharp('art-raw/og-banner.png')
  .composite([{ input: tilted, left: Math.round(975 - tm.width / 2), top: Math.round(384 - tm.height / 2) }])
  .png()
  .toBuffer();

const info = await sharp(out)
  .resize(1200, 630, { fit: 'cover', position: 'centre' })
  .flatten({ background: '#ffffff' })
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile('public/og.jpg');

console.log(`og: wrote public/og.jpg (${info.size} bytes)`);
