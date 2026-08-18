#!/usr/bin/env bash
# Deploy hook for welcometomimoland.com — invoked by /opt/deploy/hooks.json
# (webhook svc, runs as user `deploy`). Pulls main, rebuilds the image,
# restarts the stack. Install to /opt/deploy/mimoland.sh (owner deploy, 0701).
set -euo pipefail

ROOT="/srv/welcometomimoland.com"
SRC="$ROOT/src"
BRANCH="main"

cd "$SRC"
git fetch --prune origin "$BRANCH"
git reset --hard "origin/$BRANCH"

cd "$ROOT"
docker compose build app
docker compose up -d --remove-orphans

# Drop the previous image layers so the disk does not creep. This one matters
# more than most: the builder stage carries a full node_modules and the export.
docker image prune -f

echo "deployed welcometomimoland.com @ $(git -C "$SRC" rev-parse --short HEAD)"
