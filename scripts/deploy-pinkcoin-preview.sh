#!/usr/bin/env bash
set -euo pipefail
release="${1:?Provide the reviewed Git commit}"
repo=/opt/pinkhouse-build/account-deletion
git -C "$repo" fetch origin codex/fix-companion-signup
test -z "$(git -C "$repo" status --porcelain --untracked-files=no)"
git -C "$repo" checkout --detach "$release"
cd /opt/pinkhouse
export VITE_SUPABASE_URL=https://srv1978766.hstgr.cloud
VITE_SUPABASE_ANON_KEY="$(sed -n 's/^ANON_KEY=//p' .env | tr -d '\r')"
export VITE_SUPABASE_ANON_KEY
test -n "$VITE_SUPABASE_ANON_KEY"
docker run --rm --memory=2g --cpus=1 -v "$repo:/app" -w /app \
  -e VITE_SUPABASE_URL -e VITE_SUPABASE_ANON_KEY -e NODE_OPTIONS=--max-old-space-size=1536 node:22-alpine \
  node node_modules/vite/bin/vite.js build
# Publish only the frontend. No package rows, payments, balances or functions
# are changed by this demonstration storefront deployment.
backup="/opt/pinkhouse-backups/pinkcoin-preview-$(date -u +%Y%m%dT%H%M%SZ)"
install -d -m 700 "$backup"
tar -czf "$backup/site-dist.tar.gz" -C site-dist .
cp -a "$repo/dist/assets/." site-dist/assets/
find "$repo/dist" -maxdepth 1 -type f ! -name index.html -exec cp -a '{}' site-dist/ \;
cp -a "$repo/dist/index.html" site-dist/index.html
printf 'RELEASE=%s\nBACKUP=%s\n' "$release" "$backup"
curl -fsS https://www.pinkhousebr.com/wallet | grep -o 'assets/index-[^" ]*\.js'
