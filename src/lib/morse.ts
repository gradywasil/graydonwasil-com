export const CODE: Record<string, string> = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..',
  J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.',
  S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..',
  0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-', 5: '.....', 6: '-....',
  7: '--...', 8: '---..', 9: '----.',
};

export function clean(text: string): string {
  return text.toUpperCase().replace(/[^A-Z0-9 ]/g, '').replace(/ {2,}/g, ' ');
}

export interface Letter { char: string; code: string; }

export function letters(text: string): Letter[] {
  return [...clean(text)].map((char) => ({ char, code: CODE[char] ?? '' }));
}

/** One beat of the signal: light on or off for `units` dits. `letter` and
 *  `symbol` point at the dot or dash being sent; `done` marks the last mark
 *  of a letter so the receiver can decode it as soon as the light goes off. */
export interface Step { on: boolean; units: number; letter: number; symbol: number; done?: boolean; }

export function schedule(text: string): Step[] {
  const steps: Step[] = [];
  letters(text).forEach((l, li, all) => {
    if (l.char === ' ') return;
    [...l.code].forEach((s, si) => {
      steps.push({ on: true, units: s === '.' ? 1 : 3, letter: li, symbol: si, done: si === l.code.length - 1 });
      if (si < l.code.length - 1) steps.push({ on: false, units: 1, letter: li, symbol: si });
    });
    const next = all[li + 1];
    if (next) steps.push({ on: false, units: next.char === ' ' ? 7 : 3, letter: li, symbol: -1 });
  });
  return steps;
}

export function durationUnits(text: string): number {
  return schedule(text).reduce((n, s) => n + s.units, 0);
}
