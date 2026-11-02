import { Link } from 'react-router-dom';
import { ExternalArrow } from '../components/ExternalArrow';
import { GAME_COLLECTIONS } from '../data/currentWork';
import { FIRST_PROJECT_PATH } from '../lib/deck';

export function Games() {
  return (
    <div className="games-slide">
      <div className="games-intro">
        <h2 className="disp">I keep making games.</h2>
        <p className="lede">
          Monkey empires, office shredders, musical dungeons.
          Two places to play what I've been building.
        </p>
      </div>
      <div className="game-collections">
        {GAME_COLLECTIONS.map((collection) => (
          <a className="game-collection" key={collection.id} href={collection.url}
            target="_blank" rel="noopener noreferrer"
            aria-label={`${collection.title} (opens in a new tab)`}>
            <img src={collection.image} alt={collection.imageAlt} width="1000" height="625" decoding="async" />
            <div className="game-collection-heading">
              <h3 className="pt">{collection.title}</h3>
              <ExternalArrow />
            </div>
            <p>{collection.description}</p>
            <span className="game-collection-action">{collection.action}<span className="mono">{collection.host}</span></span>
          </a>
        ))}
      </div>
      <Link className="hero-text-link games-next" to={FIRST_PROJECT_PATH}>
        Next, the project stories &rarr;
      </Link>
    </div>
  );
}
