"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Brand } from "@/components/brand";

/* ------------------------------------------------------------------ types */

type Period = {
  visitors: number;
  pageviews: number;
  engagedRate: number;
  medianSeconds: number;
  deckRequests: number;
  conversion: number;
};
type Row = { name: string; visitors: number };
type Stats = {
  range: { from: string; to: string; days: number };
  current: Period;
  previous: Period;
  series: { day: string; visitors: number; pageviews: number; deck: number }[];
  sections: { id: string; visits: number }[];
  actions: Record<string, number>;
  outbound: Row[];
  sources: (Row & { deck: number })[];
  campaigns: Row[];
  countries: Row[];
  devices: Row[];
  browsers: Row[];
  pages: Row[];
  live: number;
};

const RANGES = [
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
  { days: 365, label: "12 months" },
] as const;

/** The page's sections, top to bottom, as a visitor would name them. */
const SECTION_NAMES: Record<string, string> = {
  top: "Hero",
  opportunity: "The opportunity",
  origins: "Origins",
  film: "The film",
  world: "Characters",
  ecosystem: "Ecosystem",
  book: "The book",
  partners: "Partners",
  impact: "Impact",
  traction: "Recognition",
  ip: "IP slate",
  vision: "Vision",
  team: "Team",
  connect: "Deck request",
};

const ACTIONS: { key: string; label: string }[] = [
  { key: "film_trailer", label: "Film trailer played" },
  { key: "book_trailer", label: "Book trailer played" },
  { key: "look_inside", label: "Look Inside opened" },
  { key: "welcome_pack", label: "Welcome pack downloaded" },
  { key: "gallery_open", label: "Gallery photo opened" },
];

/* ---------------------------------------------------------------- helpers */

const nf = new Intl.NumberFormat("en-GB");
const pct = (x: number, digits = 0) => `${(x * 100).toFixed(digits)}%`;
const duration = (s: number) => (s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`);
let regionNames: Intl.DisplayNames | null = null;
const country = (code: string) => {
  if (!code) return "Unknown";
  try {
    regionNames ??= new Intl.DisplayNames(["en"], { type: "region" });
    return regionNames.of(code) ?? code;
  } catch {
    return code;
  }
};
const flag = (code: string) =>
  /^[A-Z]{2}$/.test(code) ? String.fromCodePoint(...[...code].map((c) => 0x1f1a5 + c.charCodeAt(0))) : "🌐";

/** Change against the previous period, as the card shows it. */
function delta(now: number, before: number): { text: string; tone: "up" | "down" | "flat" } | null {
  if (!before && !now) return null;
  if (!before) return { text: "new", tone: "up" };
  const d = (now - before) / before;
  if (Math.abs(d) < 0.005) return { text: "±0%", tone: "flat" };
  return { text: `${d > 0 ? "+" : "−"}${Math.abs(d * 100).toFixed(Math.abs(d) < 0.1 ? 1 : 0)}%`, tone: d > 0 ? "up" : "down" };
}

/** Days for a week or a month, so 90 days is 13 bars and a year is 12. */
function bucket(series: Stats["series"], days: number) {
  if (days <= 31) return series.map((s) => ({ ...s, label: s.day }));
  const by = days <= 120 ? 7 : 0;
  const out: { label: string; day: string; visitors: number; pageviews: number; deck: number }[] = [];
  for (const s of series) {
    const key = by ? series[Math.floor(series.indexOf(s) / by) * by].day : s.day.slice(0, 7);
    const last = out[out.length - 1];
    if (last && last.day === key) {
      last.visitors += s.visitors;
      last.pageviews += s.pageviews;
      last.deck += s.deck;
    } else out.push({ label: key, day: key, visitors: s.visitors, pageviews: s.pageviews, deck: s.deck });
  }
  return out;
}

const shortDate = (d: string) =>
  d.length === 7
    ? new Date(`${d}-01T00:00:00Z`).toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" })
    : new Date(`${d}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

async function api<T>(path: string, init?: RequestInit): Promise<{ status: number; body: T & { ok: boolean; error?: string } }> {
  const res = await fetch(path, {
    ...init,
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", Accept: "application/json", ...init?.headers },
  });
  const body = await res.json().catch(() => ({ ok: false, error: `The server answered ${res.status}.` }));
  return { status: res.status, body };
}

/* ------------------------------------------------------------------- app */

export function AdminApp() {
  const [state, setState] = useState<"loading" | "signed-out" | "in" | "unavailable">("loading");
  const [notice, setNotice] = useState<string | null>(null);
  const [reporting, setReporting] = useState(false);

  useEffect(() => {
    void api<{ reporting: boolean }>("/api/admin/session").then(({ status, body }) => {
      if (status === 200) {
        setReporting(body.reporting);
        setState("in");
      } else if (status === 401) setState("signed-out");
      else {
        setNotice(body.error ?? "The dashboard is not reachable just now.");
        setState("unavailable");
      }
    }).catch(() => {
      setNotice("The dashboard is not reachable just now.");
      setState("unavailable");
    });
  }, []);

  if (state === "loading") return <div className="adm-shell adm-center" aria-busy="true" />;
  if (state === "unavailable") {
    return (
      <div className="adm-shell adm-center">
        <div className="adm-card adm-login">
          <Brand />
          <p className="adm-muted">{notice}</p>
        </div>
      </div>
    );
  }
  if (state === "signed-out") {
    return (
      <SignIn
        onIn={() => {
          void api<{ reporting: boolean }>("/api/admin/session").then(({ body }) => setReporting(!!body.reporting));
          setState("in");
        }}
      />
    );
  }
  return <Dashboard reporting={reporting} onSignOut={() => setState("signed-out")} />;
}

function SignIn({ onIn }: { onIn: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const password = String(new FormData(e.currentTarget).get("password") ?? "");
    try {
      const { status, body } = await api("/api/admin/login", { method: "POST", body: JSON.stringify({ password }) });
      if (status === 200) onIn();
      else setError(body.error ?? "That did not work.");
    } catch {
      setError("The dashboard is not reachable just now.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="adm-shell adm-center">
      <form className="adm-card adm-login" onSubmit={submit}>
        <Brand />
        <h1>Dashboard</h1>
        <label htmlFor="adm-password">Password</label>
        <input id="adm-password" name="password" type="password" autoComplete="current-password" required autoFocus />
        {error && <p className="adm-error" role="alert">{error}</p>}
        <button className="adm-btn adm-btn-primary" type="submit" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

function Dashboard({ reporting, onSignOut }: { reporting: boolean; onSignOut: () => void }) {
  const [days, setDays] = useState(30);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);

  const load = useCallback(async (d: number) => {
    setLoading(true);
    try {
      const { status, body } = await api<Stats>(`/api/admin/stats?days=${d}`);
      if (status === 401) return onSignOut();
      if (status !== 200) throw new Error(body.error);
      setStats(body);
      setError(null);
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : "The numbers did not load.");
    } finally {
      setLoading(false);
    }
  }, [onSignOut]);

  useEffect(() => {
    void load(days);
  }, [days, load]);

  const signOut = async () => {
    await api("/api/admin/logout", { method: "POST" }).catch(() => {});
    onSignOut();
  };

  return (
    <div className="adm-shell">
      {/* A div, not <header>: globals.css styles every header as the site's fixed bar. */}
      <div className="adm-bar">
        <div className="adm-wrap adm-bar-in">
          <a href="/" className="adm-brand" aria-label="Welcome to Mimoland — the site">
            <Brand />
          </a>
          <span className="adm-bar-title">Dashboard</span>
          <div className="adm-bar-actions">
            <button type="button" className="adm-btn adm-btn-ghost" onClick={() => setReportOpen(true)}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 21V4h11l-1 4h6v9h-8l1-4H4" /></svg>
              <span>Report<span className="adm-long"> a problem or suggestion</span></span>
            </button>
            <button type="button" className="adm-btn adm-btn-ghost" onClick={signOut}>Sign out</button>
          </div>
        </div>
      </div>

      <main className="adm-wrap adm-main" aria-busy={loading}>
        <div className="adm-head">
          <div>
            <h1>Visits</h1>
            {stats && (
              <p className="adm-muted">
                {shortDate(stats.range.from)} – {shortDate(stats.range.to)} · compared with the {stats.range.days === 365 ? "12 months" : `${stats.range.days} days`} before
                {stats.live > 0 && <span className="adm-live"><i aria-hidden="true" /> {stats.live} on the site now</span>}
              </p>
            )}
          </div>
          <div className="adm-seg" role="group" aria-label="Period">
            {RANGES.map((r) => (
              <button key={r.days} type="button" aria-pressed={days === r.days} onClick={() => setDays(r.days)}>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="adm-error adm-card" role="alert">{error}</p>}
        {stats && <Report stats={stats} />}
      </main>

      {reportOpen && <ReportDialog enabled={reporting} onClose={() => setReportOpen(false)} />}
    </div>
  );
}

/* ----------------------------------------------------------- the numbers */

function Report({ stats }: { stats: Stats }) {
  const { current: c, previous: p } = stats;
  const reachBase = Math.max(c.visitors, 1);
  const deckFunnel = [
    { label: "Reached the deck form", n: stats.sections.find((s) => s.id === "connect")?.visits ?? 0 },
    { label: "Started filling it in", n: stats.actions.deck_form_start ?? 0 },
    { label: "Sent a deck request", n: stats.actions.deck_request ?? 0 },
  ];
  const deviceTotal = stats.devices.reduce((a, d) => a + d.visitors, 0) || 1;

  return (
    <>
      <section className="adm-kpis" aria-label="Summary">
        <Kpi label="Visitors" value={nf.format(c.visitors)} d={delta(c.visitors, p.visitors)} hint="One person on one day" />
        <Kpi label="Page views" value={nf.format(c.pageviews)} d={delta(c.pageviews, p.pageviews)} />
        <Kpi label="Time on page" value={duration(c.medianSeconds)} d={delta(c.medianSeconds, p.medianSeconds)} hint="Median, while the page was visible" />
        <Kpi label="Engaged visits" value={pct(c.engagedRate)} d={delta(c.engagedRate, p.engagedRate)} hint="Stayed 10 s or read half the page" />
        <Kpi
          label="Deck requests"
          value={nf.format(c.deckRequests)}
          d={delta(c.deckRequests, p.deckRequests)}
          hint={c.visitors ? `${pct(c.conversion, 1)} of visitors` : undefined}
          accent
        />
      </section>

      <section className="adm-card adm-chart-card" aria-labelledby="adm-trend">
        <div className="adm-card-head">
          <h2 id="adm-trend">Visitors over time</h2>
          <span className="adm-legend">
            <i className="adm-dot adm-dot-visits" /> Visitors <i className="adm-dot adm-dot-deck" /> Deck requests
          </span>
        </div>
        <Chart series={bucket(stats.series, stats.range.days)} />
      </section>

      <div className="adm-grid">
        <section className="adm-card" aria-labelledby="adm-reach">
          <div className="adm-card-head">
            <h2 id="adm-reach">How far down the page</h2>
            <span className="adm-muted">Share of visitors who reached each section</span>
          </div>
          <ol className="adm-reach">
            {stats.sections.map((s) => (
              <li key={s.id}>
                <span>{SECTION_NAMES[s.id] ?? s.id}</span>
                <span className="adm-bar-track"><span style={{ width: pct(Math.min(1, s.visits / reachBase)) }} /></span>
                <b>{c.visitors ? pct(Math.min(1, s.visits / reachBase)) : "—"}</b>
              </li>
            ))}
          </ol>
        </section>

        <div className="adm-stack">
          <section className="adm-card" aria-labelledby="adm-funnel">
            <div className="adm-card-head"><h2 id="adm-funnel">Deck request funnel</h2></div>
            <ol className="adm-funnel">
              {deckFunnel.map((f, i) => (
                <li key={f.label}>
                  <b>{nf.format(f.n)}</b>
                  <span>{f.label}</span>
                  {i > 0 && deckFunnel[i - 1].n > 0 && <em>{pct(f.n / deckFunnel[i - 1].n)} of the step before</em>}
                </li>
              ))}
            </ol>
          </section>

          <section className="adm-card" aria-labelledby="adm-actions">
            <div className="adm-card-head">
              <h2 id="adm-actions">What visitors did</h2>
              <span className="adm-muted">Visits, each counted once</span>
            </div>
            <ul className="adm-list">
              {ACTIONS.map((a) => (
                <li key={a.key}>
                  <span>{a.label}</span>
                  <b>{nf.format(stats.actions[a.key] ?? 0)}</b>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <div className="adm-grid adm-grid-3">
        <section className="adm-card" aria-labelledby="adm-sources">
          <div className="adm-card-head"><h2 id="adm-sources">Where visitors came from</h2></div>
          <table className="adm-table">
            <thead><tr><th scope="col">Source</th><th scope="col">Visitors</th><th scope="col">Decks</th></tr></thead>
            <tbody>
              {stats.sources.length ? stats.sources.map((s) => (
                <tr key={s.name}><td>{s.name}</td><td>{nf.format(s.visitors)}</td><td>{s.deck ? nf.format(s.deck) : "—"}</td></tr>
              )) : <tr><td colSpan={3} className="adm-muted">No visits yet</td></tr>}
            </tbody>
          </table>
          {stats.campaigns.length > 0 && (
            <>
              <h3>Campaigns (utm_campaign)</h3>
              <Rows rows={stats.campaigns} />
            </>
          )}
        </section>

        <section className="adm-card" aria-labelledby="adm-countries">
          <div className="adm-card-head"><h2 id="adm-countries">Countries</h2></div>
          <Rows rows={stats.countries.map((r) => ({ ...r, name: `${flag(r.name)}  ${country(r.name)}` }))} total={c.visitors} />
        </section>

        <section className="adm-card" aria-labelledby="adm-devices">
          <div className="adm-card-head"><h2 id="adm-devices">Devices</h2></div>
          <div className="adm-split" aria-hidden="true">
            {stats.devices.map((d) => (
              <span key={d.name} className={`adm-split-${d.name}`} style={{ width: pct(d.visitors / deviceTotal) }} />
            ))}
          </div>
          <Rows rows={stats.devices.map((d) => ({ ...d, name: d.name[0].toUpperCase() + d.name.slice(1) }))} total={deviceTotal} />
          <h3>Browsers</h3>
          <Rows rows={stats.browsers} total={c.visitors} />
          {stats.outbound.length > 0 && (
            <>
              <h3>Links followed out</h3>
              <Rows rows={stats.outbound} />
            </>
          )}
        </section>
      </div>

      <p className="adm-foot adm-muted">
        Counted without cookies. A visitor is one browser on one day; nothing links days together and no IP address is stored.
        Visitors with Do Not Track or Global Privacy Control on are not counted.
      </p>
    </>
  );
}

function Kpi({ label, value, d, hint, accent }: { label: string; value: string; d: ReturnType<typeof delta>; hint?: string; accent?: boolean }) {
  return (
    <div className={`adm-card adm-kpi${accent ? " adm-kpi-accent" : ""}`}>
      <span className="adm-kpi-label">{label}</span>
      <span className="adm-kpi-value">{value}</span>
      <span className="adm-kpi-foot">
        {d && <span className={`adm-delta adm-delta-${d.tone}`}>{d.text}</span>}
        {hint && <span className="adm-muted">{hint}</span>}
      </span>
    </div>
  );
}

function Rows({ rows, total }: { rows: Row[]; total?: number }) {
  if (!rows.length) return <p className="adm-muted">No visits yet</p>;
  return (
    <ul className="adm-list">
      {rows.map((r) => (
        <li key={r.name}>
          <span>{r.name || "Unknown"}</span>
          <b>
            {nf.format(r.visitors)}
            {total ? <small> {pct(r.visitors / Math.max(total, 1))}</small> : null}
          </b>
        </li>
      ))}
    </ul>
  );
}

/** Bars for visitors, a gold dot over any bar with deck requests. Plain SVG, no chart library. */
function Chart({ series }: { series: ReturnType<typeof bucket> }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...series.map((s) => s.visitors));
  const W = 1000;
  const H = 220;
  const gap = series.length > 40 ? 2 : 6;
  const bw = (W - gap * (series.length - 1)) / series.length;
  const ticks = [0, Math.ceil(max / 2), max];
  const every = Math.ceil(series.length / 8);
  const active = hover === null ? null : series[hover];

  return (
    <div className="adm-chart">
      <svg viewBox={`0 0 ${W} ${H + 28}`} role="img" aria-label={`Visitors per ${series[0]?.label.length === 7 ? "month" : series.length <= 31 ? "day" : "week"}`} onMouseLeave={() => setHover(null)}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1="0" x2={W} y1={H - (t / max) * H} y2={H - (t / max) * H} className="adm-grid-line" />
          </g>
        ))}
        {series.map((s, i) => {
          const x = i * (bw + gap);
          const h = (s.visitors / max) * H;
          return (
            <g key={s.day} onMouseEnter={() => setHover(i)}>
              <rect x={x} y={0} width={bw + gap} height={H} fill="transparent" />
              <rect x={x} y={H - h} width={bw} height={Math.max(h, s.visitors ? 2 : 0)} rx={Math.min(4, bw / 2)} className={hover === i ? "adm-bar-on" : "adm-bar"} />
              {s.deck > 0 && <circle cx={x + bw / 2} cy={H - h - 10} r={5} className="adm-deck-dot" />}
              {i % every === 0 && (
                <text x={x + bw / 2} y={H + 20} textAnchor="middle" className="adm-axis">{shortDate(s.label)}</text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="adm-chart-y" aria-hidden="true">
        <span>{nf.format(max)}</span>
        <span>0</span>
      </div>
      <p className="adm-chart-tip" aria-live="polite">
        {active
          ? `${shortDate(active.label)}${active.label.length === 10 && series.length > 31 ? " week" : ""}: ${nf.format(active.visitors)} visitors · ${nf.format(active.pageviews)} page views${active.deck ? ` · ${active.deck} deck request${active.deck > 1 ? "s" : ""}` : ""}`
          : "Point at a bar for its numbers"}
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------- report */

function ReportDialog({ enabled, onClose }: { enabled: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [kind, setKind] = useState<"problem" | "idea">("problem");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const d = ref.current;
    d?.showModal();
    return () => d?.close();
  }, []);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const message = String(new FormData(e.currentTarget).get("message") ?? "");
    try {
      const { status, body } = await api("/api/admin/report", {
        method: "POST",
        body: JSON.stringify({ kind, message, path: location.pathname }),
      });
      if (status === 200) setSent(true);
      else setError(body.error ?? "That did not go through.");
    } catch {
      setError("That did not go through. Check the connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <dialog ref={ref} className="adm-dialog" onClose={onClose} aria-labelledby="adm-report-title">
      {sent ? (
        <div className="adm-dialog-body">
          <h2 id="adm-report-title">Thank you</h2>
          <p className="adm-muted">It is in the tracker. We will take it from there.</p>
          <div className="adm-dialog-actions">
            <button type="button" className="adm-btn adm-btn-primary" onClick={onClose} autoFocus>Close</button>
          </div>
        </div>
      ) : (
        <form className="adm-dialog-body" onSubmit={submit}>
          <h2 id="adm-report-title">Report a problem or suggestion</h2>
          {!enabled && <p className="adm-error">Reporting is not set up on the server yet (TRACKER_API_KEY).</p>}
          <div className="adm-seg adm-seg-full" role="radiogroup" aria-label="What is it">
            <button type="button" role="radio" aria-checked={kind === "problem"} onClick={() => setKind("problem")}>Something is wrong</button>
            <button type="button" role="radio" aria-checked={kind === "idea"} onClick={() => setKind("idea")}>A suggestion</button>
          </div>
          <label htmlFor="adm-report-message">{kind === "problem" ? "What happened, and where?" : "What would make it better?"}</label>
          <textarea id="adm-report-message" name="message" rows={6} required minLength={5} maxLength={4000} autoFocus />
          {error && <p className="adm-error" role="alert">{error}</p>}
          <div className="adm-dialog-actions">
            <button type="button" className="adm-btn adm-btn-ghost-dark" onClick={onClose}>Cancel</button>
            <button type="submit" className="adm-btn adm-btn-primary" disabled={busy || !enabled}>{busy ? "Sending…" : "Send"}</button>
          </div>
        </form>
      )}
    </dialog>
  );
}
