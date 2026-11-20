"""Texture library (queue item 60, photos/textures2/). Seamless tiles with matching normal maps (from the tile's own
shading) for new builds and the polish pass.
  tx_stone      stacked-stone veneer (stacked-stone)           tx_rock     big weathered stone block face (stone-closeup)
  tx_stucco     tan stucco (stucco-stone-band, above the band) tx_band     the band's dark stacked stones, a 1-D strip
  tx_fins       white ribbed metal wall panel (white-fins)     tx_mulch    wood-chip mulch (mulch-curb-shrub)
  tx_drygrass   patchy dry grass on sandy dirt                 tx_dirt     bare sandy dirt with pebbles
  each with <name>_n.png (tangent-space normal map)
"""
import os, numpy as np, cv2
from PIL import Image
OUT = "assets/textures"; ROT = {3: Image.ROTATE_180, 6: Image.ROTATE_270, 8: Image.ROTATE_90}
def load(n):
    im = Image.open(f"photos/textures2/{n}.jpg"); o = im.getexif().get(274, 1)
    if o in ROT: im = im.transpose(ROT[o])
    return cv2.cvtColor(np.asarray(im.convert("RGB")), cv2.COLOR_RGB2BGR)
def crop(im, x0, y0, x1, y1): H, W = im.shape[:2]; return im[int(y0 * H):int(y1 * H), int(x0 * W):int(x1 * W)]
def seamless(p, size, flat=8, axis="both"):
    p = cv2.resize(p, size, interpolation=cv2.INTER_AREA).astype(np.float32); w, h = size
    r = np.roll(np.roll(p, h // 2 if axis != "x" else 0, 0), w // 2 if axis != "y" else 0, 1)
    wx = np.minimum(np.minimum(np.arange(w), w - 1 - np.arange(w)) / (w / 2), 1) if axis != "y" else np.ones(w)
    wy = np.minimum(np.minimum(np.arange(h), h - 1 - np.arange(h)) / (h / 2), 1) if axis != "x" else np.ones(h)
    m = np.minimum(wy[:, None], wx[None, :])[:, :, None] ** 0.6
    out = p * m + r * (1 - m)
    if flat: low = cv2.GaussianBlur(out, (0, 0), w / flat); out = out - low + low.mean((0, 1))
    return out.clip(0, 255).astype(np.uint8)
def normal(img, strength=3.0, blur=1.2):
    g = cv2.GaussianBlur(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255, (0, 0), blur)
    dx = (np.roll(g, -1, 1) - np.roll(g, 1, 1)) * 2; dy = (np.roll(g, -1, 0) - np.roll(g, 1, 0)) * 2   # wraps, so the normal map tiles too
    n = np.dstack([-dx * strength, dy * strength, np.ones_like(g)]); n /= np.linalg.norm(n, axis=2, keepdims=True)
    return ((n * 0.5 + 0.5) * 255).astype(np.uint8)[:, :, ::-1]   # RGB -> BGR for cv2
def save(n, a, s=3.0): cv2.imwrite(os.path.join(OUT, n + ".png"), a); cv2.imwrite(os.path.join(OUT, n + "_n.png"), normal(a, s)); print("wrote", n)
save("tx_stone", seamless(crop(load("stacked-stone"), 0.0, 0.05, 1.0, 0.95), (512, 1024), 10), 4)
save("tx_rock", seamless(crop(load("stone-closeup"), 0.05, 0.08, 0.95, 0.65), (512, 512), 8), 3)
sb = load("stucco-stone-band")
save("tx_stucco", seamless(crop(sb, 0.02, 0.12, 0.42, 0.46), (512, 512), 6), 2)
H, W = sb.shape[:2]   # the band runs at an angle in the photo: square it up (corners of the band's top + bottom edges)
src = np.float32([[0.0 * W, 0.505 * H], [0.92 * W, 0.47 * H], [0.92 * W, 0.565 * H], [0.0 * W, 0.70 * H]])
band = cv2.warpPerspective(sb, cv2.getPerspectiveTransform(src, np.float32([[0, 0], [1600, 0], [1600, 200], [0, 200]])), (1600, 200))
save("tx_band", seamless(band, (1024, 128), 0, "x"), 4)
save("tx_fins", seamless(crop(load("white-fins"), 0.0, 0.2, 1.0, 0.8), (512, 512), 0, "y"), 5)
mu = load("mulch-curb-shrub")
save("tx_mulch", seamless(crop(mu, 0.02, 0.33, 0.98, 0.62), (512, 512), 8), 3)
save("tx_drygrass", seamless(crop(load("dry-grass-dirt"), 0.0, 0.08, 1.0, 0.7), (512, 512), 8), 2)
save("tx_dirt", seamless(crop(load("sandy-dirt"), 0.0, 0.22, 1.0, 0.72), (512, 512), 8), 2)
