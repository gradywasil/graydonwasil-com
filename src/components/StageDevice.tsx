import { useEffect, useMemo, useState } from 'react';
import type { OrbitItem, StageScreen } from '../data/site';
import { letters, schedule } from '../lib/morse';
import { tapeGroups } from '../lib/morse-tape';
import { SenderScreen } from './MorsePhones';

/* The middle of the hero orbit: the picked item's real screen, standing where
 * the rings cross. A phone for apps and phone games, a browser window for the
 * rest. Morse runs its own interface, as in its section, and RhymePage shows
 * its rehearsal sheet. When the pick changes the old screen shrinks away and
 * the new one switches on in the item's colour. */

const MORSE_TEXT = 'HI THERE';
const WPM = 8;
const LEAVE_MS = 260;

export function MorseScreen() {
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

function StageDevice({ screen, accent, leaving }: { screen: StageScreen; accent: string; leaving?: boolean }) {
  const shared = { 'data-leaving': leaving || undefined, style: { ['--accent' as string]: accent } };
  if (screen.kind === 'browser') {
    return (
      <figure className="stage-device stage-browser" {...shared}>
        <div className="stage-bar"><i /><i /><i /><span>{screen.host}</span></div>
        <img src={screen.src} alt="" width={screen.w} height={screen.h} draggable={false} />
      </figure>
    );
  }
  if (screen.kind === 'phone') {
    return (
      <figure className="stage-device stage-phone" {...shared}>
        <img src={screen.src} alt="" width={screen.w} height={screen.h} draggable={false} />
      </figure>
    );
  }
  if (screen.kind === 'morse') {
    return <div className="stage-device stage-phone stage-morse" {...shared}><MorseScreen /></div>;
  }
  return (
    <div className="stage-device stage-lyrics" {...shared}>
      <p><span data-state="sung">writing a </span><span data-state="now">couple</span> bars</p>
      <p>empty brain&rsquo;s reservoirs</p>
      <div className="rp-beat"><i /><i data-on="true" /><i /><i /></div>
    </div>
  );
}

export function StageCentre({ item }: { item: OrbitItem }) {
  const [shown, setShown] = useState(item);
  const [leaving, setLeaving] = useState<OrbitItem | null>(null);
  // A new pick: the screen that was up gets a moment to leave.
  if (shown.id !== item.id) {
    setLeaving(shown);
    setShown(item);
  }
  useEffect(() => {
    if (!leaving) return;
    const t = window.setTimeout(() => setLeaving(null), LEAVE_MS);
    return () => clearTimeout(t);
  }, [leaving]);

  return (
    <>
      {leaving && <StageDevice key={`out-${leaving.id}`} screen={leaving.screen} accent={leaving.accent} leaving />}
      <StageDevice key={shown.id} screen={shown.screen} accent={shown.accent} />
    </>
  );
}
