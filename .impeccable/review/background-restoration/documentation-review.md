# Background restoration documentation recheck

Date: 2026-11-02

Disposition: ordinary-extension preservation passed. No material documentation gap blocks this correction. Preserve `DESIGN.md`, `.impeccable/design.json` and the earlier `.impeccable/review/documentation-review.md`. This report records the user-requested motion correction without rewriting the visual system.

## Evidence checked

Read the updated surface brief's MOTION CORRECTION, `src/pages/Hero.tsx`, the restored background rules and reduced-motion rule in `src/styles/app.css`, `verification.json`, `tab-visibility.json` and the empty `detector-findings.json` in this directory. Compared this narrow change with the Working Console design system and sidecar reviewed in the preceding documentation pass.

Directly inspected `home-1440x900-dark.png` and `home-390x667-light.png`. Both retain the accepted foreground layout, app links, game links, story access and Google Play development note over a subdued contact sheet of actual work. These are two sampled still captures; this documentation pass does not claim independent inspection of all ten captures or motion verification from still images.

The coordinating agent supplies a fresh independent finish review with SHIP disposition and no material fixes after reviewing all ten current captures. It also reports passing build, lint and whitespace checks. This documentation pass did not rerun those checks.

## Source findings

The contact sheet combines existing current-app, game-collection, featured-project and experiment images. Featured-project image selection follows the active theme. It adds no raster, dependency, palette token or type family.

The background is explicitly decorative through `aria-hidden="true"`, empty image alternatives and `pointer-events: none`. Its negative stacking level and isolated hero contain it behind foreground tasks. The local mask and canvas-colored overlay provide separation from the foreground. The 72-second linear loop translates a duplicated sequence by half its track height. This is the requested restoration of background energy, recorded in the surface brief rather than a new motion rule for every page.

The background's cropped screenshot strips and image labels are local contact-sheet material. They do not replace the uncropped foreground project previews or establish permission to crop project evidence elsewhere. Their labels identify actual projects; this report does not promote them to a decorative eyebrow or label pattern for future headings. The mask and gradient support this particular background's legibility, not an ambient-gradient token.

Reduced motion stops the track through both the hero's motion state and the explicit media-query override. The visibility effect sets `animationPlayState` from `document.hidden`, runs once on mount, subscribes to `visibilitychange` and removes the listener on cleanup. Hidden-tab pausing is source-verified only. The supplied headless attempt records `documentHidden: false` in both states, so it does not prove runtime pausing in a hidden tab.

## Supplied runtime evidence

`verification.json` records actual transform movement in dark and light themes at 1440x900, 390x844, 390x667, 320x568 and 844x390. All ten results report no horizontal overflow, no clipped foreground tasks, no blocked targets, pointer transparency and decorative semantics. It records reduced motion as passed. Landscape uses the already documented internal stage scrolling.

These local Chromium results supply no physical-device, cross-browser, deployment or user-acceptance evidence.

## Five-line system summary

1. Palette: the inherited cool dark and light canvases and sparse cyan actions remain unchanged.
2. Type: Barlow Condensed headings, Barlow body and JetBrains Mono readouts retain the accepted foreground hierarchy.
3. Signal Means State and Evidence Keeps Its Color remain the foreground rules; real project imagery supplies the restored local background.
4. Chrome Owns Its Space and Image Keeps Its Shape continue for foreground content, with existing stage scrolling in short landscape views.
5. Square Is the Default and Flat Until Layered remain intact; the user-requested contact-sheet loop is a local motion treatment with a reduced-motion stop.

## Drift not canonized or repaired

Pre-existing design metadata drift remains outside this correction's scope. The restored background's local crops, gradient masking and continuous motion do not become global tokens or general permission to obscure evidence. No craft-floor defect is adopted as a reusable rule. Hidden-tab runtime acceptance remains unproven by the supplied headless evidence.

Preserved SHA-256 values:

- `DESIGN.md`: `2BF4EB7B2744580D3B03C41DFABBEB49C5A7E46BC3D1DD0B7867FE62D1A4D00C`
- `.impeccable/design.json`: `A442D47EA121815DF7320753C71FADD185D398CB2A3287351D18DA6E3304F3AF`
- Earlier documentation report: `377E3A0B740C451D39DDC506C750D9F809B8EC28DD29DC643EBA926AB2FE966D`
