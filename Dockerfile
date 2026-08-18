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
