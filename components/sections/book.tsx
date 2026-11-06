import { BookAside } from "@/components/book-aside";
import { Icon } from "@/components/icons";
import { book, site } from "@/content/site";

export function Book() {
  return (
    <section className="sec dark book-sec" id="book" aria-labelledby="book-title">
      <div className="wrap">
        <div className="book">
          <div className="sec-head center book-head reveal">
            <span className="eyebrow">The Foundational Book</span>
            <h2 id="book-title">Mimoland by the Flying Fairy</h2>
            <p>The literary heart of the Mimoland universe.</p>
          </div>

          <BookAside />

          <div className="book-body">
            <p className="book-story reveal">{book.story}</p>

            <h3 className="book-values-h reveal">A Story to Love, Values to Grow</h3>
            <p className="book-values reveal">{book.values}</p>

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
              <span className="eyebrow">{book.next.kicker}</span>
              <h3>{book.next.title}</h3>
              <p>{book.next.p}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
