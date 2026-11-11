import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { flushSync } from 'react-dom';
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
import { useReveal } from '../lib/useReveal';
import type { Renderer, Settings } from '../vendor/kilopixel/renderer';
import type { LookTheme, StarterPreset } from '../vendor/kilopixel/looks';
import { AndroidLogo, AppleLogo, StoreButtons } from './StoreButtons';

/* Kilopixel, shown with the app's own engine (a snapshot in src/vendor/kilopixel).
 * The viewfinder renders the 49 built-in looks live on two sample photos, or
 * on the visitor's own camera if they ask for it; the rail below previews
 * every look; hovering shows the original. The app's six themes re-skin the
 * whole section, not just a card. Below: the real app in the chosen theme, a
 * GIF it exported, and the rest. */

const SCENES = { flower: flowerSrc, street: streetSrc } as const;
type Sample = keyof typeof SCENES;
type Scene = Sample | 'camera';

/* The app's six interface themes (ids, names and base colours from
 * src/vendor/kilopixel/themes.ts), filled out for a whole section: `hot` is
 * the accent when it is used as text, `on` is text on an accent fill. */
const THEMES = [
  { id: 'dark', name: 'Graphite', shot: appDark, bg: '#121212', panel: '#1b1b19', ink: '#efede4', muted: '#b5b3aa', line: '#3a3934', chip: '#262623', accent: '#ff6a1f', hot: '#ff6a1f', on: '#160700' },
  { id: 'classic', name: 'Classic', shot: appClassic, bg: '#f4f2ea', panel: '#ffffff', ink: '#111111', muted: '#4d4c48', line: '#c9c6ba', chip: '#e7e4d8', accent: '#111111', hot: '#111111', on: '#f4f2ea' },
  { id: 'pocket', name: 'Pocket', shot: appPocket, bg: '#9bab70', panel: '#b4c38a', ink: '#1f2b14', muted: '#2c3a1e', line: '#7d8c58', chip: '#a3b27a', accent: '#30461f', hot: '#283c18', on: '#dfe8c4' },
  { id: 'arcade', name: 'Arcade', shot: appArcade, bg: '#0f1230', panel: '#1a1f48', ink: '#f6f0ff', muted: '#b4b0d6', line: '#343a78', chip: '#262c5e', accent: '#46e6d6', hot: '#46e6d6', on: '#06202a' },
  { id: 'terminal', name: 'Terminal', shot: appTerminal, bg: '#0b0a07', panel: '#17140c', ink: '#ffcf7a', muted: '#c79a52', line: '#3d3115', chip: '#241e10', accent: '#ffb000', hot: '#ffb000', on: '#1a1000' },
  { id: 'candy', name: 'Candy', shot: appCandy, bg: '#fbe4ef', panel: '#fff4f9', ink: '#43215e', muted: '#6d4b85', line: '#e9bcd3', chip: '#f6d3e3', accent: '#ff4f9a', hot: '#b3206a', on: '#2b0a25' },
] as const;

/** Six swatches that pick the app theme, wherever they are shown. */
function Skins({ theme, onPick }: { theme: number; onPick: (i: number) => void }) {
  return (
    <span className="kp-theme-swatches" role="radiogroup" aria-label="App theme">
      {THEMES.map((x, i) => (
        <button
          key={x.id}
          type="button"
          role="radio"
          className="kp-skin"
          aria-checked={i === theme}
          aria-label={x.name}
          style={{ background: `linear-gradient(135deg, ${x.bg} 0 55%, ${x.accent} 55%)` }}
          onClick={() => onPick(i)}
        />
      ))}
    </span>
  );
}

const SPECS = [
  ['3-shot moment', 'Frames from just before and after the press. Keep the best one.'],
  ['Steady and Tripod', 'Stabilize live video, or clips you import.'],
  ['Sounds like it looks', 'VHS warbles like tape. Dithers buzz like a handheld.'],
  ['Edit your gallery', 'Old photos, videos and GIFs get new looks.'],
  ['Yours, on your phone', 'No account. No uploads. Every pixel stays on the device.'],
] as const;

const AUTO_MS = 3200;
/** While the camera is on, the look rail repaints this often. */
const RAIL_MS = 2500;
const NO_CAMERA = 'No camera here, so the sample photo stays. Nothing leaves your browser either way.';
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
  const titleRef = useReveal<HTMLHeadingElement>();
  const [sectionRef, near] = useInView<HTMLElement>('600px 0px');
  const [studioRef, visible] = useInView<HTMLDivElement>('0px');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prevRef = useRef<HTMLCanvasElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const images = useRef<Partial<Record<Sample, HTMLImageElement>>>({});
  const videoRef = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const asking = useRef(false);

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
  const [note, setNote] = useState<string | null>(null);
  const [flash, setFlash] = useState(0);

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
    Promise.all((Object.keys(SCENES) as Sample[]).map(async (key) => {
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

  /** What the engine is pointed at: a sample photo, or the camera once it has a frame. */
  const source = useCallback((): CanvasImageSource | undefined => {
    if (scene !== 'camera') return images.current[scene];
    const video = videoRef.current;
    return video && video.readyState >= 2 ? video : undefined;
  }, [scene]);

  const draw = useCallback((time?: number) => {
    const from = source();
    if (!engine || !look || !from) return;
    try { engine.main.render(from, scaled(look.settings, 480), { time }); } catch { /* keep the last frame */ }
  }, [engine, look, source]);

  // Paint the viewfinder; VHS looks, and the camera, keep moving while on screen.
  useEffect(() => {
    if (!imagesReady) return;
    draw();
    const moving = scene === 'camera' || (!still && !!engine && !!look && engine.animated(look.settings));
    if (!moving || !visible) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => { draw(now - start); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [draw, imagesReady, engine, look, visible, still, scene]);

  // Preview chips: every look in the rail, rendered on the current scene. With
  // the camera on they are redrawn every so often, so the rail is you too.
  useEffect(() => {
    if (!engine || !imagesReady) return;
    const { side, sideCanvas } = engine;
    const byId = new Map(shown.map((x) => [x.id, x]));
    const paint = () => {
      const from = source();
      if (!from) return;
      for (const target of railRef.current?.querySelectorAll<HTMLCanvasElement>('canvas[data-look]') ?? []) {
        const item = byId.get(target.dataset.look ?? '');
        const ctx = target.getContext('2d');
        if (!item || !ctx) continue;
        try {
          side.setSize(CHIP_W, CHIP_H);
          side.render(from, scaled(item.settings, CHIP_W * 1.6));
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(sideCanvas, 0, 0, target.width, target.height);
        } catch { /* decorative */ }
      }
    };
    paint();
    if (scene !== 'camera') return;
    const first = window.setTimeout(paint, 350);
    const t = window.setInterval(paint, RAIL_MS);
    return () => { clearTimeout(first); clearInterval(t); };
  }, [engine, shown, scene, imagesReady, source]);

  /* The visitor's own camera, only when they ask. The picture goes from the
   * camera to the engine on this page and nowhere else. */
  const closeCamera = useCallback(() => {
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const openCamera = async () => {
    setAuto(false);
    if (scene === 'camera' || asking.current) return;
    asking.current = true;
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('unavailable');
      const feed = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: 'user', width: { ideal: 960 }, height: { ideal: 1280 } } });
      const video = videoRef.current;
      if (!video) { feed.getTracks().forEach((track) => track.stop()); return; }
      stream.current = feed;
      video.srcObject = feed;
      await video.play();
      setNote(null);
      setScene('camera');
    } catch {
      closeCamera();
      setNote(NO_CAMERA);
    } finally {
      asking.current = false;
    }
  };

  const showSample = (s: Sample) => {
    setAuto(false);
    closeCamera();
    setScene(s);
  };

  // The camera goes off when the viewfinder scrolls away, the tab closes, or the page does.
  useEffect(() => {
    if (scene !== 'camera') return;
    const studio = studioRef.current;
    const off = () => { closeCamera(); setScene('flower'); };
    const io = new IntersectionObserver(([e]) => { if (!e.isIntersecting) off(); });
    if (studio) io.observe(studio);
    window.addEventListener('pagehide', off);
    return () => { io.disconnect(); window.removeEventListener('pagehide', off); };
  }, [scene, studioRef, closeCamera]);
  useEffect(() => closeCamera, [closeCamera]);
  useEffect(() => {
    if (!note) return;
    const t = window.setTimeout(() => setNote(null), 5200);
    return () => clearTimeout(t);
  }, [note]);

  /** Save what the viewfinder shows, at twice its size with hard pixels. */
  const snap = () => {
    const canvas = canvasRef.current;
    if (!canvas || !look) return;
    draw();
    const shot = document.createElement('canvas');
    shot.width = canvas.width * 2;
    shot.height = canvas.height * 2;
    const ctx = shot.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    // The viewfinder is mirrored like a selfie camera; save it the way it looked.
    ctx.translate(shot.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(canvas, 0, 0, shot.width, shot.height);
    setFlash((n) => n + 1);
    shot.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = Object.assign(document.createElement('a'), { href: url, download: `kilopixel-${look.id.replace(/^starter-/, '')}.png` });
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 10000);
    }, 'image/png');
  };

  /** Re-skin the section in one of the app's themes, wiped in like a look change. */
  const skin = (i: number) => {
    if (i === theme) return;
    if (still || !('startViewTransition' in document)) { setTheme(i); return; }
    const root = document.documentElement;
    root.dataset.vt = 'kp';
    const done = () => { delete root.dataset.vt; };
    try {
      document.startViewTransition(() => flushSync(() => setTheme(i))).finished.then(done, done);
    } catch {
      done();
      setTheme(i);
    }
  };

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

  const lens = reveal ? `circle(17% at ${reveal.x}% ${reveal.y}%)` : 'circle(0 at 50% 50%)';
  const t = THEMES[theme];
  const skinVars = {
    '--kp-bg': t.bg, '--kp-panel': t.panel, '--kp-ink': t.ink, '--kp-muted': t.muted, '--kp-line': t.line,
    '--kp-chip': t.chip, '--kp-orange': t.accent, '--kp-hot': t.hot, '--kp-on': t.on,
  } as CSSProperties;
  const settings = look?.settings;
  const onCamera = scene === 'camera';

  return (
    <section className="world world-kp" id="kilopixel" ref={sectionRef} aria-labelledby="kp-title" data-theme={t.id} style={skinVars}>
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
          <h2 className="kp-title" id="kp-title" ref={titleRef}>One camera.<br /><span>49 looks.</span></h2>
          <p className="kp-lede">
            A live pixel camera for photos, video and GIFs.
            <span className="only-wide">
              {' '}Pick a look, mix your own, or roll the dice. Everything in this box is drawn by the
              app&rsquo;s own engine.
            </span>
          </p>
          <ul className="kp-stats">
            <li><b>49</b> looks</li>
            <li><b>23</b> effects</li>
            <li><b>134</b> palettes</li>
          </ul>
          {/* The app's six themes, worn by this whole section. */}
          <div className="kp-skins">
            <span className="kp-skins-label">App theme</span>
            <Skins theme={theme} onPick={skin} />
            <b>{t.name}</b>
          </div>
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
            <span className="kp-live"><i />{failed ? 'Sample' : onCamera ? 'Your camera, never uploaded' : 'Live engine'}</span>
            <span className="kp-vf-look">
              <strong>{look?.name ?? 'Riso print'}</strong>
              <span>{settings ? `${engine?.effectLabel(settings)} · ${settings.palette.length} colors` : 'Loading looks'}</span>
            </span>
          </div>
          <div
            className="kp-screen"
            data-mirror={onCamera || undefined}
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
              aria-label={`${onCamera ? 'Your camera' : `The ${scene} photo`} in Kilopixel's ${look?.name ?? 'Riso print'} look`}
            />
            <canvas
              ref={prevRef}
              className="kp-prev"
              aria-hidden="true"
              onAnimationEnd={(e) => e.currentTarget.classList.remove('kp-wipe')}
            />
            {(failed || !engine) && <img className="kp-fallback" src={SCENES[onCamera ? 'flower' : scene]} alt="" />}
            {!onCamera && (
              <img
                className="kp-reveal"
                src={SCENES[scene]}
                alt=""
                aria-hidden="true"
                style={{ clipPath: lens }}
              />
            )}
            {/* The camera's own picture: the engine reads it, and the lens shows it untouched. */}
            <video
              ref={videoRef}
              className="kp-reveal"
              muted
              playsInline
              aria-hidden="true"
              style={{ clipPath: onCamera && reveal ? `circle(17% at ${100 - reveal.x}% ${reveal.y}%)` : 'circle(0 at 50% 50%)' }}
            />
            {reveal && <i className="kp-lens" style={{ left: `${reveal.x}%`, top: `${reveal.y}%` }} aria-hidden="true" />}
            {flash > 0 && <i className="kp-flash" key={flash} aria-hidden="true" />}
            <div className="kp-scenes" role="group" aria-label="Picture">
              {(Object.keys(SCENES) as Sample[]).map((s) => (
                <button key={s} type="button" aria-pressed={scene === s} onClick={() => showSample(s)}>
                  {s === 'flower' ? 'Flower' : 'Street'}
                </button>
              ))}
              <button type="button" className="kp-you" aria-pressed={onCamera} aria-label="Use your camera" onClick={() => void openCamera()}>
                <svg viewBox="0 0 12 10" aria-hidden="true" shapeRendering="crispEdges"><path d="M0 2h3V1h1V0h4v1h1v1h3v8H0zM4 4v4h4V4z" fill="currentColor" fillRule="evenodd" /></svg>
                You
              </button>
            </div>
            {onCamera && engine && (
              <button type="button" className="kp-shutter" onClick={snap} aria-label={`Save this photo in the ${look?.name ?? ''} look`}>
                <i aria-hidden="true" />
              </button>
            )}
            {note && <p className="kp-toast" role="status">{note}</p>}
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
          <div className="kp-rail" role="radiogroup" aria-label="Looks" ref={railRef} data-mirror={onCamera || undefined}>
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
              <span aria-hidden="true" key={look?.id}>⚄</span> Roll<span className="only-wide"> a look</span>
            </button>
          </div>
        </div>
      </div>

      <div className="kp-extras">
        <figure className="kp-tile kp-themes">
          <div className="kp-phone">
            <img src={t.shot} alt={`The Kilopixel camera screen in the ${t.name} theme`} width="540" height="1169" loading="lazy" decoding="async" />
          </div>
          <figcaption>
            <strong>Six app themes</strong>
            <span>{t.name}. The real app, not a mockup. <span className="only-wide">Pick one and this whole section wears it.</span></span>
            <Skins theme={theme} onPick={skin} />
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
