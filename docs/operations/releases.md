---
title: Releases
---

# Releases

One version across every repository, cut by tag from the orchestrator, deploying nothing.

A release is a **compatibility record**: the same `vX.Y.Z` tag and a GitHub release in every tagged repository,
plus a manifest in the orchestrator. It moves no environment. Which version an environment runs is a separate
decision, made in cvhome-platform by PR ([pipeline and promotion](/operations/pipeline)).

## The model

1. **One version everywhere.** SemVer `X.Y.Z`. Every repository with `tag: true` in the orchestrator's
   `repos.yaml` gets the same tag `vX.Y.Z` on `main` on the same day, whether or not it changed. Compatibility
   is then a tautology: version X of anything works with version X of everything else.
2. **The tag is the version; no file carries it.** cvhome's `gradle.properties` stays `0.0.0-SNAPSHOT`; the
   platform's CodeBuild checks cvhome out at `vX.Y.Z` and passes `-Pversion=X.Y.Z`, and Gradle tags the images
   `X.Y.Z`, `X.Y` and `latest`. A snapshot build tags only `latest`, so a branch build can never overwrite a
   release. cvhome-platform has no version file either.
3. **A release is one button** in the orchestrator's `Release` workflow (`release-product.yml`).
4. **Releases do not deploy.** The orchestrator only records which released version each environment names.
5. **Nothing publishes from GitHub Actions in cvhome.** `saas-gateway` and `aws-otel-collector` keep pushing
   `sha-<short>` on `main`; on a `vX.Y.Z` tag their workflows also push `X.Y.Z`. `public-dkr` mirrors the
   released `X.Y.Z` to public ECR; cvhome pins `saas-gateway:X.Y.Z`.
6. The first aligned version was **2.0.0**, cut 2026-09-07.

| Tagged (`tag: true`) | Rolling (`main` is the release) |
|---|---|
| `cvhome`, `cvhome-platform`, `lcl`, `saas-gateway`, `caddy-domainlookup`, `certmagic-s3`, `aws-otel-collector` | `load-testing`, `e2e-testing`, `public-dkr`, `assets`, `cvhome-saas.github.io`, `.github`, `ideation`, `orchestrator` |

## Cutting a release

```bash
gh workflow run release-product.yml -R cvhome-saas/orchestrator -f bump=auto      # or patch|minor|major
gh workflow run release-product.yml -R cvhome-saas/orchestrator -f version=2.1.0  # explicit
gh run watch -R cvhome-saas/orchestrator
```

What the workflow does, in order:

1. Decides the version from cvhome's merged PR labels since the last tag (`warn/*` gives a major,
   `type/enhancement` or `feat:` a minor, anything else a patch), or takes the one given. Nothing to release
   (only `ignore-changelog` PRs) stops the run.
2. Checks that every tagged repository is green on `main` and does not already carry the tag.
3. Runs the cross-repo contract check.
4. Creates the `vX.Y.Z` tag and a GitHub release with generated notes in every repository listed by
   `scripts/release.py tagged-repos`, through a GitHub App, not a personal token.
5. Commits `releases/vX.Y.Z.yaml` to the orchestrator.

Dry run: `scripts/release.py next-version --json` shows the last tag, the PRs and the bump it would pick. A
hotfix is the fix merged to `main` and the workflow run with `bump=patch`.

**Never push a `v*` tag or bump a version file by hand.** Every repository's push guard refuses a push to
`main`, and the tags exist only as the workflow's output. cvhome-platform's `release-guard` CI job runs on
every `v*` tag and fails if a protected environment's tfvars still names `latest`.

## The manifest

`releases/vX.Y.Z.yaml` records the commit each tagged repository was at and which load-testing and
e2e-testing commits the version was validated with:

```yaml
version: 2.0.0
date: 2026-09-07
repos:
  cvhome:                <sha>
  cvhome-platform:       <sha>
  lcl:                   <sha>
  saas-gateway:          <sha>
  caddy-domainlookup:    <sha>
  certmagic-s3:          <sha>
  aws-otel-collector:    <sha>
validated_by:
  load-testing:          { commit: <sha>, result: pending }
  e2e-testing:           { commit: <sha>, result: pending }
```

## Changelog from labels

Every repository carries the same `.github/release.yml`, so the generated notes look alike. PR labels sort
into sections, and the same labels drive the version bump:

| Section | Labels |
|---|---|
| Update considerations and deprecations | `warn/api-change`, `warn/behavior-change`, `warn/blocker`, `warn/deprecation`, `warn/regression` |
| New features and improvements | `type/enhancement` |
| Documentation | `type/documentation` |
| Bug fixes | `type/bug` |
| Other changes | everything else |
| Excluded | `ignore-changelog`, `type/test`, `type/chore`, `type/dependency-upgrade` |

## Deploying a version

Not here. Deploying `X.Y.Z` to an environment is a PR in cvhome-platform changing `image_tag` in
`envs/<env>.tfvars`, then a run of that environment's `3-apply` project. A new environment gets its version
from the bootstrap stack's `ImageTag` parameter instead. Both are described on
[pipeline and promotion](/operations/pipeline) and the [deployment guide](/operations/deployment-guide).

---

*Source of truth: orchestrator `docs/releasing.md`, `docs/release-plan.md`, `repos.yaml`, `releases/v2.0.0.yaml`;
cvhome-platform `.github/release.yml`, `README.md`.*
