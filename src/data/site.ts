import morseIcon from '../assets/current-work/morse-icon.png';
import kilopixelIcon from '../assets/current-work/kilopixel-icon.png';
import rhymepageIcon from '../assets/current-work/rhymepage-icon.png';
import bitbounceIcon from '../assets/current-work/bitbounce-icon.png';
import kilopixelScreen from '../assets/kilopixel/app-classic.webp';
import bitbounceScreen from '../assets/bitbounce/phone-edit.webp';
import voxchainMark from '../assets/fun/side/voxchain-mark.svg';
import carsdbMark from '../assets/fun/side/carsdb-mark.svg';
import arrangedGodlyDevice from '../assets/fun/side/arranged-godly.webp';
import introThumb from '../assets/video/who-is-grady-thumb.webp';
import introPoster from '../assets/video/who-is-grady.webp';
import { GAMES } from './games';

/* Store status for each app, in one place. Each platform is one of:
 *   'soon'    not submitted yet: "Coming soon", not a link.
 *   'review'  submitted, not yet approved: the button shows "Coming soon"
 *             and is not a link.
 *   'beta'    a public tester opt-in (Google Play closed testing, TestFlight).
 *             A beta with no url yet shows as "In review", not a link.
 *   'live'    a public listing: the button uses "Get it on" / "Download on".
 * When Apple approves an app, set ios to { state: 'live', url: <App Store URL> }.
 * The URL is https://apps.apple.com/app/id<Apple ID>, where the Apple ID is
 * the number under App Information in App Store Connect. */
export type StoreState = 'soon' | 'review' | 'beta' | 'live';
export interface StoreLink { state: StoreState; url?: string }
export interface AppStores { ios: StoreLink; android: StoreLink }
const stores = (s: AppStores) => s;

export const MORSE = {
  site: 'https://morse.arrangedgodly.com/',
  webApp: 'https://morse.graydonwasil.com/',
  group: 'https://groups.google.com/g/morse-android-testers',
  icon: morseIcon,
  stores: stores({
    ios: { state: 'live', url: 'https://apps.apple.com/us/app/morse/id6831800624' },
    android: { state: 'beta', url: 'https://play.google.com/apps/testing/com.arrangedgodly.morsecode' },
    // Public listing, once out of testing:
    // https://play.google.com/store/apps/details?id=com.arrangedgodly.morsecode
  }),
};

export const KILOPIXEL = {
  site: 'https://kilopixel.arrangedgodly.com/',
  group: 'https://groups.google.com/g/kilopixel-testers',
  icon: kilopixelIcon,
  stores: stores({
    ios: { state: 'live', url: 'https://apps.apple.com/us/app/kilopixel/id6831792534' },
    android: { state: 'beta', url: 'https://play.google.com/apps/testing/com.arrangedgodly.kilopixel' },
    // https://play.google.com/store/apps/details?id=com.arrangedgodly.kilopixel
  }),
};

export const BITBOUNCE = {
  site: 'https://bitbounce.app/',
  icon: bitbounceIcon,
  stores: stores({
    // TestFlight public beta for iPhone and iPad.
    ios: { state: 'beta', url: 'https://testflight.apple.com/join/y4xDruZr' },
    android: { state: 'soon' },
  }),
};

/** The "Who is Grady?" promo reel on YouTube (see IntroVideo). */
export const INTRO = {
  id: 'fXoC3dlrDVc',
  title: 'Who is Grady?',
  length: '1:38',
  url: 'https://youtu.be/fXoC3dlrDVc',
  thumb: introThumb,
  poster: introPoster,
};

export const RHYMEPAGE = { site: 'https://rhymepage.com/', icon: rhymepageIcon };

/** Everything in orbit in the hero. Apps ride the inner ring, games the
 *  outer one. Picking one puts its screen in the middle and shows its card;
 *  `section` is where "more" scrolls to, and games also open in the splash
 *  below. */
/** What stands in the middle of the orbit for the picked item: a real screen of the thing.
 *  'morse' runs the app's own interface and 'lyrics' is RhymePage's rehearsal
 *  sheet, as in their sections; the others are screenshots. */
export type StageScreen =
  | { kind: 'phone'; src: string; w: number; h: number }
  | { kind: 'browser'; src: string; w: number; h: number; host: string }
  | { kind: 'morse' }
  | { kind: 'lyrics' };

export interface OrbitItem {
  id: string;
  ring: 'apps' | 'games';
  name: string;
  icon: string;
  pixel?: boolean;
  status: string;
  line: string;
  /** Apps with store listings show a button per store instead of href/cta. */
  stores?: AppStores;
  href?: string;
  cta?: string;
  section: string;
  accent: string;
  screen: StageScreen;
}

const APP_ITEMS: OrbitItem[] = [
  {
    id: 'morse', ring: 'apps', name: 'Morse', icon: morseIcon, status: 'iPhone & Android',
    line: 'Send a message with light and sound. Another phone reads it back.',
    stores: MORSE.stores, section: 'morse',
    accent: '#f7b24c', screen: { kind: 'morse' },
  },
  {
    id: 'kilopixel', ring: 'apps', name: 'Kilopixel', icon: kilopixelIcon, status: 'iPhone & Android',
    line: 'A live pixel camera for photos, video and GIFs. One camera, 49 looks.',
    stores: KILOPIXEL.stores, section: 'kilopixel',
    accent: '#ff6a1f',
    screen: { kind: 'phone', src: kilopixelScreen, w: 540, h: 1169 },
  },
  {
    id: 'bitbounce', ring: 'apps', name: 'BitBounce', icon: bitbounceIcon, status: 'iPhone & iPad beta',
    line: 'Make the beat, then make it a song. A music studio built like a toy groovebox.',
    stores: BITBOUNCE.stores, section: 'bitbounce',
    accent: '#ff5a1f',
    screen: { kind: 'phone', src: bitbounceScreen, w: 720, h: 1565 },
  },
  {
    id: 'rhymepage', ring: 'apps', name: 'RhymePage', icon: rhymepageIcon, status: 'Web app',
    line: 'Write lyrics, sync them to a track, rehearse in time.',
    href: RHYMEPAGE.site, cta: 'Open RhymePage', section: 'rhymepage',
    accent: '#4be38f', screen: { kind: 'lyrics' },
  },
];

// Every game, ordered so neighbouring sprites look different from each other.
const ORBIT_GAMES = ['brain-splitter', 'imu', 'numdrop', 'imi', 'dungeon-groove', 'imw', 'imt', 'im-merger', 'im-shred', 'ims', 'imv'];

const GAME_ITEMS: OrbitItem[] = ORBIT_GAMES.map((id) => {
  const g = GAMES.find((x) => x.id === id)!;
  return {
    id: g.id, ring: 'games', name: g.title, icon: g.orbit?.src ?? g.thumb.src, pixel: g.orbit?.pixel,
    status: g.tag, line: g.hook.join(' '), href: g.url, cta: 'Play now', section: 'games',
    accent: g.theme.a,
    screen: g.frame === 'phone'
      ? { kind: 'phone', src: g.shot.src, w: g.shot.w, h: g.shot.h }
      : { kind: 'browser', src: g.shot.src, w: g.shot.w, h: g.shot.h, host: g.host },
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
