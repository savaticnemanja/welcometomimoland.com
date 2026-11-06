import { BookAside } from "@/components/book-aside";
import { Icon } from "@/components/icons";
import { book, site } from "@/content/site";

// The winged heart over the kicker — the Flying Fairy's badge.
function WingedHeart() {
  const wing = (
    <>
      <path d="M25.4 11.6C19.8 9.6 12.4 10 4 5.2c3.6 5 11.2 8.3 20.6 8.6z" />
      <path d="M25 15.2c-5 .2-10.6.2-16.8-2.6 3.6 3.8 9.4 5.6 16.2 5.1z" />
      <path d="M25.6 18.6c-3.7.9-7.6 1.6-12 .7 2.8 2.4 6.6 3.3 11.4 1.9z" />
    </>
  );
  return (
    <svg className="book-orn" viewBox="0 0 64 26" fill="currentColor" aria-hidden="true">
      {wing}
      <g transform="matrix(-1 0 0 1 64 0)">{wing}</g>
      <path d="M32 24.4c-4.3-3-7.4-5.8-7.4-9.2a3.9 3.9 0 0 1 7.4-1.7 3.9 3.9 0 0 1 7.4 1.7c0 3.4-3.1 6.2-7.4 9.2z" />
    </svg>
  );
}

export function Book() {
  return (
    <section className="sec dark book-sec" id="book" aria-labelledby="book-title">
      <div className="wrap">
        <div className="book">
          <div className="book-head reveal">
            <WingedHeart />
            <span className="eyebrow book-rule">The Foundational Book</span>
            <h2 id="book-title">Mimoland by the Flying Fairy</h2>
            <p className="book-tag">The literary heart of the Mimoland universe.</p>
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
                  <Icon name={v.icon} />
                  <p>{v.p}</p>
                </li>
              ))}
            </ul>

            {site.welcomePack && (
              <div className="book-gift reveal">
                <span className="gift-ico">
                  <Icon name="merchandising" />
                </span>
                <h3>A Gift from Mimoland</h3>
                <p>{book.gift}</p>
                <a className="btn btn-gold" href={site.welcomePack} download>
                  <Icon name="download" />
                  <span>
                    Download your free welcome pack
                    <span className="sr-only"> (PDF, 2 MB)</span>
                  </span>
                </a>
              </div>
            )}

            <div className="book-next reveal">
              <Icon name="publishing" />
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
