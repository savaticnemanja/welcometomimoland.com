# welcometomimoland.com

The Mimoland site, as a statically exported Next.js app. `npm run build` writes
a fully static site to `out/` — there is no server component, so any static host
will serve it.

## Commands

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static export -> ./out
npm run preview  # serve ./out locally
npm run images   # regenerate public/images from assets/images
npm run video    # regenerate public/video from assets/video
```

## Layout

| Path | Contents |
| --- | --- |
| `app/globals.css` | The entire stylesheet: tokens, then base, primitives, sections, responsive, reduced-motion |
| `app/fonts.ts` | Fraunces and Inter, self-hosted via `next/font` |
| `app/layout.tsx` | Metadata, the skip link, `theme-color`, JSON-LD |
| `app/page.tsx` | Section order, top to bottom |
| `app/privacy-notice/` | The one route that is not the landing page |
| `content/site.tsx` | **All copy and links.** Text edits go here, not in the markup |
| `components/sections/` | One component per page section |
| `components/` | Header, footer, the `Img` wrapper, and the interactive pieces |
| `components/laurel.tsx` | The traced festival laurels, declared once and drawn with `<use>` |
| `assets/` | Source images, video master and logo artboards. Edit these |
| `public/images/`, `public/video/` | Generated renditions — never edit by hand |

Nine components ship JavaScript: `site-header` (the drawer), `reveal-observer`,
`scroll-ui` (progress, scroll spy, back-to-top), `pillar-sweep`, `hero-video`,
`film-trailer`, `count-up`, `gallery` (the photo overlay) and `deck-form`.
Everything else, including every section, renders to static HTML.

## The token contracts

One rule for all of them: **reach for a step, do not type a value.** Each has
its reasoning in a comment beside it in `globals.css`.

| Contract | Covers | Notes |
| --- | --- | --- |
| `--ink-*`, `--sky-*` | Text colours | `--ink-2` … `--ink-5` are cleared for cream, `--sky-1` … `--sky-5` for navy. Picking a new hex is how the contrast floor stops holding |
| `--fs-*` | 11 fixed steps, 7 display clamps | Linear below 16px where a pixel is a real difference in role, geometric above. Display clamps all converge at ~1175px; the hero keeps its own wider ramp because it is a masthead |
| `--sp-*` | 10 steps on a 4px unit | 28, 36 and 44 are deliberately **absent**. `--sec-scale` multiplies the vertical rhythm of all five section types at once |
| `--e-*` | Two elevation ramps | Blue-tinted on cream so shadows read as depth not dirt; plain black on navy where a tint is invisible. Gold glows stay at their call sites — they mean accent, not elevation |
| `--r-*` | Four radii | `--r-pill` is for things sized to their own label (buttons, chips); every box that holds content takes `--r-sm` / `--r-md` / `--r-lg` |
| `--gold-rgb` etc. | Channel triplets | The alpha stays at the call site; only the colour comes from the token |

Four rules that are load-bearing rather than cosmetic:

- **The accent palette lives in `globals.css`, not in the content file.**
  `pillars[].dot` and `partners[].bar` name a token (`"var(--peri)"`), which
  lands as `--accent` / `--bar` on the card.
- **Each accent comes in two weights, and they are not interchangeable.**
  `--peri` / `--lilac` / `--blossom` are fills, measuring 1.7–2.2:1 on cream;
  `--peri-ink` / `--lilac-ink` / `--blossom-ink` are the same hues at 5.7–6.0:1,
  which is what a kicker, a glyph stroke or a link needs. `partners[].ink` names
  the ink beside `bar` and lands as `--bar-ink`.
- **`--brand` is the logo blue and appears nowhere else.** Gold is the page's
  accent and is spent everywhere, so a gold lockup reads as one more accented
  element rather than as the mark.
- **The IP slate's stage colours are a sequential ramp, not categories.**
  Luminance falls monotonically from `dev` to `pub`, and `ipSlate` is sorted
  along it. A new stage needs a position in the sequence and a rung on the ramp.

## Asset pipelines

`npm run images` reads `assets/images/`, writes WebP renditions at up to five
widths into `public/images/`, and records dimensions in
`content/image-manifest.json`. `npm run video` does the same for the hero loop
from `assets/video/`. Both outputs are committed, so a deploy never needs sharp
or ffmpeg. To change an image: drop it in `assets/images/`, re-run, then
reference it by filename via `<Img name="…" />`.

`Img` fills in `srcset`, intrinsic `width`/`height` and `loading` from the
manifest. Each usage passes `sizes` describing the CSS width it renders at — get
that wrong and the browser fetches the wrong rendition. Exactly one image
carries `priority` (the hero poster, the LCP); everything else lazy-loads.

`assets/logos/` holds the supplied brand artboards. `components/brand-marks.tsx`
is traced from `symbol.svg` and `wordmark-mimoland.svg`, with each viewBox
measured to the ink rather than eyeballed.

On macOS, Homebrew's ffmpeg can fail on startup with a missing `libx265` dylib
after an unrelated `brew upgrade`. `scripts/optimize-video.mjs` works around it
by putting every installed x265 on the fallback path; `brew reinstall ffmpeg` is
the real cure.

## Interaction and accessibility

- **`prefers-reduced-motion`** stops every reveal, hover lift, image zoom and
  the smooth scroll. Reveal elements are forced visible in that mode — without
  that they would strand at `opacity: 0`.
- **One `:focus-visible` ring**, in two tints so it survives both the cream and
  the navy halves, plus a skip link.
- **`scroll-margin-top`** on every section target, so anchor jumps clear the
  fixed header.
- **The mobile drawer** is `visibility: hidden` when closed (driven by the media
  query, not by JS, so it cannot drift out of sync with the breakpoint). While
  open it traps Tab, closes on Escape, closes on a tap outside, and returns
  focus to the toggle.
- **Anything `null` in `content/site.tsx` is not rendered** rather than shipped
  as a dead link.

### Two stacking traps in the drawer

Neither shows in a screenshot, and both passed every computed-style assertion
while being broken on a real phone.

**The scrim can paint over the drawer.** `.nav-scrim` is a sibling of
`<header>`, and the header is a stacking context (`position: fixed` with a
`z-index`) — so the drawer's `z-index` *inside* the header is scoped to it and
cannot outrank a root-level sibling, whatever the number says. The scrim has to
sit under the header (100) and over `.to-top` (95); it is `96`.

**`backdrop-filter` traps fixed descendants.** A non-`none` `backdrop-filter`
makes an element the containing block for its fixed-position descendants — the
same rule as `filter` and `transform`. The drawer is `position: fixed` inside
the header, so when the bar goes `.solid` on scroll it resolves against the
bar's box and opens ~136px tall instead of full height. `body.nav-open
header.solid` drops the blur, and the drawer carries none of its own.

The same rule governs `.sec:not(.dark) > .wrap`, which is `position: relative`
with **no** `z-index`: any z-index there would make it a stacking context, and
the gallery's `z-index: 200` lightbox would resolve inside it and open beneath
the header.

### Verifying

`prefers-reduced-motion`, the focus trap, the overlay, the form and the heading
outline are behaviours a visual diff will not catch, and there is no test runner
committed. Re-check by hand after touching `site-header`, `gallery`, `deck-form`
or the colour tokens.

Assert on **hit testing and measured geometry**, not computed styles — both
drawer bugs above passed every style assertion. `document.elementFromPoint` on
each control, and comparing the drawer's height to `window.innerHeight` after
scrolling, is what surfaces them.

Note when screenshotting headlessly: Chrome clamps its layout viewport to a
500px minimum, so `--window-size=430` lays out at 500 and crops. Render inside a
430px iframe instead. Virtual time (`--virtual-time-budget`) also stalls CSS
transitions and media seeking — drive a real browser over CDP for anything that
depends on either.

### The deck form

`components/deck-form.tsx` posts to `site.formEndpoint` if one is set, and
otherwise opens a pre-filled email to `site.email` — slower for the visitor, but
no lead is lost either way. Setting the endpoint (Formspree, a Worker, an ESP
hook — anything taking a urlencoded POST) retires the mail fallback with no
other change.

It validates in-page rather than via the browser's bubbles, ties each message to
its field with `aria-describedby`, moves focus to the first bad field, carries a
honeypot, and asks one qualifying question so enquiries arrive sorted.

The reply the enquirer receives is `email/enquiry-confirmation.html` — no code
here sends it, so it is a body to paste into whichever service ends up doing
the sending. Its logo is a hosted PNG rather than the site's inline SVG, because
Gmail strips SVG; `npm run email-logo` rebuilds it from the path data in
`components/brand-marks.tsx` so it cannot drift from the header. See
`email/README.md`.

## Font notes

`next/font` self-hosts differently than the Google Fonts CDN, which requires
four deliberate deviations from a literal copy of the original CSS:

1. **Serif weights below 400 are pinned to 400** (`.origins .story p.lead`,
   `.tagline`). The original requested Fraunces at 400/500/600 only, so the
   browser rounded `font-weight:300` up. The unrestricted variable font honours
   300 literally and renders those passages visibly lighter.
2. **`.quote .cite b` is pinned to 600.** `<b>` resolves to 700, but the
   original served Inter clamped to 300–600.
3. **`adjustFontFallback` is off.** It injects a metric-adjusted Arial face
   right after each family, which then supplies glyphs the real font lacks — the
   `→` on the partner cards came out as Arial's arrow.
4. **`latin-ext` subset included.** Limiting to `latin` breaks `ć` and `š` in
   "Dragojević", "Perišić" and "Belić Malinić".

Pinning Fraunces to static weights instead of the variable font was tried and
rejected — it loses the optical-size axis and changes every heading.

## Performance

Measure against the production build (`out/`), never `npm run dev` — a
dev-server run reports Performance in the 30s purely from unminified bundles and
React dev mode.

The largest remaining block is ~437 KiB of fonts: four Fraunces files, because a
two-axis variable font across two unicode ranges is simply large. Two things
were tried and reverted: `preload: false` improved LCP but collapsed FCP and
Speed Index, and dropping the `opsz` axis would cut weight substantially but
changes how every heading renders, so it is a design decision rather than a free
win.

`deploy/cache.conf` and `public/_headers` carry the cache policy; a local
preview server ignores both, so repeat-visit numbers only mean anything on the
real host.

## Outstanding items

Each degrades to something honest, but each is a thing the site is not yet
saying. The first three live in `content/site.tsx`, one line each.

- **`site.formEndpoint`** is `null`, so the deck form falls back to opening a
  pre-filled email. Point it at a real endpoint before launch — the fallback
  works, but it depends on the visitor having a mail client configured.
- **`site.deckUrl`** is `null`, so the deck only arrives by reply. Set it to a
  PDF URL and the form's confirmation screen offers it immediately.
- **The hero background is a placeholder.** Being reshot; it is the one image
  still cropped hard on a phone, and it sits at 40% opacity under a veil, so it
  will hold until then.
- **`origins-jasna-uniform` is a 222×286 source** and renders into a 300px
  slot, so it is visibly soft. There is no processing fix: the client's
  higher-resolution copy turned out to be that same file scaled up ~38× with no
  detail added. Only a rescan changes it.
- **`public/og.jpg` is composed by hand, not generated at build.** If the
  headline, the brand mark or the festival count changes, the share card goes
  stale against the page — see the note in `app/layout.tsx`.
- **The team portraits are monochrome source files**, not CSS-desaturated.
  Nothing in the stylesheet touches them — colour versions need new photography.
- **Character artwork is incomplete.** Six frames, one of which
  (`char-the-mimos`) is a 3:4 portrait in a set of 16:9 stills, so it takes the
  heaviest crop in the grid.
- **The nav bar is full.** Measured across 901–1440px, one more item clears 48px
  at the tightest width; two wrap at 1100 and again just above the drawer
  breakpoint. `#traction` is reachable only from the footer and `#film` only
  from the hero button. Getting either into the bar means taking something out,
  or pulling the crowding rules forward *and* raising the drawer to ~960.
- **Margins were never swept onto `--sp-*`.** Gaps and paddings were; margins
  are a third category and only the ones in rules already being edited moved.
- **The favicon** (`app/icon.png`) is cropped from the old gold mark and has not
  been reissued in `--brand` blue.
- **The JSON-LD in `app/layout.tsx`** claims only what the page already says.
  Extend it when there is more to claim — do not let it drift ahead of the copy.

## Deploying

`out/` is a plain static directory. On Cloudflare Pages, set the build command
to `npm run build` and the output directory to `out`; `public/_headers` is
picked up automatically.

`metadataBase`, `robots.ts` and `sitemap.ts` all hardcode
`https://welcometomimoland.com` — update all three together if the domain
changes, or the canonical URL and social card links will point at the wrong
host.
