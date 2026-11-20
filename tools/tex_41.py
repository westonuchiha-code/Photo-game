"""Textures for queue item 41 (photos/shop/). Run from the repo root: python3 tools/tex_41.py
  gs_card.png   weathered cardboard (the ammo boxes' end flaps), seamless
  gs_floor.png  the checker floor's two tile colours with their speckle, as one 2x2 tile
"""
import os, numpy as np, cv2
from PIL import Image, ImageOps
OUT = "assets/textures"
def load(n): return cv2.cvtColor(np.asarray(ImageOps.exif_transpose(Image.open(f"photos/shop/{n}")).convert("RGB")), cv2.COLOR_RGB2BGR)
def crop(im, f): h, w = im.shape[:2]; return im[int(f[1] * h):int(f[3] * h), int(f[0] * w):int(f[2] * w)]
def seamless(p, size):
    p = cv2.resize(p, size, interpolation=cv2.INTER_AREA).astype(np.float32); W, H = size
    r = np.roll(np.roll(p, H // 2, 0), W // 2, 1)
    wx = np.minimum(np.minimum(np.arange(W), W - 1 - np.arange(W)) / (W / 2), 1); wy = np.minimum(np.minimum(np.arange(H), H - 1 - np.arange(H)) / (H / 2), 1)
    m = np.minimum(wy[:, None], wx[None, :])[:, :, None] ** 0.6
    out = p * m + r * (1 - m); low = cv2.GaussianBlur(out, (0, 0), W / 6); out = out - low + low.mean((0, 1))
    return out.clip(0, 255).astype(np.uint8)
a = load("old-ammo-box-stack.jpg")
cv2.imwrite(os.path.join(OUT, "gs_card.png"), seamless(crop(a, (0.2, 0.005, 0.6, 0.035)), (256, 256)))
r = load("rifle-on-display-case.jpg")
h, w = r.shape[:2]
# the floor: a tan and a teal tile (median colours read off the photo) with fine speckle + wear
rng = np.random.default_rng(4)
def tileC(bgr):
    t = np.ones((128, 128, 3), np.float32) * np.array(bgr, np.float32)
    t += rng.normal(0, 6, (128, 128, 1)); sp = rng.random((128, 128)) < 0.02; t[sp] += 35
    t[:3] *= 0.8; t[:, :3] *= 0.8
    return t.clip(0, 255).astype(np.uint8)
med = lambda f: np.median(crop(r, f).reshape(-1, 3), 0)
L = tileC(med((0.03, 0.3, 0.07, 0.36))); D = tileC(med((0.07, 0.13, 0.13, 0.18)))
tile = np.concatenate([np.concatenate([L, D], 1), np.concatenate([D, L], 1)], 0)
cv2.imwrite(os.path.join(OUT, "gs_floor.png"), tile)
print("wrote gs_card, gs_floor")
