# Deploying welcometomimoland.com

The site runs on the `nemanjas.dev` VPS as a Docker container behind the host
nginx, in the same shape as the other apps on that box.

```
/srv/welcometomimoland.com/
├── docker-compose.yml     ← deploy/docker-compose.server.yml
├── deploy/                ← copies of this directory
└── src/                   ← this repo (main), cloned, owned by `deploy`
```

The container publishes on `127.0.0.1:8088`. The loopback prefix is what keeps
it off the internet — Docker writes its own iptables rules below UFW, so a
port published on `0.0.0.0` is reachable even when the firewall says closed.

## What is in the image

`next.config.ts` sets `output: "export"`, so the build emits a directory of
files and nothing needs Node at runtime. The runtime stage is therefore a
plain `nginx:alpine` holding the export plus two config files — no
`node_modules`, no application process.

There is **no `.env`**, unlike the other apps on the box. A static site has no
credentials to pass in, so there is nothing to configure at runtime.

`deploy/cache.conf` is included by the container nginx rather than the host, so
a push that changes the cache policy takes effect on the next deploy with no
host-side edit. `public/_headers` is the same policy in Cloudflare Pages
syntax — keep the two in step.

## Automatic deploys

Push to `main` → `.github/workflows/deploy.yaml` POSTs an HMAC-signed payload
to `https://nemanjas.dev/hooks/mimoland` → the webhook service runs
`/opt/deploy/mimoland.sh` as the unprivileged `deploy` user, which pulls,
rebuilds and recreates the container.

The workflow holds no SSH key and no registry credentials; the HMAC signature
is the entire authentication. `WEBHOOK_SECRET` in the repo secrets must equal
the `secret` field of the `mimoland` entry in `/opt/deploy/hooks.json`.

The box pulls with a **read-only** deploy key (`~deploy/.ssh/id_ed25519_mimoland`,
registered on this repo as "VPS"), so commits are pushed from a developer
machine rather than from the server.

Note the branch: `main` is the deployed branch. `design-system-pass` shares no
history with it and is not deployed.

## Manual deploy

```sh
ssh deploy-nemanjas
cd /srv/welcometomimoland.com
git -C src pull
docker compose build app && docker compose up -d
```

## First-time / root-level setup

```sh
sudo bash /srv/welcometomimoland.com/deploy/install-root.sh
```

Idempotent; backs up everything it replaces and rolls the vhost back if
`nginx -t` fails.

## TLS and Cloudflare

The certificate is the **vidika.co** Certbot lineage — one cert covers both
names, so renewal affects both sites. That is why the port-80 and Certbot
blocks in `nginx-welcometomimoland.com.conf` are carried over untouched.

The site is proxied by Cloudflare, so the origin sees Cloudflare addresses.
`cloudflare-realip.conf` restores the visitor address from `CF-Connecting-IP`.
Nothing here rate-limits, so it only buys correct access logs. The installer
creates that snippet only if it is absent — vidika.co installs the same file,
and neither site rewrites it out from under the other.

`www.welcometomimoland.com` has no DNS record, so no `www` vhost is configured.
