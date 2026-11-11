import { useEffect, useRef } from 'react';

/* A pixel-art sun for the middle of the orbit. It is drawn on a 64px canvas
 * and scaled up with hard pixels: a dithered disc whose surface churns, a
 * thin corona, and eight rays that trade lengths the way a sprite's would.
 * It burns in the picked item's colour and flares once on each pick. It runs
 * at a sprite's frame rate, not the screen's. */

const SIZE = 64;
const MID = SIZE / 2;
const RADIUS = 13;
const FPS = 12;
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const RAYS: Array<[number, number]> = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];

type Rgb = [number, number, number];
const parse = (hex: string): Rgb => {
  const n = parseInt(hex.replace('#', '').padEnd(6, '0').slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const mix = (a: Rgb, b: Rgb, t: number): Rgb => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const WHITE: Rgb = [255, 250, 236];
const NIGHT: Rgb = [14, 17, 36];

export function PixelSun({ accent, pick, still }: { accent: string; pick: string; still: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const live = useRef({ target: parse(accent), flare: 0, draw: () => {} });

  useEffect(() => {
    live.current.target = parse(accent);
    live.current.flare = 1;
    live.current.draw();
  }, [accent, pick]);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const state = live.current;
    const image = ctx.createImageData(SIZE, SIZE);
    let colour: Rgb = [...state.target];
    let frame = 0;

    const paint = () => {
      const t = frame / FPS;
      const flare = state.flare;
      const hot = mix(colour, WHITE, 0.78);
      const shades = [mix(colour, NIGHT, 0.5), mix(colour, NIGHT, 0.2), colour, mix(colour, WHITE, 0.4), hot];
      const radius = RADIUS + flare * 2.5;
      const data = image.data;
      data.fill(0);
      const put = (x: number, y: number, c: Rgb, a = 255) => {
        if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) return;
        const i = (y * SIZE + x) * 4;
        data[i] = c[0]; data[i + 1] = c[1]; data[i + 2] = c[2]; data[i + 3] = a;
      };

      for (let y = 0; y < SIZE; y++) {
        for (let x = 0; x < SIZE; x++) {
          const dx = x - MID + 0.5;
          const dy = y - MID + 0.5;
          const d = Math.hypot(dx, dy);
          const dither = (BAYER[(y & 3) * 4 + (x & 3)] + 0.5) / 16;
          if (d < radius) {
            // The surface: bright in the middle, with slow cells drifting across it.
            const churn = Math.sin(x * 0.55 + t * 1.3) * Math.sin(y * 0.5 - t) + Math.sin((x + y) * 0.32 - t * 0.7);
            const v = 1.05 - (d / radius) ** 2 * 0.72 + churn * 0.11 + flare * 0.3;
            const level = Math.max(0, Math.min(4, Math.floor(v * 4 + dither - 0.5)));
            put(x, y, shades[level]);
          } else if (d < radius + 5 + flare * 6) {
            // The corona thins out through an ordered dither.
            const reach = 1 - (d - radius) / (5 + flare * 6);
            if (reach * reach * (0.75 + flare * 0.25) > dither) put(x, y, shades[2], 220);
          }
        }
      }

      // Rays: every other one long, and they swap about twice a second.
      const swap = Math.floor(t * 2.2) % 2;
      RAYS.forEach(([rx, ry], i) => {
        const diagonal = rx !== 0 && ry !== 0;
        const step = diagonal ? Math.SQRT1_2 : 1;
        const long = i % 2 === swap;
        const from = radius + 4;
        const len = (long ? 8 : 4) + flare * 7;
        for (let k = 0; k < len; k++) {
          const r = (from + k) * step;
          const x = Math.round(MID - 0.5 + rx * r);
          const y = Math.round(MID - 0.5 + ry * r);
          const c = k < len * 0.5 ? shades[3] : shades[2];
          put(x, y, c);
          if (!diagonal && k < len - 2) put(x + Math.abs(ry), y + Math.abs(rx), c);
        }
      });
      ctx.putImageData(image, 0, 0);
    };

    const tick = () => {
      frame++;
      colour = mix(colour, state.target, 0.35);
      state.flare = state.flare < 0.02 ? 0 : state.flare * 0.72;
      paint();
    };
    if (still) {
      // Held still: one frame per pick, in the new colour, with no flare.
      state.draw = () => { colour = [...state.target]; state.flare = 0; paint(); };
      state.draw();
      return () => { state.draw = () => {}; };
    }
    paint();

    let timer = 0;
    let visible = true;
    const run = () => { if (!timer && visible && !document.hidden) timer = window.setInterval(tick, 1000 / FPS); };
    const halt = () => { clearInterval(timer); timer = 0; };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) run(); else halt(); });
    io.observe(canvas);
    const onVis = () => (document.hidden ? halt() : run());
    document.addEventListener('visibilitychange', onVis);
    run();
    return () => {
      halt();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      state.draw = () => {};
    };
  }, [still]);

  return <canvas ref={ref} className="pixel-sun" width={SIZE} height={SIZE} aria-hidden="true" />;
}
