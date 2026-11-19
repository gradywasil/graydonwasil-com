import mimicArt from '../assets/carts/mimic.png';
import numdropArt from '../assets/carts/numdrop.png';
import pocketTypistArt from '../assets/carts/pocket-typist.png';
import runForeverArt from '../assets/carts/run-forever.png';
import type { PadButton } from '../lib/gb/core';

/* The Game Boy Color games made for the ModRetro Chromatic, from the chromatic
 * workspace. Each one runs from its real ROM (public/gb/roms/<id>.gbc.gz, put
 * there by scripts/sync-chromatic.py). The art is a frame of the cartridge's own
 * title screen. Add a game here and in that script. */

export interface Cartridge {
  id: string;
  title: string;
  /** What it is, in a few words. */
  genre: string;
  /** One sentence for the shelf. */
  line: string;
  /** A little more, for the card beside the console. */
  about: string;
  /** What each button does in this game, in the order they are shown. */
  controls: Array<{ button: PadButton | 'dpad'; does: string }>;
  /** The label colour: the cartridge's own, taken from its title screen. */
  colour: string;
  /** Text on that colour. */
  ink: string;
  /** A second colour, where the game has one (the top-bar chip uses it). */
  alt?: string;
  /** A frame of the title screen, 160 x 144. */
  art: string;
}

export const CARTRIDGES: Cartridge[] = [
  {
    id: 'mimic',
    title: 'MIMIC',
    genre: 'Runner',
    line: 'A zoo escape where you never stop running.',
    about: 'A small alien crash-lands in a city zoo and copies the animals it scans. It runs on its own, so the only decisions are who to be and when to jump.',
    controls: [
      { button: 'dpad', does: 'Tap to become an animal, two quick taps for a combo' },
      { button: 'a', does: 'Jump' },
      { button: 'b', does: 'Back to the blob' },
      { button: 'start', does: 'Pause' },
    ],
    colour: '#5fdc7a', ink: '#082414', art: mimicArt,
  },
  {
    id: 'run-forever',
    title: 'Run Forever',
    genre: 'Horror',
    line: 'Three kids read a name, and something answers.',
    about: 'Explore the woods for a scrap of the book, run when the thing finds you, hide when you cannot. Each Hour changes the game under you. At the end you decide whether to destroy it or keep running.',
    controls: [
      { button: 'dpad', does: 'Move' },
      { button: 'a', does: 'Talk, jump' },
      { button: 'b', does: 'Set a trap' },
    ],
    colour: '#d8845f', ink: '#1d0b06', art: runForeverArt,
  },
  {
    id: 'pocket-typist',
    title: 'Pocket Typist',
    genre: 'Rhythm and luck',
    line: 'A monkey, a typewriter, and the complete works.',
    about: 'A monkey stomps the keys in time with the office band. Lucky stomps type the title in gold. Hire a crew, buy upgrades, and type 64 titles for Chairman Bigsby.',
    controls: [
      { button: 'a', does: 'Stomp a key, on the beat' },
      { button: 'b', does: 'Return the carriage' },
      { button: 'start', does: 'The Office' },
      { button: 'select', does: 'Fix the trouble' },
    ],
    colour: '#e9b93a', ink: '#241a02', art: pocketTypistArt,
  },
  {
    id: 'numdrop',
    title: 'NumDrop',
    genre: 'Physics idle',
    line: 'Drop balls, merge colours, chase the corner.',
    about: 'A physics idle game for a handheld. Balls bounce on their own and pay out every time. Spend it on more balls, merge them up a tier, clear 22 containers, then ascend for permanent upgrades. It saves your run.',
    controls: [
      { button: 'dpad', does: 'Right for your ability, up and down to pick a tier' },
      { button: 'a', does: 'Buy a ball' },
      { button: 'b', does: 'Merge a pair' },
      { button: 'select', does: 'Buy a platform' },
      { button: 'start', does: 'Pause' },
    ],
    colour: '#ffb347', ink: '#1c1000', alt: '#4ecdc4', art: numdropArt,
  },
];

export const cartridgeById = (id: string) => CARTRIDGES.find((c) => c.id === id) ?? CARTRIDGES[0];

/** Keyboard, for the desktop. The on-screen console shows these under its buttons. */
export const KEYS: Record<PadButton, { codes: string[]; label: string }> = {
  up: { codes: ['ArrowUp', 'KeyW'], label: 'W' },
  down: { codes: ['ArrowDown', 'KeyS'], label: 'S' },
  left: { codes: ['ArrowLeft', 'KeyA'], label: 'A' },
  right: { codes: ['ArrowRight', 'KeyD'], label: 'D' },
  a: { codes: ['KeyZ', 'KeyJ'], label: 'Z' },
  b: { codes: ['KeyX', 'KeyK'], label: 'X' },
  start: { codes: ['Enter'], label: 'Enter' },
  select: { codes: ['ShiftLeft', 'ShiftRight', 'Backspace'], label: 'Shift' },
};
