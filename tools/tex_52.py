"""Textures for queue item 52 (photos/listings/). Run from the repo root: python3 tools/tex_52.py
  ls_room1..6.png  the room photos printed on the flyers (empty apartment interiors), cut out to reuse on
                   the redrawn English flyers. The flyers themselves are drawn in src/models/listings52.js.
"""
import os, numpy as np, cv2
from PIL import Image
OUT = "assets/textures"
def load(n): return cv2.cvtColor(np.asarray(Image.open(f"photos/listings/{n}").convert("RGB")), cv2.COLOR_RGB2BGR)
def crop(im, f): h, w = im.shape[:2]; return im[int(f[1] * h):int(f[3] * h), int(f[0] * w):int(f[2] * w)]
cuts = [("listing1.jpg", (0.385, 0.64, 0.62, 0.92)), ("listing2.jpg", (0.39, 0.57, 0.6, 0.99)), ("listing2.jpg", (0.63, 0.45, 0.87, 0.77)),
        ("listing3.jpg", (0.38, 0.3, 0.58, 0.62)), ("listing3.jpg", (0.56, 0.62, 0.8, 0.95)), ("listing4.jpg", (0.32, 0.55, 0.47, 0.96))]
for i, (f, b) in enumerate(cuts, 1):
    cv2.imwrite(os.path.join(OUT, f"ls_room{i}.png"), cv2.resize(crop(load(f), b), (320, 240), interpolation=cv2.INTER_AREA))
print("wrote ls_room1..6")
