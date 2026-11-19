import { useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { CARTRIDGES, KEYS, cartridgeById, type Cartridge } from '../data/cartridges';
import type { PadButton } from '../lib/gb/core';
import { burst } from '../lib/juice';
import { useReveal } from '../lib/useReveal';
import { Handheld } from './cartridges/Handheld';
import { usePlayer } from './cartridges/usePlayer';
import { Split } from './Split';

/* The cartridges section: the Game Boy Color games made for the ModRetro
 * Chromatic, running from their real ROMs in a handheld you can play with the
 * keyboard or with your thumbs. The shelf is the four cartridges; picking one
 * stands it in the console. The emulator is only fetched when someone presses
 * power. Which cartridge is in the console lives in App, so the top bar can wear it.
 *
 * Desktop: the console on the left, and on the right the shelf over a card that
 * runs down to the console's own bottom edge, with the keyboard drawn as keycaps
 * along it (they press down as you press the real keys). A phone has no keys, so
 * it gets the plain list of what each button does. */

const THEME = (c: Cartridge) => ({ '--cart': c.colour, '--cart-ink': c.ink }) as CSSProperties;

type Control = Cartridge['controls'][number]['button'];

function Glyph({ button }: { button: Control }) {
  if (button === 'dpad') return <b className="ct-glyph" data-b="dpad" aria-label="D-pad" />;
  if (button === 'a' || button === 'b') return <b className="ct-glyph" data-b={button}>{button.toUpperCase()}</b>;
  return <b className="ct-glyph" data-b="pill">{button === 'start' ? 'Start' : 'Select'}</b>;
}

/** The name of the console button a key works, printed small on the cap. */
const SUB: Partial<Record<PadButton, string>> = { a: 'A', b: 'B', start: 'Start', select: 'Select' };

function KeyCap({ button, held }: { button: PadButton; held: boolean }) {
  const key = KEYS[button];
  return (
    <kbd className="kc" data-held={held ? '' : undefined} data-wide={key.label.length > 1 ? '' : undefined}>
      <span>{key.label}</span>
      {SUB[button] && <small>{SUB[button]}</small>}
    </kbd>
  );
}

const PAD_KEYS = ['up', 'left', 'down', 'right'] as const;

export function Cartridges({ id, onPick }: {
  /** The cartridge in the console. */
  id: string;
  onPick: (id: string) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const cart = cartridgeById(id);
  const title = useReveal<HTMLHeadingElement>();
  const stage = useRef<HTMLDivElement>(null);
  const player = usePlayer(stage);
  const on = player.phase === 'on' || player.phase === 'paused';

  const pick = (next: Cartridge, e: MouseEvent<HTMLElement>) => {
    if (next.id === id) return;
    onPick(next.id);
    setConfirming(false);
    // Pressing a cartridge while one is running is also pressing power for the new one.
    if (player.phase !== 'off') void player.power(next.id);
    const r = e.currentTarget.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + 14, [next.colour, next.colour, '#fffaf0'], 16, 0.9);
  };

  return (
    <section className="world world-cart" id="cartridges" aria-labelledby="ct-title" style={THEME(cart)}>
      <div className="ct-head">
        <h2 className="ct-title" id="ct-title" ref={title}>
          <span className="sr-only">Cartridges you can play right here.</span>
          <span aria-hidden="true"><Split text="Cartridges you can play right here." /></span>
        </h2>
        <p className="ct-lede">
          I make Game Boy Color games for the ModRetro Chromatic. These are the real ROMs, running in your browser.
        </p>
      </div>

      <div className="ct-grid">
        <div className="ct-shelf-wrap">
          <div className="ct-shelf" role="radiogroup" aria-label="Cartridges">
            {CARTRIDGES.map((c) => (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={c.id === id}
                className="ct-cart"
                data-on={c.id === id ? '' : undefined}
                style={THEME(c)}
                onClick={(e) => pick(c, e)}
              >
                <span className="ct-cart-grip" aria-hidden="true" />
                <span className="ct-cart-label">
                  <img src={c.art} alt="" width="160" height="144" loading="lazy" />
                </span>
                <span className="ct-cart-name">{c.title}</span>
                <span className="ct-cart-pins" aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>

        <div className="ct-console" ref={stage}>
          <Handheld
            cart={cart}
            phase={player.phase}
            message={player.message}
            held={player.held}
            canvasRef={player.canvasRef}
            onButton={player.press}
            onPower={() => void player.power(id)}
            onResume={player.togglePause}
          />
          <div className="ct-tools">
            <button type="button" className="ct-tool" aria-pressed={!player.muted} onClick={player.toggleSound}>
              <span className="ct-tool-ico" data-ico={player.muted ? 'mute' : 'sound'} aria-hidden="true" />
              Sound {player.muted ? 'off' : 'on'}
            </button>
            <button type="button" className="ct-tool" disabled={!on} onClick={() => void player.power(id)}>
              <span className="ct-tool-ico" data-ico="restart" aria-hidden="true" />
              Restart
            </button>
            <button type="button" className="ct-tool" disabled={player.phase === 'off'} onClick={player.powerOff}>
              <span className="ct-tool-ico" data-ico="power" aria-hidden="true" />
              Power off
            </button>
          </div>
        </div>

        <article className="ct-card" aria-labelledby="ct-card-title">
          <p className="ct-genre">{cart.genre}</p>
          <h3 id="ct-card-title">{cart.title}</h3>
          <p className="ct-line">{cart.line}</p>
          <p className="ct-about only-wide">{cart.about}</p>

          {/* A keyboard: each key is drawn as a cap, with its button on it and its job beneath. */}
          <ul className="ct-keymap" aria-label={`Keys for ${cart.title}`}>
            {cart.controls.map((c) => (
              <li key={c.button} className="ct-key" data-b={c.button}>
                <span className="ct-key-caps">
                  {c.button === 'dpad' ? (
                    <span className="kc-pad">
                      {PAD_KEYS.map((b) => <KeyCap key={b} button={b} held={player.held.has(b)} />)}
                    </span>
                  ) : (
                    <KeyCap button={c.button} held={player.held.has(c.button)} />
                  )}
                </span>
                <span className="ct-key-does">{c.does}</span>
              </li>
            ))}
          </ul>

          {/* A thumb: the buttons on the console, and what each does. */}
          <ul className="ct-controls" aria-label={`Controls for ${cart.title}`}>
            {cart.controls.map((c) => (
              <li key={c.button}>
                <Glyph button={c.button} />
                <span>{c.does}</span>
              </li>
            ))}
          </ul>

          <div className="ct-foot">
            <p className="ct-esc"><kbd className="kc kc-sm"><span>Esc</span></kbd> Freeze the game</p>
            {player.saved[cart.id] && (
              confirming ? (
                <span className="ct-erase">
                  Erase this save?
                  <button type="button" onClick={() => { player.eraseSave(cart.id, on); setConfirming(false); }}>Erase</button>
                  <button type="button" onClick={() => setConfirming(false)}>Keep</button>
                </span>
              ) : (
                <button type="button" className="ct-erase-link" onClick={() => setConfirming(true)}>Erase save</button>
              )
            )}
          </div>
        </article>
      </div>
    </section>
  );
}
