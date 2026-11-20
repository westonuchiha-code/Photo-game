"""Textures for queue item 56 (photos/fabric/, all stored sideways -> turned upright first).
  fb_knit / fb_fleece / fb_velour / fb_denim / fb_cotton.png  seamless tiles cut from the photos, lighting flattened
  fb_pocket.png        the cargo-pocket flap with its snap button, cut from the denim photo (decal)
  fb_plaid_red.png     black / grey / white / red flannel: a tileable sett rebuilt with the photo's colours,
  fb_plaid_navy.png    navy / tan flannel, the same way; both carry the photo's own twill fuzz on top
"""
import os, numpy as np, cv2
from PIL import Image
OUT = "assets/textures"
def load(n): return cv2.cvtColor(np.asarray(Image.open("photos/fabric/" + n).convert("RGB").transpose(Image.ROTATE_270)), cv2.COLOR_RGB2BGR)
def crop(im, b): H, W = im.shape[:2]; return im[int(b[1] * H):int(b[3] * H), int(b[0] * W):int(b[2] * W)]
def seamless(p, size, gain=1.0, lift=0):
    p = cv2.resize(p, size, interpolation=cv2.INTER_AREA).astype(np.float32); w, h = size
    r = np.roll(np.roll(p, h // 2, 0), w // 2, 1)
    wx = np.minimum(np.minimum(np.arange(w), w - 1 - np.arange(w)) / (w / 2), 1); wy = np.minimum(np.minimum(np.arange(h), h - 1 - np.arange(h)) / (h / 2), 1)
    m = np.minimum(wy[:, None], wx[None, :])[:, :, None] ** 0.6
    out = p * m + r * (1 - m)
    low = cv2.GaussianBlur(out, (0, 0), w / 24); out = (out - low) * gain + low.mean((0, 1)) + lift
    return out.clip(0, 255).astype(np.uint8)
def save(n, a): cv2.imwrite(os.path.join(OUT, n), a); print("wrote", n)
# plain fabrics: crops avoid the folds' deepest shadows; the photos are dim, so the mean is lifted a little
save("fb_knit.png", seamless(crop(load("dark-knit-jersey.jpg"), (0.05, 0.35, 0.95, 0.85)), (512, 512), 1.3, 14))
save("fb_fleece.png", seamless(crop(load("black-fleece.jpg"), (0.05, 0.3, 0.9, 0.9)), (512, 512), 1.2, 12))
save("fb_velour.png", seamless(crop(load("black-velour.jpg"), (0.2, 0.2, 0.8, 0.8)), (512, 512), 1.2, 12))
save("fb_denim.png", seamless(crop(load("dark-denim.jpg"), (0.1, 0.45, 0.95, 0.95)), (512, 512), 1.3, 16))
save("fb_cotton.png", seamless(crop(load("grey-faded-cotton-speckled.jpg"), (0.1, 0.15, 0.9, 0.85)), (512, 512), 1.1, 10))
# cargo pocket flap decal
pk = load("dark-denim-cargo-pocket.jpg"); save("fb_pocket.png", cv2.resize(crop(pk, (0.22, 0.36, 1.0, 0.68)), (512, 256), interpolation=cv2.INTER_AREA))
# plaid: sett (colour, threads) mirrored, woven as a 2/2 twill, fuzz from the photo's high-pass
def plaid(sett, grain_src, n=512):
    seq = sett + sett[::-1]; tot = sum(w for _, w in seq); cols = []
    for c, w in seq: cols += [c] * w
    idx = (np.arange(n) * len(cols) // n); stripe = np.array([[int(c[5:7], 16), int(c[3:5], 16), int(c[1:3], 16)] for c in cols], np.float32)[idx]
    warp = np.broadcast_to(stripe[None, :, :], (n, n, 3)); weft = np.broadcast_to(stripe[:, None, :], (n, n, 3))
    y, x = np.mgrid[0:n, 0:n]; tw = (((x + y) // 2) % 2 == 0)[:, :, None]
    cloth = np.where(tw, warp, weft).astype(np.float32); cloth = cv2.GaussianBlur(cloth, (0, 0), 0.7)
    g = cv2.cvtColor(seamless(grain_src, (n, n)), cv2.COLOR_BGR2GRAY).astype(np.float32)
    g = (g - cv2.GaussianBlur(g, (0, 0), 6)); g = g / (g.std() + 1e-3)
    out = cloth * (1 + 0.07 * g[:, :, None]) + 3 * g[:, :, None]
    return out.clip(0, 255).astype(np.uint8)
K, G, L, R = "#151515", "#4a5654", "#c2ccca", "#b0262e"
save("fb_plaid_red.png", plaid([(K, 40), (L, 4), (K, 4), (L, 4), (G, 18), (K, 14), (R, 3), (K, 14), (G, 18), (L, 4)], crop(load("plaid-flannel.jpg"), (0.2, 0.4, 0.8, 0.8))))
N, T, D = "#1e2442", "#a8946c", "#121216"
save("fb_plaid_navy.png", plaid([(N, 46), (D, 4), (N, 6), (T, 22), (D, 3), (T, 22), (N, 6), (D, 4)], crop(load("navy-tan-plaid-flannel.jpg"), (0.2, 0.3, 0.8, 0.8))))
