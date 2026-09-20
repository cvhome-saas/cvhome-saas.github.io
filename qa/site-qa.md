# QA — the public site

The VitePress site at https://cvhome-saas.github.io: every page in the sidebar, every diagram, every image,
both colour themes, the search index, and the CI that builds and deploys it.

- **Scope** — rendering and navigation of the site; not the truth of the content (that is reviewed against the
  "Source of truth" footer of each page).
- **Runs on** — `npm ci && npm run docs:dev` (http://localhost:5173) for the dev-server cases; the GitHub
  Pages deployment for the last case.
- **Cases** — 8 (0 verified, 8 not verified)
- **Also see** — none; this repo has one area.

## 00 — Before you start
`npm ci --no-audit --no-fund`, then `npm run docs:dev`. Open the site in a browser with the developer console
visible; mermaid reports syntax errors there, not in the build.

## 01 — Pages
### 01.1 Every sidebar page renders [not verified]
- Setup: dev server up.
- Steps: click every entry in every sidebar group, and every nav item.
- Expect: each page renders with a title and content; no 404, no blank page, no console error.

### 01.2 Moved pages keep their old URL alive [not verified]
- Steps: open `/guide/architecture-overview`, `/development/local-setup`, `/deployment/aws-deployment-guide`,
  `/deployment/aws-architecture`, `/deployment/cleanup-guide`.
- Expect: each is a one-line stub whose link opens the new page.

## 02 — Diagrams
### 02.1 Every mermaid block renders [not verified]
- Steps: open every architecture page and the repositories page; watch the console.
- Expect: every diagram draws; no "Syntax error in text" placeholder, no mermaid error in the console.

### 02.2 Diagrams are legible in dark mode [not verified]
- Steps: toggle the theme switch on each diagram page.
- Expect: node text, edges and boundary labels readable in both themes; no white-on-white or black-on-black.

## 03 — Images
### 03.1 Every image resolves [not verified]
- Steps: `scripts/check-images.sh` exits 0; then scroll every page with images in the browser.
- Expect: no broken image icon; each screenshot shows what its caption says.

## 04 — Search
### 04.1 Local search finds service names [not verified]
- Steps: search "pod-registry", "lcl start", "hibernate".
- Expect: each returns the owning page in the top results.

## 05 — CI
### 05.1 A pull request builds the site without deploying [not verified]
- Steps: open a PR; look at the Actions run.
- Expect: the `build` job runs (npm ci, docs:build, check-images); the `deploy` job is skipped.

### 05.2 The deployed site matches the merged tree [not verified]
- Steps: after merge, wait for the Pages deployment; open https://cvhome-saas.github.io.
- Expect: the new sidebar and home page are live; a spot-check page renders its diagram.

## REG — regression watchlist
- A mermaid syntax error does not fail the build; it breaks one diagram silently (case 02.1 is the only catch).

### REG-3 A path named outside markdown is served verbatim, and only production shows it
Found by case 05.2 on 2026-09-20, after the first deploy. VitePress rewrites image paths it finds in markdown
and emits the files into `assets/` with a hash, but a path named anywhere else, such as `themeConfig.logo` or
a `head` favicon tag, is written into the page exactly as given. Such a file has to live under `docs/public`,
which is copied to the site root untouched. The logo sat in `docs/images/logo/`, so the dev server served it
(Vite serves `docs/` as the root) and the deployed site 404'd on it, with every check green.

Fixed by moving it to `docs/public/logo.png` and referencing `/logo.png`. `scripts/check-images.sh` now has a
second rule for paths named outside markdown and fails when one is not under `docs/public`; reverting the move
makes it fail, which is how the rule was checked. **Closed 2026-09-20 on the deployed site**: `/logo.png`
answers 200, and the home page names no other image path. The point of this entry is that the local checks
were green while production was broken, so it is not closed until production says so.

## 99 — known gaps
- None recorded yet.
