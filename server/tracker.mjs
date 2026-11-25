/**
 * Files a ticket in the external tracker (tracker.cirko.dev): POST
 * /api/v1/tickets as multipart, with the key as a Bearer token — the same
 * fields as the tracker's own curl example. The key only ever travels in the
 * Authorization header, never in a URL or a log line.
 *
 * Awaited rather than fire-and-forget: a person pressed the button and is
 * waiting to hear whether it went through.
 */

import { CONFIG } from './config.mjs';

/**
 * @param {{ title: string, description: string, reporterEmail?: string, externalId: string, meta?: object }} ticket
 * @returns {Promise<{ ok: true } | { ok: false, error: string }>}
 */
export async function sendTicket(ticket, { fetchImpl = fetch, cfg = CONFIG.tracker } = {}) {
  if (!cfg.apiKey) return { ok: false, error: 'no TRACKER_API_KEY' };
  const form = new FormData();
  form.append('title', ticket.title);
  form.append('description', ticket.description);
  if (ticket.reporterEmail) form.append('reporter_email', ticket.reporterEmail);
  form.append('external_id', ticket.externalId);
  if (ticket.meta) form.append('meta', JSON.stringify(ticket.meta));
  try {
    const res = await fetchImpl(cfg.url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${cfg.apiKey}`, Accept: 'application/json' },
      body: form,
      signal: AbortSignal.timeout(10_000),
    });
    if (res.ok) return { ok: true };
    const text = (await res.text().catch(() => '')).slice(0, 200).replace(/\s+/g, ' ');
    return { ok: false, error: `${res.status} ${text}` };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}
