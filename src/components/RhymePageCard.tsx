import { useEffect, useRef, useState } from 'react';
import { RHYMEPAGE } from '../data/site';

/* RhymePage, in one gesture: press rehearse and the lines light up in time,
 * the way the app's rehearsal view walks you through a verse. */

const BARS = [
  ['writing', 'a', 'couple', 'bars'],
  ['empty', "brain's", 'reservoirs'],
];
const WORDS = BARS.flat();
const BEAT_MS = 380;

export function RhymePageCard() {
  const [at, setAt] = useState(-1);
  const timer = useRef(0);

  useEffect(() => () => clearInterval(timer.current), []);

  const rehearse = () => {
    clearInterval(timer.current);
    let i = 0;
    setAt(0);
    timer.current = window.setInterval(() => {
      i++;
      if (i > WORDS.length) { clearInterval(timer.current); setAt(-1); return; }
      setAt(i);
    }, BEAT_MS);
  };

  let n = -1;
  return (
    <article className="app-card rp-card" aria-labelledby="rp-title">
      <p className="app-status"><span className="dot" />Web app &middot; Android in the works</p>
      <h3 className="rp-title" id="rp-title">
        <img src={RHYMEPAGE.icon} alt="" width="40" height="40" />
        RhymePage
      </h3>
      <p className="app-desc">Write lyrics, sync them to a track, then rehearse in time.</p>
      <div className="rp-sheet" aria-hidden="true">
        {BARS.map((bar, bi) => (
          <p key={bi}>
            {bar.map((w) => {
              n++;
              return <span key={w} data-state={at === n ? 'now' : at > n ? 'sung' : undefined}>{w} </span>;
            })}
          </p>
        ))}
        <div className="rp-beat">
          {[0, 1, 2, 3].map((b) => <i key={b} data-on={at >= 0 && at % 4 === b ? 'true' : undefined} />)}
        </div>
      </div>
      <div className="app-actions">
        <button type="button" className="rp-btn" onClick={rehearse}>
          <span aria-hidden="true">▶</span> Rehearse
        </button>
        <a className="rp-link" href={RHYMEPAGE.site} target="_blank" rel="noopener noreferrer">
          rhymepage.com <span aria-hidden="true">&#8599;</span>
        </a>
      </div>
    </article>
  );
}
