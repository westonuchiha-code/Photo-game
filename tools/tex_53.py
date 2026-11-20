"""Textures for queue item 53 (photos/vending/robot-vending1.jpg). Run from the repo root: python3 tools/tex_53.py
The photo is stored sideways; it is turned upright first. Coordinates are in a 1000-px-wide upright frame.
  rv_front.png  the machine's front (drinks behind glass, gear-filled ad panel, coin/bill slots, pickup flap,
                stickers), with the real name painted out (the model letters a made-up one)
  rv_head.png   the head's front with the big round speaker eye
"""
import os, numpy as np, cv2
from PIL import Image
OUT = "assets/textures"
im = cv2.cvtColor(np.asarray(Image.open("photos/vending/robot-vending1.jpg").convert("RGB")), cv2.COLOR_RGB2BGR)
im = cv2.rotate(im, cv2.ROTATE_90_CLOCKWISE); k = im.shape[1] / 1000
def K(*v): return [int(a * k) for a in v]
m = np.zeros(im.shape[:2], np.uint8); x0, y0, x1, y1 = K(352, 762, 615, 845); cv2.rectangle(m, (x0, y0), (x1, y1), 255, -1)
im = cv2.inpaint(im, m, 11, cv2.INPAINT_TELEA)
def crop(b, size): x0, y0, x1, y1 = K(*b); return cv2.resize(im[y0:y1, x0:x1], size, interpolation=cv2.INTER_AREA)
cv2.imwrite(os.path.join(OUT, "rv_front.png"), crop((345, 300, 678, 875), (512, 884)))
cv2.imwrite(os.path.join(OUT, "rv_head.png"), crop((490, 100, 665, 345), (384, 540)))
print("wrote rv_front, rv_head")
