import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { fraunces, inter } from "./fonts";
import { site } from "@/content/site";
import "./globals.css";

const title = "Welcome to Mimoland — The World's First Flying Fairytale";
const description =
  "Mimoland turns a child's first flight into a magical journey — merging storytelling, education and aviation. A scalable IP for airlines, investors, production and licensing partners.";

export const metadata: Metadata = {
  metadataBase: new URL("https://welcometomimoland.com"),
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Welcome to Mimoland",
    title,
    description,
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "Mimoland — the world's first flying fairytale. Miri looks on in wonder beside four festival wins and two official selections.",
      },
    ],
  },
  twitter: { card: "summary_large_image", title, description },
};

export const viewport: Viewport = {
  themeColor: "#0B1524",
  colorScheme: "light",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://welcometomimoland.com/#org",
      name: "Mimoland",
      url: "https://welcometomimoland.com",
      email: site.email,
      description,
      sameAs: [site.instagram, site.youtube, site.linkedin, site.imdb].filter(Boolean),
    },
    {
      "@type": "WebSite",
      "@id": "https://welcometomimoland.com/#site",
      url: "https://welcometomimoland.com",
      name: "Welcome to Mimoland",
      publisher: { "@id": "https://welcometomimoland.com/#org" },
      inLanguage: "en",
    },
    {
      "@type": "Book",
      name: "Mimoland by the Flying Fairy",
      author: { "@type": "Person", name: "Jasna Dragojević" },
      url: site.bookUrl,
    },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable}`}
    >
      <head>
        <link
          rel="preload"
          as="image"
          href="/images/hero-bg-960.webp"
          type="image/webp"
          fetchPriority="high"
        />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
