/** Interface themes. Ids are persisted in settings and saved looks — never rename an id. */
export type AppTheme = 'dark' | 'classic' | 'pocket' | 'arcade' | 'terminal' | 'candy';

export interface ThemeInfo {
  id: AppTheme;
  name: string;
  blurb: string;
  /** Swatches for the theme picker card: background, panel, ink, accent. */
  swatch: [string, string, string, string];
  /** Android status-bar / browser chrome color. */
  chrome: string;
}

export const THEMES: readonly ThemeInfo[] = [
  { id: 'dark', name: 'Graphite', blurb: 'Studio black, signal orange', swatch: ['#121211', '#1d1d1b', '#efede4', '#ff6b1f'], chrome: '#121211' },
  { id: 'classic', name: 'Classic', blurb: 'Paper white, one bit of ink', swatch: ['#f4f2ea', '#ffffff', '#111111', '#111111'], chrome: '#f4f2ea' },
  { id: 'pocket', name: 'Pocket', blurb: 'Pea-green handheld LCD', swatch: ['#9bab70', '#b4c38a', '#1f2b14', '#30461f'], chrome: '#9bab70' },
  { id: 'arcade', name: 'Arcade', blurb: 'Midnight cabinet, neon trim', swatch: ['#0f1230', '#1a1f48', '#f6f0ff', '#46e6d6'], chrome: '#0f1230' },
  { id: 'terminal', name: 'Terminal', blurb: 'Amber phosphor on black', swatch: ['#0b0a07', '#17140c', '#ffcf7a', '#ffb000'], chrome: '#0b0a07' },
  { id: 'candy', name: 'Candy', blurb: 'Bubblegum pastels', swatch: ['#fbe4ef', '#fff4f9', '#43215e', '#ff4f9a'], chrome: '#fbe4ef' },
];

export const isTheme = (value: unknown): value is AppTheme => THEMES.some(theme => theme.id === value);
