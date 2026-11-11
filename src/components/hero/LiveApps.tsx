import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import flowerSrc from '../../assets/kilopixel/flower.webp';
import { gameById } from '../../data/games';
import type { OrbitItem } from '../../data/site';
import { letters, schedule } from '../../lib/morse';
import { tapeGroups } from '../../lib/morse-tape';
import { SenderScreen, type SenderView } from '../MorsePhones';
import { BARS } from './lyrics';
import type { Settings } from '../../vendor/kilopixel/renderer';

/* What runs inside the hero's phone when an item is opened. Each one is the
 * real thing where it can be: Morse is the app's own interface sending a
 * message, Kilopixel is the app's engine rolling its looks over a photo,
 * BitBounce is the app's screen keeping its beat, RhymePage rehearses its
 * bars, and a game is its own art. What they do is passed outward (`onGlow`,
 * `onBeat`, `onPalette`) so the phone and the sky can join in. */

export interface LiveProps {
  item: OrbitItem;
  still: boolean;
  /** A light the app is holding on (Morse's flashlight), and whether this mark is a dash. */
  onGlow: (on: boolean, long?: boolean) => void;
  /** A beat the app just landed. */
  onBeat: () => void;
  /** The colours the app is drawing in right now (Kilopixel's look). */
  onPalette: (colours: string[]) => void;
}

/* ------------------------------------------------------------------ Morse */

const MORSE_TEXT = 'HI THERE';
const WPM = 8;
const UNIT_MS = 1200 / WPM;

function MorseLive({ still, onGlow }: LiveProps) {
  const plan = useMemo(() => {
    const chars = letters(MORSE_TEXT);
    const steps = schedule(MORSE_TEXT);
    let g = -1;
    return {
      steps,
      groups: tapeGroups(chars),
      // Tape groups skip spaces, so map a letter index to its group.
      groupOf: chars.map((c) => (c.char === ' ' ? g : ++g)),
      marks: steps.filter((s) => s.on).length,
      seconds: Math.round((steps.reduce((n, s) => n + s.units, 0) * UNIT_MS) / 1000),
    };
  }, []);
  const [now, setNow] = useState<Pick<SenderView, 'state' | 'letter' | 'mark' | 'fire'>>({ state: 'idle', letter: 0, mark: 0, fire: 0 });

  // It sends its message, rests, and sends it again, the flashlight going with it.
  useEffect(() => {
    if (still) return;
    let alive = true;
    let timer = 0;
    const wait = (ms: number) => new Promise<void>((r) => { timer = window.setTimeout(r, ms); });
    void (async () => {
      await wait(1100);
      while (alive) {
        let sent = 0;
        for (const s of plan.steps) {
          if (!alive) return;
          if (s.on) sent++;
          onGlow(s.on, s.units > 1);
          setNow({ state: 'broadcasting', letter: plan.groupOf[s.letter], mark: sent, fire: sent });
          await wait(s.units * UNIT_MS);
        }
        if (!alive) return;
        onGlow(false);
        setNow({ state: 'done', letter: plan.groups.length, mark: sent, fire: 0 });
        await wait(2400);
        if (!alive) return;
        setNow({ state: 'idle', letter: 0, mark: 0, fire: 0 });
        await wait(1200);
      }
    })();
    return () => { alive = false; clearTimeout(timer); onGlow(false); };
  }, [still, plan, onGlow]);

  return (
    <div className="hs-app-shot">
      <SenderScreen v={{ ...now, text: MORSE_TEXT, groups: plan.groups, marks: plan.marks, seconds: plan.seconds, wpm: WPM, sent: MORSE_TEXT }} />
    </div>
  );
}

/* -------------------------------------------------------------- Kilopixel */

const KP_W = 288;
const KP_H = 608;
const ROLL_MS = 1900;
const scaled = (s: Settings, width: number): Settings =>
  ({ ...s, palette: [...s.palette], pixelSize: Math.max(2, Math.round((s.pixelSize * width) / 480)) });

function KilopixelLive({ item, still, onPalette }: LiveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prevRef = useRef<HTMLCanvasElement>(null);
  const roll = useRef(() => {});
  const [look, setLook] = useState('');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    let timer = 0;
    let dispose = () => {};
    void (async () => {
      const [r, l] = await Promise.all([import('../../vendor/kilopixel/renderer'), import('../../vendor/kilopixel/looks')]);
      const photo = new Image();
      photo.src = flowerSrc;
      await photo.decode();
      const canvas = canvasRef.current;
      if (!alive || !canvas) return;
      const engine = new r.Renderer(canvas);
      dispose = () => engine.dispose();
      const looks = l.starterLooks().filter((x) => engine.supportsWebGL || !r.EFFECTS.find((e) => e.id === x.settings.effect)?.requiresWebGL);
      let at = Math.max(0, looks.findIndex((x) => x.id === 'starter-riso'));
      const show = () => {
        engine.render(photo, scaled(looks[at].settings, KP_W));
        setLook(looks[at].name);
        onPalette(looks[at].settings.palette);
      };
      // A new look wipes down over the old one in hard steps, as it does in the app's section.
      const next = (to: number) => {
        const prev = prevRef.current;
        if (prev && !still) {
          prev.getContext('2d')?.drawImage(canvas, 0, 0);
          prev.classList.remove('kp-wipe');
          void prev.offsetWidth;
          prev.classList.add('kp-wipe');
        }
        at = to;
        show();
      };
      const any = () => {
        let to = Math.floor(Math.random() * looks.length);
        if (to === at) to = (to + 1) % looks.length;
        return to;
      };
      show();
      const tour = () => { timer = window.setInterval(() => next(any()), ROLL_MS); };
      roll.current = () => { clearInterval(timer); next(any()); if (!still) tour(); };
      if (!still) tour();
    })().catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; clearInterval(timer); roll.current = () => {}; dispose(); };
  }, [still, onPalette]);

  if (failed && item.screen.kind === 'phone') {
    return <div className="hs-app-shot"><img src={item.screen.src} alt="" draggable={false} /></div>;
  }
  return (
    <div className="hs-app-shot hs-kp">
      <canvas ref={canvasRef} width={KP_W} height={KP_H} role="img" aria-label={`A flower in Kilopixel's ${look || 'Riso print'} look`} />
      <canvas ref={prevRef} className="kp-prev" width={KP_W} height={KP_H} aria-hidden="true" onAnimationEnd={(e) => e.currentTarget.classList.remove('kp-wipe')} />
      <button type="button" className="hs-kp-roll" onClick={() => roll.current()} aria-label="Roll another look" />
      <p className="hs-kp-tag" aria-hidden="true"><i />Live engine<b>{look}</b></p>
      <p className="hs-kp-hint" aria-hidden="true">Tap to roll</p>
    </div>
  );
}

/* -------------------------------------------------------------- BitBounce */

// Two beats at the demo's 118 BPM.
const BEAT_MS = (60 / 118) * 2 * 1000;

function BitBounceLive({ item, still, onBeat }: LiveProps) {
  useEffect(() => {
    if (still) return;
    const t = window.setInterval(onBeat, BEAT_MS);
    return () => clearInterval(t);
  }, [still, onBeat]);
  if (item.screen.kind !== 'phone') return null;
  return <div className="hs-app-shot"><img src={item.screen.src} alt="" draggable={false} /></div>;
}

/* -------------------------------------------------------------- RhymePage */

const WORDS = BARS.flat().length;
/** One word every 380ms and then a rest of four, starting 900ms in: the words around the phone keep this time in the stylesheet (`hs-word`). */
const WORD_MS = 380;
const LAUNCH_MS = 900;

function RhymeLive({ still }: LiveProps) {
  // Which word is being sung; it walks the bars, holds, and starts over.
  const [at, setAt] = useState(still ? 2 : -1);
  useEffect(() => {
    if (still) return;
    let t = 0;
    // It starts once the launch screen has cleared.
    const start = window.setTimeout(() => {
      t = window.setInterval(() => setAt((n) => (n >= WORDS + 3 ? 0 : n + 1)), WORD_MS);
    }, LAUNCH_MS);
    return () => { clearTimeout(start); clearInterval(t); };
  }, [still]);
  let n = -1;
  return (
    <div className="hs-app-shot hs-lyrics">
      {BARS.map((bar, i) => (
        <p key={i}>
          {bar.map((word) => {
            n++;
            return <span key={word} data-state={n < at ? 'sung' : n === at ? 'now' : undefined}>{word} </span>;
          })}
        </p>
      ))}
      <div className="rp-beat">{[0, 1, 2, 3].map((b) => <i key={b} data-on={(at >= 0 && at < WORDS && at % 4 === b) || undefined} />)}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ games */

function GameLive({ item }: LiveProps) {
  const game = gameById(item.id);
  const { screen } = item;
  if (screen.kind === 'phone') {
    return <div className="hs-app-shot"><img src={screen.src} alt="" width={screen.w} height={screen.h} draggable={false} /></div>;
  }
  if (screen.kind !== 'browser') return null;
  return (
    <div className="hs-app-shot hs-game" style={{ ['--g-bg' as string]: game.theme.bg } as CSSProperties}>
      {game.logo
        ? <img className="hs-game-logo" src={game.logo.src} alt="" width={game.logo.w} height={game.logo.h} draggable={false} />
        : <img className="hs-game-logo" src={item.icon} alt="" draggable={false} data-px={item.pixel || undefined} />}
      <figure className="hs-game-window">
        <div className="stage-bar"><i /><i /><i /><span>{screen.host}</span></div>
        <img src={screen.src} alt="" width={screen.w} height={screen.h} draggable={false} />
      </figure>
    </div>
  );
}

export function LiveApp(props: LiveProps) {
  const { id, ring } = props.item;
  if (ring === 'games') return <GameLive {...props} />;
  if (id === 'morse') return <MorseLive {...props} />;
  if (id === 'kilopixel') return <KilopixelLive {...props} />;
  if (id === 'bitbounce') return <BitBounceLive {...props} />;
  return <RhymeLive {...props} />;
}
