import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { MORSE } from '../data/site';
import { clean, letters, schedule, type Step } from '../lib/morse';
import { AndroidLogo, AppleLogo, StoreButtons } from './StoreButtons';

/* Morse, demoed the way it works in real life. Two phones run a miniature of
 * the app: the sender's Broadcast screen punches its tape as its flashlight
 * (top-right corner) fires, and the receiver, turned to face it, shows what
 * its camera sees, punches its own tape and decodes the message. */

const UNIT_MS = 110;
const MAX = 16;

interface Mark { x: number; w: number; step: number }
interface Label { x: number; char: string; letter: number }

/** Lay the whole message out on tape, in Morse units, the way the app does. */
function layout(steps: Step[], text: string) {
  const chars = letters(text);
  const marks: Mark[] = [];
  const labels: Label[] = [];
  const starts: number[] = [];
  let t = 0;
  steps.forEach((s, i) => {
    starts.push(t);
    if (s.on) {
      marks.push({ x: t, w: s.units, step: i });
      if (s.symbol === 0) labels.push({ x: t, char: chars[s.letter].char, letter: s.letter });
    }
    t += s.units;
  });
  return { marks, labels, starts, total: t };
}

function Tape({ marks, labels, step, head, ms, receiver, letter }: {
  marks: Mark[]; labels: Label[]; step: number; head: number; ms: number; receiver?: boolean; letter: number;
}) {
  return (
    <div className="mt-tape" data-receiver={receiver || undefined}>
      <div className="mt-strip" style={{ '--pos': head, '--ms': `${ms}ms` } as CSSProperties}>
        {labels.map((l) => (
          <b
            key={l.x}
            className="mt-char"
            style={{ '--x': l.x } as CSSProperties}
            data-on={l.letter === letter || undefined}
            data-hidden={(receiver && l.letter > letter) || undefined}
          >
            {l.char}
          </b>
        ))}
        {marks.map((m) => (
          <i
            key={m.x}
            className="mt-mark"
            style={{ '--x': m.x, '--w': m.w } as CSSProperties}
            data-sent={m.step <= step || undefined}
            data-hidden={(receiver && m.step > step) || undefined}
          />
        ))}
      </div>
      <span className="mt-head" />
    </div>
  );
}

function ScreenHead({ mode }: { mode: 'send' | 'receive' }) {
  return (
    <p className="ms-head">
      <b><i />MORSE</b>
      <span data-on={mode === 'send' || undefined}>Broadcast</span>
      <span data-on={mode === 'receive' || undefined}>Receive</span>
    </p>
  );
}

export function MorseLaunch() {
  const [text, setText] = useState('HI GURPY');
  const [playing, setPlaying] = useState(false);
  const [lamp, setLamp] = useState(false);
  const [step, setStep] = useState(-1);
  const [head, setHead] = useState({ pos: 0, ms: 0 });
  const [received, setReceived] = useState('');
  const [sound, setSound] = useState(false);
  const run = useRef(0);
  const audio = useRef<{ ctx: AudioContext; gain: GainNode } | null>(null);

  const steps = useMemo(() => schedule(text), [text]);
  const tape = useMemo(() => layout(steps, text), [steps, text]);
  const seconds = Math.round((tape.total * UNIT_MS) / 1000);
  const letter = step >= 0 ? steps[step]?.letter ?? -1 : -1;

  useEffect(() => () => { run.current++; void audio.current?.ctx.close(); }, []);

  const tone = (on: boolean) => {
    const a = audio.current;
    if (!a) return;
    a.gain.gain.setTargetAtTime(on ? 0.12 : 0, a.ctx.currentTime, 0.006);
  };

  const ensureAudio = () => {
    if (audio.current) return;
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 620;
    gain.gain.value = 0;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    audio.current = { ctx, gain };
  };

  const reset = () => {
    setLamp(false);
    setStep(-1);
    setHead({ pos: 0, ms: 0 });
    tone(false);
  };

  const stop = () => {
    run.current++;
    setPlaying(false);
    reset();
  };

  const send = async () => {
    if (playing) { stop(); return; }
    if (!steps.length) return;
    const id = ++run.current;
    if (sound) { ensureAudio(); void audio.current?.ctx.resume(); }
    reset();
    setPlaying(true);
    setReceived('');
    const chars = letters(text);
    for (let i = 0; i < steps.length; i++) {
      const s = steps[i];
      if (run.current !== id) return;
      setLamp(s.on);
      if (sound) tone(s.on);
      setStep(i);
      setHead({ pos: tape.starts[i] + s.units, ms: s.units * UNIT_MS });
      await new Promise((r) => setTimeout(r, s.units * UNIT_MS));
      if (run.current !== id) return;
      // Decode a letter as soon as its last mark ends, with any space before it.
      if (s.done) setReceived(chars.slice(0, s.letter + 1).map((c) => c.char).join(''));
    }
    setLamp(false);
    tone(false);
    setPlaying(false);
  };

  return (
    <section className="world world-morse" id="morse" aria-labelledby="morse-title">
      <div className="morse-grid">
        <div className="morse-copy">
          <p className="kicker morse-kicker">
            <AppleLogo className="kicker-logo" />
            <AndroidLogo className="kicker-logo" />
            App #1 &middot; iPhone &amp; Android
          </p>
          <h2 className="morse-title" id="morse-title">
            My first app is <span>almost in your pocket.</span>
          </h2>
          <p className="morse-lede">
            <strong>Morse</strong> turns a few words into light, sound and vibration. Point another
            phone&rsquo;s camera at the flashes and it reads them back into text.
          </p>

          <div className="morse-demo">
            <div className="morse-field">
              <label htmlFor="morse-input">Try it. Type a message</label>
              <span className="morse-count">{clean(text).length} / {MAX}</span>
              <input
                id="morse-input"
                value={text}
                maxLength={MAX}
                autoComplete="off"
                spellCheck={false}
                onChange={(e) => { if (playing) stop(); setText(clean(e.target.value).slice(0, MAX)); }}
                onKeyDown={(e) => { if (e.key === 'Enter') void send(); }}
              />
            </div>
            <button type="button" className="morse-send" onClick={() => void send()} disabled={!clean(text).trim()}>
              <span aria-hidden="true">{playing ? '■' : '▶'}</span>
              {playing ? 'Stop' : 'Send a signal'}
            </button>
            <div className="morse-meta">
              <span>{seconds}s at 11 WPM</span>
              <label className="morse-sound">
                <input type="checkbox" checked={sound} onChange={(e) => setSound(e.target.checked)} />
                Sound
              </label>
            </div>
          </div>

          <StoreButtons stores={MORSE.stores} app="Morse" className="morse-stores" />
          <p className="morse-note">
            {MORSE.stores.android.state === 'beta' && (
              <>
                <b>Android beta:</b>{' '}
                <a href={MORSE.group} target="_blank" rel="noopener noreferrer">join the testers group</a>, then opt in.{' '}
              </>
            )}
            {MORSE.stores.ios.state === 'review' && 'The iPhone version is in App Store review. '}
            No phone handy? <a href={MORSE.webApp} target="_blank" rel="noopener noreferrer">Try it in your browser</a>
            {' '}or <a href={MORSE.site} target="_blank" rel="noopener noreferrer">see how it works</a>.
          </p>
        </div>

        <div className="morse-stage" data-on={lamp || undefined} data-playing={playing || undefined} aria-hidden="true">
          <svg className="morse-beam" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="morse-beam-fill" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#fff4d6" stopOpacity="0.95" />
                <stop offset="0.35" stopColor="#f7b24c" stopOpacity="0.55" />
                <stop offset="1" stopColor="#f7b24c" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points="36,13.5 66,4 68,30" fill="url(#morse-beam-fill)" />
          </svg>

          <div className="mphone mphone-send">
            <i className="mphone-torch" />
            <div className="mscreen">
              <ScreenHead mode="send" />
              <p className="ms-label">Your message <span>{seconds}s to send</span></p>
              <p className="ms-msg">{clean(text) || ' '}</p>
              <Tape marks={tape.marks} labels={tape.labels} step={step} head={head.pos} ms={head.ms} letter={letter} />
              <p className="ms-status"><i data-on={lamp || undefined} />{playing ? 'Sending · flashlight on' : 'Ready to send'}</p>
              <p className="ms-lights">
                <span data-on={!playing || undefined}>Standby</span>
                <span>Caution</span>
                <span data-on={playing || undefined}>Go</span>
              </p>
              <p className="ms-opts"><span>Options</span><span>11 WPM</span></p>
              <p className="ms-key" data-on={playing || undefined}>{playing ? 'Stop' : 'Broadcast'}</p>
            </div>
          </div>

          <div className="mphone mphone-receive">
            <div className="mscreen">
              <ScreenHead mode="receive" />
              <Tape marks={tape.marks} labels={tape.labels} step={step} head={head.pos} ms={head.ms} letter={letter} receiver />
              <p className="ms-status"><i data-on={playing || undefined} />{playing ? 'Receiving' : 'Listening'}</p>
              <div className="ms-view">
                <span className="ms-view-phone"><i data-on={lamp || undefined} /></span>
                <span className="ms-view-box" />
                <span className="ms-meter">{playing ? 'Hearing light' : 'Hearing nothing'}</span>
              </div>
              <div className="ms-recv">
                <small>Received message</small>
                <strong>{received}<i data-live={playing || undefined} /></strong>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">{!playing && received ? `Received: ${received}` : ''}</p>
    </section>
  );
}
