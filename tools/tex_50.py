"""Textures for queue item 50 (photos/badparker/). Run from the repo root: python3 tools/tex_50.py
  bp_block.png  the split-face retaining-wall block (two courses, seamless along the wall)
"""
import os, numpy as np, cv2
from PIL import Image
OUT = "assets/textures"
im = cv2.cvtColor(np.asarray(Image.open("photos/badparker/sign-closeup1.jpg").convert("RGB")), cv2.COLOR_RGB2BGR)
h, w = im.shape[:2]
p = im[int(0.62 * h):int(0.98 * h), int(0.66 * w):int(0.98 * w)]
p = cv2.resize(p, (512, 256), interpolation=cv2.INTER_AREA).astype(np.float32)
r = np.roll(p, 256, 1); wx = np.minimum(np.minimum(np.arange(512), 511 - np.arange(512)) / 256, 1)[None, :, None] ** 0.6
out = p * wx + r * (1 - wx); low = cv2.GaussianBlur(out, (0, 0), 60); out = out - low + low.mean((0, 1))
cv2.imwrite(os.path.join(OUT, "bp_block.png"), out.clip(0, 255).astype(np.uint8)); print("wrote bp_block")
