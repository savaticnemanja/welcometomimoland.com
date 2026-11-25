/**
 * The /admin dashboard's API. One shared password (ADMIN_PASSWORD), no user
 * table: this is a dashboard for the studio, not an account system.
 *
 *   POST /api/admin/login     { password } → session cookie
 *   POST /api/admin/logout
 *   GET  /api/admin/session   200 when signed in, 401 when not
 *   GET  /api/admin/stats?days=7|30|90|365
 *   POST /api/admin/report    { kind, message, path } → ticket in the tracker
 *
 * The session is a signed expiry in an HttpOnly, SameSite=Strict cookie
 * scoped to /api/admin — the page itself never sees it. The signing key is
 * derived from the password unless ADMIN_SESSION_SECRET is set, so changing
 * the password signs every browser out.
 */

import crypto from 'node:crypto';

import { CONFIG } from './config.mjs';
import { stats } from './analytics.mjs';
import { RateLimiter } from './ratelimit.mjs';
import { sendTicket } from './tracker.mjs';

const COOKIE = 'mimo_admin';
const RANGES = new Set([7, 30, 90, 365]);
const loginLimiter = new RateLimiter(CONFIG.admin.loginRate);

const key = () =>
  CONFIG.admin.sessionSecret || crypto.createHash('sha256').update(`mimoland-admin|${CONFIG.admin.password}`).digest('hex');
const sign = (value) => crypto.createHmac('sha256', key()).update(value).digest('base64url');

export function sessionToken(now = Date.now()) {
  const exp = String(now + CONFIG.admin.sessionDays * 864e5);
  return `${exp}.${sign(exp)}`;
}

export function validSession(token, now = Date.now()) {
  if (!CONFIG.admin.password || typeof token !== 'string') return false;
  const [exp, sig] = token.split('.');
  if (!exp || !sig || !(Number(exp) > now)) return false;
  const want = Buffer.from(sign(exp));
  const got = Buffer.from(sig);
  return want.length === got.length && crypto.timingSafeEqual(want, got);
}

/** Constant-time on the digests, so the comparison leaks neither content nor length. */
export function passwordMatches(input) {
  if (!CONFIG.admin.password) return false;
  const a = crypto.createHash('sha256').update(String(input ?? '')).digest();
  const b = crypto.createHash('sha256').update(CONFIG.admin.password).digest();
  return crypto.timingSafeEqual(a, b);
}

function cookieOf(req) {
  const header = req.headers.cookie ?? '';
  for (const part of header.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name === COOKIE) return rest.join('=');
  }
  return null;
}

function setCookie(req, value, maxAgeSec) {
  const secure = req.headers['x-forwarded-proto'] === 'https' || process.env.NODE_ENV === 'production';
  return `${COOKIE}=${value}; Path=/api/admin; HttpOnly; SameSite=Strict; Max-Age=${maxAgeSec}${secure ? '; Secure' : ''}`;
}

/**
 * @param {object} deps
 * @param {(res, status, body, headers?) => void} deps.json
 * @param {(req) => Promise<string>} deps.readBody
 * @param {(req) => string} deps.clientIp
 * @param {(req) => boolean} deps.originAllowed
 * @param {import('node:sqlite').DatabaseSync | null} deps.db
 */
export function adminRoutes({ json, readBody, clientIp, originAllowed, db, log = console }) {
  const body = async (req) => {
    const raw = await readBody(req);
    return raw ? JSON.parse(raw) : {};
  };

  return async function handle(req, res, path) {
    if (!CONFIG.admin.password) {
      return json(res, 503, { ok: false, error: 'The dashboard is not set up: ADMIN_PASSWORD is missing on the server.' });
    }
    // Every write must come from our own pages. SameSite=Strict already keeps
    // the cookie off cross-site requests; this also covers the login itself.
    if (req.method === 'POST' && !originAllowed(req)) {
      return json(res, 403, { ok: false, error: 'Not from here.' });
    }

    if (path === '/api/admin/login' && req.method === 'POST') {
      const { allowed, retryAfterSec } = loginLimiter.take(clientIp(req));
      if (!allowed) {
        return json(res, 429, { ok: false, error: 'Too many attempts. Try again in a few minutes.' }, { 'Retry-After': String(retryAfterSec) });
      }
      let input;
      try {
        input = await body(req);
      } catch {
        return json(res, 400, { ok: false, error: 'That did not arrive intact.' });
      }
      if (!passwordMatches(input?.password)) {
        log.warn(`[admin] failed sign-in from ${clientIp(req)}`);
        return json(res, 401, { ok: false, error: 'That password is not right.' });
      }
      return json(res, 200, { ok: true }, { 'Set-Cookie': setCookie(req, sessionToken(), CONFIG.admin.sessionDays * 86400) });
    }

    if (path === '/api/admin/logout' && req.method === 'POST') {
      return json(res, 200, { ok: true }, { 'Set-Cookie': setCookie(req, '', 0) });
    }

    if (!validSession(cookieOf(req))) return json(res, 401, { ok: false, error: 'Sign in first.' });

    if (path === '/api/admin/session' && req.method === 'GET') {
      return json(res, 200, { ok: true, analytics: !!db, reporting: !!CONFIG.tracker.apiKey });
    }

    if (path === '/api/admin/stats' && req.method === 'GET') {
      if (!db) return json(res, 503, { ok: false, error: 'Visit counting is off: the data directory is not writable.' });
      const days = Number(new URL(req.url, 'http://x').searchParams.get('days'));
      return json(res, 200, { ok: true, ...stats(db, RANGES.has(days) ? days : 30) });
    }

    if (path === '/api/admin/report' && req.method === 'POST') {
      if (!CONFIG.tracker.apiKey) {
        return json(res, 503, { ok: false, error: 'Reporting is not set up: TRACKER_API_KEY is missing on the server.' });
      }
      let input;
      try {
        input = await body(req);
      } catch {
        return json(res, 400, { ok: false, error: 'That did not arrive intact.' });
      }
      const kind = input?.kind === 'idea' ? 'idea' : 'problem';
      const message = String(input?.message ?? '').trim().slice(0, 4000);
      if (message.length < 5) return json(res, 400, { ok: false, error: 'Tell us a little more — a few words at least.' });
      const page = String(input?.path ?? '').slice(0, 200);
      const label = kind === 'idea' ? 'Suggestion' : 'Problem';
      const ua = String(req.headers['user-agent'] ?? '').slice(0, 300);
      const result = await sendTicket({
        title: `${label}: ${message.replace(/\s+/g, ' ').slice(0, 100)}${message.length > 100 ? '…' : ''}`,
        description: [message, '', '---', 'From: the Mimoland admin dashboard', page && `Page: ${page}`, ua && `Browser: ${ua}`]
          .filter((l) => l !== false && l !== null && l !== undefined)
          .join('\n'),
        reporterEmail: CONFIG.tracker.reporterEmail || undefined,
        externalId: `mimoland-report-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
        meta: { app: 'mimoland', type: 'report', kind, path: page, userAgent: ua },
      });
      if (!result.ok) {
        log.error(`[tracker] report not filed: ${result.error}`);
        return json(res, 502, { ok: false, error: 'The tracker did not take it just now. Please try again in a minute.' });
      }
      return json(res, 200, { ok: true });
    }

    return json(res, 404, { ok: false, error: 'Not found.' });
  };
}
