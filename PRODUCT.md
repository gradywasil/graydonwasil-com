# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The site now leads with people who might use or play what Graydon makes, while still serving people who might work with him:

- Android users and players who arrive from his app and game sites, or who want to try Morse, KiloPixel, or a game right now.
- Hiring managers, engineering leads, and potential clients looking for evidence that he ships complete, polished products.
- Developer peers and makers who want to see what he has built lately.

The shared visitor job: get a quick, memorable sense of what Graydon makes, try something, and know where to go next (Google Play, a game, or the contact form).

## Product Purpose

The site is a fun, interactive advertisement for Graydon's apps and games and for Graydon himself. It should make visitors smile, give them something to play with within seconds, and put the Google Play launch of Morse front and centre. Side projects stay visible but compact.

A successful visit ends with someone joining the Morse beta, playing a game, opening one of the app sites, or sending a message.

## Positioning

Graydon builds software you'll want to play with. The case for his work is the work itself, presented so you can touch it: a Morse signal you can send, a pixel camera look you can roll, a reel of games you can spin. Gurpy, his pixel-art mascot, carries the humour.

Morse is his first app on Google Play (in closed testing as of November 2026). KiloPixel is next. RhymePage is a web app with Android in the works.

## Operating Context

Visitors arrive on desktop or mobile and scroll one page with anchored sections (`#top`, `#morse`, `#apps`, `#games`, `#more`, `#hello`). Old deck URLs (`/games`, `/projects/*`, `/experiments`, `/about`, `/contact`) redirect to the matching section.

The site does not require an account. A visitor can contact Graydon through the contact form; when no form endpoint is configured, the site hands the prepared message to the visitor's email client instead of claiming it was delivered.

## Capabilities and Constraints

- Lead with apps and games. Morse and its Google Play beta come first, then KiloPixel and RhymePage, then the games (Brain Splitter spotlight, all eleven games on a spin reel, both game hubs).
- Keep VOXCHAIN, CarsDB, Arranged Godly, and the 17 experiments in one compact section; do not bring back per-project story pages without a new decision.
- Google Play buttons point at the Morse tester opt-in until the listing is public. Do not use Google's official "Get it on Google Play" badge until it links to a public listing.
- Interactions must have a purpose. The hero orbit navigates the apps and games, the Morse sender demos Morse, the KiloPixel dither and RhymePage rehearse demo those apps, and the reel and splash show each game in its own branding. Gurpy reacts to what you pick.
- The tone is semi-professional with fun baked in: this is also Graydon's portfolio.
- Game branding comes from the Gurpy Games data (`arcade-ad/research/games.json`) via `scripts/sync-games.py`; do not hand-edit `src/data/games.json`.
- Support desktop and mobile, keyboard access, visible focus, and reduced-motion preferences. The site has a single dark-first presentation; there is no light-theme toggle.
- Remain deployable as a static client-rendered site; the host must return `index.html` for unknown paths.
- Keep contact delivery honest: use the configured endpoint when present, report rejected requests, retain the visitor's message on failure, and provide the email-client fallback.
- Do not fabricate clients, testimonials, download counts, ratings, store availability, or project capabilities.

## Brand Commitments

The product is Graydon Wasil's personal site and speaks in his first-person voice, with Gurpy as a playful second voice. The writing is short, candid, specific, and funny when it is true. It foregrounds the problem he noticed, the behavior he built, and the implementation decision that mattered.

Personal details and humor are welcome when they are true and help the visitor understand the person behind the work. Meaningful technical language such as TypeScript, REST APIs, Web Audio, authentication, local storage, latency, and game loops should remain when it adds evidence. The voice must not drift into detached resume language, generic agency copy, inflated promotion, or invented proof.

## Evidence on Hand

- App, game, and side-project links in `src/data/site.ts`; experiments in `src/data/experiments.ts`.
- Real art from Graydon's own projects in `src/assets/fun/`: Gurpy, Brain Splitter, game thumbnails, Morse phone plates, the KiloPixel sample photo, and side-project screenshots.
- App icons in `src/assets/current-work/`, experiment thumbnails in `src/assets/experiments/`, and a real portrait at `src/assets/fun/graydon.webp`.

No testimonials, client roster, download counts, ratings, or quantified outcomes are on hand. Do not imply that this evidence exists unless it is supplied and verified.

## Product Principles

1. Let people touch it. Every product section has something to play with within one click.
2. Apps and games first; everything else stays compact.
3. Make the next step obvious: join the beta, play a game, open the app site, or say hi.
4. Be funny, never fake. Humour comes from Gurpy and true details, not invented proof.
5. Preserve truthful behavior, accessibility, responsive usability, and browser performance as the site evolves.

## Accessibility & Inclusion

The current product supports keyboard navigation, visible focus treatment, touch-sized controls on coarse pointers, semantic labels and live regions, reduced-motion behavior, and responsive layouts. Motion that communicates state should retain a gentler alternative under reduced motion; nonessential perpetual motion should stop.

No formal accessibility conformance target has been established. Future work should preserve the accessibility behavior already present and record a specific standard here only after it is deliberately adopted and verified.
