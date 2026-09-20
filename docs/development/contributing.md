---
title: Contributing
---

# Contributing

Every repository in the organization works the same way. The rules below are the ones the tooling
enforces, so following them is faster than not: a hook refuses a push without a verification receipt, and
the release notes are built from pull request labels.

## The shape of a change

`main` is the integration branch in every repository. Nobody commits or pushes to it; every change lands
through a pull request. Versions are `vX.Y.Z` git tags cut by the organization's release workflow, never by
hand, and no file carries a version number.

A change starts as a fresh worktree cut from an up-to-date `main`, before the first file is written:

```bash
git fetch origin
git worktree add --no-track .claude/worktrees/<type>-<name> -b <type>/<name> origin/main
```

`<type>` is one of `feat`, `fix`, `docs`, `chore`, `refactor`, `test`. Work and verify inside that worktree;
the primary checkout stays clean on `main`. When a change spans repositories, use the same branch name in
each of them: some checks compare a branch against the branch of the same name in its sibling.

Anything larger than a single commit starts as a written plan at `.agents/plans/<name>.md`: the context with
evidence, why the design is what it is, then one `## Phase N` section per commit, small enough to review in
one sitting. **A plan is one pull request**, and each phase is one commit on it, easiest first. Never one
pull request per phase: stacked pull requests re-conflict on every merge and each has to earn its
verification again.

## Before you push

```bash
scripts/verify.sh
```

Each repository has this script, and it runs exactly what that repository's CI runs. On success it writes a
receipt holding a digest of the tree it verified. The pre-push hook recomputes that digest and refuses the
push when they differ, so a receipt stops being valid the moment you edit another file. Never bypass it.

What the gates are depends on the repository: the application runs Checkstyle with warnings as errors, the
build, unit and integration tests with coverage floors, and both frontends' lint and tests; the platform runs
Terraform formatting, validation and linting plus the catalog drift check; this site installs and builds the
site and checks that every image it references exists.

A change to behaviour is also expected to have been exercised against a running stack, not only against
tests. For the application that means `lcl start -d`; see [Local development](/development/local-development).

## Tests and QA

Tests prove a unit. A QA file proves the path a person takes. A user-visible or operator-visible behaviour is
not finished until it has a case in the owning area's `qa/<area>-qa.md`, with setup, steps and expected
result, tagged `[verified]` when someone has run it end to end and `[not verified]` when nobody has. Do not
tag a case verified because it looks right; the untagged cases are where the defects are.

A new screen starts as a design, reviewed and recorded, before any page file exists.

## The pull request

Commit messages are `<type|area>: <what changed>` in the imperative, with a body when the change is not
self-evident.

The pull request body follows the template: **Why** the change exists in the reader's terms, **What** changed
at the level of decisions rather than a file list, **The parts that are not obvious** (the traps a reviewer
would otherwise re-derive), **Deviations** from the plan including what is deliberately not done, and
**Verification** listing exactly what you ran and its result. Never tick a gate that did not run.

Label the pull request. `type/enhancement`, `type/bug`, `type/documentation`, `type/test`, `type/chore` and
`type/dependency-upgrade` build the release notes; `warn/api-change`, `warn/behavior-change`,
`warn/deprecation`, `warn/regression` and `warn/blocker` mark what a reader must not miss; `ignore-changelog`
keeps a change out of the notes. An unlabelled pull request lands under "Other Changes".

## Where things belong

| Change | Repository |
|---|---|
| Service code, the console, the storefront, configuration slices, the local stack file | `cvhome` |
| Terraform, the bootstrap template, the pipeline, the service catalog on AWS | `cvhome-platform` |
| The local stack runner itself | `lcl` |
| Load tests | `load-testing` |
| Browser regression tests | `e2e-testing` |
| The Caddy image and its plugins | `saas-gateway`, `caddy-domainlookup`, `certmagic-s3` |
| This site | `cvhome-saas.github.io` |
| An idea, before there is code | `ideation` |

One repository per commit. A change that spans repositories is an ordered series of pull requests, producers
before consumers, each linking its siblings and naming the merge order. Documentation that describes a
behaviour travels with that behaviour, in the same pull request.

The full repository list is on [Repositories](/guide/repositories).

---

*Source of truth: `cvhome-saas.github.io/AGENTS.md`, `.github/PULL_REQUEST_TEMPLATE.md`, `.github/release.yml`, `scripts/verify.sh`; cvhome `AGENTS.md`, `extra/scripts/verify-before-push.sh`; orchestrator `CLAUDE.md`, `repos.yaml`.*
