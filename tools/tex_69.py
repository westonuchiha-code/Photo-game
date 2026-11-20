"""Textures for queue item 69 (photos/inspo4/).
  canvas_art_bwsplatter / canvas_art_pinkloops / canvas_art_tileface   the user's art, as-is
  i4_brick_red / i4_brick_tan   the two-tone brick wall, seamless       i4_ply   warehouse plywood back wall, seamless
  i4_pizza   the pepperoni tortilla pizza top       i4_pie   the mini pie's crust top      i4_broth   noodle broth
  i4_curry   curry sauce        i4_rice   rice      moon_halo   the hazy moon's glow (for a halo sprite)
"""
import os, numpy as np, cv2
from PIL import Image
OUT = "assets/textures"; ROT = {3: Image.ROTATE_180, 6: Image.ROTATE_270, 8: Image.ROTATE_90}
def load(n):
    im = Image.open(f"photos/inspo4/{n}.jpg"); o = im.getexif().get(274, 1)
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
def save(n, a): cv2.imwrite(os.path.join(OUT, n + ".png"), a); print("wrote", n, a.shape[1], a.shape[0])
def art(src, name, box=(0, 0, 1, 1), maxw=1024):
    a = crop(load(src), *box); s = maxw / max(a.shape[:2]); save(name, cv2.resize(a, (int(a.shape[1] * s), int(a.shape[0] * s)), interpolation=cv2.INTER_AREA))
art("art-black-white-splatter", "canvas_art_bwsplatter")
art("art-pink-green-loops", "canvas_art_pinkloops")
art("tile-face-doodle", "canvas_art_tileface")
b = load("brick-wall-bin")
save("i4_brick_red", seamless(crop(b, 0.71, 0.05, 0.98, 0.36), (384, 384)))
save("i4_brick_tan", seamless(crop(b, 0.71, 0.45, 0.98, 0.7), (384, 256)))
save("i4_ply", seamless(crop(load("warehouse-pallet-bay"), 0.3, 0.27, 0.68, 0.45), (512, 256), 6))
save("i4_pizza", cv2.resize(crop(load("pepperoni-tortilla-pizza"), 0.1, 0.3, 0.92, 0.95), (512, 512), interpolation=cv2.INTER_AREA))
save("i4_pie", cv2.resize(crop(load("mini-pies"), 0.02, 0.06, 0.84, 0.62), (512, 512), interpolation=cv2.INTER_AREA))
save("i4_broth", seamless(crop(load("cup-noodle-broth"), 0.3, 0.12, 0.7, 0.22), (256, 256), 0))
cr = load("curry-rice-plate")
save("i4_curry", seamless(crop(cr, 0.05, 0.05, 0.55, 0.35), (256, 256), 0))
save("i4_rice", seamless(crop(cr, 0.35, 0.6, 0.9, 0.95), (256, 256), 6))
mh = load("moon-halo"); H, W = mh.shape[:2]; s = min(H, W); c = mh[(H - s) // 2:(H + s) // 2, (W - s) // 2:(W + s) // 2]
save("moon_halo", cv2.resize(c, (512, 512), interpolation=cv2.INTER_AREA))
