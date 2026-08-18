import { Fraunces, Inter } from "next/font/google";

export const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
  adjustFontFallback: false,
  variable: "--font-fraunces",
});

export const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  adjustFontFallback: false,
  variable: "--font-inter",
});

