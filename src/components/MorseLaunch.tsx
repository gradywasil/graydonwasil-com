import { useEffect, useMemo, useRef, useState } from 'react';
import { MORSE } from '../data/site';
import { clean, letters, schedule } from '../lib/morse';
import { tapeGroups } from '../lib/morse-tape';
import { ReceiverScreen, SenderScreen } from './MorsePhones';
import { AndroidLogo, AppleLogo, StoreButtons } from './StoreButtons';

/* Morse, demoed the way it works in real life. Two phones run the real Morse
 * interface (see MorsePhones): the sender broadcasts with the flashlight in
 * its top-right corner, and the receiver, turned to face it, shows what its
 * camera sees, punches its own tape and decodes the message. */

const WPM = 8; // the app's STANDARD step
const UNIT_MS = 1200 / WPM;
const MAX = 16;

export function MorseLaunch() {
  const [text, setText] = useState('HI GURPY');
  const [playing, setPlaying] = useState(false);
  const [finished, setFinished] = useState(false);
  const [lamp, setLamp] = useState(false);
  const [fire, setFire] = useState(0);
  const [letter, setLetter] = useState(-1);
  const [mark, setMark] = useState(0);
  const [heard, setHeard] = useState(0);
  const [liveMarks, setLiveMarks] = useState('');
  const [received, setReceived] = useState('');
  const [sound, setSound] = useState(false);
  const run = useRef(0);
  const audio = useRef<{ ctx: AudioContext; gain: GainNode } | null>(null);

  const msg = clean(text);
  const steps = useMemo(() => schedule(msg), [msg]);
  const chars = useMemo(() => letters(msg), [msg]);
  const groups = useMemo(() => tapeGroups(chars), [chars]);
  const totalMarks = steps.filter((x) => x.on).length;
  const seconds = Math.round((steps.reduce((n, x) => n + x.units, 0) * UNIT_MS) / 1000);
  // Tape groups skip spaces, so map a letter index to its group.
  const groupOf = useMemo(() => {
    let g = -1;
    return chars.map((c) => (c.char === ' ' ? g : ++g));
  }, [chars]);

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
    setLetter(-1);
    setMark(0);
    setHeard(0);
    setLiveMarks('');
    setFinished(false);
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
    setReceived('');
    setPlaying(true);
    let marksSent = 0;
    let live = '';
    for (const s of steps) {
      if (run.current !== id) return;
      setLamp(s.on);
      if (sound) tone(s.on);
      setLetter(groupOf[s.letter]);
      if (s.on) { marksSent++; setMark(marksSent); setFire(marksSent); }
      await new Promise((r) => setTimeout(r, s.units * UNIT_MS));
      if (run.current !== id) return;
      // The receiver punches each mark when its light goes off, and decodes a letter after its last one.
      if (s.on) { live += chars[s.letter].code[s.symbol]; setLiveMarks(live); }
      if (s.done) {
        live = '';
        setLiveMarks('');
        setHeard(groupOf[s.letter] + 1);
        setReceived(chars.slice(0, s.letter + 1).map((c) => c.char).join(''));
      }
    }
    setLamp(false);
    tone(false);
    setPlaying(false);
    setFinished(true);
  };

  const sentLetters = groups.length;
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
                onChange={(e) => { if (playing || finished) stop(); setText(clean(e.target.value).slice(0, MAX)); }}
                onKeyDown={(e) => { if (e.key === 'Enter') void send(); }}
              />
            </div>
            <button type="button" className="morse-send" onClick={() => void send()} disabled={!clean(text).trim()}>
              <span aria-hidden="true">{playing ? '■' : '▶'}</span>
              {playing ? 'Stop' : 'Send a signal'}
            </button>
            <div className="morse-meta">
              <span>{seconds}s at {WPM} WPM</span>
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
            <polygon points="34.5,10.5 66,4 68,30" fill="url(#morse-beam-fill)" />
          </svg>

          <div className="mphone mphone-send">
            <i className="mphone-torch" />
            <SenderScreen v={{
              state: playing ? 'broadcasting' : finished ? 'done' : 'idle',
              text: msg, groups, letter: playing || finished ? letter : 0, mark, marks: totalMarks, fire, seconds, wpm: WPM,
              sent: `${sentLetters} ${sentLetters === 1 ? 'LETTER' : 'LETTERS'} · ${seconds}S`,
            }} />
          </div>

          <div className="mphone mphone-receive">
            <ReceiverScreen v={{
              state: playing ? 'receive-active' : finished ? 'receive-done' : 'receive-armed',
              meter: playing ? 'decoding' : 'silence',
              groups, heard, liveMarks, text: received, lamp,
            }} />
          </div>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">{!playing && received ? `Received: ${received}` : ''}</p>
    </section>
  );
}
