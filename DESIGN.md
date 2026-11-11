---
name: Graydon Wasil
description: An iOS and Android developer's page: a navy night sky around a phone whose home screen is his apps and games, and each product section takes on its own brand world.
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
  bitbounce-bg: "#f4f1ea"
  bitbounce-orange: "#ff5a1f"
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
---

# Design System: Graydon Wasil

## Overview

**Creative North Star: "It's All On His Phone"**

The site is one scrolling page for an iOS and Android developer, with a semi-professional home base (a navy night sky, confident sentence-case headlines, ginger and periwinkle accents) and playful product worlds. The hero is a phone whose home screen is the work: the four apps in the dock, the games in the grid. Tapping one opens it the way a phone opens an app, and it runs there; whatever is open spills out of the phone into the sky. Further down, each product section is a poster in that product's own world, borrowing the palette and type of its own site. Gurpy, the 64×64 pixel-art mascot, is the mark in the top bar (his eyes follow the pointer) and looks over a section's edge now and then; he does not speak, sit in the hero, or follow you in a corner.

The hero went through several stages on 11 November 2026: an orbit of icons around Gurpy (cut: he swallowed clicks and his lines were dull), the same orbit around the picked item's screenshot (cut: worse than Gurpy), then five variants side by side. The phone was picked over a stack of five world posters, which read as a repeat of the sections below. The other variants are still in `src/components/hero` behind `?hero=1` to `5` and a dev-only switch, until they are cleared out.

Every section has one thing to play with. The goal is a smile in the first five seconds and a clear next step (Google Play, a game, or a message) in every section.

**Key characteristics**

- Home-base headlines in Bricolage Grotesque 800, sentence case and tightly tracked, with one ginger phrase and a hand-drawn underline.
- Interactions have a job: the phone's home screen navigates the work, the Morse sender demos Morse, the reel picks a game. No decorative physics.
- Chunky buttons: thick ink border and a solid offset shadow that presses down on click.
- Each world's top edge is made of that world: a Morse tape, a Kilopixel dither, a BitBounce step strip, and zigzags for the Gurpy Games paper and the home base.
- Real art from Graydon's own products, never stock or invented imagery.
- Pixel art always renders with `image-rendering: pixelated`.

## Worlds

| Section | Ground | Accent | Display type |
|---|---|---|---|
| Hero | Navy night: a live sky of periwinkle and ginger nebula and pixel stars | Ginger, periwinkle; the selected item's own accent on its card, the light around its screen and the sky | Bricolage Grotesque |
| Morse | Morse brown `#140d06` with faint vertical lines | Amber `#f7b24c` with glow | Saira Stencil One |
| Kilopixel | Graphite `#121212` with a faint 12px pixel grid and notched pixel corners; the whole section takes whichever of the app's six themes is picked (Graphite, Classic, Pocket, Arcade, Terminal, Candy) | Signal orange `#ff6a1f` in Graphite, otherwise the theme's accent | Pixelify Sans, Silkscreen for micro labels |
| BitBounce | Cream `#f4f1ea` toy groovebox with keycaps on darker skirts and a dark LCD `#17181d` grid (from bitbounce.app, not the old web app) | Orange `#ff5a1f`; lanes drums orange, bass `#ffc400`, chords `#1f6bff`, lead `#ff3d8b`; yellow playhead | Chakra Petch 700, Barlow for text |
| RhymePage | Deep green `#0e1913` | Green `#4be38f` | DM Sans 800 |
| Games | Cream paper texture; the splash card takes the selected game's `theme.bg/a/b` from Gurpy Games | Teal headlines, orange highlights | Bungee |
| More | Night; each tile shows the project's own mark (VOXCHAIN orange, CarsDB red, the Arranged Godly device) | Ginger | Bricolage Grotesque |
| Hello | Ginger | Ink, teal on the cream note card | Bricolage Grotesque |

A product world uses its own site's colours and type. Do not let one product's palette leak into another's section.

## Colors

- **Night** (`#0e1124`) is the page ground; **Night 2/3** are raised panels and cards.
- **Cream** (`#f6efe3`) is text on night and the speech-bubble face; **Muted** (`#bfb4d3`) is secondary text on night.
- **Ginger** (`#ffa552`, from Gurpy's beard) is Graydon's own accent: the highlighted headline phrase, primary buttons, "Say hi", the focus ring, and the Hello ground. **Periwinkle** (`#8f9cff`) is the secondary accent: kickers, sticker shadows, and the phone's home-screen light when nothing is open.
- Do not use Brain Splitter's lime and pink outside the Brain Splitter splash. **Orange** (`#ff6b2c`) belongs to the Gurpy Games world (reel highlight, spin button).
- **Paper** (`#f5ebd3`) with **Paper Ink** (`#0b2b3b`) and **Teal** (`#0d7a85`) is the Gurpy Games world.
- Store buttons stay black with each store's own mark, whatever world they sit in. Only the "In review" flag takes the world's accent.

## Typography

- **Bricolage Grotesque** 800 for home-base headlines, the brand mark, and the name on the phone's sheet. Sentence case, letter-spacing about -0.035em.
- **Bungee** only inside the Gurpy Games world (games heading, splash kicker and hook, reel names). Always uppercase.
- **Martian Mono** 800 only for the CarsDB wordmark tile.
- **DM Sans** for body, buttons, and UI copy, 400–800.
- **Spline Sans Mono** for kickers, statuses, and hints: uppercase, tracked 0.08em.
- **Barlow** only inside the Morse demo phones, where the app's own stylesheet uses it.
- **Saira Stencil One** only in the Morse world; **Pixelify Sans** and **Silkscreen** only in the Kilopixel world.

## Components

- **Chunky button:** ginger, orange, or ink face; 3px ink border; 5px solid ink drop shadow; lifts 2px on hover and presses 3px on click.
- **Store buttons:** the App Store and Google Play always appear together, as equals: same size, black, 1.5px grey border, the store's mark and a two-line label. The label follows the store state in `src/data/site.ts`: "Coming soon to the App Store" (dashed border, "In review" flag, not a link), "Join the beta on Google Play", or "Download on the" / "Get it on" once live. On the phone's sheet they shrink to pills with a state tag.
- **Morse phones:** two phones running the real Morse interface (the app's own stylesheet and markup, scaled from its 390px phone layout), not screenshots or a redrawing. Keep them in sync with the app via `scripts/sync-morse-ui.py`. The sender's flashlight is its top-right corner and the beam leaves from there; the receiver is turned toward it and shows its camera view, its tape and the decoded text.
- **Kilopixel viewfinder:** the app's own engine on a sample photo, with a look rail, group filters, a die, and a lens that shows the original. Look changes wipe down in ten steps. "You" points it at the visitor's own camera, only when pressed: the picture is mirrored, the rail redraws from it every few seconds, a shutter saves the frame as a PNG, and the camera switches off when the viewfinder scrolls away. Nothing is uploaded, and the label says so.
- **Kilopixel themes:** six swatches (under the numbers, and in the themes tile) re-skin the whole section through the `--kp-*` values set by `KilopixelLaunch`. `--kp-hot` is the accent as text and `--kp-on` is text on an accent fill; labels that sit on a photo use `--kp-over` and stay light. Where View Transitions are supported the new theme wipes down the section in twelve hard steps.
- **BitBounce groovebox:** four lanes of eight steps on a dark LCD, with the keys bitbounce.app's own drum machine has (Dice, Swing, Clear) plus Tempo and Sound, and a readout with a label over each value. A lane's name is a key that rolls just that lane. Swing is shown as well as heard: off-beat steps start late by as much as they sound late. The edge strip above the section is the pattern, so it changes with it. The four sounds are this page's own and the hint says so.
- **Sticker:** a tilted cream label with a periwinkle hard shadow for status callouts.
- **Top bar:** Gurpy's face (back to the top) and five tabs: Morse, Kilopixel and BitBounce with their app icons, Games with a game's sprite, and Say hi (`TopBar.tsx`). The tab for the world on screen is lit, and up in the hero so is the tab for whatever is open in the phone. A lit tab wears its project and does one small thing of its own: Morse goes amber stencil and its lamp sends M; Kilopixel goes square in the pixel face with a hard orange shadow and arrives in steps; BitBounce becomes a cream keycap with its four lanes stepping under the name; Games takes the two colours and the sprite of the game that is up in the arcade (or open in the phone); Say hi gets a cream ring. On a phone a tab is its icon alone and only the lit one opens out to show its name, so the same five tabs fit at 360px; Say hi shortens to "hi" while another tab is open. No tab is ever dropped at a narrower width.
- **Sky:** the hero's night sky is drawn live by one fragment shader (`HeroSky`): a slow nebula gathered around the phone, square pixel stars and plus-shaped sparkles on three depths that shift with the pointer, and the odd shooting star. It ripples once when something opens (and when the phone boots), and whatever is open dresses it (`SkyLook`, chosen by `lookFor` in `HomeScreen`): its accent and a second colour for the clouds, plus a restyling of its own. Kilopixel cuts the whole sky into chunky dithered pixels in the colours of the look it is drawing, and re-cuts it on every roll. BitBounce lays out a step grid with a playhead walking it in eighth notes. RhymePage rules it like a lyric sheet, scrolling. Morse's flashlight warms the clouds and throws a shaft of light from the handset's corner in time with the message. A game brings both its colours, and a pixel-art game a pixel sky. The grid and the ruled lines stop short of the copy (beside it on a wide page, under it on a narrow one); the pixel sky keeps every colour dark enough for the headline. Without WebGL the CSS sky stays; under reduced motion it is one still frame in the same dress.
- **Phone:** the hero's stage (`hero/HomeScreen.tsx`). A handset with a status bar (the real time), an island, a grid of the eleven games three to a row plus Gurpy Games, and a dock of the four apps. It swings in and boots when the page loads: a `gradyOS` mark and a bar, the screen comes on, the island and status bar arrive, the icons drop in, the dock slides up and hops. It leans toward the pointer in 3D with a sheen that slides across the glass, tips back as the hero scrolls away, and floats a little; on a touch screen it sways on its own (it does not lean toward a finger: the phone must hold still under a press). Inside the screen everything is sized in `cqw`, so the same phone works at any size. Until the visitor opens something, notifications drop in one at a time, each an app or game with its one-line pitch, and tapping one opens it.
- **Opening an app:** the handset gives under the press, the home screen dives into the icon, and the app grows out of it behind a launch screen of its own: its colour, its icon, a ring going out, its name, and one loading bar that always fills to the end before the screen clears, each in its own way (Morse in its lamp's colour; Kilopixel square, in hard steps and five colours, and its screen wipes off in hard steps; BitBounce's icon drops in and bounces while the bar counts in its four lane colours; RhymePage in its green; a game in a framed bar in its colour). An earlier set of loaders made of separate dots and blocks read as a broken bar with gaps, and was replaced. Then it runs (`hero/LiveApps.tsx`): Morse is the app's own interface sending HI THERE on a loop; Kilopixel is the app's engine rolling its looks over a photo (tap the picture to roll, labelled "Live engine"); BitBounce is the app's real screen; RhymePage rehearses its two bars; a game shows its logo and screen. A sheet over the bottom says what it is and carries the store pair or the link, a way down the page, and Home; on a handset under 270px wide it shortens to status, name, the stores as logo and state, the arrow down, and Home as an arrow. The bar along the bottom goes home too: tap it, or drag it up and let go. Escape works as well. Going home, the app drops back into its icon, which takes it with a bounce and gets focus back. The island widens to hold the open item's icon, with a meter if it makes sound.
- **Spill:** what is open takes over the page around the phone. The sky is dressed for it (see Sky), and things of its own climb out and hang around the handset at their own depths, so the tilt slides them past it: Morse's flashlight flares at the top corner and each mark leaves along the beam as a dot or a dash; the colours of Kilopixel's current look come off two corners as pixels and change with every roll; BitBounce's four lanes sit beside it as pads, each playing its part of the beat, while the phone nods; the words RhymePage is singing come up beside it one at a time, the rhymes marked; a game's sprites (its Gurpy Games floaters) climb out. On a narrow page they sit in the gaps either side of the handset and stay below the headline.
- **Gurpy:** the top-bar mark, drawn live so his eyes follow the pointer. `GurpyPeek` brings him up behind the zigzag edge of Games, More or Hello when that edge reaches the middle of the screen: up to his eyes, a look, and back down. He rises in the gap above the edge, never over content, is not a control, and ducks if the pointer comes close.
- **World edges:** each world's top edge is made of that world. Morse: a punched paper tape spelling the message in its demo box. Kilopixel: a Bayer 4×4 dither. BitBounce: a step strip of the demo's four lanes with a playhead. Games, More and Hello: zigzags. Where scroll-driven animation is supported the tape runs, the playhead steps and the zigzags crawl with the scroll.
- **Sparks:** pressed controls throw a burst of square pixels in their world's `--spark` colour (`src/lib/juice.ts`). The reel lands in the winning game's two colours. Text selection and carets use the same `--spark`.
- **Splash:** the games card re-themes to the selected game: background, two accents, logo, tagline in alternating accents, a browser or phone frame (phones sit right of centre so sprites have room on the left), and floating sprites that drift on their own clocks and lean toward the pointer by depth. Sprites frame the screenshot; they never cover it.
- **Tiles:** rounded 16px night-2 cards with screenshot on top, used only in the compact More strip.

## Motion

- Entrances pop with overshoot (`cubic-bezier(0.2, 1.6, 0.4, 1)`), staggered by about 0.12s.
- The hero is the one loud moment. Everything below it is quieter and belongs to its world.
- Headlines arrive every time they scroll into view, from either direction, each in its world's idiom (`useReveal` marks them, `Split` cuts them up): Morse is keyed in a letter at a time, Kilopixel scans in over nine steps, BitBounce lands a word per eighth note at 118 BPM, the games title tumbles in. A headline is only ever hidden while it is off screen, and it does not matter where the page was scrolled to when it loaded.
- Devices are tied to scroll via `animation-timeline: view()` where supported: the Morse phones swing toward each other, the Kilopixel studio climbs in eight steps, BitBounce's phone travels further than its iPad, the splash lands with a tilt. Without support they are simply in place.
- Demos spill into their sections: while a Morse signal is on, a soft glow spreads from the torch and the headline runs hotter (kept small and gentle because it flickers with the signal); while BitBounce plays, the logo ticks, the phone nods, the grid kicks on downbeats and the edge strip follows the step.
- The smaller pieces arrive the same way, staggered by their order (`data-rv` kinds in `site.css`, marked by `src/lib/juice.ts`): ledes and notes rise, store buttons and stat chips pop, the groovebox keys press in column by column, the side-project tiles are dealt, the polaroid drops. RhymePage's bars light up word by word as the section scrolls past, until Rehearse is pressed.
- Scrolling slides the star layers and tips the phone back. The top bar keeps the tab for the world on screen lit (see Top bar).
- Buttons give when pressed. Store buttons tip toward the pointer and carry a sheen under it.
- Physics, the Morse signal, and the reel are interaction-driven; nothing important moves on its own except the sky, the phone's boot, float (or sway) and notifications, whatever the open app sends out around it, Gurpy blinking, the Brain Splitter bob, and the Kilopixel auto-tour (the notifications and the tour both stop on the first interaction).
- Under reduced motion: the sky is one still frame; the phone does not lean, sway, float or boot, has no notifications, launch screen or flick, and apps open and close at once and hold still (Kilopixel shows one look and still rolls on a tap); what an app puts around the phone stands still, and Morse's marks and RhymePage's words, which only exist in motion, are left out; the Kilopixel viewfinder does not auto-roll, wipe, or animate VHS looks; no pops, float loops, headline entrances, scroll-driven motion, sparks, or leaning buttons; Kilopixel themes swap at once; the reel jumps; Gurpy stops blinking and does not peek, but still looks at the pointer.

## Phones

One idea per screen (the last block of `site.css`). Each idea is the visual, one line of pitch, the thing to press, and the stores; kickers, second sentences and anything a button already says are hidden with `.only-wide`.

- **Hero:** headline, a clear gap, then the handset, sized to fit the rest of the first screen (`100svh`) with the sky showing either side of it. It is the same phone as on a wide page, bezel, lean and all, and what the open app sends out sits in the gaps beside it. No lede, call-to-action buttons or platform sticker; the intro reel sits beside the headline's last line. An open app keeps the short sheet, so the app above it stays in view. (The first phone layout was a bezel-less full-width panel; it read as a tablet stuck to the headline and lost everything around the phone, and was replaced on 11 November 2026.)
- **Morse:** phones, headline, lede, the message box with Send beside it, stores.
- **Kilopixel:** name and headline, then the viewfinder with its look name, palette and Roll beside it and the rail under it (no filter tabs), then the six theme swatches in place of the numbers, and stores. The extras swipe sideways.
- **BitBounce:** headline, devices, one line and the four steps, stores; the groovebox is its own screen: Play and the readout, the five keys in a row, the grid, one line of hint.
- **Games:** headline and the splash (no description); the reel and hubs are their own screen.
- The three sections before a zigzag edge keep 60px of bottom padding, so Gurpy has room to look over it without touching anything.

## Don'ts

- Don't let a world's edge sit on another world's text: the Kilopixel dither lives inside Kilopixel's own top padding.
- Don't float anything over the page: the corner Gurpy covered footer links. The switch for hero variants is dev-only and folds itself away.
- Don't put a CSS `filter` on anything in front of the hero sky: a drop shadow on a canvas there blacked the WebGL sky out in Chrome.
- Don't let any box share the tilting phone's 3D scene (`transform-style: preserve-3d` on a parent of `.hs-tilt`): the half of the phone that leans behind that box stops taking presses. Test presses on the phone with real touch and mouse input, not `element.click()`.
- Don't flatten the phone on a narrow page or drop what the open app sends out around it: the takeover of the page is the best part of the hero, on a phone most of all.
- Don't fake an app's interface inside the phone. What runs there is the app's own interface, its own engine, or its own screenshot, and anything else is labelled.
- Don't give Gurpy lines to say about the products. The products show themselves.

- Don't add per-project story pages or a slide deck back to the home page.
- Don't use the old console look (cyan-on-black, condensed type, square chrome).
- Don't add interactions without a job (throwable toys were tried and cut).
- Don't smooth-scale pixel art, and don't recolour product screenshots.
- Don't invent store ratings, download counts, or testimonials for decoration.
- Don't favour one platform: wherever an app's store link appears, iPhone and Android appear together.
