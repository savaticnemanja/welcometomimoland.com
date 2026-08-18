import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/brand";
import { site } from "@/content/site";

const UPDATED = "18 August 2026";

export const metadata: Metadata = {
  title: "Privacy Notice — Welcome to Mimoland",
  description:
    "What this site collects, what it does not, and who else is involved when you visit welcometomimoland.com.",
  alternates: { canonical: "/privacy-notice/" },
  robots: { index: false, follow: true },
};

export default function PrivacyNotice() {
  return (
    <>
      <header className="doc-bar">
        <div className="wrap">
          <Link href="/" className="brand" aria-label="Welcome to Mimoland — home">
            <Brand />
          </Link>
        </div>
      </header>

      <main id="main" className="doc" tabIndex={-1}>
        <div className="wrap">
          <div className="doc-head">
            <span className="eyebrow">Legal</span>
            <h1>Privacy Notice</h1>
            <p className="doc-lede">
              This site is built to need very little from you. It sets no
              cookies of its own, runs no analytics, and keeps nothing in your
              browser. What follows is the whole of what happens anyway.
            </p>
            <p className="doc-date">Last updated {UPDATED}</p>
          </div>

          <div className="doc-body">
            <h2>Who is responsible</h2>
            <p>
              Welcome to Mimoland is published by <b>Jasna Dragojević PR
              VIDIKA</b>, registered in Serbia, which is the data controller for
              everything described here. You can reach us at{" "}
              <a href={`mailto:${site.email}`} suppressHydrationWarning>
                {site.email}
              </a>
              .
            </p>

            <h2>Visiting the site</h2>
            <p>
              We set no cookies and store nothing on your device. The pages, the
              fonts, the images and the background video are all served from
              this site itself, so simply loading a page sends you to no one
              else.
            </p>
            <p>
              The site is served from a host behind Cloudflare, which acts as
              its delivery network and protection layer. Cloudflare sets one
              cookie of its own, <code>__cf_bm</code>, to tell human traffic
              from automated traffic; it expires within about thirty minutes and
              is not used to profile you. Our host and Cloudflare also keep
              ordinary server logs — your IP address, the time, the page asked
              for, and your browser's user-agent string — which is how any site
              is delivered and defended at all.
            </p>

            <h2>Watching the trailer</h2>
            <p>
              The film poster on the home page is an image, not an embedded
              player. Nothing is requested from YouTube until you click it. If
              you do,
              the trailer opens in a YouTube player on the{" "}
              <code>youtube-nocookie.com</code> domain, and from that moment
              Google receives your IP address and information about your device
              in order to deliver the video, as a data controller in its own
              right and under its own privacy policy. Not clicking means Google
              learns nothing about your visit.
            </p>

            <h2>Requesting the deck</h2>
            <p>
              The deck request form does not send anything anywhere by itself.
              When you submit it, your own email program opens with the details
              you entered already written into a message addressed to us, and
              nothing leaves your computer until you choose to send it. There is
              no form-handling service in between, and no copy of a
              half-completed form: if you close the message instead of sending
              it, we never receive it and never knew it existed.
            </p>
            <p>
              The form does carry one hidden field that people cannot see and
              automated submitters usually fill in. If it arrives filled, the
              submission is dropped. Nothing about that check is stored or sent.
            </p>

            <h2>Writing to us</h2>
            <p>
              When you email us — through the form or directly — we receive your
              name, your email address, whatever you chose to tell us, and the
              routine headers any email carries. We use it to answer you and to
              carry on the conversation that follows. We do not add you to a
              mailing list, and we do not pass it to anyone for advertising. The
              legal grounds are our legitimate interest in replying to an
              enquiry, and, where your message is about working together, the
              steps taken at your request before any agreement.
            </p>

            <h2>How long anything is kept</h2>
            <p>
              Correspondence is kept while the conversation is live and for as
              long as there is a reason to keep it — a partnership discussion
              has a longer natural life than a one-line question. Email with no
              continuing purpose is deleted within twenty-four months. Server
              and Cloudflare logs are rotated on our providers' own schedules,
              typically within days.
            </p>

            <h2>Who else is involved</h2>
            <p>
              Our hosting provider, which serves the site. Cloudflare, for
              delivery, DNS and protection. Our email provider, which carries
              and stores the mailbox. Google, only if you click to play the
              trailer, and as its own controller rather than on our behalf.
              There is no analytics provider, no advertising network and no
              customer-relationship system in this list, because the site uses
              none.
            </p>

            <h2>Where your data is</h2>
            <p>
              We are established in Serbia, which is outside the European
              Economic Area, and our providers operate internationally. Where a
              transfer out of the EEA needs protecting, it is covered by the
              European Commission's standard contractual clauses.
            </p>

            <h2>Your rights</h2>
            <p>
              You can ask us for a copy of what we hold about you, ask us to
              correct it or delete it, ask us to restrict what we do with it,
              object to our using it, or ask for it in a portable form. Write to{" "}
              <a href={`mailto:${site.email}`} suppressHydrationWarning>
                {site.email}
              </a>{" "}
              and we will answer within thirty days.
            </p>
            <p>
              If you are not satisfied, you can complain to Serbia's
              Commissioner for Information of Public Importance and Personal
              Data Protection, or to the supervisory authority in your own
              country if you are in the EEA.
            </p>

            <h2>Children</h2>
            <p>
              Mimoland makes things for children, but this site is not one of
              them: it is written for airlines, investors and production and
              licensing partners, and it is not directed at anyone under sixteen.
              We do not knowingly collect anything from a child through it.
            </p>

            <h2>Links away from here</h2>
            <p>
              The site links out to Amazon, IMDb, Instagram, LinkedIn, YouTube
              and vidika.co. Once you follow one, you are on their site under
              their privacy policy, and this notice no longer applies.
            </p>

            <h2>Changes</h2>
            <p>
              If what the site does changes, this page changes with it, and the
              date at the top moves.
            </p>
          </div>

          <p className="doc-back">
            <Link href="/">← Back to Welcome to Mimoland</Link>
          </p>
        </div>
      </main>

      <footer className="doc-foot">
        <div className="wrap">
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
    </>
  );
}
