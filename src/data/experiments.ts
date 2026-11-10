import bcCodesThumbnail from '../assets/experiments/bc-codes.webp';
import biomeGeneratorThumbnail from '../assets/experiments/biome-generator.webp';
import gearsThumbnail from '../assets/experiments/gears.webp';
import harmonographThumbnail from '../assets/experiments/harmonograph.webp';
import howVotesFlowThumbnail from '../assets/experiments/how-votes-flow.webp';
import loomThumbnail from '../assets/experiments/loom.webp';
import messageBoardThumbnail from '../assets/experiments/message-board.webp';
import morseCodeThumbnail from '../assets/experiments/morse-code.webp';
import readPacerThumbnail from '../assets/experiments/read-pacer.webp';
import terrariumThumbnail from '../assets/experiments/terrarium.webp';
import threadArtThumbnail from '../assets/experiments/thread-art.webp';
import trafficThumbnail from '../assets/experiments/traffic.webp';
import typographyMatcherThumbnail from '../assets/experiments/typography-matcher.webp';
import writersBlockThumbnail from '../assets/experiments/writers-block.webp';
import desktopSimThumbnail from '../assets/experiments/desktop-sim.webp';
import cordsThumbnail from '../assets/experiments/cords.webp';

/** A small browser experiment. Opens live in a new tab. */
export interface Experiment {
  collection: 'experiment';
  id: string;
  title: string;
  url: string;
  sourceUrl?: string;
  description: string;
  tags: string[];
  createdAt: string;
  thumbnail?: string;
}

export const EXPERIMENTS: Experiment[] = [
  {
    collection: 'experiment',
    id: 'thread-art',
    title: 'Thread Art',
    url: 'https://thread.graydonwasil.com/',
    sourceUrl: 'https://github.com/arrangedgodly/thread-art',
    description: 'Turns an image into adjustable thread art.',
    tags: ['Generative', 'Browser tool'],
    createdAt: '2026-08-28T03:49:29Z',
    thumbnail: threadArtThumbnail,
  },
  {
    collection: 'experiment',
    id: 'biome-generator',
    title: 'Biome Generator',
    url: 'https://biome.graydonwasil.com/',
    sourceUrl: 'https://github.com/arrangedgodly/biome-generator',
    description: 'Builds a landscape from height and rainfall.',
    tags: ['Generative', 'Interactive'],
    createdAt: '2026-08-28T02:50:19Z',
    thumbnail: biomeGeneratorThumbnail,
  },
  {
    collection: 'experiment',
    id: 'loom',
    title: 'LOOM',
    url: 'https://loom.arrangedgodly.com/',
    sourceUrl: 'https://github.com/arrangedgodly/loom',
    description: 'Turns a changing grid into pictures and music.',
    tags: ['Generative', 'Audio'],
    createdAt: '2026-08-28T21:05:26Z',
    thumbnail: loomThumbnail,
  },
  {
    collection: 'experiment',
    id: 'traffic',
    title: 'Traffic',
    url: 'https://traffic.graydonwasil.com/',
    sourceUrl: 'https://github.com/arrangedgodly/traffic',
    description: 'Shows how traffic-light timing affects congestion.',
    tags: ['Simulation', 'Interactive'],
    createdAt: '2026-08-28T03:10:52Z',
    thumbnail: trafficThumbnail,
  },
  {
    collection: 'experiment',
    id: 'terrarium',
    title: 'Terrarium',
    url: 'https://terrarium.arrangedgodly.com/',
    sourceUrl: 'https://github.com/arrangedgodly/terrarium',
    description: 'Shows how growing conditions change a terrarium.',
    tags: ['Simulation', 'Procedural'],
    createdAt: '2026-08-29T06:00:26Z',
    thumbnail: terrariumThumbnail,
  },
  {
    collection: 'experiment',
    id: 'typography-matcher',
    title: 'Blind Test',
    url: 'https://font.graydonwasil.com/',
    sourceUrl: 'https://github.com/Arrangedgodly/typography-matcher',
    description: 'Hides font names so I judge the look first.',
    tags: ['Typography', 'Interactive'],
    createdAt: '2026-08-29T14:49:56Z',
    thumbnail: typographyMatcherThumbnail,
  },
  {
    collection: 'experiment',
    id: 'how-votes-flow',
    title: 'How Votes Flow',
    url: 'https://vote.graydonwasil.com/',
    sourceUrl: 'https://github.com/Arrangedgodly/how-votes-flow',
    description: 'Shows where votes go after each elimination.',
    tags: ['Civic Tech', 'Simulation'],
    createdAt: '2026-08-29T14:47:36Z',
    thumbnail: howVotesFlowThumbnail,
  },
  {
    collection: 'experiment',
    id: 'writers-block',
    title: 'The Disappearing Draft',
    url: 'https://draft.graydonwasil.com/',
    sourceUrl: 'https://github.com/Arrangedgodly/writers-block',
    description: 'Deletes my draft if I stop typing.',
    tags: ['Writing', 'Timer'],
    createdAt: '2026-08-29T15:08:40Z',
    thumbnail: writersBlockThumbnail,
  },
  {
    collection: 'experiment',
    id: 'read-pacer',
    title: 'Reading Pacer',
    url: 'https://pacer.graydonwasil.com/',
    sourceUrl: 'https://github.com/Arrangedgodly/read-pacer',
    description: 'Works out how many pages I need to read each day.',
    tags: ['Reading', 'Planner'],
    createdAt: '2026-08-29T14:51:50Z',
    thumbnail: readPacerThumbnail,
  },
  {
    collection: 'experiment',
    id: 'bc-codes',
    title: 'bc-codes',
    url: 'https://codes.arrangedgodly.com/',
    sourceUrl: 'https://github.com/Arrangedgodly/bc-codes',
    description: 'Gives each verified fan one unused Bandcamp code.',
    tags: ['Music', 'Fan tools'],
    createdAt: '2026-08-29T16:49:10Z',
    thumbnail: bcCodesThumbnail,
  },
  {
    collection: 'experiment',
    id: 'morse-code',
    title: 'The Register',
    url: 'https://morsecode.graydonwasil.com/',
    sourceUrl: 'https://github.com/Arrangedgodly/morse-code',
    description: 'Plays a message as Morse code using light or sound.',
    tags: ['Morse code', 'Browser tool'],
    createdAt: '2026-08-29T18:00:00Z',
    thumbnail: morseCodeThumbnail,
  },
  {
    collection: 'experiment',
    id: 'gears',
    title: 'The Interlocking Gear Animator',
    url: 'https://gears.graydonwasil.com/',
    sourceUrl: 'https://github.com/Arrangedgodly/gears',
    description: 'Shows how one turning gear moves the rest.',
    tags: ['Simulation', 'Interactive'],
    createdAt: '2026-08-30T05:00:00Z',
    thumbnail: gearsThumbnail,
  },
  {
    collection: 'experiment',
    id: 'harmonograph',
    title: 'The Digital Harmonograph',
    url: 'https://harmonograph.arrangedgodly.com/',
    sourceUrl: 'https://github.com/Arrangedgodly/harmonograph',
    description: 'Draws the patterns made by swinging pendulums.',
    tags: ['Generative', 'Simulation'],
    createdAt: '2026-08-31T05:00:00Z',
    thumbnail: harmonographThumbnail,
  },
  {
    collection: 'experiment',
    id: 'message-board',
    title: 'Message Board',
    url: 'https://board.graydonwasil.com/',
    sourceUrl: 'https://github.com/Arrangedgodly/message-board-new',
    description: "Keeps every post in the visitor's browser.",
    tags: ['Community', 'Browser tool'],
    createdAt: '2026-09-01T05:00:00Z',
    thumbnail: messageBoardThumbnail,
  },
  {
    collection: 'experiment',
    id: 'desktop-sim',
    title: 'HOLD/OS',
    url: 'https://desktop.graydonwasil.com/',
    sourceUrl: 'https://github.com/Arrangedgodly/desktop-sim',
    description: 'Runs a fantasy desktop and 18 apps in one browser tab.',
    tags: ['Simulation', 'Local-first'],
    createdAt: '2026-09-02T05:00:00Z',
    thumbnail: desktopSimThumbnail,
  },
  {
    collection: 'experiment',
    id: 'cords',
    title: 'Cords',
    url: 'https://cords.arrangedgodly.com/',
    sourceUrl: 'https://github.com/Arrangedgodly/cords',
    description: 'Lets me drag, plug in, stretch, and snap patch cables.',
    tags: ['Physics', 'Interactive'],
    createdAt: '2026-09-03T05:00:00Z',
    thumbnail: cordsThumbnail,
  },
];
