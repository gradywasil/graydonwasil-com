import { useEffect, useRef } from 'react';

/* The hero's night sky, drawn live. One fragment shader paints a slow nebula
 * gathered around the hero's stage, pixel stars on three depths that shift
 * with the pointer, and the odd shooting star. The whole sky takes on the
 * colours of whatever is picked or open (`SkyLook`), ripples once when that
 * changes, and can be restyled outright by what is open: cut into dithered
 * pixels in a palette, laid out as a groovebox's step grid, ruled like a
 * lyric sheet, or lit by a lamp. Those patterns keep clear of the copy.
 * Without WebGL the CSS sky behind this canvas stays as it was. */

/** How the sky is dressed for whatever is picked or open in the hero. */
export interface SkyLook {
  /** Changes when the pick changes; each change sends one ripple. */
  id: string;
  /** Hex colour of the pick. */
  accent: string;
  /** A second colour for the clouds (periwinkle when left out). */
  second?: string;
  /** Cut the sky into chunky dithered pixels: 0 to 1, how chunky. */
  pixel?: number;
  /** With `pixel`: the colours to cut it into (a Kilopixel look's palette). */
  palette?: string[];
  /** A step grid with a playhead running through it (BitBounce). */
  grid?: boolean;
  /** The ruled lines of a lyric sheet (RhymePage). */
  lines?: boolean;
}

const VERT = 'attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }';

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform vec3 uAccent;
uniform vec2 uFocus;
uniform float uSpan;
uniform float uPulse;
uniform float uPx;
uniform float uPixel;
uniform float uGlow;
uniform vec3 uSecond;
uniform vec3 uPal0;
uniform vec3 uPal1;
uniform vec3 uPal2;
uniform vec3 uPal3;
uniform float uPalMix;
uniform vec2 uLamp;
uniform vec2 uBeam;
uniform float uGrid;
uniform float uStep;
uniform float uLines;
uniform float uWall;
uniform float uCeil;

const vec3 NIGHT = vec3(0.055, 0.067, 0.141);
const vec3 PERI = vec3(0.56, 0.61, 1.0);
const vec3 GINGER = vec3(1.0, 0.647, 0.322);
const vec3 CREAM = vec3(0.965, 0.937, 0.89);

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
/* Ordered (Bayer 4x4) dither threshold for a cell, 0 to 1. */
float bayer2(vec2 a) { a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = m * p; a *= 0.5; }
  return v;
}

/* One square pixel star per cell, some cells empty. Returns brightness and a
 * tint selector. */
vec2 starLayer(vec2 px, float cell, float fill, float size, float seed) {
  vec2 g = floor(px / cell);
  float h = hash(g + seed);
  vec2 c = (g + 0.2 + 0.6 * vec2(hash(g + seed + 1.7), hash(g + seed + 4.1))) * cell;
  vec2 d = abs(px - c);
  float s = size * (0.6 + 0.8 * hash(g + seed + 9.3));
  float sq = 1.0 - smoothstep(s * 0.5 - 0.5, s * 0.5 + 0.5, max(d.x, d.y));
  float tw = 0.5 + 0.5 * sin(uTime * (0.5 + 2.2 * hash(g + seed + 7.1)) + h * 90.0);
  return vec2(step(h, fill) * sq * (0.3 + 0.7 * tw), hash(g + seed + 2.9));
}

/* Plus-shaped sparkles, the way a pixel artist draws a bright star. */
float sparkles(vec2 px, float cell, float seed) {
  vec2 g = floor(px / cell);
  float h = hash(g + seed);
  vec2 c = (g + 0.25 + 0.5 * vec2(hash(g + seed + 1.7), hash(g + seed + 4.1))) * cell;
  vec2 d = abs(px - c);
  float arm = 4.5 + 3.0 * hash(g + seed + 5.5);
  float w = 1.0;
  float bar = max(
    (1.0 - smoothstep(w - 0.5, w + 0.5, d.y)) * (1.0 - smoothstep(arm - 0.5, arm + 0.5, d.x)),
    (1.0 - smoothstep(w - 0.5, w + 0.5, d.x)) * (1.0 - smoothstep(arm - 0.5, arm + 0.5, d.y)));
  float tw = pow(0.5 + 0.5 * sin(uTime * (0.4 + 1.1 * hash(g + seed + 7.1)) + h * 50.0), 3.0);
  return step(h, 0.42) * bar * (0.15 + 0.85 * tw);
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  /* uPixel turns the sky into chunky pixels: every fragment samples the middle of its block. */
  float block = floor(1.5 + uPixel * 7.0 * uPx);
  if (uPixel > 0.01) frag = (floor(frag / block) + 0.5) * block;
  vec2 css = frag / uPx;
  vec2 uv = (frag - uFocus) / uSpan;

  /* The orbit plane, tilted the same 14 degrees as the rings. */
  float ca = cos(0.2443), sa = sin(0.2443);
  vec2 r = vec2(ca * uv.x + sa * uv.y, -sa * uv.x + ca * uv.y);
  float disc = length(r * vec2(1.0, 2.15));
  float wide = length(uv * vec2(1.0, 1.2));

  float t = uTime * 0.018;
  vec2 q = r * vec2(1.5, 2.6) + uMouse * 0.035;
  vec2 warp = vec2(fbm(q * 1.2 + vec2(0.0, t)), fbm(q * 1.2 + vec2(5.2, -t)));
  float n = fbm(q + warp * 1.7 + vec2(t * 0.7, 0.0));
  float n2 = fbm(q * 2.1 - warp * 1.2 + 9.0);

  vec3 col = NIGHT;
  col += uSecond * 0.03 * smoothstep(1.4, 0.0, wide);
  float cloud = smoothstep(1.05, 0.1, disc);
  float billow = smoothstep(0.34, 0.86, n);
  float wisp = smoothstep(0.42, 0.9, n2);
  col += uSecond * billow * (0.35 + 0.65 * billow) * 0.5 * cloud;
  col += mix(GINGER, uAccent, 0.6) * wisp * (0.3 + 0.7 * billow) * 0.5 * cloud;
  col += uAccent * (exp(-disc * disc * 9.0) * 0.16 + exp(-wide * wide * 2.6) * 0.08);

  /* A lamp held on at the focus: the whole cloud warms while it is lit. */
  col += uAccent * uGlow * (exp(-wide * wide * 1.6) * 0.34 + 0.025);
  /* ...and the lamp itself throws a shaft of light across the sky. */
  vec2 lampAt = (frag - uLamp) / uSpan;
  float along = dot(lampAt, uBeam);
  float across = abs(dot(lampAt, vec2(-uBeam.y, uBeam.x)));
  float shaft = (1.0 - smoothstep(0.0, 0.025 + max(along, 0.0) * 0.3, across)) * step(0.0, along) * exp(-along * 1.5);
  col += mix(uAccent, CREAM, 0.35) * uGlow * (shaft * 0.36 * (0.7 + 0.6 * n2) + exp(-dot(lampAt, lampAt) * 90.0) * 0.45);

  /* A ripple along the orbit plane when the pick changes. */
  float front = (1.0 - uPulse) * 1.05;
  col += uAccent * exp(-pow((disc - front) * 11.0, 2.0)) * uPulse * 0.3;

  /* A second, quieter ginger cloud low on the far side. */
  vec2 far = (frag - vec2(0.08, 0.1) * uRes) / uSpan;
  col += GINGER * 0.09 * exp(-dot(far, far) * 1.6) * (0.6 + 0.8 * n2);

  /* What is open can lay a pattern over the sky. It is full around the stage and gone before the copy. */
  float near = (1.0 - smoothstep(0.5, 1.3, wide)) * smoothstep(uWall - 0.02, uWall + 0.2, uv.x) * (1.0 - smoothstep(uCeil - 0.22, uCeil, uv.y));
  if (uGrid > 0.01) {
    /* A groovebox's steps: pads in rows, a playhead walking the columns, and the pads that are on flashing as it passes. */
    vec2 cell = (frag - uFocus) / uPx / 46.0;
    vec2 id = floor(cell);
    vec2 f = fract(cell);
    float pad = step(0.1, f.x) * step(f.x, 0.9) * step(0.1, f.y) * step(f.y, 0.9);
    float on = step(0.68, hash(id + 3.0 + floor(uStep / 32.0)));
    float behind = mod(floor(uStep) - id.x, 16.0);
    float flash = exp(-behind * 0.7);
    col += pad * near * uGrid * (vec3(0.028) + vec3(1.0, 0.77, 0.0) * 0.1 * step(behind, 0.5) + uAccent * on * (0.09 + 0.5 * flash));
  }
  if (uLines > 0.01) {
    /* A lyric sheet's ruled lines, scrolling up the way the words do. */
    float ly = css.y - uTime * 7.0;
    float rule = 1.0 - smoothstep(0.5, 1.5, abs(mod(ly, 40.0) - 20.0));
    col += uAccent * rule * 0.13 * near * uLines;
  }

  /* Stars sit behind the copy too, but quieter there. */
  float calm = mix(0.55, 1.0, smoothstep(-0.9, -0.2, uv.x)) * (0.75 + 0.7 * cloud);
  vec2 s1 = starLayer(css + uMouse * 5.0, 27.0, 0.6, 1.5, 11.0);
  vec2 s2 = starLayer(css + uMouse * 11.0 + 400.0, 61.0, 0.55, 2.4, 23.0);
  float s3 = sparkles(css + uMouse * 19.0 + 900.0, 168.0, 37.0);
  vec3 tint1 = mix(CREAM, PERI, step(0.7, s1.y));
  vec3 tint2 = mix(CREAM, mix(GINGER, PERI, step(0.5, s2.y)), step(0.55, s2.y));
  col += tint1 * s1.x * 0.5 * calm;
  col += tint2 * s2.x * 0.8 * calm;
  col += CREAM * s3 * 0.95 * calm;

  /* A shooting star now and then, upper sky only. */
  float cyc = floor(uTime / 11.0);
  float ph = fract(uTime / 11.0) * 11.0;
  if (ph < 1.0) {
    vec2 a = vec2(0.45 + 0.5 * hash(vec2(cyc, 1.0)), 0.7 + 0.25 * hash(vec2(cyc, 2.0))) * uRes;
    vec2 dir = normalize(vec2(-1.0, -0.42));
    vec2 head = a + dir * ph * 560.0 * uPx;
    vec2 pa = frag - head;
    float len = 150.0 * uPx;
    float proj = clamp(dot(pa, -dir), 0.0, len);
    float dist = length(pa + dir * proj);
    col += CREAM * exp(-dist * dist / (1.4 * uPx * uPx)) * (1.0 - proj / len) * sin(ph * 3.14159) * 0.9;
  }

  /* Settle into plain night at the bottom so the next world meets a clean edge. */
  col = mix(NIGHT, col, smoothstep(0.0, 0.16, frag.y / uRes.y));
  col += (hash(frag) - 0.5) / 160.0;
  /* ...and each block is cut to a few levels through an ordered dither, the way a pixel camera would. */
  if (uPixel > 0.01) {
    float th = bayer4(floor(gl_FragCoord.xy / block));
    vec3 cut = floor(col * 7.0 + th) / 7.0;
    /* With a palette, brightness picks one of its four colours instead, dithered between neighbours. */
    if (uPalMix > 0.01) {
      float lum = dot(col, vec3(0.299, 0.587, 0.114));
      float k = clamp(floor((lum - 0.08) * 7.0 + th), 0.0, 3.0);
      vec3 inPal = mix(mix(uPal0, uPal1, step(0.5, k)), mix(uPal2, uPal3, step(2.5, k)), step(1.5, k));
      cut = mix(cut, inPal, uPalMix);
    }
    col = mix(col, cut, min(1.0, uPixel * 1.6));
  }
  gl_FragColor = vec4(col, 1.0);
}`;

function rgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.replace(/./g, '$&$&') : h.slice(0, 6), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

const PERI = '#8f9cff';
const luma = (c: number[]) => 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2];
/** How bright each of the four sky colours may be, so the sky stays a night sky under the copy. */
const PAL_LUMA = [0.05, 0.15, 0.33, 0.62];

/** Four colours from a palette, dark to light, each held to the brightness its place in the sky allows. */
function skyPalette(palette: string[]): number[] {
  const sorted = palette.map(rgb).sort((a, b) => luma(a) - luma(b));
  return PAL_LUMA.flatMap((target, i) => {
    const c = sorted[Math.round((i * (sorted.length - 1)) / 3)];
    const l = luma(c);
    if (l < 0.02) return [target, target, target * 1.15];
    const k = target / l;
    return c.map((v) => Math.min(1, v * k));
  });
}

export function HeroSky({ look, still, beat = 0, glow = false }: {
  /** Whatever is picked or open in the hero, and how the sky dresses for it. */
  look: SkyLook;
  still: boolean;
  /** Count it up to send another ripple without changing the pick. */
  beat?: number;
  /** A lamp held on (the hero marks where with `.hero-lamp`). */
  glow?: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const live = useRef({
    accent: rgb(look.accent), second: rgb(look.second ?? PERI), pulse: 0, pixel: 0, glow: 0,
    pal: skyPalette([PERI]), palMix: 0, grid: 0, lines: 0, restep: false, draw: () => {},
  });
  const { id, accent, second = PERI, pixel = 0, grid = false, lines = false } = look;
  const palette = look.palette?.join(',') ?? '';

  useEffect(() => {
    const state = live.current;
    state.accent = rgb(accent);
    state.second = rgb(second);
    state.pulse = 1;
    state.draw();
  }, [id, accent, second, beat]);

  useEffect(() => {
    const state = live.current;
    state.pixel = pixel;
    if (palette) state.pal = skyPalette(palette.split(','));
    state.palMix = palette ? 1 : 0;
    state.restep = grid && !state.grid;
    state.grid = grid ? 1 : 0;
    state.lines = lines ? 1 : 0;
    state.glow = glow ? 1 : 0;
    state.draw();
  }, [pixel, palette, grid, lines, glow]);

  useEffect(() => {
    const canvas = ref.current;
    const hero = canvas?.parentElement;
    if (!canvas || !hero) return;
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = Object.fromEntries(
      [
        'uRes', 'uTime', 'uMouse', 'uAccent', 'uFocus', 'uSpan', 'uPulse', 'uPx', 'uPixel', 'uGlow', 'uSecond',
        'uPal0', 'uPal1', 'uPal2', 'uPal3', 'uPalMix', 'uLamp', 'uBeam', 'uGrid', 'uStep', 'uLines', 'uWall', 'uCeil',
      ].map((n) => [n, gl.getUniformLocation(prog, n)]),
    );

    const state = live.current;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    let scale = Math.min(window.devicePixelRatio || 1, coarse ? 1.25 : 1.5);
    let focus = [0, 0];
    let span = 600;
    let lamp = [0, 0];
    let beam = [0.8, 0.6];
    /** Where the copy starts, in spans from the focus: to its left, or above it. Patterns stop short of it. */
    let wall = -9;
    let ceil = 9;
    const shown = [...state.accent];
    const shown2 = [...state.second];
    const pal = [...state.pal];
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    let pulse = 0;
    let pixel = 0;
    let glow = 0;
    let palMix = 0;
    let grid = 0;
    let lines = 0;
    let step = 0;
    let time = 40;

    const measure = () => {
      const box = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.round(box.width * scale));
      const h = Math.max(1, Math.round(box.height * scale));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      gl.viewport(0, 0, w, h);
      // The nebula gathers around the orbit's middle, or whatever a hero without an orbit marks as its focus.
      const stage = hero.querySelector<HTMLElement>('.orbit, .hero-stage, .hero-focus');
      const center = hero.querySelector<HTMLElement>('.orbit-center, .hero-focus');
      if (!stage || !center) return;
      const c = center.getBoundingClientRect();
      const cx = c.left + c.width / 2;
      const cy = c.top + c.height / 2;
      focus = [(cx - box.left) * scale, (box.bottom - cy) * scale];
      // A stage that is only a phone's width still gets a cloud wide enough to show around it.
      const wide = Math.max(stage.getBoundingClientRect().width, stage === center ? 540 : 0);
      span = wide * scale;
      const copy = hero.querySelector<HTMLElement>('.hero-copy')?.getBoundingClientRect();
      const stacked = !!copy && copy.bottom <= c.top + 40;
      wall = copy && !stacked ? (copy.right - cx) / wide : -9;
      ceil = copy && stacked ? (cy - copy.bottom) / wide : 9;
      // On a narrow page the lamp shines out sideways, under the headline.
      beam = stacked ? [0.999, 0.04] : [0.8, 0.6];
      aim();
    };
    /** Find the lamp: the hero marks it, and it moves a little as the stage leans. */
    const aim = () => {
      const box = canvas.getBoundingClientRect();
      const mark = hero.querySelector<HTMLElement>('.hero-lamp')?.getBoundingClientRect();
      lamp = mark && mark.width
        ? [(mark.left + mark.width / 2 - box.left) * scale, (box.bottom - (mark.top + mark.height / 2)) * scale]
        : focus;
    };

    const paint = () => {
      gl.uniform2f(u.uRes, canvas.width, canvas.height);
      gl.uniform1f(u.uTime, time);
      // Scrolling slides the star layers past each other, so there is depth without a pointer.
      gl.uniform2f(u.uMouse, mouse.x, mouse.y + Math.min(2, window.scrollY / window.innerHeight) * 3);
      gl.uniform3f(u.uAccent, shown[0], shown[1], shown[2]);
      gl.uniform2f(u.uFocus, focus[0], focus[1]);
      gl.uniform1f(u.uSpan, span);
      gl.uniform1f(u.uPulse, pulse);
      gl.uniform1f(u.uPx, scale);
      gl.uniform1f(u.uPixel, pixel);
      gl.uniform1f(u.uGlow, glow);
      gl.uniform3f(u.uSecond, shown2[0], shown2[1], shown2[2]);
      gl.uniform3f(u.uPal0, pal[0], pal[1], pal[2]);
      gl.uniform3f(u.uPal1, pal[3], pal[4], pal[5]);
      gl.uniform3f(u.uPal2, pal[6], pal[7], pal[8]);
      gl.uniform3f(u.uPal3, pal[9], pal[10], pal[11]);
      gl.uniform1f(u.uPalMix, palMix);
      gl.uniform2f(u.uLamp, lamp[0], lamp[1]);
      gl.uniform2f(u.uBeam, beam[0], beam[1]);
      gl.uniform1f(u.uGrid, grid);
      gl.uniform1f(u.uStep, step);
      gl.uniform1f(u.uLines, lines);
      gl.uniform1f(u.uWall, wall);
      gl.uniform1f(u.uCeil, ceil);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    hero.setAttribute('data-sky', '');
    const ro = new ResizeObserver(() => { measure(); paint(); });
    ro.observe(hero);
    measure();

    if (still) {
      // One still frame, repainted in the new colour when the pick changes.
      state.draw = () => {
        shown.splice(0, 3, ...state.accent);
        shown2.splice(0, 3, ...state.second);
        pal.splice(0, 12, ...state.pal);
        pixel = state.pixel; glow = state.glow; palMix = state.palMix; grid = state.grid; lines = state.lines;
        aim();
        paint();
      };
      state.draw();
      return () => { ro.disconnect(); state.draw = () => {}; hero.removeAttribute('data-sky'); };
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    let raf = 0;
    let last = 0;
    let slow = 0;
    let visible = true;
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
      last = now;
      time += dt;
      const k = Math.min(1, dt * 3.5);
      mouse.x += (mouse.tx - mouse.x) * k;
      mouse.y += (mouse.ty - mouse.y) * k;
      const ease = Math.min(1, dt * 4);
      for (let i = 0; i < 3; i++) {
        shown[i] += (state.accent[i] - shown[i]) * ease;
        shown2[i] += (state.second[i] - shown2[i]) * ease;
      }
      // A new palette lands fast, the way a new look does in the app.
      for (let i = 0; i < 12; i++) pal[i] += (state.pal[i] - pal[i]) * Math.min(1, dt * 9);
      if (state.pulse) { pulse = 1; state.pulse = 0; }
      pulse = Math.max(0, pulse - dt / 1.1);
      pixel += (state.pixel - pixel) * Math.min(1, dt * 4.5);
      palMix += (state.palMix - palMix) * Math.min(1, dt * 4.5);
      grid += (state.grid - grid) * Math.min(1, dt * 3.5);
      lines += (state.lines - lines) * Math.min(1, dt * 3.5);
      // The playhead walks the grid in eighth notes at the demo's 118 BPM.
      if (state.restep) { step = 0; state.restep = false; }
      if (grid > 0.01) step += dt * (118 / 60) * 2;
      // A lamp comes on at once and goes out a little slower, like a filament.
      if (state.glow && glow < 0.02) aim();
      glow += (state.glow - glow) * Math.min(1, dt * (state.glow > glow ? 40 : 12));
      paint();
      // Never trade smoothness for sharpness: if frames run long, draw fewer pixels.
      slow = dt > 0.024 ? slow + 1 : Math.max(0, slow - 1);
      if (slow > 30 && scale > 0.5) { scale = Math.max(0.5, scale * 0.75); slow = 0; measure(); }
      raf = requestAnimationFrame(frame);
    };
    const run = () => { if (!raf && visible && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); } };
    const halt = () => { cancelAnimationFrame(raf); raf = 0; };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) run(); else halt(); });
    io.observe(hero);
    const onVis = () => (document.hidden ? halt() : run());
    document.addEventListener('visibilitychange', onVis);
    const onLost = (e: Event) => { e.preventDefault(); halt(); hero.removeAttribute('data-sky'); };
    canvas.addEventListener('webglcontextlost', onLost);
    run();

    return () => {
      halt(); ro.disconnect(); io.disconnect();
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('visibilitychange', onVis);
      canvas.removeEventListener('webglcontextlost', onLost);
      hero.removeAttribute('data-sky');
    };
  }, [still]);

  return <canvas ref={ref} className="hero-sky" aria-hidden="true" />;
}
