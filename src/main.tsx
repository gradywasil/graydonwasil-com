import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/site.css';
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

// Hash targets render after React mounts, so jump once they exist.
if (window.location.hash) {
  const id = window.location.hash.slice(1);
  requestAnimationFrame(() => requestAnimationFrame(() =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'instant' })));
}
