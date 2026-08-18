# welcometomimoland.com — the built static site, served by nginx.
#
# next.config.ts sets output: "export", so the build emits a directory of
# files and nothing needs Node at runtime. That makes the runtime stage a
# plain nginx with no node_modules, no application process, and nothing to
# crash — the whole image is the export plus two config files.
#
# The two stages run on different bases on purpose. The build installs sharp,
# which ships prebuilt binaries against glibc, so it gets Debian slim; musl
# there means a different target or a build from source. The runtime installs
# nothing, so it gets Alpine and the image ends up a fraction of the size.

# ── Build ─────────────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS builder
WORKDIR /app

# Manifests before source. This is the expensive layer, and copying only the
# two files that decide it keeps it cached across every edit to the site.
COPY package.json package-lock.json ./
RUN npm ci

# Everything `next build` reads, and nothing else. assets/ is deliberately
# absent: it holds the ~19 MB of source images and video that scripts/ grinds
# down into public/, and the build never touches it.
COPY next.config.ts tsconfig.json ./
COPY app ./app
COPY components ./components
COPY content ./content
COPY public ./public

# Next writes telemetry on first run in CI-less environments; off here so the
# build does not reach the network for something nobody reads.
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ── Runtime ───────────────────────────────────────────────────────────
FROM nginx:alpine AS runner

# The stock default.conf serves /usr/share/nginx/html with no cache policy and
# no 404 page; both get replaced here.
COPY deploy/container-nginx.conf /etc/nginx/conf.d/default.conf
# Not conf.d/ — the base image includes that at http{} level, where the
# location blocks in this file are a syntax error. See container-nginx.conf.
COPY deploy/cache.conf /etc/nginx/snippets/cache.conf

COPY --from=builder /app/out /usr/share/nginx/html

EXPOSE 80

# busybox wget, which Alpine already has — adding curl for a healthcheck would
# be a layer and an attack surface for nothing.
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/healthz || exit 1

# ── Contact handler ───────────────────────────────────────────────────
# A second runtime, built from the same context and run as its own container.
#
# The site does not need this to be served — nginx above answers every route
# that is a file. This exists only for POST /api/contact, which cannot be one.
# Keeping them apart means the static site stays up whether or not the mail
# path is healthy, and neither needs a process supervisor to share a container.
#
# No node_modules: the Resend transport is one fetch() call, and the rest is
# node:* builtins. There is nothing here to `npm ci`.
FROM node:22-alpine AS api
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8787
# 0.0.0.0, not loopback: the port is reached from outside this network
# namespace. What keeps it off the internet is the 127.0.0.1 prefix on the
# published port in docker-compose.yml.
ENV HOST=0.0.0.0

# Only the source files, named by extension so a stray file in that directory
# can never be baked in by accident.
COPY server/*.mjs ./server/

# The node image ships a `node` user. Nothing here is written to at runtime.
USER node

EXPOSE 8787

# `node -e`, not curl or wget: this is the slim-ish node image and adding a
# tool for a healthcheck is a layer for nothing. -e runs as CommonJS, so
# require() is available regardless of the app being ESM. The start period
# covers the boot-time check that the Resend key works.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:8787/healthz', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "server/index.mjs"]
