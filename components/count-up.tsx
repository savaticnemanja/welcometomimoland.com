"use client";

import { useEffect, useRef, useState } from "react";

type Token = { text: string } | { target: number; decimals: number; grouped: boolean };

function tokenize(value: string): Token[] {
  return value.split(/(\d[\d,]*(?:\.\d+)?)/).flatMap<Token>((chunk, i) => {
    if (chunk === "") return [];
    if (i % 2 === 0) return [{ text: chunk }];
    const grouped = chunk.includes(",");
    const plain = chunk.replace(/,/g, "");
    const dot = plain.indexOf(".");
    return [
      {
        target: Number(plain),
        decimals: dot === -1 ? 0 : plain.length - dot - 1,
        grouped,
      },
    ];
  });
}

function render(tokens: Token[], progress: number): string {
  return tokens
    .map((t) => {
      if ("text" in t) return t.text;
      const n = t.target * progress;
      const s = n.toFixed(t.decimals);
      return t.grouped ? Number(s).toLocaleString("en-GB", {
        minimumFractionDigits: t.decimals,
        maximumFractionDigits: t.decimals,
      }) : s;
    })
    .join("");
}

export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof IntersectionObserver === "undefined") return;

    const tokens = tokenize(value);
    if (!tokens.some((t) => "target" in t)) return;

    let raf = 0;
    const DURATION = 1500;

    const run = () => {
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min((now - start) / DURATION, 1);
        setShown(render(tokens, 1 - Math.pow(1 - t, 3)));
        if (t < 1) raf = requestAnimationFrame(step);
        else setShown(value);
      };
      raf = requestAnimationFrame(step);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        setShown(render(tokens, 0));
        run();
      },
      { threshold: 0.5 },
    );
    io.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [value]);

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{value}</span>
      <span aria-hidden="true">{shown}</span>
    </span>
  );
}
