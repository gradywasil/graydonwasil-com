import { useEffect, useRef, useState } from 'react';
import logo from '../assets/bitbounce/logo.svg';
import ipadShot from '../assets/bitbounce/ipad-song.webp';
import phoneShot from '../assets/bitbounce/phone-edit.webp';
import { BITBOUNCE } from '../data/site';
import { createAudioContext, unmuteOnIOS } from '../lib/audio';
import { StoreButtons } from './StoreButtons';

/* BitBounce, the iPhone and iPad app, dressed like bitbounce.app: a cream toy
 * groovebox with keycap buttons, a dark LCD grid and one colour per lane.
 * The real app sits on the right; below it, its four core lanes as a one-bar
 * grid you can tap and play, the way you sketch a loop in the app. */

type Lane = 'drums' | 'bass' | 'chords' | 'lead';
const LANES: { id: Lane; name: string }[] = [
  { id: 'drums', name: 'Drums' },
  { id: 'bass', name: 'Bass' },
  { id: 'chords', name: 'Chords' },
  { id: 'lead', name: 'Lead' },
];
const STEPS = 8;
const BPM = 118;
const STEP_S = 60 / BPM / 2; // eighth notes

const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12);
// One pitch (or chord) per step, so any cell you switch on lands in key.
const BASS = [45, 45, 48, 48, 41, 41, 43, 43];
const CHORDS = [[57, 60, 64], [57, 60, 64], [57, 60, 64], [57, 60, 64], [53, 57, 60], [53, 57, 60], [55, 59, 62], [55, 59, 62]];
const LEAD = [76, 72, 74, 76, 79, 77, 76, 72];

const START: Record<Lane, boolean[]> = {
  drums: [true, false, true, true, true, false, true, false],
  bass: [true, false, false, true, true, false, false, true],
  chords: [true, false, false, false, true, false, true, false],
  lead: [false, true, true, false, false, true, true, true],
};

function tone(ctx: AudioContext, out: AudioNode, t: number, type: OscillatorType, f: number, len: number, vol: number) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = f;
  g.gain.setValueAtTime(vol, t);
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

function kick(ctx: AudioContext, out: AudioNode, t: number) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.frequency.setValueAtTime(150, t);
  o.frequency.exponentialRampToValueAtTime(45, t + 0.14);
  g.gain.setValueAtTime(0.9, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
  o.connect(g).connect(out);
  o.start(t);
  o.stop(t + 0.22);
}

function playStep(ctx: AudioContext, out: AudioNode, grid: Record<Lane, boolean[]>, i: number, t: number) {
  if (grid.drums[i]) {
    if (i % 4 === 0) kick(ctx, out, t);
    else if (i % 4 === 2) noise(ctx, out, t, 0.16, 0.35, 1200);
    else noise(ctx, out, t, 0.05, 0.18, 7000);
  }
  if (grid.bass[i]) tone(ctx, out, t, 'square', hz(BASS[i]), STEP_S * 0.9, 0.16);
  if (grid.chords[i]) for (const n of CHORDS[i]) tone(ctx, out, t, 'triangle', hz(n), STEP_S * 1.8, 0.09);
  if (grid.lead[i]) tone(ctx, out, t, 'square', hz(LEAD[i]), STEP_S * 0.7, 0.07);
}

export function BitBounceLaunch() {
  const [grid, setGrid] = useState(START);
  const [step, setStep] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const gridRef = useRef(grid);
  const audio = useRef<{ ctx: AudioContext; out: GainNode } | null>(null);
  const loop = useRef(0);
  const pending = useRef(new Set<number>());
  useEffect(() => { gridRef.current = grid; }, [grid]);

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

  const play = async () => {
    if (playing) { stop(); return; }
    unmuteOnIOS();
    if (!audio.current) {
      const ctx = createAudioContext();
      if (!ctx) return;
      const out = ctx.createGain();
      out.gain.value = 0.5;
      out.connect(ctx.destination);
      audio.current = { ctx, out };
    }
    const { ctx, out } = audio.current;
    // Schedule only once the clock runs. An interrupted session (a call, Siri)
    // refuses to resume; the next tap tries again.
    try { await ctx.resume(); } catch { return; }
    clearInterval(loop.current);
    let next = ctx.currentTime + 0.06;
    let i = 0;
    // Look ahead 120ms on a 30ms tick; the UI catches up with a timeout per step.
    const tick = () => {
      while (next < ctx.currentTime + 0.12) {
        const at = i;
        playStep(ctx, out, gridRef.current, at, next);
        const id = window.setTimeout(() => { pending.current.delete(id); setStep(at); }, (next - ctx.currentTime) * 1000);
        pending.current.add(id);
        next += STEP_S;
        i = (i + 1) % STEPS;
      }
    };
    loop.current = window.setInterval(tick, 30);
    tick();
    setPlaying(true);
  };

  const toggle = (lane: Lane, i: number) =>
    setGrid((g) => ({ ...g, [lane]: g[lane].map((on, j) => (j === i ? !on : on)) }));

  return (
    <section className="world world-bb" id="bitbounce" aria-labelledby="bb-title">
      <div className="bb-top">
        <div className="bb-copy">
          <p className="bb-kicker"><span className="bb-led" />Free beta on iPhone and iPad</p>
          <h2 className="bb-brand" id="bb-title">
            <img src={logo} alt="" width="52" height="52" />
            BitBounce
          </h2>
          <p className="bb-headline">Make the beat. <em>Then make it a song.</em></p>
          <p className="bb-desc">
            A free music studio built like a toy groovebox. Program drums, bass, chords and leads on a grid,
            chain the patterns into a song, mix it with real effects and export it when it&rsquo;s done.
          </p>
          <StoreButtons stores={BITBOUNCE.stores} app="BitBounce" className="bb-stores" />
          <p className="bb-note">
            No account, no ads. Android is on the way.{' '}
            <a href={BITBOUNCE.site} target="_blank" rel="noopener noreferrer">
              bitbounce.app <span aria-hidden="true">&#8599;</span>
            </a>
          </p>
        </div>

        <div className="bb-devices">
          <div className="bb-ipad">
            <img src={ipadShot} alt="BitBounce on iPad, showing the Song page with sections of pattern blocks" width="1600" height="1112" loading="lazy" />
          </div>
          <div className="bb-phone">
            <img src={phoneShot} alt="BitBounce on iPhone, editing a chords pattern on the note grid" width="720" height="1565" loading="lazy" />
          </div>
        </div>
      </div>

      <div className="bb-box">
        <div className="bb-transport">
          <button type="button" className="bb-key bb-key-play" aria-pressed={playing} onClick={() => void play()}>
            <span aria-hidden="true">{playing ? '■' : '▶'}</span> {playing ? 'Stop' : 'Play'}
          </button>
          <div className="bb-lcd" aria-hidden="true">
            <span><small>BPM</small> {BPM}</span>
            <span><small>STEP</small> {step >= 0 ? `1.${step + 1}` : '--'}</span>
          </div>
          <p className="bb-hint">Try it here. Tap a step, then press play.</p>
        </div>
        <div className="bb-grid">
          {LANES.map((lane) => (
            <div key={lane.id} className="bb-lane" data-lane={lane.id} role="group" aria-label={lane.name}>
              <span className="bb-lane-name">{lane.name}</span>
              {grid[lane.id].map((on, i) => (
                <button
                  key={i}
                  type="button"
                  className="bb-cell"
                  aria-pressed={on}
                  aria-label={`${lane.name} step ${i + 1}`}
                  data-now={step === i || undefined}
                  onClick={() => toggle(lane.id, i)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
