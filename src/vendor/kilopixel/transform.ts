/**
 * A per-frame geometric correction applied while sampling the renderer's center crop.
 *
 * Coordinates are image-space with y pointing DOWN. `q` is an output position normalized to
 * [-0.5, 0.5]² (top-left = (-0.5, -0.5)). The output pixel at `q` samples the source's center
 * crop (also normalized to [-0.5, 0.5]², y down) at `mapOutputToCrop(q)`.
 *
 * x, y   translation in fractions of the crop's width / height
 * angle  rotation in radians, applied in output pixel space (aspect-correct)
 * zoom   >= 1; values above 1 magnify (sample a smaller central region)
 */
export type FrameTransform = { x: number; y: number; angle: number; zoom: number };

export const IDENTITY_TRANSFORM: Readonly<FrameTransform> = Object.freeze({ x: 0, y: 0, angle: 0, zoom: 1 });

/** Reference mapping shared by the renderer (GPU and CPU paths) and the stabilizer's tests. */
export function mapOutputToCrop(qx: number, qy: number, t: FrameTransform, width: number, height: number): [number, number] {
  const px = qx * width, py = qy * height;
  const cos = Math.cos(t.angle), sin = Math.sin(t.angle);
  const rx = (px * cos - py * sin) / t.zoom;
  const ry = (px * sin + py * cos) / t.zoom;
  return [rx / width + t.x, ry / height + t.y];
}

export const isIdentity = (t?: FrameTransform) => !t || (t.x === 0 && t.y === 0 && t.angle === 0 && t.zoom === 1);
