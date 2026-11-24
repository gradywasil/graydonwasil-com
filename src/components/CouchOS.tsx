import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { COUCH, COUCH_TITLES } from '../data/couch-os';
import { burst } from '../lib/juice';
import { useReveal } from '../lib/useReveal';
import { Split } from './Split';

/* COUCH·OS: my next big project, at the seam between the apps and the games. Its pitch is a
 * TV and a sofa full of phones, so the section is both, each doing its job:
 *
 *  - The TV is the console, with the console's own status bar (eight player slots and a room
 *    code) and the title on screen lighting the wall behind it. It surfs its real library by
 *    itself until someone touches it, like a console's attract mode.
 *  - Your phone is the controller: a pad in the console's own controller style, with a player
 *    light. The D-pad changes channel, A plays (the console's launch, then a real way in), B goes
 *    back, and Spin is the console's own Mystery Spin, which lands on a random game.
 *  - As the section arrives, players join: the slots light up in the console's controller
 *    colours, one phone at a time, each with a toast as the console shows them.
 *
 * Keyboard: arrows browse, Enter or A plays, Escape or B goes back, S spins. */

const N = COUCH_TITLES.length;
const ch = (i: number) => String(i + 1).padStart(2, '0');
/** How long attract mode stays on a channel. */
const SURF_MS = 5000;
/** The console's controller lights, player one to eight (from its pairing screen). */
const PLAYERS = ['#3ba6d4', '#e0647a', '#3fbf6a', '#e0b62a', '#8a7cf0', '#e08a42', '#aab3bb', '#c46be0'];
/** How many phones join while the section is on screen (you are player one). */
const JOINING = 6;
const ROOM = 'GRDY';

type Launch = 'idle' | 'loading' | 'ready';

export function CouchOS({ still }: { still: boolean }) {
  const [at, setAt] = useState(0);
  const [touched, setTouched] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [launch, setLaunch] = useState<Launch>('idle');
  const [joined, setJoined] = useState(still ? JOINING : 0);
  const [toasts, setToasts] = useState<number[]>([]);
  /** The pad's light flashes with each press, as the real one answers a button. */
  const [blink, setBlink] = useState(0);
  /** On screen: only then does the TV's picture move (and fetch its loop). */
  const [onScreen, setOnScreen] = useState(false);
  /** Which title's loop is playing on the TV, so it can cover the still. */
  const [moving, setMoving] = useState<string | null>(null);
  /** The rail thumbnail under the mouse, which plays its own loop. */
  const [peek, setPeek] = useState<string | null>(null);
  const warmed = useRef(new Set<string>());
  const video = useRef<HTMLVideoElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const title = useReveal<HTMLHeadingElement>();
  const game = COUCH_TITLES[at];

  const later = useCallback((fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); }, []);
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  // Attract mode: it surfs by itself while it is on screen and nobody has touched it.
  useEffect(() => {
    const el = stage.current;
    if (still || touched || !el) return;
    let timer = 0;
    const io = new IntersectionObserver((entries) => {
      window.clearInterval(timer);
      if (entries[entries.length - 1].isIntersecting) timer = window.setInterval(() => setAt((a) => (a + 1) % N), SURF_MS);
    }, { threshold: 0.5 });
    io.observe(el);
    return () => { io.disconnect(); window.clearInterval(timer); };
  }, [still, touched]);

  useEffect(() => {
    const el = stage.current;
    if (still || !el) return;
    const io = new IntersectionObserver((entries) => setOnScreen(entries[entries.length - 1].isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, [still]);
  // The loop plays while the TV is on screen and rests when it is not.
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (onScreen) void v.play().catch(() => { /* not allowed (Low Power Mode): the still stays */ });
    else v.pause();
  }, [onScreen, at, spinning]);

  // Once a loop plays, fetch the next channel's quietly, so surfing lands straight on motion.
  useEffect(() => {
    if (moving !== game.id) return;
    const next = COUCH_TITLES[(at + 1) % N].preview;
    if (warmed.current.has(next)) return;
    warmed.current.add(next);
    void fetch(next, { priority: 'low' } as RequestInit).catch(() => warmed.current.delete(next));
  }, [moving, game.id, at]);

  // Players join when the console first comes on screen: one phone at a time.
  useEffect(() => {
    const el = stage.current;
    if (still || !el) return;
    const io = new IntersectionObserver((entries) => {
      if (!entries[entries.length - 1].isIntersecting) return;
      io.disconnect();
      for (let p = 1; p <= JOINING; p++) {
        later(() => {
          setJoined((j) => Math.max(j, p));
          setToasts((t) => [...t, p]);
          later(() => setToasts((t) => t.filter((x) => x !== p)), 2400);
        }, 500 + p * 700);
      }
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [still, later]);

  const press = () => { setTouched(true); setBlink((b) => b + 1); setJoined((j) => Math.max(j, 1)); };
  const tune = (i: number) => {
    if (spinning) return;
    press();
    setLaunch('idle');
    setAt(((i % N) + N) % N);
  };
  const back = () => { press(); setLaunch('idle'); };

  const play = () => {
    if (spinning) return;
    press();
    if (launch !== 'idle') return;
    setLaunch('loading');
    later(() => setLaunch((l) => (l === 'loading' ? 'ready' : l)), still ? 0 : 1100);
  };

  /** The console's Mystery Spin: the channels race past, slow down, and stop on one. */
  const spin = () => {
    if (spinning) return;
    press();
    setLaunch('idle');
    const land = (at + 3 + Math.floor(Math.random() * (N - 3))) % N;
    const steps = still ? 0 : N + ((land - at + N) % N);
    const finish = () => {
      setSpinning(false);
      const r = screen.current?.getBoundingClientRect();
      if (r && !still) {
        const c = COUCH_TITLES[land].colour;
        burst(r.left + r.width / 2, r.top + r.height / 2, [c, c, '#b5ff2a', '#ffb800', '#22d3ee'], 26, 1.2);
      }
    };
    if (!steps) { setAt(land); finish(); return; }
    setSpinning(true);
    let t = 0;
    for (let k = 1; k <= steps; k++) {
      // Fast at first, then each tick a little longer, like a wheel running down.
      t += 45 + Math.pow(k / steps, 2.4) * 320;
      later(() => setAt((a) => (a + 1) % N), t);
    }
    later(finish, t + 60);
  };

  const onKey = (e: KeyboardEvent) => {
    if ((e.target as HTMLElement).tagName === 'A') return;
    const k = e.key.toLowerCase();
    if (k === 'arrowright' || k === 'arrowdown') tune(at + 1);
    else if (k === 'arrowleft' || k === 'arrowup') tune(at - 1);
    else if (k === 'a') play();
    else if (k === 'escape' || k === 'b') back();
    else if (k === 's') spin();
    else return;
    e.preventDefault();
  };

  return (
    <section
      className="world world-couch"
      id="couch-os"
      aria-labelledby="couch-title"
      data-spinning={spinning ? '' : undefined}
      style={{ '--title': game.colour, '--me': PLAYERS[0] } as CSSProperties}
    >
      <div className="couch-grid" ref={stage} onKeyDown={onKey}>
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
            <span className="only-wide"> Up to eight phones pair as wireless pads, or one phone plays all twelve games on its own.</span>
          </p>
        </div>

        {/* The TV. */}
        <div className="couch-tv" data-launch={launch} role="group" aria-roledescription="carousel" aria-label="COUCH·OS game library">
          <div className="couch-osbar" aria-hidden="true">
            <span className="couch-osbar-mark"><i /><i /><i /><i /></span>
            <ol className="couch-slots">
              {PLAYERS.map((c, p) => (
                <li key={p} data-on={p < joined ? '' : undefined} style={{ '--p': c } as CSSProperties}>{p + 1}</li>
              ))}
            </ol>
            <span className="couch-room"><small>Room</small>{ROOM}</span>
          </div>

          <div className="couch-screen" ref={screen}>
            <div className="couch-picture" key={game.id} data-moving={moving === game.id ? '' : undefined}>
              <img src={game.cover} alt={`${game.name}, from the COUCH·OS library`} width="560" height="323" />
              {/* The cover moving, over the still once it plays. Not while spinning: the channels go by too fast to load. */}
              {!still && !spinning && onScreen && (
                <video
                  ref={video}
                  src={game.preview}
                  muted
                  loop
                  playsInline
                  autoPlay
                  preload="auto"
                  aria-hidden="true"
                  onPlaying={() => setMoving(game.id)}
                />
              )}
            </div>
            <span className="couch-osd" key={`osd-${at}`} aria-hidden="true">{spinning ? '✦ SPIN' : `CH ${ch(at)}`}</span>
            <p className="couch-press" aria-hidden="true"><span className="couch-a">A</span>Press to play</p>
            {launch !== 'idle' && (
              <div className="couch-launch" aria-live="polite">
                {launch === 'loading' ? (
                  <p className="couch-loading">Loading {game.name}<i className="couch-loadbar" /></p>
                ) : (
                  <div className="couch-ready">
                    <p className="couch-ready-count">{Math.max(joined, 1)} players ready</p>
                    <p className="couch-ready-name">{game.name}</p>
                    <a className="couch-ready-go" href={COUCH.url} target="_blank" rel="noopener noreferrer">
                      Play it for real<span className="sr-only"> on COUCH·OS (opens in a new tab)</span> <span aria-hidden="true">↗</span>
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          <ul className="couch-toasts" aria-hidden="true">
            {toasts.map((p) => (
              <li key={p} style={{ '--p': PLAYERS[p] } as CSSProperties}><i />P{p + 1} joined</li>
            ))}
          </ul>

          <div className="couch-hints">
            <span aria-hidden="true"><i className="couch-cross" /> Browse</span>
            <span aria-hidden="true"><b className="couch-a">A</b> Play</span>
            <button type="button" className="couch-spin" onClick={spin} disabled={spinning}>✦ Mystery spin</button>
          </div>
        </div>

        {/* The phone in your hand, as the controller. */}
        <div className="couch-pad" role="group" aria-label="Your phone, as a COUCH·OS controller">
          <span className="couch-pad-light" key={blink} aria-hidden="true" />
          <div className="couch-pad-dpad">
            <button type="button" className="couch-pad-dir" data-dir="up" aria-label="Previous game" onClick={() => tune(at - 1)} tabIndex={-1} />
            <button type="button" className="couch-pad-dir" data-dir="left" aria-label="Previous game" onClick={() => tune(at - 1)} />
            <button type="button" className="couch-pad-dir" data-dir="right" aria-label="Next game" onClick={() => tune(at + 1)} />
            <button type="button" className="couch-pad-dir" data-dir="down" aria-label="Next game" onClick={() => tune(at + 1)} tabIndex={-1} />
            <i className="couch-pad-hub" aria-hidden="true" />
          </div>
          <div className="couch-pad-mid">
            <p className="couch-pad-me" aria-hidden="true"><b>P1</b>You<small>Room {ROOM}</small></p>
            <p className="couch-pad-count" aria-hidden="true">{ch(at)} / {N}</p>
            <button type="button" className="couch-pad-spin" onClick={spin} disabled={spinning} aria-label="Mystery spin">✦ Spin</button>
          </div>
          <div className="couch-pad-ab">
            <button type="button" className="couch-pad-btn" data-b="b" onClick={back} aria-label="Back">B</button>
            <button type="button" className="couch-pad-btn" data-b="a" onClick={play} aria-label={`Play ${game.name}`}>A</button>
          </div>
        </div>

        <div className="couch-info" aria-live={touched ? 'polite' : 'off'}>
          <p className="couch-tags"><b>{game.kind}</b><span>{game.players}</span></p>
          <h3>{game.name}</h3>
          <p className="couch-blurb">{game.blurb}</p>
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
                onPointerEnter={(e) => e.pointerType === 'mouse' && setPeek(g.id)}
                onPointerLeave={() => setPeek((p) => (p === g.id ? null : p))}
              >
                <img src={g.cover} alt="" width="112" height="65" loading="lazy" />
                {peek === g.id && !still && (
                  <video src={g.preview} muted loop playsInline autoPlay aria-hidden="true" onPlaying={(e) => e.currentTarget.setAttribute('data-on', '')} />
                )}
              </button>
            </li>
          ))}
        </ol>

        <p className="couch-go">
          <a className="couch-cta" href={COUCH.url} target="_blank" rel="noopener noreferrer">
            <span className="couch-cta-phone">Play all 12 on this phone</span>
            <span className="couch-cta-tv">Open COUCH·OS on your TV</span>
            <span className="sr-only"> (opens in a new tab)</span>
            <span aria-hidden="true">↗</span>
          </a>
        </p>
      </div>
    </section>
  );
}
