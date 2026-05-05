# tushar-a.dev

Source for Tushar A.'s portfolio at [tushar-a.dev](https://tushar-a.dev).

Astro 5 · static SSG · vanilla CSS · Vercel.

## Routes

- `/` — single-scroll landing (hero, stats, /now, experience, projects, skills, contact)
- `/witchly` — Witchly case study (PDF embedded inline)
- `/resume` — HTML resume, print-styled for one A4 page
- `/Resume.pdf` — original PDF download
- `/Case-Study/Witchly-scaling.pdf` — original case-study PDF

## Develop

```bash
pnpm install
pnpm dev          # http://localhost:4321
pnpm build        # outputs ./dist
pnpm preview      # serves dist locally
pnpm check        # astro check (TS + content schemas)
pnpm check:links  # verify external links in dist/ (run after build)
```

## Edit content

- **Project cards:** `src/content/projects/*.mdx` — frontmatter is validated by the Zod schema in `src/content/config.ts`.
- **`/now` block:** `src/content/now/now.mdx` — update the body and the `updated:` date.
- **Experience timeline:** `src/pages/index.astro` (the `experience` array near the top).
- **Skills:** `src/pages/index.astro` (the `skills` array).
- **Hero copy:** `src/components/Hero.astro`.
- **Avatar:** `src/assets/avatar.png` is the canonical pixel-art avatar — used at hero (120×), nav (28×), and footer (20×) via `astro:assets`.

## Add a project card

1. Create `src/content/projects/<slug>.mdx`.
2. Set `order` (controls grid order), `title`, `tagline`, `description`, `tags`, `links`.
3. At least one of `links.{internal,live,repo}` must be set.
4. `featured: true` makes a card span the full width (only Witchly is featured by default).
5. Run `pnpm check` to validate frontmatter.

## Deploy

Production deploys via Vercel — `vercel.json` configures the build, clean URLs, and cache headers. Push to `main` triggers a deploy. PRs get preview URLs automatically.

DNS: `tushar-a.dev` apex points to Vercel (move via the registrar; one-time action).

## Performance budgets

Verified after every build. Current numbers (gzipped):

| Asset                           | Size  | Budget |
| ------------------------------- | ----- | ------ |
| Home HTML + CSS + JS (gzipped)  | ~14KB | 100KB  |
| Fonts (Inter + JetBrains Mono)  | ~67KB | 120KB  |
| OG image                        | 70KB  | 80KB   |
| Hero avatar `.webp`             | <2KB  | 30KB   |

## Link checking

`pnpm check:links` walks `dist/` and verifies external links. Soft-failure list lives at `scripts/link-check.config.json` — entries warn instead of failing the build. Add new domains there only when they're known-flaky or not-yet-live.

## Legacy

The previous single-file site lives at `legacy/index.html` for reference (not served).
