"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Img } from "@/components/img";
import { communityImages } from "@/content/site";

export function Gallery() {
  const [index, setIndex] = useState<number | null>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setIndex(null);
    openerRef.current?.focus();
  }, []);

  const step = useCallback((delta: number) => {
    setIndex((i) => (i === null ? i : (i + delta + communityImages.length) % communityImages.length));
  }, []);

  useEffect(() => {
    if (index === null) return;

    document.body.classList.add("nav-open");
    dialogRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return close();
      if (e.key === "ArrowRight") return step(1);
      if (e.key === "ArrowLeft") return step(-1);
      if (e.key !== "Tab") return;

      const items = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>("button") ?? [],
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
  }, [index, close, step]);

  const active = index === null ? null : communityImages[index];

  return (
    <>
      <div className="comm-grid reveal">
        {communityImages.map((img, i) => (
          <figure className={img.span ?? undefined} key={img.image}>
            <button
              type="button"
              aria-label={`View larger: ${img.alt}`}
              onClick={(e) => {
                openerRef.current = e.currentTarget;
                setIndex(i);
              }}
            >
              <Img
                name={img.image}
                alt={img.alt}
                sizes={
                  img.span === "feature"
                    ? "(max-width: 640px) 78vw, (max-width: 900px) 100vw, 555px"
                    : "(max-width: 640px) 78vw, (max-width: 900px) 50vw, 270px"
                }
              />
            </button>
            <figcaption aria-hidden="true">{img.alt}</figcaption>
          </figure>
        ))}
      </div>

      {active && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={active.alt}
          ref={dialogRef}
          tabIndex={-1}
          onClick={(e) => e.target === e.currentTarget && close()}
        >
          <button type="button" className="lb-nav lb-prev" aria-label="Previous photo" onClick={() => step(-1)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <figure>
            <Img name={active.image} alt={active.alt} sizes="min(1100px, 92vw)" eager />
            <figcaption>
              {active.alt} · {index! + 1} of {communityImages.length}
            </figcaption>
          </figure>

          <button type="button" className="lb-nav lb-next" aria-label="Next photo" onClick={() => step(1)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <button type="button" className="lb-close" aria-label="Close" onClick={close}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}
