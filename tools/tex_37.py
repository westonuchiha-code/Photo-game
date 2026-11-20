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

# ---- sound card (sound-card-board.jpg, 1400 x 788 thumbnail coords): bus card under acrylic, straightened.
# Glare streaks are painted out, the real product name / URL and chip makers' marks removed (chips get plain
# generic part numbers), then the board and the blue daughterboard are rectified separately.
import json
im = load("sound-card-board.jpg"); k = im.shape[1] / 1400
def K(*p): return [int(v * k) for v in p]
hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV)
glare = ((hsv[:, :, 2] > 215) & (hsv[:, :, 1] < 70)).astype(np.uint8) * 255
# on the blue daughterboard the streaks are pale blue: catch those too
db = np.zeros_like(glare); db[K(70)[0]:K(380)[0], K(430)[0]:K(808)[0]] = 1
glare |= (((hsv[:, :, 2] > 150) & (hsv[:, :, 1] < 110)) & (db > 0)).astype(np.uint8) * 255
glare[:, :K(380)[0]] = 0; glare[:, K(1170)[0]:] = 0
glare = cv2.dilate(glare, np.ones((7, 7), np.uint8))
im = cv2.inpaint(im, glare, 7, cv2.INPAINT_TELEA)
lab = np.zeros(im.shape[:2], np.uint8)
cv2.rectangle(lab, tuple(K(1082, 520)), tuple(K(1165, 748)), 255, -1)                 # vertical product name + URL
im = cv2.inpaint(im, lab, 9, cv2.INPAINT_TELEA)
chips = {"IC1": (387, 453, 494, 479), "IC2": (374, 512, 486, 544), "IC3": (362, 576, 477, 609), "IC4": (528, 602, 641, 633),
         "IC5": (706, 602, 846, 634), "IC6": (892, 538, 1026, 569), "IC7": (902, 601, 1044, 638), "RN": (362, 619, 498, 640)}
parts = {"IC1": "74HC04", "IC2": "74HC08", "IC3": "74HC32", "IC4": "74HC138", "IC5": "74HC245", "IC6": "74HC74", "IC7": "74LS245", "RN": "10K x8"}
for n, (x0, y0, x1, y1) in chips.items():
    a, b = K(x0 + 2, y0 + 2), K(x1 - 2, y1 - 2)
    cv2.rectangle(im, tuple(a), tuple(b), (30, 30, 32), -1)
    cv2.putText(im, parts[n], (a[0] + int(10 * k), (a[1] + b[1]) // 2 + int(4 * k)), cv2.FONT_HERSHEY_SIMPLEX, 0.32 * k, (150, 150, 150), max(1, int(k)), cv2.LINE_AA)
for x0, y0, x1, y1 in [(606, 279, 704, 318), (543, 291, 590, 312)]:
    a, b = K(x0 + 2, y0 + 2), K(x1 - 2, y1 - 2); cv2.rectangle(im, tuple(a), tuple(b), (28, 28, 30), -1)
BW, BH = 1600, 980
src = np.float32([(400, 118), (991, 118), (1172, 790), (243, 790)]) * k
M = cv2.getPerspectiveTransform(src, np.float32([(0, 0), (BW, 0), (BW, BH), (0, BH)]))
board = cv2.warpPerspective(im, M, (BW, BH))
# the top right corner of the card is hidden by a reflected sticker in the photo: fill it with the card's own
# trace-covered green from just below (mirrored copies, feathered)
src_g = board[420:600, 1060:1240].copy()
tile_g = np.concatenate([src_g, src_g[::-1], src_g], 0)[:430]
reg = np.concatenate([tile_g, tile_g[:, ::-1], tile_g, tile_g[:, ::-1]], 1)[:, :600]
f = np.ones((430, 600), np.float32)
for i in range(30): f[-1 - i, :] *= (i + 1) / 30; f[:, i] *= (i + 1) / 30
board[0:430, 1000:1600] = (board[0:430, 1000:1600] * (1 - f[:, :, None]) + reg * f[:, :, None]).astype(np.uint8)
# the daughterboard is its own 3D part: under it, the card is plain green with traces, in its shadow
dy1, dx0, dx1 = int(0.515 * BH), int(0.11 * BW), int(0.665 * BW)
t3 = np.concatenate([src_g, src_g[::-1]] * 2, 0)[:dy1]; t3 = np.concatenate([t3, t3[:, ::-1]] * 3, 1)[:, :dx1 - dx0]
board[:dy1, dx0:dx1] = (t3 * 0.55).astype(np.uint8)
# alpha: the board rectangle plus the narrower gold-finger tab along the bottom edge
yb = int(cv2.perspectiveTransform(np.float32([[[700 * k, 748 * k]]]), M)[0, 0, 1])
fx0 = int(cv2.perspectiveTransform(np.float32([[[312 * k, 770 * k]]]), M)[0, 0, 0]); fx1 = int(cv2.perspectiveTransform(np.float32([[[1114 * k, 770 * k]]]), M)[0, 0, 0])
alpha = np.zeros((BH, BW), np.uint8); alpha[:yb, :1572] = 255; alpha[yb:, fx0:fx1] = 255
cv2.imwrite(os.path.join(OUT, "sc_board.png"), np.dstack([board, alpha]))
def P(x, y): p = cv2.perspectiveTransform(np.float32([[[x * k, y * k]]]), M)[0, 0]; return [round(float(p[0]) / BW, 4), round(float(p[1]) / BH, 4)]
dsrc = np.float32([(426, 68), (812, 68), (810, 384), (425, 384)]) * k
dau = cv2.warpPerspective(im, cv2.getPerspectiveTransform(dsrc, np.float32([(0, 0), (1024, 0), (1024, 840), (0, 840)])), (1024, 840))
# the daughterboard's upper right caught the reflection: mirror its pin field over from the left
mr = dau[0:470, 300:640][:, ::-1].copy()
f = np.ones(mr.shape[:2], np.float32)
for i in range(40): f[-1 - i, :] *= (i + 1) / 40; f[:, i] *= (i + 1) / 40
dau[0:470, 640:980] = (dau[0:470, 640:980] * (1 - f[:, :, None]) + mr * f[:, :, None]).astype(np.uint8)
# pale glare streaks: pull anything much lighter than its neighbourhood back down (solder pads are small and survive)
lum = cv2.cvtColor(dau, cv2.COLOR_BGR2GRAY).astype(np.float32); base = cv2.GaussianBlur(cv2.erode(lum, np.ones((9, 9))), (0, 0), 12)
over = np.clip((lum - base - 18) / 40, 0, 1); big = cv2.GaussianBlur((over > 0.3).astype(np.float32), (0, 0), 6)
med = cv2.medianBlur(dau, 31).astype(np.float32); w = np.clip(big * 1.6, 0, 1)[:, :, None]
dau = (dau * (1 - w) + med * w).astype(np.uint8)
cv2.imwrite(os.path.join(OUT, "sc_daughter.png"), dau)
layout = {"tabY": round(yb / BH, 4), "tab": [round(fx0 / BW, 4), round(fx1 / BW, 4)],
          "chips": {n: [P(x0, y0), P(x1, y1)] for n, (x0, y0, x1, y1) in chips.items()},
          "dip": [[P(612, 460), P(665, 525)], [P(688, 460), P(741, 525)]], "cap": P(322, 610), "daughter": [P(426, 388), P(812, 388)],
          "ext1": [P(338, 400), P(356, 535)], "ext2": [P(1035, 437), P(1080, 512)], "edge": [P(300, 697), P(1120, 745)], "jacks": [P(628, 120), P(706, 120)]}
json.dump(layout, open(os.path.join(OUT, "sc_board.json"), "w"))
print("wrote sc_board, sc_daughter", layout["tabY"], layout["tab"])
