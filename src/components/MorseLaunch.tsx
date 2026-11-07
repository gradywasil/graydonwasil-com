import { useEffect, useMemo, useRef, useState } from 'react';
import senderImg from '../assets/fun/morse-sender.webp';
import receiverImg from '../assets/fun/morse-receiver.webp';
import { MORSE } from '../data/site';
import { clean, letters, schedule } from '../lib/morse';
import { AndroidLogo, AppleLogo, StoreButtons } from './StoreButtons';

const UNIT_MS = 110;
const MAX = 16;

export function MorseLaunch() {
  const [text, setText] = useState('HI GURPY');
  const [playing, setPlaying] = useState(false);
  const [lamp, setLamp] = useState(false);
  const [cursor, setCursor] = useState<{ letter: number; symbol: number }>({ letter: -1, symbol: -1 });
  const [received, setReceived] = useState('');
  const [sound, setSound] = useState(false);
  const run = useRef(0);
  const audio = useRef<{ ctx: AudioContext; gain: GainNode } | null>(null);
  const tapeRef = useRef<HTMLDivElement>(null);

  const message = useMemo(() => letters(text), [text]);
  const seconds = Math.round((schedule(text).reduce((n, s) => n + s.units, 0) * UNIT_MS) / 1000);

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

  const stop = () => {
    run.current++;
    setPlaying(false);
    setLamp(false);
    setCursor({ letter: -1, symbol: -1 });
    tone(false);
  };

  const send = async () => {
    if (playing) { stop(); return; }
    const steps = schedule(text);
    if (!steps.length) return;
    const id = ++run.current;
    if (sound) { ensureAudio(); void audio.current?.ctx.resume(); }
    setPlaying(true);
    setReceived('');
    const chars = letters(text);
    let decoded = '';
    for (const step of steps) {
      if (run.current !== id) return;
      setLamp(step.on);
      if (sound) tone(step.on);
      if (step.on) setCursor({ letter: step.letter, symbol: step.symbol });
      await new Promise((r) => setTimeout(r, step.units * UNIT_MS));
      if (run.current !== id) return;
      if (step.done) {
        // Catch up any spaces before this letter, then the letter itself.
        decoded = chars.slice(0, step.letter + 1).map((c) => c.char).join('');
        setReceived(decoded);
      }
    }
    setLamp(false);
    tone(false);
    setPlaying(false);
    setCursor({ letter: -1, symbol: -1 });
  };

  // Keep the active letter in view on the tape.
  useEffect(() => {
    const tape = tapeRef.current;
    const el = tape?.querySelector<HTMLElement>(`[data-letter="${cursor.letter}"]`);
    if (!tape || !el) return;
    tape.scrollTo({ left: el.offsetLeft - tape.clientWidth / 2 + el.clientWidth / 2, behavior: 'smooth' });
  }, [cursor.letter]);

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
            <div className="morse-tape" ref={tapeRef} aria-hidden="true">
              {message.map((l, li) => (
                <span key={li} className="tape-letter" data-letter={li} data-space={l.char === ' ' || undefined}>
                  <b data-on={cursor.letter === li || undefined}>{l.char}</b>
                  <span className="tape-marks">
                    {[...l.code].map((s, si) => (
                      <i
                        key={si}
                        data-dah={s === '-' || undefined}
                        data-sent={cursor.letter > li || (cursor.letter === li && cursor.symbol >= si) || undefined}
                      />
                    ))}
                  </span>
                </span>
              ))}
            </div>
            <div className="morse-meta">
              <span>{seconds}s at 11 WPM</span>
              <label className="morse-sound">
                <input type="checkbox" checked={sound} onChange={(e) => setSound(e.target.checked)} />
                Sound
              </label>
            </div>
          </div>

          <div className="morse-get">
            <StoreButtons stores={MORSE.stores} app="Morse" />
            <p className="morse-steps">
              {MORSE.stores.android.state === 'beta' && (
                <>
                  <b>Android beta:</b>{' '}
                  <a href={MORSE.group} target="_blank" rel="noopener noreferrer">join the testers group</a>, then opt in.{' '}
                </>
              )}
              {MORSE.stores.ios.state === 'review' && 'The iPhone version is in App Store review.'}
            </p>
          </div>
          <p className="morse-alt">
            No phone handy? <a href={MORSE.webApp} target="_blank" rel="noopener noreferrer">Try it in your browser</a>
            {' '}or <a href={MORSE.site} target="_blank" rel="noopener noreferrer">see how it works</a>.
          </p>
        </div>

        <div className="morse-stage" data-on={lamp || undefined} aria-hidden="true">
          <img className="morse-phone morse-phone-send" src={senderImg} alt="" width="440" height="858" loading="lazy" />
          <div className="morse-beam" />
          <div className="morse-lamp" />
          <img className="morse-phone morse-phone-receive" src={receiverImg} alt="" width="440" height="731" loading="lazy" />
          <div className="morse-readout">
            <span>Their camera reads</span>
            <strong>{received || ' '}<i data-live={playing || undefined} /></strong>
          </div>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">{!playing && received ? `Received: ${received}` : ''}</p>
    </section>
  );
}
