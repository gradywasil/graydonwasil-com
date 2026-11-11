import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import { gameById } from '../../data/games';
import gurpySrc from '../../assets/fun/gurpy.png';
import { GAME_HUBS, ORBIT_ITEMS, type OrbitItem } from '../../data/site';
import type { SkyLook } from '../HeroSky';
import { ItemActions } from './ItemActions';
import { LiveApp } from './LiveApps';
import { BARS } from './lyrics';

/* The hero's stage: a phone whose home screen is the work. The four apps sit
 * in the dock and the games fill the grid. It boots when the page loads.
 * Tapping an icon opens it the way a phone opens an app: the home screen
 * dives into the icon, the app grows out of it behind a launch screen of its
 * own, and then it runs (see LiveApps).
 *
 * Whatever is open takes over the page around the phone. The sky is dressed
 * for it (`lookFor`: its colours, and for some a whole restyling), and things
 * of its own climb out and hang around the handset: Morse's flashlight and
 * the marks it sends, the colours of Kilopixel's current look, BitBounce's
 * pads playing its beat, the words RhymePage is singing, a game's sprites.
 *
 * The phone leans toward the pointer (or a finger) and tips back as the page
 * scrolls. Until the visitor opens something, notifications drop in one at a
 * time, each one a way in. Home, the bar along the bottom (tap it or flick it
 * up) and Escape all put the app away. */

const APPS = ORBIT_ITEMS.filter((i) => i.ring === 'apps');
const GAMES = ORBIT_ITEMS.filter((i) => i.ring === 'games');
const HUB = GAME_HUBS[0];

/* Where things sit around the handset: which side, how far off its edge and
 * how far down, both in percent of the handset. */
type Side = 'l' | 'r';
/** A game's sprites. */
const SPOTS: Array<[Side, number, number]> = [['l', 6, 6], ['r', 5, 1], ['l', 15, 44], ['r', 13, 37], ['l', 2, 79], ['r', 4, 74]];
/** Kilopixel's colours, as pixels coming off two corners: side, gap, top, size, depth. */
const CHIPS: Array<[Side, number, number, number, number]> = [
  ['l', 2, 60, 9, 0.5], ['l', 13, 69, 6, 1.1], ['l', 4, 77, 5, 0.8], ['l', 21, 57, 4, 1.4], ['l', 11, 85, 7, 0.6], ['l', 27, 79, 3, 1.6],
  ['r', 2, 12, 9, 0.5], ['r', 13, 6, 6, 1.1], ['r', 5, 25, 5, 0.8], ['r', 21, 19, 4, 1.4], ['r', 12, 33, 7, 0.6], ['r', 27, 10, 3, 1.6],
];
/** BitBounce's four lanes as pads. `every` and `shift` are in eighth notes: how often each one hits, and how late. */
const PADS: Array<{ lane: string; side: Side; gap: number; top: number; colour: string; every: number; shift: number }> = [
  { lane: 'drums', side: 'l', gap: 7, top: 19, colour: '#ff5a1f', every: 2, shift: 0 },
  { lane: 'lead', side: 'r', gap: 6, top: 27, colour: '#ff3d8b', every: 2, shift: 1 },
  { lane: 'bass', side: 'l', gap: 11, top: 56, colour: '#ffc400', every: 4, shift: 0 },
  { lane: 'chords', side: 'r', gap: 5, top: 63, colour: '#1f6bff', every: 8, shift: 0 },
];
/** RhymePage's words, in the order they are sung. The long ones go right, away from the copy. */
const WORD_SPOTS: Array<[Side, number]> = [['r', 12], ['l', 22], ['r', 32], ['l', 44], ['r', 52], ['l', 66], ['r', 74]];
const SUNG = BARS.flat();
/** The words that rhyme are marked, as the app marks them. */
const RHYMES = new Set(['bars', 'reservoirs']);

const NOTE_FIRST_MS = 3600;
const NOTE_GAP_MS = 1700;
const NOTE_STAY_MS = 4300;
const NOTE_LEAVE_MS = 320;
/** When the boot screen clears: the sky answers. Matches the boot's timing in the stylesheet. */
const BOOTED_MS = 1250;

interface Box { x: number; y: number; w: number; h: number }
interface Note { item: OrbitItem; leaving: boolean }
interface Pulse { id: number; long: boolean }

const clock = () => {
  const d = new Date();
  return `${d.getHours() % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')}`;
};
const unit = (n: number) => Math.max(-1, Math.min(1, n));

/** Where an element sits inside the screen, in layout pixels (so the phone's tilt does not skew it). */
function boxIn(el: HTMLElement, screen: HTMLElement): Box {
  let x = 0;
  let y = 0;
  for (let node: HTMLElement | null = el; node && node !== screen; node = node.offsetParent as HTMLElement | null) {
    x += node.offsetLeft;
    y += node.offsetTop;
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}

/** How the sky dresses for an open item. */
function lookFor(item: OrbitItem, palette: string[] | null): SkyLook {
  const { id, accent } = item;
  // A game brings both its colours, and a pixel-art game a pixel sky.
  if (item.ring === 'games') return { id, accent, second: gameById(id).theme.b, pixel: item.pixel ? 0.5 : 0 };
  if (id === 'morse') return { id, accent, second: '#8a4a1c' };
  if (id === 'kilopixel') return { id, accent, pixel: 1, palette: palette ?? undefined };
  if (id === 'bitbounce') return { id, accent, second: '#ffc400', grid: true };
  return { id, accent, second: '#1c8f7a', lines: true };
}

const spot = (side: Side, gap: number, top: number) => ({ '--gap': `${gap}%`, '--y': `${top}%`, '--from': side === 'l' ? '130%' : '-130%' });

function Icon({ item, index, onOpen }: { item: OrbitItem; index: number; onOpen: (item: OrbitItem, from: HTMLElement) => void }) {
  return (
    <li style={{ ['--i' as string]: index } as CSSProperties}>
      <button
        type="button"
        className="hs-icon"
        style={{ ['--accent' as string]: item.accent } as CSSProperties}
        aria-label={`Open ${item.name}, ${item.status}`}
        onClick={(e) => onOpen(item, e.currentTarget)}
      >
        <span className="hs-tile" data-ring={item.ring}>
          <img src={item.icon} alt="" draggable={false} data-px={item.pixel || undefined} />
        </span>
        <span className="hs-name" aria-hidden="true">{item.name}</span>
      </button>
    </li>
  );
}

export function HomeScreen({ still, onPickGame, onLook, onGlow, onBeat }: {
  still: boolean;
  onPickGame: (id: string) => void;
  /** How the sky should dress for what is open (null when nothing is). */
  onLook: (look: SkyLook | null) => void;
  /** The open app is holding a light on. */
  onGlow: (on: boolean) => void;
  /** Something landed that the sky should answer with a ripple. */
  onBeat: () => void;
}) {
  const [open, setOpen] = useState<OrbitItem | null>(null);
  const [time, setTime] = useState(clock);
  const [touring, setTouring] = useState(!still);
  const [note, setNote] = useState<Note | null>(null);
  const [glow, setGlow] = useState(false);
  const [pulses, setPulses] = useState<Pulse[]>([]);
  /** The colours Kilopixel is drawing in, and how many looks it has rolled. */
  const [palette, setPalette] = useState<string[] | null>(null);
  const [rolls, setRolls] = useState(0);
  const tiltRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const homeRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  /** The transform that puts the full-screen app back on the icon it came from. */
  const shrunk = useRef('');
  const opener = useRef<HTMLElement | null>(null);
  /** The icon to hand focus back to once the app has gone and home can take focus again. */
  const landing = useRef<HTMLElement | null>(null);
  const noteAt = useRef(0);
  const drag = useRef<{ y: number; p: number } | null>(null);

  useEffect(() => {
    const t = window.setInterval(() => setTime(clock()), 20000);
    return () => clearInterval(t);
  }, []);

  // The sky answers the screen coming on.
  useEffect(() => {
    if (still) return;
    const t = window.setTimeout(onBeat, BOOTED_MS);
    return () => clearTimeout(t);
  }, [still, onBeat]);

  // The handset leans toward the pointer, or for a moment toward a finger, and tips back as the hero scrolls away.
  useEffect(() => {
    const el = tiltRef.current;
    if (!el || still) return;
    const now = { x: 0, y: 0 };
    const to = { x: 0, y: 0 };
    const aim = { x: 0, y: 0 };
    // With no pointer to lean toward, the handset sways on its own. The sway runs in this loop
    // with the lean, so a touch or a scroll adds to it instead of fighting it.
    const sways = window.matchMedia('(hover: none)').matches;
    let raf = 0;
    const step = (t: number) => {
      const sway = sways ? Math.sin(t / 1050) * 7 : 0;
      const nod = sways ? Math.cos(t / 1500) * 1.5 : 0;
      now.x += (to.x + nod - now.x) * 0.11;
      now.y += (to.y + sway - now.y) * 0.11;
      el.style.setProperty('--rx', `${now.x.toFixed(2)}deg`);
      el.style.setProperty('--ry', `${now.y.toFixed(2)}deg`);
      el.style.setProperty('--gy', now.y.toFixed(2));
      // A swaying phone keeps going while the hero is on screen; a leaning one stops once it has settled.
      const going = sways
        ? !document.hidden && window.scrollY < window.innerHeight * 1.3
        : Math.abs(to.x - now.x) + Math.abs(to.y - now.y) > 0.03;
      raf = going ? requestAnimationFrame(step) : 0;
    };
    const retarget = () => {
      const away = Math.min(1.2, window.scrollY / window.innerHeight);
      to.y = aim.x * 13;
      to.x = -aim.y * 8 + away * 24;
      if (!raf) raf = requestAnimationFrame(step);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const r = el.getBoundingClientRect();
      aim.x = unit((e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2));
      aim.y = unit((e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2));
      retarget();
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', retarget, { passive: true });
    document.addEventListener('visibilitychange', retarget);
    retarget();
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', retarget);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', retarget);
    };
  }, [still]);

  // Until something is opened, notifications arrive one at a time. Each is a way in.
  useEffect(() => {
    if (!touring || open || still) return;
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => { timers.push(window.setTimeout(fn, ms)); };
    const arrive = (wait: number) => later(() => {
      setNote({ item: ORBIT_ITEMS[noteAt.current++ % ORBIT_ITEMS.length], leaving: false });
      later(() => {
        setNote((n) => (n ? { ...n, leaving: true } : n));
        later(() => { setNote(null); arrive(NOTE_GAP_MS); }, NOTE_LEAVE_MS);
      }, NOTE_STAY_MS);
    }, wait);
    arrive(NOTE_FIRST_MS);
    return () => { timers.forEach(clearTimeout); setNote(null); };
  }, [touring, open, still]);

  // The sky dresses for whatever is open.
  useEffect(() => {
    onLook(open ? lookFor(open, palette) : null);
  }, [open, palette, onLook]);

  const launch = (item: OrbitItem, from: HTMLElement) => {
    const screen = screenRef.current;
    const home = homeRef.current;
    if (!screen || !home) return;
    const b = boxIn(from.querySelector<HTMLElement>('.hs-tile') ?? from, screen);
    const W = screen.clientWidth;
    const H = screen.clientHeight;
    shrunk.current = `translate(${b.x + b.w / 2 - W / 2}px, ${b.y + b.h / 2 - H / 2}px) scale(${b.w / W}, ${b.h / H})`;
    // The home screen dives into the icon that was pressed.
    home.style.transformOrigin = `${b.x + b.w / 2 - home.offsetLeft}px ${b.y + b.h / 2 - home.offsetTop}px`;
    opener.current = from.classList.contains('hs-note') ? null : from;
    if (!still) {
      phoneRef.current?.animate(
        [{ scale: 1 }, { scale: 0.972, offset: 0.2 }, { scale: 1.03, offset: 0.58 }, { scale: 1 }],
        { duration: 660, easing: 'ease-out' },
      );
    }
    setTouring(false);
    setOpen(item);
  };

  // The app grows out of the icon that was pressed.
  useLayoutEffect(() => {
    const el = appRef.current;
    if (!open || !el) return;
    backRef.current?.focus({ preventScroll: true });
    if (still || !shrunk.current) return;
    el.animate(
      [{ transform: shrunk.current, borderRadius: '26%', opacity: 0.5 }, { transform: 'none', borderRadius: '0%', opacity: 1 }],
      { duration: 480, easing: 'cubic-bezier(0.22, 1, 0.3, 1)' },
    );
  }, [open, still]);

  const close = () => {
    const el = appRef.current;
    const screen = screenRef.current;
    const done = () => {
      setOpen(null);
      setGlow(false);
      setPulses([]);
      setPalette(null);
      onGlow(false);
      screen?.style.removeProperty('--away');
      landing.current = opener.current;
    };
    if (still || !el || !shrunk.current) { done(); return; }
    // Home comes back up while the app goes down into its icon.
    screen?.style.setProperty('--away', '0');
    // Only the end is given, so it starts from wherever a flick has left it.
    const leaving = el.animate(
      [{ transform: shrunk.current, borderRadius: '26%', opacity: 0 }],
      { duration: 300, easing: 'cubic-bezier(0.4, 0, 0.7, 0.2)', fill: 'forwards' },
    );
    leaving.onfinish = done;
  };

  // Once the app has gone, the icon it came from takes focus back, with a bounce.
  useEffect(() => {
    const icon = landing.current;
    if (open || !icon) return;
    landing.current = null;
    icon.focus({ preventScroll: true });
    if (!still) icon.querySelector('.hs-tile')?.animate([{ scale: 0.78 }, { scale: 1.14 }, { scale: 1 }], { duration: 420, easing: 'ease-out' });
  }, [open, still]);

  /* The bar along the bottom: tap it, or drag it up and let go, to go home. */
  const onBarDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* a pointer that cannot be captured still drags while it stays on the bar */ }
    drag.current = { y: e.clientY, p: 0 };
  };
  const onBarMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const el = appRef.current;
    const screen = screenRef.current;
    if (!drag.current || !el || !screen || still) return;
    const dy = Math.min(0, e.clientY - drag.current.y);
    const p = Math.min(1, -dy / (screen.clientHeight * 0.45));
    drag.current.p = p;
    el.style.transform = `translateY(${dy * 0.5}px) scale(${1 - p * 0.42})`;
    el.style.borderRadius = `${p * 16}%`;
    screen.style.setProperty('--away', String(1 - p));
  };
  const onBarUp = () => {
    const el = appRef.current;
    const held = drag.current;
    drag.current = null;
    if (!held || !el) return;
    // A tap, or a flick far enough, goes home. A small nudge springs back.
    if (held.p === 0 || held.p > 0.16) { close(); return; }
    const from = { transform: el.style.transform, borderRadius: el.style.borderRadius };
    el.style.transform = '';
    el.style.borderRadius = '';
    screenRef.current?.style.removeProperty('--away');
    el.animate([from, { transform: 'none', borderRadius: '0%' }], { duration: 260, easing: 'cubic-bezier(0.2, 1.3, 0.4, 1)' });
  };

  /* What the open app passes outward. */
  const lamp = useCallback((on: boolean, long = false) => {
    setGlow(on);
    if (on) setPulses((p) => [...p.slice(-5), { id: (p[p.length - 1]?.id ?? 0) + 1, long }]);
    onGlow(on);
  }, [onGlow]);
  const hit = useCallback(() => {
    phoneRef.current?.animate([{ scale: 1.024 }, { scale: 1 }], { duration: 320, easing: 'cubic-bezier(0.2, 1, 0.3, 1)' });
    onBeat();
  }, [onBeat]);
  const paint = useCallback((colours: string[]) => {
    setPalette(colours);
    setRolls((n) => n + 1);
    onBeat();
  }, [onBeat]);

  const floaters = open?.ring === 'games' ? gameById(open.id).floaters.slice(0, SPOTS.length) : [];
  const sound = open?.id === 'morse' || open?.id === 'bitbounce';

  return (
    <div className="hs hero-focus" style={{ ['--accent' as string]: open?.accent ?? '#8f9cff' } as CSSProperties}>
      <div className="hs-float">
        <div className="hs-tilt" ref={tiltRef}>
          <div className="hs-phone" ref={phoneRef} data-glow={glow || undefined}>
            <i className="hs-key hs-key-a" /><i className="hs-key hs-key-b" /><i className="hs-key hs-key-c" /><i className="hs-key hs-key-d" />
            <i className="hs-torch hero-lamp" />
            <div
              className="hs-screen"
              ref={screenRef}
              data-open={open ? '' : undefined}
              onKeyDown={(e) => { if (e.key === 'Escape' && open) close(); }}
            >
              <div className="hs-status" aria-hidden="true">
                <span>{time}</span>
                <span className="hs-island" data-live={open ? '' : undefined}>
                  {open && <img src={open.icon} alt="" data-px={open.pixel || undefined} />}
                  {open && (sound ? <span className="hs-eq"><i /><i /><i /><i /></span> : <span className="hs-dot" />)}
                </span>
                <span className="hs-status-icons">
                  <svg viewBox="0 0 18 12"><path d="M1 9h2v3H1zM5 6h2v6H5zM9 3h2v9H9zM13 0h2v12h-2z" fill="currentColor" /></svg>
                  <svg viewBox="0 0 26 12"><rect x="0.75" y="0.75" width="21.5" height="10.5" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5" /><rect x="2.5" y="2.5" width="15" height="7" rx="1.5" fill="currentColor" /><path d="M24 4v4c1-.3 1.6-1 1.6-2s-.6-1.7-1.6-2z" fill="currentColor" opacity="0.5" /></svg>
                </span>
              </div>

              <div className="hs-home" ref={homeRef} inert={!!open}>
                <ul className="hs-grid" aria-label="Games">
                  {GAMES.map((item, i) => <Icon key={item.id} item={item} index={i} onOpen={launch} />)}
                  <li style={{ ['--i' as string]: GAMES.length } as CSSProperties}>
                    <a className="hs-icon" href={HUB.url} target="_blank" rel="noopener noreferrer" aria-label={`${HUB.title}: ${HUB.line} (opens in a new tab)`}>
                      <span className="hs-tile hs-tile-hub"><img src={gurpySrc} alt="" draggable={false} data-px="" /></span>
                      <span className="hs-name" aria-hidden="true">{HUB.title}</span>
                    </a>
                  </li>
                </ul>
                <ul className="hs-dock" aria-label="Apps">
                  {APPS.map((item, i) => <Icon key={item.id} item={item} index={i} onOpen={launch} />)}
                </ul>
              </div>

              {note && !open && (
                <button
                  type="button"
                  className="hs-note"
                  key={note.item.id}
                  data-leaving={note.leaving || undefined}
                  style={{ ['--accent' as string]: note.item.accent } as CSSProperties}
                  tabIndex={-1}
                  aria-hidden="true"
                  onClick={(e) => launch(note.item, e.currentTarget)}
                >
                  <span className="hs-tile" data-ring={note.item.ring}>
                    <img src={note.item.icon} alt="" draggable={false} data-px={note.item.pixel || undefined} />
                  </span>
                  <span className="hs-note-text">
                    <b>{note.item.name}<small>now</small></b>
                    <span>{note.item.line}</span>
                  </span>
                </button>
              )}

              {open && (
                <div
                  className="hs-app"
                  ref={appRef}
                  key={open.id}
                  role="dialog"
                  aria-label={open.name}
                  data-app={open.ring === 'games' ? 'game' : open.id}
                  data-kind={open.screen.kind}
                  style={{ ['--accent' as string]: open.accent } as CSSProperties}
                >
                  <LiveApp item={open} still={still} onGlow={lamp} onBeat={hit} onPalette={paint} />
                  {/* The launch screen: the app's colour, its icon, its name, and a bar that fills its own way. */}
                  <div className="hs-splash" aria-hidden="true">
                    <i className="hs-splash-ring" />
                    <img src={open.icon} alt="" data-ring={open.ring} data-px={open.pixel || undefined} />
                    <b>{open.name}</b>
                    <span className="hs-splash-load"><i /></span>
                  </div>
                  <div className="hs-sheet">
                    <button type="button" className="hs-back" ref={backRef} onClick={close} aria-label="Back to the home screen">
                      <svg viewBox="0 0 10 16" aria-hidden="true"><path d="M8 2 2 8l6 6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      Home
                    </button>
                    <p className="orbit-card-status"><span className="dot" />{open.ring === 'apps' ? 'App' : 'Game'} &middot; {open.status}</p>
                    <h2 className="hs-sheet-name">{open.name}</h2>
                    <p className="hs-sheet-line">{open.line}</p>
                    <ItemActions item={open} onPickGame={onPickGame} />
                  </div>
                  <button
                    type="button"
                    className="hs-bar"
                    tabIndex={-1}
                    aria-hidden="true"
                    onPointerDown={onBarDown}
                    onPointerMove={onBarMove}
                    onPointerUp={onBarUp}
                    onPointerCancel={onBarUp}
                  />
                </div>
              )}

              {/* The boot screen, once, when the page loads. */}
              {!still && <div className="hs-boot" aria-hidden="true"><b>grady<i>OS</i></b><span><i /></span></div>}
            </div>
          </div>

          {/* What climbs out of the phone and hangs around it, at its own depths so the tilt slides it past the handset. */}
          <div className="hs-spill" aria-hidden="true">
            {floaters.map((f, i) => (
              <span
                key={`${open?.id}-${i}`}
                className="hs-floater"
                data-side={SPOTS[i][0]}
                data-px={f.pixel || undefined}
                style={{
                  ...spot(...SPOTS[i]), '--w': `${Math.round(Math.max(52, Math.min(128, f.size * 3.2)))}px`,
                  '--r': `${f.r}deg`, '--depth': f.depth, '--speed': `${f.speed}s`, '--i': i,
                } as CSSProperties}
              >
                <img src={f.src} alt="" draggable={false} />
              </span>
            ))}
            {open?.id === 'morse' && pulses.map((p) => <i key={p.id} className="hs-pulse" data-long={p.long || undefined} />)}
            {open?.id === 'kilopixel' && palette && CHIPS.map(([side, gap, top, size, depth], i) => (
              <i
                key={`${rolls}-${i}`}
                className="hs-chip"
                data-side={side}
                data-first={rolls === 1 || undefined}
                style={{ ...spot(side, gap, top), '--s': `${size}%`, '--depth': depth, '--i': i, '--c': palette[(i * 5 + rolls) % palette.length] } as CSSProperties}
              />
            ))}
            {open?.id === 'bitbounce' && PADS.map((p, i) => (
              <i
                key={p.lane}
                className="hs-pad"
                data-side={p.side}
                data-every={p.every}
                style={{ ...spot(p.side, p.gap, p.top), '--c': p.colour, '--every': p.every, '--shift': p.shift, '--i': i } as CSSProperties}
              />
            ))}
            {open?.id === 'rhymepage' && SUNG.map((word, i) => (
              <span
                key={word}
                className="hs-word"
                data-side={WORD_SPOTS[i][0]}
                data-rhyme={RHYMES.has(word) || undefined}
                style={{ ...spot(WORD_SPOTS[i][0], 7, WORD_SPOTS[i][1]), '--i': i } as CSSProperties}
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      </div>
      <p className="hs-hint" aria-hidden="true">Tap anything on it</p>
    </div>
  );
}
