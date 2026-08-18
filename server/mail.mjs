/**
 * Composing and sending the two messages a deck request produces: the enquiry
 * to the studio, and the branded acknowledgement back to the visitor.
 *
 * The Resend transport needs only fetch, which is why the runtime image ships
 * no node_modules at all.
 */

import { CONFIG } from './config.mjs';

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ESCAPES[char]);
}

/* The site's tokens from app/globals.css, flattened onto the ground each one
   sits on. Email has no custom properties and no blend modes, so every value
   here is the composited result rather than the layer. */
const NAVY = '#070e19'; // --navy-deep, the page ground
const CARD = '#122238'; // --navy2, the card fill
const GOLD = '#E0B053'; // --gold
const WARM = '#FCFAF6'; // --warm, the headline
const SOFT = '#c7d3e6'; // --sky-2, body copy on the card
const DIM = '#7d8fab'; // --sky-5, the footer
const EDGE = '#1c2c44'; // --line-dark over the ground, flattened
const RULE = '#1e3049'; // --line-dark over the card, flattened

/* Fraunces and Inter are webfonts; no mail client will fetch them, so each
   stack names the family first and then the metric-compatible fallback that
   actually renders. */
const SANS = "'Inter','Helvetica Neue',Helvetica,Arial,sans-serif";
const SERIF = "'Fraunces',Georgia,'Times New Roman',serif";

/* A centred line that is letter-spaced carries that spacing after its last
   letter too, so the glyphs sit half a track left of where they look centred.
   Half the track back as an indent puts them where the eye expects. */
const tracked = (size, track, color, { caps = true, weight = '400' } = {}) =>
  `font-family:${SANS};font-size:${size}px;font-weight:${weight};` +
  `letter-spacing:${track}em;text-indent:${track / 2}em;color:${color};` +
  (caps ? 'text-transform:uppercase;' : '');

const rule = (color) =>
  `<tr><td style="padding:0;"><div style="height:1px;line-height:1px;font-size:0;background-color:${color};">&nbsp;</div></td></tr>`;

/* Spacer rows rather than margins: Word ignores margin on a div. */
const gap = (h) => `<div style="height:${h}px;line-height:${h}px;font-size:0;">&nbsp;</div>`;

/**
 * The enquiry, to the studio. Plain and dense on purpose — this one is read
 * for its contents, not admired, and it wants to be greppable in a mailbox.
 */
function composeEnquiry(submission, meta) {
  const { name, email, interest, interestKnown } = submission;

  const lines = [
    `Name:     ${name}`,
    `Email:    ${email}`,
    `Interest: ${interest}${interestKnown ? '' : '  (not one of the listed options)'}`,
    '',
    `Received: ${meta.at}`,
    `IP:       ${meta.ip}`,
    '',
    'Sent from the deck form on welcometomimoland.com',
  ];

  const html = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8" /><title>Deck request</title></head>
<body style="margin:0;padding:24px;background-color:#ffffff;font-family:${SANS};font-size:15px;line-height:1.6;color:#1a2233;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
<tr><td style="padding:2px 16px 2px 0;color:#5a6474;">Name</td><td style="padding:2px 0;"><strong>${escapeHtml(name)}</strong></td></tr>
<tr><td style="padding:2px 16px 2px 0;color:#5a6474;">Email</td><td style="padding:2px 0;"><a href="mailto:${escapeHtml(email)}" style="color:#3E5EA8;">${escapeHtml(email)}</a></td></tr>
<tr><td style="padding:2px 16px 2px 0;color:#5a6474;">Interest</td><td style="padding:2px 0;">${escapeHtml(interest)}${interestKnown ? '' : ' <span style="color:#AE3862;">(not a listed option)</span>'}</td></tr>
<tr><td style="padding:2px 16px 2px 0;color:#5a6474;">Received</td><td style="padding:2px 0;">${escapeHtml(meta.at)}</td></tr>
<tr><td style="padding:2px 16px 2px 0;color:#5a6474;">IP</td><td style="padding:2px 0;">${escapeHtml(meta.ip)}</td></tr>
</table>
<p style="margin:18px 0 0;color:#5a6474;font-size:13px;">Sent from the deck form on welcometomimoland.com</p>
</body>
</html>`;

  return {
    from: CONFIG.mail.from,
    to: CONFIG.mail.to,
    /* Replying in the mail client answers the person who wrote in, rather
       than the address the form sends from. */
    replyTo: { name, address: email },
    subject: `${CONFIG.mail.subjectPrefix} — ${name}`,
    text: lines.join('\n'),
    html,
    headers: { 'X-Mimoland-Form': 'deck-request' },
  };
}

/**
 * The acknowledgement, to the visitor. This one is the brand's handshake, so
 * it is built the way the site is: navy ground, gold wordmark, Fraunces for
 * the line that carries the message.
 */
function composeAck(submission) {
  const { name, email } = submission;

  const text = [
    'MIMOLAND',
    '',
    'Your message has landed.',
    '',
    'Thank you for reaching out and joining us on the Mimoland journey.',
    "We'll be in touch soon.",
    '',
    '—',
    'partnerships@welcometomimoland.com · https://welcometomimoland.com',
  ].join('\n');

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="color-scheme" content="dark" />
<meta name="supported-color-schemes" content="dark" />
<title>Your message has landed</title>
</head>
<body style="margin:0;padding:0;width:100%;background-color:${NAVY};">
<!-- Preheader: the line the inbox shows next to the subject. Hidden in the
     body so it is not said twice to someone who opens the mail. -->
<div style="display:none;max-height:0;max-width:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:${NAVY};mso-hide:all;">Thank you for reaching out and joining us on the Mimoland journey. We&#39;ll be in touch soon.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${NAVY}" style="background-color:${NAVY};border-collapse:collapse;">
<tr>
<td align="center" style="padding:40px 16px;">
<!--[if mso]>
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td>
<![endif]-->
<!-- Fluid, capped at 600. A fixed width here is what clips the card on a
     phone, and phones are where most of this mail is opened; max-width alone
     is not enough, because the width attribute would still pin it. Word is the
     one engine that honours neither, so it gets the fixed 600 above and never
     sees this table's own width. -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;margin:0 auto;border-collapse:collapse;background-color:${CARD};border:1px solid ${EDGE};">
<tr>
<td style="padding:46px 32px 38px;" align="center">

<div style="${tracked(26, 0.4, GOLD, { weight: '400' })}line-height:1.2;">MIMOLAND</div>

</td>
</tr>
${rule(RULE)}
<tr>
<td style="padding:40px 32px 42px;" align="center">

<div style="font-family:${SERIF};font-size:26px;line-height:1.3;color:${WARM};">Your message has landed.</div>

${gap(20)}

<!-- Broken by hand, where the sentence turns anyway. Left to wrap, the last
     line lands wherever the client's serif happens to run out — and there is
     no font to measure against here, because whichever serif answers the
     stack is the reader's and not ours. Authored breaks hold everywhere, and
     cost nothing: on a phone the lines simply wrap again underneath them. -->
<div style="font-family:${SERIF};font-size:17px;line-height:1.75;color:${SOFT};">Thank you for reaching out and<br />joining us on the Mimoland journey.<br />We&#39;ll be in touch soon.</div>

</td>
</tr>
${rule(RULE)}
<tr>
<td style="padding:22px 32px 24px;" align="center">
<div style="${tracked(12, 0.04, DIM, { caps: false })}line-height:1.6;"><a href="mailto:partnerships@welcometomimoland.com" style="color:${DIM};text-decoration:none;">partnerships@welcometomimoland.com</a></div>
${gap(6)}
<div style="${tracked(12, 0.04, DIM, { caps: false })}line-height:1.6;"><a href="https://welcometomimoland.com" style="color:${DIM};text-decoration:none;">welcometomimoland.com</a></div>
</td>
</tr>
</table>
<!--[if mso]>
</td></tr></table>
<![endif]-->
</td>
</tr>
</table>
</body>
</html>`;

  return {
    from: CONFIG.mail.from,
    to: { name, address: email },
    /* Answers come back to the partnerships mailbox, not to a no-reply nobody
       reads — a visitor who replies to this is still talking to Mimoland. */
    replyTo: CONFIG.mail.to,
    subject: 'Your message has landed',
    text,
    html,
    headers: {
      'X-Mimoland-Form': 'deck-ack',
      // Keeps out-of-office replies and mailing lists from answering back.
      'Auto-Submitted': 'auto-replied',
      Precedence: 'bulk',
    },
  };
}

function address(value) {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  return value.name ? `${value.name} <${value.address}>` : value.address;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Resend over its HTTP API. No SDK: the whole surface used here is one POST,
 * and a dependency for that is a dependency to keep patched.
 */
function createResendTransport(log) {
  const endpoint = 'https://api.resend.com/emails';

  const post = async (message) => {
    const payload = {
      from: address(message.from),
      to: [address(message.to)],
      subject: message.subject,
      text: message.text,
      html: message.html,
      headers: message.headers,
    };
    if (message.replyTo) payload.reply_to = [address(message.replyTo)];

    // Three attempts, backing off. A 429 or a 5xx from Resend is usually
    // momentary, and losing an enquiry to one is not acceptable.
    let lastError;
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      let response;
      try {
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${CONFIG.resend.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(10_000),
        });
      } catch (error) {
        lastError = error;
        if (attempt < 3) await sleep(attempt * 500);
        continue;
      }

      if (response.ok) {
        const body = await response.json().catch(() => ({}));
        log.info(`[mail] sent to=${address(message.to)} subject="${message.subject}" id=${body.id ?? '?'}`);
        return;
      }

      const detail = await response.text().catch(() => '');
      // 4xx other than 429 will fail identically on a retry.
      if (response.status < 500 && response.status !== 429) {
        throw new Error(`Resend ${response.status}: ${detail.slice(0, 400)}`);
      }
      lastError = new Error(`Resend ${response.status}: ${detail.slice(0, 400)}`);
      if (attempt < 3) await sleep(attempt * 500);
    }
    throw lastError ?? new Error('Resend: unreachable');
  };

  return {
    async verify() {
      // Cheapest authenticated call Resend offers. Catches a revoked key or an
      // unverified domain at boot rather than on the first real enquiry.
      const response = await fetch('https://api.resend.com/domains', {
        headers: { Authorization: `Bearer ${CONFIG.resend.apiKey}` },
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(`Resend rejected the API key: ${body.message ?? response.status}`);
      }
      const body = await response.json().catch(() => ({}));
      const domains = Array.isArray(body.data) ? body.data : [];
      const wanted = CONFIG.mail.from.match(/@([^>\s]+)/)?.[1]?.toLowerCase();
      const match = domains.find((entry) => entry.name?.toLowerCase() === wanted);
      if (!match) {
        log.warn(`[mail] ${wanted} is not a verified Resend domain — sends will be rejected`);
      } else if (match.status !== 'verified') {
        log.warn(`[mail] ${wanted} is "${match.status}" in Resend, not verified`);
      } else {
        log.info(`[mail] Resend ready — ${wanted} verified`);
      }
    },
    send: post,
  };
}

/** Prints instead of sending. Makes the whole path testable with no key. */
function createConsoleTransport(log) {
  log.warn('[mail] MAIL_TRANSPORT=console — messages are printed, not sent');
  return {
    async verify() {},
    async send(message) {
      log.info(
        `\n──── ${message.subject} ────\nto: ${address(message.to)}\n\n${message.text}\n────────\n`,
      );
    },
  };
}

export async function createMailer(log = console) {
  const transport =
    CONFIG.transport === 'resend' ? createResendTransport(log) : createConsoleTransport(log);

  return {
    verify: () => transport.verify(),

    /**
     * Sends the enquiry, then the acknowledgement. The order matters: the
     * enquiry is the one that must not be lost, so it goes first and its
     * failure is the one that fails the request. A failed acknowledgement is
     * logged and swallowed — the visitor's message did arrive, and telling
     * them otherwise would be false.
     */
    async deliver(submission, meta) {
      await transport.send(composeEnquiry(submission, meta));

      if (!CONFIG.mail.ack) return;
      try {
        await transport.send(composeAck(submission));
      } catch (error) {
        log.error(`[mail] acknowledgement failed (enquiry was delivered): ${error.message}`);
      }
    },
  };
}
