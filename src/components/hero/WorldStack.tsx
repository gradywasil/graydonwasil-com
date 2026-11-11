import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { ORBIT_ITEMS, type OrbitItem } from '../../data/site';
import { StoreButtons } from '../StoreButtons';

/* A hero without an orbit: five posters stacked like spines on a shelf, one
 * per world, each in that world's own colours and lettering. The one you
 * point at (or tap) opens to its pitch, its way in and a piece of the thing
 * itself; the rest fold to their names. Until you touch it, it turns its own
 * pages. */

const TOUR_MS = 4200;
const APPS = ORBIT_ITEMS.filter((i) => i.ring === 'apps');
const SPRITES = ORBIT_ITEMS.filter((i) => i.ring === 'games');

interface World { id: string; name: string; status: string; line: string; accent: string; item?: OrbitItem }
const WORLDS: World[] = [
  ...APPS.map((a) => ({ id: a.id, name: a.name, status: a.status, line: a.line, accent: a.accent, item: a })),
  { id: 'games', name: 'Games', status: 'Eleven, free, in the browser', line: 'Weird games for curious thumbs.', accent: '#ff6b2c' },
];

// "MORSE", as the app would punch it.
const TAPE = ['--', '---', '.-.', '...', '.'];
// One bar of the BitBounce demo's starting pattern, lane by lane.
const BEAT = ['x.xxx.x.', 'x..xx..x', 'x...x.x.', '.xx..xxx'];

function Art({ world }: { world: World }): ReactNode {
  const screen = world.item?.screen;
  if (world.id === 'morse') {
    return (
      <div className="ws-tape">
        {[0, 1, 2].flatMap((n) => TAPE.map((letter, i) => (
          <span key={`${n}-${i}`}>{[...letter].map((mark, k) => <i key={k} data-mark={mark === '-' ? 'dash' : 'dot'} />)}</span>
        )))}
      </div>
    );
  }
  if (world.id === 'bitbounce') {
    return (
      <div className="ws-beat">
        {BEAT.flatMap((lane, y) => [...lane].map((cell, x) => (
          <i key={`${y}-${x}`} data-lane={y} data-on={cell === 'x' || undefined} style={{ ['--col' as string]: x } as CSSProperties} />
        )))}
      </div>
    );
  }
  if (world.id === 'rhymepage') {
    return (
      <div className="ws-bars">
        <p><span data-state="sung">writing a </span><span data-state="now">couple</span> bars</p>
        <p>empty brain&rsquo;s reservoirs</p>
      </div>
    );
  }
  if (world.id === 'games') {
    return (
      <div className="ws-sprites">
        {SPRITES.map((g, i) => (
          <img key={g.id} src={g.icon} alt="" draggable={false} data-px={g.pixel || undefined} style={{ ['--n' as string]: i } as CSSProperties} />
        ))}
      </div>
    );
  }
  if (screen && 'src' in screen) return <img className="ws-phone" src={screen.src} alt="" width={screen.w} height={screen.h} draggable={false} />;
  return null;
}

export function WorldStack({ still, onLight }: { still: boolean; onLight: (accent: string, id: string) => void }) {
  const [open, setOpen] = useState(WORLDS[0].id);
  const [touring, setTouring] = useState(!still);

  useEffect(() => {
    if (!touring) return;
    const t = window.setInterval(() => {
      setOpen((cur) => WORLDS[(WORLDS.findIndex((w) => w.id === cur) + 1) % WORLDS.length].id);
    }, TOUR_MS);
    return () => clearInterval(t);
  }, [touring]);

  // The sky takes the open world's colour.
  useEffect(() => {
    const world = WORLDS.find((w) => w.id === open);
    if (world) onLight(world.accent, world.id);
  }, [open, onLight]);

  const choose = (id: string) => {
    setTouring(false);
    setOpen(id);
  };

  return (
    <div className="ws hero-focus">
      {WORLDS.map((world) => {
        const on = world.id === open;
        const { item } = world;
        return (
          <section key={world.id} className="ws-band" data-world={world.id} data-open={on || undefined}>
            <h2 className="ws-head">
              <button
                type="button"
                aria-expanded={on}
                aria-controls={`ws-${world.id}`}
                onClick={() => choose(world.id)}
                onPointerEnter={(e) => { if (e.pointerType === 'mouse') choose(world.id); }}
                onFocus={() => choose(world.id)}
              >
                {item && <img src={item.icon} alt="" width="40" height="40" draggable={false} />}
                <span className="ws-name">{world.name}</span>
                <span className="ws-status">{world.status}</span>
              </button>
            </h2>
            <div className="ws-body" id={`ws-${world.id}`} inert={!on}>
              <p className="ws-line">{world.line}</p>
              <div className="ws-actions">
                {item?.stores && <StoreButtons stores={item.stores} app={item.name} pill />}
                {item && !item.stores && (
                  <a className="ws-go" href={item.href} target="_blank" rel="noopener noreferrer">{item.cta} <span aria-hidden="true">&#8599;</span></a>
                )}
                {!item && <a className="ws-go" href="#games">Play one <span aria-hidden="true">&darr;</span></a>}
                {item && <a className="ws-more" href={`#${item.section}`}>Try it below <span aria-hidden="true">&darr;</span></a>}
              </div>
            </div>
            <div className="ws-art" aria-hidden="true"><Art world={world} /></div>
          </section>
        );
      })}
    </div>
  );
}
