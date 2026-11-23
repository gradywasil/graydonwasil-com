import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { CARTRIDGES, cartridgeById, type Cartridge } from '../data/cartridges';
import { COUCH } from '../data/couch-os';
import { gameById } from '../data/games';
import { ORBIT_ITEMS, type OrbitItem } from '../data/site';
import { GurpyFace } from './GurpyFace';

/* The top bar. Three tabs, however many projects there are: Apps, Games and Say hi.
 *
 * Apps and Games are folders, the way a phone keeps them: four of their icons, small. Pressing
 * one opens it the way a phone opens a folder, a panel of every icon in it, and each icon goes
 * straight to its thing: an app's section, a game up in the arcade (#games/<id>), a cartridge in
 * the console (#carts/<id>). The Games folder holds everything you play: COUCH·OS at the top
 * (the console, at the seam between the apps and the games), the browser games, then the
 * cartridges. Each group's heading goes to its own section.
 *
 * What is being viewed comes out of its folder as a chip beside it: the project on screen, or
 * whatever is open in the hero's phone. The chip wears its project (its icon, colours and type)
 * and does one small thing of the project's own. Morse's lamp sends M, Kilopixel arrives in hard
 * steps, BitBounce is a keycap with its four lanes stepping, RhymePage rehearses its name a word
 * at a time, COUCH·OS changes channel, a game brings its two colours and its sprite, and a
 * cartridge plugs in.
 *
 * Every project in `ORBIT_ITEMS` gets a chip from its icon, name and accent, so a new one needs
 * nothing here. What a project does of its own is `OWN` below plus its `.top-now[data-world]`
 * rules in site.css (games and cartridges: `[data-game]` in topbar-games.css). */

const APPS = ORBIT_ITEMS.filter((i) => i.ring === 'apps');
const GAMES = ORBIT_ITEMS.filter((i) => i.ring === 'games');

type FolderId = 'apps' | 'games';

/** What a project adds to its own chip: its name set differently, or something after it. */
const OWN: Record<string, { name?: ReactNode; extra?: ReactNode }> = {
  morse: { extra: <i className="top-lamp" aria-hidden="true" /> },
  bitbounce: { extra: <span className="top-steps" aria-hidden="true"><i /><i /><i /><i /></span> },
  rhymepage: { name: <><b>Rhyme</b><b>Page</b></> },
};

/** The four icons a folder shows: the first four, with the one being viewed always among them. */
function four(items: OrbitItem[], current?: OrbitItem) {
  const shown = items.slice(0, 4);
  if (current && !shown.includes(current)) shown[3] = current;
  return shown;
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

/** A folder's tab: its icons, small, and its name. It opens and closes its panel. */
function FolderTab({ id, label, icons, lit, viewing, open, onToggle }: {
  id: FolderId;
  label: string;
  icons: Array<{ key: string; src: string; sprite?: boolean; lit?: boolean }>;
  lit?: boolean;
  /** Something in it is out being viewed. */
  viewing?: boolean;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className="top-tab top-folder"
      data-open={lit || viewing ? '' : undefined}
      data-expanded={open ? '' : undefined}
      aria-expanded={open}
      aria-controls={`top-${id}`}
      onClick={onToggle}
    >
      <span className="top-stack" aria-hidden="true">
        {icons.map((i) => (
          <img key={i.key} src={i.src} alt="" width="10" height="10" data-sprite={i.sprite ? '' : undefined} data-lit={i.lit ? '' : undefined} />
        ))}
      </span>
      <span className="top-name"><span>{label}</span></span>
    </button>
  );
}

/** One icon in an open folder, with its name under it, as on a phone's home screen. */
function Tile({ href, icon, name, current, sprite, px, art, accent, index, onGo }: {
  href: string;
  icon: string;
  name: string;
  current?: boolean;
  /** A game's sprite: drawn whole, not as a rounded app icon. */
  sprite?: boolean;
  /** Pixel art: kept sharp. */
  px?: boolean;
  /** A cartridge: its title screen as a label. */
  art?: boolean;
  accent?: string;
  index: number;
  onGo: (href: string) => void;
}) {
  return (
    <li style={{ '--i': index, ...(accent && { '--accent': accent }) } as CSSProperties}>
      <a href={href} className="top-app" aria-current={current ? 'true' : undefined} onClick={() => onGo(href)} data-art={art ? '' : undefined}>
        <span className="top-app-tile" data-sprite={sprite ? '' : undefined}>
          <img src={icon} alt="" width="48" height="48" data-px={px ? '' : undefined} loading="lazy" />
        </span>
        <span className="top-app-name">{name}</span>
      </a>
    </li>
  );
}

/** The cartridge in the console, out of its folder: its title screen as the label, its colour, and the
 *  gold pins it plugs in by, crawling underneath. Switching cartridges plugs the new one in. */
function CartChip({ cart, on }: { cart: Cartridge; on: boolean }) {
  return (
    <span className="top-slot" data-on={on ? '' : undefined}>
      <span className="top-clip">
        <a
          href={`#carts/${cart.id}`}
          className="top-now"
          data-world="carts"
          data-game={cart.id}
          inert={!on}
          aria-current={on ? 'location' : undefined}
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

/** COUCH·OS, out of the Games folder: its icon and its wordmark, changing channel. */
function CouchChip({ on }: { on: boolean }) {
  return (
    <span className="top-slot" data-on={on ? '' : undefined}>
      <span className="top-clip">
        <a href="#couch-os" className="top-now" data-world="couch" inert={!on} aria-current={on ? 'location' : undefined} style={{ '--accent': COUCH.accent } as CSSProperties}>
          <img className="top-icon" src={COUCH.icon} alt="" width="26" height="26" />
          <span className="top-label">
            <Ticker>
              <span className="sr-only">Now viewing </span>
              COUCH<b>·</b>OS
            </Ticker>
            <i className="top-bar-bar" aria-hidden="true" />
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
          href={game ? `#games/${item.id}` : `#${item.section}`}
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
  const nav = useRef<HTMLElement>(null);
  const [folder, setFolder] = useState<FolderId | null>(null);

  // An open folder closes with Esc (back to its tab), a press anywhere else, or going somewhere.
  useEffect(() => {
    if (!folder) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      nav.current?.querySelector<HTMLElement>(`[aria-controls="top-${folder}"]`)?.focus();
      setFolder(null);
    };
    const onDown = (e: PointerEvent) => { if (!nav.current?.contains(e.target as Node)) setFolder(null); };
    const onHash = () => setFolder(null);
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('hashchange', onHash);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('hashchange', onHash);
    };
  }, [folder]);
  const toggle = (id: FolderId) => setFolder((f) => (f === id ? null : id));
  /** Going to where the page already is changes no hash; say so anyway, so it still scrolls there. */
  const go = (href: string) => {
    setFolder(null);
    if (window.location.hash === href) window.dispatchEvent(new HashChangeEvent('hashchange'));
  };

  // Down the page, the project on screen is the one being viewed. Up in the hero, whatever is open in the phone is.
  const open = here === 'top' || here === '' ? ORBIT_ITEMS.find((i) => i.id === staged) : undefined;
  const app = APPS.find((a) => a.section === here) ?? (open?.ring === 'apps' ? open : undefined);
  // The game: the one open in the phone, or else the one up in the arcade.
  const theme = gameById(open?.ring === 'games' ? open.id : gameId);
  const game = GAMES.find((g) => g.id === theme.id) ?? GAMES[0];
  const gameOn = here === 'games' || open?.ring === 'games';
  const cart = cartridgeById(cartId);
  const cartOn = here === 'carts';
  const couchOn = here === 'couch-os';
  const playing = gameOn || cartOn || couchOn;

  return (
    <nav className="topbar" aria-label="Sections" ref={nav} data-folder={folder ?? undefined}>
      <a href="#top" className="brand" aria-label="Graydon Wasil, back to the top">
        <GurpyFace still={still} />
        <span>Graydon Wasil</span>
      </a>
      <div className="toplinks" data-viewing={app || playing ? '' : undefined}>
        <div className="top-group" data-open={app ? '' : undefined}>
          <FolderTab
            id="apps"
            label="Apps"
            icons={four(APPS, app).map((a) => ({ key: a.id, src: a.icon, lit: a === app }))}
            lit={!!app}
            open={folder === 'apps'}
            onToggle={() => toggle('apps')}
          />
          {APPS.map((a) => <Chip key={a.id} item={a} on={a === app} current={a.section === here} />)}
        </div>
        <div className="top-group" data-open={playing ? '' : undefined}>
          <FolderTab
            id="games"
            label="Games"
            icons={four(GAMES, game).map((g) => ({ key: g.id, src: g.icon, sprite: true, lit: gameOn && g === game }))}
            lit={gameOn}
            viewing={cartOn || couchOn}
            open={folder === 'games'}
            onToggle={() => toggle('games')}
          />
          <CouchChip on={couchOn} />
          <Chip item={game} on={gameOn} current={here === 'games'} bg={theme.theme.bg} b={theme.theme.b} />
          <CartChip cart={cart} on={cartOn} />
        </div>
        <a href="#hello" className="top-tab top-hi" data-on={here === 'hello' ? '' : undefined} aria-current={here === 'hello' ? 'true' : undefined}>
          <span className="top-fold"><span>Say&nbsp;</span></span>hi
        </a>
      </div>

      <div id="top-apps" className="top-panel" data-for="apps" data-open={folder === 'apps' ? '' : undefined} inert={folder !== 'apps'} role="region" aria-label="Apps">
        <a className="top-panel-head" href="#morse" onClick={() => go('#morse')}>Apps<span aria-hidden="true">↓</span></a>
        <ul className="top-grid">
          {APPS.map((a, i) => (
            <Tile key={a.id} href={`#${a.section}`} icon={a.icon} name={a.name} current={a === app} accent={a.accent} index={i} onGo={go} />
          ))}
        </ul>
      </div>

      <div id="top-games" className="top-panel" data-for="games" data-open={folder === 'games' ? '' : undefined} inert={folder !== 'games'} role="region" aria-label="Games">
        <a className="top-feature" href="#couch-os" onClick={() => go('#couch-os')} aria-current={couchOn ? 'true' : undefined} style={{ '--i': 0 } as CSSProperties}>
          <img src={COUCH.icon} alt="" width="44" height="44" />
          <span className="top-feature-text">
            <b>COUCH<i>·</i>OS</b>
            <small>Next up: your TV is the console</small>
          </span>
          <span className="top-feature-bar" aria-hidden="true" />
        </a>

        <a className="top-panel-sub" href="#games" onClick={() => go('#games')}>Browser games<span aria-hidden="true">↓</span></a>
        <ul className="top-grid" data-kind="games">
          {GAMES.map((g, i) => (
            <Tile key={g.id} href={`#games/${g.id}`} icon={g.icon} name={g.name} sprite px={g.pixel} current={gameOn && g === game} accent={g.accent} index={i + 1} onGo={go} />
          ))}
        </ul>

        <a className="top-panel-sub" href="#carts" onClick={() => go('#carts')}>Cartridges<small>Game Boy Color</small><span aria-hidden="true">↓</span></a>
        <ul className="top-grid" data-kind="carts">
          {CARTRIDGES.map((c, i) => (
            <Tile key={c.id} href={`#carts/${c.id}`} icon={c.art} name={c.title} art px current={cartOn && c === cart} accent={c.colour} index={GAMES.length + 1 + i} onGo={go} />
          ))}
        </ul>
      </div>
    </nav>
  );
}
