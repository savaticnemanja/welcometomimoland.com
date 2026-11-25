/**
 * First-party, cookieless visit counting for welcometomimoland.com, and the
 * numbers behind the /admin dashboard.
 *
 *   POST /api/collect   beacons from components/analytics.tsx
 *
 * What it keeps, and what it refuses to:
 *
 * - No cookie, nothing in the visitor's browser. One visitor on one day is
 *   one visit: the IP address and browser string are hashed together with a
 *   random salt that exists only for that UTC day. The IP and the browser
 *   string themselves are never written, and yesterday's salt is deleted, so
 *   two days' visits by the same person cannot be joined, by us or anyone.
 * - Per visit: the entry page, the referring site (host only), utm tags,
 *   country (Cloudflare's CF-IPCountry), device class, browser and OS family,
 *   page views, seconds actually spent with the page visible, scroll depth.
 * - Per visit, each at most once: the sections scrolled into view, and the
 *   actions on the page (trailer plays, Look Inside, the welcome pack, the
 *   gallery, outbound links, starting and sending the deck form). Counting
 *   each once per visit is what makes "how many visits did X" meaningful and
 *   makes a script replaying a beacon worthless.
 * - Bots by user agent, Do Not Track / Global Privacy Control (the page does
 *   not send), and anything over the rate limit are dropped.
 * - Raw rows are deleted after CONFIG.retentionDays.
 *
 * node:sqlite, so the image still ships no node_modules.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { CONFIG } from './config.mjs';

/** Sections in page order; the dashboard draws reach in this order. */
export const SECTIONS = [
  'top', 'opportunity', 'origins', 'film', 'world', 'ecosystem', 'book',
  'partners', 'impact', 'traction', 'ip', 'vision', 'team', 'connect',
];

/** Everything the page may report besides page views. Anything else is dropped. */
export const EVENTS = new Set([
  'section', 'film_trailer', 'book_trailer', 'look_inside', 'welcome_pack',
  'gallery_open', 'outbound', 'deck_form_start', 'deck_request',
]);

const BOT = /bot|crawl|spider|slurp|scrape|headless|lighthouse|pagespeed|preview|facebookexternalhit|embedly|quora link|whatsapp|telegram|discord|slack|python|curl|wget|go-http|java\/|node-fetch|axios|phantom|selenium|puppeteer|playwright/i;

const day = (ms = Date.now()) => new Date(ms).toISOString().slice(0, 10);
const clip = (v, n) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, n);

/** Opens (and if need be creates) the database; null when it cannot be written. */
export function openAnalytics(log = console) {
  try {
    fs.mkdirSync(CONFIG.dataDir, { recursive: true });
    // Loaded lazily: an older Node without node:sqlite still serves the form.
    const { DatabaseSync } = process.getBuiltinModule('node:sqlite');
    const db = new DatabaseSync(path.join(CONFIG.dataDir, 'analytics.db'));
    db.exec(`
      PRAGMA journal_mode = WAL;
      PRAGMA busy_timeout = 2000;
      CREATE TABLE IF NOT EXISTS salts (day TEXT PRIMARY KEY, salt TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS visits (
        id INTEGER PRIMARY KEY,
        day TEXT NOT NULL,
        vh TEXT NOT NULL,
        first_at INTEGER NOT NULL,
        last_at INTEGER NOT NULL,
        entry TEXT NOT NULL DEFAULT '/',
        ref_host TEXT,
        source TEXT,
        medium TEXT,
        campaign TEXT,
        country TEXT,
        device TEXT NOT NULL DEFAULT 'desktop',
        browser TEXT NOT NULL DEFAULT 'Other',
        os TEXT NOT NULL DEFAULT 'Other',
        pageviews INTEGER NOT NULL DEFAULT 0,
        engaged_s INTEGER NOT NULL DEFAULT 0,
        max_scroll INTEGER NOT NULL DEFAULT 0,
        UNIQUE (day, vh)
      );
      CREATE INDEX IF NOT EXISTS visits_day ON visits (day);
      CREATE TABLE IF NOT EXISTS events (
        visit_id INTEGER NOT NULL REFERENCES visits (id) ON DELETE CASCADE,
        day TEXT NOT NULL,
        at INTEGER NOT NULL,
        name TEXT NOT NULL,
        label TEXT NOT NULL DEFAULT '',
        PRIMARY KEY (visit_id, name, label)
      ) WITHOUT ROWID;
      CREATE INDEX IF NOT EXISTS events_day ON events (day, name);
    `);
    log.info(`[analytics] counting visits in ${path.join(CONFIG.dataDir, 'analytics.db')}`);
    return db;
  } catch (error) {
    log.error(`[analytics] off — ${error.message}`);
    return null;
  }
}

/** Today's salt; every older one is deleted on the way, which is the point. */
function saltFor(db, today) {
  const row = db.prepare('SELECT salt FROM salts WHERE day = ?').get(today);
  if (row) return row.salt;
  const salt = crypto.randomBytes(32).toString('hex');
  db.prepare('INSERT OR IGNORE INTO salts (day, salt) VALUES (?, ?)').run(today, salt);
  db.prepare('DELETE FROM salts WHERE day < ?').run(today);
  return db.prepare('SELECT salt FROM salts WHERE day = ?').get(today).salt;
}

export function prune(db, now = Date.now()) {
  const cutoff = day(now - CONFIG.retentionDays * 864e5);
  db.prepare('DELETE FROM events WHERE day < ?').run(cutoff);
  return Number(db.prepare('DELETE FROM visits WHERE day < ?').run(cutoff).changes);
}

export function browserOf(ua) {
  if (/Edg\//.test(ua)) return 'Edge';
  if (/SamsungBrowser/.test(ua)) return 'Samsung Internet';
  if (/OPR\/|Opera/.test(ua)) return 'Opera';
  if (/Firefox\/|FxiOS/.test(ua)) return 'Firefox';
  if (/Chrome\/|CriOS/.test(ua)) return 'Chrome';
  if (/Safari\//.test(ua)) return 'Safari';
  return 'Other';
}

export function osOf(ua) {
  if (/iPhone|iPad|iPod/.test(ua)) return 'iOS';
  if (/Android/.test(ua)) return 'Android';
  if (/Windows/.test(ua)) return 'Windows';
  if (/Mac OS X|Macintosh/.test(ua)) return 'macOS';
  if (/CrOS/.test(ua)) return 'ChromeOS';
  if (/Linux/.test(ua)) return 'Linux';
  return 'Other';
}

/**
 * Phone, tablet or desktop. The page's own report (a coarse pointer, and the
 * screen's shorter side) beats the user agent, because iPadOS sends a Mac one.
 */
export function deviceOf(ua, { coarse, short } = {}) {
  if (coarse === true && Number.isFinite(short)) return short < 600 ? 'mobile' : 'tablet';
  if (/iPad|Tablet/.test(ua)) return 'tablet';
  if (/Mobi|iPhone|Android/.test(ua)) return 'mobile';
  return 'desktop';
}

/** External referrer host, without www; null for ourselves and for nothing. */
export function refHost(referrer, ownHosts) {
  try {
    const host = new URL(referrer).hostname.toLowerCase().replace(/^www\./, '');
    return host && !ownHosts.includes(host) ? host.slice(0, 120) : null;
  } catch {
    return null;
  }
}

/** Well-known referrers under one name, so l.instagram.com and instagram.com are one row. */
export function sourceName(host) {
  if (!host) return null;
  const known = [
    [/(^|\.)google\./, 'Google'], [/(^|\.)bing\.com$/, 'Bing'], [/duckduckgo\.com$/, 'DuckDuckGo'],
    [/(^|\.)instagram\.com$/, 'Instagram'], [/(^|\.)facebook\.com$|^fb\.me$/, 'Facebook'],
    [/(^|\.)linkedin\.com$|^lnkd\.in$/, 'LinkedIn'], [/(^|\.)youtube\.com$|^youtu\.be$/, 'YouTube'],
    [/(^|\.)t\.co$|(^|\.)x\.com$|twitter\.com$/, 'X'], [/(^|\.)imdb\.com$/, 'IMDb'],
    [/filmfreeway\.com$/, 'FilmFreeway'], [/chatgpt\.com$|openai\.com$/, 'ChatGPT'],
    [/perplexity\.ai$/, 'Perplexity'],
  ];
  return known.find(([re]) => re.test(host))?.[1] ?? host;
}

/**
 * One beacon. Returns what happened, for tests; never throws on bad input.
 * @param {{ ip: string, ua: string, country?: string, now?: number }} who
 */
export function collect(db, beacon, { ip, ua, country, now = Date.now() }) {
  if (!db || !beacon || typeof beacon !== 'object') return 'ignored';
  if (!ua || BOT.test(ua)) return 'bot';
  const today = day(now);
  const vh = crypto.createHash('sha256').update(`${saltFor(db, today)}|${ip}|${ua}`).digest('hex').slice(0, 32);

  if (beacon.k === 'pv') {
    const pagePath = clip(beacon.p, 200).split('?')[0] || '/';
    const ownHosts = CONFIG.allowedOrigins.map((o) => { try { return new URL(o).hostname.replace(/^www\./, ''); } catch { return ''; } });
    const ref = refHost(clip(beacon.r, 500), ownHosts);
    const utm = beacon.u && typeof beacon.u === 'object' ? beacon.u : {};
    const source = clip(utm.s, 60) || sourceName(ref);
    const cc = /^[A-Z]{2}$/.test(country ?? '') && !['XX', 'T1'].includes(country) ? country : null;
    db.prepare(
      `INSERT INTO visits (day, vh, first_at, last_at, entry, ref_host, source, medium, campaign, country, device, browser, os, pageviews)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
       ON CONFLICT (day, vh) DO UPDATE SET pageviews = pageviews + 1, last_at = excluded.last_at`,
    ).run(
      today, vh, now, now, pagePath, ref, source || null, clip(utm.m, 60) || null, clip(utm.c, 100) || null, cc,
      deviceOf(ua, { coarse: beacon.c === 1 || beacon.c === true, short: Number(beacon.w) }), browserOf(ua), osOf(ua),
    );
    return 'pageview';
  }

  const visit = db.prepare('SELECT id FROM visits WHERE day = ? AND vh = ?').get(today, vh);
  if (!visit) return 'no-visit';

  if (beacon.k === 'end') {
    const seconds = Math.max(0, Math.min(1800, Math.round(Number(beacon.e) || 0)));
    const scroll = Math.max(0, Math.min(100, Math.round(Number(beacon.s) || 0)));
    db.prepare('UPDATE visits SET engaged_s = engaged_s + ?, max_scroll = MAX(max_scroll, ?), last_at = ? WHERE id = ?')
      .run(seconds, scroll, now, visit.id);
    return 'end';
  }

  if (beacon.k === 'ev') {
    const name = clip(beacon.n, 40);
    if (!EVENTS.has(name)) return 'ignored';
    let label = clip(beacon.l, 120);
    if (name === 'section' && !SECTIONS.includes(label)) return 'ignored';
    if (name === 'outbound') label = sourceName(refHost(label, [])) ?? '';
    const added = db.prepare('INSERT OR IGNORE INTO events (visit_id, day, at, name, label) VALUES (?, ?, ?, ?, ?)')
      .run(visit.id, today, now, name, label).changes;
    db.prepare('UPDATE visits SET last_at = ? WHERE id = ?').run(now, visit.id);
    return added ? 'event' : 'duplicate';
  }
  return 'ignored';
}

/* ------------------------------------------------------------- dashboard */

const median = (xs) => {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
};

function period(db, from, to) {
  const v = db.prepare(
    `SELECT COUNT(*) AS visitors, COALESCE(SUM(pageviews), 0) AS pageviews,
            SUM(CASE WHEN engaged_s >= 10 OR max_scroll >= 50 THEN 1 ELSE 0 END) AS engaged
       FROM visits WHERE day BETWEEN ? AND ?`,
  ).get(from, to);
  const times = db.prepare('SELECT engaged_s FROM visits WHERE day BETWEEN ? AND ? AND engaged_s > 0').all(from, to).map((r) => r.engaged_s);
  const deck = db.prepare("SELECT COUNT(*) AS n FROM events WHERE name = 'deck_request' AND day BETWEEN ? AND ?").get(from, to).n;
  return {
    visitors: Number(v.visitors),
    pageviews: Number(v.pageviews),
    engagedRate: v.visitors ? Number(v.engaged) / Number(v.visitors) : 0,
    medianSeconds: median(times),
    deckRequests: Number(deck),
    conversion: v.visitors ? Number(deck) / Number(v.visitors) : 0,
  };
}

const top = (db, column, from, to, limit = 8) =>
  db.prepare(
    `SELECT COALESCE(${column}, '') AS name, COUNT(*) AS visitors
       FROM visits WHERE day BETWEEN ? AND ? GROUP BY 1 ORDER BY visitors DESC, name LIMIT ?`,
  ).all(from, to, limit).map((r) => ({ name: r.name, visitors: Number(r.visitors) }));

/**
 * Everything the dashboard draws, for the last `days` days up to today, and
 * the same span before it for comparison.
 */
export function stats(db, days, now = Date.now()) {
  const to = day(now);
  const from = day(now - (days - 1) * 864e5);
  const prevTo = day(now - days * 864e5);
  const prevFrom = day(now - (2 * days - 1) * 864e5);

  const perDay = new Map(
    db.prepare('SELECT day, COUNT(*) AS visitors, SUM(pageviews) AS pageviews FROM visits WHERE day BETWEEN ? AND ? GROUP BY day')
      .all(from, to).map((r) => [r.day, { visitors: Number(r.visitors), pageviews: Number(r.pageviews) }]),
  );
  const deckPerDay = new Map(
    db.prepare("SELECT day, COUNT(*) AS n FROM events WHERE name = 'deck_request' AND day BETWEEN ? AND ? GROUP BY day")
      .all(from, to).map((r) => [r.day, Number(r.n)]),
  );
  const series = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = day(now - i * 864e5);
    series.push({ day: d, visitors: perDay.get(d)?.visitors ?? 0, pageviews: perDay.get(d)?.pageviews ?? 0, deck: deckPerDay.get(d) ?? 0 });
  }

  const reached = new Map(
    db.prepare("SELECT label, COUNT(*) AS n FROM events WHERE name = 'section' AND day BETWEEN ? AND ? GROUP BY label")
      .all(from, to).map((r) => [r.label, Number(r.n)]),
  );
  const actions = Object.fromEntries(
    db.prepare("SELECT name, COUNT(*) AS n FROM events WHERE name NOT IN ('section', 'outbound') AND day BETWEEN ? AND ? GROUP BY name")
      .all(from, to).map((r) => [r.name, Number(r.n)]),
  );
  const outbound = db.prepare(
    "SELECT label AS name, COUNT(*) AS visitors FROM events WHERE name = 'outbound' AND day BETWEEN ? AND ? GROUP BY label ORDER BY visitors DESC LIMIT 8",
  ).all(from, to).map((r) => ({ name: r.name, visitors: Number(r.visitors) }));

  // Sources with the deck requests they brought: which channel converts, not only which one is loud.
  const sources = db.prepare(
    `SELECT COALESCE(v.source, 'Direct') AS name, COUNT(*) AS visitors,
            SUM(EXISTS (SELECT 1 FROM events e WHERE e.visit_id = v.id AND e.name = 'deck_request')) AS deck
       FROM visits v WHERE v.day BETWEEN ? AND ? GROUP BY 1 ORDER BY visitors DESC LIMIT 10`,
  ).all(from, to).map((r) => ({ name: r.name, visitors: Number(r.visitors), deck: Number(r.deck) }));

  const live = db.prepare('SELECT COUNT(*) AS n FROM visits WHERE day = ? AND last_at >= ?').get(to, now - 5 * 60_000).n;

  return {
    range: { from, to, days },
    current: period(db, from, to),
    previous: period(db, prevFrom, prevTo),
    series,
    sections: SECTIONS.map((id) => ({ id, visits: reached.get(id) ?? 0 })),
    actions,
    outbound,
    sources,
    campaigns: top(db, 'campaign', from, to).filter((r) => r.name),
    countries: top(db, 'country', from, to),
    devices: top(db, 'device', from, to, 3),
    browsers: top(db, 'browser', from, to, 6),
    pages: top(db, 'entry', from, to, 6),
    live: Number(live),
  };
}
