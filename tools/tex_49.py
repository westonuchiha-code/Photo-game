"""Textures for queue item 49 (photos/misc2/). Run from the repo root: python3 tools/tex_49.py
  canvas_pour_1..8.png  the eight small pour-painted canvases (the photo is a 2 x 4 grid of them), each cut out
  canvas_confetti.png   the confetti watercolour
"""
import os, numpy as np, cv2
from PIL import Image
OUT = "assets/textures"
im = cv2.cvtColor(np.asarray(Image.open("photos/misc2/pour-painting-blue-yellow.jpg").convert("RGB")), cv2.COLOR_RGB2BGR)
k = im.shape[1] / 676
rows = [0, 165, 343, 515, 700]; cols = [0, 340, 676]; n = 0
for r in range(4):
    for c in range(2):
        n += 1
        y0, y1, x0, x1 = int((rows[r] + 4) * k), int((rows[r + 1] - 4) * k), int((cols[c] + 4) * k), int((cols[c + 1] - 4) * k)
        cv2.imwrite(os.path.join(OUT, f"canvas_pour_{n}.png"), cv2.resize(im[y0:y1, x0:x1], (512, 256), interpolation=cv2.INTER_AREA))
cf = cv2.cvtColor(np.asarray(Image.open("photos/misc2/watercolor-confetti.jpg").convert("RGB")), cv2.COLOR_RGB2BGR)
h, w = cf.shape[:2]
cv2.imwrite(os.path.join(OUT, "canvas_confetti.png"), cv2.resize(cf[int(0.02 * h):int(0.98 * h), int(0.02 * w):int(0.98 * w)], (512, 660), interpolation=cv2.INTER_AREA))
print("wrote canvas_pour_1..8, canvas_confetti")
