"use client";

import { useEffect, useId, useRef, useState } from "react";
import { enquiryTypes, site } from "@/content/site";

type Errors = { name?: string; email?: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function DeckForm() {
  const id = useId();
  const [sent, setSent] = useState<null | "posted" | "mail">(null);
  // What the handler said when it refused, when it said anything useful.
  const [failure, setFailure] = useState<string | null>(null);
  // Set once, on mount, and read at submit — see `elapsed` below.
  const mountedAt = useRef(Date.now());
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [failed, setFailed] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const thanksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sent) thanksRef.current?.focus();
  }, [sent]);

  if (sent) {
    return (
      <div className="thanks" role="status" tabIndex={-1} ref={thanksRef}>
        <h3>
          {sent === "posted"
            ? "Your message has landed."
            : "Thank you — we’ll be in touch shortly."}
        </h3>
        {site.deckUrl && (
          <p>
            <a className="btn btn-gold" href={site.deckUrl} target="_blank" rel="noopener">
              Open the deck
            </a>
          </p>
        )}
        {sent === "posted" ? (
          <p>
            Thank you for reaching out and for your interest in Mimoland.
            We’ll be in touch soon.
          </p>
        ) : (
          <p>
            Your email app should have opened with the message ready — send it
            and the deck follows within one working day. If nothing opened,
            write to{" "}
            <a href={`mailto:${site.email}`} style={{ color: "var(--gold)" }}>
              {site.email}
            </a>
            .
          </p>
        )}
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const interest = String(data.get("interest") ?? "");

    if (data.get("company")) return;

    const next: Errors = {};
    if (!name) next.name = "Please tell us your name.";
    if (!email) next.email = "Please add an email address.";
    else if (!EMAIL.test(email)) next.email = "That does not look like an email address.";
    setErrors(next);

    if (Object.keys(next).length > 0) {
      const field = next.name ? "name" : "email";
      formRef.current?.querySelector<HTMLInputElement>(`[name="${field}"]`)?.focus();
      return;
    }

    setBusy(true);
    setFailed(false);

    if (site.formEndpoint) {
      try {
        const res = await fetch(site.formEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          // JSON rather than the FormData object: the handler parses one
          // shape, and multipart would mean a parser it does not need. The
          // honeypot goes along so the server sees it too — the check above
          // only stops the polite ones.
          body: JSON.stringify({
            name,
            email,
            interest,
            company: String(data.get("company") ?? ""),
            // How long the form was on screen before it was sent. A human
            // cannot read and fill this in under a few seconds; a script can.
            elapsed: Date.now() - mountedAt.current,
          }),
        });
        const payload = await res.json().catch(() => null);
        if (!res.ok) throw new Error(payload?.error ?? String(res.status));
        setSent("posted");
      } catch (err) {
        // The handler explains refusals in words meant for a visitor, so show
        // its message when there is one rather than a generic failure.
        setFailure(err instanceof Error && err.message && !/^\d+$/.test(err.message) ? err.message : null);
        setFailed(true);
      } finally {
        setBusy(false);
      }
      return;
    }

    const subject = encodeURIComponent(`Deck request — ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nInterest: ${interest}\n\n` +
        `Sent from welcometomimoland.com`,
    );
    window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`;
    setBusy(false);
    setSent("mail");
  };

  return (
    <form className="deck-form" ref={formRef} onSubmit={onSubmit} noValidate>
      <div className="row">
        <div className="field">
          <label htmlFor={`${id}-name`}>Your name</label>
          <input
            id={`${id}-name`}
            type="text"
            name="name"
            placeholder="First and last name…"
            autoComplete="name"
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? `${id}-name-err` : undefined}
            onInput={() => errors.name && setErrors((p) => ({ ...p, name: undefined }))}
          />
          {errors.name && (
            <span className="err" id={`${id}-name-err`}>
              {errors.name}
            </span>
          )}
        </div>
        <div className="field">
          <label htmlFor={`${id}-email`}>Work email</label>
          <input
            id={`${id}-email`}
            type="email"
            name="email"
            placeholder="you@company.com…"
            autoComplete="email"
            inputMode="email"
            spellCheck={false}
            autoCapitalize="off"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? `${id}-email-err` : undefined}
            onInput={() => errors.email && setErrors((p) => ({ ...p, email: undefined }))}
          />
          {errors.email && (
            <span className="err" id={`${id}-email-err`}>
              {errors.email}
            </span>
          )}
        </div>
      </div>

      <div className="field">
        <label htmlFor={`${id}-interest`}>What brings you here</label>
        <select
          id={`${id}-interest`}
          name="interest"
          autoComplete="off"
          defaultValue={enquiryTypes[0]}
        >
          {enquiryTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="hp" aria-hidden="true">
        <label htmlFor={`${id}-company`}>Company</label>
        <input id={`${id}-company`} type="text" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      <button className="btn btn-gold" type="submit" disabled={busy}>
        {busy && <span className="spinner" aria-hidden="true" />}
        {busy ? "Sending…" : "Send Enquiry"}
      </button>

      {failed && (
        <p className="err" role="alert" style={{ paddingLeft: 0, textAlign: "center" }}>
          {/* The handler refuses in sentences meant to be read by whoever is
              standing at the form — "That name looks a little short", not a
              status code. When it gave us one, it is more use than ours. */}
          {failure ?? (
            <>
              That did not go through. Please email{" "}
              <a href={`mailto:${site.email}`} style={{ textDecoration: "underline" }}>
                {site.email}
              </a>{" "}
              instead.
            </>
          )}
        </p>
      )}

      <p className="form-note">
        We use your details only to send the deck and reply to your enquiry.
      </p>
    </form>
  );
}
