"""Textures for 141, from the owner's high-plains photos (photos/1000137317..322): the rusty roof and white siding of
an arched barn, plywood, sandy ground with pebbles, dry brush, dry grass, and two backdrops: layered cloud, and cloud
over the mountains (mirrored so its ends meet).   python3 tools/tex_141.py"""
import numpy as np, cv2
from PIL import Image, ImageOps
_s = open('tools/tex_131.py').read(); exec(_s[_s.index('import os'):_s.index('for n, name, box')]); exec(_s[_s.index('def rgba'):_s.index('# the tar-sealed crack')])
def load(n): return cv2.cvtColor(np.asarray(ImageOps.exif_transpose(Image.open(f"photos/1000137{n}.jpg")).convert("RGB")), cv2.COLOR_RGB2BGR)
for n, name, box, size, flat, ns in [
    ("319", "g141_rust_roof", (0.0, 0.0, 1.0, 0.165), 1024, 6, 2.5),
    ("319", "g141_siding_white", (0.66, 0.29, 1.0, 0.41), 512, 5, 2.0),
    ("317", "g141_sand_pebbles", (0.0, 0.0, 1.0, 0.56), 1024, 6, 2.5),
    ("319", "g141_dry_brush", (0.0, 0.56, 1.0, 0.72), 1024, 6, 3.0),
    ("318", "g141_dry_grass", (0.0, 0.62, 0.36, 0.80), 1024, 6, 2.5)]:
    t = seam_margin(crop(load(n), *box), size, flat); save(name, t); save(name + "_n", lum_normal(t, ns, 1.0))
# plywood: one sheet, not tiled
p = crop(load("319"), 0.09, 0.27, 0.33, 0.335); p = cv2.resize(p, (512, int(512 * p.shape[0] / p.shape[1])), interpolation=cv2.INTER_AREA); save("g141_plywood", p)
# backdrops: a strip, its right half the left half mirrored, so it wraps round without a seam
def wrap(img, w, h):
    a = cv2.resize(img, (w // 2, h), interpolation=cv2.INTER_AREA); b = a[:, ::-1]; out = np.concatenate([a, b], 1).astype(np.float32)
    k = 24; t = np.linspace(0, 1, k)[None, :, None]; m = (out[:, w // 2 - k:w // 2] * (1 - t) + out[:, w // 2:w // 2 + k][:, ::-1] * t); out[:, w // 2 - k:w // 2] = m; return out.clip(0, 255).astype(np.uint8)
save("g141_horizon", wrap(crop(load("320"), 0.0, 0.0, 1.0, 0.86), 2048, 512))
save("g141_clouds", wrap(crop(load("322"), 0.0, 0.0, 0.70, 0.74), 2048, 512))
