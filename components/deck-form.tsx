"use client";

import { useEffect, useId, useRef, useState } from "react";
import { enquiryTypes, site } from "@/content/site";

type Errors = { name?: string; email?: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function DeckForm() {
  const id = useId();
  const [sent, setSent] = useState<null | "posted" | "mail">(null);
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
        <h3>Thank you — we’ll be in touch shortly. ✦</h3>
        {site.deckUrl && (
          <p>
            <a className="btn btn-gold" href={site.deckUrl} target="_blank" rel="noopener">
              Open the deck
            </a>
          </p>
        )}
        {sent === "posted" ? (
          <p>
            The deck usually goes out within one working day. If it has not
            arrived, write to{" "}
            <a href={`mailto:${site.email}`} style={{ color: "var(--gold)" }}>
              {site.email}
            </a>
            .
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
          headers: { Accept: "application/json" },
          body: data,
        });
        if (!res.ok) throw new Error(String(res.status));
        setSent("posted");
      } catch {
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
        {busy ? "Sending…" : "Request the Deck"}
      </button>

      {failed && (
        <p className="err" role="alert" style={{ paddingLeft: 0, textAlign: "center" }}>
          That did not go through. Please email{" "}
          <a href={`mailto:${site.email}`} style={{ textDecoration: "underline" }}>
            {site.email}
          </a>{" "}
          instead.
        </p>
      )}

      <p className="form-note">
        We use your details only to send the deck and reply to your enquiry.
      </p>
    </form>
  );
}
