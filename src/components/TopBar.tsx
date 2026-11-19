import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { cartridgeById, type Cartridge } from '../data/cartridges';
import { gameById } from '../data/games';
import { ORBIT_ITEMS, type OrbitItem } from '../data/site';
import { GurpyFace } from './GurpyFace';

/* The top bar. Three tabs, however many projects there are: Apps, Games and Say hi.
 * Apps and Games are folders, the way a phone keeps them: four of their icons, small.
 * Games covers the cartridges below the arcade too: there the loaded cartridge comes out of the folder.
 *
 * What is being viewed comes out of its folder as a chip beside it: the project on
 * screen, or whatever is open in the hero's phone. The chip wears its project (its
 * icon, colours and type) and does one small thing of the project's own. Morse's lamp
 * sends M, Kilopixel arrives in hard steps, BitBounce is a keycap with its four lanes
 * stepping, RhymePage rehearses its name a word at a time, and a game brings its two
 * colours and its sprite.
 *
 * Every project in `ORBIT_ITEMS` gets a chip from its icon, name and accent, so a new
 * one needs nothing here. What a project does of its own is `OWN` below plus its
 * `.top-now[data-world]` rules in site.css. */

const APPS = ORBIT_ITEMS.filter((i) => i.ring === 'apps');
const GAMES = ORBIT_ITEMS.filter((i) => i.ring === 'games');

/** What a project adds to its own chip: its name set differently, or something after it. */
const OWN: Record<string, { name?: ReactNode; extra?: ReactNode }> = {
  morse: { extra: <i className="top-lamp" aria-hidden="true" /> },
  bitbounce: { extra: <span className="top-steps" aria-hidden="true"><i /><i /><i /><i /></span> },
  rhymepage: { name: <><b>Rhyme</b><b>Page</b></> },
};

/** The four icons a folder shows: the first four, with the one being viewed always among them. */
function folder(items: OrbitItem[], current?: OrbitItem) {
  const four = items.slice(0, 4);
  if (current && !four.includes(current)) four[3] = current;
  return four;
}

/** A name that may not fit. When it does not, it slides to its end and back (site.css, `top-tick`). */
function Ticker({ children }: { children: ReactNode }) {
  const box = useRef<HTMLSpanElement>(null);
  const [over, setOver] = useState(0);
  useEffect(() => {
    const el = box.current;
    const text = el?.firstElementChild as HTMLElement | null;
    if (!el || !text) return;
    const measure = () => {
      // (The box gets a little padding to fade the name through once it is sliding; that is not room.)
      const room = el.clientWidth - parseFloat(getComputedStyle(el).paddingLeft);
      // (A closed chip has no width at all; that is not a name that does not fit.)
      setOver(room > 8 ? Math.max(0, text.offsetWidth - room) : 0);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    ro.observe(text);
    return () => ro.disconnect();
  }, []);
  return (
    <span ref={box} className="top-tick" data-over={over > 1 ? '' : undefined} style={{ '--over': `${over}px` } as CSSProperties}>
      <span>{children}</span>
    </span>
  );
}

function Folder({ label, href, items, lit, open }: { label: string; href: string; items: OrbitItem[]; lit?: string; open?: boolean }) {
  return (
    <a href={href} className="top-tab top-folder" data-open={lit || open ? '' : undefined}>
      <span className="top-stack" aria-hidden="true">
        {items.map((i) => (
          <img
            key={i.id}
            src={i.icon}
            alt=""
            width="10"
            height="10"
            data-sprite={i.ring === 'games' ? '' : undefined}
            data-lit={i.id === lit ? '' : undefined}
          />
        ))}
      </span>
      <span className="top-name"><span>{label}</span></span>
    </a>
  );
}

/** The cartridge in the console, out of its folder: its title screen as the label, its colour, and the
 *  gold pins it plugs in by, crawling underneath. Switching cartridges plugs the new one in. */
function CartChip({ cart, on, current }: { cart: Cartridge; on: boolean; current: boolean }) {
  return (
    <span className="top-slot" data-on={on ? '' : undefined}>
      <span className="top-clip">
        <a
          href="#cartridges"
          className="top-now"
          data-world="carts"
          data-game={cart.id}
          inert={!on}
          aria-current={on && current ? 'location' : undefined}
          style={{ '--accent': cart.colour, ...(cart.alt && { '--b': cart.alt }) } as CSSProperties}
        >
          <img className="top-icon" key={cart.id} src={cart.art} alt="" width="26" height="26" data-sprite="" data-px="" />
          <span className="top-label">
            <Ticker key={cart.id}>
              <span className="sr-only">Now viewing </span>
              {cart.title}
            </Ticker>
            <i className="top-pins" aria-hidden="true" />
          </span>
        </a>
      </span>
    </span>
  );
}

function Chip({ item, on, current, bg, b }: {
  item: OrbitItem;
  /** Out of its folder. */
  on: boolean;
  /** Its section is the one on screen (rather than it being open in the hero's phone). */
  current: boolean;
  bg?: string;
  /** A game's second colour. */
  b?: string;
}) {
  const own = OWN[item.id];
  const game = item.ring === 'games';
  return (
    <span className="top-slot" data-on={on ? '' : undefined}>
      <span className="top-clip">
        <a
          href={`#${item.section}`}
          className="top-now"
          data-world={game ? 'games' : item.id}
          data-game={game ? item.id : undefined}
          inert={!on}
          aria-current={on && current ? 'location' : undefined}
          style={{ '--accent': item.accent, ...(bg && { '--tab-bg': bg }), ...(b && { '--b': b }) } as CSSProperties}
        >
          <img
            className="top-icon"
            key={item.id}
            src={item.icon}
            alt=""
            width="26"
            height="26"
            data-sprite={game ? '' : undefined}
            data-px={item.pixel || undefined}
          />
          <span className="top-label">
            <Ticker key={item.id}>
              <span className="sr-only">Now viewing </span>
              {own?.name ?? item.name}
            </Ticker>
            {own?.extra}
          </span>
        </a>
      </span>
    </span>
  );
}

export function TopBar({ still, here, staged, gameId, cartId }: {
  still: boolean;
  /** The id of the section on screen. */
  here: string;
  /** What is open in the hero's phone, if anything. */
  staged: string | null;
  /** The game that is up in the arcade. */
  gameId: string;
  /** The cartridge in the console. */
  cartId: string;
}) {
  // Down the page, the project on screen is the one being viewed. Up in the hero, whatever is open in the phone is.
  const open = here === 'top' || here === '' ? ORBIT_ITEMS.find((i) => i.id === staged) : undefined;
  const app = APPS.find((a) => a.section === here) ?? (open?.ring === 'apps' ? open : undefined);
  // The game: the one open in the phone, or else the one up in the arcade.
  const theme = gameById(open?.ring === 'games' ? open.id : gameId);
  const game = GAMES.find((g) => g.id === theme.id) ?? GAMES[0];
  const gameOn = here === 'games' || open?.ring === 'games';
  const cart = cartridgeById(cartId);
  const cartOn = here === 'cartridges';

  return (
    <nav className="topbar" aria-label="Sections">
      <a href="#top" className="brand" aria-label="Graydon Wasil, back to the top">
        <GurpyFace still={still} />
        <span>Graydon Wasil</span>
      </a>
      <div className="toplinks" data-viewing={app || gameOn || cartOn ? '' : undefined}>
        <div className="top-group" data-open={app ? '' : undefined}>
          <Folder label="Apps" href={`#${APPS[0].section}`} items={folder(APPS, app)} lit={app?.id} />
          {APPS.map((a) => <Chip key={a.id} item={a} on={a === app} current={a.section === here} />)}
        </div>
        <div className="top-group" data-open={gameOn || cartOn ? '' : undefined}>
          <Folder label="Games" href="#games" items={folder(GAMES, game)} lit={gameOn ? game.id : undefined} open={cartOn} />
          <Chip item={game} on={gameOn} current={here === 'games'} bg={theme.theme.bg} b={theme.theme.b} />
          <CartChip cart={cart} on={cartOn} current={cartOn} />
        </div>
        <a href="#hello" className="top-tab top-hi" data-on={here === 'hello' ? '' : undefined} aria-current={here === 'hello' ? 'true' : undefined}>
          <span className="top-fold"><span>Say&nbsp;</span></span>hi
        </a>
      </div>
    </nav>
  );
}
