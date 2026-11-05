import { useEffect, useRef, type ReactNode } from 'react';
import type { OrbitItem } from '../data/site';

/* Apps and games orbit Gurpy on two tilted rings. Items in front of him are
 * full size; items passing behind shrink and dim. The rings slow when the
 * pointer is over the orbit and stop while an item is hovered or focused,
 * so anything is easy to pick. Positions are written straight to the DOM
 * from one rAF loop rather than through React state. */

const RINGS = {
  apps: { rx: 0.3, ry: 0.13, speed: 0.16, size: 0.15 },
  games: { rx: 0.47, ry: 0.22, speed: -0.08, size: 0.105 },
} as const;
const TILT = (-14 * Math.PI) / 180;

export function Orbit({ items, selected, onSelect, still, bubble, children }: {
  items: OrbitItem[];
  selected: string;
  onSelect: (id: string) => void;
  still: boolean;
  /** Gurpy's speech bubble, kept above everything in orbit. */
  bubble: ReactNode;
  /** Gurpy. */
  children: ReactNode;
}) {
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const els = [...box.querySelectorAll<HTMLElement>('[data-orbit]')];
    const groups = { apps: els.filter((e) => e.dataset.ring === 'apps'), games: els.filter((e) => e.dataset.ring === 'games') };
    let W = box.clientWidth;
    let H = box.clientHeight;
    let phase = { apps: 0.35, games: -0.2 };
    let speed = 1;
    let target = 1;
    let hoverBox = false;
    let holding = 0;

    const place = () => {
      const cx = W / 2;
      const cy = H / 2;
      for (const ring of ['apps', 'games'] as const) {
        const cfg = RINGS[ring];
        const list = groups[ring];
        list.forEach((el, i) => {
          const a = phase[ring] + (i / list.length) * Math.PI * 2;
          const ex = Math.cos(a) * cfg.rx * W;
          const ey = Math.sin(a) * cfg.ry * W;
          const x = cx + ex * Math.cos(TILT) - ey * Math.sin(TILT);
          const y = cy + ex * Math.sin(TILT) + ey * Math.cos(TILT);
          const depth = Math.sin(a); // -1 behind Gurpy, 1 in front
          const scale = 0.78 + 0.22 * ((depth + 1) / 2);
          const size = cfg.size * W;
          el.style.width = el.style.height = `${size}px`;
          el.style.transform = `translate3d(${x - size / 2}px, ${y - size / 2}px, 0) scale(${scale.toFixed(3)})`;
          el.style.zIndex = depth > 0 ? '6' : '2';
          el.style.setProperty('--dim', (0.55 + 0.45 * ((depth + 1) / 2)).toFixed(2));
        });
      }
    };

    const ro = new ResizeObserver(() => { W = box.clientWidth; H = box.clientHeight; place(); });
    ro.observe(box);
    place();
    if (still) return () => ro.disconnect();

    const retarget = () => { target = holding > 0 ? 0 : hoverBox ? 0.3 : 1; };
    const onEnter = () => { hoverBox = true; retarget(); };
    const onLeave = () => { hoverBox = false; retarget(); };
    const hold = () => { holding++; retarget(); };
    const release = () => { holding = Math.max(0, holding - 1); retarget(); };
    box.addEventListener('pointerenter', onEnter);
    box.addEventListener('pointerleave', onLeave);
    els.forEach((el) => {
      el.addEventListener('pointerenter', hold);
      el.addEventListener('pointerleave', release);
      el.addEventListener('focus', hold);
      el.addEventListener('blur', release);
    });

    let raf = 0;
    let last = 0;
    let visible = true;
    const frame = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000 || 0.016);
      last = t;
      speed += (target - speed) * Math.min(1, dt * 6);
      phase = { apps: phase.apps + RINGS.apps.speed * speed * dt, games: phase.games + RINGS.games.speed * speed * dt };
      place();
      raf = requestAnimationFrame(frame);
    };
    const run = () => { if (!raf && visible && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); } };
    const halt = () => { cancelAnimationFrame(raf); raf = 0; };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) run(); else halt(); });
    io.observe(box);
    const onVis = () => (document.hidden ? halt() : run());
    document.addEventListener('visibilitychange', onVis);
    run();

    return () => {
      halt(); ro.disconnect(); io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      box.removeEventListener('pointerenter', onEnter);
      box.removeEventListener('pointerleave', onLeave);
      els.forEach((el) => {
        el.removeEventListener('pointerenter', hold);
        el.removeEventListener('pointerleave', release);
        el.removeEventListener('focus', hold);
        el.removeEventListener('blur', release);
      });
    };
  }, [still]);

  const tilt = (TILT * 180) / Math.PI;
  return (
    <div className="orbit" ref={boxRef}>
      <svg className="orbit-rings" viewBox="-50 -37 100 74" aria-hidden="true">
        <ellipse rx={RINGS.apps.rx * 100} ry={RINGS.apps.ry * 100} transform={`rotate(${tilt})`} />
        <ellipse rx={RINGS.games.rx * 100} ry={RINGS.games.ry * 100} transform={`rotate(${tilt})`} />
      </svg>
      <span className="orbit-label orbit-label-apps" aria-hidden="true">apps</span>
      <span className="orbit-label orbit-label-games" aria-hidden="true">games</span>
      <div className="orbit-center">{children}</div>
      <div className="orbit-bubble">{bubble}</div>
      <ul className="orbit-items" aria-label="Apps and games">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              data-orbit
              data-ring={item.ring}
              data-selected={item.id === selected || undefined}
              className="orbit-item"
              style={{ ['--accent' as string]: item.accent }}
              aria-pressed={item.id === selected}
              aria-label={`${item.name}, ${item.status}`}
              onClick={() => onSelect(item.id)}
            >
              <img src={item.icon} alt="" draggable={false} data-px={item.pixel || undefined} data-ring={item.ring} />
              <span className="orbit-name" aria-hidden="true">{item.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
