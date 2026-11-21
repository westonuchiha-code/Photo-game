"""Textures for queue item 86 (photos/batch86/): restroom wall + floor tile (photo tile faces, tiled with grout), green
painted tread plate, brushed stainless panel, the floor-drain grate and the three sports-plaque medallions (alpha)."""
import os, numpy as np, cv2
from PIL import Image
OUT = "assets/textures"; ROT = {3: Image.ROTATE_180, 6: Image.ROTATE_270, 8: Image.ROTATE_90}
def load(n):
    im = Image.open(f"photos/batch86/{n}.jpg"); o = im.getexif().get(274, 1)
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
def tiled(face, size, n, grout, gw):
    """a tile sheet: n x n tiles, each a variation (flip/rotate) of the seamless face, grout lines drawn"""
    t = size // n; out = np.zeros((size, size, 3), np.uint8)
    for j in range(n):
        for i in range(n):
            f = cv2.resize(face, (t, t), interpolation=cv2.INTER_AREA); k = (i * 3 + j * 5) % 4
            f = np.rot90(f, k).copy(); out[j * t:(j + 1) * t, i * t:(i + 1) * t] = f
    for k in range(n + 1):
        p = min(k * t, size - 1); out[max(0, p - gw // 2):p + gw // 2 + 1, :] = grout; out[:, max(0, p - gw // 2):p + gw // 2 + 1] = grout
    return out
# wall tile: beige marbled glazed tile from the sports-art wall (a clean area), 4 x 4 tiles per texture (30 cm tiles)
wf = seamless_vp(crop(load("access-panel-grey"), 0.02, 0.03, 0.32, 0.45), (256, 256), 0)
wt = tiled(wf, 512, 4, (120, 130, 140), 4); save("b86_walltile", wt); save("b86_walltile_n", lum_normal(wt, 1.5, 1.0))
# floor tile: warm travertine-look from the drain close-up's flat tile
ff = seamless_vp(crop(load("floor-drain"), 0.65, 0.62, 0.97, 0.8), (256, 256), 0)
ft = tiled(ff, 512, 3, (60, 62, 66), 5); save("b86_floortile", ft); save("b86_floortile_n", lum_normal(ft, 2.0, 1.0))
# green painted tread plate + brushed stainless panel (seamless)
for src, name, box, flat, ns in [("green-tread-plate-dark", "b86_greentread", (0.03, 0.03, 0.97, 0.97), 6, 5.0), ("stainless-panel-green-peach", "b86_stainless", (0.05, 0.05, 0.95, 0.95), 0, 1.0)]:
    t = seamless_vp(crop(load(src), *box), (512, 512), flat); save(name, t); save(name + "_n", lum_normal(t, ns, 1.0))
# the drain grate (round, alpha outside) and the three sports plaques' ball medallions (round/oval, alpha)
def cut(src, box, size, ell=(1.0, 1.0)):
    im = cv2.resize(crop(load(src), *box), size, interpolation=cv2.INTER_AREA); h, w = im.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w]; a = ((((xx - w / 2) / (w / 2 * ell[0])) ** 2 + ((yy - h / 2) / (h / 2 * ell[1])) ** 2) <= 1).astype(np.uint8) * 255
    return np.dstack([im, a])
save("b86_drain", cut("floor-drain", (0.33, 0.348, 0.72, 0.57), (256, 256), (0.98, 0.98)))
save("b86_ball_soccer", cut("sports-wall-art", (0.183, 0.44, 0.267, 0.59), (256, 256), (0.98, 0.98)))
save("b86_ball_football", cut("sports-wall-art", (0.405, 0.39, 0.475, 0.57), (192, 256), (0.98, 0.99)))
save("b86_ball_baseball", cut("sports-wall-art", (0.643, 0.425, 0.729, 0.58), (256, 256), (0.98, 0.98)))
