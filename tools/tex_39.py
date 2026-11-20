"""Textures for queue item 39 (grime/peeling-sticker-blue-crate.jpg). Run from the repo root: python3 tools/tex_39.py
  st_torn.png       the photo's torn neon-pink DISCONTINUED sticker cut out (alpha), straightened
  st_tearmask.png   its tear pattern alone (alpha = where label or white paper backing is left; R = pink left,
                    G = backing only), reused to tear the other generic labels the model draws
  crate_blue.png    a flat patch of the glossy blue crate plastic, seamless
"""
import os, numpy as np, cv2
from PIL import Image, ImageOps
OUT = "assets/textures"
im = cv2.cvtColor(np.asarray(ImageOps.exif_transpose(Image.open("photos/grime/peeling-sticker-blue-crate.jpg")).convert("RGB")), cv2.COLOR_RGB2BGR)
k = im.shape[1] / 1050
hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV)
blue = (hsv[:, :, 0] > 105) & (hsv[:, :, 0] < 135) & (hsv[:, :, 1] > 90)
poly = (np.float32([(200, 215), (430, 250), (770, 515), (960, 630), (1010, 990), (860, 1010), (640, 990), (500, 870), (110, 610), (130, 420)]) * k).astype(np.int32)
reg = np.zeros(im.shape[:2], np.uint8); cv2.fillPoly(reg, [poly], 255)
st = ((~blue) & (reg > 0)).astype(np.uint8) * 255
st = cv2.morphologyEx(st, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8)); st = cv2.GaussianBlur(st, (3, 3), 0)
pink = ((hsv[:, :, 0] > 140) | (hsv[:, :, 0] < 8)) & (hsv[:, :, 1] > 80) & (reg > 0)
# straighten: the text runs along ~31 degrees
ang = np.degrees(np.arctan2(860 - 420, 940 - 210))
c = (575 * k, 640 * k)
M = cv2.getRotationMatrix2D(c, ang, 1.0)
def rot(a, interp=cv2.INTER_LINEAR): return cv2.warpAffine(a, M, (im.shape[1], im.shape[0]), flags=interp)
r_im, r_st, r_pk = rot(im), rot(st), rot(pink.astype(np.uint8) * 255)
ys, xs = np.where(r_st > 128); x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
crop = lambda a: a[y0:y1, x0:x1]
W = 1024; H = int(W * (y1 - y0) / (x1 - x0))
rgb = cv2.resize(crop(r_im), (W, H), interpolation=cv2.INTER_AREA); al = cv2.resize(crop(r_st), (W, H)); pk = cv2.resize(crop(r_pk), (W, H))
cv2.imwrite(os.path.join(OUT, "st_torn.png"), np.dstack([rgb, al]))
mask = np.dstack([np.zeros_like(al), ((al > 128) & (pk < 128)).astype(np.uint8) * 255, pk, al])
cv2.imwrite(os.path.join(OUT, "st_tearmask.png"), mask)
p = cv2.resize(im[int(1150 * k):int(1250 * k), int(300 * k):int(420 * k)], (256, 256), interpolation=cv2.INTER_AREA).astype(np.float32)
r = np.roll(np.roll(p, 128, 0), 128, 1); w = np.minimum(np.minimum(np.arange(256), 255 - np.arange(256)) / 128, 1); m = np.minimum(w[:, None], w[None, :])[:, :, None] ** 0.7
t = p * m + r * (1 - m)
med = np.median(t.reshape(-1, 3), 0); t = med + (t - cv2.GaussianBlur(t, (0, 0), 10)) * 0.8 + (cv2.GaussianBlur(t, (0, 0), 10) - med) * 0.25   # keep the gloss grain, flatten the big streaks
cv2.imwrite(os.path.join(OUT, "crate_blue.png"), t.clip(0, 255).astype(np.uint8))
print("wrote st_torn, st_tearmask, crate_blue", W, H)
