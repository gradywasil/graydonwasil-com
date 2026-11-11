import { useLayoutEffect, useRef } from 'react';

/* Stages an element's entrance every time it scrolls into view. While it is
 * off screen it carries `data-armed` (CSS hides what will animate); once most
 * of it is on screen it also carries `data-in` (CSS plays the entrance); when
 * it has left the screen completely `data-in` comes off, so the next visit
 * plays again, from either direction. It does not matter where the page was
 * scrolled to when it loaded. Under reduced motion nothing is marked, so the
 * default state is always the finished one. */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    el.setAttribute('data-armed', '');
    const io = new IntersectionObserver(([e]) => {
      if (e.intersectionRatio >= 0.6) el.setAttribute('data-in', '');
      else if (!e.isIntersecting) el.removeAttribute('data-in');
    }, { threshold: [0, 0.6] });
    io.observe(el);
    return () => {
      io.disconnect();
      el.removeAttribute('data-armed');
      el.removeAttribute('data-in');
    };
  }, []);
  return ref;
}
