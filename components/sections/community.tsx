import { CountUp } from "@/components/count-up";
import { Gallery } from "@/components/gallery";
import { communityStats } from "@/content/site";

export function Community() {
  return (
    <section className="sec" id="impact" aria-labelledby="impact-title">
      <div className="wrap">
        <div className="sec-head center reveal">
          <span className="eyebrow">Community Impact</span>
          <h2 id="impact-title">The programme is already in the world</h2>
          <p>
            Workshops, theatre performances and giving-back events delivered to
            communities — with Mimoland products donated to children.
          </p>
        </div>
        <div className="comm-stats">
          {communityStats.map((s, i) => (
            <div className="reveal" data-delay={i} key={s.lab}>
              <CountUp className="num" value={s.num} />
              <div className="lab">{s.lab}</div>
            </div>
          ))}
        </div>
        <Gallery />
        <p className="band-note" style={{ color: "var(--ink-4)", marginTop: 34 }}>
          Mimoland brings its stories and values into children’s lives —
          building confidence, imagination and a positive connection with
          flying.
        </p>
      </div>
    </section>
  );
}
