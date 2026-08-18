import type { CSSProperties } from "react";
import { Icon } from "@/components/icons";
import { pillars } from "@/content/site";

export function Ecosystem() {
  return (
    <section className="sec dark" id="ecosystem" aria-labelledby="ecosystem-title">
      <div className="wrap">
        <div className="sec-head center reveal">
          <span className="eyebrow">The Ecosystem</span>
          <h2 id="ecosystem-title">One IP, six industries</h2>
          <p>
            A scalable universe with a cross-industry business model — primed
            for global market reach.
          </p>
        </div>
        <div className="pillars">
          {pillars.map((p, i) => (
            <div
              className="pillar reveal"
              data-delay={i}
              key={p.h}
              style={{ "--accent": p.dot } as CSSProperties}
            >
              <span className="ico">
                <Icon name={p.icon} />
              </span>
              <div className="pillar-txt">
                <h3>{p.h}</h3>
                <p>{p.p}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
