import bcCodesThumbnail from '../assets/experiments/bc-codes.png';
import biomeGeneratorThumbnail from '../assets/experiments/biome-generator.png';
import gearsThumbnail from '../assets/experiments/gears.png';
import harmonographThumbnail from '../assets/experiments/harmonograph.png';
import howVotesFlowThumbnail from '../assets/experiments/how-votes-flow.png';
import loomThumbnail from '../assets/experiments/loom.png';
import messageBoardThumbnail from '../assets/experiments/message-board.png';
import morseCodeThumbnail from '../assets/experiments/morse-code.png';
import readPacerThumbnail from '../assets/experiments/read-pacer.png';
import terrariumThumbnail from '../assets/experiments/terrarium.png';
import threadArtThumbnail from '../assets/experiments/thread-art.png';
import trafficThumbnail from '../assets/experiments/traffic.png';
import typographyMatcherThumbnail from '../assets/experiments/typography-matcher.png';
import writersBlockThumbnail from '../assets/experiments/writers-block.png';
import desktopSimThumbnail from '../assets/experiments/desktop-sim.png';
import bitbounceThumbnail from '../assets/experiments/bitbounce.png';
import cordsThumbnail from '../assets/experiments/cords.png';

/** A slot in a project's gallery. `key` is the capture slot — it becomes part
 *  of the filename as `{project.id}-{key}-{light|dark}[-mobile]`, so it has to
 *  match what the shot list asks for. `hero` does double duty: it is the image
 *  on the home page exhibit and the one that opens into this detail page. */
export type ProjectImageSlot = 'hero' | 'shot-2' | 'shot-3';

export interface ProjectImageShot {
  kind: 'image';
  key: ProjectImageSlot;
  label: string;
}

export interface ProjectYoutubeShot {
  kind: 'youtube';
  key: 'demo';
  label: string;
  youtubeId: string;
}

export type ProjectShot = ProjectImageShot | ProjectYoutubeShot;

export type ProjectCollection = 'featured' | 'experiment';

export interface Project {
  collection: 'featured';
  id: string;
  num: string;
  title: string;
  url: string;
  sourceUrl?: string;
  demoUrl?: string;
  demoLabel?: string;
  year: string;
  tagline: string;
  blurb: string;
  bullets: string[];
  stack: string[];
  tags: string[];
  learned: string;
  shots: ProjectShot[];
}

export interface Experiment {
  collection: 'experiment';
  id: string;
  title: string;
  url: string;
  sourceUrl?: string;
  description: string;
  tags: string[];
  createdAt: string;
  /** A local, cropped screenshot added to /public/experiments when available. */
  thumbnail?: string;
}

const FEATURED_PROJECTS: Project[] = [
  {
    collection: 'featured',
    id: 'voxchain',
    num: '01',
    title: 'VOXCHAIN',
    url: 'voxchain.arrangedgodly.com',
    sourceUrl: 'https://github.com/ArtofFish/voxchain',
    demoUrl: 'https://youtu.be/chm-IvQGqzQ',
    demoLabel: 'Watch the 2:56 demo',
    year: '2026',
    tagline: 'Build a vocal effects chain by hand or with a plain-language browser agent.',
    blurb:
      'VOXCHAIN is a browser-based vocal effects chain built for karaoke. Simple view lets me pick a sound from the preset library. Advanced view exposes the full signal path. In a WebMCP-capable browser, an agent can turn a plain-language request into a visible edit while Start, microphone selection, Bypass, and the terminal limiter stay under human control.',
    bullets: [
      'Simple view for 33 factory presets and saved sounds',
      'Advanced view for 14 effects, chain order, and parameters',
      'Ten WebMCP tools edit the visible, audible chain',
      'Human-only microphone, Bypass, and safety recovery controls',
    ],
    stack: ['Web Audio', 'AudioWorklet', 'WebMCP', 'Local storage'],
    tags: ['Web app', 'Audio'],
    learned: 'Agent control works better when it edits the same visible state as the person.',
    shots: [
      { kind: 'youtube', key: 'demo', label: 'Watch the VOXCHAIN explanation', youtubeId: 'chm-IvQGqzQ' },
      { kind: 'image', key: 'hero', label: 'Simple view' },
      { kind: 'image', key: 'shot-2', label: 'Advanced view' },
    ],
  },
  {
    collection: 'featured',
    id: 'rhymepage',
    num: '02',
    title: 'RhymePage',
    url: 'rhymepage.com',
    year: '2025',
    tagline: 'Write with the track, time each line, then rehearse it like a teleprompter.',
    blurb:
      'I built Rhymepage because writing lyrics in a notes app separates the words from the song. Rhymepage puts the track beside the lyrics, lets me mark when each line starts, and scrolls the finished draft in time like a teleprompter. It also searches for rhymes and syllables when I get stuck.',
    bullets: [
      'Mark when each lyric line starts',
      'Play the lyrics back in time with the song',
      'Search rhymes, near-rhymes, and syllable counts',
      'Save drafts automatically and revisit older versions',
    ],
    stack: ['React', 'Web Audio', 'REST API', 'Local storage'],
    tags: ['Web app', 'Audio'],
    learned: 'The hard part was keeping every timing mark attached when the lyrics changed.',
    shots: [
      { kind: 'image', key: 'hero', label: 'The write screen' },
      { kind: 'image', key: 'shot-2', label: 'Teleprompter playback' },
      { kind: 'image', key: 'shot-3', label: 'Sync marks against the track' },
    ],
  },
  {
    collection: 'featured',
    id: 'collectible-cars',
    num: '03',
    title: 'CarsDB',
    url: 'cars.arrangedgodly.com',
    year: '2026',
    tagline: 'Keep track of every Mattel Pixar Cars casting, plus what I own and still want.',
    blurb:
      'My Pixar Cars collection got too big for a notes app, so I built the database I wanted. I can search every casting, filter the list, mark the cars I own or want, and see what is missing from my shelf. Storing the records was straightforward. Making a large catalog easy to browse was the real problem.',
    bullets: [
      'Search the full catalog and narrow it with filters',
      'Mark each casting as owned, wanted, or rated',
      'Build a shelf view from the cars you own',
      'Compare ratings across the catalog',
    ],
    stack: ['Database', 'Search', 'Auth', 'Image handling'],
    tags: ['Web app', 'Data'],
    learned: 'Collectors know what they are looking for. The filters need to be just as specific.',
    shots: [
      { kind: 'image', key: 'hero', label: 'The catalog' },
      { kind: 'image', key: 'shot-2', label: 'Catalog filters' },
      { kind: 'image', key: 'shot-3', label: 'Owned and wishlist profile' },
    ],
  },
  {
    collection: 'featured',
    id: 'arranged-godly',
    num: '04',
    title: 'Arranged Godly',
    url: 'arrangedgodly.com',
    year: 'ongoing',
    tagline: 'One place for my music, Max for Live devices, and browser games.',
    blurb:
      'I made Arranged Godly because my work did not fit on a normal music page. It holds my releases, free Max for Live tools, and Magic Gunden, the first game I finished. The main challenge was making all of that easy to browse without pretending it was the same kind of thing.',
    bullets: [
      'Play music releases without leaving the page',
      'Download my Max for Live devices for free',
      'Play Magic Gunden in the browser',
      'Move clearly between music, tools, and games',
    ],
    stack: ['Max for Live', 'Game dev', 'Music', 'Static site'],
    tags: ['Audio', 'Games'],
    learned: 'Unrelated work can share a site if each type is easy to find.',
    shots: [
      { kind: 'image', key: 'hero', label: 'The home shelf' },
      { kind: 'image', key: 'shot-2', label: 'Max for Live devices' },
      { kind: 'image', key: 'shot-3', label: 'Magic Gunden' },
    ],
  },
];

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
    id: 'bitbounce',
    title: 'Bitbounce',
    url: 'https://daw.arrangedgodly.com/',
    sourceUrl: 'https://github.com/Arrangedgodly/DAW',
    description: 'Builds chiptune loops from note grids and effects.',
    tags: ['Audio', 'Sequencer'],
    createdAt: '2026-09-02T06:00:00Z',
    thumbnail: bitbounceThumbnail,
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

/** The portfolio has one content source. Slides select the collection they need. */
export const PORTFOLIO_ITEMS: Array<Project | Experiment> = [...FEATURED_PROJECTS, ...EXPERIMENTS];

export const PROJECTS = PORTFOLIO_ITEMS.filter(
  (item): item is Project => item.collection === 'featured',
);
