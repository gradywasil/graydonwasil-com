import { AnimatePresence, m, useReducedMotion, type Variants } from 'motion/react';
import { useLayoutEffect, useRef } from 'react';
import { useDeck } from '../lib/useDeck';
import { useWheelNav } from '../lib/useDeckDrivers';
import { ProjectSlide } from './ProjectSlide';
import { ProgressRail } from './ProgressRail';
import { Hero } from '../pages/Hero';
import { Games } from '../pages/Games';
import { About } from '../pages/About';
import { Contact } from '../pages/Contact';
import { ExperimentsSlide } from './ExperimentsSlide';

/* Slides enter from the direction the deck is travelling and leave the
 * opposite way, so a move reads as the content having scrolled past even
 * though nothing scrolls. */
const TRAVEL = 56;

const variants: Variants = {
  enter: (direction: number) => ({ opacity: 0, y: direction > 0 ? TRAVEL : -TRAVEL }),
  center: { opacity: 1, y: 0 },
  exit: (direction: number) => ({ opacity: 0, y: direction > 0 ? -TRAVEL : TRAVEL }),
};

export function Deck({ scrollable, onScrollModeChange }: {
  scrollable: boolean;
  onScrollModeChange: (scrollable: boolean) => void;
}) {
  const { slide, direction, go, index, count, goTo } = useDeck();
  const reduce = useReducedMotion();
  const stageRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    // Project scenes extend beyond the stage; experiments own their scrolling.
    if (slide.kind === 'project' || slide.kind === 'experiments') {
      onScrollModeChange(false);
      return;
    }
    const stage = stageRef.current;
    if (!stage) return;
    let active = true;
    const measure = () => {
      const needsScroll = stage.scrollHeight > stage.clientHeight + 1;
      onScrollModeChange(needsScroll);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    if (stage.firstElementChild) observer.observe(stage.firstElementChild);
    void document.fonts.ready.then(() => { if (active) measure(); });
    measure();
    return () => { active = false; observer.disconnect(); };
  }, [slide.key, slide.kind, onScrollModeChange]);

  useWheelNav(go);

  return (
    <div className="deck">
      <ProgressRail index={index} count={count} goTo={goTo} />

      <AnimatePresence custom={direction} initial={false}>
        <m.section
          key={slide.key}
          ref={stageRef}
          className="stage"
          data-scrollable={scrollable ? 'true' : undefined}
          tabIndex={scrollable ? 0 : undefined}
          custom={direction}
          variants={reduce ? undefined : variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={
            reduce ? { duration: 0 } : { duration: 0.42, ease: [0.2, 0.8, 0.2, 1] }
          }
          aria-label={slide.label}
        >
          {slide.kind === 'hero' && <Hero />}
          {slide.kind === 'games' && <Games />}
          {slide.kind === 'project' && slide.project && <ProjectSlide project={slide.project} />}
          {slide.kind === 'experiments' && <ExperimentsSlide />}
          {slide.kind === 'about' && <About />}
          {slide.kind === 'contact' && <Contact />}
        </m.section>
      </AnimatePresence>
    </div>
  );
}
