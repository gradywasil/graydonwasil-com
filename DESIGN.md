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
  bitbounce-display:
    fontFamily: "Chakra Petch, Barlow, system-ui, sans-serif"
    fontSize: "clamp(42px, 5.4vw, 76px)"
    fontWeight: 700
    lineHeight: 0.98
    letterSpacing: "-0.02em"
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
| COUCH·OS | Near-black `#07060b` with faint scanlines; the title on the TV tints the room. Its top edge is the four-colour bar from under its icon | Accent `#ff3b5c`, gold `#ffb800`, volt `#b5ff2a`, cyan `#22d3ee` (from its own stylesheet); each title's own colour on its tag and the TV's glow | Syne 800, Jersey 10 for on-screen labels |
| Games | Cream paper texture; the splash card takes the selected game's `theme.bg/a/b` from Gurpy Games | Teal headlines, orange highlights | Bungee |
| More | Night; each tile shows the project's own mark (VOXCHAIN orange, CarsDB red, the Arranged Godly device) | Ginger | Bricolage Grotesque |
| Cartridges | Violet graphite `#17141f` with a faint LCD line texture; the selected cartridge's own colour (from its title screen) tints the light behind the console and the card | Console pink `#ff5b8a` (A and B, the power button) and cartridge gold `#e8c46a` | Bricolage Grotesque, Spline Sans Mono for labels |
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
- **Saira Stencil One** only in the Morse world; **Pixelify Sans** and **Silkscreen** only in the Kilopixel world (Silkscreen also names a game on its launch screen in the hero's phone).
- **Chakra Petch** 700 only in the BitBounce world: its headline, keycaps and LCD labels, uppercase.
- A world's typeface also appears in two places outside its section, because both stand for that world: its chip in the top bar, and its launch screen in the hero's phone.

## Components

- **Chunky button:** ginger, orange, or ink face; 3px ink border; 5px solid ink drop shadow; lifts 2px on hover and presses 3px on click.
- **Store buttons:** the App Store and Google Play always appear together, as equals: same size, black, 1.5px grey border, the store's mark and a two-line label. The label follows the store state in `src/data/site.ts`: "Coming soon to the App Store" (dashed border, "In review" flag, not a link), "Join the beta on Google Play", or "Download on the" / "Get it on" once live. On the phone's sheet they shrink to pills with a state tag.
- **Morse phones:** two phones running the real Morse interface (the app's own stylesheet and markup, scaled from its 390px phone layout), not screenshots or a redrawing. Keep them in sync with the app via `scripts/sync-morse-ui.py`. The sender's flashlight is its top-right corner and the beam leaves from there; the receiver is turned toward it and shows its camera view, its tape and the decoded text.
- **Kilopixel viewfinder:** the app's own engine on a sample photo, with a look rail, group filters, a die, and a lens that shows the original. Look changes wipe down in ten steps. "You" points it at the visitor's own camera, only when pressed: the picture is mirrored, the rail redraws from it every few seconds, a shutter saves the frame as a PNG, and the camera switches off when the viewfinder scrolls away. Nothing is uploaded, and the label says so.
- **Kilopixel themes:** six swatches (under the numbers, and in the themes tile) re-skin the whole section through the `--kp-*` values set by `KilopixelLaunch`. `--kp-hot` is the accent as text and `--kp-on` is text on an accent fill; labels that sit on a photo use `--kp-over` and stay light. Where View Transitions are supported the new theme wipes down the section in twelve hard steps.
- **BitBounce groovebox:** four lanes of eight steps on a dark LCD, with the keys bitbounce.app's own drum machine has (Dice, Swing, Clear) plus Tempo and Sound, and a readout with a label over each value. A lane's name is a key that rolls just that lane. Swing is shown as well as heard: off-beat steps start late by as much as they sound late. The edge strip above the section is the pattern, so it changes with it. The four sounds are this page's own and the hint says so.
- **Sticker:** a tilted cream label with a periwinkle hard shadow for status callouts.
- **Top bar:** Gurpy's face (back to the top) and three tabs, however many projects there are: Apps, Games and Say hi (`TopBar.tsx`). Apps and Games are folders, the way a phone keeps them: four of their icons, small. Pressing a folder opens it the way a phone does: a frosted panel grows out of the tab and its icons land one after another, each with its name under it, each going straight to its thing (an app's section, `#games/<id>` for a game, `#carts/<id>` for a cartridge). It closes with Esc, a press outside, or a pick. The Games folder holds everything you play, in three parts: COUCH·OS first in its own colours, then the browser games, then the cartridges, and each part's heading goes to its own section. On a phone the open folder is as wide as the bar and fits without scrolling inside it (smaller icons, tighter rows, room under the last names), and while COUCH·OS is out its chip is just its icon and four-colour bar. What is being viewed comes out of its folder as a chip beside it: the project on screen, or up in the hero whatever is open in the phone. Its small icon stays bright in the folder while the others stand back, and the chip goes to that project's section. A chip wears its project and does one small thing of its own: Morse goes amber stencil and its lamp sends M; Kilopixel goes square in the pixel face with a hard orange shadow and arrives in steps; BitBounce becomes a cream keycap with its four lanes stepping under the name; RhymePage lights its name a word at a time, as its lyric sheet does; COUCH·OS shows its wordmark in Syne with its four-colour bar running under it and changes channel now and then; a game takes its two colours and its sprite, its name in Bungee, and follows the game that is up in the arcade. A name that does not fit slides to its end and back like the title of what is playing (under reduced motion it is cut short with an ellipsis). Every project in `ORBIT_ITEMS` gets a chip from its icon, name and accent with no extra work, so a new app costs the bar no room; what it does of its own is an entry in `OWN` and a `.top-now[data-world]` rule. On a phone, while a chip is out, Apps and Games are their folders alone and Say hi shortens to "hi"; the bar fits at 360px. An earlier bar had a tab per app (Morse, Kilopixel, BitBounce, Games, Say hi), which left no room for a fourth app and none for RhymePage.
- **Sky:** the hero's night sky is drawn live by one fragment shader (`HeroSky`): a slow nebula gathered around the phone, square pixel stars and plus-shaped sparkles on three depths that shift with the pointer, and the odd shooting star. It ripples once when something opens (and when the phone boots), and whatever is open dresses it (`SkyLook`, chosen by `lookFor` in `HomeScreen`): its accent and a second colour for the clouds, plus a restyling of its own. Kilopixel cuts the whole sky into chunky dithered pixels in the colours of the look it is drawing, and re-cuts it on every roll. BitBounce lays out a step grid with a playhead walking it in eighth notes. RhymePage rules it like a lyric sheet, scrolling. Morse's flashlight warms the clouds and throws a shaft of light from the handset's corner in time with the message. A game brings both its colours, and a pixel-art game a pixel sky. The grid and the ruled lines stop short of the copy (beside it on a wide page, under it on a narrow one); the pixel sky keeps every colour dark enough for the headline. Without WebGL the CSS sky stays; under reduced motion it is one still frame in the same dress.
- **Phone:** the hero's stage (`hero/HomeScreen.tsx`). A handset with a status bar (the real time), an island, pages of games, twelve to a page in four rows of three, swiped sideways with dots above the dock to say which (the last page also holds Gurpy Games and shortcuts to COUCH·OS and the cartridges below), and a dock of the four apps. It swings in and boots when the page loads: a `gradyOS` mark and a bar, the screen comes on, the island and status bar arrive, the icons drop in, the dock slides up and hops. It leans toward the pointer in 3D with a sheen that slides across the glass, tips back as the hero scrolls away, and floats a little; on a touch screen it sways on its own (it does not lean toward a finger: the phone must hold still under a press). Inside the screen everything is sized in `cqw`, so the same phone works at any size. Until the visitor opens something, notifications drop in one at a time, each an app or game with its one-line pitch, and tapping one opens it.
- **Opening an app:** the handset gives under the press, the home screen dives into the icon, and the app grows out of it behind a launch screen of its own: its colour, its icon, a ring going out, its name, and one loading bar that always fills to the end before the screen clears, each in its own way (Morse in its lamp's colour; Kilopixel square, in hard steps and five colours, and its screen wipes off in hard steps; BitBounce's icon drops in and bounces while the bar counts in its four lane colours; RhymePage in its green; a game in a framed bar in its colour). An earlier set of loaders made of separate dots and blocks read as a broken bar with gaps, and was replaced. Then it runs (`hero/LiveApps.tsx`): Morse is the app's own interface sending HI THERE on a loop; Kilopixel is the app's engine rolling its looks over a photo (tap the picture to roll, labelled "Live engine"); BitBounce is the app's real screen; RhymePage rehearses its two bars; a game shows its logo and screen. A sheet over the bottom says what it is and carries the store pair or the link, a way down the page, and Home; on a handset under 270px wide it shortens to status, name, the stores as logo and state, the arrow down, and Home as an arrow. The bar along the bottom goes home too: tap it, or drag it up and let go. Escape works as well. Going home, the app drops back into its icon, which takes it with a bounce and gets focus back. The island widens to hold the open item's icon, with a meter if it makes sound.
- **Spill:** what is open takes over the page around the phone. The sky is dressed for it (see Sky), and things of its own climb out and hang around the handset at their own depths, so the tilt slides them past it: Morse's flashlight flares at the top corner and each mark leaves along the beam as a dot or a dash; the colours of Kilopixel's current look come off two corners as pixels and change with every roll; BitBounce's four lanes sit beside it as pads, each playing its part of the beat, while the phone nods; the words RhymePage is singing come up beside it one at a time, the rhymes marked; a game's sprites (its Gurpy Games floaters) climb out. On a narrow page they sit in the gaps either side of the handset and stay below the headline.
- **Gurpy:** the top-bar mark, drawn live so his eyes follow the pointer. `GurpyPeek` brings him up behind the zigzag edge of Games, More or Hello when that edge reaches the middle of the screen: up to his eyes, a look, and back down. He rises in the gap above the edge, never over content, is not a control, and ducks if the pointer comes close.
- **World edges:** each world's top edge is made of that world. Morse: a punched paper tape spelling the message in its demo box. Kilopixel: a Bayer 4×4 dither. BitBounce: a step strip of the demo's four lanes with a playhead. Games, More and Hello: zigzags. Where scroll-driven animation is supported the tape runs, the playhead steps and the zigzags crawl with the scroll.
- **Sparks:** pressed controls throw a burst of square pixels in their world's `--spark` colour (`src/lib/juice.ts`). The reel lands in the winning game's two colours. Text selection and carets use the same `--spark`.
- **Splash:** the games card re-themes to the selected game: background, two accents, logo, tagline in alternating accents, a browser or phone frame (phones sit right of centre so sprites have room on the left), and floating sprites that drift on their own clocks and lean toward the pointer by depth. Sprites frame the screenshot; they never cover it.
- **COUCH·OS:** sits after RhymePage, ahead of Games: the console is the seam between the apps and the games (`CouchOS.tsx`, `styles/couch-os.css`, data in `src/data/couch-os.ts`). Its pitch is a TV and a sofa full of phones, so the section is a dark room with both in it. The TV wears the console's own status bar (its four-colour mark, eight player slots and room code GRDY) and controller hints, shows each title's library art with a burst of static, a roll and a `CH 07` read-out in Jersey 10, then that art moving (a six-second loop recorded from the console's own animated library canvas, about 60 KB each; only the one on screen loads, it fades in over the still once it plays, rests off screen and during a spin, and is skipped under reduced motion), and lights the wall and floor in the title's colour (a bias light that breathes). It surfs its library by itself until someone touches it, like a console's attract mode. In front of it is a phone drawn as the console's controller, its light in player one's colour: the D-pad changes channel, A plays (the picture rushes forward, the console loads, then "N players ready" with a real link in), B goes back, and Spin is the console's own Mystery Spin (also on the TV), which races through the channels, slows and lands with a burst. As the section arrives, players join one at a time: the slots light in the console's controller colours with a "P3 joined" toast each. Arrows, A, B, Escape and S work from the keyboard. On a phone the order is the TV, then the pad, then the title, and the button says "Play all 12 on this phone" (the console's Pocket mode runs every game on a phone); on a desktop it says "Open COUCH·OS on your TV" and the library rail runs under the title. Under reduced motion nothing surfs, joins or spins: the slots are lit and a spin lands at once. The covers were captured from the live console into `src/assets/couch-os/`.
- **Cartridges:** sits right after Games, ahead of More, so the game work stays together. A portrait handheld (`cartridges/Handheld.tsx`, drawn in container units so it is one drawing at any width) with the cartridge standing in its slot, a screen, a D-pad, A and B, Select and Start. It runs the real Game Boy Color ROMs of the games Graydon makes for the ModRetro Chromatic, with binjgb (MIT, the emulator GB Studio's own web export uses) as WebAssembly in `public/gb`. Nothing loads until "Power on" is pressed; the ROMs are gzipped and unpacked in the page. The emulator's memory is a fixed 16 MB, so a machine is reused only when its last cartridge was switched off cleanly; one that failed (out of memory, a trap) is dropped, the console says the cartridge stopped, and the next press gets a fresh one (`lib/gb/core.ts`). A visit normally makes one machine however fast the cartridges are swapped. The on-screen buttons are the touch controls and show the keyboard key under each on a desktop (WASD or arrows, Z and X, Enter, Shift, Esc to pause); on a desktop the card shows the same keys again as a row of big keycaps along its floor, each with the console button it works printed on it and the game's job for it beneath (W over A S D for the D-pad), and the caps press down as the real keys are pressed; a phone gets a plain list of button and job instead, and a narrow mouse window does too. There is no sentence about keys. They use pointer events, so A and B can be held together, the D-pad slides under a thumb, and it never scrolls the page. The game pauses when the console scrolls away or the tab hides, and the keyboard belongs to it only while it runs. Progress in a cartridge's battery RAM is kept in `localStorage`, with an erase. The two columns end together: the card stretches to the console's bottom edge. The headline and its one line sit side by side on a desktop, and there is no eyebrow label. The section's address is `#carts` (`#carts/<id>` for one cartridge). The Games tab in the top bar covers this section too, as the last part of its folder: here the cartridge in the console comes out of the Games folder as a chip (its title screen as the label in its colour, its name, gold pins crawling underneath, and a plug-in drop when the cartridge changes). It is deliberately not a tab of its own: a fourth tab does not fit a phone's bar. Every game's chip, in the arcade and on the shelf, does one small thing that is that game (`styles/topbar-games.css`, keyed by `data-game`, in the game's two colours, drawn behind the name): Brain Splitter's two colours swap sides, NumDrop drops balls, Monkey Universe twinkles, Infinite Monkey Industries types its name, Monkey Sled rushes, Dungeon of the Groove pulses on the beat, Will It Shred? shreds paper, Night Shift Security sweeps a radar, The Backup Generator charges and discharges, Pest Control skitters a bug, Merge Inc. merges two dots, Magic Gunden snakes a trail of gems along under its name, MIMIC hops, Run Forever flickers and looks back, Pocket Typist stomps and rings its bell, Storybox clacks like a wooden block while song-bird notes float up. Held still, only Brain Splitter's two colours remain. The shelf is five cartridges (a frame of each game's title screen on its label); picking one stands it in the console, and starts it if one was running. The top edge is the gold fingers of a cartridge. `scripts/sync-chromatic.py` copies in the ROMs and the emulator from the chromatic workspace; the games themselves are listed in `src/data/cartridges.ts`.
- **Tiles:** rounded 16px night-2 cards with screenshot on top, used only in the compact More strip.

## Motion

- Entrances pop with overshoot (`cubic-bezier(0.2, 1.6, 0.4, 1)`), staggered by about 0.12s.
- The hero is the one loud moment. Everything below it is quieter and belongs to its world.
- Headlines arrive every time they scroll into view, from either direction, each in its world's idiom (`useReveal` marks them, `Split` cuts them up): Morse is keyed in a letter at a time, Kilopixel scans in over nine steps, BitBounce lands a word per eighth note at 118 BPM, the games title tumbles in. A headline is only ever hidden while it is off screen, and it does not matter where the page was scrolled to when it loaded.
- Devices are tied to scroll via `animation-timeline: view()` where supported: the Morse phones swing toward each other, the Kilopixel studio climbs in eight steps, BitBounce's phone travels further than its iPad, the splash lands with a tilt. Without support they are simply in place.
- Demos spill into their sections: while a Morse signal is on, a soft glow spreads from the torch and the headline runs hotter (kept small and gentle because it flickers with the signal); while BitBounce plays, the logo ticks, the phone nods, the grid kicks on downbeats and the edge strip follows the step.
- The smaller pieces arrive the same way, staggered by their order (`data-rv` kinds in `site.css`, marked by `src/lib/juice.ts`): ledes and notes rise, store buttons and stat chips pop, the groovebox keys press in column by column, the side-project tiles are dealt, the polaroid drops. RhymePage's bars light up word by word as the section scrolls past, until Rehearse is pressed.
- Scrolling slides the star layers and tips the phone back. The top bar brings out the chip for the project on screen (see Top bar).
- Buttons give when pressed. Store buttons tip toward the pointer and carry a sheen under it.
- Physics, the Morse signal, and the reel are interaction-driven; nothing important moves on its own except the sky, the phone's boot, float (or sway) and notifications, whatever the open app sends out around it, Gurpy blinking, the Brain Splitter bob, and the Kilopixel auto-tour (the notifications and the tour both stop on the first interaction).
- Under reduced motion: the sky is one still frame; the phone does not lean, sway, float or boot, has no notifications, launch screen or flick, and apps open and close at once and hold still (Kilopixel shows one look and still rolls on a tap); what an app puts around the phone stands still, and Morse's marks and RhymePage's words, which only exist in motion, are left out; the Kilopixel viewfinder does not auto-roll, wipe, or animate VHS looks; no pops, float loops, headline entrances, scroll-driven motion, sparks, or leaning buttons; Kilopixel themes swap at once; the reel jumps; Gurpy stops blinking and does not peek, but still looks at the pointer.

## Phones

One idea per screen (the last block of `site.css`). Each idea is the visual, one line of pitch, the thing to press, and the stores; kickers, second sentences and anything a button already says are hidden with `.only-wide`.

- **Hero:** headline, a clear gap, then the handset, sized to fit the rest of the first screen (`100svh`) with the sky showing either side of it. It is the same phone as on a wide page, bezel, lean and all, and what the open app sends out sits in the gaps beside it. No lede, call-to-action buttons or platform sticker; the intro reel sits beside the headline's last line. An open app keeps the short sheet, so the app above it stays in view. (The first phone layout was a bezel-less full-width panel; it read as a tablet stuck to the headline and lost everything around the phone, and was replaced on 11 November 2026.)
- **Morse:** phones, headline, lede, the message box with Send beside it, stores.
- **Kilopixel:** name and headline, then the viewfinder with its look name, palette and Roll beside it and the rail under it (no filter tabs), then the six theme swatches in place of the numbers, and stores. The extras swipe sideways.
- **BitBounce:** headline, devices, one line and the four steps, stores; the groovebox is its own screen: Play and the readout, the five keys in a row, the grid, one line of hint.
- **COUCH·OS:** the wordmark, headline and one line, then the TV and its ◀ ▶ under it like a remote, the title and its tags; the open button comes last. The library rail is the desktop's.
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
