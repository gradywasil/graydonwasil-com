import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { GurpyFace } from './GurpyFace';

/* Gurpy peeks over the zigzag edge of a section as it scrolls into the middle
 * of the screen: up to his eyes, a look around, and back down. He comes up in
 * the gap above the edge, behind its teeth, so he never sits on content, and
 * he is not a control. Bring the pointer close and he ducks. Not rendered
 * under reduced motion. */

const HOSTS = ['games', 'more', 'hello'];
const WAIT_MS = 320;
const STAY_MS = 2800;
const DUCK_MS = 260;
/** After a peek, the same edge stays quiet for this long. */
const REST_MS = 9000;
const SHY_PX = 110;

interface Peek { host: string; x: number; up: boolean }

export function GurpyPeek() {
  const [peek, setPeek] = useState<Peek | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hosts = HOSTS.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    const rested = new Map<string, number>();
    let active: string | null = null;
    let up = false;
    let wait = 0;
    let stay = 0;
    let gone = 0;
    let queued = 0;

    /** Is this section's top edge in the middle band of the screen? */
    const inBand = (el: HTMLElement, lo: number, hi: number) => {
      const y = el.getBoundingClientRect().top / window.innerHeight;
      return y > lo && y < hi;
    };

    function duck() {
      if (!active || !up) return;
      up = false;
      clearTimeout(stay);
      rested.set(active, performance.now());
      setPeek((p) => (p ? { ...p, up: false } : p));
      // Once he is down, another edge may already be waiting.
      gone = window.setTimeout(() => { active = null; setPeek(null); check(); }, DUCK_MS);
    }

    function check() {
      queued = 0;
      if (active) {
        const el = document.getElementById(active);
        if (el && !inBand(el, 0.1, 0.96)) {
          if (up) duck();
          else { clearTimeout(wait); active = null; setPeek(null); }
        }
        return;
      }
      const now = performance.now();
      const host = hosts.find((el) => inBand(el, 0.3, 0.86) && now - (rested.get(el.id) ?? -REST_MS) >= REST_MS);
      if (!host) return;
      active = host.id;
      setPeek({ host: host.id, x: 10 + Math.random() * 72, up: false });
      // Only if the edge is still around a moment later: not while flying past.
      wait = window.setTimeout(() => {
        up = true;
        setPeek((p) => (p ? { ...p, up: true } : p));
        stay = window.setTimeout(duck, STAY_MS);
      }, WAIT_MS);
    }

    const onScroll = () => { if (!queued) queued = requestAnimationFrame(check); };
    const onMove = (e: PointerEvent) => {
      const box = boxRef.current;
      if (!up || !box || e.pointerType !== 'mouse') return;
      const r = box.getBoundingClientRect();
      if (Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)) < SHY_PX) duck();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(queued);
      [wait, stay, gone].forEach(clearTimeout);
    };
  }, []);

  const host = peek && document.getElementById(peek.host);
  if (!peek || !host) return null;
  return createPortal(
    <div className="peek" ref={boxRef} style={{ left: `${peek.x}%` }} data-up={peek.up || undefined} aria-hidden="true">
      <GurpyFace />
    </div>,
    host,
  );
}
