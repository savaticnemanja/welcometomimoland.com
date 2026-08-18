"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { site } from "@/content/site";

export function HeroVideo() {
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const userPaused = useRef(false);

  useEffect(() => {
    if (!site.heroVideo) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const conn = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection;
    if (conn?.saveData) return;
    if (conn?.effectiveType && /^(slow-2g|2g)$/.test(conn.effectiveType)) return;

    setEnabled(true);
  }, []);

  const start = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play()
      .then(() => setBlocked(false))
      .catch(() => setBlocked(true));
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onPlaying = () => {
      setPlaying(true);
      setReady(true);
    };
    const onPause = () => setPlaying(false);

    v.addEventListener("playing", onPlaying);
    v.addEventListener("pause", onPause);
    if (v.readyState >= 3) start();
    else v.addEventListener("canplay", start, { once: true });

    return () => {
      v.removeEventListener("playing", onPlaying);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("canplay", start);
    };
  }, [start, enabled]);

  useEffect(() => {
    const hero = document.querySelector(".hero");
    if (!hero) return;
    hero.classList.toggle("has-video", ready);
    return () => hero.classList.remove("has-video");
  }, [ready]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !ready) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!userPaused.current) start();
        } else {
          v.pause();
        }
      },
      { threshold: 0 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [ready, start]);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      userPaused.current = false;
      start();
    } else {
      userPaused.current = true;
      v.pause();
    }
  };

  if (!enabled) return null;

  const base = `/video/${site.heroVideo}`;

  return (
    <>
      <video
        ref={videoRef}
        className={ready ? "hero-video in" : "hero-video"}
        muted
        loop
        playsInline
        autoPlay
        preload="auto"
        aria-hidden="true"
        tabIndex={-1}
      >
        <source src={`${base}.webm`} type="video/webm" />
        <source src={`${base}.mp4`} type="video/mp4" />
      </video>
      {(ready || blocked) && (
        <button type="button" className="hero-toggle" onClick={toggle}>
          <svg viewBox="0 0 12 12" aria-hidden="true">
            {playing ? (
              <path d="M2 1h3v10H2zM7 1h3v10H7z" />
            ) : (
              <path d="M3 1l8 5-8 5z" />
            )}
          </svg>
          {playing ? "Pause" : "Play"}
          <span className="sr-only"> background video</span>
        </button>
      )}
    </>
  );
}
