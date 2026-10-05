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
  -e VITE_SUPABASE_URL -e VITE_SUPABASE_ANON_KEY \
  -e NODE_OPTIONS=--max-old-space-size=1536 node:22-alpine \
  node node_modules/vite/bin/vite.js build
grep -Fq "$VITE_SUPABASE_URL" "$repo"/dist/assets/index-*.js
grep -Fq "$VITE_SUPABASE_ANON_KEY" "$repo"/dist/assets/index-*.js
backup="/opt/pinkhouse-backups/optional-email-$(date -u +%Y%m%dT%H%M%SZ)"
install -d -m 700 "$backup"
cp .env "$backup/auth.env"
tar -czf "$backup/site-dist.tar.gz" -C /opt/pinkhouse/site-dist .
docker exec supabase-db pg_dump -U postgres -d postgres -Fc > "$backup/database.dump"
docker exec -i supabase-db pg_restore -l < "$backup/database.dump" > "$backup/database.contents"
docker exec -i supabase-db psql -U postgres -d postgres -v ON_ERROR_STOP=1 \
  < "$repo/supabase/migrations/202610050001_optional_email_verification.sql"
sed -i 's/^ENABLE_EMAIL_AUTOCONFIRM=.*/ENABLE_EMAIL_AUTOCONFIRM=true/' .env
docker compose up -d --no-deps auth
for attempt in $(seq 1 15); do
  if curl -fsS -H "apikey: $VITE_SUPABASE_ANON_KEY" https://srv1978766.hstgr.cloud/auth/v1/health > /dev/null; then break; fi
  sleep 2
done
curl -fsS -H "apikey: $VITE_SUPABASE_ANON_KEY" https://srv1978766.hstgr.cloud/auth/v1/health > /dev/null
cp -a "$repo/dist/assets/." /opt/pinkhouse/site-dist/assets/
find "$repo/dist" -maxdepth 1 -type f ! -name index.html -exec cp -a '{}' /opt/pinkhouse/site-dist/ \;
cp -a "$repo/dist/index.html" /opt/pinkhouse/site-dist/index.html
printf 'RELEASE=%s\nBACKUP=%s\n' "$release" "$backup"
curl -fsS https://www.pinkhousebr.com/ | grep -o 'assets/index-[^" ]*\.js'
