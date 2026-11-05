import { useEffect, useRef, useState } from 'react';
import { MORSE, ORBIT_ITEMS } from '../data/site';
import { GurpyFace, type GurpyMood } from './GurpyFace';
import { Orbit } from './Orbit';
import { PlayButton, PlayLogo } from './PlayButton';

const POKES = [
  "Hi! I'm Gurpy.",
  'Everything circling me is real. Pick one.',
  'Psst. Type g-u-r-p-y. Anywhere.',
  'Boop accepted.',
  'He made me too, technically.',
];
const TOUR_MS = 4200;

export function Hero({ still, onPickGame }: { still: boolean; onPickGame: (id: string) => void }) {
  const [selected, setSelected] = useState('morse');
  const [line, setLine] = useState('Everything circling me is real. Pick one.');
  const [mood, setMood] = useState<GurpyMood>('idle');
  const [touring, setTouring] = useState(!still);
  const poke = useRef(0);
  const moodTimer = useRef(0);
  const item = ORBIT_ITEMS.find((i) => i.id === selected) ?? ORBIT_ITEMS[0];

  const feel = (next: GurpyMood, ms: number) => {
    setMood(next);
    clearTimeout(moodTimer.current);
    moodTimer.current = window.setTimeout(() => setMood('idle'), ms);
  };

  const pick = (id: string, fromTour = false) => {
    if (!fromTour) setTouring(false);
    const next = ORBIT_ITEMS.find((i) => i.id === id);
    if (!next) return;
    setSelected(id);
    setLine(next.quip);
    feel('happy', 700);
  };

  // A slow guided tour until the visitor picks something themselves.
  useEffect(() => {
    if (!touring) return;
    const t = window.setInterval(() => {
      setSelected((cur) => {
        const i = ORBIT_ITEMS.findIndex((x) => x.id === cur);
        const next = ORBIT_ITEMS[(i + 1) % ORBIT_ITEMS.length];
        setLine(next.quip);
        return next.id;
      });
    }, TOUR_MS);
    return () => clearInterval(t);
  }, [touring]);

  const onPoke = () => {
    setTouring(false);
    setLine(POKES[poke.current++ % POKES.length]);
    feel('happy', 900);
  };

  return (
    <header className="hero" id="top">
      <div className="hero-copy">
        <p className="hero-kicker">Graydon Wasil &middot; Android &amp; web developer</p>
        <h1 className="hero-title">
          I build software you&rsquo;ll want to{' '}
          <span className="hero-play-with">
            play with.
            <svg viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden="true">
              <path d="M4 16 C 60 4, 110 22, 160 12 S 260 6, 296 14" />
            </svg>
          </span>
        </h1>
        <p className="hero-lede">
          Android apps, browser games, and the occasional weird experiment. My first app,{' '}
          <a href="#morse">Morse</a>, is almost on Google&nbsp;Play.
        </p>
        <div className="hero-ctas">
          <PlayButton href={MORSE.betaUrl} kicker="Get Morse early on" />
          <a className="chunky-btn chunky-ginger" href="#games">Play a game <span aria-hidden="true">&darr;</span></a>
        </div>
        <a className="hero-sticker" href="#morse">
          <PlayLogo className="kicker-logo" />
          Morse is in beta on Google Play <span aria-hidden="true">&rarr;</span>
        </a>
      </div>

      <div className="hero-stage">
        <Orbit
          items={ORBIT_ITEMS}
          selected={selected}
          onSelect={(id) => pick(id)}
          still={still}
          bubble={<p className="bubble" aria-live="polite">{line}</p>}
        >
          <button type="button" className="gurpy-btn" onClick={onPoke} aria-label="Poke Gurpy">
            <GurpyFace mood={mood} still={still} />
          </button>
        </Orbit>

        <div className="orbit-card" style={{ ['--accent' as string]: item.accent }} aria-live="polite">
          <img className="orbit-card-icon" src={item.icon} alt="" data-px={item.pixel || undefined} />
          <div className="orbit-card-body">
            <p className="orbit-card-status"><span className="dot" />{item.ring === 'apps' ? 'App' : 'Game'} &middot; {item.status}</p>
            <h2 className="orbit-card-name">{item.name}</h2>
            <p className="orbit-card-line">{item.line}</p>
          </div>
          <div className="orbit-card-actions">
            <a className="orbit-card-go" href={item.href} target="_blank" rel="noopener noreferrer">
              {item.play && <PlayLogo className="kicker-logo" />}
              {item.cta} <span aria-hidden="true">&#8599;</span>
            </a>
            <a
              className="orbit-card-more"
              href={`#${item.section}`}
              onClick={() => { if (item.ring === 'games') onPickGame(item.id); }}
            >
              {item.ring === 'games' ? 'See it below' : 'Try it below'} <span aria-hidden="true">&darr;</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
