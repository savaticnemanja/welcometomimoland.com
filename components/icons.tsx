import type { ReactNode } from "react";

export type IconName =
  | "aviation"
  | "entertainment"
  | "education"
  | "publishing"
  | "merchandising"
  | "hospitality"
  | "airlines"
  | "investors"
  | "production"
  | "licensing"
  | "news"
  | "tv"
  | "network"
  | "books"
  | "institution"
  | "retail";

const paths: Record<IconName, ReactNode> = {
  aviation: (
    <>
      <path d="M21.5 3 2.8 10.4a.6.6 0 0 0 .05 1.13l5.85 1.77 1.77 5.85a.6.6 0 0 0 1.13.05z" />
      <path d="M21.5 3 10.5 14" />
    </>
  ),
  entertainment: (
    <>
      <path d="M3 4h18v5.5H3z" />
      <path d="M3 9.5h18V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M7.5 4 6 9.5" />
      <path d="M13 4l-1.5 5.5" />
      <path d="M18.5 4 17 9.5" />
    </>
  ),
  education: (
    <>
      <path d="M12 4 2.5 8.5 12 13l9.5-4.5z" />
      <path d="M6.5 10.8V15c0 1.7 2.5 3 5.5 3s5.5-1.3 5.5-3v-4.2" />
      <path d="M21.5 8.5v5" />
    </>
  ),
  publishing: (
    <>
      <path d="M12 7c0-1.7-2-3-4.5-3H3v13h4.5c2.5 0 4.5 1.3 4.5 3" />
      <path d="M12 7c0-1.7 2-3 4.5-3H21v13h-4.5c-2.5 0-4.5 1.3-4.5 3" />
    </>
  ),
  merchandising: (
    <>
      <path d="M4 11h16v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 20z" />
      <path d="M2.8 7h18.4v4H2.8z" />
      <path d="M12 7v14.5" />
      <path d="M12 7S11 3 8.6 3a2 2 0 0 0 0 4z" />
      <path d="M12 7s1-4 3.4-4a2 2 0 0 1 0 4z" />
    </>
  ),
  hospitality: (
    <>
      <path d="M3.5 17.5a8.5 8.5 0 0 1 17 0" />
      <path d="M2 17.5h20" />
      <path d="M12 9V7" />
      <path d="M13.1 5.9a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0z" />
    </>
  ),

  airlines: (
    <>
      <path d="M4 6.8h16a1.5 1.5 0 0 1 1.5 1.5v2.2a2 2 0 0 0 0 4v2.2a1.5 1.5 0 0 1-1.5 1.5H4a1.5 1.5 0 0 1-1.5-1.5v-2.2a2 2 0 0 0 0-4V8.3A1.5 1.5 0 0 1 4 6.8z" />
      <path d="M15 9v1.6" />
      <path d="M15 12.2v1.6" />
      <path d="M15 15.4v1.6" />
    </>
  ),
  investors: (
    <>
      <path d="M3 17.2 8.7 11.5 12.4 15.2 21 6.6" />
      <path d="M15.4 6.6H21v5.6" />
    </>
  ),
  production: (
    <>
      <path d="M3 7.6h11a1.6 1.6 0 0 1 1.6 1.6v5.6a1.6 1.6 0 0 1-1.6 1.6H3a1.6 1.6 0 0 1-1.6-1.6V9.2A1.6 1.6 0 0 1 3 7.6z" />
      <path d="M15.6 10.6 21 7.8v8.4l-5.4-2.8z" />
    </>
  ),
  licensing: (
    <>
      <path d="M11.6 2.8H20a1.2 1.2 0 0 1 1.2 1.2v8.4a1.2 1.2 0 0 1-.35.85l-8.4 8.4a1.2 1.2 0 0 1-1.7 0l-8.4-8.4a1.2 1.2 0 0 1 0-1.7l8.4-8.4a1.2 1.2 0 0 1 .85-.35z" />
      <path d="M17.6 7.5a.9.9 0 1 1-1.8 0 .9.9 0 0 1 1.8 0z" />
    </>
  ),

  news: (
    <>
      <path d="M4 4.8h12.2v13a1.9 1.9 0 0 0 1.9 1.9H5.9A1.9 1.9 0 0 1 4 17.8z" />
      <path d="M16.2 8.6H20v9.2a1.9 1.9 0 0 1-1.9 1.9" />
      <path d="M7.2 9h5.8M7.2 12.6h5.8M7.2 16.2h3.4" />
    </>
  ),
  tv: (
    <>
      <path d="M4.2 6.6h15.6a2 2 0 0 1 2 2v8.8a2 2 0 0 1-2 2H4.2a2 2 0 0 1-2-2V8.6a2 2 0 0 1 2-2z" />
      <path d="M8.4 2.6 12 6.6l3.6-4" />
    </>
  ),
  network: (
    <>
      <path d="M12 3.4a2.1 2.1 0 1 1 0 4.2 2.1 2.1 0 0 1 0-4.2z" />
      <path d="M5.2 16.4a2.1 2.1 0 1 1 0 4.2 2.1 2.1 0 0 1 0-4.2z" />
      <path d="M18.8 16.4a2.1 2.1 0 1 1 0 4.2 2.1 2.1 0 0 1 0-4.2z" />
      <path d="M10.6 7.4 6.4 15.2M13.4 7.4l4.2 7.8M7.3 18.5h9.4" />
    </>
  ),
  books: (
    <>
      <path d="M4.2 4.6h3.6v15H4.2zM9.6 4.6h3.6v15H9.6z" />
      <path d="m15.2 5.4 3.4-.9 3 14.5-3.4.9z" />
    </>
  ),
  institution: (
    <>
      <path d="M2.8 9.2 12 4.2l9.2 5" />
      <path d="M5.6 9.2v9M10 9.2v9M14 9.2v9M18.4 9.2v9" />
      <path d="M3.4 18.2h17.2M2.6 21h18.8" />
    </>
  ),
  retail: (
    <>
      <path d="M4.4 7.6h15.2l-1.1 12.1a1.6 1.6 0 0 1-1.6 1.5H7.1a1.6 1.6 0 0 1-1.6-1.5z" />
      <path d="M8.6 10V6.6a3.4 3.4 0 0 1 6.8 0V10" />
    </>
  ),
};

export function Icon({ name }: { name: IconName }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}


export function LaurelBranch({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 50"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        d="M19.6 47.8C11.2 41 6.6 33 7.1 25 7.5 17 11.6 8.6 18.1 2.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <ellipse cx="12.4" cy="44.4" rx="4.5" ry="2.25" transform="rotate(-55 12.4 44.4)" />
      <ellipse cx="8.8" cy="38.4" rx="4.6" ry="2.35" transform="rotate(-35 8.8 38.4)" />
      <ellipse cx="6.0" cy="31.6" rx="4.6" ry="2.35" transform="rotate(-16 6 31.6)" />
      <ellipse cx="5.2" cy="24.6" rx="4.5" ry="2.3" transform="rotate(2 5.2 24.6)" />
      <ellipse cx="6.1" cy="17.6" rx="4.3" ry="2.2" transform="rotate(20 6.1 17.6)" />
      <ellipse cx="8.9" cy="11.0" rx="4.0" ry="2.05" transform="rotate(42 8.9 11)" />
      <ellipse cx="12.5" cy="5.2" rx="3.5" ry="1.8" transform="rotate(60 12.5 5.2)" />
    </svg>
  );
}
