import { PROJECTS, type Project } from '../data/projects';

/* The site is one flat deck. Every destination is a slide in a single
 * sequence, so a wheel tick, a swipe, an arrow key and the nav pill are all
 * doing the same thing — moving an index — rather than three different
 * navigation models wearing the same chrome. */

export type SlideKind = 'hero' | 'games' | 'project' | 'experiments' | 'about' | 'contact';

export interface Slide {
  kind: SlideKind;
  key: string;
  path: string;
  label: string;
  project?: Project;
}

export const SLIDES: Slide[] = [
  { kind: 'hero', key: 'hero', path: '/', label: 'Current work' },
  { kind: 'games', key: 'games', path: '/games', label: 'Games' },
  ...PROJECTS.map(
    (p): Slide => ({
      kind: 'project',
      key: p.id,
      path: `/projects/${p.id}`,
      label: p.title,
      project: p,
    }),
  ),
  { kind: 'experiments', key: 'experiments', path: '/experiments', label: 'Experiments' },
  { kind: 'about', key: 'about', path: '/about', label: 'About' },
  { kind: 'contact', key: 'contact', path: '/contact', label: 'Contact' },
];

export const FIRST_PROJECT_PATH = SLIDES.find((s) => s.kind === 'project')?.path ?? '/';

/** Deeper view for a project, layered over its slide. */
export function detailPath(slug: string): string {
  return `/projects/${slug}/details`;
}

export function isDetailPath(pathname: string): boolean {
  return /^\/projects\/[^/]+\/details\/?$/.test(pathname);
}

/** The slide a URL parks on. A deeper view parks on its own project slide, so
 *  closing it reveals the deck already in the right place. */
export function slideIndexForPath(pathname: string): number {
  const exact = SLIDES.findIndex((s) => s.path === pathname);
  if (exact >= 0) return exact;

  const slug = pathname.match(/^\/projects\/([^/]+)/)?.[1];
  if (slug) {
    const i = SLIDES.findIndex((s) => s.key === slug);
    if (i >= 0) return i;
  }
  return 0;
}

/** Clamped, not wrapped: a deck with a first and last slide is easier to hold
 *  in your head, and the progress rail can then mean something. */
export function clampIndex(i: number): number {
  return Math.min(SLIDES.length - 1, Math.max(0, i));
}

export function isKnownPath(pathname: string): boolean {
  return SLIDES.some((s) => s.path === pathname) || isDetailPath(pathname);
}

/** The footer line for a slide. Kept short — it is a hint, not a caption. */
export function slideNote(slide: Slide): string {
  switch (slide.kind) {
    case 'hero':
      return 'Explore the apps, then scroll or swipe for games and project stories.';
    case 'games':
      return 'Two collections of my browser games. Pick one to start playing in a new tab.';
    case 'project':
      return 'Screens rotate automatically. Open the project to see how it works and why I built it.';
    case 'experiments':
      return 'Pick an experiment to see what it does. Live versions open in a new tab.';
    case 'about':
      return 'Most projects start with a problem I want solved.';
    case 'contact':
      return 'It goes to my inbox. I read every message.';
  }
}

/** Which nav item reads as current for a given slide. */
export function navKeyFor(slide: Slide): string | null {
  if (['hero', 'games', 'project', 'experiments'].includes(slide.kind)) return 'work';
  if (slide.kind === 'about') return 'about';
  if (slide.kind === 'contact') return 'contact';
  return null;
}

/** The project a deeper-view URL refers to. Read from the path rather than
 *  useParams, because the deck renders one shell for every URL and there are
 *  no <Route> elements to supply params. */
export function detailSlug(pathname: string): string | null {
  return pathname.match(/^\/projects\/([^/]+)\/details\/?$/)?.[1] ?? null;
}
