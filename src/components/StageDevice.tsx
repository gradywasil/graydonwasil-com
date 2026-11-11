import { useMemo } from 'react';
import type { StageScreen } from '../data/site';
import { letters, schedule } from '../lib/morse';
import { tapeGroups } from '../lib/morse-tape';
import { SenderScreen } from './MorsePhones';

/* The picked item's real screen, rising from behind the hero card: a phone
 * for apps and phone games, a browser window for the rest. Morse runs its own
 * interface, as in its section, and RhymePage shows its rehearsal sheet. */

const MORSE_TEXT = 'HI GURPY';
const WPM = 8;

function MorseScreen() {
  const view = useMemo(() => {
    const chars = letters(MORSE_TEXT);
    const steps = schedule(MORSE_TEXT);
    const groups = tapeGroups(chars);
    const seconds = Math.round((steps.reduce((n, s) => n + s.units, 0) * (1200 / WPM)) / 1000);
    return {
      state: 'idle' as const, text: MORSE_TEXT, groups, letter: 0, mark: 0,
      marks: steps.filter((s) => s.on).length, fire: 0, seconds, wpm: WPM, sent: '',
    };
  }, []);
  return <SenderScreen v={view} />;
}

export function StageDevice({ screen }: { screen: StageScreen }) {
  return (
    <div className="stage-slot" data-kind={screen.kind} aria-hidden="true">
      {screen.kind === 'browser' && (
        <figure className="stage-device stage-browser">
          <div className="stage-bar"><i /><i /><i /><span>{screen.host}</span></div>
          <img src={screen.src} alt="" width={screen.w} height={screen.h} draggable={false} />
        </figure>
      )}
      {screen.kind === 'phone' && (
        <figure className="stage-device stage-phone">
          <img src={screen.src} alt="" width={screen.w} height={screen.h} draggable={false} />
        </figure>
      )}
      {screen.kind === 'morse' && (
        <div className="stage-device stage-phone stage-morse"><MorseScreen /></div>
      )}
      {screen.kind === 'lyrics' && (
        <div className="stage-device stage-lyrics">
          <p><span data-state="sung">writing a </span><span data-state="now">couple</span> bars</p>
          <p>empty brain&rsquo;s reservoirs</p>
          <div className="rp-beat"><i /><i data-on="true" /><i /><i /></div>
        </div>
      )}
    </div>
  );
}
