# Architecture rewrite — the site describes the system that exists

The public site is written from the code that runs today, at every C4 level, with the deployment, usage and
local-development paths that exist, and with screenshots of the product and of the AWS console. This is one
PR on `docs/architecture-rewrite`; each phase below is one commit, easiest first. The cross-repo plan (cvhome
reference fixes, the org profile, retiring `assets/fast-run`) lives in the orchestrator at
`.agents/plans/docs-architecture-rewrite.md`; only this repo's part is here.

## Context

- Last content change 2026-05-07, most pages from 2025-06 (`git log -- docs/`).
- `docs/guide/architecture-overview.md` carries the only two diagrams and names `Control-Plane`, `StoreUI`,
  `Order`, `CoreGateway`, repos `cvhome-bootstrap` / `cvhome-infra` — none exist.
- `docs/development/local-setup.md` never mentions lcl; `contributing.md` names dead infra repos and
  contradicts `AGENTS.md`.
- `docs/deployment/*` is built around `cvhome-bootstrap`, wrong CloudFormation parameters, and says the ALB
  terminates TLS for stores (pods sit behind an NLB in passthrough to Caddy).
- Orphans `guide/getting-started.md` and `deployment/overview.md`; 11 of 21 images unreferenced;
  `docs/digrams/aws-arch.drawio` stale; no product screenshots; `deploy.yml` has no PR check.
- Never mentioned: `cvhome-platform`, `store-core-gateway`, `console-ui`, `billing`, `pod-registry`,
  `tenancy`, `checkout`, `payment`, `cua`, `inventory`, `content`, `lcl`.

Source of truth for every page: cvhome `.claude/skills/project-structure/` (SKILL.md + references),
`store-commons/autoconfigure/src/main/resources/common-config.yml`, `store-pod/spg/Caddyfile`, `lcl.yml`;
cvhome-platform `README.md`, `services.yaml`, `flavours.yaml`, `modules/*`, `bootstrap/bootstrap.yaml`,
`qa/platform-qa.md`; lcl `README.md`; orchestrator `repos.yaml`, `docs/releasing.md`.

## Why the design is what it is

- **Mermaid flowcharts styled as C4, not `C4Context`.** The C4 grammar is beta in mermaid 11, has a fixed
  layout, no per-node styling and ignores the theme switch; flowcharts with `subgraph` boundaries and
  `classDef` stroke styles render in both themes and are readable at phone width. One legend, on the
  system-context page.
- **Stub pages, not redirects.** VitePress has no redirect primitive; a one-line stub at each old sidebar URL
  keeps inbound links alive. Pages that were never reachable are deleted.
- **A "Source of truth" footer on every page** names the file the page was written from, so the next
  rewrite knows what to diff against.
- **Screenshots last.** Every prose phase leaves `<!-- img: /images/<dir>/<name>.png — what it shows -->`
  where a screenshot belongs, so `docs:build` and `scripts/check-images.sh` stay green until the capture
  phases replace them. Terminal output (`lcl status`, `lcl urls`) is a fenced code block, never a PNG.
- **The image check is a gate** because VitePress does not fail on a missing image, and unreferenced
  screenshots are dead weight in every clone.

## Phase 1 — tooling and safety (commit 1)
`deploy.yml` builds on `pull_request` and deploys only on push; `scripts/check-images.sh` added to
`verify.steps.sh` and CI; the eleven unreferenced images removed; the logo wired into the theme; this plan;
`qa/site-qa.md` skeleton.

## Phase 2 — information architecture (commit 2)
`config.mts`: nav Home | Architecture | Guides | Development | Operations | GitHub; local search;
`lastUpdated`. Every new page created with frontmatter, purpose paragraph and footer; stubs at
`/guide/architecture-overview`, `/development/local-setup`, `/deployment/aws-deployment-guide`,
`/deployment/aws-architecture`, `/deployment/cleanup-guide`; `guide/getting-started.md`,
`deployment/overview.md`, `docs/digrams/`, `all-repo.png`, `mono-repo.png` deleted; legacy AWS shots moved to
`docs/images/aws/`.

## Phase 3 — system context and containers (commit 3)
`/architecture/system-context` (C1 + legend), `/architecture/containers` (C2), `/architecture/store-core`
(C2a), `/architecture/store-pod` (C2b, with the landing-ui page cache and theme headers).

## Phase 4 — component views (commit 4)
`/architecture/gateway-routing` (C3a), `/architecture/edge-spg` (C3b), `/architecture/authentication`
(C3c), `/architecture/tenancy-provisioning` (C3d).

## Phase 5 — deployment views (commit 5)
`/architecture/deployment-aws` (D1 AWS resources, D2 pipeline), `/architecture/deployment-local` (D3 lcl).

## Phase 6 — development (commit 6)
`/development/local-development` (lcl, real terminal output), `/development/configuration` (services and
ports, config slices, images and tags, flavours and tfvars).

## Phase 7 — usage guides (commit 7)
`/guides/merchant`, `/guides/shopper`, `/guides/platform-admin`.

## Phase 8 — operations (commit 8)
`/operations/deployment-guide`, `/operations/pipeline`, `/operations/lifecycle`, `/operations/monitoring`,
`/operations/releases`. CloudFormation parameters checked against `bootstrap.yaml`.

## Phase 9 — guide and home (commit 9)
`/guide/introduction`, `/guide/core-concepts`, `/guide/repositories` (R1 image chain),
`/development/contributing` (aligned with `AGENTS.md`), `index.md`.

## Phase 10 — product screenshots from lcl (commit 10)
`docs/images/lcl/*.png` from a running `lcl start -d` stack: console, uaa admin, storefront.

## Phase 11 — AWS console screenshots (commit 11)
`docs/images/aws/*.png` from the dev environment; the legacy shots re-checked or deleted.

## Other repos
cvhome: fix six stale reference statements, resync the `.agents` mirror (lands first). dot-github: profile
links and repo table (after this merges). assets: retire `fast-run` (independent). Orchestrator: update
`known-drift.md` / `repo-map.md` for this repo and assets after merge.

## Deviations, as built

- **An extra commit between phases 9 and 10.** `scripts/check-images.sh` counted the planned-screenshot
  comments as real references, which is the opposite of what its own comment promised, so a page that named
  its future screenshot failed the gate. Fixed in its own commit rather than folded into a content phase.
- **Four screenshot slots dropped instead of filled.** The pods and platform screens and the uaa admin
  screens need a platform-administrator session that would not complete in this environment; the seeded
  stores carry no subscription, so the billing page is an empty state that would teach a reader nothing; and
  the cart and checkout captures came out smaller than the rest. The slots were removed rather than left as
  comments or filled with something misleading. The identity server's sign-in page was captured instead and
  sits on the platform-admin page.
- **Phase 11 is not in this pull request.** The AWS console screenshots need a signed-in session on the dev
  environment, which the person has to start. The six screenshots from the previous guide stay on the
  deployment guide with captions saying which parts are stale, and the slots for the new ones are gone; a
  follow-up pull request adds them.
- **12 themes, not 13.** The storefront theme registry lists twelve; the brief said thirteen.
- **The pod list comes from pod-registry, not tenancy.** The gateway's `PodClient` calls
  `ReactiveExternalPodService.listPods()`; the reference that said tenancy was corrected in cvhome in the
  same change.

## Verification

- `scripts/verify.sh` green at every phase: whitespace, `npm ci`, `npm run docs:build`, `scripts/check-images.sh`.
- The build renders 30 pages with no dead link. 16 images, all referenced, none orphaned.
- `qa/site-qa.md` cases are written but still `[not verified]`: they need a pass through
  `npm run docs:dev` in a browser, which is the reviewer's step before merge.
- The screenshots were taken against a stack started with `lcl start -d` on this repository's sibling
  checkout, all nineteen services up, on the seeded test stores.
