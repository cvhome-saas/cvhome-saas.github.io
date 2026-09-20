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
- **Screenshots last, and everything AWS last of all.** Every prose phase leaves
  `<!-- img: /images/<dir>/<name>.png — what it shows -->` where a screenshot belongs, so `docs:build` and
  `scripts/check-images.sh` stay green until a capture phase replaces it. Terminal output (`lcl status`,
  `lcl urls`) is a fenced code block, never a PNG.
- **One AWS phase, at the end, done in one sitting.** Anything that needs a signed-in AWS console is phase
  12 and nothing else: the captures, the legacy images, and the check of the five AWS pages against the
  live environment. Splitting it would mean opening the console several times and proving the same facts
  twice, and every earlier phase can be written, verified and reviewed without an account.
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

## Phase 11 — the plan as built (commit 11)
Deviations and verification filled in.

## Phase 12 — everything AWS (its own pull request)

The only phase that needs an AWS account. It is done in one sitting on the existing **dev** environment,
after a person has signed in to the console in the browser; nothing here is a fresh bootstrap. Region
`eu-central-1`, except the CloudFront certificate, which lives in `us-east-1`.

**a. Capture the thirteen screenshots.** The slots are already in the pages as
`<!-- img: /images/aws/<name>.png — … -->`; each one is replaced in place.

| File | Page and step |
|---|---|
| `cfn-stack-outputs` | the bootstrap stack's Outputs tab after `CREATE_COMPLETE` |
| `codebuild-projects` | the seven CodeBuild projects of one environment |
| `codebuild-3-apply-log` | the tail of a succeeded `3-apply` log, with the `console_url` line |
| `ecs-clusters`, `ecs-core-services`, `ecs-pod-services` | the cluster list, the core services, one pod's services |
| `rds-instances` | the core instance and the per-pod instances |
| `route53-records` | the hosted zone's alias records for the platform hosts, a pod and the CDN |
| `acm-certificate` | the regional certificate for the environment domain and its wildcard |
| `cloudfront-distribution` | one pod's distribution and its alias |
| `secrets-list`, `ssm-parameters` | **names only**; never open a secret's value |
| `cloudwatch-dashboard` | the environment dashboard, used on two pages |

**b. Settle the six legacy images.** `docs/images/aws/legacy-*.png` were captured on the 1.x bootstrap and
carry captions saying so. Each one is either replaced by its new capture and deleted, or kept with a caption
that says exactly which part is still true. The parameters shot and the outputs shot are known stale: the
form no longer has `PodSize`, `isProd`, `isMonitoring` or `allowTestStores`, and the apply stage now ends
with `console_url`.

**c. Check the five AWS pages against the live environment.** `/architecture/deployment-aws`,
`/operations/deployment-guide`, `/operations/pipeline`, `/operations/lifecycle` and `/operations/monitoring`
were written from the Terraform modules and the bootstrap template. With the console open, confirm the
resource names, the CloudFormation parameter list, the stack outputs, the CodeBuild project names, the log
group naming and the dashboard's sections, and correct whatever the code implied but the account does not
show.

**d. QA.** Add the cases these pages earn to `qa/site-qa.md` and tag them honestly.

**Hygiene, the same as phase 10.** 1440x900 window, light theme, `sips -Z 1600`, PNG, 300 KB per image and
10 MB for the phase. Crop or blur the account identifier before `git add`, and look at every file before
committing it. Never capture a secret's value tab.

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
- **Phase 12 is deliberately not in this pull request.** Everything that needs an AWS account was pulled out
  of the phase list and grouped into one final phase, to be done in one sitting once a person has signed in
  to the console. The thirteen slots stay in the pages as comments, the six legacy images stay with captions
  saying which parts are stale, and the AWS pages stand on what the Terraform and the bootstrap template say
  until the console confirms them.
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
