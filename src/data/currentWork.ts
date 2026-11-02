import kilopixelImage from '../assets/current-work/kilopixel.webp';
import morseImage from '../assets/current-work/morse.webp';
import rhymepageImage from '../assets/screenshots/rhymepage-hero-dark-mobile.webp';
import gurpyImage from '../assets/current-work/gurpy-games.webp';
import monkeyImage from '../assets/current-work/monkey-games.webp';
import kilopixelIcon from '../assets/current-work/kilopixel-icon.png';
import morseIcon from '../assets/current-work/morse-icon.png';
import rhymepageIcon from '../assets/current-work/rhymepage-icon.png';

export const CURRENT_APPS = [
  {
    id: 'kilopixel',
    title: 'KiloPixel',
    url: 'https://kilopixel.arrangedgodly.com/',
    description: 'Photos, video and GIFs through live pixel effects.',
    image: kilopixelImage,
    icon: kilopixelIcon,
  },
  {
    id: 'morse',
    title: 'Morse',
    url: 'https://morse.graydonwasil.com/',
    description: 'Send with light and sound. Read flashes back into text.',
    image: morseImage,
    icon: morseIcon,
  },
  {
    id: 'rhymepage',
    title: 'RhymePage',
    url: 'https://rhymepage.com/',
    description: 'Write lyrics, sync them to a track, rehearse in time.',
    image: rhymepageImage,
    icon: rhymepageIcon,
  },
];

export const GAME_COLLECTIONS = [
  {
    id: 'gurpy-games',
    title: 'Gurpy Games',
    url: 'https://gg.arrangedgodly.com/',
    host: 'gg.arrangedgodly.com',
    description: 'Shred office junk, crash a computer, or turn a dungeon fight into a song. My growing browser game collection.',
    image: gurpyImage,
    imageAlt: 'Gurpy Games with Will It Shred? and Monkey Universe in the game collection.',
    action: 'Find your next game',
  },
  {
    id: 'monkey-games',
    title: 'Infinite Monkey Industries',
    url: 'https://monkey.arrangedgodly.com/',
    host: 'monkey.arrangedgodly.com',
    description: 'A tower of monkey office games. Build an empire, survive the night shift, or ride the disposal chutes.',
    image: monkeyImage,
    imageAlt: 'The interactive Infinite Monkey Industries tower with its monkey office floors.',
    action: 'Explore the tower',
  },
];
