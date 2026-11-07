import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import flowerSrc from '../assets/kilopixel/flower.webp';
import streetSrc from '../assets/kilopixel/street.webp';
import jellyStill from '../assets/kilopixel/jellyfish-still.webp';
import jellyLoop from '../assets/kilopixel/jellyfish-loop.webp';
import appDark from '../assets/kilopixel/app-dark.webp';
import appClassic from '../assets/kilopixel/app-classic.webp';
import appPocket from '../assets/kilopixel/app-pocket.webp';
import appArcade from '../assets/kilopixel/app-arcade.webp';
import appTerminal from '../assets/kilopixel/app-terminal.webp';
import appCandy from '../assets/kilopixel/app-candy.webp';
import { KILOPIXEL } from '../data/site';
import type { Renderer, Settings } from '../vendor/kilopixel/renderer';
import type { LookTheme, StarterPreset } from '../vendor/kilopixel/looks';
import { AndroidLogo, AppleLogo, StoreButtons } from './StoreButtons';

/* Kilopixel, shown with the app's own engine (a snapshot in src/vendor/kilopixel).
 * The viewfinder renders the 49 built-in looks live on two sample photos; the
 * rail below previews every look; hovering shows the original photo. Below
 * that: the real app in its six themes, a GIF it exported, and the rest. */

const SCENES = { flower: flowerSrc, street: streetSrc } as const;
type Scene = keyof typeof SCENES;

const THEMES = [
  { id: 'dark', name: 'Graphite', shot: appDark, bg: '#121211', ink: '#efede4', accent: '#ff6b1f' },
  { id: 'classic', name: 'Classic', shot: appClassic, bg: '#f4f2ea', ink: '#111111', accent: '#111111' },
  { id: 'pocket', name: 'Pocket', shot: appPocket, bg: '#a3b373', ink: '#1c2812', accent: '#2d421c' },
  { id: 'arcade', name: 'Arcade', shot: appArcade, bg: '#0f1230', ink: '#f6f0ff', accent: '#46e6d6' },
  { id: 'terminal', name: 'Terminal', shot: appTerminal, bg: '#0b0a07', ink: '#ffcf7a', accent: '#ffb000' },
  { id: 'candy', name: 'Candy', shot: appCandy, bg: '#fbe4ef', ink: '#43215e', accent: '#ff4f9a' },
] as const;

const SPECS = [
  ['3-shot moment', 'Frames from just before and after the press. Keep the best one.'],
  ['Steady and Tripod', 'Stabilize live video, or clips you import.'],
  ['Sounds like it looks', 'VHS warbles like tape. Dithers buzz like a handheld.'],
  ['Edit your gallery', 'Old photos, videos and GIFs get new looks.'],
  ['Yours, on your phone', 'No account. No uploads. Every pixel stays on the device.'],
] as const;

const AUTO_MS = 3200;
const CHIP_W = 72;
const CHIP_H = 96;

interface Engine {
  main: Renderer;
  side: Renderer;
  sideCanvas: HTMLCanvasElement;
  looks: StarterPreset[];
  groups: ReadonlyArray<{ id: LookTheme; label: string }>;
  effectLabel: (s: Settings) => string;
  animated: (s: Settings) => boolean;
  paletteLabel: (id?: string) => string;
}

const scaled = (s: Settings, width: number): Settings =>
  ({ ...s, palette: [...s.palette], pixelSize: Math.max(2, Math.round((s.pixelSize * width) / 480)) });

function useInView<T extends Element>(margin: string) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);
  return [ref, inView] as const;
}

export function KilopixelLaunch({ still }: { still: boolean }) {
  const [sectionRef, near] = useInView<HTMLElement>('600px 0px');
  const [studioRef, visible] = useInView<HTMLDivElement>('0px');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prevRef = useRef<HTMLCanvasElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const images = useRef<Partial<Record<Scene, HTMLImageElement>>>({});

  const [engine, setEngine] = useState<Engine | null>(null);
  const [failed, setFailed] = useState(false);
  const [scene, setScene] = useState<Scene>('flower');
  const [lookId, setLookId] = useState('starter-riso');
  const [group, setGroup] = useState<LookTheme | 'all'>('all');
  const [auto, setAuto] = useState(!still);
  const [reveal, setReveal] = useState<{ x: number; y: number } | null>(null);
  const [imagesReady, setImagesReady] = useState(false);

  const [theme, setTheme] = useState(0);
  const [gif, setGif] = useState(false);

  // Load the engine and the sample photos once the section is close.
  useEffect(() => {
    if (!near || engine || failed) return;
    let cancelled = false;
    (async () => {
      try {
        const [r, l, p] = await Promise.all([
          import('../vendor/kilopixel/renderer'),
          import('../vendor/kilopixel/looks'),
          import('../vendor/kilopixel/palettes'),
        ]);
        const canvas = canvasRef.current;
        if (cancelled || !canvas) return;
        const main = new r.Renderer(canvas);
        const sideCanvas = document.createElement('canvas');
        const side = new r.Renderer(sideCanvas);
        const info = (s: Settings) => r.EFFECTS.find((e) => e.id === s.effect);
        const usable = (s: Settings) => main.supportsWebGL || !info(s)?.requiresWebGL;
        setEngine({
          main, side, sideCanvas,
          looks: l.starterLooks().filter((x) => usable(x.settings)),
          groups: l.LOOK_THEMES,
          effectLabel: (s) => info(s)?.label ?? s.effect,
          animated: (s) => !!info(s)?.animated,
          paletteLabel: (id) => p.findPalette(id)?.label ?? 'Custom',
        });
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => { cancelled = true; };
  }, [near, engine, failed]);

  useEffect(() => {
    if (!near) return;
    let cancelled = false;
    Promise.all((Object.keys(SCENES) as Scene[]).map(async (key) => {
      const img = new Image();
      img.src = SCENES[key];
      await img.decode();
      images.current[key] = img;
    })).then(() => { if (!cancelled) setImagesReady(true); }).catch(() => setFailed(true));
    return () => { cancelled = true; };
  }, [near]);

  useEffect(() => () => {
    engine?.main.dispose();
    engine?.side.dispose();
  }, [engine]);

  const looks = useMemo(() => engine?.looks ?? [], [engine]);
  const look = looks.find((x) => x.id === lookId) ?? looks[0];
  const shown = useMemo(() => (group === 'all' ? looks : looks.filter((x) => x.theme === group)), [looks, group]);

  const draw = useCallback((time?: number) => {
    const img = images.current[scene];
    if (!engine || !look || !img) return;
    try { engine.main.render(img, scaled(look.settings, 480), { time }); } catch { /* keep the last frame */ }
  }, [engine, look, scene]);

  // Paint the viewfinder; VHS looks keep moving while on screen.
  useEffect(() => {
    if (!imagesReady) return;
    draw();
    if (!engine || !look || !engine.animated(look.settings) || !visible || still) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => { draw(now - start); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [draw, imagesReady, engine, look, visible, still]);

  // Preview chips: every look in the rail, rendered on the current scene.
  useEffect(() => {
    const img = images.current[scene];
    if (!engine || !img || !imagesReady) return;
    const { side, sideCanvas } = engine;
    const byId = new Map(shown.map((x) => [x.id, x]));
    for (const target of railRef.current?.querySelectorAll<HTMLCanvasElement>('canvas[data-look]') ?? []) {
      const item = byId.get(target.dataset.look ?? '');
      const ctx = target.getContext('2d');
      if (!item || !ctx) continue;
      try {
        side.setSize(CHIP_W, CHIP_H);
        side.render(img, scaled(item.settings, CHIP_W * 1.6));
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(sideCanvas, 0, 0, target.width, target.height);
      } catch { /* decorative */ }
    }
  }, [engine, shown, scene, imagesReady]);

  // Hand over to a new look with a stepped wipe from the old frame.
  const choose = useCallback((id: string) => {
    const canvas = canvasRef.current;
    const prev = prevRef.current;
    if (canvas && prev && !still) {
      prev.width = canvas.width;
      prev.height = canvas.height;
      prev.getContext('2d')?.drawImage(canvas, 0, 0);
      prev.classList.remove('kp-wipe');
      void prev.offsetWidth; // restart the animation
      prev.classList.add('kp-wipe');
    }
    setLookId(id);
  }, [still]);

  const roll = useCallback(() => {
    const pool = shown.length > 1 ? shown : looks;
    if (!pool.length) return;
    let next = pool[Math.floor(Math.random() * pool.length)];
    if (next.id === look?.id && pool.length > 1) next = pool[(pool.indexOf(next) + 1) % pool.length];
    choose(next.id);
  }, [shown, looks, look, choose]);

  // Passive visitors get a slow walk through the looks.
  useEffect(() => {
    if (!auto || still || !visible || !engine) return;
    const t = window.setInterval(roll, AUTO_MS);
    return () => clearInterval(t);
  }, [auto, still, visible, engine, roll]);

  // Keep the selected chip in view inside the rail.
  useEffect(() => {
    const rail = railRef.current;
    const chip = look && rail?.querySelector<HTMLElement>(`[data-chip="${look.id}"]`);
    if (!chip || !rail) return;
    rail.scrollTo({ left: chip.offsetLeft - rail.clientWidth / 2 + chip.clientWidth / 2, behavior: still ? 'auto' : 'smooth' });
  }, [look, still]);

  const track = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch' && e.type === 'pointermove' && !e.buttons) return;
    const r = e.currentTarget.getBoundingClientRect();
    setReveal({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  const t = THEMES[theme];
  const settings = look?.settings;

  return (
    <section className="world world-kp" id="kilopixel" ref={sectionRef} aria-labelledby="kp-title">
      <div className="kp-grid">
        <div className="kp-copy">
          <p className="kicker kp-kicker">
            <AppleLogo className="kicker-logo" />
            <AndroidLogo className="kicker-logo" />
            App #2 &middot; iPhone &amp; Android
          </p>
          <p className="kp-brand">
            <img src={KILOPIXEL.icon} alt="" width="48" height="48" />
            KILOPIXEL
          </p>
          <h2 className="kp-title" id="kp-title">One camera.<br /><span>49 looks.</span></h2>
          <p className="kp-lede">
            A live pixel camera for photos, video and GIFs. Pick a look, mix your own, or roll the dice.
            Everything in this box is drawn by the app&rsquo;s own engine.
          </p>
          <ul className="kp-stats">
            <li><b>49</b> looks</li>
            <li><b>23</b> effects</li>
            <li><b>134</b> palettes</li>
            <li><b>6</b> app themes</li>
          </ul>
          <StoreButtons stores={KILOPIXEL.stores} app="Kilopixel" className="kp-stores" />
          <p className="kp-note">
            {KILOPIXEL.stores.android.state === 'beta' && (
              <>
                <b>Android beta:</b>{' '}
                <a href={KILOPIXEL.group} target="_blank" rel="noopener noreferrer">join the testers group</a>, then opt in.{' '}
              </>
            )}
            {KILOPIXEL.stores.ios.state === 'review' && 'The iPhone version is in App Store review. '}
            <a href={KILOPIXEL.site} target="_blank" rel="noopener noreferrer">See everything it does</a>.
          </p>
        </div>

        <div className="kp-studio" ref={studioRef}>
          <div className="kp-vf-bar">
            <span className="kp-live"><i />{failed ? 'Sample' : 'Live engine'}</span>
            <span className="kp-vf-look">
              <strong>{look?.name ?? 'Riso print'}</strong>
              <span>{settings ? `${engine?.effectLabel(settings)} · ${settings.palette.length} colors` : 'Loading looks'}</span>
            </span>
          </div>
          <div
            className="kp-screen"
            onPointerMove={track}
            onPointerDown={track}
            onPointerLeave={() => setReveal(null)}
            onPointerUp={(e) => { if (e.pointerType === 'touch') setReveal(null); }}
          >
            <canvas
              ref={canvasRef}
              width={480}
              height={640}
              role="img"
              aria-label={`The ${scene} photo in Kilopixel's ${look?.name ?? 'Riso print'} look`}
            />
            <canvas
              ref={prevRef}
              className="kp-prev"
              aria-hidden="true"
              onAnimationEnd={(e) => e.currentTarget.classList.remove('kp-wipe')}
            />
            {(failed || !engine) && <img className="kp-fallback" src={SCENES[scene]} alt="" />}
            <img
              className="kp-reveal"
              src={SCENES[scene]}
              alt=""
              aria-hidden="true"
              style={reveal ? { clipPath: `circle(17% at ${reveal.x}% ${reveal.y}%)` } : { clipPath: 'circle(0 at 50% 50%)' }}
            />
            {reveal && <i className="kp-lens" style={{ left: `${reveal.x}%`, top: `${reveal.y}%` }} aria-hidden="true" />}
            <div className="kp-scenes" role="group" aria-label="Photo">
              {(Object.keys(SCENES) as Scene[]).map((s) => (
                <button key={s} type="button" aria-pressed={scene === s} onClick={() => { setAuto(false); setScene(s); }}>
                  {s === 'flower' ? 'Flower' : 'Street'}
                </button>
              ))}
            </div>
            <p className="kp-hint" aria-hidden="true">
              <span className="kp-hint-hover">Hover to see reality</span>
              <span className="kp-hint-touch">Hold to see reality</span>
            </p>
          </div>

          <div className="kp-tabs" role="group" aria-label="Filter looks">
            <button type="button" aria-pressed={group === 'all'} onClick={() => { setAuto(false); setGroup('all'); }}>All</button>
            {(engine?.groups ?? []).map((g) => (
              <button key={g.id} type="button" aria-pressed={group === g.id} onClick={() => { setAuto(false); setGroup(g.id); }}>
                {g.label}
              </button>
            ))}
          </div>
          <div className="kp-rail" role="radiogroup" aria-label="Looks" ref={railRef}>
            {shown.map((item) => (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={item.id === look?.id}
                className="kp-chip"
                data-chip={item.id}
                onClick={() => { setAuto(false); choose(item.id); }}
              >
                <canvas
                  width={CHIP_W}
                  height={CHIP_H}
                  data-look={item.id}
                  aria-hidden="true"
                />
                <span>{item.name}</span>
              </button>
            ))}
          </div>
          <div className="kp-controls">
            <p className="kp-recipe" aria-live="polite">
              {settings && engine ? (
                <>
                  <span>{engine.effectLabel(settings)} &middot; {settings.pixelSize}px</span>
                  <i aria-hidden="true">+</i>
                  <span className="kp-strip" aria-label={`${engine.paletteLabel(look?.paletteId)} palette`}>
                    {settings.palette.map((c, i) => <b key={i} style={{ background: c }} />)}
                  </span>
                  <i aria-hidden="true">=</i>
                  <strong>{look?.name}</strong>
                </>
              ) : 'Style + palette = look'}
            </p>
            <button type="button" className="kp-btn kp-roll" onClick={() => { setAuto(false); roll(); }} disabled={!engine}>
              <span aria-hidden="true">⚄</span> Roll a look
            </button>
          </div>
        </div>
      </div>

      <div className="kp-extras">
        <figure
          className="kp-tile kp-themes"
          style={{ ['--t-bg' as string]: t.bg, ['--t-ink' as string]: t.ink, ['--t-accent' as string]: t.accent }}
        >
          <div className="kp-phone">
            <img src={t.shot} alt={`The Kilopixel camera screen in the ${t.name} theme`} width="540" height="1169" loading="lazy" decoding="async" />
          </div>
          <figcaption>
            <strong>Six app themes</strong>
            <span>{t.name}. The real app, not a mockup.</span>
            <span className="kp-theme-swatches" role="radiogroup" aria-label="App theme">
              {THEMES.map((x, i) => (
                <button
                  key={x.id}
                  type="button"
                  role="radio"
                  aria-checked={i === theme}
                  aria-label={x.name}
                  style={{ background: `linear-gradient(135deg, ${x.bg} 0 55%, ${x.accent} 55%)` }}
                  onClick={() => setTheme(i)}
                />
              ))}
            </span>
          </figcaption>
        </figure>

        <figure className="kp-tile kp-motion">
          <div className="kp-motion-media">
            <img
              src={gif ? jellyLoop : jellyStill}
              alt="Jellyfish swimming through a blue Bayer dither, exported as a GIF by Kilopixel"
              width="720"
              height="960"
              loading="lazy"
              decoding="async"
            />
            <span className="kp-stamp" aria-hidden="true">GIF &middot; Bayer 4&times;4</span>
            <button type="button" className="kp-play" aria-pressed={gif} onClick={() => setGif((g) => !g)}>
              {gif ? 'Pause' : 'Play GIF'}
            </button>
          </div>
          <figcaption>
            <strong>Photo, video, GIF</strong>
            <span>Shoot it live or open a clip from your gallery. This loop came straight out of the app.</span>
            <small>
              Footage by <a href="https://commons.wikimedia.org/wiki/File:Jellyfish_at_Monterey_Bay_Aquarium_8_2024-01-11.webm" target="_blank" rel="noopener noreferrer">Fastily</a>,{' '}
              <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">CC BY-SA 4.0</a>.
            </small>
          </figcaption>
        </figure>

        <div className="kp-tile kp-spec">
          <h3>A real camera, <span>in costume.</span></h3>
          <ul>
            {SPECS.map(([name, line]) => (
              <li key={name}><b>{name}</b><span>{line}</span></li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
