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
  sh -c 'node --test scripts/test-reliability.mjs && node scripts/build-site-functions.cjs && node node_modules/vite/bin/vite.js build'
backup="/opt/pinkhouse-backups/reliability-$(date -u +%Y%m%dT%H%M%SZ)"
install -d -m 700 "$backup"
tar -czf "$backup/site-dist.tar.gz" -C /opt/pinkhouse/site-dist .
cp site-functions/bundle.cjs "$backup/site-functions-bundle.cjs"
# Keep the existing bind-mounted inode, then restart the adapter to load it.
cat "$repo/.site-functions-build/bundle.cjs" > site-functions/bundle.cjs
docker compose -f docker-compose.yml -f compose.production.yml -f compose.caddy.yml restart site-functions
for attempt in $(seq 1 15); do
  if curl -fsS -H 'Content-Type: application/json' -d '{"companion_ids":[]}' https://www.pinkhousebr.com/.netlify/functions/public-reliability-scores >/dev/null; then break; fi
  sleep 1
done
docker exec -i supabase-db psql -U postgres -d postgres -v ON_ERROR_STOP=1 -At \
  < "$repo/scripts/reliability-presence.sql" > "$repo/.site-functions-build/reliability-rows.jsonl"
docker run --rm --network host -v "$repo:/app:ro" -w /app node:22-alpine \
  node scripts/smoke-reliability.mjs .site-functions-build/reliability-rows.jsonl
cp -a "$repo/dist/assets/." site-dist/assets/
find "$repo/dist" -maxdepth 1 -type f ! -name index.html -exec cp -a '{}' site-dist/ \;
cp -a "$repo/dist/index.html" site-dist/index.html
printf 'RELEASE=%s\nBACKUP=%s\n' "$release" "$backup"
curl -fsS https://www.pinkhousebr.com/ | grep -o 'assets/index-[^" ]*\.js'
