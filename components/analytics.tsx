"use client";

import { useEffect } from "react";
import { track, trackEnd, trackPageview, trackingOff } from "@/components/track";

/** The landing page's sections, as their ids; server/analytics.mjs keeps the same list. */
const SECTIONS = [
  "top", "opportunity", "origins", "film", "world", "ecosystem", "book",
  "partners", "impact", "traction", "ip", "vision", "team", "connect",
];

/**
 * Counts the visit (components/track.ts): a page view on load, each section
 * once when it crosses the middle of the screen, outbound links and the
 * welcome pack by delegated click, and — when the page is hidden or left —
 * the seconds it was actually visible and how far down it was read.
 * Renders nothing.
 */
export function Analytics() {
  useEffect(() => {
    if (trackingOff()) return;
    void trackPageview();

    // A section counts as reached when it crosses a band around the middle
    // of the viewport: scrolling past a heading at speed does not count,
    // stopping to read does.
    const seen = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting || seen.has(e.target.id)) continue;
          seen.add(e.target.id);
          track("section", e.target.id);
          io.unobserve(e.target);
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    for (const id of SECTIONS) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }

    // Bubble phase, after React's own handlers: a link whose click the page
    // took over (the trailers open in an overlay instead of on YouTube) has
    // defaultPrevented set by then, and is counted by that component instead.
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      const a = (e.target as Element | null)?.closest?.("a[href]");
      if (!(a instanceof HTMLAnchorElement)) return;
      const url = new URL(a.href, location.href);
      if (url.pathname.startsWith("/downloads/")) track("welcome_pack");
      else if (url.host !== location.host && /^https?:$/.test(url.protocol)) track("outbound", url.href);
    };
    document.addEventListener("click", onClick);

    // Visible time, not open time: a tab left in the background is not reading.
    let visibleSince = document.visibilityState === "visible" ? performance.now() : null;
    let banked = 0;
    let maxScroll = 0;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      if (max > 0) maxScroll = Math.max(maxScroll, Math.min(100, (scrollY / max) * 100));
    };
    const flush = () => {
      if (visibleSince !== null) {
        banked += (performance.now() - visibleSince) / 1000;
        visibleSince = null;
      }
      trackEnd(banked, maxScroll);
      banked = 0;
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
      else visibleSince = performance.now();
    };
    addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    addEventListener("pagehide", flush);

    return () => {
      io.disconnect();
      document.removeEventListener("click", onClick);
      removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      removeEventListener("pagehide", flush);
    };
  }, []);

  return null;
}
