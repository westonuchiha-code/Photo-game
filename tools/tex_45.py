"""Textures for queue item 45 (photos/grime/). Run from the repo root: python3 tools/tex_45.py
  gf_galv.png    galvanized steel (a clean patch of the utility box, seamless)
  gf_mildew.png  the mildew speckle from the notice sign, as a dark-on-transparent overlay (alpha)
"""
import os, numpy as np, cv2
from PIL import Image, ImageOps
OUT = "assets/textures"
def load(n): return cv2.cvtColor(np.asarray(ImageOps.exif_transpose(Image.open(f"photos/grime/{n}")).convert("RGB")), cv2.COLOR_RGB2BGR)
def crop(im, f): h, w = im.shape[:2]; return im[int(f[1] * h):int(f[3] * h), int(f[0] * w):int(f[2] * w)]
def seamless(p, size):
    p = cv2.resize(p, size, interpolation=cv2.INTER_AREA).astype(np.float32); W, H = size
    r = np.roll(np.roll(p, H // 2, 0), W // 2, 1)
    wx = np.minimum(np.minimum(np.arange(W), W - 1 - np.arange(W)) / (W / 2), 1); wy = np.minimum(np.minimum(np.arange(H), H - 1 - np.arange(H)) / (H / 2), 1)
    m = np.minimum(wy[:, None], wx[None, :])[:, :, None] ** 0.6
    out = p * m + r * (1 - m); low = cv2.GaussianBlur(out, (0, 0), W / 6); return (out - low + low.mean((0, 1))).clip(0, 255).astype(np.uint8)
cv2.imwrite(os.path.join(OUT, "gf_galv.png"), seamless(crop(load("sticker-bomb-galvanized-box.jpg"), (0.1, 0.03, 0.9, 0.12)), (512, 256)))
s = crop(load("doodle-on-moldy-sign.jpg"), (0.02, 0.05, 0.98, 0.98))
g = cv2.cvtColor(s, cv2.COLOR_BGR2GRAY).astype(np.float32); bg = cv2.GaussianBlur(g, (0, 0), 25)
a = np.clip((bg - g - 14) * 4, 0, 255).astype(np.uint8)
# keep only the speckle: drop anything big or stroke-like (the printed text, the doodle, the edges)
n, lab, st, _ = cv2.connectedComponentsWithStats((a > 50).astype(np.uint8), 8)
keep = np.zeros(n, bool); keep[1:] = (st[1:, 4] < 260) & (np.maximum(st[1:, 2], st[1:, 3]) < 40)
a[~keep[lab]] = 0
a = cv2.resize(a, (512, 512), interpolation=cv2.INTER_AREA).astype(np.float32)
r = np.roll(np.roll(a, 256, 0), 256, 1); w = np.minimum(np.minimum(np.arange(512), 511 - np.arange(512)) / 256, 1); m = np.minimum(w[:, None], w[None, :]) ** 0.6
a = np.maximum(a * m, r * (1 - m)).clip(0, 255).astype(np.uint8)
rgba = np.dstack([np.full_like(a, 30), np.full_like(a, 34), np.full_like(a, 28), a])
cv2.imwrite(os.path.join(OUT, "gf_mildew.png"), rgba); print("wrote gf_galv, gf_mildew")
