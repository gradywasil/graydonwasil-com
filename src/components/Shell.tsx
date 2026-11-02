import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { NavPill } from './NavPill';
import { Footer } from './Footer';
import { Deck } from './Deck';
import { DetailOverlay } from './DetailOverlay';
import { SwipeArea } from './SwipeArea';
import { useDeck } from '../lib/useDeck';
import { useKeyNav } from '../lib/useDeckDrivers';
import { isKnownPath } from '../lib/deck';

export function Shell() {
  const navigate = useNavigate();
  const { go, detailOpen } = useDeck();
  const [scrollable, setScrollable] = useState(false);

  useKeyNav(go);

  // Unknown URLs land on the first slide rather than an empty stage.
  useEffect(() => {
    if (!isKnownPath(window.location.pathname)) navigate('/', { replace: true });
  });

  return (
    <div className="shell">
      <Link to="/" state={{ dir: -1 }} className="namemark" aria-label="Graydon Wasil, start">
        <span className="namemark-full">Graydon Wasil</span>
        <span className="namemark-short" aria-hidden="true">GW</span>
      </Link>

      <NavPill />

      <SwipeArea onStep={go} enabled={!detailOpen && !scrollable}>
        <Deck scrollable={scrollable} onScrollModeChange={setScrollable} />
      </SwipeArea>

      <AnimatePresence>{detailOpen && <DetailOverlay key="detail" />}</AnimatePresence>

      <Footer />
    </div>
  );
}
