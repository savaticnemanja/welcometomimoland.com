# Deploying welcometomimoland.com

The site runs on the `nemanjas.dev` VPS as a Docker container behind the host
nginx, in the same shape as the other apps on that box.

```
/srv/welcometomimoland.com/
├── docker-compose.yml     ← deploy/docker-compose.server.yml
├── .env                   ← Resend key; never committed, 0640 nemanjas:developers
├── deploy/                ← copies of this directory
└── src/                   ← this repo (main), cloned, owned by `deploy`
```

Two containers:

| service | port | what it is |
| --- | --- | --- |
| `app` | `127.0.0.1:8088` | nginx serving the static export |
| `api` | `127.0.0.1:8089` | the contact handler, `POST /api/contact` only |

They are separate because the site needs no runtime at all and the handler is
the one route that cannot be a file. Split this way the site stays up whether
or not the mail path is healthy, and neither container needs a supervisor to
hold two daemons. The host nginx joins them back into one origin.

The loopback prefix on both is what keeps them off the internet — Docker
writes its own iptables rules below UFW, so a port published on `0.0.0.0` is
reachable even when the firewall says closed.

## What is in the image

`next.config.ts` sets `output: "export"`, so the build emits a directory of
files and nothing needs Node at runtime. The runtime stage is therefore a
plain `nginx:alpine` holding the export plus two config files — no
`node_modules`, no application process.

`.env` holds the Resend key and is read only by the `api` service; the static
site needs nothing. Mode 0640 `nemanjas:developers` — the group matters,
because the deploy hook runs as `deploy` and compose cannot read a 0600 file.

## The form

`content/site.tsx` sets `formEndpoint` to `/api/contact`. Set it back to `null`
and the deck form degrades to a `mailto:` link, which is what it did before the
handler existed — worth knowing, because that is the fallback if the `api`
container is ever taken out.

A submission sends two messages: the enquiry to `partnerships@`, and a branded
acknowledgement back to the visitor ("Your message has landed"). The enquiry
goes first and its failure is the one that fails the request; a failed
acknowledgement is logged and swallowed, because the message did arrive and
saying otherwise would be false.

Defence in depth, outermost first: nginx `limit_req` at 10r/m, then the
handler's own per-IP and global sliding windows, an origin allowlist, a
honeypot field answered with a plain `200` so it learns nothing, a minimum
time-on-form, and a 32 KB body cap.

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
