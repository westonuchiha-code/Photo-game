"""Textures for queue item 43 (photos/food/). Run from the repo root: python3 tools/tex_43.py
  sn_chevron.png  the woven chevron blanket (a clear patch of the photo, made seamless)
"""
import os, numpy as np, cv2
from PIL import Image, ImageOps
OUT = "assets/textures"
im = cv2.cvtColor(np.asarray(ImageOps.exif_transpose(Image.open("photos/food/snack-pile-chevron-blanket.jpg")).convert("RGB")), cv2.COLOR_RGB2BGR)
h, w = im.shape[:2]
p = im[int(0.05 * h):int(0.4 * h), int(0.74 * w):int(0.98 * w)]
p = cv2.resize(p, (256, 384), interpolation=cv2.INTER_AREA).astype(np.float32)
H, W = p.shape[:2]; r = np.roll(np.roll(p, H // 2, 0), W // 2, 1)
wx = np.minimum(np.minimum(np.arange(W), W - 1 - np.arange(W)) / (W / 2), 1); wy = np.minimum(np.minimum(np.arange(H), H - 1 - np.arange(H)) / (H / 2), 1)
m = np.minimum(wy[:, None], wx[None, :])[:, :, None] ** 0.6
out = p * m + r * (1 - m); low = cv2.GaussianBlur(out, (0, 0), 40); out = out - low + low.mean((0, 1))
cv2.imwrite(os.path.join(OUT, "sn_chevron.png"), out.clip(0, 255).astype(np.uint8)); print("wrote sn_chevron")
