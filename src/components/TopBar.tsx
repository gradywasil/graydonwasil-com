import type { CSSProperties } from 'react';
import { gameById } from '../data/games';
import { BITBOUNCE, KILOPIXEL, MORSE, ORBIT_ITEMS } from '../data/site';
import { GurpyFace } from './GurpyFace';

/* The top bar. Each tab is a project's own icon and name, and the tab for the
 * world on screen (or the app open in the hero's phone) is lit: it takes that
 * project's colours and type, and does one small thing of the project's own.
 * Morse's lamp sends M, Kilopixel arrives in hard steps, BitBounce is a keycap
 * with its four lanes stepping, and Games wears the colours and the sprite of
 * the game that is up in the arcade.
 *
 * On a phone a tab is its icon alone, and only the lit one opens out to show
 * its name, so all of them fit. */

const APPS = [
  { id: 'morse', name: 'Morse', icon: MORSE.icon },
  { id: 'kilopixel', name: 'Kilopixel', icon: KILOPIXEL.icon },
  { id: 'bitbounce', name: 'BitBounce', icon: BITBOUNCE.icon },
];
const TABBED = new Set(['morse', 'kilopixel', 'bitbounce', 'games', 'hello']);

export function TopBar({ still, here, staged, gameId }: {
  still: boolean;
  /** The id of the section on screen. */
  here: string;
  /** What is open in the hero's phone, if anything. */
  staged: string | null;
  /** The game that is up in the arcade. */
  gameId: string;
}) {
  const stagedItem = ORBIT_ITEMS.find((i) => i.id === staged);
  const stagedTab = stagedItem?.ring === 'games' ? 'games' : stagedItem?.id;
  // Down the page, the world on screen is lit. Up in the hero, whatever is open in the phone is.
  const lit = TABBED.has(here) ? here : here === 'top' || here === '' ? stagedTab : undefined;
  const on = (id: string) => (lit === id ? '' : undefined);
  const at = (id: string) => (here === id ? 'true' as const : undefined);

  // The Games tab shows the game open in the phone, or else the one up in the arcade.
  const game = gameById(stagedItem?.ring === 'games' ? stagedItem.id : gameId);
  const sprite = ORBIT_ITEMS.find((i) => i.id === game.id);

  return (
    <nav className="topbar" aria-label="Sections">
      <a href="#top" className="brand" aria-label="Graydon Wasil, back to the top">
        <GurpyFace still={still} />
        <span>Graydon Wasil</span>
      </a>
      <div className="toplinks">
        {APPS.map((app) => (
          <a key={app.id} href={`#${app.id}`} className="top-tab" data-world={app.id} data-on={on(app.id)} aria-current={at(app.id)}>
            <img className="top-icon" src={app.icon} alt="" width="26" height="26" />
            <span className="top-name">
              <span>
                {app.name}
                {app.id === 'morse' && <i className="top-lamp" aria-hidden="true" />}
                {app.id === 'bitbounce' && <span className="top-steps" aria-hidden="true"><i /><i /><i /><i /></span>}
              </span>
            </span>
          </a>
        ))}
        <a
          href="#games"
          className="top-tab"
          data-world="games"
          data-on={on('games')}
          aria-current={at('games')}
          style={{ '--tab': game.theme.a, '--tab-bg': game.theme.bg } as CSSProperties}
        >
          <img
            className="top-icon"
            key={game.id}
            src={sprite?.icon ?? game.thumb.src}
            alt=""
            width="26"
            height="26"
            data-sprite=""
            data-px={sprite?.pixel || undefined}
          />
          <span className="top-name"><span>Games</span></span>
        </a>
        <a href="#hello" className="top-tab top-hi" data-on={on('hello')} aria-current={at('hello')}>
          <span className="top-fold"><span>Say&nbsp;</span></span>hi
        </a>
      </div>
    </nav>
  );
}
