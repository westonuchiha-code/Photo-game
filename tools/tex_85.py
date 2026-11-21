"""Textures for queue item 85 (photos/batch85/): blue pebbled plastic, brushed bronze, grey cracked concrete, pink broom
concrete, spangled galvanized zinc and the creek bed, all seamless (two-pass, variance-preserving) + normal maps."""
import os, numpy as np, cv2
from PIL import Image
OUT = "assets/textures"; ROT = {3: Image.ROTATE_180, 6: Image.ROTATE_270, 8: Image.ROTATE_90}
def load(n):
    im = Image.open(f"photos/batch85/{n}.jpg"); o = im.getexif().get(274, 1)
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

def seamless_vp(p, size, flat=8):
    """seamless in two 1-D passes (x, then y). Each pass blends the image with a copy rolled half a tile along that
    axis: the copy is used near the borders (where it is continuous) and the original near the centre line (where
    the copy has its seam), so neither seam ever shows. The blend is variance-preserving: mixing two uncorrelated
    images drops contrast by sqrt(m^2 + (1-m)^2), so it is re-scaled around the mean (no faded bands)."""
    p = cv2.resize(p, size, interpolation=cv2.INTER_AREA).astype(np.float32); w, h = size
    if flat: low = cv2.GaussianBlur(p, (0, 0), w / flat); p = p - low + low.mean((0, 1))
    mean = p.mean((0, 1))
    def blend(img, axis, n):
        r = np.roll(img, n // 2, axis); t = np.minimum(np.arange(n), n - 1 - np.arange(n)) / (n / 2)
        m = np.clip(t * 1.8 - 0.4, 0, 1); m = m * m * (3 - 2 * m); m = m[:, None, None] if axis == 0 else m[None, :, None]
        return mean + (img * m + r * (1 - m) - mean) / np.sqrt(m * m + (1 - m) ** 2)
    out = blend(blend(p, 1, w), 0, h)
    return out.clip(0, 255).astype(np.uint8)
def normal_from(h, strength):
    dx = (np.roll(h, -1, 1) - np.roll(h, 1, 1)) * strength; dy = (np.roll(h, -1, 0) - np.roll(h, 1, 0)) * strength
    n = np.dstack([-dx, dy, np.ones_like(h)]); n /= np.linalg.norm(n, axis=2, keepdims=True)
    return cv2.cvtColor(((n * 0.5 + 0.5) * 255).astype(np.uint8), cv2.COLOR_RGB2BGR)
def lum_normal(img, strength=3.0, blur=1.0):
    g = cv2.GaussianBlur(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255.0, (0, 0), blur); return normal_from(g, strength)
for src, name, box, flat, nstr in [("blue-pebbled-plastic", "b85_blueplastic", (0.1, 0.1, 0.9, 0.9), 6, 4.0), ("brushed-bronze-metal", "b85_bronze", (0.05, 0.2, 0.95, 0.95), 4, 1.5),
                                   ("grey-cracked-concrete", "b85_crackconc", (0.05, 0.05, 0.95, 0.95), 8, 2.5), ("pink-broom-concrete", "b85_pinkconc", (0.05, 0.05, 0.95, 0.95), 8, 2.5),
                                   ("spangled-galvanized-zinc", "b85_zinc", (0.05, 0.05, 0.95, 0.95), 6, 2.0), ("creek-shallow-water", "b85_creekbed", (0.45, 0.62, 0.98, 0.98), 4, 3.0)]:
    t = seamless_vp(crop(load(src), *box), (512, 512), flat); save(name, t); save(name + "_n", lum_normal(t, nstr, 1.0))
