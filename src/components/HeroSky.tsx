import { useEffect, useRef } from 'react';

/* The hero's night sky, drawn live. One fragment shader paints a slow nebula
 * that lies in the plane of the orbit, pixel stars on three depths that shift
 * with the pointer, and the odd shooting star. The whole sky takes on the
 * colour of whatever is picked in the orbit, and ripples once when the pick
 * changes. Without WebGL the CSS sky behind this canvas stays as it was. */

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
  col += PERI * 0.03 * smoothstep(1.4, 0.0, wide);
  float cloud = smoothstep(1.05, 0.1, disc);
  float billow = smoothstep(0.34, 0.86, n);
  float wisp = smoothstep(0.42, 0.9, n2);
  col += PERI * billow * (0.35 + 0.65 * billow) * 0.5 * cloud;
  col += mix(GINGER, uAccent, 0.6) * wisp * (0.3 + 0.7 * billow) * 0.5 * cloud;
  col += uAccent * (exp(-disc * disc * 9.0) * 0.16 + exp(-wide * wide * 2.6) * 0.08);

  /* A ripple along the orbit plane when the pick changes. */
  float front = (1.0 - uPulse) * 1.05;
  col += uAccent * exp(-pow((disc - front) * 11.0, 2.0)) * uPulse * 0.3;

  /* A second, quieter ginger cloud low on the far side. */
  vec2 far = (frag - vec2(0.08, 0.1) * uRes) / uSpan;
  col += GINGER * 0.09 * exp(-dot(far, far) * 1.6) * (0.6 + 0.8 * n2);

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
  gl_FragColor = vec4(col, 1.0);
}`;

function rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function HeroSky({ accent, pick, still }: {
  /** Hex colour of the item picked in the orbit. */
  accent: string;
  /** Changes when the pick changes; each change sends one ripple. */
  pick: string;
  still: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const live = useRef({ accent: rgb(accent), pulse: 0, draw: () => {} });

  useEffect(() => {
    live.current.accent = rgb(accent);
    live.current.pulse = 1;
    live.current.draw();
  }, [accent, pick]);

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
      ['uRes', 'uTime', 'uMouse', 'uAccent', 'uFocus', 'uSpan', 'uPulse', 'uPx'].map((n) => [n, gl.getUniformLocation(prog, n)]),
    );

    const state = live.current;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    let scale = Math.min(window.devicePixelRatio || 1, coarse ? 1.25 : 1.5);
    let focus = [0, 0];
    let span = 600;
    const shown = [...state.accent];
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    let pulse = 0;
    let time = 40;

    const measure = () => {
      const box = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.round(box.width * scale));
      const h = Math.max(1, Math.round(box.height * scale));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      gl.viewport(0, 0, w, h);
      const orbit = hero.querySelector<HTMLElement>('.orbit');
      const center = hero.querySelector<HTMLElement>('.orbit-center');
      if (orbit && center) {
        const c = center.getBoundingClientRect();
        focus = [(c.left + c.width / 2 - box.left) * scale, (box.bottom - (c.top + c.height / 2)) * scale];
        span = orbit.getBoundingClientRect().width * scale;
      }
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
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    hero.setAttribute('data-sky', '');
    const ro = new ResizeObserver(() => { measure(); paint(); });
    ro.observe(hero);
    measure();

    if (still) {
      // One still frame, repainted in the new colour when the pick changes.
      state.draw = () => { shown.splice(0, 3, ...state.accent); paint(); };
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
      for (let i = 0; i < 3; i++) shown[i] += (state.accent[i] - shown[i]) * Math.min(1, dt * 4);
      if (state.pulse) { pulse = 1; state.pulse = 0; }
      pulse = Math.max(0, pulse - dt / 1.1);
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
