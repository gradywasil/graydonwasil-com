import { Fragment, type CSSProperties } from 'react';

/* Splits a headline into words and letters so each world can bring its own
 * in its own way (keyed in, on the beat, tumbling). Words stay whole when the
 * line wraps. The split copy is for the eyes only: give the heading the same
 * sentence in a `.sr-only` span and hide this one from assistive tech. */
export function Split({ text, at = 0, word = 0 }: {
  text: string;
  /** Index of the first letter, when a headline is split in several parts. */
  at?: number;
  /** Index of the first word, likewise. */
  word?: number;
}) {
  let i = at;
  const words = text.split(' ');
  return words.map((w, n) => (
    <Fragment key={n}>
      <span className="sw" style={{ '--w': word + n } as CSSProperties}>
        {[...w].map((ch, c) => <span key={c} className="ch" style={{ '--i': i++ } as CSSProperties}>{ch}</span>)}
      </span>
      {n < words.length - 1 ? ' ' : null}
    </Fragment>
  ));
}
