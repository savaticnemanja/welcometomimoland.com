import type { ReactNode } from "react";
import Link from "next/link";
import { Brand } from "@/components/brand";
import { site } from "@/content/site";

type Mark = { box: [number, number]; body: ReactNode };

const marks: Record<string, Mark> = {
  Email: {
    box: [24, 24],
    body: (
      <>
        <rect x="2.6" y="4.9" width="18.8" height="14.2" rx="2.8" />
        <path d="M3.9 7.4 12 13.1l8.1-5.7" />
      </>
    ),
  },
  Instagram: {
    box: [24, 24],
    body: (
      <>
        <rect x="3.79" y="3.37" width="16.43" height="16.43" rx="4.85" />
        <circle cx="12" cy="11.59" r="3.42" />
        <circle cx="16.63" cy="6.96" r="1.16" fill="currentColor" stroke="none" />
      </>
    ),
  },
  YouTube: {
    box: [24, 24],
    body: (
      <>
        <rect x="2.4" y="5.4" width="19.2" height="13.2" rx="4.1" />
        <path d="M10.3 9.2 15.2 12l-4.9 2.8z" />
      </>
    ),
  },
  LinkedIn: {
    box: [24, 24],
    body: (
      <g transform="translate(12 19.8) scale(1.06) translate(-12 -19.8)">
        <circle cx="5.1" cy="4.9" r="1.5" fill="currentColor" stroke="none" />
        <path d="M5.1 9.6V19.8" />
        <path d="M11.2 19.8V9.6" />
        <path d="M11.2 14.2c0-2.6 1.7-4.6 4.1-4.6s4.1 2 4.1 4.6V19.8" />
      </g>
    ),
  },
  IMDb: {
    box: [42, 24],
    body: (
      <text
        x="21"
        y="20.4"
        textAnchor="middle"
        fontSize="17"
        fontFamily="var(--sans)"
        fontWeight="500"
        stroke="none"
        fill="currentColor"
      >
        IMDb
      </text>
    ),
  },
};

function SocialMark({ name }: { name: string }) {
  const mark = marks[name];
  if (!mark) return null;
  const [w, h] = mark.box;
  return (
    <svg
      className={w === h ? "mark" : "mark mark-wide"}
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {mark.body}
    </svg>
  );
}

const socials: { label: string; href: string }[] = [
  { label: "Instagram", href: site.instagram },
  { label: "YouTube", href: site.youtube },
  { label: "LinkedIn", href: site.linkedin },
  { label: "IMDb", href: site.imdb },
].filter((s): s is { label: string; href: string } => Boolean(s.href));

export function SiteFooter() {
  return (
    <footer>
      <div className="wrap">
        <div className="foot">
          <div>
            <Brand className="brand-lg" />
            <p className="tagline">Giving joy, learning and well-being wings.</p>
            <div className="socials">
              <a href={`mailto:${site.email}`} aria-label={`Email ${site.email}`} suppressHydrationWarning>
                <SocialMark name="Email" />
              </a>
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener"
                  aria-label={`Mimoland on ${s.label} (opens in a new tab)`}
                >
                  <SocialMark name={s.label} />
                </a>
              ))}
            </div>
          </div>
          <nav aria-labelledby="foot-explore">
            <h3 id="foot-explore">Explore</h3>
            <a href="#origins">Origins</a>
            <a href="#world">The World</a>
            <a href="#ecosystem">Ecosystem</a>
            <a href="#partners">Partner With Us</a>
            <a href="#impact">Impact</a>
            <a href="#traction">Recognition</a>
            <a href="#ip">The IP Slate</a>
            <a href="#vision">The Vision</a>
            <a href="#team">The Team</a>
          </nav>
          <nav aria-labelledby="foot-connect">
            <h3 id="foot-connect">Connect</h3>
            <a href={`mailto:${site.email}`} suppressHydrationWarning>
              Email
            </a>
            {socials.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener">
                {s.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="foot-legal">
          <div>
            <span>© 2026 Jasna Dragojević PR VIDIKA. All rights reserved.</span>
            <span className="legal-sub">
              <Link href="/privacy-notice/">Privacy Notice</Link>
              <i aria-hidden="true">·</i>
              Web Development
              <i aria-hidden="true">·</i>
              <a href="https://nemanjas.dev" target="_blank" rel="noopener">
                nemanjas.dev
              </a>
            </span>
          </div>
          <span>
            Part of{" "}
            <a href={site.vidika} target="_blank" rel="noopener">
              VIDIKA Studio
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
