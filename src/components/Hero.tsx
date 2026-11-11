import { useCallback, useEffect, useState } from 'react';
import { ORBIT_ITEMS } from '../data/site';
import { GurpyFace } from './GurpyFace';
import { HeroSky, type SkyLook } from './HeroSky';
import { WatchIntro } from './IntroVideo';
import { Orbit } from './Orbit';
import { StageCentre } from './StageDevice';
import { AndroidLogo, AppleLogo } from './StoreButtons';
import { HomeScreen } from './hero/HomeScreen';
import { ItemActions } from './hero/ItemActions';
import { PixelSun } from './hero/PixelSun';
import type { HeroVariant } from './hero/variants';
import { WorldStack } from './hero/WorldStack';

/* The hero: the pitch on the left and a stage on the right. The stage is
 * being tried several ways (`variant`, see hero/variants.ts): three keep the
 * orbit and change what is in its middle, two replace the orbit outright. */

const TOUR_MS = 4200;
const HOME_LOOK: SkyLook = { accent: '#8f9cff', id: 'home' };

export function Hero({ still, variant, onPickGame, onWatch, onStage }: {
  still: boolean;
  variant: HeroVariant;
  onPickGame: (id: string) => void;
  onWatch: () => void;
  /** What is open in the phone (null when nothing is), so the top bar can light its tab. */
  onStage: (id: string | null) => void;
}) {
  const [selected, setSelected] = useState('morse');
  const [touring, setTouring] = useState(!still);
  const [happy, setHappy] = useState(false);
  /** How the sky is dressed when the stage is not an orbit. */
  const [look, setLook] = useState(HOME_LOOK);
  /** What the open app in the phone is doing: a lamp held on, and a count of beats landed. */
  const [glow, setGlow] = useState(false);
  const [beat, setBeat] = useState(0);
  const item = ORBIT_ITEMS.find((i) => i.id === selected) ?? ORBIT_ITEMS[0];
  const orbiting = variant === 'sun' || variant === 'gurpy' || variant === 'screen';

  const pick = (id: string) => {
    setTouring(false);
    if (ORBIT_ITEMS.some((i) => i.id === id)) setSelected(id);
  };

  // A slow guided tour until the visitor picks something themselves.
  useEffect(() => {
    if (!touring || !orbiting) return;
    const t = window.setInterval(() => {
      setSelected((cur) => {
        const i = ORBIT_ITEMS.findIndex((x) => x.id === cur);
        return ORBIT_ITEMS[(i + 1) % ORBIT_ITEMS.length].id;
      });
    }, TOUR_MS);
    return () => clearInterval(t);
  }, [touring, orbiting]);

  // Have the next item's screen ready before the tour (or a curious visitor) reaches it.
  useEffect(() => {
    if (variant !== 'screen') return;
    const i = ORBIT_ITEMS.findIndex((x) => x.id === selected);
    const next = ORBIT_ITEMS[(i + 1) % ORBIT_ITEMS.length].screen;
    if ('src' in next) new Image().src = next.src;
  }, [selected, variant]);

  // Gurpy, when he is the middle, is pleased for a moment by each pick.
  useEffect(() => {
    if (variant !== 'gurpy') return;
    const on = window.setTimeout(() => setHappy(true), 0);
    const off = window.setTimeout(() => setHappy(false), 750);
    return () => { clearTimeout(on); clearTimeout(off); };
  }, [selected, variant]);

  const lightWorld = useCallback((accent: string, id: string) => setLook({ accent, id }), []);
  const dress = useCallback((next: SkyLook | null) => {
    setLook(next ?? HOME_LOOK);
    onStage(next?.id ?? null);
  }, [onStage]);
  const landBeat = useCallback(() => setBeat((n) => n + 1), []);
  const phone = variant === 'home';
  const sky: SkyLook = orbiting ? { accent: item.accent, id: selected } : look;

  return (
    <header className="hero" id="top" data-variant={variant}>
      <HeroSky key={variant} look={sky} still={still} beat={phone ? beat : 0} glow={phone && glow} />
      <div className="hero-copy">
        <p className="hero-kicker">Graydon Wasil &middot; iOS &amp; Android developer</p>
        <h1 className="hero-title">
          I build software you&rsquo;ll want to{' '}
          <span className="hero-play-with">
            play with.
            <svg viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden="true">
              <path d="M4 16 C 60 4, 110 22, 160 12 S 260 6, 296 14" />
            </svg>
          </span>
        </h1>
        <p className="hero-lede">
          Apps for iPhone and Android, browser games, and the occasional weird experiment.{' '}
          <a href="#morse">Morse</a> and <a href="#kilopixel">Kilopixel</a> are out now on the App&nbsp;Store,
          and <a href="#bitbounce">BitBounce</a> is in beta.
        </p>
        <div className="hero-ctas">
          <a className="chunky-btn chunky-ginger" href="#morse">Meet the apps <span aria-hidden="true">&darr;</span></a>
          <a className="chunky-btn chunky-cream" href="#games">Play a game <span aria-hidden="true">&darr;</span></a>
        </div>
        <WatchIntro onWatch={onWatch} />
        <p className="hero-sticker">
          <span>Ships to</span>
          <span className="hero-platform"><AppleLogo className="platform-logo" />iPhone</span>
          <span className="hero-platform"><AndroidLogo className="platform-logo" />Android</span>
          <span className="hero-platform">Web</span>
        </p>
      </div>

      {orbiting && (
        <div className="hero-stage" style={{ ['--stage-accent' as string]: item.accent }}>
          <Orbit
            items={ORBIT_ITEMS}
            selected={selected}
            onSelect={pick}
            still={still}
            centre={variant}
            ringY={variant === 'screen' ? 0.6 : 0.5}
            flyTo={variant === 'screen' ? 0.36 : variant === 'sun' ? 0.5 : undefined}
          >
            {variant === 'screen' && <StageCentre item={item} />}
            {variant === 'sun' && <PixelSun accent={item.accent} pick={selected} still={still} />}
            {variant === 'gurpy' && <GurpyFace className="orbit-gurpy" mood={happy ? 'happy' : 'idle'} still={still} />}
          </Orbit>

          <div className="orbit-card" data-stores={item.stores ? '' : undefined} style={{ ['--accent' as string]: item.accent }} aria-live="polite">
            <img className="orbit-card-icon" src={item.icon} alt="" data-px={item.pixel || undefined} />
            <div className="orbit-card-body">
              <p className="orbit-card-status"><span className="dot" />{item.ring === 'apps' ? 'App' : 'Game'} &middot; {item.status}</p>
              <h2 className="orbit-card-name">{item.name}</h2>
              <p className="orbit-card-line">{item.line}</p>
            </div>
            <ItemActions item={item} onPickGame={onPickGame} />
          </div>
        </div>
      )}

      {variant === 'home' && (
        <HomeScreen still={still} onPickGame={onPickGame} onLook={dress} onGlow={setGlow} onBeat={landBeat} />
      )}

      {variant === 'worlds' && (
        <WorldStack still={still} onLight={lightWorld} />
      )}
    </header>
  );
}
