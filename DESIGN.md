---
name: Graydon Wasil
description: An iOS and Android developer's page: a navy night sky where apps and games orbit a pixel-art Gurpy, and each product section takes on its own brand world.
colors:
  night: "#0e1124"
  night-2: "#171b36"
  night-3: "#222849"
  cream: "#f6efe3"
  muted: "#aeb3d0"
  ginger: "#ffa552"
  ginger-deep: "#b4561a"
  periwinkle: "#8f9cff"
  paper: "#f5ebd3"
  paper-ink: "#0b2b3b"
  teal: "#0d7a85"
  orange: "#ff6b2c"
  morse-bg: "#140d06"
  morse-amber: "#f7b24c"
  morse-cream: "#eee0c2"
  morse-dim: "#ab9672"
  kilopixel-bg: "#121212"
  kilopixel-panel: "#1b1b19"
  kilopixel-orange: "#ff6a1f"
  rhymepage-bg: "#0e1913"
  rhymepage-green: "#4be38f"
typography:
  display:
    fontFamily: "Bricolage Grotesque, DM Sans, system-ui, sans-serif"
    fontSize: "clamp(42px, 5.1vw, 76px)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.035em"
  games-display:
    fontFamily: "Bungee, Arial Black, system-ui, sans-serif"
    fontSize: "clamp(38px, 5.6vw, 84px)"
    fontWeight: 400
    lineHeight: 0.95
  body:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.55
  morse-display:
    fontFamily: "Saira Stencil One, Arial Black, sans-serif"
    fontSize: "clamp(40px, 5.4vw, 80px)"
    fontWeight: 400
    lineHeight: 0.95
  morse-app-body:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: 1.5
  kilopixel-display:
    fontFamily: "Pixelify Sans, ui-monospace, monospace"
    fontSize: "clamp(44px, 5.6vw, 84px)"
    fontWeight: 700
    lineHeight: 0.98
  kilopixel-micro:
    fontFamily: "Silkscreen, Pixelify Sans, monospace"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.06em"
  carsdb-wordmark:
    fontFamily: "Martian Mono, ui-monospace, monospace"
    fontSize: "clamp(22px, 2.2vw, 30px)"
    fontWeight: 800
    lineHeight: 1
  label:
    fontFamily: "Spline Sans Mono, ui-monospace, Menlo, Consolas, monospace"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.08em"
rounded:
  pill: "999px"
  card: "28px"
  tile: "16px"
  button: "14px"
  pixel: "2px"
components:
  chunky-button:
    backgroundColor: "{colors.ginger}"
    textColor: "#1a1205"
    rounded: "{rounded.button}"
    padding: "12px 22px"
    border: "3px solid #1a1205"
    shadow: "0 5px 0 #1a1205"
  store-button:
    backgroundColor: "#000000"
    textColor: "#ffffff"
    rounded: "12px"
    border: "1.5px solid #a6a6a6"
  speech-bubble:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.paper-ink}"
    rounded: "14px"
    shadow: "0 4px 0 {colors.ginger-deep}"
---

# Design System: Graydon Wasil

## Overview

**Creative North Star: "Everything Orbits Gurpy"**

The site is one scrolling page for an iOS and Android developer, with a semi-professional home base (a navy night sky, confident sentence-case headlines, ginger and periwinkle accents) and playful product worlds. In the hero, Graydon's apps and games orbit Gurpy, the 64×64 pixel-art mascot. Picking one shows what it is and where to go. Further down, each product section is a poster in that product's own world, borrowing the palette and type of its own site. Gurpy watches the pointer, comments on what you pick, and follows you down the page.

Every section has one thing to play with. The goal is a smile in the first five seconds and a clear next step (Google Play, a game, or a message) in every section.

**Key characteristics**

- Home-base headlines in Bricolage Grotesque 800, sentence case and tightly tracked, with one ginger phrase and a hand-drawn underline.
- Interactions have a job: the orbit navigates the work, the Morse sender demos Morse, the reel picks a game. No decorative physics.
- Chunky buttons: thick ink border and a solid offset shadow that presses down on click.
- Section worlds separated by zigzag edges, as on Gurpy Games.
- Real art from Graydon's own products, never stock or invented imagery.
- Pixel art always renders with `image-rendering: pixelated`.

## Worlds

| Section | Ground | Accent | Display type |
|---|---|---|---|
| Hero | Navy night with periwinkle and ginger glows | Ginger, periwinkle; the selected item's own accent on its card | Bricolage Grotesque |
| Morse | Morse brown `#140d06` with faint vertical lines | Amber `#f7b24c` with glow | Saira Stencil One |
| Kilopixel | Graphite `#121212` with a faint 12px pixel grid and notched pixel corners | Signal orange `#ff6a1f`; the themes tile takes the selected app theme's colours | Pixelify Sans, Silkscreen for micro labels |
| RhymePage | Deep green `#0e1913` | Green `#4be38f` | DM Sans 800 |
| Games | Cream paper texture; the splash card takes the selected game's `theme.bg/a/b` from Gurpy Games | Teal headlines, orange highlights | Bungee |
| More | Night; each tile shows the project's own mark (VOXCHAIN orange, CarsDB red, the Arranged Godly device) | Ginger | Bricolage Grotesque |
| Hello | Ginger | Ink, teal on the cream note card | Bricolage Grotesque |

A product world uses its own site's colours and type. Do not let one product's palette leak into another's section.

## Colors

- **Night** (`#0e1124`) is the page ground; **Night 2/3** are raised panels and cards.
- **Cream** (`#f6efe3`) is text on night and the speech-bubble face; **Muted** (`#bfb4d3`) is secondary text on night.
- **Ginger** (`#ffa552`, from Gurpy's beard) is Graydon's own accent: the highlighted headline phrase, primary buttons, "Say hi", the focus ring, and the Hello ground. **Periwinkle** (`#8f9cff`) is the secondary accent: kickers, sticker shadows, the inner orbit ring.
- Do not use Brain Splitter's lime and pink outside the Brain Splitter splash. **Orange** (`#ff6b2c`) belongs to the Gurpy Games world (reel highlight, spin button).
- **Paper** (`#f5ebd3`) with **Paper Ink** (`#0b2b3b`) and **Teal** (`#0d7a85`) is the Gurpy Games world.
- Store buttons stay black with each store's own mark, whatever world they sit in. Only the "In review" flag takes the world's accent.

## Typography

- **Bricolage Grotesque** 800 for home-base headlines, the brand mark, and orbit card names. Sentence case, letter-spacing about -0.035em.
- **Bungee** only inside the Gurpy Games world (games heading, splash kicker and hook, reel names). Always uppercase.
- **Martian Mono** 800 only for the CarsDB wordmark tile.
- **DM Sans** for body, buttons, and UI copy, 400–800.
- **Spline Sans Mono** for kickers, statuses, and hints: uppercase, tracked 0.08em.
- **Barlow** only inside the Morse demo phones, where the app's own stylesheet uses it.
- **Saira Stencil One** only in the Morse world; **Pixelify Sans** and **Silkscreen** only in the Kilopixel world.

## Components

- **Chunky button:** ginger, orange, or ink face; 3px ink border; 5px solid ink drop shadow; lifts 2px on hover and presses 3px on click.
- **Store buttons:** the App Store and Google Play always appear together, as equals: same size, black, 1.5px grey border, the store's mark and a two-line label. The label follows the store state in `src/data/site.ts`: "Coming soon to the App Store" (dashed border, "In review" flag, not a link), "Join the beta on Google Play", or "Download on the" / "Get it on" once live. In the orbit card they shrink to pills with a state tag.
- **Morse phones:** two phones running the real Morse interface (the app's own stylesheet and markup, scaled from its 390px phone layout), not screenshots or a redrawing. Keep them in sync with the app via `scripts/sync-morse-ui.py`. The sender's flashlight is its top-right corner and the beam leaves from there; the receiver is turned toward it and shows its camera view, its tape and the decoded text.
- **Kilopixel viewfinder:** the app's own engine on a sample photo, with a look rail, group filters, a die, and a lens that shows the original. Look changes wipe down in ten steps.
- **Speech bubble:** cream with a teal hard shadow and a tail; short lines only.
- **Sticker:** a tilted cream label with a periwinkle hard shadow for status callouts.
- **Orbit:** two tilted dashed rings (apps inner, games outer). Items behind Gurpy shrink and dim. The rings slow under the pointer and stop on hover or focus. The selected item gets an accent ring and drives the card below.
- **Splash:** the games card re-themes to the selected game: background, two accents, logo, tagline in alternating accents, a browser or phone frame (phones sit right of centre so sprites have room on the left), and floating sprites that drift on their own clocks and lean toward the pointer by depth. Sprites frame the screenshot; they never cover it.
- **Tiles:** rounded 16px night-2 cards with screenshot on top, used only in the compact More strip.

## Motion

- Entrances pop with overshoot (`cubic-bezier(0.2, 1.6, 0.4, 1)`), staggered by about 0.12s.
- Section content rises in on scroll via `animation-timeline: view()` where supported.
- Physics, the Morse signal, and the reel are interaction-driven; nothing important moves on its own except Gurpy blinking, the Brain Splitter bob, and the Kilopixel auto-tour (which stops on the first interaction).
- Under reduced motion: the orbit holds still and there is no guided tour; the Kilopixel viewfinder does not auto-roll, wipe, or animate VHS looks; no pops, float loops, or scroll reveals; the reel jumps; Gurpy stops blinking but still looks at the pointer.

## Don'ts

- Don't add per-project story pages or a slide deck back to the home page.
- Don't use the old console look (cyan-on-black, condensed type, square chrome).
- Don't add interactions without a job (throwable toys were tried and cut).
- Don't smooth-scale pixel art, and don't recolour product screenshots.
- Don't invent store ratings, download counts, or testimonials for decoration.
- Don't favour one platform: wherever an app's store link appears, iPhone and Android appear together.
