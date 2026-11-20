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

# ---- red coach (red-coach-bus-rear.jpg / -front.jpg; coordinates in the 1400-px thumbnail)
import cv2
def load_cv(n):
    return cv2.cvtColor(np.asarray(load(n)), cv2.COLOR_RGB2BGR)
im2 = load_cv("red-coach-bus-rear.jpg"); k = im2.shape[1] / 1400
mask = np.zeros(im2.shape[:2], np.uint8)
for x0, y0, x1, y1 in [(763, 524, 902, 582), (657, 762, 996, 796), (698, 875, 790, 928), (910, 864, 990, 895)]:
    cv2.rectangle(mask, (int(x0 * k), int(y0 * k)), (int(x1 * k), int(y1 * k)), 255, -1)
im2 = cv2.inpaint(im2, mask, 9, cv2.INPAINT_TELEA)
src = np.float32([(615, 440), (1000, 445), (1022, 968), (618, 978)]) * k
dst = np.float32([(0, 0), (1024, 0), (1024, 1360), (0, 1360)])
rear = cv2.warpPerspective(im2, cv2.getPerspectiveTransform(src, dst), (1024, 1360))
# soften the leftover smears of the painted-out lettering with a little paint noise
cv2.imwrite(os.path.join(OUT, "cb_rear.png"), rear)
im3 = load("red-coach-bus-front.jpg"); k3 = im3.size[0] / 1400
im3.crop((int(228 * k3), int(1068 * k3), int(330 * k3), int(1136 * k3))).resize((256, 170), Image.LANCZOS).save(os.path.join(OUT, "cb_lamp.png"), optimize=True)
print("wrote cb_rear, cb_lamp")

# ---- olive scout truck (old-army-scout-truck.jpg, 1400-px thumbnail coordinates)
im4 = load_cv("old-army-scout-truck.jpg"); k4 = im4.shape[1] / 1400
m4 = np.zeros(im4.shape[:2], np.uint8)
for x0, y0, x1, y1 in [(668, 790, 709, 1075), (1018, 778, 1062, 1025), (920, 868, 1020, 893), (586, 1015, 657, 1064), (798, 1008, 928, 1098), (620, 740, 660, 796)]:
    cv2.rectangle(m4, (int(x0 * k4), int(y0 * k4)), (int(x1 * k4), int(y1 * k4)), 255, -1)
im4 = cv2.inpaint(im4, m4, 11, cv2.INPAINT_TELEA)
def warp(img, quad, size):
    src = np.float32(quad) * k4; w, h = size
    return cv2.warpPerspective(img, cv2.getPerspectiveTransform(src, np.float32([(0, 0), (w, 0), (w, h), (0, h)])), size)
cv2.imwrite(os.path.join(OUT, "st_front.png"), warp(im4, [(537, 803), (1120, 785), (1140, 1007), (517, 1073)], (1024, 448)))
cv2.imwrite(os.path.join(OUT, "st_hood.png"), warp(im4, [(460, 700), (893, 700), (1100, 770), (530, 802)], (1024, 640)))
cv2.imwrite(os.path.join(OUT, "st_glass.png"), warp(im4, [(457, 563), (827, 563), (863, 680), (460, 683)], (1024, 360)))
# body patina: the olive sampled off the fender, with the hood's real dust/rust grain flattened onto it,
# mirrored into a seamless tile
olive = np.median(warp(im4, [(410, 775), (440, 775), (440, 815), (410, 815)], (32, 32)).reshape(-1, 3), 0)
hood = warp(im4, [(560, 712), (880, 712), (900, 760), (580, 768)], (256, 256)).astype(np.float32)
hp = hood / (cv2.GaussianBlur(hood, (0, 0), 30) + 1)
p = np.clip(olive * (1 + (hp - 1) * 0.55) * 0.9 + (hood - hood.mean((0, 1))) * 0.12, 0, 255).astype(np.uint8)
tile = np.concatenate([np.concatenate([p, p[:, ::-1]], 1), np.concatenate([p[::-1], p[::-1, ::-1]], 1)], 0)
cv2.imwrite(os.path.join(OUT, "st_paint.png"), tile)
print("wrote st_front, st_hood, st_glass, st_paint")

# ---- kei work van (kei-work-van.jpg): its side rectified to a flat elevation (2048 x 1160, ~603 px/m, nose at
# the left, ground near y 1170); all stripe lettering painted out (the model letters made-up text back on)
im5 = load_cv("kei-work-van.jpg"); k5 = im5.shape[1] / 1400
src = np.float32([(760, 444), (1377.5, 401), (1377.5, 722.5), (760, 649.5)]) * k5
side = cv2.warpPerspective(im5, cv2.getPerspectiveTransform(src, np.float32([(0, 0), (2048, 0), (2048, 1001), (0, 1001)])), (2048, 1160))
m5 = np.zeros(side.shape[:2], np.uint8)
for x0, y0, x1, y1 in [(372, 655, 780, 752), (1170, 682, 1810, 768)]: cv2.rectangle(m5, (x0, y0), (x1, y1), 255, -1)
side = cv2.inpaint(side, m5, 7, cv2.INPAINT_TELEA)
# the windows reflected the orange shop across the road: repaint them as plain tinted glass with
# the cab's seats faintly visible inside (no reflections)
wins = [np.int32([(426, 424), (468, 300), (545, 186), (600, 136), (905, 134), (900, 398)]),
        np.int32([(994, 140), (1490, 140), (1484, 400), (984, 406)]),
        np.int32([(1556, 124), (1902, 124), (1918, 160), (1900, 330), (1830, 390), (1544, 400)])]
glass = np.zeros_like(side)
for yy in range(side.shape[0]):
    t = np.clip((yy - 120) / 300, 0, 1); glass[yy] = (np.array([78, 72, 66]) * (1 - t) + np.array([34, 30, 28]) * t)
seat = (40, 37, 36)
for x0, top in [(760, 250), (1220, 290), (1290, 290)]:                                             # seat backs seen side-on
    cv2.rectangle(glass, (x0, top + 40), (x0 + 55, 440), seat, -1); cv2.rectangle(glass, (x0 + 6, top), (x0 + 40, top + 34), seat, -1)
cv2.rectangle(glass, (430, 330), (640, 430), (26, 24, 24), -1)                                  # dashboard
glass = cv2.GaussianBlur(glass, (31, 31), 0)
wm = np.zeros(side.shape[:2], np.uint8)
for w in wins: cv2.fillPoly(wm, [w], 255)
side = np.where(wm[:, :, None] > 0, glass, side)
for w in wins: cv2.polylines(side, [w], True, (18, 18, 20), 6, cv2.LINE_AA)
# nose corner: the side view of the headlight + reflections smear when wrapped round the rounded nose; the
# headlights live on the front face instead, so the corner here is plain body white fading into the photo
bw = np.median(side[520:600, 200:300].reshape(-1, 3), 0).astype(np.float32)
for xx in range(0, 200):
    t = np.clip((xx - 120) / 80, 0, 1)
    side[396:640, xx] = (side[396:640, xx].astype(np.float32) * t + bw * (1 - t)).astype(np.uint8)
cv2.imwrite(os.path.join(OUT, "kv_side.png"), side)
print("wrote kv_side")
wd = side[1015 - 180:1015 + 180, 1656 - 180:1656 + 180].copy()
wd = cv2.cvtColor(cv2.resize(wd, (512, 512), interpolation=cv2.INTER_AREA), cv2.COLOR_BGR2BGRA)
wm = np.zeros((512, 512), np.uint8); cv2.circle(wm, (256, 256), 254, 255, -1); wd[:, :, 3] = wm
cv2.imwrite(os.path.join(OUT, "kv_wheel.png"), wd)
print("wrote kv_wheel")

# ---- commuter train (commuter-train.jpg, 1400-px thumbnail coordinates): the cab front rectified flat,
# operator name/logos, car number, destination and every lettering painted out (the model draws made-up ones)
im6 = load_cv("commuter-train.jpg"); k6 = im6.shape[1] / 1400
m6 = np.zeros(im6.shape[:2], np.uint8)
for x0, y0, x1, y1 in [(392, 186, 560, 268), (255, 262, 335, 312), (418, 598, 540, 678), (455, 682, 497, 724), (275, 868, 315, 905),
                       (628, 985, 785, 1052), (720, 762, 800, 790), (225, 678, 275, 698), (640, 852, 712, 866), (280, 765, 340, 778)]:
    cv2.rectangle(m6, (int(x0 * k6), int(y0 * k6)), (int(x1 * k6), int(y1 * k6)), 255, -1)
im6 = cv2.inpaint(im6, m6, 9, cv2.INPAINT_TELEA)
src = np.float32([(160, 168), (942, 104), (912, 1112), (208, 936)]) * k6
front = cv2.warpPerspective(im6, cv2.getPerspectiveTransform(src, np.float32([(0, 0), (1024, 0), (1024, 1000), (0, 1000)])), (1024, 1000))
# the windscreen + door window reflect the station: fade the reflections into plain dark tinted glass (the
# wipers, frames and seals stay from the photo)
wm6 = np.zeros(front.shape[:2], np.uint8)
cv2.rectangle(wm6, (40, 40), (980, 472), 255, -1); cv2.rectangle(wm6, (278, 150), (645, 1000), 0, -1)
cv2.rectangle(wm6, (390, 256), (517, 484), 255, -1)
wm6 = cv2.GaussianBlur(wm6, (15, 15), 0).astype(np.float32)[:, :, None] / 255
grey = cv2.cvtColor(cv2.cvtColor(front, cv2.COLOR_BGR2GRAY), cv2.COLOR_GRAY2BGR).astype(np.float32)
ramp = np.linspace(66, 34, front.shape[0], dtype=np.float32)[:, None, None] * np.ones((1, front.shape[1], 3), np.float32)
glass6 = ramp * 0.75 + (grey - grey.mean()) * 0.18 + 6
dark = np.minimum(grey, 70)                     # wipers / seals: keep anything darker than the glass
glass6 = np.minimum(glass6, dark + 12)
front = (front.astype(np.float32) * (1 - wm6) + glass6 * wm6).clip(0, 255).astype(np.uint8)
cv2.imwrite(os.path.join(OUT, "tr_front.png"), front)
print("wrote tr_front")

# ---- scooters (orange-scooter-rusty-scooter.jpg, 1400-px thumb): paint patches mirrored into seamless tiles
im7 = load_cv("orange-scooter-rusty-scooter.jpg"); k7 = im7.shape[1] / 1400
def tile(box, name, size=256):
    # seamless by cross-fading the patch with itself rolled half a tile (no mirror-kaleidoscope look)
    x0, y0, x1, y1 = [int(v * k7) for v in box]
    p = cv2.resize(im7[y0:y1, x0:x1], (size, size), interpolation=cv2.INTER_AREA).astype(np.float32)
    r = np.roll(np.roll(p, size // 2, 0), size // 2, 1)
    w = np.minimum(np.minimum(np.arange(size), size - 1 - np.arange(size)) / (size / 2), 1)
    m = np.minimum(w[:, None], w[None, :])[:, :, None] ** 0.7
    cv2.imwrite(os.path.join(OUT, name), (p * m + r * (1 - m)).clip(0, 255).astype(np.uint8))
tile((612, 560, 650, 630), "sc_orange.png")          # leg shield paint, soft sheen
tile((890, 572, 935, 622), "sc_rustwhite.png")     # dirty white panel paint
tile((762, 575, 792, 635), "sc_rustbox.png")         # scaly bare rust
print("wrote sc_orange, sc_rustwhite, sc_rustbox")

# ---- silver kei hatchback (silver-kei-car-stripes.jpg, 1400-px thumb): the left side rectified to a flat
# elevation in metres (rear axle at x=0, ground y=0, 400 px/m); the real racing livery + its lettering are
# painted out to plain silver (the model paints an original stripe set back on). Also the headlight + wheel.
im8 = load_cv("silver-kei-car-stripes.jpg"); k8 = im8.shape[1] / 1400
WB, RW = 2.36, 0.285
srcp = np.float32([(355, 398), (688, 452), (352, 284), (690, 318)]) * k8
dstm = np.float32([(0, RW), (WB, RW), (0, 0.93), (WB, 0.93)])
Hm = cv2.getPerspectiveTransform(srcp, dstm)
PPM, X0, X1, YT = 400, -0.62, WB + 0.78, 1.46
A = np.array([[PPM, 0, -X0 * PPM], [0, -PPM, YT * PPM], [0, 0, 1]], np.float64)
side8 = cv2.warpPerspective(im8, A @ Hm, (int((X1 - X0) * PPM), int(YT * PPM)))
silver = np.float32([196, 196, 198])
hsv8 = cv2.cvtColor(side8, cv2.COLOR_BGR2HSV)
liv = (((hsv8[:, :, 1] > 70) & (hsv8[:, :, 2] > 60)) | ((hsv8[:, :, 1] > 40) & (hsv8[:, :, 0] > 95) & (hsv8[:, :, 0] < 130))).astype(np.uint8)
band = np.zeros_like(liv); band[int((YT - 0.62) * PPM):int((YT - 0.22) * PPM), :int((WB + 0.05 - X0) * PPM)] = 1
liv = cv2.dilate(liv * band, np.ones((9, 9), np.uint8))
white = ((hsv8[:, :, 2] > 200) & (hsv8[:, :, 1] < 40)).astype(np.uint8) * band
liv |= cv2.dilate(white, np.ones((5, 5), np.uint8)) * (cv2.dilate(liv, np.ones((31, 31), np.uint8)) > 0)
side8 = cv2.inpaint(side8, liv * 255, 9, cv2.INPAINT_TELEA)
cv2.imwrite(os.path.join(OUT, "kc_side.png"), side8)
def warpc(quad, size):
    w, h = size; return cv2.warpPerspective(im8, cv2.getPerspectiveTransform(np.float32(quad) * k8, np.float32([(0, 0), (w, 0), (w, h), (0, h)])), size)
cv2.imwrite(os.path.join(OUT, "kc_lamp.png"), warpc([(762, 365), (832, 365), (832, 404), (762, 404)], (256, 144)))
wh8 = warpc([(643, 400), (735, 400), (735, 506), (643, 506)], (512, 512)); wh8 = cv2.cvtColor(wh8, cv2.COLOR_BGR2BGRA)
wm8 = np.zeros((512, 512), np.uint8); cv2.circle(wm8, (256, 256), 250, 255, -1); wh8[:, :, 3] = wm8
cv2.imwrite(os.path.join(OUT, "kc_wheel.png"), wh8)
print("wrote kc_side, kc_lamp, kc_wheel", side8.shape)
# the car's real paint: a flat patch of the rear door (soft reflections, grain), made seamless, for the
# surfaces the photo doesn't show
pp = side8[272:364, 368:568].astype(np.float32); pp = cv2.resize(pp, (256, 256))
rr = np.roll(np.roll(pp, 128, 0), 128, 1)
ww = np.minimum(np.minimum(np.arange(256), 255 - np.arange(256)) / 128, 1); mm = np.minimum(ww[:, None], ww[None, :])[:, :, None] ** 0.7
paint8 = pp * mm + rr * (1 - mm)
cv2.imwrite(os.path.join(OUT, "kc_paint.png"), paint8.clip(0, 255).astype(np.uint8))
med = np.median(side8[272:364, 368:568].reshape(-1, 3), 0)
print("kc paint median rgb", '#%02x%02x%02x' % (int(med[2]), int(med[1]), int(med[0])))
