"""Converts assets/textures/* into WebP and packs them for the published build (tools/build_web.mjs).
  python3 tools/pack_textures.py <textures dir> <out dir>
Quality policy (the PNGs in the repo stay the masters):
  - photos / colour maps: lossy WebP q88; normal maps: lossy q90; images with transparency: lossy colour + lossless
    alpha (cut-out edges stay exact). Game textures are seen at a distance, under lighting, mip-mapped: at these
    qualities the difference is invisible in play and the download is ~3.5x smaller than the old q94/lossless policy
  - safety net: if an image decodes with a big error (PSNR < 32 dB: flat graphics, pixel art, sharp lettering) it is
    re-encoded at q96, then losslessly
  - small flat graphics (< 40 KB PNG, not normal maps) stay lossless
  - non-image files (json) are packed as they are
Writes <out>/pack<N>.wasm (8 core + 6 district hash buckets, see below; a served binary type on the artifact host, raw bytes, not WebAssembly) and <out>/packs.json: { "assets/textures/<name>": [pack, offset, length, mime] }
"""
import io, json, os, sys
from multiprocessing import Pool
import numpy as np
from PIL import Image

SRC, OUT = sys.argv[1], sys.argv[2]
LIMIT = 12_000_000

def psnr(a, b):
    mse = np.mean((a.astype(np.float32) - b.astype(np.float32)) ** 2)
    return 99.0 if mse == 0 else 10 * np.log10(255.0 ** 2 / mse)

def encode(name):
    p = os.path.join(SRC, name)
    if not name.lower().endswith('.png'):
        return name, open(p, 'rb').read(), 'application/json' if name.endswith('.json') else 'application/octet-stream', 'raw'
    im = Image.open(p); im.load()
    rgba = im.convert('RGBA'); has_alpha = np.asarray(rgba)[:, :, 3].min() < 255
    src = rgba if has_alpha else im.convert('RGB')
    stem = os.path.splitext(name)[0]
    normal = stem.endswith('_n') or stem.endswith('_normal')
    def enc(**kw):
        b = io.BytesIO(); src.save(b, 'WEBP', **kw); return b.getvalue()
    if os.path.getsize(p) < 40_000 and not normal:
        data, how = enc(lossless=True, quality=100, method=5), 'lossless'
    else:
        ref = np.asarray(src)
        for q in ((90, 96) if normal else (88, 96)):
            data = enc(quality=q, method=6, alpha_quality=100)
            if psnr(ref, np.asarray(Image.open(io.BytesIO(data)).convert(src.mode))) >= 32: how = f'q{q}'; break
        else:
            data, how = enc(lossless=True, quality=100, method=5), 'lossless'
    if len(data) >= os.path.getsize(p):          # never ship something bigger than the PNG: keep the PNG bytes then
        return name, open(p, 'rb').read(), 'image/png', 'png'
    return name, data, 'image/webp', how

if __name__ == '__main__':
    names = sorted(os.listdir(SRC))
    with Pool() as pool: res = pool.map(encode, names)
    # each file goes to a fixed pack chosen by a hash of its name, so adding or changing one texture only changes one
    # pack (and the published update stays small); packs are written in name order inside
    import zlib
    # two zones: 'core' textures (the old town, where you start, plus anything shared) are packed into NC packs the
    # game waits for; 'district' textures (only used by the district sites, see tools/record_zones.js) go into ND packs
    # that stream in the background after the game has started. Within a zone a file's pack is a hash of its name, so
    # adding a texture only changes one pack.
    zf = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'texture_zones.json')
    zj = json.load(open(zf)) if os.path.exists(zf) else {}
    district = set(zj.get('district', [])); corelist = set(zj.get('core', []))
    if corelist: district |= {n for n, _, _, _ in res if n not in corelist}   # unused files ride in the background packs
    NC, ND = 8, 6
    packs = [bytearray() for _ in range(NC + ND)]; index = {}
    for name, data, mime, how in res:
        k = NC + zlib.crc32(name.encode()) % ND if name in district else zlib.crc32(name.encode()) % NC
        index['assets/textures/' + name] = [k, len(packs[k]), len(data), mime]; packs[k] += data
    for i, b in enumerate(packs): open(os.path.join(OUT, f'pack{i}.wasm'), 'wb').write(b)
    # a short content hash per pack: the boot script caches packs in the browser under it, so a repeat visit only
    # downloads the packs that changed
    import hashlib
    json.dump({'packs': [len(b) for b in packs], 'hashes': [hashlib.sha1(b).hexdigest()[:12] for b in packs], 'core': list(range(NC)), 'files': index}, open(os.path.join(OUT, 'packs.json'), 'w'))
    tot = sum(os.path.getsize(os.path.join(SRC, n)) for n in names)
    kinds = {}
    for _, _, _, how in res: kinds[how] = kinds.get(how, 0) + 1
    print(f'textures: {len(names)} files {tot / 1e6:.1f} MB -> {len(packs)} packs {sum(map(len, packs)) / 1e6:.1f} MB  {kinds}')
