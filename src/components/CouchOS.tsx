import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { COUCH, COUCH_TITLES } from '../data/couch-os';
import { useReveal } from '../lib/useReveal';
import { Split } from './Split';

/* COUCH·OS: my next big project, at the seam between the apps and the games. It turns a
 * TV's browser into a console and everyone's phone into a controller, so the thing to
 * press here is the console's own: a TV you channel-surf through its library with
 * ◀ ▶ (or the arrow keys), the way its own home screen browses. Until someone touches
 * it, and while it is on screen, it surfs by itself like a console's attract mode. */

const N = COUCH_TITLES.length;
const ch = (i: number) => String(i + 1).padStart(2, '0');
/** How long attract mode stays on a channel. */
const SURF_MS = 3600;

export function CouchOS({ still }: { still: boolean }) {
  const [at, setAt] = useState(0);
  const [touched, setTouched] = useState(false);
  const tv = useRef<HTMLDivElement>(null);
  const title = useReveal<HTMLHeadingElement>();
  const game = COUCH_TITLES[at];

  useEffect(() => {
    const el = tv.current;
    if (still || touched || !el) return;
    let timer = 0;
    const io = new IntersectionObserver((entries) => {
      window.clearInterval(timer);
      if (entries[entries.length - 1].isIntersecting) timer = window.setInterval(() => setAt((a) => (a + 1) % N), SURF_MS);
    }, { threshold: 0.5 });
    io.observe(el);
    return () => { io.disconnect(); window.clearInterval(timer); };
  }, [still, touched]);

  const tune = (i: number) => { setTouched(true); setAt((i + N) % N); };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') { tune(at + 1); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { tune(at - 1); e.preventDefault(); }
  };

  return (
    <section
      className="world world-couch"
      id="couch-os"
      aria-labelledby="couch-title"
      style={{ '--title': game.colour } as CSSProperties}
    >
      <div className="couch-grid">
        <div className="couch-copy">
          <p className="couch-kicker">
            <img src={COUCH.icon} alt="" width="30" height="30" />
            <span>COUCH<b>·</b>OS</span>
            <span className="couch-next">Next up</span>
          </p>
          <h2 className="couch-title" id="couch-title" ref={title}>
            <span className="sr-only">Your TV is the console. Every phone is a controller.</span>
            <span aria-hidden="true"><Split text="Your TV is the console." /> <Split text="Every phone is a controller." at={19} word={5} /></span>
          </h2>
          <p className="couch-lede">
            A living-room arcade that runs in any browser.
            <span className="only-wide"> Twelve party games, retro emulation, and phones that pair as wireless pads, for up to eight on one couch.</span>
          </p>
        </div>

        <div
          className="couch-set"
          ref={tv}
          role="group"
          aria-roledescription="carousel"
          aria-label="COUCH·OS game library"
          onKeyDown={onKey}
        >
          <div className="couch-tv">
            <div className="couch-screen" key={game.id}>
              <img src={game.cover} alt={`${game.name}, from the COUCH·OS library`} width="560" height="323" />
              <span className="couch-osd" aria-hidden="true">CH {ch(at)}</span>
            </div>
            <i className="couch-bar" aria-hidden="true" />
          </div>

          <div className="couch-info" aria-live={touched ? 'polite' : 'off'}>
            <p className="couch-tags"><b>{game.kind}</b><span>{game.players}</span></p>
            <h3>{game.name}</h3>
            <p className="couch-blurb">{game.blurb}</p>
          </div>

          <div className="couch-pad">
            <button type="button" className="couch-btn" onClick={() => tune(at - 1)} aria-label="Previous game">
              <span aria-hidden="true">◀</span>
            </button>
            <span className="couch-count" aria-hidden="true">{ch(at)} / {N}</span>
            <button type="button" className="couch-btn" onClick={() => tune(at + 1)} aria-label="Next game">
              <span aria-hidden="true">▶</span>
            </button>
            <span className="couch-hint only-wide" aria-hidden="true"><i className="couch-dpad" /> Browse</span>
          </div>

          <ol className="couch-rail" aria-label="All twelve games">
            {COUCH_TITLES.map((g, i) => (
              <li key={g.id}>
                <button
                  type="button"
                  aria-label={g.name}
                  aria-current={i === at ? 'true' : undefined}
                  style={{ '--c': g.colour } as CSSProperties}
                  onClick={() => tune(i)}
                >
                  <img src={g.cover} alt="" width="112" height="65" loading="lazy" />
                </button>
              </li>
            ))}
          </ol>
        </div>

        <p className="couch-go">
          <a className="couch-cta" href={COUCH.url} target="_blank" rel="noopener noreferrer">
            Open COUCH·OS<span className="sr-only"> (opens in a new tab)</span>
            <span aria-hidden="true">↗</span>
          </a>
        </p>
      </div>
    </section>
  );
}
