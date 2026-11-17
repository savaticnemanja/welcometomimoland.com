"use client";

import { useEffect } from "react";

// Once an element has faded in it is marked .done, which hands it back its
// own transitions (hover lifts and the like); see .reveal in globals.css.
function settle(el: HTMLElement) {
  let timer = 0;
  const finish = () => {
    window.clearTimeout(timer);
    el.removeEventListener("transitionend", onEnd);
    el.classList.add("done");
  };
  const onEnd = (e: TransitionEvent) => {
    if (e.target === el && e.propertyName === "opacity") finish();
  };
  el.addEventListener("transitionend", onEnd);
  // Fallback for when no transition runs (already visible, background tab).
  timer = window.setTimeout(finish, 1600);
}

export function RevealObserver() {
  useEffect(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof IntersectionObserver === "undefined") {
      targets.forEach((el) => el.classList.add("in", "done"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            settle(el);
            el.classList.add("in");
            io.unobserve(el);
          }
        }),
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
