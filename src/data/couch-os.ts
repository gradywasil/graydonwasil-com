import icon from '../assets/couch-os/icon.svg';

/* COUCH·OS, the living-room arcade console (couch-os.arrangedgodly.com). The titles are its
 * game library in the console's own order, with its own words and colours; each cover is the
 * console's own library art, captured from the live site into src/assets/couch-os/. */

const covers = import.meta.glob<string>('../assets/couch-os/*.webp', { eager: true, import: 'default' });
const cover = (id: string) => covers[`../assets/couch-os/${id}.webp`];

export const COUCH = {
  name: 'COUCH·OS',
  url: 'https://couch-os.arrangedgodly.com/',
  icon,
  /** Its own palette, from the console's stylesheet. */
  accent: '#ff3b5c',
};

export interface CouchTitle {
  id: string;
  name: string;
  /** The console's genre chip. */
  kind: 'Party' | 'Co-op' | 'Versus';
  players: string;
  blurb: string;
  /** The title's colour in the console's library. */
  colour: string;
  cover: string;
}

const t = (id: string, name: string, kind: CouchTitle['kind'], players: string, colour: string, blurb: string): CouchTitle =>
  ({ id, name, kind, players, colour, blurb, cover: cover(id) });

export const COUCH_TITLES: CouchTitle[] = [
  t('channel-surf', 'Channel Surf', 'Party', '1–4 players', '#f2375b',
    '60 channels of four-player chaos. Surf rapid-fire bursts that speed up every few channels, or tune in to any channel you like.'),
  t('tether-peak', 'Tether Peak', 'Co-op', '1–8 players', '#e09a22',
    'Rope up and climb a freshly shuffled mountain. One slip drags the whole team down, so somebody had better be holding on.'),
  t('closing-time', 'Closing Time', 'Co-op', '1–8 players', '#f0365a',
    'Split-screen zombie survival, after hours. Board the windows, buy your way deeper in and hold out until dawn.'),
  t('clown-car-valet', 'Clown Car Valet', 'Co-op', '1–8 players', '#f29327',
    'One beat-up sedan, one phone per pedal. Steer, gas, brake and gears are split across everyone, and the seats shuffle every level.'),
  t('cart-blanche', 'Cart Blanche', 'Versus', '1–8 players', '#f04cdc',
    'A shopping-cart kart racer through a hypermarket after closing. Drift for boosts, draft cart trains, throw spills and rogue roombas.'),
  t('last-call', 'Last Call', 'Versus', '2–8 players', '#e8a325',
    'One more round before the lights come up. Deathmatch, king of the hill, capture the flag and gun game, split-screen.'),
  t('everything-must-ghost', 'Everything Must Ghost', 'Versus', '2–8 players', '#f353b0',
    'One player is an invisible ghost steering from a private map on their phone. Everyone else hunts it by flashlight while their phones buzz harder as it gets close.'),
  t('hush-money', 'Hush Money', 'Versus', '2–8 players', '#3ce4a1',
    'One thief holds the blueprints on their phone. Everyone else holds a flashlight. Crack the vault and get out before the guards close in.'),
  t('couch-court', 'Couch Court', 'Party', '3–8 players', '#a886f7',
    'The judge reads the case. Everyone plays their funniest answer from a secret hand, the judge picks a winner, and the couch votes for theirs.'),
  t('scribble-hotline', 'Scribble Hotline', 'Party', '3–8 players', '#6575f0',
    'Draw on your phone, guess on your phone. Or play Telephone: write, draw, guess, pass it on, then watch every chain unravel on the TV.'),
  t('spotlight-showdown', 'Spotlight Showdown', 'Party', '1–8 players', '#e8c247',
    'A motion-duel game show. Quick-draws, safecracking by feel, sword parries and pancake flips, with the studio audience cheering on their phones.'),
  t('gnomans-land', 'Gnoman’s Land', 'Versus', '2–8 players', '#99ea76',
    'Garden gnome squads go to war across six destructible backyards. Lob flowerpots, bounce rakes, hose rivals into the koi pond.'),
];
