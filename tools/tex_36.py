"""Textures for queue item 36 (photos/vehicles/). Run from the repo root: python3 tools/tex_36.py
Kei mini-truck (kei-truck-recycling.jpg, side view). Coordinates below are in the 1050-wide thumbnail.
  kt_cab.png    the cab's side straight from the photo (door, window with the interior, mirror, handle, grime)
  kt_bed.png    the bed's side panel; the real company lettering is painted out (the model draws a made-up name)
  kt_wheel.png  the steel wheel + tyre face, as a disc
  kt_paper.png  bundled newspapers from the load;  kt_box.png  the cardboard box;  kt_lamp.png  the headlight
"""
import os
import numpy as np
from PIL import Image, ImageDraw
OUT = "assets/textures"
def load(n):
    im = Image.open(f"photos/vehicles/{n}")
    try: o = im.getexif().get(274, 1)
    except Exception: o = 1
    im = im.convert("RGB")
    return {3: im.rotate(180, expand=True), 6: im.rotate(270, expand=True), 8: im.rotate(90, expand=True)}.get(o, im)

im = load("kei-truck-recycling.jpg"); s = im.size[0] / 1050
def crop(x0, y0, x1, y1, size): return im.crop((int(x0 * s), int(y0 * s), int(x1 * s), int(y1 * s))).resize(size, Image.LANCZOS)

crop(150, 455, 462, 785, (1024, 1084)).save(os.path.join(OUT, "kt_cab.png"), optimize=True)

bed = np.asarray(crop(458, 641, 917, 716, (2048, 357))).astype(np.float32)
H, W = bed.shape[:2]; ys = lambda Y: int((Y - 641) / 75 * H); xs = lambda X: int((X - 458) / 459 * W)
y0, y1 = ys(669), ys(695); x0, x1 = xs(546), xs(818)
top, bot = bed[y0 - 3:y0].mean(0), bed[y1:y1 + 3].mean(0)
for i in range(y0, y1):
    t = (i - y0) / (y1 - y0); bed[i, x0:x1] = (top * (1 - t) + bot * t)[x0:x1]
bed[y0:y1, x0:x1] += np.random.default_rng(1).normal(0, 2.5, (y1 - y0, x1 - x0, 1))
Image.fromarray(np.clip(bed, 0, 255).astype(np.uint8)).save(os.path.join(OUT, "kt_bed.png"), optimize=True)

wh = crop(332.5 - 57, 795 - 57, 332.5 + 57, 795 + 57, (512, 512))
m = Image.new("L", (512, 512), 0); ImageDraw.Draw(m).ellipse((2, 2, 510, 510), fill=255); wh.putalpha(m)
wh.save(os.path.join(OUT, "kt_wheel.png"), optimize=True)
crop(462, 588, 556, 640, (512, 284)).save(os.path.join(OUT, "kt_paper.png"), optimize=True)
crop(464, 541, 539, 582, (512, 280)).save(os.path.join(OUT, "kt_box.png"), optimize=True)
crop(156, 636, 192, 682, (128, 164)).save(os.path.join(OUT, "kt_lamp.png"), optimize=True)
print("wrote kt_cab, kt_bed, kt_wheel, kt_paper, kt_box, kt_lamp")
