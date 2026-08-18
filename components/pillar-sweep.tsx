"use client";

import { useEffect, useRef } from "react";

export function PillarSweep() {
  const frame = useRef(0);

  useEffect(() => {
    const grid = document.querySelector<HTMLElement>(".pillars");
    if (!grid) return;
    const cards = Array.from(grid.querySelectorAll<HTMLElement>(".pillar"));
    if (!cards.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let current = -1;

    const measure = () => {
      const rect = grid.getBoundingClientRect();
      const vh = window.innerHeight;

      const start = vh * 0.78; 
      const end = vh * 0.32; 
      const span = start - end + rect.height;
      const progress = span > 0 ? (start - rect.top) / span : 0;

      const next = Math.min(cards.length - 1, Math.max(0, Math.floor(progress * cards.length)));

      if (next !== current) {
        cards[current]?.classList.remove("lit");
        cards[next].classList.add("lit");
        current = next;
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
      cards.forEach((c) => c.classList.remove("lit"));
    };
  }, []);

  return null;
}
