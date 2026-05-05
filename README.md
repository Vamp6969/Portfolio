# tushar-a.dev

Source for [tushar-a.dev](https://tushar-a.dev) — Tushar A.'s personal portfolio.

Astro 5 · vanilla CSS · static SSG · deploys to Vercel.

## Routes

- `/` — single-page landing: hero · /now · stats · experience · projects · skills · contact
- `/witchly` — Witchly case study (PDF embedded inline)
- `/resume` — HTML resume, print-styled for one A4 page
- `/Resume.pdf` — original PDF
- `/Case-Study/Witchly-scaling.pdf` — original case study PDF

## Develop

```bash
pnpm install
pnpm dev          # http://localhost:4321
pnpm build        # outputs ./dist
pnpm preview      # serves ./dist
pnpm check        # astro check (TS + content schemas)
pnpm check:links  # verify external links in dist/ (run after build)
```

## Edit content

- **Project cards:** `src/content/projects/*.mdx` — frontmatter validated by Zod schema in `src/content/config.ts`. At least one of `links.{internal,live,repo}` is required.
- **`/now` block:** `src/content/now/now.mdx` — update body and `updated:` date.
- **Experience timeline:** `src/pages/index.astro` (the `experience` array near the top).
- **Skills:** `src/pages/index.astro` (the `skillGroups` array).
- **Hero copy:** `src/components/Hero.astro`.
- **Avatar:** `src/assets/avatar.png` is the canonical pixel-art avatar; surfaced via `astro:assets` in nav, hero, and footer.

## Add a project card

1. Create `src/content/projects/<slug>.mdx`.
2. Set `order` (controls grid order), `title`, `tagline`, `description`, `tags`, `links`.
3. `featured: true` makes a card span full width and use the violet gradient. Only Witchly is featured by default.
4. Run `pnpm check` to validate frontmatter.

## Regenerate assets

The OG image and favicons are committed. Regenerate when the avatar or hero copy changes:

```bash
node scripts/build-og.mjs        # → public/og.png (1200×630)
node scripts/build-favicons.mjs  # → public/favicon{,-16,-180,-192,-512}.png
```

## Deploy

- **Vercel** — `vercel.json` wires up framework preset, clean URLs, immutable cache headers, and basic security headers.
- **Domain** — `tushar-a.dev` apex points to Vercel via DNS at the registrar (one-time switch).
- Push to `main` → production deploy. PRs get preview URLs.

## Performance budgets

Verified after build (gzipped):

| Asset                    | Current  | Budget |
|--------------------------|----------|--------|
| Home HTML + CSS + JS     | ~16 KB   | 100 KB |
| Variable fonts (subset)  | 67 KB    | 120 KB |
| OG image                 | 73 KB    | 80 KB  |
| Hero avatar (`.webp`)    | <2 KB    | 30 KB  |

## Link checking

`pnpm check:links` walks `dist/` and verifies external HTTP links. Soft-failure list lives at `scripts/link-check.config.json` — entries warn instead of failing the build. `mistymc.xyz` is currently soft-failed; remove the entry once the site is consistently live.

## Stack

- **Astro 5** — static SSG, content collections, View Transitions
- **MDX** — for `/now` and project frontmatter content
- **Inter + JetBrains Mono** — variable fonts, subset to Latin + symbols, self-hosted
- **Sharp** — `astro:assets` image pipeline (avatar → optimized webp), OG/favicon generation
- **TypeScript** — strict, schema-validated content collections
