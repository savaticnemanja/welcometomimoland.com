import { Icon } from "@/components/icons";
import { LaurelBranch } from "@/components/laurel";
import { media, mediaKinds, recognition } from "@/content/site";

export function Recognition() {
  return (
    <section className="sec dark" id="traction" aria-labelledby="traction-title">
      <div className="wrap">
        <div className="sec-head center reveal">
          <span className="eyebrow">Recognition &amp; Validation</span>
          <h2 id="traction-title">Backed by institutions, recognised by festivals</h2>
        </div>
        <ul className="logos">
          {recognition.map((r, i) => (
            <li className="reveal" data-delay={i % 4} key={`${r.name} ${r.note}`}>
              <a
                className="logo-chip"
                href={r.href}
                target="_blank"
                rel="noopener"
                aria-label={`${r.name} — ${r.note} (opens in a new tab)`}
              >
                <span
                  className={r.icon === "laurel" ? "logo-ico is-laurel" : "logo-ico"}
                  aria-hidden="true"
                >
                  {r.icon === "laurel" ? (
                    <>
                      <LaurelBranch side="left" />
                      <LaurelBranch side="right" />
                    </>
                  ) : (
                    <Icon name={r.icon} />
                  )}
                </span>
                <span className="logo-txt" aria-hidden="true">
                  <b>{r.name}</b>
                  <i>{r.note}</i>
                </span>
              </a>
            </li>
          ))}
        </ul>

        <div className="media reveal">
          <h3 className="media-lede">Featured in Media</h3>
          <div className="media-groups">
            {mediaKinds.map((g) => {
              const items = media.filter((m) => m.kind === g.kind);
              if (items.length === 0) return null;

              return (
                <div className="media-group" key={g.kind}>
                  <h4 className="media-kind">
                    <Icon name={g.icon} />
                    {g.label}
                  </h4>
                  <ul className="media-list">
                    {items.map((m) => (
                      <li key={m.name}>
                        <a
                          href={m.href}
                          target="_blank"
                          rel="noopener"
                          aria-label={`${m.name}${m.title ? ` — ${m.title}` : ""} (opens in a new tab)`}
                          title={m.title}
                        >
                          {m.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
