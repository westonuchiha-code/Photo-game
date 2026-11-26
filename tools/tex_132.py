"""Textures for 132, from the second half of the street photos (photos/1000136452..474): the stone-block wall, coarse
asphalt, three worn metals, rusty skip paint, tan brick, and the yellow litter (cut out). Uses the helpers at the top
of tools/tex_131.py.   python3 tools/tex_132.py"""
import numpy as np, cv2
_s = open('tools/tex_131.py').read(); exec(_s[_s.index('import os'):_s.index('for n, name, box')])   # load, crop, seam_margin, lum_normal, save, ...
_h = _s[_s.index('def rgba'):_s.index('# the tar-sealed crack')]; exec(_h)
for n, name, box, size, flat, ns in [
    ("53", "g132_stoneblocks", (0.02, 0.04, 0.98, 0.98), 1024, 5, 3.0),     # the retaining wall, several blocks: about 1.6 m
    ("54", "g132_stoneface", (0.02, 0.60, 0.98, 0.98), 512, 5, 3.0),         # one block's face, close
    ("55", "g132_asphalt_coarse", (0.0, 0.0, 1.0, 0.42), 1024, 8, 3.0),
    ("65", "g132_metal_scratched", (0.02, 0.02, 0.98, 0.56), 1024, 5, 1.5),
    ("64", "g132_metal_pitted", (0.08, 0.18, 0.86, 0.62), 1024, 5, 2.0),
    ("63", "g132_galv_streaked", (0.22, 0.52, 0.72, 0.80), 512, 4, 0.8),
    ("69", "g132_rustpaint", (0.05, 0.55, 0.95, 0.83), 1024, 6, 1.2),
    ("71", "g132_brick_tan", (0.0, 0.0, 1.0, 0.33), 1024, 6, 2.5)]:
    t = seam_margin(crop(load(n), *box), size, flat); save(name, t); save(name + "_n", lum_normal(t, ns, 1.0))
l = load("55"); l = cv2.resize(crop(l, 0.10, 0.44, 0.50, 0.66), (512, 500), interpolation=cv2.INTER_AREA); hsv = cv2.cvtColor(l, cv2.COLOR_BGR2HSV)
m = biggest(cv2.morphologyEx(((hsv[..., 1] > 120) & (hsv[..., 0] > 18) & (hsv[..., 0] < 38) & (hsv[..., 2] > 120)).astype(np.uint8), cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8)) > 0, 1).astype(np.uint8)
cs, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE); cv2.drawContours(m, cs, -1, 1, -1); save("g132_litter", rgba(l, tidy(m, 3, 1.2)))
