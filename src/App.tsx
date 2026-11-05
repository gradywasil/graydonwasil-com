import { useEffect, useState } from 'react';
import gurpySrc from './assets/fun/gurpy.png';
import { Buddy } from './components/Buddy';
import { GamesArcade } from './components/GamesArcade';
import { Hello } from './components/Hello';
import { Hero } from './components/Hero';
import { KiloPixelCard } from './components/KiloPixelCard';
import { MoreWork } from './components/MoreWork';
import { MorseLaunch } from './components/MorseLaunch';
import { RhymePageCard } from './components/RhymePageCard';
import { GITHUB, EMAIL } from './data/site';
import { usePrefersReducedMotion } from './lib/usePrefersReducedMotion';

interface Drop { id: number; left: number; delay: number; size: number; spin: number; }

/** Type "gurpy" anywhere outside a text field. */
function useGurpyRain(enabled: boolean) {
  const [drops, setDrops] = useState<Drop[]>([]);
  useEffect(() => {
    if (!enabled) return;
    let typed = '';
    let batch = 0;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (e.key.length !== 1) return;
      typed = (typed + e.key.toLowerCase()).slice(-5);
      if (typed !== 'gurpy') return;
      typed = '';
      const base = ++batch * 100;
      setDrops((d) => [...d, ...Array.from({ length: 28 }, (_, i) => ({
        id: base + i,
        left: Math.random() * 100,
        delay: Math.random() * 1.4,
        size: 32 + Math.random() * 56,
        spin: Math.random() * 720 - 360,
      }))]);
      window.setTimeout(() => setDrops((d) => d.filter((x) => x.id < base || x.id >= base + 100)), 4600);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled]);
  return drops;
}

function App() {
  const still = usePrefersReducedMotion();
  const drops = useGurpyRain(!still);
  const [gameId, setGameId] = useState('brain-splitter');

  return (
    <>
      <a className="skip" href="#morse">Skip to the apps</a>
      <nav className="topbar" aria-label="Sections">
        <a href="#top" className="brand">
          <img src={gurpySrc} alt="" width="32" height="32" />
          <span>Graydon Wasil</span>
        </a>
        <div className="toplinks">
          <a href="#morse">Morse</a>
          <a href="#apps">Apps</a>
          <a href="#games">Games</a>
          <a href="#hello" className="top-hi">Say hi</a>
        </div>
      </nav>

      <main>
        <Hero still={still} onPickGame={setGameId} />
        <MorseLaunch />
        <section className="world world-apps" id="apps" aria-labelledby="apps-title">
          <div className="apps-head">
            <p className="kicker">Next on Android</p>
            <h2 id="apps-title">More apps on the launch pad.</h2>
          </div>
          <div className="apps-grid">
            <KiloPixelCard />
            <RhymePageCard />
          </div>
        </section>
        <GamesArcade still={still} gameId={gameId} onPick={setGameId} />
        <MoreWork />
        <Hello />
      </main>

      <footer className="footer">
        <img src={gurpySrc} alt="" width="28" height="28" />
        <p>Made by Graydon, supervised by Gurpy. &copy; {new Date().getFullYear()}</p>
        <p className="footer-links">
          <a href={`mailto:${EMAIL}`}>Email</a>
          <a href={GITHUB} target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://gg.arrangedgodly.com/" target="_blank" rel="noopener noreferrer">Gurpy Games</a>
        </p>
      </footer>

      <Buddy still={still} />

      {drops.length > 0 && (
        <div className="rain" aria-hidden="true">
          {drops.map((d) => (
            <img
              key={d.id}
              src={gurpySrc}
              alt=""
              style={{
                left: `${d.left}%`, width: d.size, height: d.size,
                animationDelay: `${d.delay}s`,
                ['--spin' as string]: `${d.spin}deg`,
              }}
            />
          ))}
        </div>
      )}
    </>
  );
}

export default App;
