import { useEffect, useRef } from 'react';
import { INTRO } from '../data/site';

/* "Who is Grady?", the promo reel on YouTube. Nothing from YouTube loads
 * until someone asks to watch: the page shows a local copy of the thumbnail,
 * and the player (youtube-nocookie) mounts only while the overlay is open,
 * so closing it also stops playback. */

const EMBED = `https://www.youtube-nocookie.com/embed/${INTRO.id}?autoplay=1&rel=0&playsinline=1`;

/** The hero's way in: a thumbnail you can press. */
export function WatchIntro({ onWatch }: { onWatch: () => void }) {
  return (
    <button type="button" className="hero-watch" onClick={onWatch} aria-haspopup="dialog">
      <span className="hero-watch-thumb">
        <img src={INTRO.thumb} alt="" width="120" height="68" />
        <span className="hero-watch-play" aria-hidden="true" />
      </span>
      <span className="hero-watch-text">
        <strong>{INTRO.title}</strong>
        <span>Watch the {INTRO.length} intro</span>
      </span>
    </button>
  );
}

export function IntroVideo({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="intro"
      aria-labelledby="intro-title"
      onClose={onClose}
      // A click that lands on the dialog itself is a click on the backdrop.
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="intro-box">
        <div className="intro-head">
          <h2 id="intro-title">{INTRO.title}</h2>
          <button type="button" className="intro-close" onClick={onClose} aria-label="Close video">
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="intro-frame" style={{ backgroundImage: `url(${INTRO.poster})` }}>
          {open && (
            <iframe
              src={EMBED}
              title={`${INTRO.title} (video)`}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          )}
        </div>
        <p className="intro-foot">
          <span>{INTRO.length} &middot; the apps, the games, and Gurpy</span>
          <a href={INTRO.url} target="_blank" rel="noopener noreferrer">Watch on YouTube <span aria-hidden="true">&#8599;</span></a>
        </p>
      </div>
    </dialog>
  );
}
