import type { CSSProperties } from "react";
import { Icon } from "@/components/icons";
import { doors } from "@/content/site";

export function Partners() {
  return (
    <section className="sec" id="partners" aria-labelledby="partners-title">
      <div className="wrap">
        <div className="sec-head center reveal">
          <span className="eyebrow">Where You Come In</span>
          <h2 id="partners-title">One story, several ways to build it together</h2>
          <p>
            Mimoland speaks to different partners through different entry points
            — while telling one consistent story.
          </p>
        </div>
        <div className="doors">
          {doors.map((d, i) => (
            <div
              className="door reveal"
              data-delay={i % 2}
              key={d.dk}
              style={{ "--bar": d.bar, "--bar-ink": d.ink } as CSSProperties}
            >
              <span className="ico">
                <Icon name={d.icon} />
              </span>
              <div className="dk">{d.dk}</div>
              <h3>{d.h}</h3>
              <p>{d.p}</p>
              <a href="#connect" className="link">
                {d.link}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
