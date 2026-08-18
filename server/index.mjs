/**
 * The contact handler for welcometomimoland.com.
 *
 *   POST /api/contact   the deck-request form
 *   GET  /healthz       liveness for the reverse proxy and uptime checks
 *
 * It serves no files. The site is a static export served by nginx — both the
 * one inside the site image and the one on the host — so this process exists
 * only for the one route that cannot be a file.
 */

import http from 'node:http';

import { CONFIG } from './config.mjs';
import { createMailer } from './mail.mjs';
import { RateLimiter } from './ratelimit.mjs';
import { validate } from './validate.mjs';

const log = console;
const limiter = new RateLimiter(CONFIG.rate);

function json(res, status, body, headers = {}) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
    'Cache-Control': 'no-store',
    ...headers,
  });
  res.end(payload);
}

/**
 * Cloudflare sets CF-Connecting-IP on every request and overwrites whatever
 * the client sent, which makes it the most trustworthy hop here. X-Real-IP is
 * nginx's, for a request that somehow reached the origin directly.
 */
function clientIp(req) {
  const cf = req.headers['cf-connecting-ip'];
  if (typeof cf === 'string' && cf) return cf;

  const real = req.headers['x-real-ip'];
  if (typeof real === 'string' && real) return real;

  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress ?? 'unknown';
}

function originAllowed(req) {
  const origin = req.headers.origin;
  // A same-origin POST from a form need not carry Origin at all. When it is
  // absent there is nothing to check; when it is present it must be one of
  // ours, which is what stops a page elsewhere from posting here.
  if (!origin) return true;
  return CONFIG.allowedOrigins.includes(origin);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;

    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > CONFIG.maxBodyBytes) {
        // Stop reading, but leave the socket alive long enough to answer —
        // destroying it here means the visitor sees a network error rather
        // than the message explaining what happened.
        req.pause();
        reject(Object.assign(new Error('body too large'), { status: 413 }));
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

/**
 * The page posts JSON. urlencoded is accepted too, because that is what a
 * plain <form> falls back to with JavaScript disabled, and answering it costs
 * three lines.
 */
function parseBody(raw, contentType = '') {
  const type = contentType.split(';')[0].trim().toLowerCase();

  if (type === 'application/x-www-form-urlencoded') {
    return Object.fromEntries(new URLSearchParams(raw));
  }
  // Default to JSON — including when the type is missing, which is what a
  // fetch() with a plain object body sends.
  return JSON.parse(raw);
}

async function handleContact(req, res, mailer) {
  if (!originAllowed(req)) {
    log.warn(`[http] rejected origin ${req.headers.origin}`);
    return json(res, 403, { ok: false, error: 'This form cannot be submitted from there.' });
  }

  const ip = clientIp(req);
  const { allowed, retryAfterSec } = limiter.take(ip);
  if (!allowed) {
    return json(
      res,
      429,
      { ok: false, error: 'That is a few more than we can take just now. Please try again shortly.' },
      { 'Retry-After': String(retryAfterSec) },
    );
  }

  let body;
  try {
    const raw = await readBody(req);
    body = parseBody(raw, req.headers['content-type']);
  } catch (error) {
    const status = error.status ?? 400;
    const message =
      status === 413 ? 'That message is longer than this form can take.' : 'That submission did not arrive intact.';
    return json(res, status, { ok: false, error: message });
  }

  const result = validate(body);
  if (!result.ok) {
    // The honeypot answers 200 with no send, so whatever tripped it cannot
    // tell the difference between being caught and getting through.
    if (result.spam) {
      log.warn(`[http] honeypot tripped from ${ip}`);
      return json(res, 200, { ok: true });
    }
    return json(res, result.status, { ok: false, error: result.error });
  }

  try {
    await mailer.deliver(result.value, {
      ip,
      at: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
    });
  } catch (error) {
    log.error(`[mail] delivery failed: ${error.message}`);
    return json(res, 502, {
      ok: false,
      error: 'We could not pass that on just now. Please email partnerships@welcometomimoland.com directly.',
    });
  }

  return json(res, 200, { ok: true });
}

const server = http.createServer();

const boot = async () => {
  const mailer = await createMailer(log);

  // Fails the boot rather than the first enquiry. The container healthcheck
  // has a start period long enough to cover this call.
  try {
    await mailer.verify();
  } catch (error) {
    log.error(`[mail] ${error.message}`);
    process.exit(1);
  }

  server.on('request', (req, res) => {
    const path = (req.url ?? '/').split('?')[0].replace(/\/+$/, '') || '/';

    if (req.method === 'GET' && path === '/healthz') {
      return json(res, 200, { ok: true, transport: CONFIG.transport });
    }

    if (path === '/api/contact') {
      if (req.method === 'POST') return handleContact(req, res, mailer);
      return json(res, 405, { ok: false, error: 'Method not allowed.' }, { Allow: 'POST' });
    }

    return json(res, 404, { ok: false, error: 'Not found.' });
  });

  server.listen(CONFIG.port, CONFIG.host, () => {
    log.info(
      `[http] contact handler on http://${CONFIG.host}:${CONFIG.port}/api/contact → ${CONFIG.mail.to} (${CONFIG.transport})`,
    );
  });
};

for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
    // Don't let a hung keep-alive socket block a restart.
    setTimeout(() => process.exit(0), 5000).unref();
  });
}

boot().catch((error) => {
  log.error(`[boot] ${error.message}`);
  process.exit(1);
});
