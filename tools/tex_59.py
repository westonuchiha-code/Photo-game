"""Textures for queue item 59, utility + parking (photos/utility/util01..15; most stored sideways).
  pk_block     tan split-face concrete block wall (util03, above the cabinets), seamless
  pk_stone     stacked-stone veneer (util07, below the sign), seamless
  pk_asphalt   fresh black parking asphalt (util13), seamless
  pk_sand      sandy dirt with pebbles (util14), seamless
  pk_leaf_y    the yellow-green catalpa leaf cut out of util14 (alpha)
  pk_leaf_t    the dry tan curled leaf cut out of util13 (alpha)
"""
import os, numpy as np, cv2
from PIL import Image
OUT = "assets/textures"; ROT = {3: Image.ROTATE_180, 6: Image.ROTATE_270, 8: Image.ROTATE_90}
def load(i):
    im = Image.open(f"photos/utility/util{i:02d}.jpg"); o = im.getexif().get(274, 1)
    if o in ROT: im = im.transpose(ROT[o])
    return cv2.cvtColor(np.asarray(im.convert("RGB")), cv2.COLOR_RGB2BGR)
def crop(im, x0, y0, x1, y1): H, W = im.shape[:2]; return im[int(y0 * H):int(y1 * H), int(x0 * W):int(x1 * W)]
def seamless(p, size, flat=8):
    p = cv2.resize(p, size, interpolation=cv2.INTER_AREA).astype(np.float32); w, h = size
    r = np.roll(np.roll(p, h // 2, 0), w // 2, 1)
    wx = np.minimum(np.minimum(np.arange(w), w - 1 - np.arange(w)) / (w / 2), 1); wy = np.minimum(np.minimum(np.arange(h), h - 1 - np.arange(h)) / (h / 2), 1)
    m = np.minimum(wy[:, None], wx[None, :])[:, :, None] ** 0.6
    out = p * m + r * (1 - m)
    if flat: low = cv2.GaussianBlur(out, (0, 0), w / flat); out = out - low + low.mean((0, 1))
    return out.clip(0, 255).astype(np.uint8)
def save(n, a): cv2.imwrite(os.path.join(OUT, n + ".png"), a); print("wrote", n)
u3, u7, u13, u14 = load(3), load(7), load(13), load(14)
save("pk_block", seamless(crop(u3, 0.0, 0.0, 1.0, 0.13), (512, 256), 0))
save("pk_stone", seamless(crop(u7, 0.0, 0.66, 1.0, 1.0), (512, 512)))
a = seamless(crop(u13, 0.5, 0.62, 1.0, 1.0), (512, 512)).astype(np.float32); a = (a - a.mean((0, 1))) * 0.55 + np.array([60, 58, 56]); save("pk_asphalt", a.clip(0, 255).astype(np.uint8))   # calmer + darker: reads right from standing height
a = seamless(crop(u14, 0.55, 0.4, 0.98, 0.98), (512, 512)).astype(np.float32); a = (a - a.mean((0, 1))) * 0.55 + np.array([105, 135, 160]); save("pk_sand", a.clip(0, 255).astype(np.uint8))
def cutout(im, box, mask_fn, size):
    c = crop(im, *box); m = mask_fn(c)
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8)); m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((25, 25), np.uint8))
    n, lab, stats, _ = cv2.connectedComponentsWithStats(m); k = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA]); m = np.where(lab == k, 255, 0).astype(np.uint8)
    cnts, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE); m = np.zeros_like(m); cv2.drawContours(m, cnts, -1, 255, -1)   # fill holes
    m = cv2.GaussianBlur(m, (5, 5), 0)
    out = np.dstack([c, m]); return cv2.resize(out, size, interpolation=cv2.INTER_AREA)
hsv = lambda c: cv2.cvtColor(c, cv2.COLOR_BGR2HSV)
save("pk_leaf_y", cutout(u14, (0.15, 0.1, 0.6, 0.88), lambda c: (((hsv(c)[:, :, 0] > 18) & (hsv(c)[:, :, 0] < 45) & (hsv(c)[:, :, 1] > 110)) * 255).astype(np.uint8), (256, 384)))
save("pk_leaf_t", cutout(u13, (0.24, 0.38, 0.78, 0.75), lambda c: ((cv2.cvtColor(c, cv2.COLOR_BGR2GRAY) > 165) & (hsv(c)[:, :, 1] > 40) * 255).astype(np.uint8), (320, 256)))
