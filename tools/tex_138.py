"""Textures for 138, from the supermarket photos (photos/10001xxxxx.jpg): surfaces only (packaging is other people's).
  python3 tools/tex_138.py"""
import numpy as np, cv2
from PIL import Image, ImageOps
_s = open('tools/tex_131.py').read(); exec(_s[_s.index('import os'):_s.index('for n, name, box')])
def load(n): return cv2.cvtColor(np.asarray(ImageOps.exif_transpose(Image.open(f"photos/1000{n}.jpg")).convert("RGB")), cv2.COLOR_RGB2BGR)
for n, name, box, size, flat, ns in [
    ("107372", "g138_floor_polished", (0.04, 0.87, 0.46, 0.99), 1024, 3, 0.5),     # the shop floor: sealed tan concrete
    ("100585", "g138_floor_backroom", (0.10, 0.74, 0.90, 0.99), 1024, 5, 1.5),     # back room: grey, scuffed
    ("113863", "g138_cooler_panel", (0.01, 0.06, 0.17, 0.28), 512, 4, 2.0),        # embossed walk-in cooler wall
    ("107126", "g138_tile_dark", (0.46, 0.86, 0.76, 0.99), 1024, 4, 1.5)]:         # lobby tile
    t = seam_margin(crop(load(n), *box), size, flat); save(name, t); save(name + "_n", lum_normal(t, ns, 1.0))
