import type { FrameTransform } from './transform';

export type StabilizationLevel = 'off' | 'light' | 'strong';
type ActiveLevel = Exclude<StabilizationLevel, 'off'>;

/** Long side, in pixels, of the luma image analysed for every frame. */
export const ANALYSIS_LONG_SIDE = 128;

/** Content motion between the previous and the current frame, as measured by the last update(). */
export type FrameMotion = {
  /** Translation of the frame centre's content, in crop fractions (+x = content moved right, +y = down). */
  x: number;
  y: number;
  /** Content rotation about the crop centre, radians (y-down space: + is clockwise on screen). */
  angle: number;
  /** Textured blocks that produced a motion vector / blocks that agreed with the fitted motion. */
  blocks: number;
  inliers: number;
  /** 'blocks' = robust similarity fit, 'global' = whole-frame translation fallback,
   *  'none' = featureless or first frame (zero motion), 'cut' = no match (scene cut / whip pan). */
  method: 'none' | 'blocks' | 'global' | 'cut';
};

/**
 * Smoothing per level. Path quantities are expressed in "rooms": the correction available on that
 * axis (the crop margin for x/y, the angle cap for roll), so both levels share one filter.
 *  pull         rate (1/s) at which the smoothed path closes the gap to the real one when idle
 *  speedGain    extra pull per room/s of deliberate motion (one-euro style: pans are followed)
 *  deadzone     path speed (rooms/s) treated as shake rather than a deliberate move
 *  velocityTau  time constant (s) of the path-velocity estimate that is fed forward
 *  inertia      time constant (s) of the smoothed path's own velocity (second-order smoothing)
 *  edgePull     extra pull ramped in between edgeKnee and the edge of the room (soft limit)
 */
type Tuning = { margin: number; maxAngleDeg: number; pull: number; speedGain: number; deadzone: number; velocityTau: number; inertia: number; edgePull: number; edgeKnee: number };
const LEVELS: Record<ActiveLevel, Tuning> = {
  light: { margin: 0.08, maxAngleDeg: 3, pull: 1, speedGain: 1, deadzone: 0.6, velocityTau: 0.25, inertia: 0.15, edgePull: 8, edgeKnee: 0.4 },
  strong: { margin: 0.12, maxAngleDeg: 4, pull: 0.25, speedGain: 0.5, deadzone: 0.35, velocityTau: 0.5, inertia: 0.25, edgePull: 6, edgeKnee: 0.5 },
};
/** Fraction of the translation room the roll correction may consume on the tighter axis. */
const ANGLE_BUDGET = 0.4;
/** Correction beyond this fraction of the room is compressed (tanh) so it can never reach the edge. */
const SOFT_KNEE = 0.8;
/** Extra pull for a moment after a scene cut / lost track, so the framing recentres smoothly. */
const RECENTER_PULL = 3, RECENTER_SECONDS = 0.6;
const MIN_DT = 1 / 120, MAX_DT = 0.1;

// Motion analysis (pixel units are analysis pixels).
const GLOBAL_RANGE = 0.14;         // ± fraction of the frame searched for the global shift (half resolution)
const BOX_RADIUS = 5;              // band-pass = blurred luma minus its 11×11 local mean (brightness robust)
const BLOCK = 16, BLOCK_CELL = 24, MAX_BLOCKS = 48;
const COARSE_RANGE = 3;            // per-block search around the global guess at half resolution (±6 px full)
const FINE_RANGE = 2;              // then at full resolution around the coarse result
const FLAT_TEXTURE = 0.4;          // mean |band-pass| (luma levels) below which a frame is featureless
const BLOCK_MIN_ENERGY = 1.5;      // mean squared band-pass a block needs before it is searched
const MIN_CURVATURE = 0.6;         // weakest SSD curvature per pixel (rejects flat and edge-only blocks)
const MIN_CURVATURE_RATIO = 0.04;  // weakest / strongest curvature (aperture problem)
const CUT_RATIO = 0.55;            // global SAD / Σ(|a| + |b|): ≈0.7 for unrelated images, ≈0.1–0.4 for a match
const HYPOTHESIS_PX = 1.5, MIN_INLIER_PX = 0.5, MIN_INLIERS = 4;

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));
const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};
/** Identity below SOFT_KNEE·limit, then a tanh shoulder that approaches (never reaches) ±limit. */
const softLimit = (value: number, limit: number) => {
  const usage = Math.abs(value) / limit;
  if (usage <= SOFT_KNEE) return value;
  return Math.sign(value) * limit * (SOFT_KNEE + (1 - SOFT_KNEE) * Math.tanh((usage - SOFT_KNEE) / (1 - SOFT_KNEE)));
};
const sourceSize = (source: CanvasImageSource): [number, number] => {
  if (typeof HTMLVideoElement !== 'undefined' && source instanceof HTMLVideoElement) return [source.videoWidth, source.videoHeight];
  if (typeof HTMLImageElement !== 'undefined' && source instanceof HTMLImageElement) return [source.naturalWidth, source.naturalHeight];
  if (typeof VideoFrame !== 'undefined' && source instanceof VideoFrame) return [source.displayWidth, source.displayHeight];
  const sized = source as { width: number | SVGAnimatedLength; height: number | SVGAnimatedLength };
  return [typeof sized.width === 'number' ? sized.width : sized.width.baseVal.value, typeof sized.height === 'number' ? sized.height : sized.height.baseVal.value];
};

/**
 * Software video stabilizer. update() measures how the scene moved since the previous frame
 * (robust similarity: translation + roll), accumulates that into the camera path, smooths the
 * path causally, and returns the FrameTransform that makes the output follow the smoothed path.
 * The renderer applies the transform (see mapOutputToCrop); nothing is drawn here.
 *
 * Not handled: rolling-shutter wobble, parallax (only one global motion is fitted), zoom changes.
 */
export class VideoStabilizer {
  private canvas: HTMLCanvasElement | undefined;
  private context: CanvasRenderingContext2D | undefined;
  private sourceWidth = 0;
  private sourceHeight = 0;
  private aspect = 0;
  private level: ActiveLevel | undefined;
  private width = 0;
  private height = 0;
  private halfWidth = 0;
  private halfHeight = 0;
  // Band-passed analysis images (full and half resolution) for this and the previous frame.
  private current0 = new Float32Array(0);
  private previous0 = new Float32Array(0);
  private current1 = new Float32Array(0);
  private previous1 = new Float32Array(0);
  private scratchA = new Float32Array(0);
  private scratchB = new Float32Array(0);
  private rowSum = new Float64Array(0);
  private currentTexture = 0;
  private previousTexture = 0;
  private hasPrevious = false;
  private lastTime = -1;
  // Block vectors: position (relative to the image centre, previous frame) and displacement.
  private readonly blockX = new Float64Array(MAX_BLOCKS);
  private readonly blockY = new Float64Array(MAX_BLOCKS);
  private readonly blockDX = new Float64Array(MAX_BLOCKS);
  private readonly blockDY = new Float64Array(MAX_BLOCKS);
  private readonly inlier = new Uint8Array(MAX_BLOCKS);
  private readonly costs = new Float64Array((2 * COARSE_RANGE + 1) ** 2);
  private readonly residuals = new Float64Array(MAX_BLOCKS);
  private peakX = 0;
  private peakY = 0;
  // Fitted model d = t + (s + iθ)·p (complex form of a linearised similarity).
  private fitTX = 0;
  private fitTY = 0;
  private fitS = 0;
  private fitR = 0;
  // Path state per axis [x, y, angle]: correction = real path − smoothed path, in transform units.
  private readonly correction = new Float64Array(3);
  private readonly pathVelocity = new Float64Array(3);
  private readonly smoothVelocity = new Float64Array(3);
  private readonly measured = new Float64Array(3);
  private recenterTime = 0;
  private transform: FrameTransform = { x: 0, y: 0, angle: 0, zoom: 1 };
  private motion: FrameMotion = { x: 0, y: 0, angle: 0, blocks: 0, inliers: 0, method: 'none' };

  /** Last transform without new analysis (for redraws of the same frame). */
  get current(): FrameTransform { return this.transform; }
  /** Diagnostics: motion measured by the last update(). */
  get lastMotion(): FrameMotion { return this.motion; }

  reset(): void {
    this.hasPrevious = false;
    this.lastTime = -1;
    this.correction.fill(0); this.pathVelocity.fill(0); this.smoothVelocity.fill(0);
    this.recenterTime = 0;
    this.transform = { x: 0, y: 0, angle: 0, zoom: this.transform.zoom };
    this.motion = { x: 0, y: 0, angle: 0, blocks: 0, inliers: 0, method: 'none' };
  }

  /**
   * Call exactly once per NEW source frame. aspect = output width / height. Analyses the renderer's
   * centre crop. timeMs (default performance.now()) drives frame-rate-independent smoothing.
   * Frames that are not ready (zero size) return the previous transform unchanged.
   */
  update(source: CanvasImageSource, level: ActiveLevel, aspect: number, timeMs = performance.now()): FrameTransform {
    const [sourceWidth, sourceHeight] = sourceSize(source);
    if (!(sourceWidth > 0 && sourceHeight > 0 && aspect > 0 && Number.isFinite(sourceWidth + sourceHeight + aspect))) return this.transform;
    if (sourceWidth !== this.sourceWidth || sourceHeight !== this.sourceHeight || aspect !== this.aspect || level !== this.level) {
      this.configure(sourceWidth, sourceHeight, aspect, level);
    }
    const dt = this.lastTime < 0 ? 1 / 30 : clamp((timeMs - this.lastTime) / 1000, MIN_DT, MAX_DT);
    this.lastTime = timeMs;
    this.capture(source);
    if (this.hasPrevious) {
      this.estimate();
      this.smooth(dt);
    }
    this.hasPrevious = true;
    const full = this.previous0, half = this.previous1;
    this.previous0 = this.current0; this.current0 = full;
    this.previous1 = this.current1; this.current1 = half;
    this.previousTexture = this.currentTexture;
    const zoom = 1 / (1 - 2 * LEVELS[level].margin);
    this.transform = { x: this.correction[0], y: this.correction[1], angle: this.correction[2], zoom };
    return this.transform;
  }

  private configure(sourceWidth: number, sourceHeight: number, aspect: number, level: ActiveLevel): void {
    this.sourceWidth = sourceWidth; this.sourceHeight = sourceHeight; this.aspect = aspect; this.level = level;
    const width = Math.max(32, Math.round(aspect >= 1 ? ANALYSIS_LONG_SIDE : ANALYSIS_LONG_SIDE * aspect));
    const height = Math.max(32, Math.round(aspect >= 1 ? ANALYSIS_LONG_SIDE / aspect : ANALYSIS_LONG_SIDE));
    if (width !== this.width || height !== this.height) {
      this.width = width; this.height = height;
      this.halfWidth = width >> 1; this.halfHeight = height >> 1;
      const size = width * height, half = this.halfWidth * this.halfHeight;
      this.current0 = new Float32Array(size); this.previous0 = new Float32Array(size);
      this.scratchA = new Float32Array(size); this.scratchB = new Float32Array(size);
      this.current1 = new Float32Array(half); this.previous1 = new Float32Array(half);
      this.rowSum = new Float64Array(width);
    }
    this.canvas ??= document.createElement('canvas');
    if (this.canvas.width !== width || this.canvas.height !== height || !this.context) {
      this.canvas.width = width; this.canvas.height = height;
      const context = this.canvas.getContext('2d', { willReadFrequently: true });
      if (!context) throw new Error('Video stabilization is unavailable on this device.');
      this.context = context;
    }
    // Mipmapped downscaling: plain bilinear would alias badly at ~10:1.
    this.context.imageSmoothingEnabled = true;
    this.context.imageSmoothingQuality = 'medium';
    this.context.globalCompositeOperation = 'copy';
    this.reset();
    this.transform = { x: 0, y: 0, angle: 0, zoom: 1 / (1 - 2 * LEVELS[level].margin) };
  }

  /** Downsample the centre crop to luma, blur 1-2-1, band-pass (minus local mean), build half resolution. */
  private capture(source: CanvasImageSource): void {
    const { width: w, height: h, scratchA: a, scratchB: b, current0: out, rowSum } = this;
    const cropWidth = Math.min(this.sourceWidth, this.sourceHeight * this.aspect), cropHeight = cropWidth / this.aspect;
    const context = this.context!;
    context.drawImage(source, (this.sourceWidth - cropWidth) / 2, (this.sourceHeight - cropHeight) / 2, cropWidth, cropHeight, 0, 0, w, h);
    const rgba = context.getImageData(0, 0, w, h).data;
    const n = w * h;
    for (let i = 0, p = 0; i < n; i++, p += 4) a[i] = 0.299 * rgba[p] + 0.587 * rgba[p + 1] + 0.114 * rgba[p + 2];
    for (let y = 0; y < h; y++) {
      const row = y * w;
      b[row] = (3 * a[row] + a[row + 1]) * 0.25;
      for (let x = 1; x < w - 1; x++) b[row + x] = (a[row + x - 1] + 2 * a[row + x] + a[row + x + 1]) * 0.25;
      b[row + w - 1] = (a[row + w - 2] + 3 * a[row + w - 1]) * 0.25;
    }
    for (let y = 0; y < h; y++) {
      const row = y * w, up = y > 0 ? row - w : row, down = y < h - 1 ? row + w : row;
      for (let x = 0; x < w; x++) a[row + x] = (b[up + x] + 2 * b[row + x] + b[down + x]) * 0.25;
    }
    // Horizontal box sums (window clipped at the borders) into b.
    const r = BOX_RADIUS;
    for (let y = 0; y < h; y++) {
      const row = y * w;
      let sum = 0;
      for (let x = 0; x < r && x < w; x++) sum += a[row + x];
      for (let x = 0; x < w; x++) {
        if (x + r < w) sum += a[row + x + r];
        if (x - r - 1 >= 0) sum -= a[row + x - r - 1];
        b[row + x] = sum / (Math.min(x + r, w - 1) - Math.max(x - r, 0) + 1);
      }
    }
    // Vertical running sum of those rows; band-pass = blurred − local mean.
    rowSum.fill(0);
    for (let y = 0; y < r && y < h; y++) for (let x = 0; x < w; x++) rowSum[x] += b[y * w + x];
    let texture = 0;
    for (let y = 0; y < h; y++) {
      if (y + r < h) { const add = (y + r) * w; for (let x = 0; x < w; x++) rowSum[x] += b[add + x]; }
      if (y - r - 1 >= 0) { const sub = (y - r - 1) * w; for (let x = 0; x < w; x++) rowSum[x] -= b[sub + x]; }
      const inverse = 1 / (Math.min(y + r, h - 1) - Math.max(y - r, 0) + 1), row = y * w;
      for (let x = 0; x < w; x++) {
        const value = a[row + x] - rowSum[x] * inverse;
        out[row + x] = value;
        texture += Math.abs(value);
      }
    }
    this.currentTexture = texture / n;
    const hw = this.halfWidth, hh = this.halfHeight, half = this.current1;
    for (let y = 0; y < hh; y++) {
      const top = 2 * y * w, bottom = top + w;
      for (let x = 0; x < hw; x++) {
        const i = 2 * x;
        half[y * hw + x] = 0.25 * (out[top + i] + out[top + i + 1] + out[bottom + i] + out[bottom + i + 1]);
      }
    }
  }

  /** Measure previous → current content motion into this.measured (x, y crop fractions; angle radians). */
  private estimate(): void {
    const { width: w, height: h } = this;
    this.measured.fill(0);
    const report = (method: FrameMotion['method'], blocks = 0, inliers = 0) => {
      this.motion = { x: this.measured[0], y: this.measured[1], angle: this.measured[2], blocks, inliers, method };
    };
    if (this.currentTexture < FLAT_TEXTURE || this.previousTexture < FLAT_TEXTURE) return report('none');

    // 1. Global translation: exhaustive SAD at half resolution over ±GLOBAL_RANGE, on a quincunx
    //    subsample (every other pixel of every other row). Only needs to be within ±COARSE_RANGE.
    const hw = this.halfWidth, hh = this.halfHeight, prev = this.previous1, cur = this.current1;
    const rx = Math.ceil(GLOBAL_RANGE * hw), ry = Math.ceil(GLOBAL_RANGE * hh);
    let best = Infinity, globalX = 0, globalY = 0, magnitude = 0;
    for (let y = ry; y < hh - ry; y += 2) for (let x = rx + (y & 2 ? 1 : 0); x < hw - rx; x += 2) magnitude += Math.abs(prev[y * hw + x]) + Math.abs(cur[y * hw + x]);
    for (let dy = -ry; dy <= ry; dy++) {
      for (let dx = -rx; dx <= rx; dx++) {
        let sum = 0;
        for (let y = ry; y < hh - ry; y += 2) {
          const a = y * hw, b = (y + dy) * hw + dx;
          for (let x = rx + (y & 2 ? 1 : 0); x < hw - rx; x += 2) sum += Math.abs(prev[a + x] - cur[b + x]);
        }
        sum *= 1 + 0.002 * (dx * dx + dy * dy); // break ties (repetitive texture) toward small motion
        if (sum < best) { best = sum; globalX = dx; globalY = dy; }
      }
    }

    // 2. Local block vectors on a grid: each block searches ±COARSE_RANGE around the global guess at
    //    half resolution (so a moving subject that skews the guess cannot hide the background), then
    //    ±FINE_RANGE at full resolution, then a sub-pixel peak fit.
    const p0 = this.previous0, c0 = this.current0, half = BLOCK / 2, span = 2 * COARSE_RANGE + 1;
    const cols = Math.max(2, Math.round(w / BLOCK_CELL)), rows = Math.max(2, Math.round(h / BLOCK_CELL));
    let count = 0;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols && count < MAX_BLOCKS; col++) {
        // Even origins so the block maps exactly onto the half-resolution grid.
        const x0 = 2 * Math.round(((col + 0.5) * w / cols - half) / 2), y0 = 2 * Math.round(((row + 0.5) * h / rows - half) / 2);
        let energy = 0;
        for (let y = y0; y < y0 + BLOCK; y++) for (let x = x0; x < x0 + BLOCK; x++) { const v = p0[y * w + x]; energy += v * v; }
        if (energy < BLOCK_MIN_ENERGY * BLOCK * BLOCK) continue;
        if (!this.ssdSearch(prev, cur, hw, hh, x0 / 2, y0 / 2, half, half, globalX, globalY, COARSE_RANGE)) continue;
        const coarse = this.argmin(COARSE_RANGE);
        const fineX = 2 * (globalX + (coarse % span) - COARSE_RANGE), fineY = 2 * (globalY + Math.floor(coarse / span) - COARSE_RANGE);
        if (!this.ssdSearch(p0, c0, w, h, x0, y0, BLOCK, BLOCK, fineX, fineY, FINE_RANGE) || !this.peak(FINE_RANGE, BLOCK * BLOCK)) continue;
        this.blockX[count] = x0 + half - w / 2;
        this.blockY[count] = y0 + half - h / 2;
        this.blockDX[count] = fineX + this.peakX;
        this.blockDY[count] = fineY + this.peakY;
        count++;
      }
    }

    // 3. Robust similarity fit; otherwise a cut if nothing matches globally, else a refined global
    //    translation, else no motion.
    const inliers = count >= MIN_INLIERS ? this.fitSimilarity(count) : 0;
    if (inliers >= MIN_INLIERS) {
      const angle = Math.atan2(this.fitR, 1 + this.fitS);
      this.measured[0] = this.fitTX / w; this.measured[1] = this.fitTY / h; this.measured[2] = angle;
      return report('blocks', count, inliers);
    }
    if (best > CUT_RATIO * magnitude) return report('cut', count, 0);
    const guessX = 2 * globalX, guessY = 2 * globalY, border = 2, G = FINE_RANGE;
    const x0 = Math.max(border, border - guessX + G), x1 = Math.min(w - border, w - border - guessX - G);
    const y0 = Math.max(border, border - guessY + G), y1 = Math.min(h - border, h - border - guessY - G);
    if (x1 - x0 > 8 && y1 - y0 > 8 && this.ssdSearch(p0, c0, w, h, x0, y0, x1 - x0, y1 - y0, guessX, guessY, G) && this.peak(G, (x1 - x0) * (y1 - y0))) {
      this.measured[0] = (guessX + this.peakX) / w; this.measured[1] = (guessY + this.peakY) / h;
      return report('global', count, 0);
    }
    report('none', count, 0);
  }

  private argmin(R: number): number {
    let best = 0;
    for (let k = 1, n = (2 * R + 1) ** 2; k < n; k++) if (this.costs[k] < this.costs[best]) best = k;
    return best;
  }

  /** SSD of prev[x0..x0+bw, y0..y0+bh] against cur shifted by (cx + i, cy + j), |i|,|j| ≤ R → this.costs.
   *  w × h is the image size; shifts that would leave the image cost Infinity. False if none fit. */
  private ssdSearch(prev: Float32Array, cur: Float32Array, w: number, h: number, x0: number, y0: number, bw: number, bh: number, cx: number, cy: number, R: number): boolean {
    const span = 2 * R + 1, costs = this.costs;
    let any = false;
    for (let j = -R; j <= R; j++) {
      for (let i = -R; i <= R; i++) {
        if (x0 + cx + i < 0 || y0 + cy + j < 0 || x0 + bw + cx + i > w || y0 + bh + cy + j > h) { costs[(j + R) * span + i + R] = Infinity; continue; }
        any = true;
        let sum = 0;
        const shift = (cy + j) * w + cx + i;
        for (let y = y0; y < y0 + bh; y++) {
          const a = y * w;
          for (let x = a + x0, end = a + x0 + bw; x < end; x++) { const d = prev[x] - cur[x + shift]; sum += d * d; }
        }
        costs[(j + R) * span + i + R] = sum;
      }
    }
    return any;
  }

  /** Sub-pixel minimum of this.costs (quadratic fit on the 3×3 around the integer minimum) → peakX/Y.
   *  Rejects minima on the window/image border, weak curvature (flat) and one-dimensional curvature (edges). */
  private peak(R: number, pixels: number): boolean {
    const span = 2 * R + 1, costs = this.costs, bestIndex = this.argmin(R);
    const bx = (bestIndex % span) - R, by = Math.floor(bestIndex / span) - R;
    if (Math.abs(bx) === R || Math.abs(by) === R) return false;
    const at = (i: number, j: number) => costs[(by + j + R) * span + bx + i + R] / pixels;
    const c = at(0, 0);
    if (!Number.isFinite(at(-1, -1) + at(1, -1) + at(-1, 1) + at(1, 1) + at(0, -1) + at(0, 1) + at(-1, 0) + at(1, 0))) return false;
    const gx = (at(1, 0) - at(-1, 0)) / 2, gy = (at(0, 1) - at(0, -1)) / 2;
    const hxx = at(1, 0) + at(-1, 0) - 2 * c, hyy = at(0, 1) + at(0, -1) - 2 * c;
    const hxy = (at(1, 1) - at(1, -1) - at(-1, 1) + at(-1, -1)) / 4;
    const mean = (hxx + hyy) / 2, spread = Math.sqrt(((hxx - hyy) / 2) ** 2 + hxy * hxy);
    const low = mean - spread, high = mean + spread;
    if (low < MIN_CURVATURE || low < MIN_CURVATURE_RATIO * high) return false;
    const det = hxx * hyy - hxy * hxy;
    const sx = -(hyy * gx - hxy * gy) / det, sy = -(hxx * gy - hxy * gx) / det;
    if (Math.abs(sx) > 0.75 || Math.abs(sy) > 0.75) return false;
    this.peakX = bx + sx; this.peakY = by + sy;
    return true;
  }

  /** RANSAC-lite over all single-block (translation) and block-pair (similarity) hypotheses, scored with
   *  truncated squared residuals, then least-squares refits on the inliers. Returns the inlier count. */
  private fitSimilarity(count: number): number {
    const { blockX: px, blockY: py, blockDX: dx, blockDY: dy } = this;
    const limit = HYPOTHESIS_PX * HYPOTHESIS_PX;
    const score = (tx: number, ty: number, s: number, r: number) => {
      let total = 0;
      for (let k = 0; k < count; k++) {
        const ex = dx[k] - tx - s * px[k] + r * py[k], ey = dy[k] - ty - s * py[k] - r * px[k];
        total += Math.min(ex * ex + ey * ey, limit);
      }
      return total;
    };
    let bestScore = Infinity;
    const consider = (tx: number, ty: number, s: number, r: number) => {
      const value = score(tx, ty, s, r);
      if (value < bestScore) { bestScore = value; this.fitTX = tx; this.fitTY = ty; this.fitS = s; this.fitR = r; }
    };
    for (let i = 0; i < count; i++) {
      consider(dx[i], dy[i], 0, 0);
      for (let j = i + 1; j < count; j++) {
        const ex = px[j] - px[i], ey = py[j] - py[i], length = ex * ex + ey * ey;
        if (length < 64) continue;
        const fx = dx[j] - dx[i], fy = dy[j] - dy[i];
        // (1 + s + iθ) = (Δp + Δd) / Δp in complex form.
        const s = (fx * ex + fy * ey) / length, r = (ex * fy - ey * fx) / length;
        if (Math.abs(s) > 0.08 || Math.abs(r) > 0.08) continue;
        consider(dx[i] - s * px[i] + r * py[i], dy[i] - s * py[i] - r * px[i], s, r);
      }
    }
    // Refits: the inlier threshold starts at HYPOTHESIS_PX and then adapts to the residual spread of the
    // current inliers (3σ, σ from the median), so boundary blocks half-covered by a subject are dropped.
    let inliers = 0, threshold = HYPOTHESIS_PX;
    for (let pass = 0; pass < 4; pass++) {
      let candidates = 0;
      for (let k = 0; k < count; k++) {
        const ex = dx[k] - this.fitTX - this.fitS * px[k] + this.fitR * py[k], ey = dy[k] - this.fitTY - this.fitS * py[k] - this.fitR * px[k];
        const residual = Math.sqrt(ex * ex + ey * ey);
        this.inlier[k] = residual < threshold ? 1 : 0;
        if (this.inlier[k]) this.residuals[candidates++] = residual;
      }
      if (candidates < MIN_INLIERS) return pass === 0 ? candidates : inliers; // keep the previous fit
      inliers = candidates;
      const sorted = this.residuals.subarray(0, candidates).sort();
      threshold = clamp(3 * 1.4826 * sorted[candidates >> 1], MIN_INLIER_PX, HYPOTHESIS_PX);
      let mx = 0, my = 0, mdx = 0, mdy = 0;
      for (let k = 0; k < count; k++) if (this.inlier[k]) { mx += px[k]; my += py[k]; mdx += dx[k]; mdy += dy[k]; }
      mx /= inliers; my /= inliers; mdx /= inliers; mdy /= inliers;
      let spread = 0, dot = 0, cross = 0;
      for (let k = 0; k < count; k++) {
        if (!this.inlier[k]) continue;
        const ex = px[k] - mx, ey = py[k] - my, fx = dx[k] - mdx, fy = dy[k] - mdy;
        spread += ex * ex + ey * ey; dot += ex * fx + ey * fy; cross += ex * fy - ey * fx;
      }
      // Too little spatial spread to see rotation: translation only.
      this.fitS = spread > 400 ? dot / spread : 0;
      this.fitR = spread > 400 ? cross / spread : 0;
      this.fitTX = mdx - this.fitS * mx + this.fitR * my;
      this.fitTY = mdy - this.fitS * my - this.fitR * mx;
    }
    return inliers;
  }

  /**
   * Path smoothing. The real camera path P moved by the measured motion; the smoothed path S moves
   * with velocity = feed-forward of P's (deliberate, already low-passed) velocity + pull·(P − S), the
   * pull term itself low-passed (inertia) for second-order rejection of shake. Steady pans are thus
   * followed without lag, and S stops promptly when P does. The correction C = P ∘ S⁻¹ is the returned transform: it moves the sample point along
   * with the content, so the output shows the content where S says it should be.
   */
  private smooth(dt: number): void {
    const tuning = LEVELS[this.level!], aspect = this.aspect, zoom = 1 / (1 - 2 * tuning.margin);
    const maxAngle = Math.min(tuning.maxAngleDeg * Math.PI / 180,
      ANGLE_BUDGET * tuning.margin / ((0.5 - tuning.margin) * Math.max(aspect, 1 / aspect)));
    const correction = this.correction, measured = this.measured;
    if (this.motion.method === 'cut') {
      // Lost track: let the output jump with the content (it is a cut or a whip anyway) and recentre.
      this.recenterTime = RECENTER_SECONDS;
      this.pathVelocity.fill(0);
      this.smoothVelocity.fill(0);
    } else {
      // C ← M ∘ C, composed exactly; x is scaled to crop-height units so the rotation is aspect-correct.
      const cos = Math.cos(measured[2]), sin = Math.sin(measured[2]);
      const cx = correction[0] * aspect, cy = correction[1];
      correction[0] = (cos * cx - sin * cy) / aspect + measured[0];
      correction[1] = sin * cx + cos * cy + measured[1];
      correction[2] += measured[2];
    }
    const velocityBlend = 1 - Math.exp(-dt / tuning.velocityTau);
    for (let axis = 0; axis < 3; axis++) {
      const room = axis === 2 ? maxAngle : tuning.margin;
      const pathVelocity = this.pathVelocity[axis] += velocityBlend * (measured[axis] / dt - this.pathVelocity[axis]);
      const speed = Math.abs(pathVelocity) / room, deliberate = Math.max(0, speed - tuning.deadzone);
      // Feed the path velocity forward once it looks deliberate, but never let S run ahead of P
      // (that would overshoot when a pan stops).
      const ahead = Math.max(0, -Math.sign(pathVelocity) * correction[axis] / room);
      const feedForward = pathVelocity * smoothstep(0.5 * tuning.deadzone, 2 * tuning.deadzone, speed) * Math.max(0, 1 - ahead / 0.1);
      const pull = tuning.pull + tuning.speedGain * deliberate
        + tuning.edgePull * smoothstep(tuning.edgeKnee, 1, Math.abs(correction[axis]) / room)
        + (this.recenterTime > 0 ? RECENTER_PULL : 0);
      // Keep the loop critically damped (pull·inertia ≤ ¼) and the integration stable (sub-steps).
      const inertia = Math.min(tuning.inertia, 0.25 / pull);
      const steps = Math.ceil(pull * dt / 0.25), h = dt / steps, blend = 1 - Math.exp(-h / inertia);
      let offset = correction[axis], velocity = this.smoothVelocity[axis];
      for (let k = 0; k < steps; k++) {
        velocity += blend * (pull * offset - velocity);
        offset -= (feedForward + velocity) * h;
      }
      correction[axis] = offset; this.smoothVelocity[axis] = velocity;
    }
    this.recenterTime -= dt;
    // Hard guarantee (soft shoulder): roll first, then translation within the room the roll leaves,
    // so every output corner maps inside the crop.
    correction[2] = softLimit(correction[2], maxAngle);
    const cos = Math.cos(Math.abs(correction[2])), sin = Math.sin(Math.abs(correction[2]));
    correction[0] = softLimit(correction[0], 0.999 * (0.5 - 0.5 * (cos + sin / aspect) / zoom));
    correction[1] = softLimit(correction[1], 0.999 * (0.5 - 0.5 * (cos + sin * aspect) / zoom));
  }
}
