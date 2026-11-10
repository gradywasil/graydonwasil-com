import type { AppStores, StoreLink } from '../data/site';

/* App Store and Google Play calls to action, given equal weight. Each button
 * follows its store's state in src/data/site.ts:
 *   soon    "Coming soon to Google Play", not a link (not submitted yet)
 *   review  "Coming soon to the App Store", not a link
 *   beta    "Join the beta on Google Play" / "Test it on TestFlight"
 *   live    "Download on the App Store" / "Get it on Google Play"
 * These are drawn to sit together as a pair. When a listing goes public it
 * is fine to keep them, or to swap in Apple's and Google's official badges. */

type Platform = 'ios' | 'android';

export function PlayLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="#00a0ff" d="M3.6 1.8C3.2 2 3 2.4 3 2.9v18.2c0 .5.2.9.6 1.1L13.8 12 3.6 1.8Z" />
      <path fill="#34a853" d="M3.6 1.8 13.8 12l3.1-3.1L4.9 2c-.5-.3-.9-.4-1.3-.2Z" />
      <path fill="#ea4335" d="M3.6 22.2c.4.2.8.1 1.3-.2l12-6.9-3.1-3.1L3.6 22.2Z" />
      <path fill="#fbbc04" d="m16.9 8.9-3.1 3.1 3.1 3.1 3.5-2c1-.6 1-1.6 0-2.2l-3.5-2Z" />
    </svg>
  );
}

export function AppleLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
      />
    </svg>
  );
}

/** The Android robot's head, for platform labels (not store links). */
export function AndroidLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <g fill="#3ddc84">
        <path d="M2.5 18.5a9.5 9.5 0 0 1 19 0Z" />
        <rect x="4.6" y="6.2" width="1.8" height="5" rx="0.9" transform="rotate(-30 5.5 8.7)" />
        <rect x="17.6" y="6.2" width="1.8" height="5" rx="0.9" transform="rotate(30 18.5 8.7)" />
      </g>
      <circle cx="8" cy="14.6" r="1.25" fill="#0e1124" />
      <circle cx="16" cy="14.6" r="1.25" fill="#0e1124" />
    </svg>
  );
}

const KICKER: Record<Platform, Record<StoreLink['state'], string>> = {
  ios: { soon: 'Coming soon to the', review: 'Coming soon to the', beta: 'Test it on', live: 'Download on the' },
  android: { soon: 'Coming soon to', review: 'Coming soon to', beta: 'Join the beta on', live: 'Get it on' },
};
const SHORT: Record<StoreLink['state'], string> = { soon: 'Soon', review: 'In review', beta: 'Beta', live: 'Get it' };

const storeName = (platform: Platform, link: StoreLink) =>
  platform === 'android' ? 'Google Play' : link.state === 'beta' ? 'TestFlight' : 'App Store';

export function StoreButton({ platform, link, pill }: { platform: Platform; link: StoreLink; pill?: boolean }) {
  const name = storeName(platform, link);
  const Logo = platform === 'ios' ? AppleLogo : PlayLogo;
  const soon = link.state === 'review' || link.state === 'soon' || !link.url;
  const flag = link.state === 'soon' ? 'In the works' : 'In review';
  const short = soon && link.state === 'beta' ? 'In review' : SHORT[link.state];
  const cls = `${pill ? 'store-pill' : 'store-btn'} store-${platform}`;

  const body = pill ? (
    <>
      <Logo className="store-logo" />
      <span className="store-pill-name">{name}</span>
      <span className="store-pill-state">{short}</span>
    </>
  ) : (
    <>
      <Logo className="store-logo" />
      <span className="store-btn-text">
        <span className="store-btn-kicker">{KICKER[platform][link.state]}</span>
        <span className="store-btn-name">{name}</span>
      </span>
    </>
  );

  if (soon) {
    return (
      <span className={cls} data-soon="">
        {body}
        {!pill && <span className="store-btn-flag" aria-hidden="true">{flag}</span>}
        <span className="sr-only"> ({flag.toLowerCase()}, link coming soon)</span>
      </span>
    );
  }
  return (
    <a className={cls} href={link.url} target="_blank" rel="noopener noreferrer">
      {body}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

export function StoreButtons({ stores, app, pill, className }: {
  stores: AppStores;
  app: string;
  pill?: boolean;
  className?: string;
}) {
  return (
    <div className={`store-row ${className ?? ''}`} role="group" aria-label={`Get ${app}`}>
      <StoreButton platform="ios" link={stores.ios} pill={pill} />
      <StoreButton platform="android" link={stores.android} pill={pill} />
    </div>
  );
}
