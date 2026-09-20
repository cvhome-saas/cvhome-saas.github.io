#!/usr/bin/env bash
# Every image path the site names must resolve after a build, and every image file must be named by something.
#
# Two rules, because VitePress treats the two kinds of reference differently:
#
#   markdown  ![alt](/images/x.png)   Vite rewrites it and emits the file into assets/ with a hash.
#                                     The file lives under docs/ and the built page points at the hashed copy.
#   verbatim  config.mts logo, head   Nothing rewrites these. The path is served exactly as written, so the
#             tags, and anything else  file has to sit under docs/public, which is copied to the site root
#             outside markdown         untouched.
#
# The dev server hides the difference: Vite serves docs/ as the root, so a verbatim /images/... path resolves
# there and 404s in production. That shipped once, on 2026-09-20 — the site logo and favicon were dead on the
# deployed site while every check was green. Hence the second rule below.
#
#   scripts/check-images.sh          # exit 1 and list the offenders when anything is off
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

EXT='png|jpg|jpeg|svg|gif|webp|ico'

# A planned screenshot is an HTML comment `<!-- img: /images/x.png - what it shows -->`; those lines are
# stripped, so a slot waiting to be captured is not counted as a reference to a file that must exist.
md_refs=$(grep -rh --include='*.md' '' docs --exclude-dir=dist --exclude-dir=cache --exclude-dir=node_modules \
  | grep -v '<!-- *img:' \
  | grep -oE "/images/[A-Za-z0-9_./-]+\.($EXT)" | sort -u)

# Everything outside markdown: the config, the theme, any component.
verbatim_refs=$(grep -rh --include='*.mts' --include='*.ts' --include='*.vue' --include='*.js' '' docs \
  --exclude-dir=dist --exclude-dir=cache --exclude-dir=node_modules \
  | grep -oE "['\"]/[A-Za-z0-9_./-]+\.($EXT)" | tr -d "'\"" | sort -u)

in_docs=$(cd docs && find images -type f ! -name '.DS_Store' 2>/dev/null | sed 's#^#/#' | sort -u || true)
in_public=$(cd docs/public 2>/dev/null && find . -type f ! -name '.DS_Store' | sed 's#^\./#/#' | sort -u || true)

status=0

missing_md=$(comm -23 <(printf '%s\n' "$md_refs") <(printf '%s\n' "$in_docs") || true)
if [ -n "$missing_md" ]; then
  echo "✘ referenced from markdown but missing under docs/:"; printf '  %s\n' $missing_md; status=1
fi

orphans=$(comm -13 <(printf '%s\n' "$md_refs") <(printf '%s\n' "$in_docs") || true)
if [ -n "$orphans" ]; then
  echo "✘ present under docs/images but referenced nowhere:"; printf '  %s\n' $orphans; status=1
fi

missing_pub=$(comm -23 <(printf '%s\n' "$verbatim_refs") <(printf '%s\n' "$in_public") || true)
if [ -n "$missing_pub" ]; then
  echo "✘ named outside markdown, so served verbatim, but not under docs/public/:"
  printf '  %s\n' $missing_pub
  echo "  move the file into docs/public/ and reference it by its path from the site root."
  status=1
fi

if [ $status -eq 0 ]; then
  echo "✔ images: $(printf '%s\n' "$in_docs" | grep -c . ) under docs/images, all referenced; $(printf '%s\n' "$in_public" | grep -c . ) under docs/public, all resolvable."
fi
exit $status
