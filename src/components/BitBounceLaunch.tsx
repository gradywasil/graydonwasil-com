import { useEffect, useRef, useState, type CSSProperties } from 'react';
import logo from '../assets/bitbounce/logo.svg';
import ipadShot from '../assets/bitbounce/ipad-song.webp';
import phoneShot from '../assets/bitbounce/phone-edit.webp';
import { BITBOUNCE } from '../data/site';
import { createAudioContext, unmuteOnIOS } from '../lib/audio';
import { useReveal } from '../lib/useReveal';
import { Split } from './Split';
import { StoreButtons } from './StoreButtons';

/* BitBounce, the iPhone and iPad app, dressed like bitbounce.app: a cream toy
 * groovebox with keycap buttons, a dark LCD grid and one colour per lane.
 * The real app sits on the right; below it, its four core lanes as a one-bar
 * grid you can tap and play, with the keys bitbounce.app's own drum machine
 * has (Dice, Swing, Clear) plus Tempo and Sound, so the loop can be made
 * yours the way a song is in the app. */

type Lane = 'drums' | 'bass' | 'chords' | 'lead';
type Grid = Record<Lane, boolean[]>;
const LANES: { id: Lane; name: string }[] = [
  { id: 'drums', name: 'Drums' },
  { id: 'bass', name: 'Bass' },
  { id: 'chords', name: 'Chords' },
  { id: 'lead', name: 'Lead' },
];
const STEPS = 8; // eighth notes
const TEMPOS = [96, 108, 118, 128, 140];
/** Swing, the way an MPC counts it: where the off-beat lands inside its beat. */
const SWINGS = [50, 58, 66];

const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12);
// One pitch (or chord) per step, so any cell you switch on lands in key.
const BASS = [45, 45, 48, 48, 41, 41, 43, 43];
const CHORDS = [[57, 60, 64], [57, 60, 64], [57, 60, 64], [57, 60, 64], [53, 57, 60], [53, 57, 60], [55, 59, 62], [55, 59, 62]];
const TUNE = [76, 72, 74, 76, 79, 77, 76, 72];
// What the lead may play over each step's chord when the dice pick a new tune.
const A_MINOR = [69, 72, 74, 76, 79, 81];
const F_MAJOR = [69, 72, 76, 77, 81];
const G_MAJOR = [71, 74, 76, 79, 83];
const POOLS = [A_MINOR, A_MINOR, A_MINOR, A_MINOR, F_MAJOR, F_MAJOR, G_MAJOR, G_MAJOR];

const START: Grid = {
  drums: [true, false, true, true, true, false, true, false],
  bass: [true, false, false, true, true, false, false, true],
  chords: [true, false, false, false, true, false, true, false],
  lead: [false, true, true, false, false, true, true, true],
};

/* Four sounds for the box. They are this page's own, not the app's kits. */
interface Kit {
  name: string;
  /** Master low-pass in Hz: how bright the whole box is. */
  tone: number;
  bass: OscillatorType;
  chords: OscillatorType;
  lead: OscillatorType;
  /** Chords as a quick arpeggio, not a block. */
  arp: boolean;
  /** Notes ring this much longer or shorter. */
  hold: number;
  /** Kick: where the pitch starts, and how long it lasts. */
  thump: [number, number];
  /** Snare and hat: noise cut-offs, and how long the hat rings. */
  snap: number;
  tick: number;
  ring: number;
}
const KITS: Kit[] = [
  { name: 'Toy', tone: 9000, bass: 'square', chords: 'triangle', lead: 'square', arp: false, hold: 1, thump: [150, 0.2], snap: 1200, tick: 7000, ring: 0.05 },
  { name: 'Tape', tone: 1700, bass: 'triangle', chords: 'sine', lead: 'triangle', arp: false, hold: 1.5, thump: [110, 0.3], snap: 800, tick: 4200, ring: 0.09 },
  { name: 'Arcade', tone: 12000, bass: 'square', chords: 'square', lead: 'square', arp: true, hold: 0.6, thump: [230, 0.09], snap: 2400, tick: 9000, ring: 0.03 },
  { name: 'Club', tone: 4600, bass: 'sawtooth', chords: 'sawtooth', lead: 'sawtooth', arp: false, hold: 0.9, thump: [185, 0.34], snap: 1500, tick: 8000, ring: 0.04 },
];
// Waves with more harmonics read louder; even them out.
const LEVEL: Record<OscillatorType, number> = { sine: 1.7, triangle: 1.5, square: 1, sawtooth: 0.85, custom: 1 };

function tone(ctx: AudioContext, out: AudioNode, t: number, type: OscillatorType, f: number, len: number, vol: number) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = f;
  g.gain.setValueAtTime(vol * LEVEL[type], t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + len);
  o.connect(g).connect(out);
  o.start(t);
  o.stop(t + len + 0.02);
}

function noise(ctx: AudioContext, out: AudioNode, t: number, len: number, vol: number, cutoff: number) {
  const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * len), ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  const hp = ctx.createBiquadFilter();
  const g = ctx.createGain();
  src.buffer = buf;
  hp.type = 'highpass';
  hp.frequency.value = cutoff;
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + len);
  src.connect(hp).connect(g).connect(out);
  src.start(t);
}

function kick(ctx: AudioContext, out: AudioNode, t: number, [from, len]: [number, number]) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.frequency.setValueAtTime(from, t);
  o.frequency.exponentialRampToValueAtTime(45, t + len * 0.7);
  g.gain.setValueAtTime(0.9, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + len);
  o.connect(g).connect(out);
  o.start(t);
  o.stop(t + len + 0.02);
}

/** One lane's sound at one step. `len` is the length of a step in seconds. */
function voice(ctx: AudioContext, out: AudioNode, kit: Kit, lane: Lane, i: number, t: number, len: number, tune: number[]) {
  if (lane === 'drums') {
    if (i % 4 === 0) kick(ctx, out, t, kit.thump);
    else if (i % 4 === 2) noise(ctx, out, t, 0.16, 0.35, kit.snap);
    else noise(ctx, out, t, kit.ring, 0.18, kit.tick);
  } else if (lane === 'bass') {
    tone(ctx, out, t, kit.bass, hz(BASS[i]), len * 0.9 * kit.hold, 0.16);
  } else if (lane === 'chords') {
    CHORDS[i].forEach((n, k) => {
      if (kit.arp) tone(ctx, out, t + (k * len) / 3, kit.chords, hz(n + 12), len * 0.4, 0.07);
      else tone(ctx, out, t, kit.chords, hz(n), len * 1.8 * kit.hold, 0.09);
    });
  } else {
    tone(ctx, out, t, kit.lead, hz(tune[i]), len * 0.7 * kit.hold, 0.07);
  }
}

const chance = (p: number) => Math.random() < p;
const steps = <T,>(pick: (i: number) => T) => Array.from({ length: STEPS }, (_, i) => pick(i));

/** A dice roll keeps a loop a loop: something on the one, a backbeat, parts that leave each other room. */
function rollLane(lane: Lane): boolean[] {
  if (lane === 'drums') return steps((i) => i === 0 || (i === 4 ? chance(0.8) : i % 4 === 2 ? chance(0.85) : chance(0.5)));
  if (lane === 'bass') return steps((i) => i === 0 || chance(i % 2 ? 0.3 : 0.5));
  if (lane === 'chords') return steps((i) => i === 0 || (i === 4 ? chance(0.75) : i === 6 ? chance(0.55) : chance(0.1)));
  const lead = steps(() => chance(0.5));
  while (lead.filter(Boolean).length < 3) lead[Math.floor(Math.random() * STEPS)] = true;
  return lead;
}

/** A new tune for the lead: chord notes, mostly moving by small steps. */
function rollTune(): number[] {
  let last = 76;
  return POOLS.map((pool) => {
    const near = pool.filter((n) => Math.abs(n - last) <= 5);
    const from = near.length && chance(0.75) ? near : pool;
    last = from[Math.floor(Math.random() * from.length)];
    return last;
  });
}

const PlayIcon = () => <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5v11l9-5.5z" fill="currentColor" /></svg>;
const StopIcon = () => <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 3.5h9v9h-9z" fill="currentColor" /></svg>;
const DieIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <rect x="1.5" y="1.5" width="13" height="13" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
    <path d="M4.2 4.2h2v2h-2zM9.8 4.2h2v2h-2zM7 7h2v2H7zM4.2 9.8h2v2h-2zM9.8 9.8h2v2h-2z" fill="currentColor" />
  </svg>
);

export function BitBounceLaunch() {
  const [grid, setGrid] = useState(START);
  const [tune, setTune] = useState(TUNE);
  const [step, setStep] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [tempo, setTempo] = useState(2);
  const [swing, setSwing] = useState(0);
  const [kit, setKit] = useState(0);
  /** Counts dice rolls, so the keys can flip over once per roll. */
  const [rolls, setRolls] = useState(0);
  const [said, setSaid] = useState('');
  const live = useRef({ grid, tune, bpm: TEMPOS[tempo], swing: SWINGS[swing], kit: KITS[kit] });
  const audio = useRef<{ ctx: AudioContext; out: GainNode; filter: BiquadFilterNode } | null>(null);
  const loop = useRef(0);
  const pending = useRef(new Set<number>());
  const headline = useReveal<HTMLParagraphElement>();
  useEffect(() => {
    live.current = { grid, tune, bpm: TEMPOS[tempo], swing: SWINGS[swing], kit: KITS[kit] };
    audio.current?.filter.frequency.setTargetAtTime(KITS[kit].tone, audio.current.ctx.currentTime, 0.03);
  }, [grid, tune, tempo, swing, kit]);

  const stop = () => {
    clearInterval(loop.current);
    pending.current.forEach((t) => clearTimeout(t));
    pending.current.clear();
    setPlaying(false);
    setStep(-1);
  };

  useEffect(() => {
    const hide = () => { if (document.hidden) stop(); };
    document.addEventListener('visibilitychange', hide);
    return () => {
      document.removeEventListener('visibilitychange', hide);
      stop();
      void audio.current?.ctx.close();
      audio.current = null;
    };
  }, []);

  /** The box's output: a low-pass that the Sound key moves, then a little squash. */
  const ready = () => {
    unmuteOnIOS();
    if (audio.current) return audio.current;
    const ctx = createAudioContext();
    if (!ctx) return null;
    const out = ctx.createGain();
    out.gain.value = 0.5;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = live.current.kit.tone;
    const squash = ctx.createDynamicsCompressor();
    squash.threshold.value = -14;
    squash.ratio.value = 4;
    out.connect(filter).connect(squash).connect(ctx.destination);
    audio.current = { ctx, out, filter };
    return audio.current;
  };

  const play = async () => {
    if (playing) { stop(); return; }
    const box = ready();
    if (!box) return;
    const { ctx, out } = box;
    // Schedule only once the clock runs. An interrupted session (a call, Siri)
    // refuses to resume; the next tap tries again.
    try { await ctx.resume(); } catch { return; }
    clearInterval(loop.current);
    let next = ctx.currentTime + 0.06;
    let i = 0;
    // Look ahead 120ms on a 30ms tick; the UI catches up with a timeout per step.
    const tick = () => {
      while (next < ctx.currentTime + 0.12) {
        const now = live.current;
        const len = 60 / now.bpm / 2;
        const at = i;
        // Swing: every off-beat lands later inside its beat.
        const when = next + (at % 2 ? (now.swing / 100 - 0.5) * 2 * len : 0);
        for (const lane of LANES) if (now.grid[lane.id][at]) voice(ctx, out, now.kit, lane.id, at, when, len, now.tune);
        const id = window.setTimeout(() => { pending.current.delete(id); setStep(at); }, (when - ctx.currentTime) * 1000);
        pending.current.add(id);
        next += len;
        i = (i + 1) % STEPS;
      }
    };
    loop.current = window.setInterval(tick, 30);
    tick();
    setPlaying(true);
  };

  /** Like the app's grid: while stopped, a step you add (or a lane you roll) is heard once. */
  const audition = (lane: Lane, i: number, heard = tune) => {
    if (playing) return;
    const box = ready();
    if (!box) return;
    const now = live.current;
    void box.ctx.resume().then(() => voice(box.ctx, box.out, now.kit, lane, i, box.ctx.currentTime + 0.01, 60 / now.bpm / 2, heard)).catch(() => {});
  };

  const toggle = (lane: Lane, i: number) => {
    if (!grid[lane][i]) audition(lane, i);
    setGrid((g) => ({ ...g, [lane]: g[lane].map((on, j) => (j === i ? !on : on)) }));
  };

  const dice = () => {
    setGrid({ drums: rollLane('drums'), bass: rollLane('bass'), chords: rollLane('chords'), lead: rollLane('lead') });
    setTune(rollTune());
    setRolls((n) => n + 1);
    setSaid('New pattern rolled.');
  };
  const diceLane = (lane: Lane, name: string) => {
    const next = rollLane(lane);
    const heard = lane === 'lead' ? rollTune() : tune;
    setGrid((g) => ({ ...g, [lane]: next }));
    if (lane === 'lead') setTune(heard);
    audition(lane, Math.max(0, next.indexOf(true)), heard);
    setSaid(`${name} rolled.`);
  };
  const clear = () => {
    setGrid({ drums: steps(() => false), bass: steps(() => false), chords: steps(() => false), lead: steps(() => false) });
    setSaid('Pattern cleared.');
  };
  const nextSwing = () => { const n = (swing + 1) % SWINGS.length; setSwing(n); setSaid(`Swing ${SWINGS[n]} percent.`); };
  const nextTempo = () => { const n = (tempo + 1) % TEMPOS.length; setTempo(n); setSaid(`${TEMPOS[n]} beats per minute.`); };
  const nextKit = () => { const n = (kit + 1) % KITS.length; setKit(n); setSaid(`${KITS[n].name} sound.`); };

  // While it plays, the page keeps time: a tick on every step and a kick on the downbeats.
  const running = playing && step >= 0;
  const tick = running ? step % 2 : undefined;
  const thump = running && step % 4 === 0 && grid.drums[step] ? (step / 4) % 2 : undefined;

  return (
    <section className="world world-bb" id="bitbounce" aria-labelledby="bb-title">
      {/* The edge of this world is the demo's four lanes laid end to end, with
          a playhead that scrolling moves along them. Change the pattern and
          the edge changes with it. */}
      <div className="bb-strip" aria-hidden="true">
        {LANES.flatMap((lane) => grid[lane.id].map((on, i) => (
          <i key={`${lane.id}-${i}`} data-lane={lane.id} data-on={on || undefined} data-now={(running && step === i) || undefined} />
        )))}
        <b className="bb-strip-head" />
      </div>
      <div className="bb-top">
        <div className="bb-copy">
          <p className="bb-kicker"><span className="bb-led" />Free beta on iPhone and iPad</p>
          <h2 className="bb-brand" id="bb-title">
            <img src={logo} alt="" width="52" height="52" data-tick={tick} />
            BitBounce
          </h2>
          <p className="bb-headline" ref={headline}>
            <span className="sr-only">Make the beat. Then make it a song.</span>
            <span aria-hidden="true">
              <Split text="Make the beat." /> <em><Split text="Then make it a song." at={12} word={3} /></em>
            </span>
          </p>
          <p className="bb-desc">A free music studio built like a toy groovebox.</p>
          {/* The rest of the pitch, as the four things you do in the app. */}
          <ol className="bb-steps">
            <li data-lane="drums"><b>Program</b> the grid</li>
            <li data-lane="bass"><b>Chain</b> a song</li>
            <li data-lane="chords"><b>Mix</b> with real effects</li>
            <li data-lane="lead"><b>Export</b> it</li>
          </ol>
          <StoreButtons stores={BITBOUNCE.stores} app="BitBounce" className="bb-stores" />
          <p className="bb-note">
            No account, no ads. Android is on the way.{' '}
            <a href={BITBOUNCE.site} target="_blank" rel="noopener noreferrer">
              bitbounce.app <span aria-hidden="true">&#8599;</span>
            </a>
          </p>
        </div>

        <div className="bb-devices" data-tick={tick}>
          <div className="bb-ipad">
            <img src={ipadShot} alt="BitBounce on iPad, showing the Song page with sections of pattern blocks" width="1600" height="1112" loading="lazy" />
          </div>
          <div className="bb-phone">
            <img src={phoneShot} alt="BitBounce on iPhone, editing a chords pattern on the note grid" width="720" height="1565" loading="lazy" />
          </div>
        </div>
      </div>

      <div className="bb-box" data-kick={thump}>
        <div className="bb-transport">
          <button type="button" className="bb-key bb-key-play" aria-pressed={playing} onClick={() => void play()}>
            {playing ? <StopIcon /> : <PlayIcon />} {playing ? 'Stop' : 'Play'}
          </button>
          <div className="bb-lcd" aria-hidden="true">
            <span><small>BPM</small><b key={tempo}>{TEMPOS[tempo]}</b></span>
            <span><small>Swing</small><b key={swing}>{SWINGS[swing]}%</b></span>
            <span><small>Step</small><b>{step >= 0 ? `1.${step + 1}` : '--'}</b></span>
            <span><small>Sound</small><b key={kit}>{KITS[kit].name}</b></span>
          </div>
          <div className="bb-keys">
            <button type="button" className="bb-key bb-cap bb-key-dice" onClick={dice} aria-label="Dice: roll a new pattern">
              <span className="bb-die" key={rolls}><DieIcon /></span> Dice
            </button>
            <button type="button" className="bb-key bb-cap" aria-pressed={swing > 0} onClick={nextSwing} aria-label={`Swing: ${SWINGS[swing]} percent`}>Swing</button>
            <button type="button" className="bb-key bb-cap" onClick={nextTempo} aria-label={`Tempo: ${TEMPOS[tempo]} beats per minute`}>Tempo</button>
            <button type="button" className="bb-key bb-cap" onClick={nextKit} aria-label={`Sound: ${KITS[kit].name}`}>Sound</button>
            <button type="button" className="bb-key bb-cap" onClick={clear}>Clear</button>
          </div>
        </div>
        <div
          className="bb-grid"
          data-roll={rolls ? rolls % 2 : undefined}
          style={{ ['--swing' as string]: (SWINGS[swing] - 50) / 50 } as CSSProperties}
        >
          {LANES.map((lane) => (
            <div key={lane.id} className="bb-lane" data-lane={lane.id} role="group" aria-label={lane.name}>
              <button type="button" className="bb-lane-name" onClick={() => diceLane(lane.id, lane.name)} aria-label={`Roll the ${lane.name.toLowerCase()} lane`}>
                {lane.name}
              </button>
              {grid[lane.id].map((on, i) => (
                <button
                  key={i}
                  type="button"
                  className="bb-cell"
                  aria-pressed={on}
                  aria-label={`${lane.name} step ${i + 1}`}
                  data-now={step === i || undefined}
                  data-off={i % 2 === 1 || undefined}
                  data-mark={i % 4 === 0 || undefined}
                  style={{ ['--col' as string]: i } as CSSProperties}
                  onClick={() => toggle(lane.id, i)}
                />
              ))}
            </div>
          ))}
        </div>
        <p className="bb-hint">
          Tap steps on and off. Tap a lane&rsquo;s name to roll just that lane.
          <span className="only-wide"> These four sounds belong to this page; the app has 80 kits and 848 sounds.</span>
        </p>
        <p className="sr-only" aria-live="polite">{said}</p>
      </div>
    </section>
  );
}
