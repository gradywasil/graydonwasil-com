import { useState } from 'react';
import voxWordmark from '../assets/fun/side/voxchain-wordmark.svg';
import { EXPERIMENTS } from '../data/experiments';
import { SIDE_PROJECTS } from '../data/site';

/* Everything from before the apps took over, kept small on purpose. Each tile
 * shows the project's own mark rather than a shrunken screenshot. */

function TileArt({ id }: { id: (typeof SIDE_PROJECTS)[number]['id'] }) {
  const p = SIDE_PROJECTS.find((x) => x.id === id)!;
  if (id === 'voxchain' && 'mark' in p) {
    return (
      <span className="tile-art tile-vox">
        <img className="vox-mark" src={p.mark} alt="" width="64" height="60" />
        <img className="vox-word" src={voxWordmark} alt="" width="188" height="29" />
      </span>
    );
  }
  if (id === 'carsdb' && 'mark' in p) {
    return (
      <span className="tile-art tile-cars">
        <img className="cars-mark" src={p.mark} alt="" width="64" height="64" />
        <span className="cars-word">CARS<b>DB</b></span>
      </span>
    );
  }
  return (
    <span className="tile-art tile-ag">
      {'image' in p && <img src={p.image} alt="" width="900" height="545" loading="lazy" />}
    </span>
  );
}

export function MoreWork() {
  const [open, setOpen] = useState(false);

  return (
    <section className="world world-more" id="more" aria-labelledby="more-title">
      <div className="more-head">
        <h2 id="more-title">Other things I&rsquo;ve built</h2>
        <p>Side projects from before the apps took over. Still live, still loved.</p>
      </div>
      <div className="more-strip">
        {SIDE_PROJECTS.map((p) => (
          <a key={p.id} className="more-tile" href={p.url} target="_blank" rel="noopener noreferrer">
            <TileArt id={p.id} />
            <span className="more-tile-body">
              <strong>{p.title} <span aria-hidden="true">&#8599;</span></strong>
              <span>{p.line}</span>
            </span>
          </a>
        ))}
        <button
          type="button"
          className="more-tile more-drawer-toggle"
          aria-expanded={open}
          aria-controls="experiments"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="tile-art more-count">{EXPERIMENTS.length}</span>
          <span className="more-tile-body">
            <strong>Tiny experiments</strong>
            <span>{open ? 'Close the drawer' : 'Open the junk drawer'}</span>
          </span>
        </button>
      </div>
      <div className="experiments" id="experiments" hidden={!open}>
        {EXPERIMENTS.map((x) => (
          <a key={x.id} className="exp" href={x.url} target="_blank" rel="noopener noreferrer">
            {x.thumbnail && <img src={x.thumbnail} alt="" width="320" height="200" loading="lazy" />}
            <strong>{x.title}</strong>
            <span>{x.description}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
