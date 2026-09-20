#!/usr/bin/env bash
# Every `/images/...` path referenced from the docs must exist, and every file under docs/images must be
# referenced. VitePress fails the build on a dead markdown link but not on a missing image, and an image
# nobody references is dead weight in every clone — so this is the gate for both.
#
#   scripts/check-images.sh          # exit 1 and list the offenders when anything is off
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

# Referenced paths: markdown images/links, HTML <img src>, config.mts strings — anything that names /images/…
# A planned screenshot is an HTML comment `<!-- img: /images/x.png - what it shows -->`. Those lines are
# stripped first, so a slot waiting to be captured is not counted as a reference to a file that must exist.
referenced=$(grep -rh --include='*.md' --include='*.mts' --include='*.ts' --include='*.vue' \
  --exclude-dir=dist --exclude-dir=cache --exclude-dir=node_modules '' docs \
  | grep -v '<!-- *img:' \
  | grep -oE '/images/[A-Za-z0-9_./-]+\.(png|jpg|jpeg|svg|gif|webp|ico)' | sort -u)
present=$(cd docs && find images -type f ! -name '.DS_Store' | sed 's#^#/#' | sort -u)

missing=$(comm -23 <(printf '%s\n' "$referenced") <(printf '%s\n' "$present") || true)
orphans=$(comm -13 <(printf '%s\n' "$referenced") <(printf '%s\n' "$present") || true)

status=0
if [ -n "$missing" ]; then
  echo "✘ referenced but missing under docs/:"; printf '  %s\n' $missing; status=1
fi
if [ -n "$orphans" ]; then
  echo "✘ present under docs/images but referenced nowhere:"; printf '  %s\n' $orphans; status=1
fi
[ $status -eq 0 ] && echo "✔ images: $(printf '%s\n' "$present" | grep -c . ) files, all referenced, none missing."
exit $status
