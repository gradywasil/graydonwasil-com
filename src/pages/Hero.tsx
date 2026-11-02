import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '../lib/usePrefersReducedMotion';
import { Link } from 'react-router-dom';
import { ExternalArrow } from '../components/ExternalArrow';
import { CURRENT_APPS, GAME_COLLECTIONS } from '../data/currentWork';
import { EXPERIMENTS, PROJECTS } from '../data/projects';
import { FIRST_PROJECT_PATH } from '../lib/deck';
import { getShotImage } from '../lib/images';
import { useTheme } from '../lib/useTheme';

export function Hero() {
  const reduceMotion = usePrefersReducedMotion();
  const { theme } = useTheme();
  const memoryTrack = useRef<HTMLDivElement>(null);
  const frames = [
    ...[...CURRENT_APPS, ...GAME_COLLECTIONS].map((item) => ({
      id: `current-${item.id}`, label: item.title, src: item.image,
    })),
    ...PROJECTS.map((project) => ({
      id: project.id, label: project.title, src: getShotImage(`${project.id}-hero-${theme}`),
    })),
    ...EXPERIMENTS.map((experiment) => ({
      id: experiment.id, label: experiment.title, src: experiment.thumbnail,
    })),
  ].filter((frame): frame is { id: string; label: string; src: string } => Boolean(frame.src));

  useEffect(() => {
    const syncVisibility = () => {
      if (memoryTrack.current) memoryTrack.current.style.animationPlayState = document.hidden ? 'paused' : 'running';
    };
    syncVisibility();
    document.addEventListener('visibilitychange', syncVisibility);
    return () => document.removeEventListener('visibilitychange', syncVisibility);
  }, []);

  return (
    <div className="hero" data-motion={reduceMotion ? 'still' : 'run'}>
      <div className="hero-memory" aria-hidden="true">
        <div className="hero-memory-track" ref={memoryTrack}>
          {[0, 1].map((copy) => (
            <div className="hero-memory-sequence" key={copy}>
              {frames.map((frame) => (
                <div className="hero-memory-slice" key={`${frame.id}-${copy}`}>
                  <img src={frame.src} alt="" loading="lazy" decoding="async" />
                  <span className="mono">{frame.label}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="hero-intro">
        <h1 className="disp hero-title">
          <span className="line">I solve </span>
          <span className="line">problems </span>
          <span className="line">in code.</span>
        </h1>
        <p className="lede">
          I build the tools I wish existed, and games I want to keep playing. Lately, more of
          that work has been making its way from the browser to Android.
        </p>
        <div className="hero-story-links">
          <Link className="btn btn-secondary" to={FIRST_PROJECT_PATH}>
            Read the project stories &rarr;
          </Link>
          <Link className="hero-text-link" to="/experiments">{EXPERIMENTS.length} experiments</Link>
        </div>

        <section className="hero-games" aria-labelledby="hero-games-title">
          <div className="hero-games-heading">
            <h2 className="pt" id="hero-games-title">I make games, too.</h2>
            <Link className="hero-text-link" to="/games">Take a look &rarr;</Link>
          </div>
          <div className="hero-game-links">
            {GAME_COLLECTIONS.map((collection) => (
              <a key={collection.id} href={collection.url} target="_blank" rel="noopener noreferrer"
                aria-label={`${collection.title} (opens in a new tab)`}>
                <span>{collection.title}</span>
                <ExternalArrow />
              </a>
            ))}
          </div>
        </section>
      </div>

      <section className="hero-apps" aria-labelledby="hero-apps-title">
        <h2 className="pt" id="hero-apps-title">Apps I'm taking further.</h2>
        <div className="current-apps">
          {CURRENT_APPS.map((app) => (
            <a className="current-app" key={app.id} href={app.url} target="_blank" rel="noopener noreferrer"
              aria-label={`Explore ${app.title} (opens in a new tab)`} aria-describedby={`app-${app.id}-description`}>
              <div className="current-app-preview">
                <picture>
                  <source media="(max-width: 760px) and (max-height: 700px)" srcSet={app.icon} />
                  <img src={app.image} alt="" width="390" height="844" decoding="async" />
                </picture>
              </div>
              <h3 className="pt">{app.title}<ExternalArrow /></h3>
              <p id={`app-${app.id}-description`}>{app.description}</p>
            </a>
          ))}
        </div>
        <p className="app-release-note">
          <strong>Working toward Google Play</strong>
          <span>Android releases in development for all three apps.</span>
        </p>
      </section>
    </div>
  );
}
