import { useEffect, useRef, useState, type PointerEvent } from 'react';
import flowerSrc from '../assets/fun/kp-flower.webp';
import { KILOPIXEL } from '../data/site';

/* A small taste of KiloPixel: the photo is shrunk to a pixel grid, ordered-
 * dithered with a 4x4 Bayer matrix, and mapped onto a palette. Hovering (or
 * dragging) shows the original through a round window, like the real site. */

interface Look { name: string; colors: string[]; cell: number; }

const LOOKS: Look[] = [
  { name: 'Riso pop', colors: ['#1d2a5a', '#d9487a', '#ff9a3c', '#c8f5dc'], cell: 5 },
  { name: 'Pocket', colors: ['#0f380f', '#306230', '#8bac0f', '#c4d66b'], cell: 6 },
  { name: 'Paper', colors: ['#111111', '#f3efe4'], cell: 4 },
  { name: 'Arcade', colors: ['#14002b', '#e0237f', '#00d9ff', '#ffe600'], cell: 6 },
  { name: 'Ember', colors: ['#120a06', '#7a1f0b', '#ff6a1f', '#ffd9a8'], cell: 5 },
  { name: 'Ice', colors: ['#06141f', '#1f5c8a', '#7fd1ff', '#ffffff'], cell: 7 },
];

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16 - 0.5);

function hex(c: string): [number, number, number] {
  const n = parseInt(c.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function KiloPixelCard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [look, setLook] = useState(0);
  const [reveal, setReveal] = useState<{ x: number; y: number } | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const ditheredRef = useRef<HTMLCanvasElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = flowerSrc;
    img.decode().then(() => { imgRef.current = img; setReady(true); }).catch(() => {});
  }, []);

  // Re-dither whenever the look changes.
  useEffect(() => {
    const img = imgRef.current;
    if (!ready || !img) return;
    const { colors, cell } = LOOKS[look];
    const W = 360;
    const H = Math.round((W * img.height) / img.width);
    const gw = Math.ceil(W / cell);
    const gh = Math.ceil(H / cell);
    const small = document.createElement('canvas');
    small.width = gw; small.height = gh;
    const sctx = small.getContext('2d', { willReadFrequently: true });
    if (!sctx) return;
    sctx.drawImage(img, 0, 0, gw, gh);
    const data = sctx.getImageData(0, 0, gw, gh);
    const pal = colors.map(hex);
    const levels = pal.length - 1;
    for (let y = 0; y < gh; y++) {
      for (let x = 0; x < gw; x++) {
        const i = (y * gw + x) * 4;
        const lum = (0.299 * data.data[i] + 0.587 * data.data[i + 1] + 0.114 * data.data[i + 2]) / 255;
        const v = Math.max(0, Math.min(levels, Math.round(lum * levels + BAYER[(y % 4) * 4 + (x % 4)])));
        const [r, g, b] = pal[v];
        data.data[i] = r; data.data[i + 1] = g; data.data[i + 2] = b;
      }
    }
    sctx.putImageData(data, 0, 0);
    ditheredRef.current = small;
  }, [look, ready]);

  // Runs after the dither effect above, so it always paints the current look.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const small = ditheredRef.current;
    const img = imgRef.current;
    if (!canvas || !ctx || !small || !img) return;
    const W = canvas.width;
    const H = canvas.height;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(small, 0, 0, W, H);
    if (reveal) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(reveal.x * W, reveal.y * H, W * 0.17, 0, Math.PI * 2);
      ctx.clip();
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(img, 0, 0, W, H);
      ctx.restore();
      ctx.beginPath();
      ctx.arc(reveal.x * W, reveal.y * H, W * 0.17, 0, Math.PI * 2);
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#ff6a1f';
      ctx.stroke();
    }
  }, [look, ready, reveal]);

  const track = (e: PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setReveal({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height });
  };

  const roll = () => {
    let next = look;
    while (next === look) next = Math.floor(Math.random() * LOOKS.length);
    setLook(next);
  };

  return (
    <article className="app-card kp-card" aria-labelledby="kp-title">
      <div className="kp-copy">
        <p className="app-status"><span className="dot" />Android beta &middot; App #2</p>
        <h3 className="kp-title" id="kp-title">
          <img src={KILOPIXEL.icon} alt="" width="44" height="44" />
          KiloPixel
        </h3>
        <p className="kp-tagline">One camera.<br /><span>49 looks.</span></p>
        <p className="app-desc">
          A live pixel camera for photos, video and GIFs. Pick a look, mix your own, or roll the dice.
        </p>
        <div className="kp-looks" role="radiogroup" aria-label="Try a look">
          {LOOKS.map((l, i) => (
            <button
              key={l.name}
              type="button"
              role="radio"
              aria-checked={i === look}
              aria-label={l.name}
              className="kp-swatch"
              style={{ background: `linear-gradient(135deg, ${l.colors[0]} 0 50%, ${l.colors[l.colors.length - 2] ?? l.colors[1]} 50% 75%, ${l.colors[l.colors.length - 1]} 75%)` }}
              onClick={() => setLook(i)}
            />
          ))}
        </div>
        <div className="app-actions">
          <a className="kp-btn" href={KILOPIXEL.site} target="_blank" rel="noopener noreferrer">
            Get the beta <span aria-hidden="true">&rarr;</span>
          </a>
          <button type="button" className="kp-roll" onClick={roll}>
            <span aria-hidden="true">⚄</span> Roll a look
          </button>
        </div>
      </div>
      <figure className="kp-viewer">
        <figcaption>
          <span>{LOOKS[look].name}</span>
          <span className="kp-hint">Hover to see reality</span>
        </figcaption>
        <canvas
          ref={canvasRef}
          width={540}
          height={720}
          role="img"
          aria-label={`A photo of a flower in the ${LOOKS[look].name} pixel look`}
          onPointerMove={track}
          onPointerDown={track}
          onPointerLeave={() => setReveal(null)}
        />
      </figure>
    </article>
  );
}
