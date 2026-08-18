import { Img } from "@/components/img";
import { team } from "@/content/site";

export function Team() {
  return (
    <section className="sec" id="team" aria-labelledby="team-title">
      <div className="wrap">
        <div className="sec-head center reveal">
          <span className="eyebrow">The Team Behind Mimoland</span>
          <h2 id="team-title">Storytelling, pedagogy and craft</h2>
        </div>
        <div className="team-grid">
          {team.map((m, i) => (
            <div className="member reveal" data-delay={i % 4} key={m.name}>
              <div className="av">
                {m.image ? (
                  <Img
                    name={m.image}
                    alt={`Portrait of ${m.name}`}
                    sizes="(max-width: 520px) 104px, (max-width: 900px) 50vw, 265px"
                  />
                ) : (
                  <span className="av-initials" aria-hidden="true">
                    {m.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")}
                  </span>
                )}
              </div>
              <h3>{m.name}</h3>
              <div className="role">{m.role}</div>
              <p>{m.bio}</p>
            </div>
          ))}
        </div>
        <figure className="quote reveal">
          <blockquote>
            “A Mim-awesome world of creativity — love-inspired and
            dream-like, Mimoland ensures that children fly anxiety-free… the
            element of entertainment and the element of education merge into a
            magical edutaining experience.”
          </blockquote>
          <figcaption className="cite">
            <b>Dr Svetlana Belić Malinić</b> — PhD International Education
            (Leicester); Cambridge International Qualifications Programme
            Leader; Pearson “21st Century Teacher of the Year” finalist
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
