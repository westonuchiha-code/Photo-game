"""Textures for queue item 37 (photos/electronics/). Run from the repo root: python3 tools/tex_37.py
  tv_front.png  the portable TV/radio/cassette unit's face, straightened; the maker's logo and model name
                painted out (the model letters made-up ones), the CRT's reflections replaced by dark glass
  tv_side.png   a patch of its dark grey textured plastic, tiled
"""
import os
import numpy as np, cv2
from PIL import Image
OUT = "assets/textures"
def load(n):
    im = Image.open(f"photos/electronics/{n}")
    try: o = im.getexif().get(274, 1)
    except Exception: o = 1
    im = im.convert("RGB")
    im = {3: im.rotate(180, expand=True), 6: im.rotate(270, expand=True), 8: im.rotate(90, expand=True)}.get(o, im)
    return cv2.cvtColor(np.asarray(im), cv2.COLOR_RGB2BGR)

im = load("portable-tv-radio-jackal.jpg"); k = im.shape[1] / 788           # coords in the 788 x 1400 thumbnail
m = np.zeros(im.shape[:2], np.uint8)
for x0, y0, x1, y1 in [(278, 622, 375, 652), (428, 806, 556, 858)]:
    cv2.rectangle(m, (int(x0 * k), int(y0 * k)), (int(x1 * k), int(y1 * k)), 255, -1)
im = cv2.inpaint(im, m, 15, cv2.INPAINT_NS)
W, H = 1024, 1350
src = np.float32([(107, 503), (586, 499), (574, 1130), (101, 1121)]) * k
M = cv2.getPerspectiveTransform(src, np.float32([(0, 0), (W, 0), (W, H), (0, H)]))
face = cv2.warpPerspective(im, M, (W, H))
# the round CRT: dark glass with a faint bluish sheen at the top, no reflections
c = cv2.perspectiveTransform(np.float32([[[322 * k, 750 * k]], [[452 * k, 750 * k]]]), M)[:, 0]
cx, cy = c[0]; r = int(np.linalg.norm(c[1] - c[0]) * 0.93)
yy, xx = np.mgrid[0:H, 0:W]
d = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2) / r
glass = np.zeros_like(face, np.float32); glass[:] = (34, 32, 30)
glass += (np.clip(1 - np.abs((yy - (cy - r * 0.55)) / (r * 0.35)), 0, 1) * np.clip(1 - np.abs(xx - cx) / r, 0, 1))[:, :, None] * np.array([26, 20, 16])
glass *= (1 - 0.35 * np.clip(d, 0, 1) ** 3)[:, :, None]
a = np.clip((1 - d) * r / 4, 0, 1)[:, :, None]
face = (face * (1 - a) + glass * a).astype(np.uint8)
# cover the painted-out spots with the panel's own texture copied from right beside them (feathered)
def patch(x0, y0, x1, y1, sx, sy):
    w, h = x1 - x0, y1 - y0
    src = face[sy:sy + h, sx:sx + w].astype(np.float32)
    f = np.ones((h, w), np.float32); e = 10
    for i in range(e): f[i, :] *= (i + 1) / e; f[-1 - i, :] *= (i + 1) / e; f[:, i] *= (i + 1) / e; f[:, -1 - i] *= (i + 1) / e
    dst = face[y0:y1, x0:x1].astype(np.float32)
    face[y0:y1, x0:x1] = (dst * (1 - f[:, :, None]) + src * f[:, :, None]).astype(np.uint8)
# model name: flat panel colour (the made-up model name is lettered over this spot by the model)
reg = face[640:770, 712:985].astype(np.float32); med = np.median(face[600:640, 820:980].reshape(-1, 3), 0)
fill = med + np.random.default_rng(5).normal(0, 3, reg.shape)
f = np.ones(reg.shape[:2], np.float32)
for i in range(12): f[i, :] *= (i + 1) / 12; f[-1 - i, :] *= (i + 1) / 12; f[:, -1 - i] *= (i + 1) / 12; f[:, i] *= min(1, (i + 6) / 12)
face[640:770, 712:985] = (reg * (1 - f[:, :, None]) + fill * f[:, :, None]).clip(0, 255).astype(np.uint8)
patch(360, 240, 540, 285, 560, 240)       # maker's logo on the bezel (copy the bezel to its right)
cv2.imwrite(os.path.join(OUT, "tv_front.png"), face)
p = cv2.resize(im[int(1090 * k):int(1120 * k), int(130 * k):int(200 * k)], (256, 128), interpolation=cv2.INTER_AREA)
cv2.imwrite(os.path.join(OUT, "tv_side.png"), cv2.GaussianBlur(p, (3, 3), 0))
print("wrote tv_front, tv_side")
