import { mkdir, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SRC = "assets/images";
const OUT = "public/images";
const QUALITY = 80;

const WIDTHS = [320, 640, 960, 1280, 1600];

const files = (await readdir(SRC)).filter((f) => /\.(jpe?g|png)$/i.test(f)).sort();
if (!files.length) throw new Error(`no source images in ${SRC}`);

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

const manifest = {};
let srcBytes = 0;
let outBytes = 0;
let renditions = 0;

for (const file of files) {
  const name = path.parse(file).name;
  const abs = path.join(SRC, file);
  const meta = await sharp(abs).metadata();
  srcBytes += (await stat(abs)).size;

  const widths = [...new Set([...WIDTHS.filter((w) => w < meta.width), meta.width])].sort(
    (a, b) => a - b,
  );

  const srcSet = [];
  for (const w of widths) {
    const info = await sharp(abs)
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(path.join(OUT, `${name}-${w}.webp`));
    outBytes += info.size;
    renditions++;
    srcSet.push(`/images/${name}-${w}.webp ${w}w`);
  }

  manifest[name] = {
    src: `/images/${name}-${widths.at(-1)}.webp`,
    srcSet: srcSet.join(", "),
    width: meta.width,
    height: meta.height,
  };
}

await writeFile("content/image-manifest.json", JSON.stringify(manifest, null, 2) + "\n");

const kb = (n) => `${(n / 1024).toFixed(0)} KiB`;
console.log(
  `${files.length} sources (${kb(srcBytes)}) -> ${renditions} webp renditions (${kb(outBytes)})`,
);
