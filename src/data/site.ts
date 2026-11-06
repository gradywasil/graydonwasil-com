import morseIcon from '../assets/current-work/morse-icon.png';
import kilopixelIcon from '../assets/current-work/kilopixel-icon.png';
import rhymepageIcon from '../assets/current-work/rhymepage-icon.png';
import voxchainMark from '../assets/fun/side/voxchain-mark.svg';
import carsdbMark from '../assets/fun/side/carsdb-mark.svg';
import arrangedGodlyDevice from '../assets/fun/side/arranged-godly.webp';
import { GAMES } from './games';

/* Morse is the first app headed to Google Play. While it is in closed
 * testing, the button goes to the tester opt-in. When the listing goes
 * public, point the buttons at MORSE.storeUrl and change the labels. */
export const MORSE = {
  site: 'https://morse.arrangedgodly.com/',
  webApp: 'https://morse.graydonwasil.com/',
  group: 'https://groups.google.com/g/morse-android-testers',
  betaUrl: 'https://play.google.com/apps/testing/com.arrangedgodly.morsecode',
  storeUrl: 'https://play.google.com/store/apps/details?id=com.arrangedgodly.morsecode',
  icon: morseIcon,
};

export const KILOPIXEL = { site: 'https://kilopixel.arrangedgodly.com/', icon: kilopixelIcon };
export const RHYMEPAGE = { site: 'https://rhymepage.com/', icon: rhymepageIcon };

/** Everything circling Gurpy in the hero. Apps ride the inner ring, games
 *  the outer one. Picking one shows its card; `section` is where "more"
 *  scrolls to, and games also open in the splash below. */
export interface OrbitItem {
  id: string;
  ring: 'apps' | 'games';
  name: string;
  icon: string;
  pixel?: boolean;
  status: string;
  line: string;
  href: string;
  cta: string;
  play?: boolean;
  section: string;
  quip: string;
  accent: string;
}

const APP_ITEMS: OrbitItem[] = [
  {
    id: 'morse', ring: 'apps', name: 'Morse', icon: morseIcon, status: 'Beta on Google Play',
    line: 'Send a message with light and sound. Another phone reads it back.',
    href: MORSE.betaUrl, cta: 'Join the beta', play: true, section: 'morse',
    quip: 'My first Play Store app!', accent: '#f7b24c',
  },
  {
    id: 'kilopixel', ring: 'apps', name: 'KiloPixel', icon: kilopixelIcon, status: 'Android beta',
    line: 'A live pixel camera. One camera, 49 looks.',
    href: KILOPIXEL.site, cta: 'Get the beta', section: 'apps',
    quip: 'Next in line for Google Play.', accent: '#ff6a1f',
  },
  {
    id: 'rhymepage', ring: 'apps', name: 'RhymePage', icon: rhymepageIcon, status: 'Web app',
    line: 'Write lyrics, sync them to a track, rehearse in time.',
    href: RHYMEPAGE.site, cta: 'Open RhymePage', section: 'apps',
    quip: 'For when the bars won’t come.', accent: '#4be38f',
  },
];

// Every game, ordered so neighbouring sprites look different from each other.
const ORBIT_GAMES = ['brain-splitter', 'imu', 'numdrop', 'imi', 'dungeon-groove', 'imw', 'imt', 'im-merger', 'im-shred', 'ims', 'imv'];

const GAME_ITEMS: OrbitItem[] = ORBIT_GAMES.map((id) => {
  const g = GAMES.find((x) => x.id === id)!;
  return {
    id: g.id, ring: 'games', name: g.title, icon: g.orbit?.src ?? g.thumb.src, pixel: g.orbit?.pixel,
    status: g.tag, line: g.hook.join(' '), href: g.url, cta: 'Play now', section: 'games',
    quip: g.comment ?? `${g.title}. Good pick.`, accent: g.theme.a,
  };
});

export const ORBIT_ITEMS = [...APP_ITEMS, ...GAME_ITEMS];

export const GAME_HUBS = [
  { id: 'gurpy', title: 'Gurpy Games', url: 'https://gg.arrangedgodly.com/', line: 'Every game in one arcade.' },
  { id: 'monkey', title: 'Infinite Monkey Industries', url: 'https://monkey.arrangedgodly.com/', line: 'A tower of monkey office games.' },
];

export const SIDE_PROJECTS = [
  {
    id: 'voxchain',
    title: 'VOXCHAIN',
    url: 'https://voxchain.arrangedgodly.com/',
    line: 'A vocal effects chain for karaoke that a browser agent can edit.',
    mark: voxchainMark,
  },
  {
    id: 'carsdb',
    title: 'CarsDB',
    url: 'https://cars.arrangedgodly.com/',
    line: 'Every Mattel Pixar Cars casting, plus the ones I still want.',
    mark: carsdbMark,
  },
  {
    id: 'arranged-godly',
    title: 'Arranged Godly',
    url: 'https://arrangedgodly.com/',
    line: 'My music and Max for Live devices, inside a dream device.',
    image: arrangedGodlyDevice,
  },
] as const;

export const EMAIL = 'hello@graydonwasil.com';
export const GITHUB = 'https://github.com/gradywasil';
