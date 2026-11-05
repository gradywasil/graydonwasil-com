/* A Google Play call to action. While Morse is in closed testing this reads
 * "Join the beta on Google Play" rather than using the official "Get it on"
 * badge, which Google reserves for links to a public listing. Swap in the
 * official badge artwork once the listing is public. */

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

export function PlayButton({ href, kicker = 'Join the beta on', className }: {
  href: string;
  kicker?: string;
  className?: string;
}) {
  return (
    <a className={`play-btn ${className ?? ''}`} href={href} target="_blank" rel="noopener noreferrer">
      <PlayLogo className="play-btn-logo" />
      <span className="play-btn-text">
        <span className="play-btn-kicker">{kicker}</span>
        <span className="play-btn-name">Google Play</span>
      </span>
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
