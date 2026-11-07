import { EFFECTS, type Effect, type Settings } from './renderer';
import { findPalette, paletteMapping } from './palettes';
import type { SavedPreset } from './presets';

/**
 * Built-in starters, shown alongside the user's own presets. They are never stored and use the
 * same SavedPreset shape, so applying and previewing share one code path.
 *
 *   Look  = Style + Palette.  A look replaces both.
 *   Style = effect + contrast, exposure and pixel size. A style keeps the active palette.
 *
 * A look's color mapping follows its palette: gradients map brightness, color sets match colors.
 */
export type LookTheme = 'retro' | 'print' | 'film' | 'neon' | 'art' | 'nature';
export const LOOK_THEMES: ReadonlyArray<{ id: LookTheme; label: string }> = [
  { id: 'retro', label: 'Retro tech' },
  { id: 'print', label: 'Print' },
  { id: 'film', label: 'Film' },
  { id: 'neon', label: 'Night & neon' },
  { id: 'art', label: 'Art' },
  { id: 'nature', label: 'Nature' },
];

type StyleDef = [id: string, name: string, effect: Effect, contrast: number, exposure: number, pixelSize: number];
type LookDef = [id: string, name: string, theme: LookTheme, effect: Effect, contrast: number, exposure: number, pixelSize: number, palette: string];

/** Tuned variants of each effect. Listed in effect order so the Style rail can place each beside its effect. */
const STYLES: StyleDef[] = [
  ['chunky', 'Chunky', 'bayer', 1.3, 0, 8],
  ['checker', 'Checkerboard', 'bayer2', 1.25, 0, 5],
  ['silk', 'Silk', 'bayer8', 1, 0.02, 2],
  ['fine-grain', 'Fine grain', 'bluenoise', 1.1, 0, 2],
  ['pushed-film', 'Pushed film', 'noise', 1.5, -0.04, 3],
  ['punchy', 'Punchy', 'atkinson', 1.6, -0.02, 4],
  ['soft', 'Soft diffusion', 'floyd', 0.9, 0.05, 3],
  ['mosaic', 'Mosaic', 'floyd', 1.2, 0, 7],
  ['fine-detail', 'Fine detail', 'stucki', 1.15, 0.02, 2],
  ['big-dots', 'Big dots', 'halftone', 1.2, 0.03, 6],
  ['fine-screen', 'Fine screen', 'halftone', 1.1, 0, 2],
  ['funnies', 'Funnies', 'newsprint', 1.3, 0.05, 4],
  ['sketch', 'Sketch', 'crosshatch', 1.35, 0.06, 3],
  ['heavy-ink', 'Heavy ink', 'crosshatch', 1.7, -0.06, 4],
  ['fine-line', 'Fine line', 'engrave', 1.4, 0, 2],
  ['big-stitch', 'Big stitch', 'stitch', 1.1, 0.04, 8],
  ['tube-glow', 'Tube glow', 'crt', 1.1, 0.06, 4],
  ['cabinet', 'Cabinet', 'crt', 1.3, 0, 6],
  ['pocket-lcd', 'Pocket LCD', 'lcd', 1.2, 0.02, 5],
  ['worn-tape', 'Worn tape', 'vhs', 0.9, 0.08, 4],
  ['big-type', 'Big type', 'ascii', 1.3, 0.04, 8],
  ['small-type', 'Small type', 'asciisoft', 1.2, 0.02, 2],
  ['cut-paper', 'Cut paper', 'threshold', 1.4, 0, 4],
  ['screen-print', 'Screen print', 'posterize', 1.3, 0.02, 3],
  ['neon-lines', 'Neon lines', 'edges', 1.8, 0, 2],
  ['relief', 'Deep relief', 'emboss', 1.4, 0, 3],
  ['negative', 'Film negative', 'invert', 1.1, 0, 3],
];

const LOOKS: LookDef[] = [
  ['pocket-camera', 'Pocket camera', 'retro', 'bayer', 1.2, 0, 4, 'pocket'],
  ['handheld', 'Handheld', 'retro', 'lcd', 1.15, 0.04, 4, 'pocket'],
  ['fantasy-console', 'Fantasy console', 'retro', 'bayer', 1.15, 0.02, 4, 'fantasy-16'],
  ['breadbin', 'Breadbin', 'retro', 'bayer', 1.1, 0, 5, 'breadbin-16'],
  ['living-room', 'Living room', 'retro', 'posterize', 1.2, 0, 4, 'living-room-16'],
  ['dos-game', 'DOS game', 'retro', 'floyd', 1.1, 0, 3, 'dos-16'],
  ['classic-desktop', 'Classic desktop', 'retro', 'atkinson', 1.1, 0.02, 3, 'desktop-16'],
  ['paint-program', 'Paint program', 'retro', 'atkinson', 1.15, 0.02, 3, 'binary-true'],
  ['cga-game', 'CGA game', 'retro', 'bayer', 1.25, 0, 4, 'cga-bright'],
  ['teletext', 'Teletext', 'retro', 'bayer2', 1.2, 0, 6, 'teletext'],
  ['arcade-crt', 'Arcade CRT', 'retro', 'crt', 1.2, 0.04, 3, 'arcade-spectrum'],
  ['green-screen', 'Green screen', 'retro', 'ascii', 1.4, 0.06, 4, 'phosphor'],
  ['amber-terminal', 'Amber terminal', 'retro', 'asciisoft', 1.3, 0.04, 3, 'amber-mono'],
  ['red-visor', 'Red visor', 'retro', 'bayer8', 1.3, 0, 3, 'red-visor'],

  ['newspaper', 'Newspaper', 'print', 'halftone', 1.3, 0.04, 3, 'mono'],
  ['riso', 'Riso print', 'print', 'newsprint', 1.1, 0.04, 3, 'riso-pop'],
  ['overprint', 'Overprint', 'print', 'halftone', 1.1, 0.02, 4, 'riso-overprint'],
  ['comic-book', 'Comic book', 'print', 'newsprint', 1.3, 0.05, 3, 'ben-day'],
  ['pop-art', 'Pop art', 'print', 'halftone', 1.25, 0.02, 5, 'pop-art'],
  ['woodblock', 'Woodblock', 'print', 'posterize', 1.2, 0, 3, 'woodblock'],
  ['etching', 'Etching', 'print', 'engrave', 1.3, 0, 3, 'sepia'],
  ['banknote', 'Banknote', 'print', 'engrave', 1.4, 0, 2, 'mint'],
  ['blueprint', 'Blueprint', 'print', 'edges', 1.6, 0, 3, 'blueprint'],
  ['receipt', 'Receipt', 'print', 'atkinson', 1.4, 0.04, 2, 'thermal-paper'],

  ['slide-show', 'Slide show', 'film', 'bluenoise', 1.05, 0.02, 2, 'slide-film-16'],
  ['instant-print', 'Instant print', 'film', 'noise', 1, 0.06, 2, 'instant-16'],
  ['studio-portrait', 'Studio portrait', 'film', 'floyd', 1, 0.02, 2, 'portrait-16'],
  ['darkroom', 'Darkroom', 'film', 'bayer8', 1.1, 0, 2, 'split-16'],
  ['old-photo', 'Old photograph', 'film', 'noise', 1.2, 0, 3, 'sepia'],
  ['cyanotype', 'Cyanotype', 'film', 'stucki', 1.2, 0, 2, 'cyanotype'],
  ['home-video', 'Home video', 'film', 'vhs', 1, 0.04, 3, 'slide-film-16'],
  ['night-tape', 'Night tape', 'film', 'vhs', 1.2, 0.08, 3, 'after-hours'],

  ['neon-city', 'Neon city', 'neon', 'bayer8', 1.3, -0.02, 3, 'neon-city-16'],
  ['vapor-mall', 'Vapor mall', 'neon', 'crt', 1.25, 0, 3, 'vapor-16'],
  ['heat-camera', 'Heat camera', 'neon', 'bluenoise', 1.2, 0, 3, 'thermal-16'],
  ['night-drive', 'Night drive', 'neon', 'edges', 1.7, 0, 2, 'night-drive'],
  ['acid-house', 'Acid house', 'neon', 'threshold', 1.3, 0, 3, 'acid-rush'],

  ['stained-glass', 'Stained glass', 'art', 'posterize', 1.2, 0, 5, 'stained-glass'],
  ['crayon', 'Crayon drawing', 'art', 'crosshatch', 1.2, 0.04, 3, 'crayon-16'],
  ['gouache', 'Gouache', 'art', 'floyd', 1.05, 0, 3, 'gouache-16'],
  ['memphis', 'Memphis', 'art', 'bayer2', 1.2, 0, 5, 'memphis'],
  ['tarot', 'Tarot card', 'art', 'engrave', 1.2, 0.02, 3, 'tarot'],
  ['stitched', 'Stitched', 'art', 'stitch', 1.1, 0.04, 4, 'wildflower'],
  ['sunset-poster', 'Sunset poster', 'art', 'posterize', 1.25, 0.02, 4, 'sunset-drive'],

  ['aurora', 'Aurora', 'nature', 'bayer8', 1.1, 0, 2, 'aurora-16'],
  ['garden', 'Garden', 'nature', 'stucki', 1.1, 0, 3, 'garden-16'],
  ['coral-reef', 'Coral reef', 'nature', 'bluenoise', 1.1, 0, 3, 'reef-16'],
  ['autumn-walk', 'Autumn walk', 'nature', 'atkinson', 1.1, 0, 3, 'autumn-16'],
  ['jungle', 'Jungle', 'nature', 'floyd', 1.1, 0, 4, 'jungle'],
];

export interface StarterPreset extends SavedPreset {
  /** Looks only: the browse group. */
  theme?: LookTheme;
  /** Looks only: the built-in palette the look brings. */
  paletteId?: string;
}

const OPTIONS: SavedPreset['options'] = { photoStyle: 'single', stabilization: 'off', mirrorSelfiePreview: true, appTheme: 'dark' };
const threshold = (exposure: number) => Math.round((0.5 - exposure) * 100) / 100;
const known = (effect: Effect) => EFFECTS.some(item => item.id === effect);

/** Built-in styles, which carry the current palette so previews show them in the user's colors. */
export function starterStyles(current: Settings): StarterPreset[] {
  return STYLES.filter(([, , effect]) => known(effect)).map(([id, name, effect, contrast, exposure, pixelSize]) => ({
    id: `starter-${id}`, kind: 'style', name, createdAt: 0, options: OPTIONS,
    settings: { effect, contrast, threshold: threshold(exposure), pixelSize, palette: [...current.palette], mapping: current.mapping ?? 'tone' },
  }));
}

export function starterLooks(): StarterPreset[] {
  return LOOKS.flatMap(([id, name, theme, effect, contrast, exposure, pixelSize, paletteId]) => {
    const palette = findPalette(paletteId);
    if (!palette || !known(effect)) return [];
    return [{ id: `starter-${id}`, kind: 'look', name, createdAt: 0, options: OPTIONS, theme, paletteId: palette.id,
      settings: { effect, contrast, threshold: threshold(exposure), pixelSize, palette: [...palette.colors], mapping: paletteMapping(palette) } }];
  });
}

/** Every starter: looks first, then styles. */
export function starterPresets(current: Settings): StarterPreset[] {
  return [...starterLooks(), ...starterStyles(current)];
}
export const isStarter = (preset: SavedPreset) => preset.id.startsWith('starter-');
