import { useEffect, useRef, type ReactNode } from 'react';
import type { OrbitItem } from '../data/site';

/* Apps and games orbit on two tilted rings around whatever the hero puts in
 * the middle (the children). Items in front are full size; items passing
 * behind shrink and dim, and each one drags a comet tail in its own colour. The whole system leans a little with
 * the pointer, front one way and back the other, so it reads as depth. The
 * rings slow when the pointer is over the orbit and stop while an item is
 * hovered or focused, so anything is easy to pick. Nothing in the middle
 * takes the pointer. When the pick changes, a copy of the new item's icon
 * can fly into the middle (`flyTo`). Positions are written straight to the
 * DOM and the rings and tails to two canvases (behind and in front of the
 * middle) from one rAF loop rather than through React state. */

const RINGS = {
  apps: { rx: 0.3, ry: 0.13, speed: 0.16, size: 0.15, tail: 0.7 },
  games: { rx: 0.47, ry: 0.22, speed: -0.08, size: 0.105, tail: 0.46 },
} as const;
type Ring = keyof typeof RINGS;
const TILT = (-14 * Math.PI) / 180;
const COS = Math.cos(TILT);
const SIN = Math.sin(TILT);
const RING_STEPS = 48;
const TAIL_STEPS = 14;

export function Orbit({ items, selected, onSelect, still, centre, ringY = 0.5, flyTo, children }: {
  items: OrbitItem[];
  selected: string;
  onSelect: (id: string) => void;
  still: boolean;
  /** What kind of thing is in the middle; site.css lights it accordingly. */
  centre: string;
  /** How far down the box the rings are centred, 0 to 1. */
  ringY?: number;
  /** How far down the box the picked icon flies to. Leave out for no flight. */
  flyTo?: number;
  /** Whatever stands in the middle. */
  children: ReactNode;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLCanvasElement>(null);
  const frontRef = useRef<HTMLCanvasElement>(null);
  const replace = useRef(() => {});
  const picked = useRef(selected);

  useEffect(() => {
    // With the orbit held still (reduced motion) nothing repaints on its own,
    // so a new pick redraws once to move the emphasis.
    replace.current();
    if (picked.current === selected) return;
    picked.current = selected;
    if (still || flyTo === undefined) return;
    // The new pick's icon leaves its place in orbit and dives into the middle.
    const box = boxRef.current;
    const from = box?.querySelector<HTMLElement>('[data-orbit][data-selected]');
    const icon = from?.querySelector('img');
    if (!box || !from || !icon) return;
    const b = box.getBoundingClientRect();
    const r = from.getBoundingClientRect();
    const ghost = icon.cloneNode() as HTMLImageElement;
    ghost.className = 'orbit-ghost';
    ghost.setAttribute('aria-hidden', 'true');
    Object.assign(ghost.style, { left: `${r.left - b.left}px`, top: `${r.top - b.top}px`, width: `${r.width}px`, height: `${r.height}px` });
    box.appendChild(ghost);
    const dx = b.width / 2 - (r.left - b.left + r.width / 2);
    const dy = b.height * flyTo - (r.top - b.top + r.height / 2);
    const flight = ghost.animate([
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      { transform: `translate(${dx * 0.42}px, ${dy * 0.42 - b.width * 0.05}px) scale(1.35)`, opacity: 1, offset: 0.5 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.35)`, opacity: 0 },
    ], { duration: 480, easing: 'cubic-bezier(0.45, 0, 0.8, 0.3)' });
    const land = () => ghost.remove();
    flight.onfinish = land;
    flight.oncancel = land;
    return () => flight.cancel();
  }, [selected, still, flyTo]);

  useEffect(() => {
    const box = boxRef.current;
    const back = backRef.current?.getContext('2d');
    const front = frontRef.current?.getContext('2d');
    if (!box || !back || !front) return;
    const els = [...box.querySelectorAll<HTMLElement>('[data-orbit]')];
    const groups = { apps: els.filter((e) => e.dataset.ring === 'apps'), games: els.filter((e) => e.dataset.ring === 'games') };
    let W = box.clientWidth;
    let H = box.clientHeight;
    let dpr = 1;
    let phase = { apps: 0.35, games: -0.2 };
    let speed = 1;
    let target = 1;
    let hoverBox = false;
    let holding = 0;
    const lean = { x: 0, y: 0, tx: 0, ty: 0 };

    const fit = () => {
      W = box.clientWidth;
      H = box.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      for (const ctx of [back, front]) {
        ctx.canvas.width = Math.round(W * dpr);
        ctx.canvas.height = Math.round(H * dpr);
      }
    };

    const point = (ring: Ring, a: number) => {
      const cfg = RINGS[ring];
      const ex = Math.cos(a) * cfg.rx * W;
      const ey = Math.sin(a) * cfg.ry * W;
      const depth = Math.sin(a); // -1 behind the screen, 1 in front
      return {
        x: W / 2 + ex * COS - ey * SIN + lean.x * depth * W * 0.02,
        y: H * ringY + ex * SIN + ey * COS + lean.y * depth * W * 0.012,
        depth,
      };
    };

    const place = () => {
      for (const ctx of [back, front]) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);
        ctx.lineCap = 'round';
      }

      // The rings: dashed, fainter where they pass behind the screen.
      back.setLineDash([3, 7]);
      back.lineWidth = 1.25;
      for (const ring of ['apps', 'games'] as const) {
        for (const half of [0, 1]) {
          back.beginPath();
          for (let i = 0; i <= RING_STEPS; i++) {
            const p = point(ring, (half + i / RING_STEPS) * Math.PI);
            if (i) back.lineTo(p.x, p.y); else back.moveTo(p.x, p.y);
          }
          const rgb = ring === 'apps' ? '143 156 255' : '255 165 82';
          back.strokeStyle = `rgb(${rgb} / ${half ? 0.16 : 0.42})`;
          back.stroke();
        }
      }
      back.setLineDash([]);

      for (const ring of ['apps', 'games'] as const) {
        const cfg = RINGS[ring];
        const list = groups[ring];
        const dir = Math.sign(cfg.speed);
        const tail = cfg.tail * Math.min(1, Math.abs(speed));
        list.forEach((el, i) => {
          const a = phase[ring] + (i / list.length) * Math.PI * 2;
          const p = point(ring, a);
          const near = (p.depth + 1) / 2;
          const picked = el.hasAttribute('data-selected');
          const scale = (0.78 + 0.22 * near) * (picked ? 1.14 : 1);
          const size = cfg.size * W;
          el.style.width = el.style.height = `${size}px`;
          el.style.transform = `translate3d(${p.x - size / 2}px, ${p.y - size / 2}px, 0) scale(${scale.toFixed(3)})`;
          el.style.zIndex = p.depth > 0 ? '6' : '2';
          el.style.setProperty('--dim', picked ? '1' : (0.55 + 0.45 * near).toFixed(2));

          // The comet tail: short strokes that thin and fade away from the item.
          if (tail < 0.02) return;
          const colour = el.dataset.accent ?? '#ffffff';
          let from = p;
          for (let k = 1; k <= TAIL_STEPS; k++) {
            const to = point(ring, a - dir * tail * (k / TAIL_STEPS));
            const ctx = from.depth + to.depth > 0 ? front : back;
            const fade = 1 - (k - 1) / TAIL_STEPS;
            ctx.globalAlpha = fade * fade * (picked ? 0.85 : 0.2 + 0.4 * near);
            ctx.strokeStyle = colour;
            ctx.lineWidth = Math.max(1, size * 0.2 * scale * fade);
            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.stroke();
            from = to;
          }
          back.globalAlpha = front.globalAlpha = 1;
        });
      }
    };

    const ro = new ResizeObserver(() => { fit(); place(); });
    ro.observe(box);
    fit();
    place();
    replace.current = place;
    if (still) return () => { ro.disconnect(); replace.current = () => {}; };

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
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const r = box.getBoundingClientRect();
      lean.tx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2)));
      lean.ty = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2)));
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    let raf = 0;
    let last = 0;
    let visible = true;
    const frame = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000 || 0.016);
      last = t;
      speed += (target - speed) * Math.min(1, dt * 6);
      lean.x += (lean.tx - lean.x) * Math.min(1, dt * 4);
      // Scrolling away tips the orbit too, which is all a phone has to lean it with.
      const tipped = Math.max(-1.6, Math.min(1.6, lean.ty + (window.scrollY / window.innerHeight) * 2.2));
      lean.y += (tipped - lean.y) * Math.min(1, dt * 4);
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
      replace.current = () => {};
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pointermove', onMove);
      box.removeEventListener('pointerenter', onEnter);
      box.removeEventListener('pointerleave', onLeave);
      els.forEach((el) => {
        el.removeEventListener('pointerenter', hold);
        el.removeEventListener('pointerleave', release);
        el.removeEventListener('focus', hold);
        el.removeEventListener('blur', release);
      });
    };
  }, [still, ringY]);

  return (
    <div className="orbit" ref={boxRef} data-centre={centre} style={{ ['--ring-y' as string]: ringY }}>
      <canvas className="orbit-fx orbit-fx-back" ref={backRef} aria-hidden="true" />
      <canvas className="orbit-fx orbit-fx-front" ref={frontRef} aria-hidden="true" />
      <span className="orbit-label orbit-label-apps" aria-hidden="true">apps</span>
      <span className="orbit-label orbit-label-games" aria-hidden="true">games</span>
      <div className="orbit-center" aria-hidden="true">{children}</div>
      <ul className="orbit-items" aria-label="Apps and games">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              data-orbit
              data-ring={item.ring}
              data-accent={item.accent}
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
