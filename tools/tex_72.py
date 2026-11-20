"""Textures for queue item 72 (photos/inspo7/): the user's five new paintings as-is (canvas_art_*), scratched
brass (i7_brass) and foil shards (i7_foil), both seamless."""
import os, numpy as np, cv2
from PIL import Image
OUT = "assets/textures"; ROT = {3: Image.ROTATE_180, 6: Image.ROTATE_270, 8: Image.ROTATE_90}
def load(n):
    im = Image.open(f"photos/inspo7/{n}.jpg"); o = im.getexif().get(274, 1)
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
art("art-green-mug", "canvas_art_greenmug")
art("art-drip-pour", "canvas_art_drippour")
art("art-pink-splatter", "canvas_art_pinksplatter", (0.09, 0.0, 0.95, 1.0))
art("art-pink-swirls", "canvas_art_pinkswirls")
art("art-blue-red-figure", "canvas_art_bluered")
save("i7_brass", seamless(crop(load("scratched-brass-swirl"), 0.1, 0.25, 0.9, 0.75), (512, 512), 6))
save("i7_foil", seamless(crop(load("foil-shards-texture"), 0.05, 0.05, 0.95, 0.95), (512, 512), 0))
