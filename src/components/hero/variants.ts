/* The hero stage is being tried several ways. Each has a number so it can be
 * opened directly: add `?hero=3` to the address. */

export type HeroVariant = 'sun' | 'gurpy' | 'home' | 'worlds' | 'screen';

export const HERO_VARIANTS: Array<{ id: HeroVariant; name: string; note: string }> = [
  { id: 'sun', name: 'Sun', note: 'Orbit around a pixel sun in the picked colour' },
  { id: 'gurpy', name: 'Gurpy', note: 'Orbit around a quiet Gurpy: no bubble, no clicks' },
  { id: 'home', name: 'Home screen', note: 'A phone whose apps are the work (the one being built up)' },
  { id: 'worlds', name: 'Worlds', note: 'No orbit: five posters, one per world' },
  { id: 'screen', name: 'Screen', note: 'Orbit around the picked screen (the last attempt)' },
];

export const DEFAULT_HERO: HeroVariant = 'home';

/** Reads `?hero=` as a number (1 to 5) or a name. Only the dev server tries the others: the live site is always the phone. */
export function readHeroVariant(): HeroVariant {
  if (!import.meta.env.DEV) return DEFAULT_HERO;
  const raw = new URLSearchParams(window.location.search).get('hero');
  if (!raw) return DEFAULT_HERO;
  const byNumber = HERO_VARIANTS[Number(raw) - 1];
  return byNumber?.id ?? HERO_VARIANTS.find((v) => v.id === raw)?.id ?? DEFAULT_HERO;
}

export function writeHeroVariant(id: HeroVariant) {
  const url = new URL(window.location.href);
  url.searchParams.set('hero', String(HERO_VARIANTS.findIndex((v) => v.id === id) + 1));
  history.replaceState(null, '', url);
}
