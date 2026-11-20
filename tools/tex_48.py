"""Textures for queue item 48 (photos/decor/). Run from the repo root: python3 tools/tex_48.py
  m48_copper.png  the prop pistol's rusty copper paint (a flat patch of its frame, seamless)
  m48_twine.png   its twine wrap (a patch of the wound grip, seamless)
  m48_rose.png    the dried rose petal colour + texture (a patch of a petal)
"""
import os, numpy as np, cv2
from PIL import Image
OUT = "assets/textures"
def load(n): return cv2.cvtColor(np.asarray(Image.open(f"photos/decor/{n}").convert("RGB")), cv2.COLOR_RGB2BGR)
def crop(im, f): h, w = im.shape[:2]; return im[int(f[1] * h):int(f[3] * h), int(f[0] * w):int(f[2] * w)]
def seamless(p, size):
    p = cv2.resize(p, size, interpolation=cv2.INTER_AREA).astype(np.float32); W, H = size
    r = np.roll(np.roll(p, H // 2, 0), W // 2, 1)
    wx = np.minimum(np.minimum(np.arange(W), W - 1 - np.arange(W)) / (W / 2), 1); wy = np.minimum(np.minimum(np.arange(H), H - 1 - np.arange(H)) / (H / 2), 1)
    m = np.minimum(wy[:, None], wx[None, :])[:, :, None] ** 0.6
    out = p * m + r * (1 - m); low = cv2.GaussianBlur(out, (0, 0), W / 6); return (out - low + low.mean((0, 1))).clip(0, 255).astype(np.uint8)
pis = load("rusty-prop-pistol-rope.jpg")
cv2.imwrite(os.path.join(OUT, "m48_copper.png"), seamless(crop(pis, (0.24, 0.3, 0.36, 0.48)), (256, 256)))
cv2.imwrite(os.path.join(OUT, "m48_twine.png"), seamless(crop(pis, (0.66, 0.32, 0.76, 0.48)), (256, 256)))
rose = load("dried-rose-babys-breath.jpg")
cv2.imwrite(os.path.join(OUT, "m48_rose.png"), seamless(crop(rose, (0.58, 0.52, 0.72, 0.78)), (256, 256)))
print("wrote m48_copper, m48_twine, m48_rose")
