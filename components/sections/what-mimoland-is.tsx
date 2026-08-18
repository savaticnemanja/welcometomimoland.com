import { FilmTrailer } from "@/components/film-trailer";
import { phases } from "@/content/site";

export function WhatMimolandIs() {
  return (
    <section className="sec dark" id="film" aria-labelledby="film-title">
      <div className="wrap">
        <div className="sec-head center reveal">
          <span className="eyebrow">What Mimoland Is</span>
          <h2 id="film-title">A structured edutainment model for aviation</h2>
          <p>
            One story that travels with the family — before, during and after
            the flight.
          </p>
        </div>
        <div className="sec-note reveal">
          <h3>Learning through story, play and emotional connection</h3>
          <p>
            Grounded in social-emotional learning and peace education, Mimoland
            uses storytelling, guided play and character-led activities to help
            children recognise emotions, practise courage and empathy, and
            approach flying with greater confidence and curiosity.{" "}
            <em>Mimoland: The First Flight</em> brings this approach to life on
            screen — giving children an emotional entry point into a learning
            journey that continues through activities, workshops and play.
          </p>
        </div>
        <FilmTrailer />
        <div className="triptych">
          {phases.map((p, i) => (
            <div className="phase reveal" data-delay={i} key={p.k}>
              <div className="k">{p.k}</div>
              <h3>{p.h}</h3>
              <p>{p.p}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
