// Slice watermark-free Gemini art from art-raw/ into src/assets/doodles/.
// Sheets are cut into a cols×rows grid; every piece is trimmed of white margin.
// Usage: node scripts/slice-doodles.mjs
import sharp from 'sharp';
import { existsSync, mkdirSync } from 'node:fs';

const RAW = 'art-raw';
const OUT = 'src/assets/doodles';

// file → single name, or a grid of names (row-major)
const jobs = [
  { file: 'sheet-1.png', cols: 3, rows: 2, names: ['server-rack', 'controller', 'robot', 'bug', 'plug', 'scroll'] },
  { file: 'sheet-2.png', cols: 3, rows: 2, names: ['paper-plane', 'crumpled', 'pickaxe', 'rocket', 'coffee', 'terminal'] },
];

mkdirSync(OUT, { recursive: true });

// Gemini "white" is textured off-white paper. Scale each channel so the dominant
// (paper) colour becomes white, then "un-multiply" white into alpha: every pixel
// becomes ink-colour + opacity, so the art sits on any background (paper, notes,
// night mode via CSS invert) with no blend modes.
const PAPER = 226; // ponytail: channel level treated as blank paper; raise if lines look faint, lower if grain shows

async function toTransparent(input, pad) {
  const { dominant } = await sharp(input).stats();
  const { data, info } = await sharp(input).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const k = [dominant.r, dominant.g, dominant.b].map((c) => 255 / Math.max(c, 1));
  const out = Buffer.alloc(w * h * 4);
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let i = 0; i < w * h; i++) {
    const rgb = [0, 1, 2].map((c) => Math.min(255, data[i * 3 + c] * k[c]));
    const lo = Math.min(...rgb);
    const a = lo >= PAPER ? 0 : 1 - lo / PAPER;
    for (let c = 0; c < 3; c++) out[i * 4 + c] = a ? Math.max(0, Math.round(255 - (255 - rgb[c]) / a)) : 0;
    out[i * 4 + 3] = Math.round(a * 255);
    if (a > 0.25) {
      const x = i % w, y = (i / w) | 0;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  return sharp(out, { raw: { width: w, height: h, channels: 4 } })
    .extract({ left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 })
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 0, g: 0, b: 0, alpha: 0 } });
}

const save = async (img, name, pad = 12) =>
  (await toTransparent(await img.png().toBuffer(), pad))
    .png({ compressionLevel: 9 })
    .toFile(`${OUT}/${name}.png`)
    .then((i) => console.log(`${name}.png ${i.width}×${i.height}`));

for (const job of jobs) {
  const src = `${RAW}/${job.file}`;
  if (!existsSync(src)) {
    console.warn(`skip: ${src} missing`);
    continue;
  }
  if (!job.names) {
    await save(sharp(src), job.name, job.pad);
    continue;
  }
  const { width, height } = await sharp(src).metadata();
  const cw = Math.floor(width / job.cols);
  const ch = Math.floor(height / job.rows);
  for (const [i, name] of job.names.entries()) {
    const cell = await sharp(src)
      .extract({ left: (i % job.cols) * cw, top: Math.floor(i / job.cols) * ch, width: cw, height: ch })
      .png()
      .toBuffer();
    await save(sharp(cell), name);
  }
}
