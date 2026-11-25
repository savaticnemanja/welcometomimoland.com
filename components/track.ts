/**
 * The page's side of the visit counter (server/analytics.mjs). No cookie and
 * nothing stored in the browser: every beacon is a small text/plain POST to
 * /api/collect that the server turns into an anonymous, same-day-only count.
 *
 * Nothing is sent at all with Do Not Track or Global Privacy Control on, from
 * an automated browser, or on /admin.
 */

export type TrackEvent =
  | "section"
  | "film_trailer"
  | "book_trailer"
  | "look_inside"
  | "welcome_pack"
  | "gallery_open"
  | "outbound"
  | "deck_form_start"
  | "deck_request";

type Beacon =
  | { k: "pv"; p: string; r: string; u: { s?: string; m?: string; c?: string }; w: number; c: 0 | 1 }
  | { k: "ev"; n: TrackEvent; l?: string }
  | { k: "end"; s: number; e: number };

const ENDPOINT = "/api/collect";

let ready = false;
const queue: Beacon[] = [];

export function trackingOff(): boolean {
  if (typeof window === "undefined") return true;
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return (
    nav.doNotTrack === "1" ||
    nav.globalPrivacyControl === true ||
    nav.webdriver === true ||
    location.pathname.startsWith("/admin")
  );
}

function post(b: Beacon) {
  const body = JSON.stringify(b);
  // sendBeacon survives the page closing, which is when "end" goes out.
  if (navigator.sendBeacon?.(ENDPOINT, new Blob([body], { type: "text/plain" }))) return;
  void fetch(ENDPOINT, { method: "POST", body, keepalive: true, headers: { "Content-Type": "text/plain" } }).catch(() => {});
}

/**
 * The page view goes first and is waited on: the server opens the visit on
 * it, and an event that arrives before it has no visit to belong to.
 */
export async function trackPageview() {
  if (trackingOff()) return;
  const q = new URLSearchParams(location.search);
  const beacon: Beacon = {
    k: "pv",
    p: location.pathname,
    r: document.referrer,
    u: {
      s: q.get("utm_source") ?? q.get("ref") ?? undefined,
      m: q.get("utm_medium") ?? undefined,
      c: q.get("utm_campaign") ?? undefined,
    },
    w: Math.min(screen.width, screen.height),
    c: matchMedia("(pointer: coarse)").matches ? 1 : 0,
  };
  try {
    await fetch(ENDPOINT, { method: "POST", body: JSON.stringify(beacon), keepalive: true, headers: { "Content-Type": "text/plain" } });
  } catch {
    // Not counted, then. The page does not care.
  }
  ready = true;
  for (const b of queue.splice(0)) post(b);
}

/** One action on the page. The server keeps each once per visit. */
export function track(name: TrackEvent, label = "") {
  if (trackingOff()) return;
  const b: Beacon = { k: "ev", n: name, l: label };
  if (ready) post(b);
  else queue.push(b);
}

/** Seconds the page was visible since the last report, and the deepest scroll. */
export function trackEnd(seconds: number, scroll: number) {
  if (trackingOff() || !ready || (seconds < 1 && scroll < 1)) return;
  post({ k: "end", s: Math.round(scroll), e: Math.round(seconds) });
}
