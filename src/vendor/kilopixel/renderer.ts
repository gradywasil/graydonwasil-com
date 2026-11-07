import { isIdentity, type FrameTransform } from './transform';

export type Effect = 'bayer' | 'atkinson' | 'floyd' | 'ascii' | 'asciisoft' | 'crt' | 'threshold' | 'posterize'
  | 'bayer2' | 'bayer8' | 'noise' | 'halftone' | 'crosshatch' | 'edges' | 'emboss' | 'invert'
  | 'bluenoise' | 'stucki' | 'newsprint' | 'engrave' | 'stitch' | 'lcd' | 'vhs';
/**
 * How a picture is mapped onto the palette.
 * - tone: brightness alone picks a color along a gradient.
 * - color: nearest color by luma-weighted RGB distance (the original match).
 * - lab: nearest color by perceptual (OKLab) distance, so similar-looking colors win.
 * - vivid: lifts the photo's saturation and weighs hue above brightness, so muted scenes keep their color
 *   instead of falling back to the palette's greys.
 */
export type Mapping = 'tone' | 'color' | 'lab' | 'vivid';
export const MAPPINGS: ReadonlyArray<{ id: Mapping; label: string }> = [
  { id: 'tone', label: 'Tone ramp · gradient' },
  { id: 'color', label: 'Match colors · classic' },
  { id: 'lab', label: 'Match colors · perceptual' },
  { id: 'vivid', label: 'Match colors · vivid' },
];
export const isMapping = (value: unknown): value is Mapping => MAPPINGS.some(entry => entry.id === value);
/** Saturation lift and hue-over-brightness weight used by the vivid mapping (GPU and CPU share them). */
export const VIVID_SATURATION = 2.2;
export const VIVID_CHROMA_WEIGHT = 2.5;
const MATCH_INDEX: Record<Mapping, number> = { tone: 0, color: 0, lab: 1, vivid: 2 };

/** sRGB (0–1 per channel) to OKLab. */
export function oklab(red: number, green: number, blue: number): [number, number, number] {
  const lin = (value: number) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  const r = lin(red), g = lin(green), b = lin(blue);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const n = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * n,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * n,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * n,
  ];
}

export type EffectGroup = 'dither' | 'print' | 'screen' | 'graphic';
export const EFFECT_GROUPS: ReadonlyArray<{ id: EffectGroup; label: string }> = [
  { id: 'dither', label: 'Dither' },
  { id: 'print', label: 'Print' },
  { id: 'screen', label: 'Screen' },
  { id: 'graphic', label: 'Graphic' },
];
export const EFFECTS: ReadonlyArray<{ id: Effect; label: string; group: EffectGroup; requiresWebGL: boolean; animated?: boolean; blurb: string }> = [
  { id: 'bayer', label: 'Bayer 4×4', group: 'dither', requiresWebGL: false, blurb: 'Classic ordered crosshatch grid of the 8-bit era.' },
  { id: 'bayer2', label: 'Bayer 2×2', group: 'dither', requiresWebGL: false, blurb: 'Tight, chunky checkerboard shading.' },
  { id: 'bayer8', label: 'Bayer 8×8', group: 'dither', requiresWebGL: false, blurb: 'Fine ordered pattern with smooth gradients.' },
  { id: 'bluenoise', label: 'Blue noise', group: 'dither', requiresWebGL: false, blurb: 'Even, organic grain with no visible grid.' },
  { id: 'noise', label: 'Noise', group: 'dither', requiresWebGL: false, blurb: 'Gritty random grain, like fast film.' },
  { id: 'atkinson', label: 'Atkinson', group: 'dither', requiresWebGL: false, blurb: 'Crisp, high-contrast early Mac look.' },
  { id: 'floyd', label: 'Floyd–Steinberg', group: 'dither', requiresWebGL: false, blurb: 'Soft error diffusion that keeps every tone.' },
  { id: 'stucki', label: 'Stucki', group: 'dither', requiresWebGL: false, blurb: 'Smooth, clean diffusion with fine detail.' },
  { id: 'halftone', label: 'Halftone', group: 'print', requiresWebGL: true, blurb: 'Round printed dots on a 45° screen.' },
  { id: 'newsprint', label: 'Newsprint', group: 'print', requiresWebGL: true, blurb: 'Four-ink dot rosettes from the Sunday comics.' },
  { id: 'crosshatch', label: 'Crosshatch', group: 'print', requiresWebGL: true, blurb: 'Pen-and-ink hatching that builds with shadow.' },
  { id: 'engrave', label: 'Engrave', group: 'print', requiresWebGL: true, blurb: 'Banknote line engraving that swells in shade.' },
  { id: 'stitch', label: 'Cross-stitch', group: 'print', requiresWebGL: true, blurb: 'Every pixel sewn as a thread X on fabric.' },
  { id: 'crt', label: 'CRT', group: 'screen', requiresWebGL: true, blurb: 'Scanlines, phosphor stripes and a curved glow.' },
  { id: 'lcd', label: 'LCD', group: 'screen', requiresWebGL: true, blurb: 'Handheld dot-matrix screen with pixel gaps.' },
  { id: 'vhs', label: 'VHS', group: 'screen', requiresWebGL: true, animated: true, blurb: 'Wobbly tape, color bleed and tracking noise.' },
  { id: 'ascii', label: 'ASCII Pixel', group: 'screen', requiresWebGL: true, blurb: 'Terminal characters with crisp pixel edges.' },
  { id: 'asciisoft', label: 'ASCII Soft', group: 'screen', requiresWebGL: true, blurb: 'Classic terminal characters with softer edges.' },
  { id: 'threshold', label: 'Two-tone', group: 'graphic', requiresWebGL: false, blurb: 'Bold cut-paper split into two colors.' },
  { id: 'posterize', label: 'Posterize', group: 'graphic', requiresWebGL: false, blurb: 'Flat bands of color, screen-print style.' },
  { id: 'edges', label: 'Edges', group: 'graphic', requiresWebGL: true, blurb: 'Glowing outlines traced from the scene.' },
  { id: 'emboss', label: 'Emboss', group: 'graphic', requiresWebGL: true, blurb: 'Raised relief, as if pressed into metal.' },
  { id: 'invert', label: 'Invert', group: 'graphic', requiresWebGL: false, blurb: 'Negative film: lights and darks swapped.' },
];
export type Settings = {
  effect: Effect;
  contrast: number;
  threshold: number;
  pixelSize: number;
  palette: string[];
  mapping?: Mapping;
};
export type RenderOptions = { transform?: FrameTransform; time?: number };

/** One full VHS tape cycle: the tracking band rolls through, then the picture settles. Loops seamlessly. */
export const VHS_LOOP_MS = 9000;
export const CAPTURE_WIDTH = 480;
export const CAPTURE_HEIGHT = 640;
const COLOR_WEIGHTS = [0.299, 0.587, 0.114];
const DEFAULT_PALETTE = ['#101820', '#555f62', '#a2aaa0', '#eef0d5'];

/* ---------- Threshold matrices (generated once, shared by GPU atlas and CPU path) ---------- */

type Tile = { x: number; y: number; width: number; height: number };
const ATLAS_WIDTH = 128;
const ATLAS_HEIGHT = 64;
const BLUE_SIZE = 64;
const HALFTONE_K = 4;
const ENGRAVE_PERIOD = 5;
const ENGRAVE_WAVE = 32;
const TILES = {
  blue: { x: 0, y: 0, width: BLUE_SIZE, height: BLUE_SIZE },
  halftone: { x: 64, y: 0, width: HALFTONE_K * 2, height: HALFTONE_K * 2 },
  crosshatch: { x: 80, y: 0, width: 8, height: 8 },
  engrave: { x: 64, y: 16, width: ENGRAVE_WAVE, height: ENGRAVE_PERIOD },
} satisfies Record<string, Tile>;

/** Ranks cells by lexicographic key and returns uniform thresholds (rank + 0.5) / count. */
function rankTile(width: number, height: number, key: (x: number, y: number) => number[]): Float32Array {
  const keys = Array.from({ length: width * height }, (_, index) => key(index % width, Math.floor(index / width)));
  const order = keys.map((_, index) => index).sort((a, b) => {
    for (let i = 0; i < keys[a].length; i++) if (keys[a][i] !== keys[b][i]) return keys[a][i] - keys[b][i];
    return a - b;
  });
  const result = new Float32Array(width * height);
  order.forEach((cell, rank) => { result[cell] = (rank + 0.5) / order.length; });
  return result;
}

/** Void-and-cluster blue noise on a torus (Ulichney 1993); deterministic. */
function blueNoise(size: number): Float32Array {
  const count = size * size;
  const radius = 6;
  const sigma = 1.5;
  const taps = (radius * 2 + 1) ** 2;
  const offsetX = new Int32Array(taps);
  const offsetY = new Int32Array(taps);
  const weights = new Float32Array(taps);
  for (let k = 0; k < taps; k++) {
    offsetX[k] = (k % (radius * 2 + 1)) - radius;
    offsetY[k] = Math.floor(k / (radius * 2 + 1)) - radius;
    weights[k] = Math.exp(-(offsetX[k] ** 2 + offsetY[k] ** 2) / (2 * sigma * sigma));
  }
  const energy = new Float32Array(count);
  const bits = new Uint8Array(count);
  const flip = (index: number, sign: 1 | -1) => {
    bits[index] = sign > 0 ? 1 : 0;
    const x0 = index % size;
    const y0 = (index - x0) / size;
    for (let k = 0; k < taps; k++) {
      let x = x0 + offsetX[k];
      let y = y0 + offsetY[k];
      if (x < 0) x += size; else if (x >= size) x -= size;
      if (y < 0) y += size; else if (y >= size) y -= size;
      energy[y * size + x] += sign * weights[k];
    }
  };
  const extreme = (ones: boolean) => {
    let best = -1;
    let value = ones ? -Infinity : Infinity;
    for (let i = 0; i < count; i++) {
      if ((bits[i] === 1) !== ones) continue;
      const e = energy[i];
      if (ones ? e > value : e < value) { value = e; best = i; }
    }
    return best;
  };
  let seed = 0x2545f491;
  const random = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  // Jittered-grid seed (one point per 4×4 block) starts near-uniform, so relaxation converges quickly.
  let initial = 0;
  for (let by = 0; by < size; by += 4) {
    for (let bx = 0; bx < size; bx += 4) {
      flip((by + Math.floor(random() * 4)) * size + bx + Math.floor(random() * 4), 1);
      initial++;
    }
  }
  for (let guard = 0; guard < count; guard++) {
    const cluster = extreme(true);
    flip(cluster, -1);
    const hole = extreme(false);
    if (hole === cluster) { flip(cluster, 1); break; }
    flip(hole, 1);
  }
  const prototypeBits = bits.slice();
  const prototypeEnergy = energy.slice();
  const rank = new Float32Array(count);
  for (let r = initial - 1; r >= 0; r--) {
    const cluster = extreme(true);
    flip(cluster, -1);
    rank[cluster] = r;
  }
  bits.set(prototypeBits);
  energy.set(prototypeEnergy);
  // Remaining phases fill the largest void each step. Track the emptiest cell per 8×8 block and
  // refresh only the blocks a flip touches, instead of rescanning the whole matrix.
  const block = 8;
  const blocks = size / block;
  const blockBest = new Int32Array(blocks * blocks);
  const refresh = (b: number) => {
    const bx = (b % blocks) * block;
    const by = Math.floor(b / blocks) * block;
    let best = -1;
    let value = Infinity;
    for (let y = by; y < by + block; y++) {
      for (let x = bx; x < bx + block; x++) {
        const i = y * size + x;
        if (!bits[i] && energy[i] < value) { value = energy[i]; best = i; }
      }
    }
    blockBest[b] = best;
  };
  for (let b = 0; b < blocks * blocks; b++) refresh(b);
  const span = Math.ceil(radius / block);
  for (let r = initial; r < count; r++) {
    let hole = -1;
    let value = Infinity;
    for (let b = 0; b < blocks * blocks; b++) {
      const i = blockBest[b];
      if (i >= 0 && energy[i] < value) { value = energy[i]; hole = i; }
    }
    flip(hole, 1);
    rank[hole] = r;
    const hx = Math.floor((hole % size) / block);
    const hy = Math.floor(hole / size / block);
    for (let dy = -span; dy <= span; dy++) {
      for (let dx = -span; dx <= span; dx++) {
        refresh(((hy + dy + blocks) % blocks) * blocks + (hx + dx + blocks) % blocks);
      }
    }
  }
  return rank.map((r) => (r + 0.5) / count);
}

const ANGLE_ORDER = [0, 4, 2, 6, 1, 5, 3, 7];
const LINE_ORDER = [0, 4, 2, 6, 1, 5, 3, 7];

/** Clustered-dot screen at 45° with Euclidean spot: round dots → checkerboard → inverted dots. */
function halftoneTile(k: number): Float32Array {
  return rankTile(k * 2, k * 2, (x, y) => {
    const u = (x + y) / (2 * k);
    const v = (x - y) / (2 * k);
    const ru = Math.round(u);
    const rv = Math.round(v);
    const X = 2 * (u - ru);
    const Y = 2 * (v - rv);
    const ax = Math.abs(X);
    const ay = Math.abs(Y);
    const spot = ax + ay <= 1 ? 1 - (X * X + Y * Y) : (ax - 1) ** 2 + (ay - 1) ** 2 - 1;
    const [ox, oy] = spot >= 0 ? [X, Y] : [X - Math.sign(X), Y - Math.sign(Y)];
    const bucket = ((Math.round(Math.atan2(oy, ox) / (Math.PI / 4)) % 8) + 8) % 8;
    return [-Math.round(spot * 1e6), ANGLE_ORDER[bucket], (((ru + rv) % 2) + 2) % 2];
  });
}

/** Ink order: '\' lines, '/' lines, offset '\', offset '/', thickening, then the last holes. */
function crosshatchTile(): Float32Array {
  return rankTile(8, 8, (x, y) => {
    const d = (((x - y) % 8) + 8) % 8;
    const s = (x + y) % 8;
    const group = d === 0 ? 0 : s === 0 ? 1 : d === 4 ? 2 : s === 4 ? 3
      : d === 1 || d === 5 ? 4 : s === 1 || s === 5 ? 5 : 6;
    return [group, group === 6 ? orderedValue(x, y, 8) : LINE_ORDER[x % 8]];
  });
}

/** Horizontal engraved lines with a gentle wave; lines thicken symmetrically as tone darkens. */
function engraveTile(): Float32Array {
  const rowRank = [0, 1, 3, 4, 2];
  const across = [0, 2, 1, 3];
  return rankTile(ENGRAVE_WAVE, ENGRAVE_PERIOD, (x, y) => {
    const wave = Math.round(Math.sin(2 * Math.PI * x / ENGRAVE_WAVE));
    const phase = (((y + wave) % ENGRAVE_PERIOD) + ENGRAVE_PERIOD) % ENGRAVE_PERIOD;
    const rank = rowRank[phase];
    return [rank, across[(x + rank) % 4]];
  });
}

type Matrices = { atlas: Uint8Array; blue: Float32Array };
let matrices: Matrices | null = null;
function getMatrices(): Matrices {
  if (matrices) return matrices;
  const atlas = new Uint8Array(ATLAS_WIDTH * ATLAS_HEIGHT * 4);
  const quantize = (value: number) => Math.min(255, Math.floor(value * 256));
  const place = (tile: Tile, values: Float32Array) => {
    for (let y = 0; y < tile.height; y++) {
      for (let x = 0; x < tile.width; x++) {
        const offset = ((tile.y + y) * ATLAS_WIDTH + tile.x + x) * 4;
        atlas[offset] = quantize(values[y * tile.width + x]);
        atlas[offset + 3] = 255;
      }
    }
  };
  const rawBlue = blueNoise(BLUE_SIZE);
  place(TILES.blue, rawBlue);
  place(TILES.halftone, halftoneTile(HALFTONE_K));
  place(TILES.crosshatch, crosshatchTile());
  place(TILES.engrave, engraveTile());
  const blue = rawBlue.map((value) => (quantize(value) + 0.5) / 256);
  matrices = { atlas, blue };
  return matrices;
}

/* ---------- Shader ---------- */

const glslFloat = (value: number) => Number.isInteger(value) ? `${value}.0` : `${value}`;
const glslTile = (tile: Tile) => `vec4(${[tile.x, tile.y, tile.width, tile.height].map(glslFloat).join(', ')})`;
const VERTEX = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;
const screenDirection = (degrees: number, period: number) => {
  const radians = degrees * Math.PI / 180;
  return `vec2(${(Math.cos(radians) / period).toFixed(6)}, ${(Math.sin(radians) / period).toFixed(6)})`;
};
const NEWSPRINT_PERIOD = 4.5;
const FRAGMENT = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
${EFFECTS.map(({ id }, index) => `#define FX_${id.toUpperCase()} ${index}`).join('\n')}
#define ATLAS vec2(${glslFloat(ATLAS_WIDTH)}, ${glslFloat(ATLAS_HEIGHT)})
#define TILE_BLUE ${glslTile(TILES.blue)}
#define TILE_HALFTONE ${glslTile(TILES.halftone)}
#define TILE_CROSSHATCH ${glslTile(TILES.crosshatch)}
#define TILE_ENGRAVE ${glslTile(TILES.engrave)}
#define SCREEN_C ${screenDirection(15, NEWSPRINT_PERIOD)}
#define SCREEN_M ${screenDirection(75, NEWSPRINT_PERIOD)}
#define SCREEN_Y ${screenDirection(0, NEWSPRINT_PERIOD)}
#define SCREEN_K ${screenDirection(45, NEWSPRINT_PERIOD * 1.15)}
varying vec2 vUv;
uniform sampler2D uSource;
uniform sampler2D uGlyphs;
uniform sampler2D uPalette;
uniform sampler2D uMatrix;
uniform vec2 uCrop;
uniform bool uWarp;
uniform vec4 uXform;
uniform vec2 uShift;
uniform vec2 uResolution;
uniform bool uColor;
uniform int uMatch;
uniform vec3 uLab[16];
uniform vec4 uTone;
uniform vec4 uVhs;
#define uContrast uTone.x
#define uThreshold uTone.y
#define uPixel uTone.z
#define uLevels uTone.w
#define MATCH_LAB 1
#define MATCH_VIVID 2
#define VIVID_SATURATION ${glslFloat(VIVID_SATURATION)}
#define VIVID_CHROMA ${glslFloat(VIVID_CHROMA_WEIGHT)}
uniform int uEffect;
vec3 shade(float n) {
  return texture2D(uPalette, vec2((clamp(n, 0.0, uLevels) + 0.5) / 16.0, 0.5)).rgb;
}
vec3 toLab(vec3 c) {
  vec3 lin = mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(vec3(0.04045), c));
  vec3 lms = pow(max(vec3(
    dot(lin, vec3(0.4122214708, 0.5363325363, 0.0514459929)),
    dot(lin, vec3(0.2119034982, 0.6806995451, 0.1073969566)),
    dot(lin, vec3(0.0883024619, 0.2817188376, 0.6299787005))), 0.0), vec3(1.0 / 3.0));
  return vec3(
    dot(lms, vec3(0.2104542553, 0.793617785, -0.0040720468)),
    dot(lms, vec3(1.9779984951, -2.428592205, 0.4505937099)),
    dot(lms, vec3(0.0259040371, 0.7827717662, -0.808675766)));
}
vec3 nearest(vec3 rgb, bool endpoints) {
  vec3 best = shade(0.0);
  float distance = 10.0;
  if (uMatch == 0) {
    for (int i = 0; i < 16; i++) {
      float index = float(i);
      if (index > uLevels) break;
      if (endpoints && i != 0 && index != uLevels) continue;
      vec3 candidate = shade(index);
      vec3 difference = rgb - candidate;
      float next = dot(difference * difference, vec3(0.299, 0.587, 0.114));
      if (next < distance) {
        best = candidate;
        distance = next;
      }
    }
    return best;
  }
  float chroma = 1.0;
  if (uMatch == MATCH_VIVID) {
    float y = dot(rgb, vec3(0.299, 0.587, 0.114));
    rgb = clamp(vec3(y) + (rgb - vec3(y)) * VIVID_SATURATION, 0.0, 1.0);
    chroma = VIVID_CHROMA;
  }
  vec3 lab = toLab(rgb);
  for (int i = 0; i < 16; i++) {
    float index = float(i);
    if (index > uLevels) break;
    if (endpoints && i != 0 && index != uLevels) continue;
    vec3 difference = lab - uLab[i];
    float next = difference.x * difference.x + chroma * dot(difference.yz, difference.yz);
    if (next < distance) {
      best = shade(index);
      distance = next;
    }
  }
  return best;
}
// The palette entry closest in luminance below this one (the color itself when none is darker).
vec3 darker(vec3 color) {
  float own = dot(color, vec3(0.299, 0.587, 0.114)) - 0.002;
  vec3 best = color;
  float bestLight = -1.0;
  for (int i = 0; i < 16; i++) {
    float index = float(i);
    if (index > uLevels) break;
    vec3 candidate = shade(index);
    float light = dot(candidate, vec3(0.299, 0.587, 0.114));
    if (light < own && light > bestLight) {
      best = candidate;
      bestLight = light;
    }
  }
  return best;
}
vec3 texel(vec2 uv) {
  vec2 coord = (uv - 0.5) * uCrop + 0.5;
  if (uWarp) {
    vec2 d = uv - 0.5;
    coord = vec2(dot(uXform.xy, d), dot(uXform.zw, d)) + uShift;
  }
  return texture2D(uSource, coord).rgb;
}
vec3 adjust(vec3 rgb) {
  return clamp((rgb - 0.5) * uContrast + 1.0 - uThreshold, 0.0, 1.0);
}
float adjustLight(vec3 rgb) {
  return clamp((dot(rgb, vec3(0.299, 0.587, 0.114)) - 0.5) * uContrast + 1.0 - uThreshold, 0.0, 1.0);
}
vec3 sourceColor(vec2 uv) {
  return adjust(texel(uv));
}
float luminance(vec2 uv) {
  return adjustLight(texel(uv));
}
// Box-filters a cell (origin and size in output pixels) with four taps.
vec3 cellSource(vec2 origin, float size) {
  float a = size * 0.25;
  float b = size * 0.75;
  return 0.25 * (texel((origin + vec2(a, a)) / uResolution) + texel((origin + vec2(b, a)) / uResolution)
    + texel((origin + vec2(a, b)) / uResolution) + texel((origin + vec2(b, b)) / uResolution));
}
// Unsharp mask against the four neighbouring cells so clustered screens keep edges and text.
vec3 crisp(vec3 raw, vec2 origin, float size, float amount) {
  vec2 center = origin + size * 0.5;
  vec3 around = 0.25 * (texel((center + vec2(size, 0.0)) / uResolution) + texel((center - vec2(size, 0.0)) / uResolution)
    + texel((center + vec2(0.0, size)) / uResolution) + texel((center - vec2(0.0, size)) / uResolution));
  float boost = dot(raw - around, vec3(0.299, 0.587, 0.114)) * amount;
  return clamp(raw + boost, 0.0, 1.0);
}
float bayerDigit(vec2 p) {
  vec2 b = mod(floor(p), 2.0);
  return 2.0 * b.x + 3.0 * b.y - 4.0 * b.x * b.y;
}
float ordered(vec2 p) {
  float first = bayerDigit(p);
  if (uEffect == FX_BAYER2) return (first + 0.5) / 4.0;
  float second = bayerDigit(p / 2.0);
  if (uEffect == FX_BAYER8) return (first * 16.0 + second * 4.0 + bayerDigit(p / 4.0) + 0.5) / 64.0;
  return (first * 4.0 + second + 0.5) / 16.0;
}
float noise(vec2 p) {
  return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715))));
}
float matrix(vec2 p, vec4 tile) {
  vec2 cell = p - tile.zw * floor((p + 0.5) / tile.zw);
  return (texture2D(uMatrix, (tile.xy + cell + 0.5) / ATLAS).r * 255.0 + 0.5) / 256.0;
}
vec3 dither(float light, vec3 rgb, float t) {
  if (uColor) return nearest(clamp(rgb + (t - 0.5) / uLevels, 0.0, 1.0), false);
  return shade(clamp(floor(light * uLevels + t), 0.0, uLevels));
}
// Round-dot screen value in [0, 1]; 1 at dot centers.
float screen(vec2 p, vec2 direction) {
  vec2 r = vec2(dot(p, direction), dot(p, vec2(-direction.y, direction.x)));
  return 0.5 + 0.25 * (cos(6.2831853 * fract(r.x)) + cos(6.2831853 * fract(r.y)));
}
void main() {
  if (uEffect == -1) {
    gl_FragColor = texture2D(uSource, vUv);
    return;
  }
  vec2 position = vUv * uResolution;
  float cell = uEffect == FX_ASCII || uEffect == FX_ASCIISOFT ? uPixel * 3.0 : uEffect == FX_STITCH ? max(6.0, uPixel * 2.0) : uPixel;
  vec2 grid = floor(position / cell);
  vec2 corner = grid * cell;
  vec2 uv = (grid * cell + floor(cell * 0.5) + 0.5) / uResolution;
  vec3 color;
  if (uEffect == FX_ASCII || uEffect == FX_ASCIISOFT) {
    float light = luminance(uv);
    float glyph = min(9.0, floor(light * 10.0));
    vec2 local = fract(position / cell);
    float glyphInk = texture2D(uGlyphs, vec2((glyph + local.x) / 10.0, local.y)).r;
    if (uEffect == FX_ASCII) glyphInk = step(0.5, glyphInk);
    color = mix(shade(0.0), uColor ? nearest(sourceColor(uv), false) : shade(max(1.0, floor(light * uLevels + 0.5))), glyphInk);
  } else if (uEffect == FX_HALFTONE || uEffect == FX_CROSSHATCH || uEffect == FX_ENGRAVE || uEffect == FX_BLUENOISE) {
    vec3 raw = cellSource(corner, cell);
    if (uEffect != FX_BLUENOISE) raw = crisp(raw, corner, cell, 0.9);
    vec4 tile = uEffect == FX_HALFTONE ? TILE_HALFTONE : uEffect == FX_CROSSHATCH ? TILE_CROSSHATCH
      : uEffect == FX_ENGRAVE ? TILE_ENGRAVE : TILE_BLUE;
    color = dither(adjustLight(raw), adjust(raw), matrix(grid, tile));
  } else if (uEffect == FX_NEWSPRINT) {
    vec3 raw = crisp(cellSource(corner, cell), corner, cell, 0.9);
    vec3 rgb = adjust(raw);
    vec2 p = grid + 0.5;
    // A little blue-noise roughness reads as ink soaking into pulp paper.
    float pulp = matrix(grid, TILE_BLUE) - 0.5;
    float key = screen(p, SCREEN_K) + pulp * 0.2;
    if (uColor) {
      // Each channel is dithered by its own rotated ink screen (C→red, M→green, Y→blue) plus the K screen,
      // so palette colors form rosettes instead of collapsing to unreachable process primaries.
      vec3 inks = vec3(screen(p, SCREEN_C), screen(p, SCREEN_M), screen(p, SCREEN_Y)) - 0.5 + pulp * 0.2;
      color = nearest(clamp(rgb - (inks * 0.6 + (key - 0.5) * 0.6) / uLevels * 1.6, 0.0, 1.0), false);
    } else {
      color = dither(adjustLight(raw), rgb, clamp(1.0 - key, 0.002, 0.998));
    }
  } else if (uEffect == FX_STITCH) {
    vec3 raw = cellSource(corner, cell);
    // Fabric shows around every X, so darken thread choice to keep the cell's overall tone.
    float light = pow(adjustLight(raw), 1.2);
    float t = ordered(grid);
    float level = clamp(floor(light * uLevels + t), 0.0, uLevels);
    vec3 rgb = adjust(raw);
    vec3 thread = uColor ? nearest(clamp(rgb * rgb + (t - 0.5) / uLevels, 0.0, 1.0), false) : shade(level);
    vec3 fabric = shade(uLevels);
    vec3 shadow = uColor ? darker(thread) : shade(level - 1.0);
    // Integer pixel coordinates inside the cell; each X is inset so neighbouring stitches stay separate.
    vec2 local = floor(position - corner);
    float last = cell - 1.0;
    float margin = cell >= 8.0 ? 1.0 : 0.0;
    float arm = max(1.0, floor(cell / 5.0));
    float over = abs(local.x - local.y);
    float under = abs(local.x + local.y - last);
    bool inside = min(local.x, local.y) >= margin && max(local.x, local.y) <= last - margin;
    bool bare = uColor ? all(equal(thread, fabric)) : level >= uLevels;
    if (inside && !bare && over <= arm) color = thread;
    else if (inside && !bare && under <= arm) color = over <= arm + 1.0 ? shadow : thread;
    else if (uLevels >= 3.0 && local.x == 0.0 && local.y == 0.0) color = uColor ? darker(fabric) : shade(uLevels - 1.0);
    else color = fabric;
  } else if (uEffect == FX_LCD) {
    vec3 raw = cellSource(corner, cell);
    float t = ordered(grid);
    float level = clamp(floor(adjustLight(raw) * uLevels + t), 0.0, uLevels);
    vec3 lit = uColor ? nearest(clamp(adjust(raw) + (t - 0.5) / uLevels, 0.0, 1.0), false) : shade(level);
    vec2 local = position - corner;
    // Full 1-px grid lines; with only two colors the darker level is the ink itself, so mark just the corner.
    bool right = local.x >= cell - 1.0;
    bool bottom = local.y < 1.0;
    bool gap = cell >= 3.0 && (uLevels >= 2.0 ? right || bottom : right && bottom);
    color = gap ? (uColor ? darker(lit) : shade(level - 1.0)) : lit;
  } else if (uEffect == FX_VHS) {
    float seed = uVhs.x * 61.0;
    float row = grid.y;
    float wobble = noise(vec2(row, seed));
    float jitter = wobble > 0.94 ? (wobble > 0.97 ? 1.0 : -1.0) : 0.0;
    float height = (row + 0.5) * cell / uResolution.y;
    float band = uVhs.z * (1.0 - smoothstep(0.0, 0.045, abs(height - uVhs.y)));
    jitter += band * (noise(vec2(row, seed + 17.0)) - 0.5) * 6.0;
    jitter += max(0.0, 1.0 - height / 0.035) * (2.0 + 2.0 * uVhs.w);
    vec2 center = corner + cell * 0.5 + vec2(jitter * cell, 0.0);
    vec2 pitch = vec2(cell / uResolution.x, 0.0);
    vec2 at = center / uResolution;
    vec3 a = texel(at);
    vec3 b = texel(at - pitch);
    vec3 c = texel(at - pitch * 2.0);
    vec3 d = texel(at - pitch * 3.0);
    float y = dot(a * 0.55 + b * 0.3 + c * 0.15, vec3(0.299, 0.587, 0.114));
    vec3 chroma = (c + d) * 0.5;
    float i = dot(chroma, vec3(0.596, -0.274, -0.322)) * 1.15;
    float q = dot(chroma, vec3(0.211, -0.523, 0.312)) * 1.15;
    vec3 raw = clamp(vec3(y + 0.956 * i + 0.621 * q, y - 0.272 * i - 0.647 * q, y - 1.106 * i + 1.703 * q), 0.0, 1.0);
    if (band > 0.15 && noise(vec2(floor(grid.x / 5.0), row + seed * 3.0)) > 0.86) raw = mix(raw, vec3(1.0), band);
    color = dither(adjustLight(raw), adjust(raw), ordered(grid));
  } else if (uEffect == FX_EDGES || uEffect == FX_EMBOSS) {
    vec2 d = vec2(uPixel) / uResolution;
    float tl = luminance(uv + vec2(-d.x, d.y));
    float br = luminance(uv + vec2(d.x, -d.y));
    float relief;
    if (uEffect == FX_EDGES) {
      float tc = luminance(uv + vec2(0.0, d.y));
      float tr = luminance(uv + d);
      float ml = luminance(uv - vec2(d.x, 0.0));
      float mr = luminance(uv + vec2(d.x, 0.0));
      float bl = luminance(uv - d);
      float bc = luminance(uv - vec2(0.0, d.y));
      float gx = -tl - 2.0 * ml - bl + tr + 2.0 * mr + br;
      float gy = -bl - 2.0 * bc - br + tl + 2.0 * tc + tr;
      relief = clamp(length(vec2(gx, gy)) * 0.5, 0.0, 1.0);
    } else {
      relief = clamp(0.5 + (br - tl) * 1.5, 0.0, 1.0);
    }
    color = shade(floor(relief * uLevels + 0.5));
  } else {
    float light = luminance(uv);
    float level;
    if (uEffect == FX_THRESHOLD) level = step(0.5, light) * uLevels;
    else if (uEffect == FX_POSTERIZE) level = floor(light * uLevels + 0.5);
    else if (uEffect == FX_INVERT) level = floor((1.0 - light) * uLevels + 0.5);
    else level = clamp(floor(light * uLevels + (uEffect == FX_NOISE ? noise(grid) : ordered(grid))), 0.0, uLevels);
    if (uColor) {
      vec3 rgb = sourceColor(uv);
      if (uEffect == FX_INVERT) rgb = 1.0 - rgb;
      else if (uEffect != FX_THRESHOLD && uEffect != FX_POSTERIZE) rgb += (uEffect == FX_NOISE ? noise(grid) - 0.5 : ordered(grid) - 0.5) / uLevels;
      color = nearest(clamp(rgb, 0.0, 1.0), uEffect == FX_THRESHOLD);
    } else color = shade(level);
    if (uEffect == FX_CRT) {
      float scan = mix(0.72, 1.0, step(0.22, fract(position.y / 3.0)));
      float phosphor = mix(0.86, 1.0, step(0.18, fract(position.x / 3.0)));
      vec2 edge = vUv * (1.0 - vUv.yx);
      float vignette = clamp(pow(edge.x * edge.y * 16.0, 0.18), 0.0, 1.0);
      color *= scan * phosphor * vignette;
    }
  }
  gl_FragColor = vec4(color, 1.0);
}`;

/* ---------- CPU helpers ---------- */

function colors(palette: string[]): number[][] {
  if (![2, 4, 6, 8, 16].includes(palette.length)) throw new RangeError('Choose a palette with 2, 4, 6, 8, or 16 colors.');
  return Array.from(palette, (entry, index) => {
    const fallback = DEFAULT_PALETTE[Math.round(index * 3 / (palette.length - 1))];
    let hex = entry ?? fallback;
    if (!/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(hex)) hex = fallback;
    if (hex.length === 4) hex = `#${[...hex.slice(1)].map((digit) => digit + digit).join('')}`;
    return [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16));
  });
}

function dimensions(source: CanvasImageSource): [number, number] {
  if ('videoWidth' in source) return [source.videoWidth, source.videoHeight];
  if ('naturalWidth' in source) return [source.naturalWidth, source.naturalHeight];
  if ('displayWidth' in source) return [source.displayWidth, source.displayHeight];
  if (typeof source.width === 'number') return [source.width, source.height as number];
  return [source.width.baseVal.value, (source as SVGImageElement).height.baseVal.value];
}

function clamp(value: number, min: number, max: number, fallback: number): number {
  return Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
}

function orderedValue(x: number, y: number, size: number): number {
  let value = 0;
  for (let scale = size / 2; scale >= 1; scale /= 2) {
    const a = x % 2;
    const b = y % 2;
    value += (2 * a + 3 * b - 4 * a * b) * scale * scale;
    x = Math.floor(x / 2);
    y = Math.floor(y / 2);
  }
  return (value + 0.5) / (size * size);
}

function spatialNoise(x: number, y: number): number {
  const inner = x * 0.06711056 + y * 0.00583715;
  const value = 52.9829189 * (inner - Math.floor(inner));
  return value - Math.floor(value);
}

/** Error-diffusion kernels as [dx, dy, weight] (dx mirrors on reversed rows). */
const DIFFUSION: Partial<Record<Effect, { kernel: number[][]; serpentine: boolean }>> = {
  atkinson: { kernel: [[1, 0, 1 / 8], [2, 0, 1 / 8], [-1, 1, 1 / 8], [0, 1, 1 / 8], [1, 1, 1 / 8], [0, 2, 1 / 8]], serpentine: false },
  floyd: { kernel: [[1, 0, 7 / 16], [-1, 1, 3 / 16], [0, 1, 5 / 16], [1, 1, 1 / 16]], serpentine: false },
  stucki: {
    kernel: [[1, 0, 8], [2, 0, 4], [-2, 1, 2], [-1, 1, 4], [0, 1, 8], [1, 1, 4], [2, 1, 2], [-2, 2, 1], [-1, 2, 2], [0, 2, 4], [1, 2, 2], [2, 2, 1]]
      .map(([dx, dy, weight]) => [dx, dy, weight / 42]),
    serpentine: true,
  },
};

/** Maps output-normalized position (y up, uv space) to crop-normalized texture space, as a row-major 2×2 plus offset. */
function shaderTransform(transform: FrameTransform, width: number, height: number, crop: number[]): [number[], number[]] {
  const cos = Math.cos(transform.angle) / transform.zoom;
  const sin = Math.sin(transform.angle) / transform.zoom;
  return [
    [crop[0] * cos, crop[0] * sin * height / width, -crop[1] * sin * width / height, crop[1] * cos],
    [crop[0] * transform.x + 0.5, -crop[1] * transform.y + 0.5],
  ];
}

/** GPU styles never read pixels back. Diffusion reads only its reduced working image. */
export class Renderer {
  private readonly gl: WebGLRenderingContext | null;
  private readonly output: CanvasRenderingContext2D | null;
  private readonly scratch = document.createElement('canvas');
  private readonly context: CanvasRenderingContext2D;
  private light = new Float32Array(0);
  private program: WebGLProgram | null = null;
  private texture: WebGLTexture | null = null;
  private glyphs: WebGLTexture | null = null;
  private paletteTexture: WebGLTexture | null = null;
  private matrixTexture: WebGLTexture | null = null;
  private readonly palettePixels = new Uint8Array(16 * 4);
  private paletteEntries: string[] | null = null;
  private palette: number[][] = [];
  private paletteLab: number[][] = [];
  private readonly labPixels = new Float32Array(16 * 3);
  private paletteDirty = true;
  private buffer: WebGLBuffer | null = null;
  private uniforms: Record<string, WebGLUniformLocation | null> = {};
  private disposed = false;
  private lost = false;
  private readonly contextLost = (event: Event) => {
    event.preventDefault();
    this.lost = true;
  };

  get supportsWebGL(): boolean { return this.gl !== null; }

  private readonly canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    canvas.width = CAPTURE_WIDTH;
    canvas.height = CAPTURE_HEIGHT;
    const context = this.scratch.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('Canvas rendering is unavailable. Open this camera in a current browser.');
    this.context = context;
    this.gl = canvas.getContext('webgl', { alpha: false, antialias: false, preserveDrawingBuffer: true });
    this.output = this.gl ? null : canvas.getContext('2d');
    if (!this.gl && !this.output) throw new Error('Graphics rendering is unavailable. Restart the app or update your browser.');
    if (this.gl) {
      try {
        this.initialize(this.gl);
      } catch (error) {
        this.dispose();
        throw new Error(`The graphics effect could not start. Restart the app or update your browser. ${error instanceof Error ? error.message : ''}`);
      }
      canvas.addEventListener('webglcontextlost', this.contextLost);
    }
  }

  setSize(width: number, height: number): void {
    if (this.disposed) throw new Error('This renderer has been disposed.');
    if (![width, height].every((value) => Number.isInteger(value) && value >= 1 && value <= 1280)) {
      throw new RangeError('Image dimensions must be whole numbers between 1 and 1280 pixels.');
    }
    if (this.canvas.width === width && this.canvas.height === height) return;
    if (this.canvas.width !== width) this.canvas.width = width;
    if (this.canvas.height !== height) this.canvas.height = height;
    this.gl?.viewport(0, 0, width, height);
  }

  render(source: CanvasImageSource, settings: Settings, options: RenderOptions = {}): void {
    if (this.disposed) throw new Error('This renderer has been disposed.');
    if (this.lost) throw new Error('The graphics connection was lost. Reload the camera to continue.');
    const effect = EFFECTS.findIndex((entry) => entry.id === settings.effect);
    if (effect < 0) throw new Error('Choose an available camera effect.');
    if (!this.gl && EFFECTS[effect].requiresWebGL) {
      throw new Error(`${EFFECTS[effect].label} effects need WebGL. Choose an available effect on this device.`);
    }
    const [width, height] = dimensions(source);
    if (!width || !height) return;
    const outputWidth = this.canvas.width;
    const outputHeight = this.canvas.height;
    const cropWidth = Math.min(width, height * outputWidth / outputHeight);
    const cropHeight = cropWidth * outputHeight / outputWidth;
    const contrast = clamp(settings.contrast, 0.5, 2.5, 1);
    const threshold = clamp(settings.threshold, 0, 1, 0.5);
    const pixel = Math.round(clamp(settings.pixelSize, 2, 12, 4));
    const transform = isIdentity(options.transform) ? null : options.transform!;
    if (!this.paletteEntries || settings.palette.length !== this.paletteEntries.length
      || settings.palette.some((entry, index) => entry !== this.paletteEntries![index])) {
      this.palette = colors(settings.palette);
      this.paletteLab = this.palette.map(([r, g, b]) => oklab(r / 255, g / 255, b / 255));
      this.paletteEntries = settings.palette.slice();
      this.paletteDirty = true;
    }
    const palette = this.palette;
    const levels = palette.length - 1;
    const mapping: Mapping = isMapping(settings.mapping) ? settings.mapping : 'tone';
    const colorMapping = mapping !== 'tone';
    const perceptual = mapping === 'lab' || mapping === 'vivid';
    const diffusion = DIFFUSION[settings.effect];
    if (diffusion || !this.gl) {
      const columns = Math.ceil(outputWidth / pixel);
      const rows = Math.ceil(outputHeight / pixel);
      if (this.scratch.width !== columns) this.scratch.width = columns;
      if (this.scratch.height !== rows) this.scratch.height = rows;
      this.context.clearRect(0, 0, columns, rows);
      const originX = (width - cropWidth) / 2;
      const originY = (height - cropHeight) / 2;
      if (!transform) {
        this.context.drawImage(source, originX, originY, cropWidth, cropHeight, 0, 0, columns, rows);
      } else {
        // Forward map scratch → source is src = A·(Q·s + q0) + b; draw with its inverse.
        const cos = Math.cos(transform.angle) / transform.zoom;
        const sin = Math.sin(transform.angle) / transform.zoom;
        const a = [cropWidth * cos / columns, -cropWidth * sin * outputHeight / outputWidth / rows,
          cropHeight * sin * outputWidth / outputHeight / columns, cropHeight * cos / rows];
        const at = (qx: number, qy: number) => [
          originX + cropWidth * (0.5 + transform.x) + cropWidth * (cos * qx * outputWidth - sin * qy * outputHeight) / outputWidth,
          originY + cropHeight * (0.5 + transform.y) + cropHeight * (sin * qx * outputWidth + cos * qy * outputHeight) / outputHeight,
        ];
        const [ex, ey] = at(-0.5, -0.5);
        const determinant = a[0] * a[3] - a[1] * a[2];
        const inverse = [a[3] / determinant, -a[2] / determinant, -a[1] / determinant, a[0] / determinant];
        this.context.setTransform(inverse[0], inverse[1], inverse[2], inverse[3],
          -(inverse[0] * ex + inverse[2] * ey), -(inverse[1] * ex + inverse[3] * ey));
        // Clamp-to-edge like the GPU path: stretch the outermost rows, columns and corners outward first.
        const far = (width + height) * 4;
        for (const [sx, sy, sw, sh, dx, dy, dw, dh] of [
          [0, 0, 1, height, -far, 0, far, height], [width - 1, 0, 1, height, width, 0, far, height],
          [0, 0, width, 1, 0, -far, width, far], [0, height - 1, width, 1, 0, height, width, far],
          [0, 0, 1, 1, -far, -far, far, far], [width - 1, 0, 1, 1, width, -far, far, far],
          [0, height - 1, 1, 1, -far, height, far, far], [width - 1, height - 1, 1, 1, width, height, far, far],
        ]) this.context.drawImage(source, sx, sy, sw, sh, dx, dy, dw, dh);
        this.context.drawImage(source, 0, 0, width, height);
        this.context.setTransform(1, 0, 0, 1, 0, 0);
      }
      const image = this.context.getImageData(0, 0, columns, rows);
      const channels = colorMapping ? 3 : 1;
      const length = columns * rows * channels;
      if (this.light.length !== length) this.light = new Float32Array(length);
      const light = this.light;
      for (let i = 0; i < columns * rows; i++) {
        const offset = i * 4;
        if (colorMapping) {
          for (let channel = 0; channel < 3; channel++) {
            light[i * 3 + channel] = Math.max(0, Math.min(1, (image.data[offset + channel] / 255 - 0.5) * contrast + 1 - threshold));
          }
          if (mapping === 'vivid') {
            // Lift saturation here so error diffusion works from the same boosted picture the matcher sees.
            const luma = light[i * 3] * COLOR_WEIGHTS[0] + light[i * 3 + 1] * COLOR_WEIGHTS[1] + light[i * 3 + 2] * COLOR_WEIGHTS[2];
            for (let channel = 0; channel < 3; channel++) {
              light[i * 3 + channel] = Math.max(0, Math.min(1, luma + (light[i * 3 + channel] - luma) * VIVID_SATURATION));
            }
          }
        } else {
          const value = (image.data[offset] * 0.299 + image.data[offset + 1] * 0.587 + image.data[offset + 2] * 0.114) / 255;
          light[i] = Math.max(0, Math.min(1, (value - 0.5) * contrast + 1 - threshold));
        }
      }
      const blue = settings.effect === 'bluenoise' ? getMatrices().blue : null;
      const orderedOffset = (x: number, y: number) => settings.effect === 'noise' ? spatialNoise(x, y)
        : blue ? blue[(y % BLUE_SIZE) * BLUE_SIZE + (x % BLUE_SIZE)]
        : orderedValue(x, y, settings.effect === 'bayer2' ? 2 : settings.effect === 'bayer8' ? 8 : 4);
      const flat = !!diffusion || settings.effect === 'posterize' || settings.effect === 'threshold' || settings.effect === 'invert';
      for (let y = 0; y < rows; y++) {
        const reverse = !!diffusion?.serpentine && y % 2 === 1;
        for (let step = 0; step < columns; step++) {
          const x = reverse ? columns - 1 - step : step;
          const i = y * columns + x;
          const value = light[i * channels];
          let level: number;
          if (settings.effect === 'threshold') level = value >= 0.5 ? levels : 0;
          else if (settings.effect === 'invert') level = Math.floor((1 - value) * levels + 0.5);
          else {
            const offset = flat ? 0.5 : orderedOffset(x, y);
            level = Math.max(0, Math.min(levels, Math.floor(value * levels + offset)));
          }
          if (colorMapping) {
            const offset = flat ? 0 : (orderedOffset(x, y) - 0.5) / levels;
            let distance = Infinity;
            const target = [0, 1, 2].map(channel => {
              const original = light[i * 3 + channel];
              return Math.max(0, Math.min(1, settings.effect === 'invert' ? 1 - original : original + offset));
            });
            const lab = perceptual ? oklab(target[0], target[1], target[2]) : null;
            for (let candidate = 0; candidate <= levels; candidate++) {
              if (settings.effect === 'threshold' && candidate !== 0 && candidate !== levels) continue;
              let next = 0;
              if (lab) {
                const entry = this.paletteLab[candidate];
                next = (lab[0] - entry[0]) ** 2 + (mapping === 'vivid' ? VIVID_CHROMA_WEIGHT : 1) * ((lab[1] - entry[1]) ** 2 + (lab[2] - entry[2]) ** 2);
              } else {
                for (let channel = 0; channel < 3; channel++) next += (target[channel] - palette[candidate][channel] / 255) ** 2 * COLOR_WEIGHTS[channel];
              }
              if (next < distance) {
                distance = next;
                level = candidate;
              }
            }
          }
          if (diffusion) {
            const direction = reverse ? -1 : 1;
            for (let channel = 0; channel < channels; channel++) {
              const error = colorMapping ? light[i * 3 + channel] - palette[level][channel] / 255 : value - level / levels;
              for (const [dx, dy, weight] of diffusion.kernel) {
                const tx = x + dx * direction;
                const ty = y + dy;
                if (tx >= 0 && tx < columns && ty < rows) light[(ty * columns + tx) * channels + channel] += error * weight;
              }
            }
          }
          const offset = i * 4;
          image.data[offset] = palette[level][0];
          image.data[offset + 1] = palette[level][1];
          image.data[offset + 2] = palette[level][2];
          image.data[offset + 3] = 255;
        }
      }
      this.context.putImageData(image, 0, 0);
      if (this.output) {
        this.output.imageSmoothingEnabled = false;
        this.output.drawImage(this.scratch, 0, 0, outputWidth, outputHeight);
      } else {
        this.draw(this.scratch, [1, 1], null, palette, contrast, threshold, pixel, -1, mapping, [0, 0, 0, 0]);
      }
      return;
    }
    const vhs = settings.effect === 'vhs' ? Renderer.tape(options.time ?? performance.now()) : [0, 0, 0, 0];
    this.draw(source, [cropWidth / width, cropHeight / height], transform, palette, contrast, threshold, pixel, effect, mapping, vhs);
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.canvas.removeEventListener('webglcontextlost', this.contextLost);
    const gl = this.gl;
    if (!gl) return;
    gl.deleteTexture(this.texture);
    gl.deleteTexture(this.glyphs);
    gl.deleteTexture(this.paletteTexture);
    gl.deleteTexture(this.matrixTexture);
    gl.deleteBuffer(this.buffer);
    gl.deleteProgram(this.program);
  }

  /** Tape state for a moment in time: [frame seed, band position, band strength, head-switch wobble]. */
  private static tape(time: number): number[] {
    const safe = Number.isFinite(time) ? time : 0;
    const frame = Math.floor(safe / 66);
    const seed = (((frame * 0.6180339887) % 1) + 1) % 1;
    const cycle = (((safe / VHS_LOOP_MS) % 1) + 1) % 1;
    const sweep = cycle / 0.28;
    const strength = sweep < 1 ? Math.sin(Math.PI * sweep) * 0.9 : 0;
    const wobble = (((frame * 0.7548776662) % 1) + 1) % 1;
    return [seed, 1.08 - sweep * 1.16, strength, wobble];
  }

  private initialize(gl: WebGLRenderingContext): void {
    const shaders: WebGLShader[] = [];
    try {
      for (const [type, code] of [[gl.VERTEX_SHADER, VERTEX], [gl.FRAGMENT_SHADER, FRAGMENT]] as const) {
        const shader = gl.createShader(type);
        if (!shader) throw new Error('Could not allocate a graphics shader.');
        shaders.push(shader);
        gl.shaderSource(shader, code);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) || 'Shader compilation failed.');
      }
      this.program = gl.createProgram();
      if (!this.program) throw new Error('Could not allocate a graphics program.');
      for (const shader of shaders) gl.attachShader(this.program, shader);
      gl.linkProgram(this.program);
      if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(this.program) || 'Shader linking failed.');
    } finally {
      for (const shader of shaders) gl.deleteShader(shader);
    }
    gl.useProgram(this.program);
    this.buffer = gl.createBuffer();
    if (!this.buffer) throw new Error('Could not allocate a graphics buffer.');
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(this.program, 'aPosition');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    for (const name of ['uSource', 'uGlyphs', 'uPalette', 'uMatrix', 'uCrop', 'uWarp', 'uXform', 'uShift', 'uResolution', 'uColor', 'uMatch', 'uLab', 'uTone', 'uVhs', 'uEffect']) {
      this.uniforms[name] = gl.getUniformLocation(this.program, name);
    }
    const makeTexture = () => {
      const texture = gl.createTexture();
      if (!texture) throw new Error('Could not allocate a graphics texture.');
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      return texture;
    };
    gl.activeTexture(gl.TEXTURE0);
    this.texture = makeTexture();
    gl.uniform1i(this.uniforms.uSource, 0);
    gl.activeTexture(gl.TEXTURE1);
    this.glyphs = makeTexture();
    const atlas = document.createElement('canvas');
    atlas.width = 80;
    atlas.height = 12;
    const ink = atlas.getContext('2d');
    if (!ink) throw new Error('Could not create ASCII characters.');
    ink.fillStyle = '#000';
    ink.fillRect(0, 0, atlas.width, atlas.height);
    ink.fillStyle = '#fff';
    ink.font = 'bold 12px monospace';
    ink.textAlign = 'center';
    ink.textBaseline = 'middle';
    [...' .:-=+*#%@'].forEach((character, index) => ink.fillText(character, index * 8 + 4, 6, 8));
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas);
    gl.uniform1i(this.uniforms.uGlyphs, 1);
    gl.activeTexture(gl.TEXTURE2);
    this.paletteTexture = makeTexture();
    gl.uniform1i(this.uniforms.uPalette, 2);
    gl.activeTexture(gl.TEXTURE3);
    this.matrixTexture = makeTexture();
    // Atlas rows are stored top-down in texture order, so upload them unflipped.
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, ATLAS_WIDTH, ATLAS_HEIGHT, 0, gl.RGBA, gl.UNSIGNED_BYTE, getMatrices().atlas);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.uniform1i(this.uniforms.uMatrix, 3);
    gl.viewport(0, 0, CAPTURE_WIDTH, CAPTURE_HEIGHT);
  }

  private draw(source: CanvasImageSource, crop: number[], transform: FrameTransform | null, palette: number[][], contrast: number,
    threshold: number, pixel: number, effect: number, mapping: Mapping, vhs: number[]): void {
    const gl = this.gl!;
    if (gl.isContextLost()) throw new Error('The graphics connection was lost. Reload the camera to continue.');
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source as TexImageSource);
    gl.uniform2fv(this.uniforms.uCrop, crop);
    gl.uniform1i(this.uniforms.uWarp, transform ? 1 : 0);
    if (transform) {
      const [matrix, shift] = shaderTransform(transform, this.canvas.width, this.canvas.height, crop);
      gl.uniform4fv(this.uniforms.uXform, matrix);
      gl.uniform2fv(this.uniforms.uShift, shift);
    }
    gl.uniform2f(this.uniforms.uResolution, this.canvas.width, this.canvas.height);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, this.paletteTexture);
    if (this.paletteDirty) {
      for (let index = 0; index < 16; index++) {
        this.palettePixels.set(palette[Math.min(index, palette.length - 1)], index * 4);
        this.palettePixels[index * 4 + 3] = 255;
      }
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 16, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.palettePixels);
      for (let index = 0; index < 16; index++) this.labPixels.set(this.paletteLab[Math.min(index, this.paletteLab.length - 1)], index * 3);
      gl.uniform3fv(this.uniforms.uLab, this.labPixels);
      this.paletteDirty = false;
    }
    gl.uniform1i(this.uniforms.uColor, mapping === 'tone' ? 0 : 1);
    gl.uniform1i(this.uniforms.uMatch, MATCH_INDEX[mapping]);
    gl.uniform4f(this.uniforms.uTone, contrast, threshold, pixel, palette.length - 1);
    gl.uniform4fv(this.uniforms.uVhs, vhs);
    gl.uniform1i(this.uniforms.uEffect, effect);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.flush();
  }
}
