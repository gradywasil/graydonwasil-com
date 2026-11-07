import type { Letter } from './morse';

/** The app's tape geometry (js/app.js PUNCH). */
export const PUNCH = { dot: 14, dash: 42, gap: 10, letter: 26, word: 58, lead: 44, trail: 44 };

export interface TapeGroup { char: string; code: string; left: number; width: number; center: number }

export function tapeGroups(chars: Letter[]): TapeGroup[] {
  const groups: TapeGroup[] = [];
  let x = PUNCH.lead;
  let space = false;
  for (const l of chars) {
    if (l.char === ' ') { space = true; continue; }
    if (groups.length) x += space ? PUNCH.word : PUNCH.letter;
    space = false;
    const width = [...l.code].reduce((w, s) => w + (s === '.' ? PUNCH.dot : PUNCH.dash), 0) + (l.code.length - 1) * PUNCH.gap;
    groups.push({ char: l.char, code: l.code, left: x, width, center: x + width / 2 });
    x += width;
  }
  return groups;
}

/** The receive tape grows from the left; the app keeps its edge just past the head. */
export function rxShift(groups: TapeGroup[], count: number, liveMarks: string) {
  const done = groups.slice(0, count);
  let edge = done.length ? done[done.length - 1].left + done[done.length - 1].width + PUNCH.letter : PUNCH.lead;
  if (liveMarks) edge += [...liveMarks].reduce((w, s) => w + (s === '.' ? PUNCH.dot : PUNCH.dash), 0) + (liveMarks.length - 1) * PUNCH.gap;
  return Math.max(PUNCH.lead, edge - 60);
}

