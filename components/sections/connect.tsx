import { DeckForm } from "@/components/deck-form";
import { site } from "@/content/site";

const CTA_ART = "/images/opportunity-bg-640.webp";

export function Connect() {
  return (
    <section className="cta" id="connect" aria-labelledby="connect-title">
      <div
        className="ctabg"
        style={{ backgroundImage: `url('${CTA_ART}')` }}
      />
      <div className="ctaveil" />
      <div className="wrap">
        <span className="eyebrow">Let’s Build the Future of Flight</span>
        <h2 id="connect-title">Bring Mimoland to your world</h2>
        <p>
          Request the full investor and partnership deck, or start a
          conversation about partnerships, production, licensing or investment.
        </p>
        <DeckForm />
        <div className="or-label">or contact us directly</div>
        <p className="direct-mail">
          <a href={`mailto:${site.email}`} suppressHydrationWarning>
            {site.email}
          </a>
        </p>
      </div>
    </section>
  );
}
