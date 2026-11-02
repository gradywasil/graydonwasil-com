import { useEffect } from 'react';

/** Wheel delta that counts as one deliberate gesture. */
const WHEEL_THRESHOLD = 60;
/** Trackpad momentum keeps firing long after the fingers lift, so the deck
 *  stops listening briefly once it has committed to a move. */
const WHEEL_LOCK_MS = 520;
/** Accumulated delta decays if the user pauses, so two slow nudges are not
 *  silently added together into one move. */
const WHEEL_IDLE_MS = 180;

function modalOpen(): boolean {
  return !!document.querySelector('[role="dialog"][aria-modal="true"]');
}

/* An open nav menu owns the keyboard — otherwise arrow keys would move the
 * deck out from under the list you are trying to pick from. */
function menuOpen(): boolean {
  return !!document.querySelector('[data-menu-open="true"]');
}

function inTextField(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el?.closest) return false;
  return !!el.closest('textarea, input, [contenteditable="true"]');
}

/* The page does not scroll, so the wheel is free to mean "next slide". It is
 * still translated into discrete moves rather than continuous travel — that is
 * what makes the deck snap instead of drift. */
export function useWheelNav(go: (delta: 1 | -1) => void) {
  useEffect(() => {
    let locked = false;
    let accumulated = 0;
    let idleTimer: number | undefined;
    let unlockTimer: number | undefined;

    const onWheel = (e: WheelEvent) => {
      // A focused nested control can consume a gesture before it reaches the
      // outer deck. This lets the experiment stack hand off at its endpoints.
      if (e.defaultPrevented || modalOpen() || inTextField(e.target)) return;

      const stage = document.querySelector<HTMLElement>('.stage[data-scrollable="true"]');
      if (stage?.contains(e.target as Node)) {
        const canScroll = e.deltaY > 0
          ? stage.scrollTop + stage.clientHeight < stage.scrollHeight - 1
          : stage.scrollTop > 0;
        if (canScroll) return;
      }

      // Nothing to scroll, so suppress overscroll bounce and rubber-banding.
      e.preventDefault();
      if (locked) return;

      accumulated += e.deltaY;
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        accumulated = 0;
      }, WHEEL_IDLE_MS);

      if (Math.abs(accumulated) >= WHEEL_THRESHOLD) {
        go(accumulated > 0 ? 1 : -1);
        accumulated = 0;
        locked = true;
        unlockTimer = window.setTimeout(() => {
          locked = false;
        }, WHEEL_LOCK_MS);
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.clearTimeout(idleTimer);
      window.clearTimeout(unlockTimer);
    };
  }, [go]);
}

export function useKeyNav(go: (delta: 1 | -1) => void, onEscape?: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (inTextField(e.target)) return;

      // A modal or an open menu handles its own Escape; everything else is
      // inert while one of them is up.
      if (modalOpen() || menuOpen()) return;

      const stage = document.querySelector('.stage[data-scrollable="true"]');
      if (stage?.contains(document.activeElement)
        && ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' '].includes(e.key)) return;

      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
        case 'PageDown':
          e.preventDefault();
          go(1);
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault();
          go(-1);
          break;
        case ' ':
          e.preventDefault();
          go(e.shiftKey ? -1 : 1);
          break;
        case 'Escape':
          onEscape?.();
          break;
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, onEscape]);
}
