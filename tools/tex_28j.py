"""Textures for 28j (teahouse, photos/city/teahouse-painted-ceiling.jpg).
Run from the repo root: python3 tools/tex_28j.py
  th_plaster.png / th_plaster_n.png  the white carved plaster walls (ganch): a mirrored arabesque of
      interlaced scrolls and lobed medallions cut into the render, 0.8 m repeat. Base colour sampled
      from the lit wall in the photo; the relief is a height field drawn with soft strokes.
"""
import os
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

OUT = "assets/textures"


def cload(n):
    im = Image.open(f"photos/city/{n}.jpg")
    try:
        o = im.getexif().get(274, 1)
    except Exception:
        o = 1
    im = im.convert("RGB")
    return {3: im.rotate(180, expand=True), 6: im.rotate(270, expand=True), 8: im.rotate(90, expand=True)}.get(o, im)


im = cload("teahouse-painted-ceiling")
k = im.size[0] / 1050
wall = np.asarray(im.crop(tuple(int(v * k) for v in (620, 230, 700, 330)))).astype(np.float32).reshape(-1, 3)
L = wall.mean(1)
base = np.median(wall[L > np.percentile(L, 50)], 0)
base = np.array([238.0, 234.0, 226.0])               # the photo's wall is white plaster under warm light; keep it white (the scene lights warm it)

N = 1024
H = Image.new("L", (N, N), 128)
d = ImageDraw.Draw(H)
# one quadrant drawn, then mirrored both ways so the pattern is symmetric and tiles
Q = N // 2
q = Image.new("L", (Q, Q), 0)
dq = ImageDraw.Draw(q)
def arc_stroke(cx, cy, r, a0, a1, w, val):
    dq.arc((cx - r, cy - r, cx + r, cy + r), a0, a1, fill=val, width=w)
# big lobed medallion centred on the tile corner (appears whole after mirroring)
for r, w in [(200, 14), (170, 6)]:
    arc_stroke(0, 0, r, 0, 90, w, 255)
for i in range(5):                                    # lobes
    a = math.radians(9 + i * 18)
    cx, cy = 200 * math.cos(a), 200 * math.sin(a)
    arc_stroke(cx, cy, 34, 0, 360, 8, 255)
# inner rosette
for i in range(6):
    a = math.radians(i * 15)
    dq.line((0, 0, 140 * math.cos(a), 140 * math.sin(a)), fill=200, width=6)
arc_stroke(0, 0, 60, 0, 90, 10, 255)
arc_stroke(0, 0, 100, 0, 90, 5, 220)
# interlaced scrolls running to the quadrant's far corner
for t0 in [0, 1]:
    pts = []
    for s in np.linspace(0, 1, 60):
        x = 230 + s * 260 + 30 * math.sin(s * math.pi * 3 + t0 * math.pi)
        y = 60 + s * 180 + 40 * math.cos(s * math.pi * 2 + t0)
        pts.append((x, y))
    dq.line(pts, fill=255, width=10, joint="curve")
    pts2 = [(y, x) for x, y in pts]
    dq.line(pts2, fill=255, width=10, joint="curve")
# leaves / palmettes along the scrolls
for i in range(9):
    s = i / 8
    x, y = 260 + s * 220, 90 + s * 160
    dq.ellipse((x - 18, y - 9, x + 18, y + 9), outline=255, width=5)
    dq.ellipse((y - 9, x - 18, y + 9, x + 18), outline=255, width=5)
# a smaller medallion at the quadrant's far corner (centre of the tile after mirroring)
for r, w in [(120, 10), (95, 5), (40, 8)]:
    dq.arc((Q - r, Q - r, Q + r, Q + r), 180, 270, fill=255, width=w)
for i in range(6):
    a = math.radians(180 + i * 18)
    dq.line((Q, Q, Q + 110 * math.cos(a), Q + 110 * math.sin(a)), fill=180, width=4)
# fill: a finer lattice of small quatrefoils and tendrils between the big motifs
for gy in range(30, Q, 64):
    for gx in range(30, Q, 64):
        if math.hypot(gx, gy) < 250 or math.hypot(Q - gx, Q - gy) < 150:
            continue
        for a in range(4):
            ax, ay = gx + 11 * math.cos(a * math.pi / 2), gy + 11 * math.sin(a * math.pi / 2)
            dq.ellipse((ax - 9, ay - 9, ax + 9, ay + 9), outline=170, width=3)
        dq.arc((gx - 30, gy - 30, gx + 30, gy + 30), 200, 250, fill=150, width=3)
qa = np.asarray(q).astype(np.float32)
full = np.zeros((N, N), np.float32)
full[:Q, :Q] = qa[::-1, ::-1]
full[:Q, Q:] = qa[::-1, :]
full[Q:, :Q] = qa[:, ::-1]
full[Q:, Q:] = qa
# roll so the big medallion sits in the middle of the tile
full = np.roll(np.roll(full, Q, 0), Q, 1)
h = Image.fromarray(full.astype(np.uint8)).filter(ImageFilter.GaussianBlur(3))
hb = np.asarray(h).astype(np.float32) / 255
rng = np.random.default_rng(3)
hb = hb + rng.normal(0, 0.012, hb.shape)
dx = (np.roll(hb, -1, 1) - np.roll(hb, 1, 1)) * 0.5
dy = (np.roll(hb, -1, 0) - np.roll(hb, 1, 0)) * 0.5
nx, ny, nz = -dx * 7, dy * 7, np.ones_like(hb)
ln = np.sqrt(nx ** 2 + ny ** 2 + nz ** 2)
Image.fromarray(((np.stack([nx / ln, ny / ln, nz / ln], -1) * 0.5 + 0.5) * 255).astype(np.uint8)).save(os.path.join(OUT, "th_plaster_n.png"))
col = base[None, None, :] * (0.93 + 0.07 * hb[..., None]) - (1 - hb[..., None]) * 0 + rng.normal(0, 2, (N, N, 1))
# the carved grooves collect a little dust: slightly darker just outside the raised strokes
edge = np.asarray(h.filter(ImageFilter.GaussianBlur(6))).astype(np.float32) / 255 - hb
col -= np.clip(edge, 0, 1)[..., None] * 40
Image.fromarray(np.clip(col, 0, 255).astype(np.uint8)).save(os.path.join(OUT, "th_plaster.png"), optimize=True)
print("wrote th_plaster", base)
