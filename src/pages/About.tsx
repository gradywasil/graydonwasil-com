import { Shot } from '../components/Shot';

const CURRENTLY = [
  'Preparing KiloPixel, Morse and RhymePage for Google Play',
  'Building out Gurpy Games and the Infinite Monkey Industries world',
  'Trying to understand what my sourdough starter wants',
  'Spending as much time with my son as I can',
  'Waiting, impatiently, for Enter the Gungeon 2',
];

const TOOLS = [
  'TypeScript',
  'React',
  'CSS',
  'SQL',
  'REST APIs',
  'Authentication',
  'Max for Live',
  'Web Audio',
  'Game loops',
];

export function About() {
  return (
    <div className="aslide">
      <figure className="aslide-photo">
        <Shot
          imageKey="about"
          label="Graydon Wasil portrait"
          alt="Graydon Wasil"
          natural
          /* The deck only mounts the active slide, so this photo is in view
             the moment it exists — lazy would just delay it. */
          loading="eager"
          placeholderRatio="4 / 5"
          /* width:auto so the photo keeps its own proportions inside the
             column rather than being stretched to fill it. */
          style={{ width: 'auto', maxWidth: '100%' }}
        />
      </figure>

      <div className="aslide-body">
        <h2 className="disp aslide-title">
          <span className="line">I became a developer</span>
          <span className="line">by solving my own</span>
          <span className="line">problems.</span>
        </h2>

        <div className="prose">
          <p>
            The first thing I built was a spreadsheet that had quietly become an app. Next came a
            Max for Live device because I wanted a delay I couldn&rsquo;t find. When a collection
            outgrew my notes app, I built the database I needed. That pattern stuck. I find the
            part that wastes time or gets in the way, learn the system around it, and make a
            practical fix.
          </p>
          <p>
            I&rsquo;m a software developer who likes working on the whole application. I organize the
            data, connect the APIs, build the screens, and test it all in the browser. I like taking
            a fuzzy problem and making it concrete enough to try. Then I work through the awkward
            cases until the software behaves the way a person would expect.
          </p>
        </div>

        <div className="aslide-cols">
          <div className="block">
            <h3 className="mono block-label">Currently</h3>
            <ul className="rulelist">
              {CURRENTLY.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>

          <div className="block">
            <h3 className="mono block-label">What I build with</h3>
            <div className="tagrun">
              {TOOLS.map((t) => (
                <span key={t} className="tag tag-outline">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
