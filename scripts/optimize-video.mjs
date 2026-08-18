import { mkdir, readdir, rm, stat } from "node:fs/promises";
import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);

const SRC = "assets/video";
const OUT = "public/video";
const NAME = "hero-loop";
const WIDTH = 1280;

const env = { ...process.env };
if (process.env.X265_LIB_PATH) {
  env.DYLD_FALLBACK_LIBRARY_PATH = process.env.X265_LIB_PATH;
} else if (process.platform === "darwin") {
  const libs = [];
  for (const root of ["/opt/homebrew/Cellar/x265", "/usr/local/Cellar/x265"]) {
    let versions;
    try {
      versions = await readdir(root);
    } catch {
      continue; 
    }
    for (const v of versions) libs.push(path.join(root, v, "lib"));
  }
  if (libs.length) env.DYLD_FALLBACK_LIBRARY_PATH = libs.join(":");
}

const ffmpeg = (args) => run("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], { env });

let sources;
try {
  sources = (await readdir(SRC)).filter((f) => /\.(mp4|mov|m4v|webm)$/i.test(f)).sort();
} catch {
  throw new Error(
    `no ${SRC}/ directory. Put the master clip there (any of .mp4 .mov .m4v .webm) and re-run.`,
  );
}
if (!sources.length) throw new Error(`no source clip in ${SRC}`);
if (sources.length > 1) {
  console.warn(`! ${sources.length} clips in ${SRC}, using ${sources[0]}`);
}

const src = path.join(SRC, sources[0]);
const srcBytes = (await stat(src)).size;

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

const scale = `scale=${WIDTH}:-2:flags=lanczos`;

console.log(`  ${src} -> ${OUT}/${NAME}.{webm,mp4}`);

await ffmpeg([
  "-i", src,
  "-vf", scale,
  "-an",
  "-c:v", "libx264",
  "-profile:v", "high",
  "-crf", "34",
  "-preset", "slow",
  "-pix_fmt", "yuv420p",
  "-g", "48",
  "-movflags", "+faststart",
  path.join(OUT, `${NAME}.mp4`),
]);

await ffmpeg([
  "-i", src,
  "-vf", scale,
  "-an",
  "-c:v", "libvpx-vp9",
  "-crf", "48",
  "-b:v", "0",
  "-row-mt", "1",
  "-deadline", "good",
  "-cpu-used", "2",
  "-g", "48",
  path.join(OUT, `${NAME}.webm`),
]);

const written = await readdir(OUT);
let outBytes = 0;
for (const f of written) outBytes += (await stat(path.join(OUT, f))).size;

const mb = (n) => `${(n / 1e6).toFixed(2)} MB`;
console.log(`\n  ${written.length} files, ${mb(srcBytes)} -> ${mb(outBytes)}`);
for (const f of written.sort()) {
  console.log(`    ${f.padEnd(24)} ${mb((await stat(path.join(OUT, f))).size)}`);
}
