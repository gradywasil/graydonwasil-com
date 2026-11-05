import { useEffect, useRef, useState } from 'react';
import { GurpyFace } from './GurpyFace';

/* Once the hero scrolls away, Gurpy follows along in the corner and says one
 * thing about each section as it arrives. Tapping him takes you back up. */

const LINES: Record<string, string> = {
  morse: 'My first Play Store app! Send it a message.',
  apps: 'Poke the flower. Trust me.',
  games: 'Spin the reel. I dare you.',
  more: 'The stuff from before the apps took over.',
  hello: "Say hi. He really does read them all.",
};

export function Buddy({ still }: { still: boolean }) {
  const [shown, setShown] = useState(false);
  const [line, setLine] = useState<string | null>(null);
  const seen = useRef(new Set<string>());
  const timer = useRef(0);

  useEffect(() => {
    const hero = document.getElementById('top');
    const heroIo = new IntersectionObserver(([e]) => setShown(!e.isIntersecting), { threshold: 0.05 });
    if (hero) heroIo.observe(hero);

    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const id = e.target.id;
        if (!e.isIntersecting || seen.current.has(id) || !LINES[id]) continue;
        seen.current.add(id);
        setLine(LINES[id]);
        clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setLine(null), 4200);
      }
    }, { threshold: 0.35 });
    Object.keys(LINES).forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });

    return () => { heroIo.disconnect(); io.disconnect(); clearTimeout(timer.current); };
  }, []);

  return (
    <div className="buddy" data-shown={shown || undefined} aria-hidden={!shown}>
      {line && <p className="buddy-bubble">{line}</p>}
      <a href="#top" className="buddy-btn" tabIndex={shown ? 0 : -1} aria-label="Back to the top">
        <GurpyFace still={still} />
      </a>
    </div>
  );
}
