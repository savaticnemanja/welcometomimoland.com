import { BookAside } from "@/components/book-aside";
import { Icon } from "@/components/icons";
import { book, site } from "@/content/site";

export function Book() {
  return (
    <section className="sec dark book-sec" id="book" aria-labelledby="book-title">
      <div className="wrap">
        <div className="book">
          <div className="sec-head center book-head reveal">
            <span className="eyebrow book-rule">The Foundational Book</span>
            <h2 id="book-title">Mimoland by the Flying Fairy</h2>
            <p>The literary heart of the Mimoland universe.</p>
          </div>

          <BookAside />

          <div className="book-body">
            <div className="book-story reveal">
              {book.story.map((p) => (
                <p key={p.slice(0, 32)}>{p}</p>
              ))}
            </div>

            <h3 className="book-rule book-values-h reveal">A Story to Love, Values to Grow</h3>
            <ul className="book-values reveal">
              {book.values.map((v) => (
                <li key={v.icon}>
                  <span className="ico">
                    <Icon name={v.icon} />
                  </span>
                  <p>{v.p}</p>
                </li>
              ))}
            </ul>

            {site.welcomePack && (
              <div className="book-gift reveal">
                <span className="ico">
                  <Icon name="merchandising" />
                </span>
                <h3>A Gift from Mimoland</h3>
                <p>{book.gift}</p>
                <a className="btn btn-gold" href={site.welcomePack} download>
                  <Icon name="download" />
                  Download Your Free Welcome Pack
                  <span className="sr-only"> (PDF, 2 MB)</span>
                </a>
              </div>
            )}

            <div className="book-next reveal">
              <span className="ico">
                <Icon name="publishing" />
              </span>
              <div>
                <h3>The Journey Continues</h3>
                <p>{book.next}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
