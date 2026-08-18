import { CountUp } from "@/components/count-up";
import { opportunityStats } from "@/content/site";

export function Opportunity() {
  return (
    <section className="band" id="opportunity" aria-labelledby="opportunity-title">
      <div className="wrap">
        <h2 className="eyebrow" id="opportunity-title">
          The Opportunity
        </h2>
        <div className="stats">
          {opportunityStats.map((s, i) => (
            <div className="stat reveal" data-delay={i} key={s.num}>
              <CountUp className="num" value={s.num} />
              <div className="lab">{s.lab}</div>
              <div className="src">{s.src}</div>
            </div>
          ))}
        </div>
        <p className="band-note">
          Anxiety is learned early — and so is confidence. Mimoland intervenes
          early, creating positive associations with flying, smoother journeys
          for families and lasting brand affection for airlines.
        </p>
      </div>
    </section>
  );
}
