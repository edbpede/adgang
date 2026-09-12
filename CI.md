# Development CI and Renovate

`ci` runs for every PR, default-branch push and manual dispatch. All four
current-head jobs in `.github/merge-policy.json` must pass before a Renovate
update can merge unattended, including majors and shared-policy versions.
The checked action verifies genuine author sign-offs and dispatches full final
CI for the exact merged commit. No dashboard approvals, branch protections or
rulesets are required; other changes retain the maintainer ghmerge review.
PR and final-CI dispatches verify the requested current revision at both gates.

Locally run `bun install --frozen-lockfile`, `bash .github/scripts/check.sh`, then
`bash .github/scripts/smoke.sh`. CI uses the committed Bun version, read-only
Biome, complementary prek hygiene, Astro and Svelte checks, eight Bun fixtures,
one production build and the existing four HTTP route probes. The smoke job and
Pages reuse that build artifact. CI rejects tracked-file mutations. The Zod URL
deprecation is an existing hint. Browser hydration/search interactions and live
third-party platform availability remain manual coverage gaps.

Fixtures cover school grade boundaries, parity between subject data/schema/style
metadata/issue choices, real issue headings, checked grades, multiline text, unsafe
URL protocols, missing fields and safe generated paths. The issue form now offers
only supported subject slugs. Platform requests remain restricted to `edbfi`.
The writer treats issue text as data, rejects duplicate names/URLs and existing
paths, formats only the generated JSON and proposes a signed-off PR per issue.
It explicitly dispatches full CI for the exact PR SHA with `GITHUB_TOKEN`; failures
report manual recovery inputs. Enable **Allow GitHub Actions to create and approve
pull requests**. No live issue, comment, PR or catalog addition is created in local
tests. GitHub Pages publishes only a successful default-branch CI artifact, with
the `portaler.edb.fi` domain. Successful final CI dispatches the publisher, which
requires the newest final push or dispatched CI for the exact main commit to
have succeeded, then downloads its validated artifact. Both automatic and manual publication
verify the current default revision before download and immediately before publish.

The versioned `edbfi/automation` preset centralizes dependency managers and
update grouping. TypeScript updates exercise both Astro and Svelte checks without
a separate version cap. All actions use full version tags. The official Biome
version manager handles schema versions, and the isolated repair workflow performs
migrations/safe formatting before dispatching full CI on the repair commit.
Repair is restricted to Portaler's actual source, scripts, tests and root framework
configuration files; unrelated extension paths are excluded.
