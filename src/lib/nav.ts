import { FIRST_PROJECT_PATH } from './deck';

export interface ViewDef {
  key: string;
  path: string;
  label: string;
}

/* Work opens its project menu; About and Contact jump to their slides. */
export const VIEWS: ViewDef[] = [
  { key: 'work', path: FIRST_PROJECT_PATH, label: 'Work' },
  { key: 'about', path: '/about', label: 'About' },
  { key: 'contact', path: '/contact', label: 'Contact' },
];
