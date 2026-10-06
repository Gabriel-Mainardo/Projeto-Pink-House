#!/usr/bin/env bash
set -euo pipefail
release="${1:?Provide the reviewed Git commit}"
repo=/opt/pinkhouse-build/account-deletion
git -C "$repo" fetch origin codex/fix-companion-signup
test -z "$(git -C "$repo" status --porcelain --untracked-files=no)"
git -C "$repo" checkout --detach "$release"
cd /opt/pinkhouse
backup="/opt/pinkhouse-backups/email-ptbr-$(date -u +%Y%m%dT%H%M%SZ)"
install -d -m 700 "$backup"
cp docker-compose.yml "$backup/docker-compose.yml"
if [[ -d site-dist/auth-email-templates ]]; then cp -a site-dist/auth-email-templates "$backup/templates"; fi
install -d site-dist/auth-email-templates
cp -a "$repo/public/auth-email-templates/." site-dist/auth-email-templates/
python3 "$repo/scripts/smoke-auth-email-templates.py"
python3 "$repo/scripts/configure-auth-email-templates.py"
compose=(docker compose -f docker-compose.yml -f compose.production.yml -f compose.caddy.yml)
"${compose[@]}" config -q
"${compose[@]}" up -d --no-deps auth
anon="$(sed -n 's/^ANON_KEY=//p' .env | tr -d '\r')"
for attempt in $(seq 1 15); do
  if curl -fsS -H "apikey: $anon" https://srv1978766.hstgr.cloud/auth/v1/health >/dev/null; then break; fi
  sleep 1
done
curl -fsS -H "apikey: $anon" https://srv1978766.hstgr.cloud/auth/v1/health >/dev/null
docker exec supabase-auth env | grep -E '^GOTRUE_MAILER_(SUBJECTS|TEMPLATES)_'
printf 'RELEASE=%s\nBACKUP=%s\n' "$release" "$backup"
