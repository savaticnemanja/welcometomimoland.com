import { HeroVideo } from "@/components/hero-video";
import { laurels } from "@/content/site";

export function Hero() {
  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div
        className="hero-bg"
        style={{ backgroundImage: "url('/images/hero-bg-960.webp')" }}
      />
      <HeroVideo />
      <div className="hero-veil" />
      <div className="hero-motes" aria-hidden="true" />
      <div className="wrap">
        <div className="hero-copy reveal in">
          <span className="eyebrow">A New Chapter in Fearless Flying</span>
          <h1 id="hero-title">
            The World’s First
            <br />
            <span className="accent">Flying Fairytale</span>
          </h1>
          <p className="hero-sub">
            Mimoland turns a child’s first flight into a magical journey —
            merging storytelling, education and aviation to build confidence
            before anxiety can take root.
          </p>
          <div className="hero-cta">
            <a href="#connect" className="btn btn-outline">
              Partner With Us
            </a>
            <a href="#film-trailer" className="btn btn-ghost">
              <svg
                viewBox="0 0 24 24"
                width="13"
                height="13"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
              Watch the Film
            </a>
          </div>
          <ul className="laurels">
            {laurels.map((l) => (
              <li key={l.title}>
                <a
                  className="laurel"
                  href={l.href}
                  target="_blank"
                  rel="noopener"
                  aria-label={`${l.kind} — ${l.title}, ${l.body} (opens in a new tab)`}
                >
                  <span className="laurel-txt" aria-hidden="true">
                    <b>{l.kind}</b>
                    <i>{l.title}</i>
                    <br />
                    {l.body}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <a className="scroll-cue" href="#origins" aria-label="Scroll to the story">
        <span aria-hidden="true">Scroll</span>
        <i aria-hidden="true" />
      </a>
    </section>
  );
}
