# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The portfolio intentionally serves a mixed audience of people who may find a reason to work with, hire, follow, or recommend Graydon:

- Hiring managers and engineering leads evaluating his software-development judgment, range, and ability to ship complete work.
- Small-business owners and other potential clients deciding whether he could understand a practical problem and build a useful solution for them.
- Developer peers and other makers who want to see what he has built lately, try the projects, or inspect the source.

No one of these groups is the exclusive primary audience. The shared visitor job is to establish credible fit by understanding how Graydon approaches problems and by examining real work.

## Product Purpose

The portfolio shows what Graydon builds and how he thinks through software problems. It gives visitors a compact way to browse shipped projects and smaller experiments, see the problem behind each project, inspect live software or source where available, and contact him about employment, client work, or collaboration.

A successful visit gives someone enough specific evidence to decide on a useful next step: explore a project more deeply, review the code, remember or share Graydon's work, or start a conversation.

## Positioning

The portfolio is grounded in software Graydon built around problems and curiosities he encountered himself. Its case for his work comes from specific friction, working behavior, implementation decisions, live projects, and source code rather than generalized claims about being a developer.

The range is part of the product: full applications establish depth, while smaller browser experiments show ongoing curiosity, speed, and willingness to test an idea by building it.

## Operating Context

Visitors may arrive on desktop or mobile and move through one ordered portfolio deck using visible navigation, a keyboard, a wheel, or touch gestures. Featured projects have deeper views with screenshots, implementation context, live links, and source links. Experiments can be browsed in a curated, alphabetical, or newest-first order and open as separate live projects.

The site does not require an account. A visitor can contact Graydon through the contact form; when no form endpoint is configured, the site hands the prepared message to the visitor's email client instead of claiming it was delivered.

## Capabilities and Constraints

- Lead with KiloPixel, Morse, and RhymePage, with real previews and an explicit statement that Google Play releases are in development.
- Introduce Gurpy Games and Infinite Monkey Industries on the opening view and in a dedicated games slide before the existing project stories.
- Present four featured projects: Rhymepage, Collectible Cars DB, Arranged Godly, and VOXCHAIN.
- Present the current collection of 17 smaller browser experiments with direct selection and multiple sort orders.
- Keep project details, screenshots, live links, and source links available wherever the underlying evidence exists.
- Preserve direct routes to portfolio sections and project-detail views even though the experience is presented as one deck.
- Support desktop and mobile layouts, keyboard navigation, wheel navigation, touch gestures, dark and light themes, visible focus, and reduced-motion preferences.
- Remember the visitor's explicit theme choice locally in the browser.
- Remain deployable as a static client-rendered site; the host must return `index.html` for direct visits to client-side routes.
- Keep contact delivery honest: use the configured endpoint when present, report rejected requests, retain the visitor's message on failure, and provide the email-client fallback.
- Do not fabricate clients, testimonials, business outcomes, audience metrics, endorsements, or project capabilities.

## Brand Commitments

The product is Graydon Wasil's personal software portfolio and speaks in his first-person voice. The writing is candid, specific, and technically literate. It foregrounds the problem he noticed, the behavior he built, and the implementation decision that mattered.

Personal details and humor are welcome when they are true and help the visitor understand the person behind the work. Meaningful technical language such as TypeScript, REST APIs, Web Audio, authentication, local storage, latency, and game loops should remain when it adds evidence. The voice must not drift into detached resume language, generic agency copy, inflated promotion, or invented proof.

## Evidence on Hand

- Project records, descriptions, implementation notes, stack information, links, and experiment metadata in `src/data/projects.ts`.
- Desktop and mobile project captures in `src/assets/screenshots/`.
- Experiment thumbnails in `src/assets/experiments/`.
- A real portrait used by the About section at `src/assets/screenshots/about.webp`.
- Live project URLs and public source-repository URLs recorded alongside the relevant work.
- An About narrative describing how Graydon moved from solving his own practical problems into full-application development.

No testimonials, client roster, verified audience metrics, or quantified business outcomes are currently on hand. Future work must not imply that this evidence exists unless it is supplied and verified.

## Product Principles

1. Show working evidence before making a broad claim.
2. Explain the path from a real problem to useful behavior and the technical decision behind it.
3. Give hiring teams, potential small-business clients, and peers credible paths through the same body of work without pretending they have identical reasons for visiting.
4. Keep exploration direct: reveal deeper context when requested, preserve the visitor's place, and make the next action clear.
5. Preserve truthful behavior, accessibility, responsive usability, and browser performance as the portfolio evolves.

## Accessibility & Inclusion

The current product supports keyboard navigation, visible focus treatment, touch-sized controls on coarse pointers, semantic labels and live regions, reduced-motion behavior, and responsive layouts. Motion that communicates state should retain a gentler alternative under reduced motion; nonessential perpetual motion should stop.

No formal accessibility conformance target has been established. Future work should preserve the accessibility behavior already present and record a specific standard here only after it is deliberately adopted and verified.
