"""Textures for 143, from the owner's photos (photos/100002xxxx.jpg, 100001xxxx.jpg): surfaces only. The games,
toys, packaging, posters and stickers in these photos are other people's work and are not copied.
  python3 tools/tex_143.py"""
import numpy as np, cv2
from PIL import Image, ImageOps
_s = open('tools/tex_131.py').read(); exec(_s[_s.index('import os'):_s.index('for n, name, box')])
def load(n): return cv2.cvtColor(np.asarray(ImageOps.exif_transpose(Image.open(f"photos/10000{n}.jpg")).convert("RGB")), cv2.COLOR_RGB2BGR)
for n, name, box, size, flat, ns in [
    ("20034", "g143_clay_cracked", (0.15, 0.39, 0.25, 0.46), 512, 4, 3.0),        # dried grey clay, crazed
    ("20034", "g143_wood_counter", (0.0, 0.84, 0.60, 1.0), 1024, 5, 1.2),          # the varnished counter under the heads
    ("19233", "g143_steel_scratched", (0.02, 0.62, 0.98, 0.98), 1024, 4, 1.5),    # the scratched steel door
    ("19271", "g143_plaza_tile", (0.68, 0.80, 0.98, 0.99), 1024, 5, 2.0),          # the tiled pavement round the pole
    ("19271", "g143_pole_steel", (0.30, 0.03, 0.66, 0.28), 512, 3, 1.0),           # the worn grey pole (sticker left off)
    ("20281", "g143_plaster", (0.34, 0.40, 0.56, 0.47), 512, 4, 2.0),             # the painted plaster of the bust
    ("23260", "g143_foam", (0.0, 0.0, 0.18, 0.55), 512, 5, 2.5)]:                 # the dark green case foam
    t = seam_margin(crop(load(n), *box), size, flat); save(name, t); save(name + "_n", lum_normal(t, ns, 1.0))
