import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/site.css';
import './styles/hero-variants.css';
import './styles/couch-os.css';
import './styles/cartridges.css';
import './styles/topbar-games.css';
import './styles/topbar-folders.css';
import App from './App.tsx';

/* The old site was a deck with one URL per slide. Those links still exist
 * out in the world, so send each to the matching section of the one page. */
const LEGACY: Array<[RegExp, string]> = [
  [/^\/games\/?$/, 'games'],
  [/^\/(experiments|projects(\/.*)?)\/?$/, 'more'],
  [/^\/(about|contact)\/?$/, 'hello'],
];
const path = window.location.pathname;
if (path !== '/') {
  const hit = LEGACY.find(([re]) => re.test(path));
  history.replaceState(null, '', hit ? `/#${hit[1]}` : '/');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Links into the page (#games/numdrop and the like) are followed by App, once the sections exist.
