#!/usr/bin/env bash
# welcometomimoland.com — the parts of the setup that need root. Everything
# else (/srv/welcometomimoland.com, the clone, the image) is already in place.
#
#   sudo bash /srv/welcometomimoland.com/deploy/install-root.sh
#
# Idempotent: safe to re-run. Every file it replaces is backed up next to
# itself with a timestamp, and if `nginx -t` fails the old vhost is restored
# and nginx is never reloaded.
set -euo pipefail

STAMP="$(date +%Y%m%d-%H%M%S)"
SRC=/srv/welcometomimoland.com/deploy
say() { printf "\n\033[1m── %s\033[0m\n" "$*"; }

[ "$(id -u)" -eq 0 ] || { echo "must run as root (sudo bash $0)" >&2; exit 1; }

# ── 1. shared Cloudflare snippet ──────────────────────────────────────
# Created only if absent. vidika.co installs the same file; whichever runs
# first owns it, and neither silently rewrites the other site behaviour.
say "cloudflare real-ip snippet"
mkdir -p /etc/nginx/snippets
if [ -f /etc/nginx/snippets/cloudflare-realip.conf ]; then
    echo "  already present, left alone"
else
    install -m 0644 -o root -g root "$SRC/cloudflare-realip.conf" /etc/nginx/snippets/cloudflare-realip.conf
    echo "  installed"
fi

# ── 1b. rate-limit zone ───────────────────────────────────────────────
# http{} context, so it cannot live in the vhost. Consumed by the limit_req in
# the /api/contact location.
say "installing conf.d/welcometomimoland.com-ratelimit.conf"
install -m 0644 -o root -g root "$SRC/welcometomimoland.com-ratelimit.conf" /etc/nginx/conf.d/welcometomimoland.com-ratelimit.conf
echo "  installed"

# ── 2. the vhost, with rollback ───────────────────────────────────────
say "installing vhost (was: static root /var/www/welcometomimoland.com)"
VHOST=/etc/nginx/sites-available/welcometomimoland.com
BACKUP="$VHOST.bak-$STAMP"
cp -a "$VHOST" "$BACKUP"
echo "  backup: $BACKUP"
install -m 0644 -o nemanja -g nemanja "$SRC/nginx-welcometomimoland.com.conf" "$VHOST"

[ -L /etc/nginx/sites-enabled/welcometomimoland.com ] || \
    ln -s "$VHOST" /etc/nginx/sites-enabled/welcometomimoland.com

say "nginx -t"
if nginx -t; then
    systemctl reload nginx
    echo "  reloaded"
else
    echo "  FAILED — restoring previous vhost, nginx NOT reloaded" >&2
    cp -a "$BACKUP" "$VHOST"
    rm -f /etc/nginx/conf.d/welcometomimoland.com-ratelimit.conf
    nginx -t >/dev/null 2>&1 && echo "  rollback verified" >&2
    exit 1
fi

# ── 3. deploy hook script ─────────────────────────────────────────────
say "installing /opt/deploy/welcometomimoland.com.sh"
install -m 0701 -o deploy -g deploy "$SRC/welcometomimoland.com.sh" /opt/deploy/welcometomimoland.com.sh
ls -l /opt/deploy/welcometomimoland.com.sh

# ── 4. hooks.json entry ───────────────────────────────────────────────
say "adding mimoland entry to /opt/deploy/hooks.json"
cp -a /opt/deploy/hooks.json "/opt/deploy/hooks.json.bak-$STAMP"
python3 - "$SRC/hook-entry.json" <<'PY'
import json, sys
hooks_path = "/opt/deploy/hooks.json"
with open(hooks_path) as fh:
    hooks = json.load(fh)
with open(sys.argv[1]) as fh:
    entry = json.load(fh)

hooks = [h for h in hooks if h.get("id") != entry["id"]]
hooks.append(entry)

with open(hooks_path, "w") as fh:
    json.dump(hooks, fh, indent=2)
    fh.write("\n")
print("  ids now: " + ", ".join(h["id"] for h in hooks))
PY
chown deploy:deploy /opt/deploy/hooks.json
chmod 0640 /opt/deploy/hooks.json

say "restarting webhook-deploy.service"
systemctl restart webhook-deploy.service
sleep 1
systemctl is-active webhook-deploy.service

say "done"
echo "hook is live at https://nemanjas.dev/hooks/mimoland"
