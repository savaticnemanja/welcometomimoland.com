"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Brand } from "@/components/brand";
import { navLinks } from "@/content/site";

export function SiteHeader() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("nav-open", open);
    return () => document.body.classList.remove("nav-open");
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const focusables = () =>
      Array.from(
        navRef.current?.querySelectorAll<HTMLElement>("a[href], button") ?? [],
      ).filter((el) => el.offsetParent !== null);

    focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        toggleRef.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;

      const items = [...focusables(), toggleRef.current].filter(
        (el): el is HTMLElement => Boolean(el),
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 901px)");
    const onChange = () => mq.matches && close();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [close]);

  return (
    <>
      <header className={solid ? "solid" : undefined}>
        <div className="wrap nav">
          <a href="#top" className="brand" aria-label="Mimoland — back to top">
            <Brand />
          </a>

          <nav
            id="site-nav"
            ref={navRef}
            className={open ? "nav-links open" : "nav-links"}
            aria-label="Main"
          >
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} onClick={close}>
                {l.label}
              </a>
            ))}
            <a href="#connect" className="btn btn-gold" onClick={close}>
              Request the Deck
            </a>
          </nav>

          <button
            ref={toggleRef}
            className="menu-toggle"
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="site-nav"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="bars" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
        <div className="progress" aria-hidden="true" />
      </header>

      <div
        className={open ? "nav-scrim open" : "nav-scrim"}
        onClick={close}
        aria-hidden="true"
      />
    </>
  );
}
