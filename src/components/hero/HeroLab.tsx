import { useEffect, useRef, useState } from 'react';
import { HERO_VARIANTS, type HeroVariant } from './variants';

/* A switch for trying the hero variants side by side. It only exists on the
 * dev server; a built site never renders it. So that it does not sit on the
 * thing being judged, it folds down to a small handle a few seconds after it
 * was last used; pointing at or tapping the handle brings it back. */

const FOLD_MS = 3500;

export function HeroLab({ variant, onChange }: { variant: HeroVariant; onChange: (v: HeroVariant) => void }) {
  const [open, setOpen] = useState(true);
  const timer = useRef(0);
  const active = HERO_VARIANTS.find((v) => v.id === variant);
  const index = HERO_VARIANTS.findIndex((v) => v.id === variant);

  const wake = () => {
    setOpen(true);
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(false), FOLD_MS);
  };
  useEffect(() => {
    timer.current = window.setTimeout(() => setOpen(false), FOLD_MS + 1500);
    return () => clearTimeout(timer.current);
  }, []);

  return (
    <nav className="hero-lab" aria-label="Hero variants (preview only)" data-open={open || undefined} onPointerMove={wake} onFocus={wake}>
      {open ? (
        <>
          <p className="hero-lab-note">{active?.note}</p>
          <div className="hero-lab-keys">
            <span className="hero-lab-title">Hero</span>
            {HERO_VARIANTS.map((v, i) => (
              <button key={v.id} type="button" aria-pressed={v.id === variant} onClick={() => { onChange(v.id); wake(); }}>
                <b>{i + 1}</b><span>{v.name}</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <button type="button" className="hero-lab-handle" onClick={wake} aria-label={`Hero variant ${index + 1} of ${HERO_VARIANTS.length}: ${active?.name}. Show the switch`}>
          {index + 1}/{HERO_VARIANTS.length}
        </button>
      )}
    </nav>
  );
}
