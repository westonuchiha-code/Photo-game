"""Textures for queue item 84 (photos/batch84/): three barks, leaf litter, pitted rust (seamless + normals), the stump's
cut face (round, alpha), the grey steel access door as-is, a worn yellow bollard wrap from the peeling-paint and
rusted-base photos, and the tan face brick built brick by brick with tex_78's builder."""
import os, numpy as np, cv2
from PIL import Image
OUT = "assets/textures"; ROT = {3: Image.ROTATE_180, 6: Image.ROTATE_270, 8: Image.ROTATE_90}
def load(n):
    im = Image.open(f"photos/batch84/{n}.jpg"); o = im.getexif().get(274, 1)
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
for src, name, box, flat, nstr in [("bark-sap-scored", "b84_bark_scored", (0.1, 0.05, 0.9, 0.95), 4, 5.0), ("bark-shaggy-fibre", "b84_bark_shaggy", (0.1, 0.05, 0.9, 0.95), 4, 6.0),
                                   ("bark-split-trunk", "b84_bark_split", (0.25, 0.1, 0.75, 0.9), 4, 5.0), ("cut-stump-leaf-litter", "b84_litter", (0.0, 0.0, 1.0, 0.28), 6, 3.0),
                                   ("rust-pitted-closeup", "b84_rust", (0.05, 0.05, 0.95, 0.95), 6, 5.0)]:
    t = seamless_vp(crop(load(src), *box), (512, 512), flat); save(name, t); save(name + "_n", lum_normal(t, nstr, 1.0))
# the stump's cut face as a round decal (alpha outside the circle)
st = crop(load("cut-stump-leaf-litter"), 0.16, 0.335, 0.76, 0.655); st = cv2.resize(st, (512, 512), interpolation=cv2.INTER_AREA)
yy, xx = np.mgrid[0:512, 0:512]; a = (((xx - 256) / 250) ** 2 + ((yy - 256) / 245) ** 2 <= 1).astype(np.uint8) * 255
save("b84_stumptop", np.dstack([st, a]))
# the grey steel panel (an access door) as-is, lower part of the photo
save("b84_steeldoor", cv2.resize(crop(load("rusty-grey-steel-panel"), 0.0, 0.42, 1.0, 1.0), (512, 768), interpolation=cv2.INTER_AREA))
# worn yellow bollard wrap: centre strips (the flattest part of the round post) of the peeling-paint photo on top and the
# rust-eaten base photo below, stacked; seamless around the post
top = crop(load("yellow-bollard-peel-rust"), 0.3, 0.0, 0.7, 1.0); bot = crop(load("yellow-bollard-rust-base"), 0.3, 0.2, 0.7, 1.0)
top = cv2.resize(top, (256, 640)); bot = cv2.resize(bot, (256, 384)); wrap = np.vstack([top, bot]).astype(np.float32)
r = np.roll(wrap, 128, 1); t = np.minimum(np.arange(256), 255 - np.arange(256)) / 128.0; m = np.clip(t * 1.8 - 0.4, 0, 1)[None, :, None]
wrap = np.clip(wrap * m + r * (1 - m), 0, 255).astype(np.uint8)
save("b84_bollard", wrap); save("b84_bollard_n", lum_normal(wrap, 4.0, 1.0))
# tan face brick: tex_78's brick-by-brick builder on the wall photo
_ns = {}; exec(open("tools/tex_78.py").read().split("w_img =")[0].replace("photos/batch78/", "photos/batch84/"), _ns)
wall = _ns["crop"](_ns["load"]("tan-brick-wall"), 0.05, 0.02, 0.95, 0.95)
bt, bh = _ns["build"](wall, 4, band=(34, 18)); save("b84_tanbrick", bt); save("b84_tanbrick_n", _ns["normal"](bh, 6))
