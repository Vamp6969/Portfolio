# tushar-a.dev

Source for [tushar-a.dev](https://tushar-a.dev) — Tushar A.'s personal portfolio. Built with Astro 5, vanilla CSS, and shipped as a static site.

```
.
├── public/                 # static assets served from the site root
│   ├── _headers            # Cloudflare Pages cache + security headers
│   ├── robots.txt          # search-engine directives
│   ├── Resume.pdf          # downloadable resume
│   ├── Case-Study/         # downloadable case studies (Witchly etc.)
│   ├── fonts/              # subset Inter + JetBrains Mono variable WOFF2
│   ├── og.png              # 1200×630 social card (generated)
│   ├── favicon*.png        # favicons in 16/32/180/192/512 (generated)
│   └── site.webmanifest    # PWA manifest
├── src/
│   ├── pages/              # index.astro · witchly.astro · resume.astro · 404.astro
│   ├── layouts/            # BaseLayout.astro
│   ├── components/         # Nav, Hero, NowBlock, StatsStrip, ExperienceSection,
│   │                       # ProjectsSection, SkillsSection, ContactSection, Footer
│   ├── content/            # MDX content collections (projects/, now/) + Zod schema
│   ├── styles/             # tokens.css · global.css
│   ├── scripts/            # client-side TS (reveal-on-scroll)
│   └── assets/             # avatar.png — handled by astro:assets
├── scripts/                # build helpers (link checker, OG image, favicons)
├── astro.config.mjs
├── package.json            # pnpm-managed; Node 20+
└── README.md               # you are here
```

---

## Routes

| Path                                     | What it is                                                       |
|------------------------------------------|------------------------------------------------------------------|
| `/`                                      | Single-scroll landing — hero, /now, stats, experience, projects, skills, contact |
| `/witchly`                               | Witchly case study (intro + stats + inline-embedded PDF + stack) |
| `/resume`                                | Resume — quick highlights + summary + inline-embedded PDF        |
| `/Resume.pdf`                            | Direct PDF download                                              |
| `/Case-Study/Witchly-scaling.pdf`        | Case study PDF download                                          |
| `/404`                                   | Themed not-found page                                            |

The header is the same across every page. On desktop and tablet it shows About · Now · Work · Projects · Contact with a sliding active-section indicator and a Resume CTA. On phones (≤760 px) it collapses to **avatar + Resume CTA** — users scroll naturally on mobile, and the cramped item layout is dropped intentionally.

---

## Run locally

```bash
pnpm install        # install deps (Node 20+ required)
pnpm dev            # Astro dev server, http://localhost:4321
pnpm build          # static site → ./dist
pnpm preview        # serve ./dist locally
pnpm check          # type-check + content-collection schema validation
pnpm check:links    # verify external links in dist/ (run after build)
```

---

## Editing content

Most copy lives in MDX or in two arrays at the top of `src/pages/index.astro`. No CMS, no DB — change a file, push, done.

**Add or edit a project card** — `src/content/projects/<slug>.mdx`:

```yaml
---
order: 6                                   # controls grid order (lower = earlier)
title: My New Thing
tagline: One-line punch.
description: |
  Optional longer paragraph (only shown on featured cards by default).
tags: [docker, mcp, ts]                    # max 6
links:
  internal: /case-study-slug               # at least one of internal | live | repo
  live: https://example.com
  repo: https://github.com/Vamp6969/xyz
featured: false                            # true = full-width gradient card
---
```

The schema is enforced in `src/content/config.ts` via Zod. Run `pnpm check` to validate.

**Update `/now`** — edit `src/content/now/now.mdx`. Bump the `updated:` date in frontmatter.

**Experience timeline** — `experience` array near the top of `src/pages/index.astro`.

**Skills** — `skillGroups` array, same file.

**Hero copy** — `src/components/Hero.astro`.

**Avatar** — `src/assets/avatar.png` (the canonical pixel-art Minecraft PFP). Used by the nav, hero, and footer via `astro:assets`. Replace this single file to update everywhere.

---

## Regenerate generated assets

The OG image and favicons are committed PNGs. Regenerate when the avatar or hero copy changes:

```bash
node scripts/build-og.mjs         # → public/og.png (1200×630)
node scripts/build-favicons.mjs   # → public/favicon{,-16,-180,-192,-512}.png
```

---

## Stack

- **[Astro 5](https://astro.build)** — static SSG, MDX content collections, View Transitions
- **Vanilla CSS** — design tokens in `src/styles/tokens.css`, no Tailwind, no preprocessor
- **TypeScript** — strict; content frontmatter validated by Zod
- **[Inter](https://rsms.me/inter/) + [JetBrains Mono](https://www.jetbrains.com/lp/mono/)** — variable WOFF2, subset to Latin + the few symbols actually used (~67 KB combined), self-hosted
- **[Sharp](https://sharp.pixelplumbing.com/)** — `astro:assets` image pipeline, plus the OG and favicon generators
- **No client-side framework** — only ~5 KB of inline TS for scroll reveals, stat counters, and the floating-nav indicator
- **Theme** — indigo (`#6366f1`) + violet (`#a855f7`) + glass tiles on near-black (`#050508`)

---

## Deploy — Cloudflare Pages

Configured for **Cloudflare Pages**. Cache and security headers live in `public/_headers`, which Pages reads at deploy time.

**One-time setup (Cloudflare dashboard):**

1. **Workers & Pages → Create → Pages → Connect to Git**, pick this repo.
2. **Framework preset:** Astro (auto-detected).
3. **Build command:** `pnpm build`
4. **Build output directory:** `dist`
5. **Root directory:** *(leave default)*
6. **Environment variables:** add `NODE_VERSION=20` (Pages also reads `.nvmrc`, which is set to `20`, but the env var is explicit).
7. Pages installs dependencies via `pnpm` automatically because `package.json` declares `"packageManager": "pnpm@10.33.3"`.

**Custom domain:**

- **Custom domains → Set up a custom domain → `tushar-a.dev`.** Pages walks you through the DNS records.
- If `tushar-a.dev` already has DNS in Cloudflare, Pages adds a `CNAME` automatically; if it's elsewhere, copy the records to your registrar.

**Production:** every push to `main` deploys. PRs get preview URLs automatically.

**Headers (`public/_headers`):** immutable cache for `/_astro/*` and `/fonts/*`, one-day cache for images/PDFs, security headers (`X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`) for everything.

**Analytics & WAF:** Pages exposes Cloudflare Web Analytics and basic DDoS / bot protection on the free tier — opt in via the dashboard, no code changes needed.

---

## Performance budgets

Verified after every build (gzipped):

| Asset                         | Current  | Budget  |
|-------------------------------|----------|---------|
| Home HTML + CSS + JS          | ~16 KB   | 100 KB  |
| Variable fonts (Latin subset) | 67 KB    | 120 KB  |
| OG image                      | 73 KB    | 80 KB   |
| Hero avatar (`.webp`)         | <2 KB    | 30 KB   |

The home page payload is ~7× under budget. Lighthouse target is 100/100/100/100 on `/`, `/witchly`, `/resume`.

---

## SEO & rich embeds

Every page renders the full surface needed for clean unfurls on Discord, LinkedIn, WhatsApp, iMessage, Slack, X/Twitter:

- **Open Graph** — `og:type`, `og:site_name`, `og:locale`, `og:url`, `og:title`, `og:description`, `og:image` (with explicit `width=1200`, `height=630`, `secure_url`, `type`, `alt`). Article-specific meta on `/witchly`.
- **Twitter Card** — `summary_large_image` with image alt text.
- **JSON-LD** — `Person` schema on every page (jobTitle, worksFor=Witchly.host, alumniOf=Presidency, knowsAbout, sameAs); `WebSite` schema on the home page.
- **Robots** — `index, follow, max-image-preview:large, max-snippet:-1` everywhere; `noindex` on `/404`. `public/robots.txt` references the auto-generated sitemap.
- **Sitemap** — generated by `@astrojs/sitemap` at `/sitemap-index.xml`.
- Per-page descriptions kept under 160 chars for clean SERP snippets.

Test the rich embeds after deploy at:
[Facebook debugger](https://developers.facebook.com/tools/debug/) ·
[LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) ·
[Twitter Card Validator](https://cards-dev.twitter.com/validator) ·
[Google Rich Results](https://search.google.com/test/rich-results)

---

## Mobile

- All interactive elements meet a ≥44 px touch target on mobile.
- Floating nav respects `env(safe-area-inset-top)` so it clears the iOS notch.
- `100dvh` for viewport-bound layouts (no jank when iOS Safari toolbar shows/hides).
- `-webkit-tap-highlight-color: transparent` and `touch-action: manipulation` to kill the gray flash and the 300 ms tap delay.
- Long emails / URLs use `overflow-wrap: anywhere` so they never push the layout wider than the viewport.
- Hero text scales down via `clamp()` to fit 320 px screens.
- The PDF embed on `/witchly` and `/resume` uses 70 vh / 420 px min on phones (vs 80 vh / 560–600 px on desktop).

---

## Link checking

```bash
pnpm check:links    # crawls dist/ for external HTTP links and verifies them
```

The script (`scripts/check-links.mjs`):

- Skips self-canonicals (links to `tushar-a.dev` only resolve once deployed).
- Treats LinkedIn's HTTP 999 / 404 anti-bot statuses as OK (LinkedIn cloaks public profiles from anonymous bots).
- Reads a soft-failure list from `scripts/link-check.config.json` — entries warn instead of failing the build. **Don't** add calendar dates here; soft-fail status persists until the entry is manually removed.
- Currently soft-failing: `mistymc.xyz` (site is being built; remove the entry once it's consistently live).

---

## Accessibility

- All interactive elements reachable by keyboard with visible focus rings (`outline: 2px solid var(--primary-soft)`).
- `prefers-reduced-motion: reduce` disables every animation (gradient mesh, pulses, scroll reveals, counters, indicator transitions, glow).
- Avatar `<img>` has descriptive `alt` text.
- One `<h1>` per page; semantic `<main>`, `<nav>`, `<footer>` landmarks.
- Color contrast on body text against `--bg`: ≥4.5:1.
- Touch targets ≥44 × 44 px on mobile.

---

## Author

**Tushar A.** ([@Vamp6969](https://github.com/Vamp6969)) — Bangalore, India.

Designed and built end-to-end. Reach out: <tushar@tushar-a.dev>.
