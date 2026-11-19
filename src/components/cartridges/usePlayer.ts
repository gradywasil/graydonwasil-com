import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { CARTRIDGES, KEYS } from '../../data/cartridges';
import { boot, wakeAudio, type GbCore, type PadButton } from '../../lib/gb/core';

/* The console's state: what is switched on, what is held, what is saved.
 *
 * It runs only while it can be seen and played: the game is paused when the
 * console scrolls away or the tab is hidden, and comes back by itself. The
 * keyboard belongs to the game only while it is running, so arrow keys scroll
 * the page again the moment it is paused (Esc), scrolled off, or switched off. */

export type Phase = 'off' | 'loading' | 'on' | 'paused' | 'error';

const SAVE_KEY = (id: string) => `gw-cart-save-${id}`;

function toBase64(bytes: Uint8Array) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

function readSave(id: string): Uint8Array | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY(id));
    return raw ? Uint8Array.from(atob(raw), (c) => c.charCodeAt(0)) : null;
  } catch {
    return null;
  }
}

function hasSave(id: string) {
  try { return localStorage.getItem(SAVE_KEY(id)) !== null; } catch { return false; }
}

const KEY_TO_BUTTON = new Map<string, PadButton>(
  (Object.entries(KEYS) as Array<[PadButton, (typeof KEYS)[PadButton]]>).flatMap(([button, k]) => k.codes.map((c) => [c, button] as const)),
);

/** Typing in a field is never the game's business. */
function isTyping(t: EventTarget | null) {
  const el = t as HTMLElement | null;
  return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable);
}

export function usePlayer(stage: RefObject<HTMLElement | null>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const core = useRef<GbCore | null>(null);
  /** Guards against an older boot finishing after a newer one started. */
  const ticket = useRef(0);

  const [phase, setPhase] = useState<Phase>('off');
  const [message, setMessage] = useState('');
  const [muted, setMuted] = useState(false);
  const [held, setHeld] = useState<ReadonlySet<PadButton>>(new Set());
  const [saved, setSaved] = useState<Record<string, boolean>>(() => Object.fromEntries(CARTRIDGES.map((c) => [c.id, hasSave(c.id)])));
  const [inView, setInView] = useState(true);
  const [tabShown, setTabShown] = useState(() => document.visibilityState !== 'hidden');
  const mutedRef = useRef(false);

  /** Nothing is held down any more (the core lets go of its own buttons when it pauses). */
  const clearHeld = useCallback(() => setHeld((h) => (h.size ? new Set() : h)), []);
  const release = useCallback(() => {
    core.current?.releaseAll();
    clearHeld();
  }, [clearHeld]);

  /** Switch a cartridge on (or restart it): a fresh machine with that cartridge's save, or none if `fresh`. */
  const power = useCallback(async (id: string, fresh = false) => {
    const mine = ++ticket.current;
    core.current?.destroy(!fresh);
    core.current = null;
    release();
    setMessage('');
    setPhase('loading');
    wakeAudio(); // from the press that got us here, or the browser keeps the sound off
    try {
      const next = await boot(id, {
        canvas: canvasRef.current!,
        save: fresh ? null : readSave(id),
        muted: mutedRef.current,
        onSave: (ram) => {
          try {
            localStorage.setItem(SAVE_KEY(id), toBase64(ram));
            setSaved((s) => (s[id] ? s : { ...s, [id]: true }));
          } catch { /* storage full or blocked: the game still plays */ }
        },
      });
      if (mine !== ticket.current) { next.destroy(); return; }
      core.current = next;
      setPhase('on');
    } catch (error) {
      if (mine !== ticket.current) return;
      setMessage(error instanceof Error ? error.message : 'The cartridge would not start.');
      setPhase('error');
    }
  }, [release]);

  const powerOff = useCallback(() => {
    ticket.current++;
    core.current?.destroy();
    core.current = null;
    release();
    setPhase('off');
  }, [release]);

  const togglePause = useCallback(() => {
    clearHeld();
    setPhase((p) => (p === 'on' ? 'paused' : p === 'paused' ? 'on' : p));
  }, [clearHeld]);

  const eraseSave = useCallback((id: string, running: boolean) => {
    try { localStorage.removeItem(SAVE_KEY(id)); } catch { /* nothing to do */ }
    setSaved((s) => ({ ...s, [id]: false }));
    // A running game would write its own copy straight back, so it starts over instead.
    if (running) void power(id, true);
  }, [power]);

  const toggleSound = useCallback(() => {
    const next = !mutedRef.current;
    mutedRef.current = next;
    setMuted(next);
    core.current?.setMuted(next);
  }, []);

  const press = useCallback((button: PadButton, down: boolean) => {
    core.current?.press(button, down);
    setHeld((h) => {
      if (h.has(button) === down) return h;
      const next = new Set(h);
      if (down) next.add(button); else next.delete(button);
      return next;
    });
  }, []);

  // Run only while it can be seen and played.
  const going = phase === 'on' && inView && tabShown;
  useEffect(() => {
    const c = core.current;
    if (!c) return;
    if (going) c.start(); else c.pause();
  }, [going, phase]);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      setInView(e.isIntersecting);
      if (!e.isIntersecting) clearHeld();
    }, { threshold: 0.35 });
    io.observe(el);
    const onVisibility = () => {
      setTabShown(document.visibilityState !== 'hidden');
      clearHeld();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => { io.disconnect(); document.removeEventListener('visibilitychange', onVisibility); };
  }, [stage, clearHeld]);

  // The keyboard.
  useEffect(() => {
    if (phase !== 'on' && phase !== 'paused') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || isTyping(e.target)) return;
      if (e.code === 'Escape') {
        if (e.type === 'keydown' && !e.repeat && (phase === 'paused' || (inView && tabShown))) { togglePause(); e.preventDefault(); }
        return;
      }
      const button = KEY_TO_BUTTON.get(e.code);
      if (!button || phase !== 'on' || !inView) return;
      e.preventDefault();
      if (e.type === 'keydown' && e.repeat) return;
      press(button, e.type === 'keydown');
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);
    window.addEventListener('blur', release);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKey);
      window.removeEventListener('blur', release);
    };
  }, [phase, inView, tabShown, press, release, togglePause]);

  useEffect(() => () => { ticket.current++; core.current?.destroy(); core.current = null; }, []);

  return { canvasRef, phase, message, muted, held, saved, power, powerOff, togglePause, eraseSave, toggleSound, press };
}
