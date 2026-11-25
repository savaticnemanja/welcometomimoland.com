/**
 * Configuration for the contact handler, read once at boot.
 *
 * Everything arrives as an environment variable from docker-compose.yml. The
 * module throws rather than falling back whenever a missing value would mean
 * silently dropping enquiries — a handler that starts and then swallows mail
 * is worse than one that refuses to start.
 */

const TRANSPORTS = ['resend', 'console'];

function str(key, fallback = '') {
  const value = process.env[key];
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function num(key, fallback) {
  const raw = process.env[key];
  if (raw === undefined || raw === '') return fallback;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${key} must be a non-negative number — got "${raw}"`);
  }
  return value;
}

function bool(key, fallback) {
  const raw = str(key).toLowerCase();
  if (!raw) return fallback;
  return raw === 'true' || raw === '1' || raw === 'yes';
}

function list(key, fallback) {
  const raw = str(key);
  if (!raw) return fallback;
  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

const transport = str('MAIL_TRANSPORT', 'resend');
const mailTo = str('MAIL_TO', 'partnerships@welcometomimoland.com');
if (!TRANSPORTS.includes(transport)) {
  throw new Error(`MAIL_TRANSPORT must be one of ${TRANSPORTS.join(', ')} — got "${transport}"`);
}

export const CONFIG = {
  port: num('PORT', 8787),
  // 0.0.0.0, not loopback: the port is reached from outside this network
  // namespace. What keeps it off the internet is that compose publishes it
  // on 127.0.0.1 and nginx is the only thing that talks to it.
  host: str('HOST', '0.0.0.0'),

  transport,

  resend: {
    apiKey: str('RESEND_API_KEY'),
  },

  mail: {
    from: str('MAIL_FROM', 'Mimoland <partnerships@welcometomimoland.com>'),
    to: mailTo,
    subjectPrefix: str('MAIL_SUBJECT_PREFIX', 'Deck request'),
    // The branded note back to the visitor. Counts a second send against the
    // Resend quota, so it is one flag away from being turned off.
    ack: bool('MAIL_ACK', true),
  },

  // Anything not listed gets a 403 on the form. The apex only: www has no DNS
  // record, so listing it would allowlist an origin that cannot exist.
  allowedOrigins: list('ALLOWED_ORIGINS', ['https://welcometomimoland.com']),

  rate: {
    max: num('RATE_MAX', 5),
    maxGlobal: num('RATE_MAX_GLOBAL', 60),
    windowMs: num('RATE_WINDOW_MS', 600_000),
  },

  // A human needs longer than this to read the form and fill it in. Anything
  // faster is a script, and the field it is measured from is set by the page.
  minElapsedMs: num('MIN_ELAPSED_MS', 3000),

  // A deck request is three short fields; anything larger is not one.
  maxBodyBytes: num('MAX_BODY_BYTES', 32 * 1024),

  // First-party, cookieless visit counting (server/analytics.mjs). The SQLite
  // file lives here; in production that is the `data` volume in compose.
  // Without a writable directory the handler still serves the form and
  // simply stops counting.
  dataDir: str('DATA_DIR', '/data'),
  // Raw visits and events older than this are deleted; the dashboard's
  // longest range is twelve months, plus one to compare it against.
  retentionDays: num('RETENTION_DAYS', 400),
  // A visit beacon is a few hundred bytes; this is generous.
  maxBeaconBytes: num('MAX_BEACON_BYTES', 4 * 1024),

  admin: {
    // The dashboard at /admin. Unset, every /api/admin route answers 503 and
    // there is no way in — counting still happens.
    password: str('ADMIN_PASSWORD'),
    // Signs the session cookie. Defaults to one derived from the password, so
    // changing the password signs everyone out.
    sessionSecret: str('ADMIN_SESSION_SECRET'),
    sessionDays: num('ADMIN_SESSION_DAYS', 30),
    // Five tries in fifteen minutes per IP, twenty in total.
    loginRate: { max: 5, maxGlobal: 20, windowMs: 15 * 60_000 },
  },

  // The external tracker (tracker.cirko.dev): the dashboard's "Report a
  // problem or suggestion" button files a ticket there. Unset, the button
  // says reporting is not set up.
  tracker: {
    apiKey: str('TRACKER_API_KEY'),
    url: str('TRACKER_URL', 'https://tracker.cirko.dev/api/v1/tickets'),
    // Who the tracker shows as the reporter of dashboard reports. The tracker
    // rejects a ticket without a valid reporter email ("Enter a valid
    // email."), so with ADMIN_EMAIL unset it falls back to the inbox enquiries
    // go to.
    reporterEmail: str('ADMIN_EMAIL', mailTo),
  },
};

if (CONFIG.transport === 'resend' && !CONFIG.resend.apiKey) {
  throw new Error('MAIL_TRANSPORT=resend needs RESEND_API_KEY — see deploy/README.md');
}
