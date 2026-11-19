"""Textures for queue item 33 (photos/grime/braided-cords-colors.jpg, circuit-board-green.jpg).
Run from the repo root: python3 tools/tex_33.py
  cord_braid.png   the elastic cord's braided sheath as a grey weave (tinted per colour in the model), seamless
                   along the cord; cropped from the green cord in the photo, colour removed, falloff flattened
  cord_braid_n.png its normal map
  pcb_mask.png     solder-mask green + copper speckle sampled from the board photo (a small tile for the mask)
"""
import os
import numpy as np
from PIL import Image, ImageFilter
OUT = "assets/textures"

def load(n):
    im = Image.open(f"photos/grime/{n}.jpg")
    try: o = im.getexif().get(274, 1)
    except Exception: o = 1
    im = im.convert("RGB")
    return {3: im.rotate(180, expand=True), 6: im.rotate(270, expand=True), 8: im.rotate(90, expand=True)}.get(o, im)

im = load("braided-cords-colors")
w, h = im.size
# the middle green cord: one cord diameter tall (thumbnail y ~430..480 of 700)
k = h / 700
strip = im.crop((int(w * 0.05), int(437 * k), int(w * 0.95), int(482 * k)))
a = np.asarray(strip).astype(np.float32).mean(-1)
lo = np.asarray(Image.fromarray(a.astype(np.uint8)).filter(ImageFilter.GaussianBlur(25))).astype(np.float32)
a = a - lo + 128
a = (a - a.mean()) / (a.std() + 1e-3) * 38 + 150
img = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).resize((1024, 128), Image.LANCZOS)
a = np.asarray(img).astype(np.float32)
x = np.linspace(0, 1, a.shape[1]); wx = np.clip(np.sin(np.pi * x) * 1.6, 0, 1)[None, :]
a = a * wx + np.roll(a, a.shape[1] // 2, 1) * (1 - wx)
# round-cord shading (light across the middle) is supplied by the geometry: flatten it vertically
a = a - a.mean(1, keepdims=True) + a.mean()
Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).convert("RGB").save(os.path.join(OUT, "cord_braid.png"), optimize=True)
hgt = a / 255
dx = (np.roll(hgt, -1, 1) - np.roll(hgt, 1, 1)) * 0.5; dy = (np.roll(hgt, -1, 0) - np.roll(hgt, 1, 0)) * 0.5
nx, ny, nz = -dx * 6, dy * 6, np.ones_like(hgt); ln = np.sqrt(nx ** 2 + ny ** 2 + nz ** 2)
Image.fromarray(((np.stack([nx / ln, ny / ln, nz / ln], -1) * 0.5 + 0.5) * 255).astype(np.uint8)).save(os.path.join(OUT, "cord_braid_n.png"))

pcb = load("circuit-board-green")
pw, ph = pcb.size
crop = np.asarray(pcb.crop((int(pw * 0.05), int(ph * 0.28), int(pw * 0.2), int(ph * 0.36)))).astype(np.float32).reshape(-1, 3)
L = crop.mean(1)
mask = np.median(crop[(L > np.percentile(L, 20)) & (L < np.percentile(L, 70))], 0)
print("mask colour", mask)
open(os.path.join(OUT, "pcb_colour.txt"), "w").write("#%02x%02x%02x" % tuple(int(v) for v in mask))
print("wrote cord_braid, pcb colour")
