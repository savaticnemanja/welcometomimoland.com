import { Img } from "@/components/img";
import { ipSlate, site } from "@/content/site";

export function Slate() {
  return (
    <section className="sec" id="ip" aria-labelledby="ip-title">
      <div className="wrap">
        <div className="sec-head center reveal">
          <span className="eyebrow">The IP in motion</span>
          <h2 id="ip-title">Beyond a single film — a universe with a slate</h2>
          <p>
            Assets already published, in production, and ready to launch across
            the ecosystem.
          </p>
        </div>
        <div className="slate-wrap">
          <div className="slate-shelf reveal">
            <a
              className="slate-item"
              href={site.bookUrl}
              target="_blank"
              rel="noopener"
            >
              <Img
                name="book-cover"
                alt="Mimoland by the Flying Fairy — the foundational book"
                sizes="(max-width: 980px) 170px, 208px"
              />
              <span className="cap">
                The foundational book
                <b>
                  Available on Amazon
                  <span aria-hidden="true"> →</span>
                </b>
              </span>
            </a>
            {site.imdb ? (
              <a
                className="slate-item"
                href={site.imdb}
                target="_blank"
                rel="noopener"
              >
                <Img
                  name="poster-first-flight"
                  alt="Mimoland: The First Flight — official film poster"
                  sizes="(max-width: 980px) 120px, 146px"
                />
                <span className="cap">
                  The film
                  <b>
                    View on IMDb
                    <span aria-hidden="true"> →</span>
                  </b>
                </span>
              </a>
            ) : null}
          </div>
          <ul className="ip-list reveal" data-delay="1">
            {ipSlate.map((row) => (
              <li className="ip-row" data-stage={row.stage} key={row.t}>
                <span className="t">{row.t}</span>
                <span className={`stage ${row.stage}`}>
                  <span className="sr-only">Status: </span>
                  {row.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
