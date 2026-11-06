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

          {/* Grid order is the mockup's: header, cover, story, then the
              buttons beside the two cards. */}
          <BookAside>
            <div className="book-body reveal">
              <p className="book-story">{book.story}</p>
              <h3 className="book-values-h">A Story to Love, Values to Grow</h3>
              <p className="book-values">{book.values}</p>
            </div>
          </BookAside>

          {site.welcomePack && (
            <div className="book-card book-gift reveal">
              <h3>A Gift from Mimoland</h3>
              <p>{book.gift}</p>
              <a className="btn btn-gold" href={site.welcomePack} download>
                <Icon name="download" />
                Download Your Free Welcome Pack
                <span className="sr-only"> (PDF, 2 MB)</span>
              </a>
            </div>
          )}

          <div className="book-card book-next reveal" data-delay="1">
            <span className="eyebrow">{book.next.kicker}</span>
            <h3>{book.next.title.replace(": ", ":\n")}</h3>
            <p>{book.next.p}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
