import raw from './games.json';

/* Game branding comes straight from the Gurpy Games site. Regenerate
 * games.json and src/assets/games/ with `python scripts/sync-games.py`. */

const files = import.meta.glob<string>('../assets/games/*/*.webp', { eager: true, import: 'default' });

interface RawImage { file: string; w: number; h: number; pixel: boolean; }
interface RawFloater extends RawImage { x: number; y: number; size: number; r: number; depth: number; speed: number; kind: string; }

export interface GameImage { src: string; w: number; h: number; pixel: boolean; }
export interface Floater extends GameImage { x: number; y: number; size: number; r: number; depth: number; speed: number; }

export interface Game {
  id: string;
  title: string;
  url: string;
  kicker: string;
  tag: string;
  hook: string[];
  description: string;
  cta: string;
  theme: { bg: string; a: string; b: string };
  frame: 'browser' | 'phone';
  stats: Array<[string, string]>;
  chips: string[];
  comment?: string;
  shotAlt: string;
  shot: GameImage;
  thumb: GameImage;
  logo: (GameImage & { alt: string }) | null;
  orbit: GameImage | null;
  host: string;
}

const img = (id: string, r: RawImage): GameImage => ({
  src: files[`../assets/games/${id}/${r.file}`], w: r.w, h: r.h, pixel: r.pixel,
});

type RawGame = Omit<Game, 'shot' | 'thumb' | 'logo' | 'orbit' | 'host' | 'floaters' | 'comment'> & {
  comment?: string | null;
  shot: RawImage; thumb: RawImage; logo: (RawImage & { alt: string }) | null; orbit: RawImage | null;
  floaters: RawFloater[];
};

export const GAMES: Array<Game & { floaters: Floater[] }> = (raw as unknown as RawGame[]).map((g) => ({
  ...g,
  comment: g.comment ?? undefined,
  host: new URL(g.url).host,
  shot: img(g.id, g.shot),
  thumb: img(g.id, g.thumb),
  logo: g.logo ? { ...img(g.id, g.logo), alt: g.logo.alt } : null,
  orbit: g.orbit ? img(g.id, g.orbit) : null,
  floaters: g.floaters.map((f) => ({
    ...img(g.id, f),
    x: f.x, y: f.y, size: f.size, r: f.r, depth: f.depth, speed: f.speed,
  })),
}));

export const gameById = (id: string) => GAMES.find((g) => g.id === id) ?? GAMES[0];
