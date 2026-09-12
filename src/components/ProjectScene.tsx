import { m } from 'motion/react';

interface ProjectSceneProps {
  projectId: string;
  reducedMotion: boolean;
}

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

function VoxchainScene({ reducedMotion }: { reducedMotion: boolean }) {
  const modules = ['IN', 'TONE', 'COMP', 'SPACE', 'SAFE'];

  return (
    <>
      <div className="scene-readout mono">MIC / LIVE FX / OUT</div>
      <div className="scene-voxchain-wave">
        {Array.from({ length: 22 }, (_, index) => (
          <m.i
            key={index}
            animate={reducedMotion ? { scaleY: 0.45 + ((index * 7) % 10) / 20 } : {
              scaleY: [0.22, 0.55 + ((index * 7) % 10) / 16, 0.28],
            }}
            transition={reducedMotion ? { duration: 0 } : {
              duration: 1.05 + (index % 5) * 0.12,
              delay: index * 0.035,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
      <div className="scene-voxchain-route">
        <span className="scene-route-line" />
        <m.span
          className="scene-route-pulse"
          animate={reducedMotion ? { y: '440%', opacity: 0.8 } : {
            y: ['0%', '880%'],
            opacity: [0, 1, 1, 0],
          }}
          transition={reducedMotion ? { duration: 0 } : {
            duration: 3.4,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        {modules.map((label, index) => (
          <m.span
            className="scene-voxchain-module mono"
            key={label}
            animate={reducedMotion ? { opacity: 0.72 } : {
              opacity: [0.42, 1, 0.42],
              scale: [1, 1.045, 1],
            }}
            transition={reducedMotion ? { duration: 0 } : {
              duration: 3.4,
              delay: index * 0.68,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <i />
            {label}
          </m.span>
        ))}
      </div>
    </>
  );
}

function RhymepageScene({ reducedMotion }: { reducedMotion: boolean }) {
  const lines = [88, 62, 76, 48, 82, 69];

  return (
    <>
      <div className="scene-readout mono">VERSE 02 / 96 BPM / SYNC</div>
      <div className="scene-rhyme-ruler mono">
        <span>00:12</span><span>00:16</span><span>00:20</span><span>00:24</span>
      </div>
      <div className="scene-rhyme-sheet">
        <m.div
          className="scene-rhyme-cursor"
          animate={reducedMotion ? { y: '210%' } : { y: ['0%', '520%'] }}
          transition={reducedMotion ? { duration: 0 } : {
            duration: 5.2,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        {lines.map((width, index) => (
          <m.div
            className="scene-rhyme-line"
            key={`${width}-${index}`}
            animate={reducedMotion ? { opacity: 0.64 } : {
              opacity: [0.32, 0.92, 0.42],
            }}
            transition={reducedMotion ? { duration: 0 } : {
              duration: 5.2,
              delay: index * 0.72,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <span style={{ width: `${width}%` }} />
            <i />
          </m.div>
        ))}
      </div>
    </>
  );
}

function CarsDbScene({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <>
      <div className="scene-readout mono">CATALOG / 1,247 CASTINGS / FILTERED</div>
      <div className="scene-cars-query mono">
        <span>MAKE: MATTEL</span><span>STATUS: OWNED</span><span>SORT: YEAR</span>
      </div>
      <div className="scene-cars-grid">
        <m.i
          className="scene-cars-scan"
          animate={reducedMotion ? { x: '260%', opacity: 0.38 } : {
            x: ['-100%', '650%'],
            opacity: [0, 0.48, 0.48, 0],
          }}
          transition={reducedMotion ? { duration: 0 } : {
            duration: 4.6,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        {Array.from({ length: 12 }, (_, index) => (
          <m.span
            key={index}
            animate={reducedMotion ? { y: 0, opacity: 0.62 } : {
              y: [0, -5, 0],
              opacity: [0.38, 0.94, 0.52],
            }}
            transition={reducedMotion ? { duration: 0 } : {
              duration: 4.6,
              delay: index * 0.23,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <i />
            <b>{String(index + 1).padStart(3, '0')}</b>
          </m.span>
        ))}
      </div>
    </>
  );
}

function ArrangedGodlyScene({ reducedMotion }: { reducedMotion: boolean }) {
  const channels = ['MUSIC', 'DEVICE', 'GAME'];

  return (
    <>
      <div className="scene-readout mono">ARRANGEMENT / 03 CHANNELS / PLAYING</div>
      <div className="scene-arranged-grid">
        <m.i
          className="scene-arranged-playhead"
          animate={reducedMotion ? { x: '700%', opacity: 0.7 } : {
            x: ['0%', '1500%'],
            opacity: [0.24, 0.9, 0.24],
          }}
          transition={reducedMotion ? { duration: 0 } : {
            duration: 4.8,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        {channels.map((channel, row) => (
          <div className="scene-arranged-channel" key={channel}>
            <span className="mono">{channel}</span>
            <div>
              {Array.from({ length: 16 }, (_, index) => (
                <m.i
                  key={index}
                  animate={reducedMotion ? { opacity: index % (row + 3) === 0 ? 0.9 : 0.28 } : {
                    opacity: [0.48, index % (row + 3) === 0 ? 1 : 0.72, 0.48],
                    scaleY: [0.6, index % (row + 3) === 0 ? 1 : 0.78, 0.6],
                  }}
                  transition={reducedMotion ? { duration: 0 } : {
                    duration: 2.4,
                    delay: index * 0.12 + row * 0.28,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export function ProjectScene({ projectId, reducedMotion }: ProjectSceneProps) {
  return (
    <m.div
      className="project-scene"
      data-project={projectId}
      data-motion={reducedMotion ? 'still' : 'live'}
      aria-hidden="true"
      initial={reducedMotion ? undefined : {
        opacity: 0.42,
        clipPath: 'inset(8% 5% 14% 9%)',
        filter: 'blur(7px)',
      }}
      animate={{ opacity: 1, clipPath: 'inset(0)', filter: 'blur(0px)' }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.72, ease: EASE_OUT }}
    >
      <div className="project-scene-grid" />
      <div className="scene-composition">
        {projectId === 'voxchain' && <VoxchainScene reducedMotion={reducedMotion} />}
        {projectId === 'rhymepage' && <RhymepageScene reducedMotion={reducedMotion} />}
        {projectId === 'collectible-cars' && <CarsDbScene reducedMotion={reducedMotion} />}
        {projectId === 'arranged-godly' && <ArrangedGodlyScene reducedMotion={reducedMotion} />}
      </div>
    </m.div>
  );
}
