"""Textures for queue item 35 (photos/tools/). Run from the repo root: python3 tools/tex_35.py
  hm_handle.png  the wooden handle straight from hammer-side1 (grain, grime smudge, dark grip spots), stretched
                 around the handle (u = around, v = along); the strip is mirrored so the seam at the back matches
  hm_face.png    the striking face from hammer-face (worn steel with paint chips), as a disc
"""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
OUT = "assets/textures"
def load(n):
    im = Image.open(f"photos/tools/{n}.jpg")
    try: o = im.getexif().get(274, 1)
    except Exception: o = 1
    im = im.convert("RGB")
    return {3: im.rotate(180, expand=True), 6: im.rotate(270, expand=True), 8: im.rotate(90, expand=True)}.get(o, im)
im = load("hammer-side1"); w, h = im.size; k = w / 393          # thumbnail was ~393 wide at 700 tall
strip = im.crop((int(156 * k), int(178 * k), int(186 * k), int(632 * k))).resize((256, 1024), Image.LANCZOS)
a = np.asarray(strip).astype(np.float32)
# remove the round handle's shading across the strip (the model's own lighting supplies it)
colm = a.mean(0, keepdims=True); a = a / (colm + 1) * colm.mean((0, 1), keepdims=True) * 1.35
a = np.concatenate([a, a[:, ::-1]], 1)                            # mirrored -> wraps cleanly around the handle
Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(os.path.join(OUT, "hm_handle.png"), optimize=True)
im = load("hammer-face"); w, h = im.size; k = w / 393
face = im.crop((int(55 * k), int(60 * k), int(350 * k), int(350 * k))).resize((512, 512), Image.LANCZOS)
m = Image.new("L", (512, 512), 0); ImageDraw.Draw(m).ellipse((6, 6, 506, 506), fill=255)
face.putalpha(m); face.save(os.path.join(OUT, "hm_face.png"), optimize=True)
print("wrote hm_handle, hm_face")

# ---- the head: the side photo itself, cut out along the steel's outline, plus that outline (for the model)
import json
im = load("hammer-side1"); w, h = im.size; k = w / 393
box = (int(70 * k), int(80 * k), int(295 * k), int(185 * k))
crop = im.crop(box)
A = np.asarray(crop).astype(np.float32)
H_, W_ = A.shape[:2]
# outline traced by hand on this crop (1289 x 602): claw tip, over the top, neck, face, eye block, inside the claw
pts = [(36, 468), (90, 405), (150, 335), (220, 265), (300, 190), (380, 128), (460, 85), (540, 55), (620, 40), (720, 34), (800, 32),
       (842, 42), (868, 70), (896, 108), (930, 122), (980, 112), (1040, 86), (1100, 70), (1170, 66), (1232, 70), (1252, 92),
       (1258, 160), (1258, 250), (1252, 318), (1232, 340), (1170, 345), (1110, 332), (1040, 300), (960, 280), (905, 290), (880, 312),
       (850, 340), (822, 410), (808, 470), (800, 494), (540, 494), (530, 470), (522, 330), (515, 255), (500, 225), (470, 212),
       (420, 214), (360, 232), (290, 268), (220, 318), (150, 382), (95, 450), (52, 520), (40, 538), (32, 520)]
from PIL import ImageDraw
mk = Image.new("L", (W_, H_), 0); ImageDraw.Draw(mk).polygon(pts, fill=255)
alpha = np.asarray(mk.filter(ImageFilter.GaussianBlur(1.2)))
rgba = np.dstack([A.astype(np.uint8), alpha])
Image.fromarray(rgba, "RGBA").save(os.path.join(OUT, "hm_side.png"), optimize=True)
json.dump({"w": W_, "h": H_, "pts": pts}, open(os.path.join(OUT, "hm_side.json"), "w"))
# dark edge steel colour from the face-on photo (the head's narrow sides)
print("head outline", len(pts), "points; crop", W_, H_)
