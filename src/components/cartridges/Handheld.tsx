import { useRef, type CSSProperties, type PointerEvent, type ReactNode, type RefObject } from 'react';
import type { Cartridge } from '../../data/cartridges';
import { KEYS } from '../../data/cartridges';
import { SCREEN_H, SCREEN_W, type PadButton } from '../../lib/gb/core';
import type { Phase } from './usePlayer';

/* The handheld: a portrait console with the cartridge standing in its slot, a
 * screen, a D-pad, A and B, Select and Start. It is both the display and the
 * touch controls, so on a phone it is the whole interface. Pressing a button on
 * it and pressing its key do the same thing and light it the same way.
 *
 * Everything is sized in container units (cqw), so it is one drawing at any width. */

const D_PAD: PadButton[] = ['up', 'down', 'left', 'right'];
/** Past this fraction of the pad's half-width a press counts as a direction. */
const DEAD_ZONE = 0.25;
/** tan(22.5 degrees): how far off an axis a press may be and still count on that axis. */
const DIAGONAL = 0.414;

function buzz() {
  // A small tick for a thumb on a phone that can do it. Desktop and iPhone do nothing.
  try { navigator.vibrate?.(7); } catch { /* not allowed here */ }
}

function Button({ id, label, held, onButton, className, children }: {
  id: PadButton;
  label: string;
  held: boolean;
  onButton: (b: PadButton, down: boolean) => void;
  className: string;
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      className={`hh-btn ${className}`}
      data-held={held ? '' : undefined}
      aria-label={label}
      tabIndex={-1}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        if (e.pointerType === 'touch') buzz();
        onButton(id, true);
      }}
      onPointerUp={() => onButton(id, false)}
      onPointerCancel={() => onButton(id, false)}
      onLostPointerCapture={() => onButton(id, false)}
      onContextMenu={(e) => e.preventDefault()}
    >
      {children}
    </button>
  );
}

function DPad({ held, onButton }: { held: ReadonlySet<PadButton>; onButton: (b: PadButton, down: boolean) => void }) {
  // What this pad itself is holding down. Kept here, not read back from `held`, because a
  // release can arrive before the page has redrawn from the press before it.
  const mine = useRef(new Set<PadButton>());

  const read = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 2 - 1;
    const y = ((e.clientY - r.top) / r.height) * 2 - 1;
    const ax = Math.abs(x), ay = Math.abs(y), m = Math.max(ax, ay);
    const on = new Set<PadButton>();
    if (m > DEAD_ZONE) {
      if (ax / m > DIAGONAL && ax > DEAD_ZONE) on.add(x < 0 ? 'left' : 'right');
      if (ay / m > DIAGONAL && ay > DEAD_ZONE) on.add(y < 0 ? 'up' : 'down');
    }
    for (const d of D_PAD) {
      if (on.has(d) === mine.current.has(d)) continue;
      if (on.has(d)) mine.current.add(d); else mine.current.delete(d);
      onButton(d, on.has(d));
    }
  };
  const release = () => {
    for (const d of mine.current) onButton(d, false);
    mine.current.clear();
  };

  return (
    <div
      className="hh-dpad"
      role="group"
      aria-label="D-pad"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        if (e.pointerType === 'touch') buzz();
        read(e);
      }}
      onPointerMove={(e) => { if (e.currentTarget.hasPointerCapture(e.pointerId)) read(e); }}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={release}
      onContextMenu={(e) => e.preventDefault()}
    >
      {D_PAD.map((d) => (
        <i key={d} className={`hh-arrow hh-${d}`} data-held={held.has(d) ? '' : undefined} aria-hidden="true" />
      ))}
      <span className="hh-key hh-key-pad" aria-hidden="true">WASD</span>
    </div>
  );
}

export function Handheld({ cart, phase, message, held, canvasRef, onButton, onPower, onResume }: {
  cart: Cartridge;
  phase: Phase;
  message: string;
  held: ReadonlySet<PadButton>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  onButton: (b: PadButton, down: boolean) => void;
  onPower: () => void;
  onResume: () => void;
}) {
  const on = phase === 'on' || phase === 'paused';
  const btn = (id: PadButton, label: string, className: string) => (
    <Button id={id} label={label} held={held.has(id)} onButton={onButton} className={className} />
  );

  return (
    <div className="hh" data-phase={phase}>
      <div className="hh-slot" aria-hidden="true">
        <div className="hh-cart" key={cart.id} style={{ '--cart': cart.colour, '--cart-ink': cart.ink } as CSSProperties}>
          <span>{cart.title}</span>
        </div>
      </div>

      <div className="hh-shell">
        <div className="hh-bezel">
          <div className="hh-bezel-top" aria-hidden="true">
            <i className="hh-led" data-on={phase === 'on' ? '' : undefined} />
            <span>{phase === 'on' ? 'Running' : phase === 'paused' ? 'Paused' : 'Power'}</span>
          </div>
          <div className="hh-lcd">
            <canvas
              ref={canvasRef}
              className="hh-canvas"
              width={SCREEN_W}
              height={SCREEN_H}
              role="img"
              aria-label={on ? `${cart.title}, running` : `${cart.title}, switched off`}
            />
            {!on && <img className="hh-still" src={cart.art} alt="" width={SCREEN_W} height={SCREEN_H} />}

            <div className="hh-overlay" data-kind={phase} aria-live="polite">
              {phase === 'off' && (
                <button type="button" className="hh-power" onClick={onPower}>
                  <span className="hh-power-icon" aria-hidden="true" />
                  Power on
                </button>
              )}
              {phase === 'loading' && <p className="hh-say">Loading cartridge<span className="hh-dots" aria-hidden="true" /></p>}
              {phase === 'paused' && (
                <button type="button" className="hh-power hh-resume" onClick={onResume}>
                  Paused
                  <small>Tap or press Esc</small>
                </button>
              )}
              {phase === 'error' && (
                <div className="hh-fail">
                  <p>{message}</p>
                  <button type="button" className="hh-power" onClick={onPower}>Try again</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="hh-pad">
          <DPad held={held} onButton={onButton} />

          <div className="hh-ab">
            <div className="hh-ab-set">
              {btn('b', 'B', 'hh-b')}
              {btn('a', 'A', 'hh-a')}
              <span className="hh-cap hh-cap-b" aria-hidden="true">B<span className="hh-key">{KEYS.b.label}</span></span>
              <span className="hh-cap hh-cap-a" aria-hidden="true">A<span className="hh-key">{KEYS.a.label}</span></span>
            </div>
          </div>

          <div className="hh-ss">
            {btn('select', 'Select', 'hh-select')}
            {btn('start', 'Start', 'hh-start')}
            <span className="hh-cap hh-cap-select" aria-hidden="true">Select<span className="hh-key">{KEYS.select.label}</span></span>
            <span className="hh-cap hh-cap-start" aria-hidden="true">Start<span className="hh-key">{KEYS.start.label}</span></span>
          </div>

          <i className="hh-grille" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
