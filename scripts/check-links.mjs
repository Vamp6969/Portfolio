// scripts/check-links.mjs
// Walks the built dist/ for external HTTP(S) links, fetches them with HEAD
// (falls back to GET), and reports broken ones. Soft-failure list lives in
// scripts/link-check.config.json — entries warn instead of failing the build.

import { readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const root = join(__dirname, '..');
const distDir = join(root, 'dist');
const configPath = join(__dirname, 'link-check.config.json');

const config = JSON.parse(await readFile(configPath, 'utf8'));
const softFail = new Set(config.softFail ?? []);

// Skip self-canonicals — these will only resolve once the site is deployed.
const SELF_PREFIX = 'https://tushar-a.dev';

// LinkedIn returns HTTP 999 to bot-like User-Agents but the URL is fine.
// We treat 999 from linkedin.com as OK.
const QUIRKY_HOSTS = {
  'linkedin.com': new Set([999]),
  'www.linkedin.com': new Set([999]),
};

const TIMEOUT_MS = 8000;
const CONCURRENCY = 8;

/** @returns {Promise<string[]>} */
async function walkHtml(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      files.push(...(await walkHtml(full)));
    } else if (e.isFile() && full.endsWith('.html')) {
      files.push(full);
    }
  }
  return files;
}

const HREF_RE = /\b(?:href|src)=["']([^"'#]+)["']/gi;

async function collectLinks(files) {
  const links = new Map(); // url -> Set<sourceFile>
  for (const file of files) {
    const text = await readFile(file, 'utf8');
    let m;
    while ((m = HREF_RE.exec(text))) {
      const url = m[1];
      if (!/^https?:\/\//i.test(url)) continue;
      // Self-canonicals (canonical, og:url) — skip; they won't resolve until deploy.
      if (url.startsWith(SELF_PREFIX)) continue;
      if (!links.has(url)) links.set(url, new Set());
      links.get(url).add(file.replace(distDir + '/', ''));
    }
  }
  return links;
}

function softFailMatch(url) {
  for (const prefix of softFail) {
    if (url.startsWith(prefix)) return prefix;
  }
  return null;
}

function isQuirkyOk(url, status) {
  try {
    const host = new URL(url).hostname;
    return QUIRKY_HOSTS[host]?.has(status) ?? false;
  } catch {
    return false;
  }
}

async function check(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    let res = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: ctrl.signal,
      headers: { 'User-Agent': 'tushar-a-dev-link-check/1.0' },
    });
    if (!res.ok || res.status >= 400) {
      // Some servers (e.g. HF Spaces) reject HEAD; retry GET.
      res = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: ctrl.signal,
        headers: { 'User-Agent': 'tushar-a-dev-link-check/1.0' },
      });
    }
    const ok = res.ok || isQuirkyOk(url, res.status);
    return { ok, status: res.status };
  } catch (err) {
    return { ok: false, status: 0, error: err.message ?? String(err) };
  } finally {
    clearTimeout(timer);
  }
}

async function pool(items, worker, n) {
  const results = [];
  let idx = 0;
  await Promise.all(
    Array.from({ length: n }, async () => {
      while (idx < items.length) {
        const i = idx++;
        results[i] = await worker(items[i]);
      }
    }),
  );
  return results;
}

async function main() {
  try {
    await stat(distDir);
  } catch {
    console.error('check-links: dist/ not found. Run `pnpm build` first.');
    process.exit(2);
  }

  const files = await walkHtml(distDir);
  const links = await collectLinks(files);
  const urls = [...links.keys()].sort();

  console.log(`check-links: scanning ${urls.length} unique external URLs...`);

  const results = await pool(
    urls,
    async (url) => ({ url, ...(await check(url)) }),
    CONCURRENCY,
  );

  const hardFails = [];
  const softFails = [];
  let okCount = 0;

  for (const r of results) {
    if (r.ok) {
      okCount++;
      continue;
    }
    if (softFailMatch(r.url)) {
      softFails.push(r);
    } else {
      hardFails.push(r);
    }
  }

  console.log(`check-links: ${okCount}/${urls.length} OK`);

  if (softFails.length) {
    console.log(`\nsoft-fail (warning, not fatal):`);
    for (const r of softFails) {
      console.log(`  ⚠ ${r.url} — ${r.status || 'no response'} ${r.error ? `(${r.error})` : ''}`);
    }
  }

  if (hardFails.length) {
    console.error(`\nhard-fail:`);
    for (const r of hardFails) {
      const sources = [...(links.get(r.url) ?? [])].join(', ');
      console.error(`  ✗ ${r.url}`);
      console.error(`    status: ${r.status || 'no response'}${r.error ? `, error: ${r.error}` : ''}`);
      console.error(`    found in: ${sources}`);
    }
    process.exit(1);
  }

  console.log('check-links: all required external links OK.');
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
