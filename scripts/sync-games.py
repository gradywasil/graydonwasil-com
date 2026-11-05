"""Pull game branding from the Gurpy Games repo into this site.

    python scripts/sync-games.py [path/to/arcade-ad]

Reads arcade-ad/research/games.json (the same data that builds
gg.arrangedgodly.com), resizes each game's logo, screenshot, thumbnail,
floating sprites and orbit icon to WebP under src/assets/games/<id>/, and
writes src/data/games.json for the site to import. Needs Pillow.
"""
import json
import shutil
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT.parent / 'arcade-ad'
PUBLIC = SRC / 'public'
OUT = ROOT / 'src' / 'assets' / 'games'
DATA = ROOT / 'src' / 'data' / 'games.json'

# One character per game to fly around Gurpy in the hero.
ORBIT = {
    'brain-splitter': '/brain-splitter/brain.png',
    'numdrop': '/stages/numdrop/app-icon.png',
    'imu': '/stages/imu/pioneer.png',
    'imi': '/stages/imi/monkey-pirate-captain.png',
    'ims': '/stages/ims/monkey-bob-boosting.png',
    'dungeon-groove': '/stages/dungeon-groove/lich-dj.png',
    'im-shred': '/stages/im-shred/crew-stomper.png',
    'imt': '/stages/imt/invader-gremlin.png',
    'imw': '/stages/imw/golden-banana.png',
    'imv': '/stages/imv/pest-wasp.png',
    'im-merger': '/stages/im-merger/chairman-bigsby.png',
}
MAX_FLOATERS = 7


def save(src: str, dest: Path, width: int, pixel: bool = False) -> dict:
    im = Image.open(PUBLIC / src.lstrip('/'))
    im = im.convert('RGBA') if im.mode in ('RGBA', 'LA', 'P') else im.convert('RGB')
    small = max(im.size) <= 160
    if not small and im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    if pixel or small:
        im.save(dest, 'WEBP', lossless=True)
    else:
        im.save(dest, 'WEBP', quality=80, method=6)
    return {'file': dest.name, 'w': im.width, 'h': im.height, 'pixel': bool(pixel or small)}


def main() -> None:
    games = [g for g in json.loads((SRC / 'research' / 'games.json').read_text('utf8')) if g.get('kind') != 'experiment']
    if OUT.exists():
        shutil.rmtree(OUT)
    out = []
    for g in games:
        gid = g['id']
        d = OUT / gid
        phone = g['frame'] == 'phone'
        rec = {
            'id': gid,
            'title': g['title'],
            'url': g['url'],
            'kicker': g['kicker'],
            'tag': g['tag'],
            'hook': g.get('tagline') or [g['hook']],
            'description': g['description'],
            'cta': g.get('cta') or f"Play {g['title']}",
            'theme': g['theme'],
            'frame': g['frame'],
            'stats': g.get('stats') or [],
            'chips': g.get('chips') or [],
            'comment': g.get('comment'),
            'shotAlt': g['shotAlt'],
            'shot': save(g['shot'], d / 'shot.webp', 420 if phone else 960),
            'thumb': save(g['thumb'], d / 'thumb.webp', 480),
            'logo': save(g['logo'], d / 'logo.webp', 640) | {'alt': g.get('logoAlt') or g['title']} if g.get('logo') else None,
            'orbit': save(ORBIT[gid], d / 'orbit.webp', 200) if gid in ORBIT else None,
            'floaters': [],
        }
        for i, f in enumerate(g.get('floaters', [])[:MAX_FLOATERS]):
            px = max(240, round(f['w'] * 14))
            info = save(f['src'], d / f'f{i}.webp', px, f.get('pixel', False))
            # `size` is the floater's width as a percent of the stage.
            rec['floaters'].append(info | {'size': f.get('w', 10)} | {k: f.get(k, dflt) for k, dflt in
                                           (('x', 0), ('y', 0), ('r', 0), ('depth', 1), ('speed', 7), ('kind', 'sprite'))})
        out.append(rec)
        print(f"{gid}: {1 + 1 + bool(rec['logo']) + bool(rec['orbit']) + len(rec['floaters'])} images")
    DATA.write_text(json.dumps(out, indent=1) + '\n', 'utf8')
    total = sum(p.stat().st_size for p in OUT.rglob('*.webp'))
    print(f'{len(out)} games, {total // 1024} KB of art -> {OUT.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
