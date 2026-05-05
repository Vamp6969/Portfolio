# tushar-a.dev

Source for [tushar-a.dev](https://tushar-a.dev) — Tushar A.'s personal portfolio. Built with Astro 5, vanilla CSS, and shipped as a static site.

```
.
├── public/                 # static assets served from the site root
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
├── vercel.json             # Vercel framework + cache + security headers
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

The header is the same across every page (About · Now · Work · Projects · Contact + Resume CTA). Anchor items always route through the home page.

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

## Deploy

Configured for **Vercel** (`vercel.json`):

- Connect the GitHub repo to a Vercel project. Build command: `pnpm build`. Output: `dist`.
- Production deploys on push to `main`. PRs get preview URLs automatically.
- Domain: point `tushar-a.dev` apex DNS at Vercel (one-time switch at the registrar).
- Cache headers: immutable for `/_astro/*` and `/fonts/*`; 1-day for images/PDFs; security headers for everything else.
- Analytics: Vercel built-in (no third-party scripts).

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

## Link checking

```bash
pnpm check:links    # crawls dist/ for external HTTP links and verifies them
```

The script (`scripts/check-links.mjs`):

- Skips self-canonicals (links to `tushar-a.dev` only resolve once deployed).
- Treats LinkedIn's HTTP 999 anti-bot status as OK (not a real failure).
- Reads a soft-failure list from `scripts/link-check.config.json` — entries warn instead of failing the build. **Don't** add calendar dates here; soft-fail status persists until the entry is manually removed.
- Currently soft-failing: `mistymc.xyz` (site is being built; remove the entry once it's consistently live).

---

## Accessibility

- All interactive elements reachable by keyboard with visible focus rings (`outline: 2px solid var(--primary-soft)`).
- `prefers-reduced-motion: reduce` disables every animation (gradient mesh, pulses, scroll reveals, counters, indicator transitions, glow).
- Avatar `<img>` has descriptive `alt` text.
- One `<h1>` per page; semantic `<main>`, `<nav>`, `<footer>` landmarks.
- Color contrast on body text against `--bg`: ≥4.5:1.

---

## Author

**Tushar A.** ([@Vamp6969](https://github.com/Vamp6969)) — Bangalore, India.

Designed and built end-to-end. Reach out: <tushar@tushar-a.dev>.
