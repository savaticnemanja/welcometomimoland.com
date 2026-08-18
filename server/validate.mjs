/**
 * Validation for the deck-request form.
 *
 * The page validates the same rules before it ever posts. This exists because
 * the page is not the only thing that can post: the endpoint is public, and a
 * script skips straight past every check in the browser.
 *
 * Messages are written to be shown to a visitor, because the form displays
 * whatever comes back rather than a generic failure.
 */

import { CONFIG } from './config.mjs';

// Deliberately loose. The strict grammar for an address is long, wrong in
// practice, and rejects real mailboxes; anything that survives this and is
// undeliverable fails at the send instead, which is where it belongs.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// The select on the page. Anything outside the list is a hand-made request,
// so the value is kept but flagged rather than trusted into the subject line.
// Mirrors `enquiryTypes` in content/site.tsx - keep the two in step. Drift
// costs nothing worse than a note in the enquiry saying the value was not one
// of the listed options.
const INTERESTS = new Set([
  'Airline partnership',
  'Investment',
  'Production & broadcast',
  'Brand & licensing',
  'Education & experiences',
  'Press',
  'General enquiry',
]);

const MAX = { name: 120, email: 200, interest: 80 };

function clean(value, limit) {
  if (typeof value !== 'string') return '';
  // Strip control characters: they do nothing in an email but can forge
  // headers or break the text/plain part.
  return value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, limit);
}

/**
 * @returns {{ ok: true, value: object } | { ok: false, error: string, status: number }}
 */
export function validate(body) {
  if (!body || typeof body !== 'object') {
    return { ok: false, status: 422, error: 'That submission did not arrive intact.' };
  }

  // Honeypot. The page renders `company` off-screen and never fills it, so
  // anything here filled the form by reading the markup. Answered as a plain
  // success so the sender learns nothing from the difference.
  if (clean(body.company, 200)) {
    return { ok: false, status: 200, error: null, spam: true };
  }

  const name = clean(body.name, MAX.name);
  const email = clean(body.email, MAX.email);
  const interest = clean(body.interest, MAX.interest);

  if (!name) return { ok: false, status: 422, error: 'Please tell us your name.' };
  if (name.length < 2) return { ok: false, status: 422, error: 'That name looks a little short.' };
  if (!email) return { ok: false, status: 422, error: 'Please add an email address.' };
  if (!EMAIL.test(email)) {
    return { ok: false, status: 422, error: 'That does not look like an email address.' };
  }

  // Set by the page when the form is first focused. Absent on a hand-rolled
  // post, which is exactly the case worth catching, so absence counts as 0.
  const elapsed = Number(body.elapsed);
  if (Number.isFinite(elapsed) && elapsed >= 0 && elapsed < CONFIG.minElapsedMs) {
    return { ok: false, status: 422, error: 'That went through a little too quickly — try once more.' };
  }

  return {
    ok: true,
    value: {
      name,
      email,
      interest: interest || 'Not specified',
      interestKnown: INTERESTS.has(interest),
    },
  };
}
