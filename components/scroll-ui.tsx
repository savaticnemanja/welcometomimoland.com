"use client";

import { useEffect, useRef, useState } from "react";
import { navLinks } from "@/content/site";

export function ScrollUI() {
  const [showTop, setShowTop] = useState(false);
  const frame = useRef(0);

  useEffect(() => {
    const bar = document.querySelector<HTMLElement>(".progress");
    const anchors = new Map<string, HTMLAnchorElement>();
    document
      .querySelectorAll<HTMLAnchorElement>('.nav-links a[href^="#"]')
      .forEach((a) => anchors.set(a.getAttribute("href")!.slice(1), a));

    const sections = navLinks
      .map((l) => document.getElementById(l.href.slice(1)))
      .filter((el): el is HTMLElement => Boolean(el));

    let current = "";

    const measure = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;

      if (bar) bar.style.setProperty("--p", String(max > 0 ? Math.min(y / max, 1) : 0));
      setShowTop(y > window.innerHeight * 0.9);

      const line = y + 140;
      let active = "";
      for (const s of sections) {
        if (s.offsetTop <= line) active = s.id;
      }
      if (max > 0 && y >= max - 4 && sections.length) {
        active = sections[sections.length - 1].id;
      }

      if (active !== current) {
        if (current) anchors.get(current)?.removeAttribute("aria-current");
        if (active) anchors.get(active)?.setAttribute("aria-current", "true");
        current = active;
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <button
      type="button"
      className={showTop ? "to-top show" : "to-top"}
      aria-label="Back to top"
      tabIndex={showTop ? 0 : -1}
      onClick={() => {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
        document.querySelector<HTMLElement>(".brand")?.focus();
      }}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
