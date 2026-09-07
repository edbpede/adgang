# Development CI and Renovate

`ci` runs for every PR, default-branch push and manual repair dispatch. Require
`ci / required` from GitHub Actions, with strict up-to-date branches and enforced
administrator protection. The aggregate rejects failed, missing, cancelled or
skipped quality/smoke jobs; generated PR dispatches verify the live head both
before and after CI. Reviews are optional; no default-branch bypass is needed.

Locally run `bun install --frozen-lockfile`, `bash .github/scripts/check.sh`, then
`bash .github/scripts/smoke.sh`. CI uses the committed Bun version, read-only
Biome, complementary prek hygiene, Astro and Svelte checks, seven Bun fixtures,
one production build and the existing four HTTP route probes. The smoke job and
Pages reuse that build artifact. CI rejects tracked-file mutations. The Zod URL
deprecation is an existing hint. Browser hydration/search interactions and live
third-party platform availability remain manual coverage gaps.

Fixtures cover school grade boundaries, parity between subject data/schema/style
metadata/issue choices, real issue headings, checked grades, multiline text, unsafe
URL protocols, missing fields and safe generated paths. The issue form now offers
only supported subject slugs. Platform requests remain restricted to `edbpede`.
The writer treats issue text as data, rejects duplicate names/URLs and existing
paths, formats only the generated JSON and proposes a signed-off PR per issue.
It explicitly dispatches full CI for the exact PR SHA with `GITHUB_TOKEN`; failures
report manual recovery inputs. Enable **Allow GitHub Actions to create and approve
pull requests**. No live issue, comment, PR or catalog addition is created in local
tests. GitHub Pages publishes only a successful default-branch CI artifact, with
its original `portaler.edbpede.net` domain; manual publication validates first.

The versioned `engels74/automation` preset centralizes dependency managers and
non-major grouping. Automerge remains off pending the shared pre-1.0 policy
correction and activation. TypeScript is capped below 7 while Astro/Svelte require
its JavaScript compiler API. All actions use full version tags. The official Biome
version manager handles schema versions, and the isolated repair workflow performs
migrations/safe formatting before dispatching full CI on the repair commit.
