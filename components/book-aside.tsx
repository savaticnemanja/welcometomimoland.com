"use client";

import { useCallback, useEffect, useRef, useState, type TouchEvent } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/icons";
import { Img } from "@/components/img";
import manifest from "@/content/image-manifest.json";
import { bookSpreads, site, type BookPage } from "@/content/site";

const pages: BookPage[] = bookSpreads.flat();

// Index of the first page of each spread, so the viewer can keep its place
// when it switches between spreads and single pages.
const spreadStarts = bookSpreads.reduce<number[]>(
  (acc, s, i) => [...acc, i === 0 ? 0 : acc[i - 1] + bookSpreads[i - 1].length],
  [],
);

const spreadOf = (page: number) => {
  let v = 0;
  while (v + 1 < spreadStarts.length && spreadStarts[v + 1] <= page) v++;
  return v;
};

// A facing pair is ~1.6:1, so it only beats a single page once the viewport
// is at least square. A portrait phone or tablet reads one page at a time.
const SPREAD_QUERY = "(min-aspect-ratio: 1/1) and (min-width: 600px)";

// Rendered width of one page in .book-viewer (see globals.css).
const PAGE_SIZES = `${SPREAD_QUERY} min(44vw, 62vh), min(92vw, 56vh)`;

type Open = { kind: "book"; page: number } | { kind: "trailer" } | null;

export function BookAside() {
  const [open, setOpen] = useState<Open>(null);
  const [wide, setWide] = useState(false);
  const openerRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const touchRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(SPREAD_QUERY);
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const page = open?.kind === "book" ? open.page : null;

  // Which view the current page falls in, and the pages that view shows.
  const view = page === null ? -1 : wide ? spreadOf(page) : page;
  const viewCount = wide ? bookSpreads.length : pages.length;
  const viewPages = (v: number) => (wide ? bookSpreads[v] : [pages[v]]);
  const viewStart = (v: number) => (wide ? spreadStarts[v] : v);

  const close = useCallback(() => {
    setOpen(null);
    openerRef.current?.focus();
  }, []);

  const step = useCallback(
    (delta: number) => {
      if (view < 0) return;
      const next = view + delta;
      if (next < 0 || next >= viewCount) return;
      setOpen({ kind: "book", page: wide ? spreadStarts[next] : next });
    },
    [view, viewCount, wide],
  );

  const kind = open?.kind ?? null;

  useEffect(() => {
    if (!kind) return;

    document.body.classList.add("nav-open");
    dialogRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return close();
      if (kind === "book" && e.key === "ArrowRight") return step(1);
      if (kind === "book" && e.key === "ArrowLeft") return step(-1);
      if (e.key !== "Tab") return;

      const items = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>("button:not([disabled]), iframe") ?? [],
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
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("nav-open");
    };
  }, [kind, close, step]);

  // Warm the neighbouring views so turning a page does not wait on the network.
  useEffect(() => {
    if (view < 0) return;
    const views = wide ? bookSpreads : pages.map((p) => [p]);
    for (const v of [view + 1, view - 1]) {
      for (const p of views[v] ?? []) {
        const img = new Image();
        img.sizes = PAGE_SIZES;
        img.srcset = manifest[p.image].srcSet;
      }
    }
  }, [view, wide]);

  const openBook = (el: HTMLElement) => {
    openerRef.current = el;
    setOpen({ kind: "book", page: 0 });
  };

  const onTouchStart = (e: TouchEvent) => {
    const t = e.touches[0];
    touchRef.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: TouchEvent) => {
    const start = touchRef.current;
    touchRef.current = null;
    if (!start || kind !== "book") return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1);
  };

  const shown = view < 0 ? [] : viewPages(view);
  const first = view < 0 ? 0 : viewStart(view) + 1;
  const label =
    shown.length > 1
      ? `Pages ${first}–${first + shown.length - 1} of ${pages.length}`
      : `Page ${first} of ${pages.length}`;

  const dialog =
    open &&
    createPortal(
      <div
        className={`lightbox ${open.kind === "book" ? "book-viewer" : "book-video"}`}
        role="dialog"
        aria-modal="true"
        aria-label={
          open.kind === "book"
            ? "Look inside Mimoland by the Flying Fairy"
            : "Mimoland by the Flying Fairy — book trailer"
        }
        ref={dialogRef}
        tabIndex={-1}
        onClick={(e) => e.target === e.currentTarget && close()}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {open.kind === "book" ? (
          <>
            <button
              type="button"
              className="lb-nav lb-prev"
              aria-label="Previous page"
              disabled={view <= 0}
              onClick={() => step(-1)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <figure>
              <div
                className={`book-spread${shown.length > 1 ? " pair" : ""}`}
                onClick={(e) => e.target === e.currentTarget && close()}
              >
                {shown.map((p) => (
                  <Img key={p.image} name={p.image} alt={p.alt} sizes={PAGE_SIZES} eager />
                ))}
              </div>
              <figcaption aria-live="polite">{label}</figcaption>
            </figure>

            <button
              type="button"
              className="lb-nav lb-next"
              aria-label="Next page"
              disabled={view >= viewCount - 1}
              onClick={() => step(1)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </>
        ) : (
          <figure>
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${site.bookTrailerEmbedId}?autoplay=1&rel=0&modestbranding=1`}
              title="Welcome to Mimoland — book trailer"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <figcaption>Welcome to Mimoland — the book trailer</figcaption>
          </figure>
        )}

        <button type="button" className="lb-close" aria-label="Close" onClick={close}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </div>,
      document.body,
    );

  return (
    <div className="book-aside reveal" data-delay="1">
      {/* The cover is a second way into the viewer for pointer users; the
          labelled button below is the one keyboards and screen readers get. */}
      <button
        type="button"
        className="book-art"
        tabIndex={-1}
        aria-hidden="true"
        onClick={(e) => openBook(e.currentTarget)}
      >
        <Img
          name="book-standing"
          alt=""
          sizes="(max-width: 980px) 250px, 270px"
        />
      </button>

      <div className="book-ctas">
        <button
          type="button"
          className="btn btn-gold book-look"
          onClick={(e) => openBook(e.currentTarget)}
        >
          <Icon name="publishing" />
          Look Inside
        </button>
        <p className="book-look-note">Explore selected pages from the original book.</p>

        {site.bookTrailerUrl && (
          <a
            className="btn btn-ghost btn-trailer"
            href={site.bookTrailerUrl}
            target="_blank"
            rel="noopener"
            onClick={(e) => {
              if (!site.bookTrailerEmbedId) return;
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
              e.preventDefault();
              openerRef.current = e.currentTarget;
              setOpen({ kind: "trailer" });
            }}
          >
            <svg className="btn-play" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
            Watch Book Trailer
          </a>
        )}

        <a className="btn btn-outline" href={site.bookUrl} target="_blank" rel="noopener">
          <Icon name="amazon" />
          Discover on Amazon
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>

      {dialog}
    </div>
  );
}
