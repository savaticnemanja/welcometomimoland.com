# Enquiry reply

The message the enquirer gets back after submitting the deck form. Nothing in
this repo sends it — `site.formEndpoint` is `null` and the form falls back to a
`mailto:` — so this is the body to paste into whatever ends up doing the
sending (Formspree autoresponse, an ESP template, a Worker).

`enquiry-confirmation.html` is the HTML part, `enquiry-confirmation.txt` the
plain-text alternative. Send both; a text part is what keeps the message out of
spam filters that score HTML-only mail.

## Tokens

`{{name}}`, `{{interest}}` and `{{deckUrl}}`, in Handlebars/Mustache syntax
because most providers either speak it or accept a find-and-replace. The first
two map to the `name` and `interest` fields the form already posts. Swap the
delimiters if the provider wants `%name%` or `*|NAME|*`.

`{{deckUrl}}` fills the "Open the deck" row. While `site.deckUrl` is `null` the
deck only arrives by reply, so delete that row rather than shipping a button
pointing nowhere — it is marked with a comment.

## The logo

`public/email/logo-mimoland.png`, referenced absolutely as
`https://welcometomimoland.com/email/logo-mimoland.png`. It has to be a hosted
raster: the site draws the lockup as inline SVG in `components/brand-marks.tsx`,
and Gmail strips SVG entirely.

`npm run email-logo` regenerates it. The script reads the path data straight out
of `brand-marks.tsx` and composes the two marks at the same proportions as
`.brand-lockup.brand-lg`, so the email logo cannot drift from the header and
footer — redraw a mark in the component and re-run. It writes
`assets/logos/lockup-mimoland.svg` alongside, which is the lockup as a single
file for anywhere else that wants it.

The PNG is transparent and ships at 3x for a 250px display width. Transparency
is deliberate: it sits on the warm card in light mode and on whatever a client
substitutes in dark mode, and both the blue symbol and the gold wordmark hold
against either.

## Dark mode

The `prefers-color-scheme` block is honoured by Apple Mail and ignored by Gmail,
which force-inverts on its own terms instead. Both paths were checked; the
tagline and the legal footer are the two lines that need their own overrides,
since their light-mode browns go muddy against ink.
