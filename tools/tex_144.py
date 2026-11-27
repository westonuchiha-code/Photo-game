"""Textures for 144, from photos/1000137323..331: weathering steel (two), dry ground with grass litter, concrete
pavement, and cut-outs: broken glass, a twig, a dry leaf, a cracked plastic cup.   python3 tools/tex_144.py"""
import numpy as np, cv2
from PIL import Image, ImageOps
_s = open('tools/tex_131.py').read(); exec(_s[_s.index('import os'):_s.index('for n, name, box')]); exec(_s[_s.index('def rgba'):_s.index('# the tar-sealed crack')])
def load(n): return cv2.cvtColor(np.asarray(ImageOps.exif_transpose(Image.open(f"photos/1000137{n}.jpg")).convert("RGB")), cv2.COLOR_RGB2BGR)
for n, name, box, size, flat, ns in [
    ("331", "g144_corten", (0.02, 0.24, 0.98, 0.70), 1024, 6, 2.0),
    ("330", "g144_corten_streaked", (0.0, 0.30, 1.0, 0.85), 1024, 4, 1.5),
    ("327", "g144_dry_ground", (0.0, 0.25, 1.0, 0.70), 1024, 6, 2.5),
    ("325", "g144_dry_litter", (0.0, 0.30, 1.0, 0.75), 1024, 6, 2.5),
    ("324", "g144_pavement", (0.05, 0.40, 0.95, 0.85), 1024, 6, 1.2)]:
    t = seam_margin(crop(load(n), *box), size, flat); save(name, t); save(name + "_n", lum_normal(t, ns, 1.0))
def grab(img, rect, it=6):
    mask = np.zeros(img.shape[:2], np.uint8); bg = np.zeros((1, 65)); fg = np.zeros((1, 65)); cv2.grabCut(img, mask, rect, bg, fg, it, cv2.GC_INIT_WITH_RECT)
    m = ((mask == 1) | (mask == 3)).astype(np.uint8); return biggest(cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8)), 1).astype(np.uint8)
def cut(n, box, size, rect, name):
    a = cv2.resize(crop(load(n), *box), size, interpolation=cv2.INTER_AREA); m = grab(a, rect); save(name, rgba(a, cv2.GaussianBlur(m.astype(np.float32), (0, 0), 1.0)))
cut("324", (0.10, 0.12, 0.22, 0.20), (256, 256), (20, 20, 216, 216), "g144_glass_shard")
cut("323", (0.19, 0.53, 0.35, 0.65), (256, 256), (16, 16, 224, 224), "g144_leaf_dry")
# weathered grey wood, from the three close-ups: the long grain, and a knot
for n, name, box in [("340", "g144_wood_grey", (0.0, 0.10, 1.0, 0.90)), ("338", "g144_wood_grey2", (0.0, 0.30, 1.0, 1.0))]:
    t = seam_margin(crop(load(n), *box), 1024, 5); save(name, t); save(name + "_n", lum_normal(t, 3.0, 1.0))
k = crop(load("339"), 0.0, 0.0, 1.0, 1.0); k = cv2.resize(k, (1024, int(1024 * k.shape[0] / k.shape[1])), interpolation=cv2.INTER_AREA); save("g144_wood_knot", k); save("g144_wood_knot_n", lum_normal(k, 3.0, 1.0))
# the bin bag: black film, creased (for a liner and a heap of bags)
t = seam_margin(crop(load("342"), 0.0, 0.62, 1.0, 0.98), 1024, 0); save("g144_binbag", t); save("g144_binbag_n", lum_normal(t, 3.0, 1.5))
