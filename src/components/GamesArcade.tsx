import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { GAMES, gameById } from '../data/games';
import { GAME_HUBS } from '../data/site';
import { burst } from '../lib/juice';
import { useReveal } from '../lib/useReveal';
import { Split } from './Split';

/* The games section. The splash card at the top wears the selected game's
 * branding from the Gurpy Games site: its colours, logo, tagline, screen and
 * floating sprites. The reel below picks which game that is, by hand or by
 * spinning. */

const LOOPS = 7;
const MIDDLE = 3;
const N = GAMES.length;

export function GamesArcade({ still, gameId, onPick }: {
  still: boolean;
  gameId: string;
  onPick: (id: string) => void;
}) {
  const game = gameById(gameId);
  const index = GAMES.indexOf(game);
  const viewport = useRef<HTMLDivElement>(null);
  const reel = useRef<HTMLDivElement>(null);
  const title = useReveal<HTMLHeadingElement>();
  const [pos, setPos] = useState(MIDDLE * N + index);
  const [spinning, setSpinning] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [offset, setOffset] = useState(0);

  // Follow selections made elsewhere (the hero orbit) by adjusting during render.
  const [seen, setSeen] = useState(index);
  if (index !== seen && !spinning) {
    setSeen(index);
    if (pos % N !== index) setPos(MIDDLE * N + index);
  }

  const measure = useCallback(() => {
    const vp = viewport.current;
    const first = reel.current?.children[0] as HTMLElement | undefined;
    const second = reel.current?.children[1] as HTMLElement | undefined;
    if (!vp || !first || !second) return;
    const step = second.offsetLeft - first.offsetLeft;
    setOffset(vp.clientWidth / 2 - (pos * step + first.offsetWidth / 2));
  }, [pos]);
  useLayoutEffect(measure, [measure]);
  const measureRef = useRef(measure);
  useEffect(() => { measureRef.current = measure; }, [measure]);
  useEffect(() => {
    let width = viewport.current?.clientWidth ?? 0;
    const ro = new ResizeObserver(() => {
      const next = viewport.current?.clientWidth ?? 0;
      if (next === width) return;
      width = next;
      setAnimate(false);
      measureRef.current();
    });
    if (viewport.current) ro.observe(viewport.current);
    return () => ro.disconnect();
  }, []);

  const spin = () => {
    if (spinning) return;
    let target = index;
    while (target === index) target = Math.floor(Math.random() * N);
    if (still) { onPick(GAMES[target].id); return; }
    const base = MIDDLE * N + index;
    const forward = ((target - index + N) % N) + N * 2;
    setAnimate(true);
    setSpinning(true);
    setPos(base + forward);
  };

  // After any animated move, hop back to the middle copy so the reel never runs out.
  const settle = () => {
    if (!animate) return;
    setAnimate(false);
    setPos(MIDDLE * N + (pos % N));
    if (!spinning) return;
    const won = GAMES[pos % N];
    setSpinning(false);
    onPick(won.id);
    // The reel lands with a burst in the winner's own colours.
    const r = viewport.current?.getBoundingClientRect();
    if (r) burst(r.left + r.width / 2, r.top + 26, [won.theme.a, won.theme.b, '#fffaf0'], 30, 1.35);
  };

  const pickCard = (at: number) => {
    if (spinning) return;
    setAnimate(!still);
    setPos(still ? MIDDLE * N + (at % N) : at);
    onPick(GAMES[at % N].id);
  };

  // Floaters drift toward the pointer by their depth, as on the Gurpy site.
  const parallax = (e: PointerEvent<HTMLDivElement>) => {
    if (still || e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
    e.currentTarget.style.setProperty('--my', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
  };

  const theme = { '--g-bg': game.theme.bg, '--g-a': game.theme.a, '--g-b': game.theme.b } as CSSProperties;

  return (
    <section className="world world-games" id="games" aria-labelledby="games-title">
      <div className="games-head">
        <p className="kicker">Also, I make games</p>
        <h2 className="games-title" id="games-title" ref={title}>
          <span className="sr-only">Weird games for curious thumbs.</span>
          <span aria-hidden="true"><Split text="Weird games for curious thumbs." /></span>
        </h2>
        <p className="games-lede">
          Eleven browser games and counting, all free to play right now.
          <span className="only-wide"> Pick one below and it takes over the stage.</span>
        </p>
      </div>

      <article className="splash" style={theme} aria-labelledby="splash-title" data-frame={game.frame}>
        <div className="splash-inner" key={game.id}>
          <div className="splash-copy">
            <span className="splash-kicker">{game.kicker}</span>
            <h3 id="splash-title" className="splash-title" data-logo={game.logo ? 'true' : undefined}>
              {game.logo
                ? <img src={game.logo.src} alt={game.logo.alt} width={game.logo.w} height={game.logo.h} />
                : game.title}
            </h3>
            <p className="splash-hook">
              {game.hook.map((part, i) => <span key={i}>{part} </span>)}
            </p>
            <p className="splash-desc">{game.description}</p>
            <a className="splash-play" href={game.url} target="_blank" rel="noopener noreferrer">
              {game.cta} <span aria-hidden="true">&#8599;</span>
            </a>
            {(game.stats.length > 0 || game.chips.length > 0) && (
              <ul className="splash-chips">
                {game.stats.length
                  ? game.stats.map(([v, t]) => <li key={t}><strong>{v}</strong> {t}</li>)
                  : game.chips.map((c) => <li key={c}>{c}</li>)}
              </ul>
            )}
          </div>
          <div className="splash-stage" onPointerMove={parallax} aria-hidden="true">
            <div className="splash-glow" />
            {game.frame === 'browser' ? (
              <figure className="splash-device splash-browser">
                <div className="splash-bar"><i /><i /><i /><span>{game.host}</span></div>
                <img src={game.shot.src} alt="" width={game.shot.w} height={game.shot.h} />
              </figure>
            ) : (
              <figure className="splash-device splash-phone">
                <img src={game.shot.src} alt="" width={game.shot.w} height={game.shot.h} />
              </figure>
            )}
            {game.floaters.map((f, i) => (
              <div
                key={i}
                className="splash-floater"
                data-px={f.pixel || undefined}
                style={{
                  '--x': `${f.x}%`, '--y': `${f.y}%`, '--w': `${f.size}%`, '--r': `${f.r}deg`,
                  '--depth': f.depth, '--speed': `${f.speed}s`, '--i': i,
                } as CSSProperties}
              >
                <img src={f.src} alt="" />
              </div>
            ))}
          </div>
        </div>
      </article>

      <div className="roulette">
        <div className="roulette-head">
          <h3>Pick a game, or spin for one.</h3>
          <button type="button" className="chunky-btn chunky-orange" onClick={spin} disabled={spinning}>
            {spinning ? 'Spinning…' : 'Spin the reel'}
          </button>
        </div>
        <div className="reel-window" ref={viewport} data-spinning={spinning || undefined}>
          <div
            className="reel"
            ref={reel}
            style={{
              transform: `translate3d(${offset}px,0,0)`,
              transition: animate ? `transform ${spinning ? '2.6s cubic-bezier(.1,.75,.12,1)' : '.45s cubic-bezier(.2,.9,.3,1)'}` : 'none',
            }}
            onTransitionEnd={(e) => { if (e.target === e.currentTarget) settle(); }}
          >
            {Array.from({ length: LOOPS }, (_, loop) =>
              GAMES.map((g, i) => {
                const at = loop * N + i;
                const live = loop === MIDDLE;
                return (
                  <button
                    key={`${loop}-${g.id}`}
                    type="button"
                    className="reel-card"
                    style={{ '--g-a': g.theme.a } as CSSProperties}
                    data-current={at === pos && !spinning ? 'true' : undefined}
                    tabIndex={live ? 0 : -1}
                    aria-hidden={live ? undefined : true}
                    aria-pressed={live ? g.id === game.id : undefined}
                    aria-label={`Show ${g.title}, ${g.tag}`}
                    onClick={() => pickCard(at)}
                  >
                    <img src={g.thumb.src} alt="" width="480" height="300" loading="lazy" draggable={false} />
                    <span className="reel-name">{g.title}</span>
                    <span className="reel-genre">{g.tag}</span>
                  </button>
                );
              }),
            )}
          </div>
          <div className="reel-pointer" aria-hidden="true" />
        </div>
      </div>

      <div className="game-hubs">
        {GAME_HUBS.map((h) => (
          <a key={h.id} className="game-hub" href={h.url} target="_blank" rel="noopener noreferrer">
            <strong>{h.title}</strong>
            <span>{h.line}</span>
            <span className="game-hub-go" aria-hidden="true">&#8599;</span>
          </a>
        ))}
      </div>
    </section>
  );
}
