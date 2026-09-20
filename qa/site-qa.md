# QA — the public site

The VitePress site at https://cvhome-saas.github.io: every page in the sidebar, every diagram, every image,
both colour themes, the search index, and the CI that builds and deploys it.

- **Scope** — rendering and navigation of the site; not the truth of the content (that is reviewed against the
  "Source of truth" footer of each page).
- **Runs on** — `npm ci && npm run docs:dev` (http://localhost:5173) for the dev-server cases; the GitHub
  Pages deployment for the last case.
- **Cases** — 9 (8 verified, 1 not verified)
- **Also see** — none; this repo has one area.

## 00 — Before you start
`npm ci --no-audit --no-fund`, then `npm run docs:dev`. Open the site in a browser with the developer console
visible; mermaid reports syntax errors there, not in the build.

## 01 — Pages
### 01.1 Every sidebar page renders [verified]
- Setup: dev server up.
- Steps: open every entry in every sidebar group, and the home page.
- Expect: each page renders with a heading and content; no 404, no blank page, no console error.
- Result (2026-09-20): 24 sidebar pages plus the home page, all with a heading, none reporting not found.

### 01.2 Moved pages keep their old URL alive [verified]
- Steps: open `/guide/architecture-overview`, `/development/local-setup`, `/deployment/aws-deployment-guide`,
  `/deployment/aws-architecture`, `/deployment/cleanup-guide`.
- Expect: each is a one-line stub whose link opens the new page.
- Result (2026-09-20): all five render and link to system context, local development, the deployment guide,
  the AWS deployment view and the lifecycle page respectively.

## 02 — Diagrams
### 02.1 Every mermaid block renders [verified]
- Steps: open every page that has a diagram; watch the console.
- Expect: every diagram draws as an SVG; no "Syntax error in text" placeholder, no mermaid console error.
- Result (2026-09-20): 16 diagrams across 10 pages, every one an SVG, none showing an error placeholder, and
  the console clean on reload.

### 02.2 Diagrams are legible in both themes [verified]
- Steps: open a diagram page, toggle the appearance switch, read the node labels and edge labels.
- Expect: node text, edges and boundary labels readable in both themes; nothing clipped or overlapping.
- Result (2026-09-20): readable in both. This case found REG-1 below, which is fixed.

## 03 — Images
### 03.1 Every image resolves [verified]
- Steps: `scripts/check-images.sh` exits 0; then open every page that carries an image.
- Expect: no broken image; each screenshot shows what its caption says.
- Result (2026-09-20): the check reports 16 files, all referenced, none missing, and no image on any page
  failed to load.

## 04 — Search
### 04.1 Local search finds service names [verified]
- Steps: search "pod-registry", "lcl start", "hibernate".
- Expect: each returns the owning page in the top results.
- Result (2026-09-20): "pod-registry" returns the store-core section first, "lcl start" returns local
  development first, "hibernate" returns the lifecycle page first.

## 04b — The AWS pages
### 04b.1 The operations pages match a live environment [verified]
- Setup: an environment deployed by the pipeline, and a signed-in console.
- Steps: read `/operations/deployment-guide`, `/operations/pipeline`, `/operations/lifecycle`,
  `/operations/monitoring` and `/architecture/deployment-aws` beside the console, and check every named
  resource, parameter, output and stage.
- Expect: each claim is true of the account, or the page is corrected.
- Result (2026-09-20): matched on the seven build projects, the three secrets, the fifteen registry
  repositories, six core and nine pod services, the single shared database below prod, the alias records, the
  certificate and its wildcard, and the dashboard's widgets. Two claims were wrong and were fixed: the stack
  shows ten outputs because `StripeWebhookPath` needs a Stripe key, and the apply stage skips the webhook
  registration without one.

## 05 — CI
### 05.1 A pull request builds the site without deploying [verified]
- Steps: open a pull request; look at the Actions run.
- Expect: the `build` job runs (npm ci, docs:build, check-images); the `deploy` job is skipped.
- Result (2026-09-20): on pull request #5 the build job passed in 29 seconds and the deploy job was skipped.

### 05.2 The deployed site matches the merged tree [not verified]
- Steps: after merge, wait for the Pages deployment; open https://cvhome-saas.github.io.
- Expect: the new sidebar and home page are live; a spot-check page renders its diagram.
- Nobody has run this: it needs the pull request merged.

## REG — regression watchlist
### REG-1 Two-line node labels clipped at the box edge
Found by case 02.2 on 2026-09-20, in both themes. Mermaid sizes a node box from the label's declared lines,
then re-wraps any line longer than `wrappingWidth` (200px by default), so `[Spring Cloud Gateway · :8000]`
became a third line and the port was cut off at the bottom edge. Boxes for `uaa`, `store-core-gateway`, the
object store and the Postgres cylinders were all affected. Fixed by setting `flowchart.wrappingWidth` to 340
in `docs/.vitepress/config.mts`. A new diagram whose second line is longer than that will clip again; widen
the setting or shorten the label.

### REG-2 A mermaid syntax error does not fail the build
Diagrams render in the browser, so a broken one is a broken picture on a green build. Case 02.1 is the only
thing that catches it.

## 99 — known gaps
- The thirteen AWS screenshot slots are comments until the AWS phase runs; `scripts/check-images.sh` ignores
  them by design, so no case covers them yet.
