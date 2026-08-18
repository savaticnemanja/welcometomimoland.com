import { Img } from "@/components/img";
import { characters } from "@/content/site";

export function Characters() {
  return (
    <section className="sec dark" id="world" aria-labelledby="world-title">
      <div className="wrap">
        <div className="sec-head center reveal">
          <span className="eyebrow">The World &amp; Its Characters</span>
          <h2 id="world-title">
            When fairytales take flight, children become sky heroes
          </h2>
          <p>
            Pillows awaken magic, sky-fairies carry virtues, and every cloud
            becomes a classroom of kindness and wonder.
          </p>
        </div>
        <div className="char-grid">
          {characters.map((c, i) => (
            <div
              className={c.lead ? "char lead reveal" : "char reveal"}
              data-delay={i % 3}
              key={c.name}
            >
              <div className="art-img">
                <Img
                  name={c.image}
                  alt={c.alt}
                  sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, 365px"
                  style={c.objectPosition ? { objectPosition: c.objectPosition } : undefined}
                />
              </div>
              <div className="meta">
                <h3>{c.name}</h3>
                <p>{c.p}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
