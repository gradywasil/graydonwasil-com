import { useEffect, useRef } from 'react';
import gurpySrc from '../assets/fun/gurpy.png';

/* Gurpy is 64x64 pixel art. The face is drawn to a 64px canvas and scaled up
 * with CSS, so we can repaint his pupils a pixel or two toward the pointer and
 * blink him without any extra artwork. The pupil boxes below come from the
 * source PNG: a 4x5 dark block with one notched corner and a white glint. */

export type GurpyMood = 'idle' | 'ouch' | 'happy';

const PUPIL = 'rgb(36,8,5)';
const SHINE = 'rgb(247,250,246)';
const EYES = [
  { x: 22, y: 31, skin: 'rgb(253,192,137)', notch: 0 },
  { x: 38, y: 31, skin: 'rgb(253,183,130)', notch: 3 },
];

let sharedImage: HTMLImageElement | null = null;
function loadFace(): Promise<HTMLImageElement> {
  if (sharedImage?.complete) return Promise.resolve(sharedImage);
  sharedImage ??= Object.assign(new Image(), { src: gurpySrc });
  const img = sharedImage;
  return new Promise((resolve) => {
    if (img.complete) resolve(img);
    else img.addEventListener('load', () => resolve(img), { once: true });
  });
}

function paint(ctx: CanvasRenderingContext2D, img: HTMLImageElement, dx: number, dy: number, closed: boolean, mood: GurpyMood) {
  ctx.clearRect(0, 0, 64, 64);
  ctx.drawImage(img, 0, 0);
  for (const eye of EYES) {
    ctx.fillStyle = eye.skin;
    ctx.fillRect(eye.x, eye.y, 4, 5);
    ctx.fillStyle = PUPIL;
    if (mood === 'ouch') {
      // Squeezed shut: > on the left eye, < on the right.
      const left = eye.notch === 0;
      for (let i = 0; i < 3; i++) {
        const col = left ? eye.x + i : eye.x + 3 - i;
        ctx.fillRect(col, eye.y + i, 1, 1);
        ctx.fillRect(col, eye.y + 4 - i, 1, 1);
      }
      continue;
    }
    if (closed) {
      ctx.fillRect(eye.x - 1, eye.y + 3, 6, 1);
      continue;
    }
    if (mood === 'happy') {
      // Upturned crescents.
      ctx.fillRect(eye.x, eye.y + 2, 1, 1);
      ctx.fillRect(eye.x + 1, eye.y + 1, 2, 1);
      ctx.fillRect(eye.x + 3, eye.y + 2, 1, 1);
      continue;
    }
    const px = eye.x + dx;
    const py = eye.y + dy;
    ctx.fillRect(px, py, 4, 5);
    ctx.fillStyle = eye.skin;
    ctx.fillRect(px + eye.notch, py, 1, 1);
    ctx.fillStyle = SHINE;
    ctx.fillRect(px + 1, py + 1, 1, 1);
  }
}

export function GurpyFace({ mood = 'idle', className, still = false }: {
  mood?: GurpyMood;
  className?: string;
  /** Stop blinking and idle glances (reduced motion). Eyes still follow. */
  still?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const moodRef = useRef(mood);
  const redraw = useRef<() => void>(() => {});

  useEffect(() => {
    moodRef.current = mood;
    redraw.current();
  }, [mood]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    let img: HTMLImageElement | null = null;
    let look = { dx: 0, dy: 0 };
    let closed = false;
    let lastPointer = 0;
    let alive = true;
    const timers: number[] = [];

    const draw = () => { if (img) paint(ctx, img, look.dx, look.dy, closed, moodRef.current); };
    redraw.current = draw;
    void loadFace().then((loaded) => { if (alive) { img = loaded; draw(); } });

    const aim = (px: number, py: number) => {
      const r = canvas.getBoundingClientRect();
      // The eyes sit a bit above the middle of the face.
      const vx = px - (r.left + r.width / 2);
      const vy = py - (r.top + r.height * 0.52);
      const d = Math.hypot(vx, vy);
      const next = d < r.width * 0.18
        ? { dx: 0, dy: 0 }
        : {
            dx: Math.round(Math.max(-2, Math.min(2, (vx / d) * 2.4))),
            dy: Math.round(Math.max(-1, Math.min(1, (vy / d) * 1.4))),
          };
      if (next.dy === -1 && Math.abs(next.dx) === 2) next.dy = 0;
      if (next.dx !== look.dx || next.dy !== look.dy) { look = next; draw(); }
    };
    const onMove = (e: PointerEvent) => { lastPointer = performance.now(); aim(e.clientX, e.clientY); };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onMove, { passive: true });

    if (!still) {
      const blink = () => {
        closed = true; draw();
        timers.push(window.setTimeout(() => { closed = false; draw(); }, 120));
        timers.push(window.setTimeout(blink, 2400 + Math.random() * 3200));
      };
      timers.push(window.setTimeout(blink, 1800));
      // With no pointer around (phones), glance about now and then.
      const glance = () => {
        if (performance.now() - lastPointer > 4000) {
          look = { dx: Math.round(Math.random() * 4 - 2), dy: Math.round(Math.random() * 2 - 1) };
          if (look.dy === -1 && Math.abs(look.dx) === 2) look.dy = 0;
          draw();
        }
        timers.push(window.setTimeout(glance, 2200 + Math.random() * 2000));
      };
      timers.push(window.setTimeout(glance, 3000));
    }

    return () => {
      alive = false;
      timers.forEach(clearTimeout);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onMove);
    };
  }, [still]);

  return <canvas ref={canvasRef} className={`gurpy-face ${className ?? ''}`} width={64} height={64} aria-hidden="true" />;
}
