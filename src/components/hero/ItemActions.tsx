import type { OrbitItem } from '../../data/site';
import { StoreButtons } from '../StoreButtons';

/** Where to get an item (its store pair, or its link) and a way down the page to it. */
export function ItemActions({ item, onPickGame }: { item: OrbitItem; onPickGame: (id: string) => void }) {
  return (
    <div className="orbit-card-actions">
      {item.stores ? (
        <StoreButtons stores={item.stores} app={item.name} pill />
      ) : (
        <a className="orbit-card-go" href={item.href} target="_blank" rel="noopener noreferrer">
          {item.cta} <span aria-hidden="true">&#8599;</span>
        </a>
      )}
      <a
        className="orbit-card-more"
        href={`#${item.section}`}
        onClick={() => { if (item.ring === 'games') onPickGame(item.id); }}
      >
        <span className="orbit-card-more-text">{item.ring === 'games' ? 'See it below' : 'Try it below'}</span>{' '}
        <span aria-hidden="true">&darr;</span>
      </a>
    </div>
  );
}
