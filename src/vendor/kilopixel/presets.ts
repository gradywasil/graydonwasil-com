import { EFFECTS, isMapping, type Settings } from './renderer';
import type { StabilizationLevel } from './stabilizer';
import { isTheme, type AppTheme } from './themes';

export const MAX_SAVED_PRESETS = 50;
export const MAX_PRESET_NAME = 40;
const STORAGE_KEY = '1bit-saved-presets';

export interface SavedPreset {
  id: string;
  /** look = effect + adjustments + palette; style = effect + adjustments; palette = colors + mapping. */
  kind: 'look' | 'style' | 'palette';
  name: string;
  createdAt: number;
  settings: Settings;
  options: {
    photoStyle: 'single' | 'burst';
    stabilization: StabilizationLevel;
    mirrorSelfiePreview: boolean;
    appTheme: AppTheme;
  };
}

const record = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const bounded = (value: unknown, min: number, max: number): value is number => typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;

function parseSavedPreset(value: unknown): SavedPreset | null {
  if (!record(value) || value.kind !== 'look' && value.kind !== 'style' && value.kind !== 'palette'
    || typeof value.id !== 'string' || !value.id.trim() || value.id.length > 100
    || typeof value.name !== 'string' || !value.name.trim() || value.name.trim().length > MAX_PRESET_NAME
    || /[\u0000-\u001f\u007f]/.test(value.name) || !bounded(value.createdAt, 0, Number.MAX_SAFE_INTEGER)
    || !record(value.settings) || !record(value.options)) return null;
  const settings = value.settings, options = value.options;
  if (!EFFECTS.some(effect => effect.id === settings.effect)
    || !bounded(settings.contrast, 0.5, 2.5) || !bounded(settings.threshold, 0, 1)
    || !bounded(settings.pixelSize, 2, 12) || !Number.isInteger(settings.pixelSize)
    || !Array.isArray(settings.palette) || ![2, 4, 6, 8, 16].includes(settings.palette.length)
    || !settings.palette.every(color => typeof color === 'string' && /^#[\da-f]{6}$/i.test(color))
    || settings.mapping !== undefined && !isMapping(settings.mapping)
    || options.photoStyle !== 'single' && options.photoStyle !== 'burst'
    || options.stabilization !== 'off' && options.stabilization !== 'light' && options.stabilization !== 'strong'
    || typeof options.mirrorSelfiePreview !== 'boolean'
    || !isTheme(options.appTheme)) return null;
  return {
    id: value.id, kind: value.kind, name: value.name.trim(), createdAt: value.createdAt,
    settings: {
      effect: settings.effect as Settings['effect'], contrast: settings.contrast, threshold: settings.threshold,
      pixelSize: settings.pixelSize, palette: settings.palette.map(color => color.toLowerCase()), mapping: settings.mapping ?? 'tone',
    },
    options: {
      photoStyle: options.photoStyle, stabilization: options.stabilization,
      mirrorSelfiePreview: options.mirrorSelfiePreview, appTheme: options.appTheme as AppTheme,
    },
  };
}

/** Stored order is most recently saved first, including updates to existing looks. */
export function loadSavedPresets(storage?: Pick<Storage, 'getItem'>): SavedPreset[] {
  try {
    const stored: unknown = JSON.parse((storage ?? localStorage).getItem(STORAGE_KEY) ?? 'null');
    if (!record(stored) || stored.version !== 1 || !Array.isArray(stored.presets)) return [];
    const looks: SavedPreset[] = [];
    for (const value of stored.presets) {
      const look = parseSavedPreset(value);
      if (look && !looks.some(existing => existing.id === look.id)) looks.push(look);
      if (looks.length === MAX_SAVED_PRESETS) break;
    }
    return looks;
  } catch { return []; }
}

export function saveSavedPresets(looks: readonly SavedPreset[], storage?: Pick<Storage, 'setItem'>): void {
  const validated = looks.map(parseSavedPreset);
  if (looks.length > MAX_SAVED_PRESETS || validated.some(look => !look)
    || new Set(looks.map(look => look.id)).size !== looks.length) throw new Error('The saved looks contain invalid settings.');
  try { (storage ?? localStorage).setItem(STORAGE_KEY, JSON.stringify({ version: 1, presets: validated })); }
  catch { throw new Error('Your looks could not be saved on this device. Free some storage or allow browser storage, then try again.'); }
}

export function upsertSavedPreset(looks: readonly SavedPreset[], value: SavedPreset): SavedPreset[] {
  const look = parseSavedPreset(value);
  if (!look) throw new Error(`Choose a name of 1–${MAX_PRESET_NAME} characters and valid look settings.`);
  const remaining = removeSavedPreset(looks, look.id);
  if (remaining.length >= MAX_SAVED_PRESETS) throw new Error(`You can save ${MAX_SAVED_PRESETS} looks. Delete one before saving another.`);
  return [look, ...remaining];
}

export function removeSavedPreset(looks: readonly SavedPreset[], id: string): SavedPreset[] {
  return looks.filter(look => look.id !== id).map(look => {
    const copy = parseSavedPreset(look);
    if (!copy) throw new Error('The saved looks contain invalid settings.');
    return copy;
  });
}
