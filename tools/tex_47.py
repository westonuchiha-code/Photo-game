"""Textures for queue item 47 (photos/decor/). Run from the repo root: python3 tools/tex_47.py
  dc_pachinko.png  the vintage pachinko machine's playfield + chrome frame + yellow cabinet front + tray,
                   straightened (one face, the model adds depth)
  dc_galaxy.png    the PC case's airbrushed galaxy side panel (window cut-out area included; the model puts
                   glass over it), straightened
  dc_pcinside.png  the inside seen through the window (cooler tubes, red fan glow, GPU), straightened
"""
import os, numpy as np, cv2
from PIL import Image, ImageOps
OUT = "assets/textures"
def load(n): return cv2.cvtColor(np.asarray(ImageOps.exif_transpose(Image.open(f"photos/decor/{n}")).convert("RGB")), cv2.COLOR_RGB2BGR)
def warp(im, quad, size): w, h = size; return cv2.warpPerspective(im, cv2.getPerspectiveTransform(np.float32(quad), np.float32([(0, 0), (w, 0), (w, h), (0, h)])), size)
p = load("vintage-pachinko-machine.jpg")
cv2.imwrite(os.path.join(OUT, "dc_pachinko.png"), warp(p, [(44, 6), (372, 0), (356, 600), (52, 600)], (512, 900)))
g = load("galaxy-painted-pc-case.jpg")
def scrub(im, boxes):
    m = np.zeros(im.shape[:2], np.uint8)
    for x0, y0, x1, y1 in boxes: cv2.rectangle(m, (x0, y0), (x1, y1), 255, -1)
    return cv2.inpaint(im, m, 7, cv2.INPAINT_TELEA)
# the cooler pump cap and the board's model print carry real brand marks: painted out
cv2.imwrite(os.path.join(OUT, "dc_galaxy.png"), scrub(warp(g, [(36, 152), (640, 168), (614, 728), (84, 668)], (1024, 900)), [(450, 140, 540, 220), (480, 360, 600, 410), (240, 420, 330, 460)]))
cv2.imwrite(os.path.join(OUT, "dc_pcinside.png"), scrub(warp(g, [(68, 205), (385, 222), (390, 600), (106, 560)], (512, 560)), [(320, 70, 400, 140), (380, 190, 500, 235), (130, 255, 230, 300)]))
print("wrote dc_pachinko, dc_galaxy, dc_pcinside")
