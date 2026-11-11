/* Game feel for the whole page, kept in one place.
 *
 * Sparks: anything you press answers with a burst of square pixels in the
 * colour of the world it sits in (the `--spark` custom property), drawn on
 * one fixed canvas that only runs while particles are alive.
 *
 * Lean: App Store and Google Play buttons tip toward the pointer and carry a
 * sheen under it.
 *
 * Reveals: the smaller pieces of each world (ledes, store buttons, stat
 * chips, the groovebox keys, the side-project tiles) arrive once as they
 * scroll into view, staggered by their order among their siblings, and
 * again on every later visit. Pieces are hidden only while off screen, and
 * CSS does the motion.
 *
 * None of it runs under reduced motion. */

interface Particle { x: number; y: number; vx: number; vy: number; age: number; life: number; size: number; colour: string }

const GRAVITY = 1100;
const CREAM = '#f6efe3';
/** Everything that throws sparks when pressed. */
const SPARKY = [
  '.chunky-btn', 'a.store-btn', 'a.store-pill', '.morse-send', '.kp-btn', '.kp-play', '.bb-key', '.splash-play',
  '.rp-btn', '.orbit-item', '.orbit-card-go', '.top-tab', '.game-hub', '.bb-lane-name', '.kp-skin', '.kp-shutter', '.hs-icon', '.hs-note', '.hs-back', '.hs-kp-roll', '.ws-go',
].join(',');

/** What arrives on scroll, and how (the `data-rv` kinds in site.css). */
const REVEALS: Array<[string, string]> = [
  ['.morse-lede, .morse-demo, .morse-note, .kp-brand, .kp-lede, .kp-note, .bb-desc, .bb-note, .games-lede, .more-head p, .hello-title, .hello-me p, .footer > *', 'rise'],
  ['.world .store-row > *, .kp-stats li, .bb-steps li, .game-hub', 'pop'],
  ['.more-tile', 'deal'],
  ['.bb-lane-name, .bb-cell', 'key'],
  ['.polaroid', 'drop'],
];

function initReveals() {
  if (!('IntersectionObserver' in window)) return () => {};
  // In once most of a piece is on screen, out again only when all of it has
  // left, so every visit replays and nothing blinks at the edge.
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.intersectionRatio >= 0.3) e.target.setAttribute('data-in', '');
      else if (!e.isIntersecting) e.target.removeAttribute('data-in');
    }
  }, { threshold: [0, 0.3] });
  const all: HTMLElement[] = [];
  for (const [selector, kind] of REVEALS) {
    for (const el of document.querySelectorAll<HTMLElement>(selector)) {
      if (el.hasAttribute('data-rv')) continue;
      el.setAttribute('data-rv', kind);
      all.push(el);
    }
  }
  for (const el of all) {
    let i = 0;
    for (let s = el.previousElementSibling; s; s = s.previousElementSibling) if (s.hasAttribute('data-rv')) i++;
    el.style.setProperty('--rv-i', String(i));
    el.setAttribute('data-armed', '');
    io.observe(el);
  }
  return () => {
    io.disconnect();
    for (const el of all) {
      for (const a of ['data-rv', 'data-armed', 'data-in']) el.removeAttribute(a);
      el.style.removeProperty('--rv-i');
    }
  };
}

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let particles: Particle[] = [];
let raf = 0;
let last = 0;
let enabled = false;

function stage() {
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.className = 'sparks';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
  }
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.round(window.innerWidth * dpr);
  const h = Math.round(window.innerHeight * dpr);
  if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function frame(now: number) {
  const dt = Math.min(0.04, (now - last) / 1000 || 0.016);
  last = now;
  if (!ctx || !canvas) return;
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  particles = particles.filter((p) => (p.age += dt) < p.life);
  for (const p of particles) {
    p.vy += GRAVITY * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    const left = 1 - p.age / p.life;
    ctx.globalAlpha = Math.min(1, left * 2.2);
    ctx.fillStyle = p.colour;
    // Whole pixels, and the square shrinks a step at a time: pixel art, not confetti.
    const s = Math.max(2, Math.round(p.size * (0.5 + 0.5 * left)));
    ctx.fillRect(Math.round(p.x - s / 2), Math.round(p.y - s / 2), s, s);
  }
  ctx.globalAlpha = 1;
  raf = particles.length ? requestAnimationFrame(frame) : 0;
}

/** Throw `count` pixels from a point in the viewport. */
export function burst(x: number, y: number, colours: string[], count = 12, power = 1) {
  if (!enabled) return;
  stage();
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const v = (90 + Math.random() * 250) * power;
    particles.push({
      x, y,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v - 170 * power,
      age: 0,
      life: 0.4 + Math.random() * 0.35,
      size: 4 + Math.floor(Math.random() * 3) * 2,
      colour: colours[i % colours.length],
    });
  }
  if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
}

/** Switch the page's game feel on. Returns the switch-off. */
export function initJuice() {
  enabled = true;

  const onClick = (e: MouseEvent) => {
    const el = (e.target as Element | null)?.closest<HTMLElement>(SPARKY);
    if (!el || el.matches(':disabled')) return;
    const r = el.getBoundingClientRect();
    // A keyboard press has no pointer position; burst from the middle of the control.
    const keyed = e.detail === 0;
    const colour = getComputedStyle(el).getPropertyValue('--spark').trim() || '#ffa552';
    burst(keyed ? r.left + r.width / 2 : e.clientX, keyed ? r.top + r.height / 2 : e.clientY, [colour, colour, CREAM]);
  };

  let leaning: HTMLElement | null = null;
  const settle = () => {
    if (!leaning) return;
    for (const v of ['--lx', '--ly', '--px', '--py']) leaning.style.removeProperty(v);
    leaning = null;
  };
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    const btn = (e.target as Element | null)?.closest<HTMLElement>('a.store-btn') ?? null;
    if (btn !== leaning) settle();
    if (!btn) return;
    leaning = btn;
    const r = btn.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width;
    const ny = (e.clientY - r.top) / r.height;
    btn.style.setProperty('--lx', `${((nx - 0.5) * 7).toFixed(2)}px`);
    btn.style.setProperty('--ly', `${((ny - 0.5) * 5).toFixed(2)}px`);
    btn.style.setProperty('--px', `${(nx * 100).toFixed(1)}%`);
    btn.style.setProperty('--py', `${(ny * 100).toFixed(1)}%`);
  };

  document.addEventListener('click', onClick, true);
  document.addEventListener('pointermove', onMove, { passive: true });
  const endReveals = initReveals();
  return () => {
    enabled = false;
    settle();
    endReveals();
    document.removeEventListener('click', onClick, true);
    document.removeEventListener('pointermove', onMove);
    cancelAnimationFrame(raf);
    raf = 0;
    particles = [];
    canvas?.remove();
    canvas = null;
    ctx = null;
  };
}
