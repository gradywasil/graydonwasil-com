"""Copy the Chromatic cartridges and their emulator into this site.

The Cartridges section runs the real Game Boy Color ROMs from the chromatic
workspace in the browser. This script takes:

  * each game's built ROM (<game>/build/<game>.gbc) and gzips it into
    public/gb/roms/<id>.gbc.gz. Two of them are 4 MB of mostly empty banks and
    shrink to a few hundred KB; the page unpacks them with DecompressionStream.
    The gzip header carries no timestamp, so an unchanged ROM gives an
    unchanged file;
  * binjgb, the MIT-licensed WebAssembly emulator that GB Studio's own web
    export uses (binjgb.js and binjgb.wasm), from any game's build/web folder.

Rebuild a ROM first with `node tools/build.mjs <game>` in the chromatic
workspace. Add a game by adding it to GAMES here and in src/data/cartridges.ts.

Usage (the default path assumes the chromatic workspace beside this repo):

    python scripts/sync-chromatic.py [path/to/chromatic]
"""
import gzip
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT.parent / 'chromatic'
OUT = ROOT / 'public' / 'gb'

# site id -> the game's folder in the chromatic workspace (its ROM is build/<folder>.gbc)
GAMES = {
    'mimic': 'mimic',
    'run-forever': 'run-forever',
    'pocket-typist': 'pocket-typist',
    'numdrop': 'numdrop',
    'storybox': 'storybox',
}

LICENSE = """binjgb: a Game Boy emulator built as WebAssembly.
Copyright (C) 2017 Ben Smith. Fork with changes from Daid and others for GB Studio.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
"""


def main() -> None:
    (OUT / 'roms').mkdir(parents=True, exist_ok=True)

    # The emulator: take it from the first game that has a web build.
    web = next((SRC / f / 'build' / 'web' / 'js' for f in GAMES.values()
                if (SRC / f / 'build' / 'web' / 'js' / 'binjgb.wasm').exists()), None)
    if web is None:
        sys.exit(f'No build/web/js/binjgb.wasm under {SRC}. Run `node tools/build.mjs <game> --web` there first.')
    for name in ('binjgb.js', 'binjgb.wasm'):
        shutil.copyfile(web / name, OUT / name)
    (OUT / 'LICENSE-binjgb.txt').write_text(LICENSE, encoding='utf-8')
    print(f'emulator   {web}')

    for site_id, folder in GAMES.items():
        rom = SRC / folder / 'build' / f'{folder}.gbc'
        if not rom.exists():
            sys.exit(f'Missing {rom}. Build it first: node tools/build.mjs {folder}')
        raw = rom.read_bytes()
        # mtime=0 and no filename keep the output the same for the same ROM.
        packed = gzip.compress(raw, compresslevel=9, mtime=0)
        (OUT / 'roms' / f'{site_id}.gbc.gz').write_bytes(packed)
        print(f'{site_id:<14} {len(raw) / 1024:7.0f} KB -> {len(packed) / 1024:5.0f} KB')


if __name__ == '__main__':
    main()
