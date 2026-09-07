# AGENTS.md

This file provides guidance to AI coding agents when working with code in this
repository.

Portaler is a static Astro 7 site (Danish UI) listing school learning platforms by grade and
subject. All data is JSON under `src/content/`; no database, no server runtime.

## Commands

`node_modules/` and `.astro/` are not checked in — run `bun install` first.

- `bun run dev` — dev server
- `bun run check` — `astro check` plus `svelte-check` (Astro, TypeScript and island diagnostics)
- `bun run build` — static build to `dist/`
- `bun run lint` / `bun run lint:fix` — Biome format + lint
- `bun run sync` — regenerate `.astro/types.d.ts` after a content-schema change

CI gates on read-only Biome, complementary prek hooks, Astro and Svelte checking,
seven Bun domain/request fixtures, one build and the existing four HTTP smoke routes.
Run `bun install --frozen-lockfile`, `bash .github/scripts/check.sh`, and
`bash .github/scripts/smoke.sh`. See `CI.md` for generated PR dispatch, shared policy,
required settings and remaining browser coverage gaps.

## Content and data invariants

- Platform JSON lives in `src/content/platforms/<publisher>/`, validated at build time by the Zod
  schema in `src/content.config.ts`. An unknown `subject` value fails the build.
- Every content JSON carries legacy `icon` / `iconOverwrite` keys. They are not in the schema and
  are ignored. To change a subject's icon or accent colour, edit `SUBJECT_META` in
  `src/lib/subjects.ts` — never the JSON.
- Adding a subject touches three files: `src/content/subjects/<slug>.json`, `subjectSlugs` in
  `src/content.config.ts`, and `SUBJECT_META` in `src/lib/subjects.ts`. Miss the second and the
  build fails; miss the third and it silently renders with the grey `andre` icon/accent fallback.
- `grades: []` routes a platform to `/other` instead of any `/grade/*` page (`getOtherPlatforms`
  in `src/lib/platforms.ts`).
- The grade set is `PHASES` in `src/lib/grades.ts` (0–9), not the content files; `/grade/[id]`
  pages are generated from it.

## Island boundary

`.tsx` (SolidJS) and `.svelte` files must never import `astro:content`. Astro pages call
`src/lib/platforms.ts`, which enriches entries into the plain serializable `PlatformItem` (subject
label, order, accent, icon already resolved) and passes them as props. `src/lib/publishers.ts`
exists for the same reason — it exports resolved asset URLs as plain strings.

## UnoCSS

- Class names must be static literals; a constructed string like `` `text-${phase.id}` `` emits no
  CSS and fails silently. Use a literal `Record<PhaseId, string>` map (see `GradeRail.astro`), or
  the inline-variable pattern used for subject accents: ``style={`--sa: ${accent}`}`` together with
  `text-[var(--sa)]` / `bg-[var(--sa)]/12`.
- A file holding class literals outside a component needs `// @unocss-include` at the top —
  `src/lib/subjects.ts` is the existing case.
- Semantic colours (`bg-background`, `text-indskoling`, …) are CSS vars declared in
  `src/styles/global.css` and mapped in `uno.config.ts`; adding one means editing both.
  presetWind4 supplies the reset — do not add another.

## Edits that must land in two places

- The theme chrome colour is hardcoded in `src/layouts/Layout.astro` (inline no-flash script) and
  in `src/components/ThemeToggle.svelte`. Change both, or the browser chrome desyncs.
- The issue subject dropdown, content schema, subject data and presentation metadata
  must have identical slugs; `tests/catalog.test.ts` checks their parity.
- `build.format: "file"` in `astro.config.mjs` is paired with the bare, no-trailing-slash anchors
  used throughout (`/grade/0`, `/fag/dansk`). Changing one breaks live URLs.

## Conventions

- Commits follow Conventional Commits, enforced by `conventional-pre-commit` in `prek.toml`.
- `prek.toml` also declares `no-commit-to-branch --branch main` — work on a branch. Successful default-branch CI deploys its validated artifact to GitHub Pages (`.github/workflows/deploy.yml`). Hooks are only active locally
  after `prek install`.
- Biome: 2-space indent, 100-column width, double quotes, semicolons, trailing commas
  (`biome.json`). Unused-import and unused-variable rules are deliberately off.
- UI strings are Danish; code identifiers and comments are English.

## Reference

- `.agents/rules/astro-dev-pro.md` (~630 lines) — Astro 7 / Bun / UnoCSS presetWind4 / Svelte 5
  runes / SolidJS conventions and anti-patterns. Read before writing a new island or changing a
  hydration directive; not needed for content edits.
- `README.md` — "Adding a platform" and "Adding or restyling a subject" walkthroughs plus the
  platform JSON template. Its badge and tech-stack list still say Astro 6; `package.json` is the
  authority (Astro 7).
