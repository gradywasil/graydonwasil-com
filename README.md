# Graydon Wasil · graydonwasil.com

**I build software you'll want to play with.**

This repository powers [graydonwasil.com](https://graydonwasil.com): one scrolling page that leads with Graydon's Android apps and browser games, keeps older side projects in a compact strip, and ends with a contact form. Gurpy, the pixel-art mascot from [Gurpy Games](https://gg.arrangedgodly.com/), is the guide.

![The hero: headline, Google Play button, and Gurpy with apps and games in orbit](docs/images/home-hero.jpg)

## What's on the page

| Section | What it does |
|---|---|
| **Hero** (`#top`) | Headline, a Google Play call to action for Morse, and Gurpy with the apps on an inner ring and the games on an outer ring, orbiting around him. Pick anything in orbit and the card below shows its status with a link; for games, "See it below" opens that game's splash. Until you pick something, it gives a slow guided tour. Gurpy's eyes follow the pointer and he comments on each pick. |
| **Morse** (`#morse`) | The first app headed to Google Play. Type a message and the page sends it in real Morse timing: the sender phone's lamp and beam flash, the paper tape punches, and the receiver readout decodes it letter by letter. Optional sound. Links to the Play tester opt-in, the testers group, and the web app. |
| **Apps** (`#apps`) | KiloPixel (Android beta) with a live ordered-dither demo you can recolour, roll, and hover to reveal the original photo. RhymePage with a rehearse-in-time lyric toy. |
| **Games** (`#games`) | A splash card that takes on the selected game's branding from Gurpy Games (colours, logo, tagline, screen, floating sprites, Gurpy's comment), a reel of all eleven games to pick from or spin, and links to the Gurpy Games and Infinite Monkey Industries hubs. |
| **More** (`#more`) | VOXCHAIN and CarsDB as logo tiles, Arranged Godly as its dream-device console, plus a drawer holding the 17 browser experiments. |
| **Hello** (`#hello`) | A short about, a photo, and the contact form. |

A small Gurpy follows you into the corner once the hero scrolls away and comments on each section. Type `gurpy` anywhere outside a text field for a surprise.

![The Morse section mid-signal](docs/images/morse-launch.jpg)

![The games splash wearing Dungeon of the Groove branding](docs/images/game-splash.jpg)

![Every section at phone width](docs/images/mobile.jpg)

## Google Play status

Morse is in closed testing. The Play buttons point at the tester opt-in (`play.google.com/apps/testing/com.arrangedgodly.morsecode`) and read "Join the beta on Google Play" or "Get Morse early on Google Play". They use the Play logo mark but not Google's official "Get it on Google Play" badge, which is meant for links to a public listing.

**When Morse goes public:** in `src/data/site.ts`, point the buttons at `MORSE.storeUrl`, then swap in the official badge artwork from Google's badge generator and change the hero sticker and Morse kicker copy.

## Run locally

Requires Node `^20.19.0 || >=22.12.0`.

```sh
npm ci
npm run dev
```

| Command | Purpose |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | TypeScript check, then production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Oxlint |

## Where things live

| Location | What belongs there |
|---|---|
| `src/data/site.ts` | App links (Play URLs), orbit items, game hubs, side projects |
| `src/data/games.json` + `src/assets/games/` | Generated game branding. Run `python scripts/sync-games.py` (needs Pillow and the `arcade-ad` repo beside this one) after Gurpy Games changes |
| `src/data/experiments.ts` | The 17 experiments |
| `src/components/` | One component per section, plus `GurpyFace` (the canvas mascot), `Orbit` (the hero rings), and `PlayButton` |
| `src/lib/morse.ts` | Morse alphabet and signal timing |
| `src/styles/site.css` | All styles; each section's palette is defined at the top |
| `src/assets/fun/` | Mascot, Morse phones, KiloPixel sample, side-project marks, and the Arranged Godly device |

Art sources: Gurpy and all game art come from the `arcade-ad` (Gurpy Games) repo; the VOXCHAIN mark and wordmark and the CarsDB mark come from those live sites; the Arranged Godly image is a capture of the live site; the Morse phone plates come from `morse-code/assets/plates`; the KiloPixel flower comes from `1bit-camera/kilopixel-site`.

## Old links

The previous site was a slide deck with one URL per slide. `src/main.tsx` maps those paths to sections: `/games` goes to `#games`, `/projects/*` and `/experiments` go to `#more`, `/about` and `/contact` go to `#hello`, and anything else goes to the top. The host still needs to return `index.html` for unknown paths.

## Contact delivery

Copy `.env.example` to `.env.local` and set `VITE_CONTACT_ENDPOINT` to a form endpoint you control. It receives a JSON POST of `name`, `email`, and `message`. If the endpoint rejects the message, the form keeps it and offers an email-app fallback. With no endpoint, the form opens a pre-filled `mailto:` instead; that hands off the draft, it does not confirm delivery. `VITE_` values are public, so never put secrets there.

## Accessibility and motion

Under `prefers-reduced-motion`, the orbit holds still with no guided tour, Gurpy stops blinking, the float, pop and scroll-reveal animations are off, and the reel jumps instead of spinning. The Morse lamp only flashes in a small area when you start it, and it stays under 5 flashes a second. Orbit items, reel cards and every link are real buttons or links reachable by keyboard; focusing an orbit item stops its ring.

## Stack

React 19, TypeScript 6, Vite 8, Oxlint. No router or animation library. Output is static files in `dist/`.
