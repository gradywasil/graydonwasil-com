"""Render the COUCH·OS previews: each title's animated library art as a seamless 60 fps loop.

The art is drawn live on the console's canvas. Recording it in real time from a headless browser
drops most frames (the first attempt kept 9 frames in 6 seconds), so this stops the page's clock
instead: requestAnimationFrame, performance.now and Date.now only move when we step them, one
exact 1/60 s at a time, and each step's picture is grabbed. However slow the render, every frame
is the next one. The last half second then crossfades into the first, so the loop has no seam.

  python scripts/capture-couch-previews.py            # all twelve
  python scripts/capture-couch-previews.py 3 4        # just titles 3..6 (library order)

Writes src/assets/couch-os/<id>.mp4. Needs playwright (with Chromium), Pillow and imageio-ffmpeg.
Titles run four at a time; all twelve take about 45 minutes (headless rendering is slow, not choppy).
"""
import base64, os, re, subprocess, sys, tempfile
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'src/assets/couch-os'
URL = 'https://couch-os.arrangedgodly.com/'
FPS, SECS, WIDTH, CRF = 60, 6.5, 960, '30'
# The titles, in the console's library order (the same order as src/data/couch-os.ts).
IDS = re.findall(r"^\s+t\('([a-z-]+)'", (ROOT / 'src/data/couch-os.ts').read_text(encoding='utf-8'), re.M)

CLOCK = """(() => {
  let t = 0, id = 0; const q = new Map(); const t0 = Date.now();
  performance.now = () => t; Date.now = () => t0 + Math.floor(t);
  window.requestAnimationFrame = (cb) => { q.set(++id, cb); return id; };
  window.cancelAnimationFrame = (i) => { q.delete(i); };
  window.__vt = (dt) => { t += dt; const cbs = [...q.values()]; q.clear(); for (const cb of cbs) { try { cb(t); } catch (e) { console.error(e); } } };
})();"""
RUN = '([n, d]) => { for (let i = 0; i < n; i++) window.__vt(d); }'
# The art region of the library's hero (at a 1440 x 900 viewport), both canvas layers.
GRAB = """([W]) => {
  const [a, b] = [...document.querySelectorAll('canvas')];
  const src = a.getBoundingClientRect(), k = a.width / src.width;
  const sx = (90 - src.x) * k, sy = (180 - src.y) * k, sw = 756 * k, sh = 436 * k;
  const H = Math.round(W * sh / sw / 2) * 2;
  const c = window.__grab ||= document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d'); g.imageSmoothingQuality = 'high';
  g.fillStyle = '#07060b'; g.fillRect(0, 0, W, H);
  g.drawImage(a, sx, sy, sw, sh, 0, 0, W, H); if (b) g.drawImage(b, sx, sy, sw, sh, 0, 0, W, H);
  return c.toDataURL('image/png').slice(22);
}"""


def capture(index: int, frames: Path) -> None:
    from playwright.sync_api import sync_playwright
    step = 1000 / FPS
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={'width': 1440, 'height': 900}, device_scale_factor=2)
        page.add_init_script(CLOCK)
        page.goto(URL, wait_until='networkidle')
        for _ in range(30):  # load and settle, with both clocks moving
            page.evaluate(RUN, [6, step]); page.wait_for_timeout(100)
        for _ in range(index):
            page.keyboard.press('ArrowRight'); page.evaluate(RUN, [24, step]); page.wait_for_timeout(150)
        page.evaluate(RUN, [90, step]); page.wait_for_timeout(400); page.evaluate(RUN, [18, step])
        for f in range(int(SECS * FPS)):
            page.evaluate('(d) => window.__vt(d)', step)
            (frames / f'{f:04d}.png').write_bytes(base64.b64decode(page.evaluate(GRAB, [WIDTH])))
        browser.close()


def encode(frames: Path, dst: Path) -> None:
    import imageio_ffmpeg
    from PIL import Image
    fs = sorted(frames.glob('*.png')); n, fade = len(fs), FPS // 2
    w, h = Image.open(fs[0]).size
    ff = subprocess.Popen([
        imageio_ffmpeg.get_ffmpeg_exe(), '-y', '-loglevel', 'error',
        '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{w}x{h}', '-r', str(FPS), '-i', '-',
        '-c:v', 'libx264', '-preset', 'veryslow', '-tune', 'animation', '-crf', CRF, '-pix_fmt', 'yuv420p',
        '-profile:v', 'high', '-g', str(FPS * 2), '-movflags', '+faststart', '-an', str(dst),
    ], stdin=subprocess.PIPE)
    rgb = lambda i: Image.open(fs[i]).convert('RGB')
    for i in range(fade, n - fade):
        ff.stdin.write(rgb(i).tobytes())
    for i in range(fade):  # the tail fading into the head, ending where the loop restarts
        ff.stdin.write(Image.blend(rgb(n - fade + i), rgb(i), (i + 1) / (fade + 1)).tobytes())
    ff.stdin.close(); ff.wait()


def one(index: int) -> str:
    with tempfile.TemporaryDirectory() as tmp:
        capture(index, Path(tmp))
        dst = OUT / f'{IDS[index]}.mp4'
        encode(Path(tmp), dst)
    return f'{IDS[index]}: {dst.stat().st_size // 1024} KB'


if __name__ == '__main__':
    first = int(sys.argv[1]) if len(sys.argv) > 1 else 0
    count = int(sys.argv[2]) if len(sys.argv) > 2 else len(IDS) - first
    with ProcessPoolExecutor(max_workers=min(4, os.cpu_count() or 1)) as pool:
        for line in pool.map(one, range(first, first + count)):
            print(line, flush=True)
