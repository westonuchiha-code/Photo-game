"""Textures for 137, from the Japan / Korea street photos (photos/10000xxxxx.jpg): surfaces only. Signs, stickers,
packaging and characters in these photos are other people's artwork and are not turned into textures.
  python3 tools/tex_137.py"""
import numpy as np, cv2
from PIL import Image, ImageOps
_s = open('tools/tex_131.py').read(); exec(_s[_s.index('import os'):_s.index('for n, name, box')])
def load(n): return cv2.cvtColor(np.asarray(ImageOps.exif_transpose(Image.open(f"photos/1000{n}.jpg")).convert("RGB")), cv2.COLOR_RGB2BGR)
for n, name, box, size, flat, ns in [
    ("026928", "g137_brick_brown", (0.0, 0.02, 1.0, 0.26), 1024, 6, 2.5),
    ("017904", "g137_pavers_grey", (0.0, 0.02, 1.0, 0.30), 1024, 6, 2.0),
    ("017904", "g137_granite_wet", (0.25, 0.74, 1.0, 0.98), 1024, 6, 1.5),
    ("026893", "g137_pavers_red", (0.66, 0.66, 1.0, 0.94), 1024, 6, 2.0),
    ("005911", "g137_concrete_stained", (0.0, 0.14, 0.30, 0.48), 1024, 0, 1.5),
    ("009785", "g137_needle_floor", (0.50, 0.80, 1.0, 1.0), 1024, 6, 2.0),
    ("009785", "g137_boulder", (0.30, 0.62, 0.52, 0.73), 512, 3, 2.5),
    ("007952", "g137_fur_tabby", (0.10, 0.42, 0.40, 0.64), 512, 5, 1.0),
    ("026857", "g137_weeds", (0.40, 0.56, 0.70, 0.66), 1024, 6, 2.0),
    ("015127", "g137_azalea", (0.36, 0.12, 0.76, 0.44), 1024, 6, 2.0),
    ("017879", "g137_grime_wall", (0.07, 0.30, 0.30, 0.45), 1024, 0, 1.5)]:
    t = seam_margin(crop(load(n), *box), size, flat); save(name, t); save(name + "_n", lum_normal(t, ns, 1.0))
