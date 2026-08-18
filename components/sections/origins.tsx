import { Img } from "@/components/img";
import { originsDraftNote } from "@/content/site";

export function Origins() {
  return (
    <section className="sec" id="origins" aria-labelledby="origins-title">
      <div className="wrap">
        <div className="sec-head center reveal">
          <span className="eyebrow">Origins</span>
          <h2 id="origins-title">It began at 30,000 feet, with a pillow and a pen</h2>
        </div>
        <div className="origins">
          <div className="story reveal">
            {originsDraftNote && (
              <p className="draft-note">
                <b>Draft</b>
                <span>{originsDraftNote}</span>
              </p>
            )}
            <p className="lead">
              Mimoland did not begin as a business plan. It began in the cabin
              of an aircraft, with a distressed child and a crew member who knew
              how to help.
            </p>
            <p>
              In 2014, Jasna Dragojević drew a face onto an airline pillow to
              comfort a distressed child during a flight. The child stopped
              crying. The pillow became a character, the character became a
              story, and the story became a world.
            </p>
            <p>
              That first Mimo — crafted from an in-flight pillow — is still the
              heart of everything: the idea that the object a child already
              holds on a plane can become the friend that carries them through
              it.
            </p>
            <p>
              A decade later, Mimoland is a published book, a workshop programme
              brought to schools and libraries, a theatre show, a merchandise
              line and an award-winning animated film — with the same belief
              underneath. A child’s first flight should inspire a lifelong love
              of the sky, not a future fear of flying.
            </p>
          </div>
          <div className="orig-art reveal" data-delay="1">
            <figure>
              <span className="plate">
                <Img
                  name="origins-jasna-uniform"
                  alt="Jasna in cabin crew uniform holding the first Mimo"
                  sizes="(max-width: 900px) 40vw, 300px"
                />
              </span>
              <figcaption>
                Jasna in uniform with the very first Mimo, on board.
              </figcaption>
            </figure>
            <figure className="b">
              <span className="plate">
                <Img
                  name="origins-first-mimo"
                  alt="The first Mimo, made from an in-flight pillow in 2014"
                  sizes="(max-width: 900px) 32vw, 230px"
                />
              </span>
              <figcaption>The original Mimo — an in-flight pillow, 2014.</figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
