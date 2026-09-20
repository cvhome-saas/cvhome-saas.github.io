# The gates CI runs, in order. `step "<name>" <command...>` stops at the first failure. Keep identical to CI.
step "diff is clean of whitespace errors" git diff --check
step "install" npm ci --no-audit --no-fund
step "docs build" npm run docs:build
step "images referenced exist, none orphaned" scripts/check-images.sh
