import { mkdir, readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

// The email lockup is derived from components/brand-marks.tsx rather than the
// files in assets/logos: those carry the marks on a shared 842x595.5 artboard,
// and the components carry the tight viewBoxes the site actually renders. Read
// the components and the email logo can never drift from the header and footer.
const SRC = "components/brand-marks.tsx";
const SVG_OUT = "assets/logos/lockup-mimoland.svg";
const PNG_OUT = "public/email/logo-mimoland.png";

// .brand-lockup.brand-lg in app/globals.css
const SYMBOL_H = 44;
const WORD_H = 41;
const GAP = 16;

const BRAND = "#4BACE1"; // --brand
const GOLD = "#E0B053"; // --gold

const SCALE = 3; // shipped at 3x, displayed at 250px

const src = await readFile(SRC, "utf8");
const paths = [...src.matchAll(/<path d="([^"]+)"/g)].map((m) => m[1]);
const boxes = [...src.matchAll(/viewBox="([^"]+)"/g)].map((m) => m[1].split(" ").map(Number));
if (paths.length < 2 || boxes.length < 2) throw new Error(`no marks found in ${SRC}`);

// MimoSymbol is declared first and holds a single path; the rest are the wordmark.
const [symbol, ...word] = paths;
const [[sx, sy, sw, sh], [wx, wy, ww, wh]] = boxes;

const symbolW = (sw / sh) * SYMBOL_H;
const wordW = (ww / wh) * WORD_H;
const width = symbolW + GAP + wordW;

const place = (x, y, scale, ox, oy, fill, d) =>
  `  <g transform="translate(${x} ${y}) scale(${scale}) translate(${-ox} ${-oy})" fill="${fill}">\n` +
  d.map((p) => `    <path d="${p}"/>`).join("\n") +
  `\n  </g>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width.toFixed(2)}" height="${SYMBOL_H}" viewBox="0 0 ${width.toFixed(2)} ${SYMBOL_H}" role="img" aria-label="Welcome to Mimoland">
${place(0, 0, (SYMBOL_H / sh).toFixed(6), sx, sy, BRAND, [symbol])}
${place((symbolW + GAP).toFixed(2), ((SYMBOL_H - WORD_H) / 2).toFixed(2), (WORD_H / wh).toFixed(6), wx, wy, GOLD, word)}
</svg>
`;

await mkdir("public/email", { recursive: true });
await writeFile(SVG_OUT, svg);

// Transparent, so it sits on the card in light mode and on whatever a client
// swaps in for dark mode. Blue and gold both hold against either.
const info = await sharp(Buffer.from(svg), { density: 72 * SCALE })
  .resize({ width: Math.round(width * SCALE) })
  .png({ compressionLevel: 9 })
  .toFile(PNG_OUT);

console.log(
  `${PNG_OUT}  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(1)} KiB` +
    `  (display ${Math.round(width)}x${SYMBOL_H} @${SCALE}x)`,
);
