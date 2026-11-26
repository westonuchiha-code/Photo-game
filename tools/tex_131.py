"""Textures for 131, from the owner's ground photos (photos/10001364xx.jpg): gravel, bare dirt, anthill sand, asphalt,
concrete, sandstone (the rock), painted pole metal, the waffle rubber mat, and three cut-outs with alpha: the tar-sealed
crack, the dead leaf, the wasp. Run from the repo root: python3 tools/tex_131.py"""
import os, numpy as np, cv2
from PIL import Image
OUT = "assets/textures"; ROT = {3: Image.ROTATE_180, 6: Image.ROTATE_270, 8: Image.ROTATE_90}
def load(n):
    im = Image.open(f"photos/10001364{n}.jpg"); o = im.getexif().get(274, 1)
    if o in ROT: im = im.transpose(ROT[o])
    return cv2.cvtColor(np.asarray(im.convert("RGB")), cv2.COLOR_RGB2BGR)
def crop(im, x0, y0, x1, y1): H, W = im.shape[:2]; return im[int(y0 * H):int(y1 * H), int(x0 * W):int(x1 * W)]
def seamless_vp(p, size, flat=8):
    p = cv2.resize(p, size, interpolation=cv2.INTER_AREA).astype(np.float32); w, h = size
    if flat: low = cv2.GaussianBlur(p, (0, 0), w / flat); p = p - low + low.mean((0, 1))
    mean = p.mean((0, 1))
    def blend(img, axis, n):
        r = np.roll(img, n // 2, axis); t = np.minimum(np.arange(n), n - 1 - np.arange(n)) / (n / 2)
        m = np.clip(t * 1.8 - 0.4, 0, 1); m = m * m * (3 - 2 * m); m = m[:, None, None] if axis == 0 else m[None, :, None]
        return mean + (img * m + r * (1 - m) - mean) / np.sqrt(m * m + (1 - m) ** 2)
    return blend(blend(p, 1, w), 0, h).clip(0, 255).astype(np.uint8)
def seam_margin(p, size, flat=8, b=0.14):
    """seamless without doubling anything up: a strip beyond each edge is cross-faded over the opposite edge"""
    n = size; bw = int(n * b); p = cv2.resize(p, (n + bw, n + bw), interpolation=cv2.INTER_AREA).astype(np.float32)
    if flat: low = cv2.GaussianBlur(p, (0, 0), n / flat); p = p - low + low.mean((0, 1))
    t = (np.arange(bw) / bw); t = t * t * (3 - 2 * t)
    p[:, :bw] = p[:, :bw] * t[None, :, None] + p[:, n:n + bw] * (1 - t[None, :, None]); p = p[:, :n]
    p[:bw] = p[:bw] * t[:, None, None] + p[n:n + bw] * (1 - t[:, None, None]); return p[:n].clip(0, 255).astype(np.uint8)
def normal_from(h, strength):
    dx = (np.roll(h, -1, 1) - np.roll(h, 1, 1)) * strength; dy = (np.roll(h, -1, 0) - np.roll(h, 1, 0)) * strength
    n = np.dstack([-dx, dy, np.ones_like(h)]); n /= np.linalg.norm(n, axis=2, keepdims=True)
    return cv2.cvtColor(((n * 0.5 + 0.5) * 255).astype(np.uint8), cv2.COLOR_RGB2BGR)
def lum_normal(img, strength=3.0, blur=1.0):
    g = cv2.GaussianBlur(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255.0, (0, 0), blur); return normal_from(g, strength)
def save(n, a): cv2.imwrite(os.path.join(OUT, n + ".png"), a); print("wrote", n, a.shape[1], a.shape[0], "avg", [int(v) for v in a[..., :3].reshape(-1, 3).mean(0)[::-1]])

for n, name, box, size, flat, ns in [
    ("26", "g131_gravel", (0.04, 0.12, 0.96, 0.62), 1024, 8, 4.0),      # the wide shot: about 1.1 m across
    ("31", "g131_dirt", (0.0, 0.14, 1.0, 0.70), 1024, 8, 3.0),         # bare earth, roots and pale stones: about 0.6 m
    ("27", "g131_sand", (0.12, 0.14, 0.72, 0.48), 512, 6, 2.5),         # the anthill's coarse sand
    ("30", "g131_asphalt", (0.0, 0.03, 0.62, 0.34), 1024, 8, 2.5),
    ("29", "g131_concrete", (0.04, 0.02, 0.96, 0.50), 1024, 6, 1.5),
    ("34", "g131_sandstone", (0.30, 0.26, 0.74, 0.48), 512, 6, 2.5),
    ("24", "g131_polemetal", (0.25, 0.30, 0.70, 0.52), 256, 4, 0.6),
    ("44", "g131_bark", (0.02, 0.04, 0.98, 0.58), 1024, 6, 4.0),         # deep-furrowed bark
    ("45", "g131_pine", (0.05, 0.32, 0.95, 0.78), 1024, 6, 3.0),          # pine needles, for foliage
    ("46", "g131_pearleaves", (0.18, 0.28, 0.88, 0.63), 1024, 6, 2.0),    # the pear tree's leaves, for foliage
    ("43", "g131_juniper", (0.0, 0.10, 1.0, 0.66), 1024, 8, 4.0)]:      # creeping juniper with dead leaves: about 0.8 m
    t = seam_margin(crop(load(n), *box), size, flat); save(name, t); save(name + "_n", lum_normal(t, ns, 1.0))
# the rubber mat: one piece, not tiled (its grid would smear at a blended seam)
m = crop(load("32"), 0.04, 0.05, 0.96, 0.60); m = cv2.resize(m, (768, int(768 * m.shape[0] / m.shape[1])), interpolation=cv2.INTER_AREA); save("g131_mat", m); save("g131_mat_n", lum_normal(m, 3.0, 1.0))

def rgba(bgr, alpha): return np.dstack([bgr, (alpha.clip(0, 1) * 255).astype(np.uint8)])
def tidy(mask, k=5, soft=1.5): k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k)); m = cv2.morphologyEx(cv2.morphologyEx(mask.astype(np.uint8), cv2.MORPH_OPEN, k), cv2.MORPH_CLOSE, k); return cv2.GaussianBlur(m.astype(np.float32), (0, 0), soft)
def biggest(mask, keep=1):
    n, lab, st, _ = cv2.connectedComponentsWithStats(mask.astype(np.uint8)); order = np.argsort(-st[1:, cv2.CC_STAT_AREA])[:keep] + 1; return np.isin(lab, order)
# the tar-sealed crack: the dark band is the cut-out
c = cv2.resize(crop(load("30"), 0.08, 0.16, 1.0, 1.0), (640, 1024), interpolation=cv2.INTER_AREA); g = cv2.GaussianBlur(cv2.cvtColor(c, cv2.COLOR_BGR2GRAY), (0, 0), 2).astype(np.float32)
save("g131_crack", rgba(c, tidy(biggest(g < 78, 2), 7, 2.5)))
# the dead leaf: tan against grey
l = cv2.resize(crop(load("29"), 0.24, 0.42, 0.68, 0.70), (512, 512), interpolation=cv2.INTER_AREA); hsv = cv2.cvtColor(l, cv2.COLOR_BGR2HSV)
lm = biggest(cv2.morphologyEx(((hsv[..., 1] > 34) & (hsv[..., 0] > 6) & (hsv[..., 0] < 36) & (hsv[..., 2] > 105)).astype(np.uint8), cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8)) > 0, 1).astype(np.uint8)
cs, _ = cv2.findContours(lm, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE); cv2.drawContours(lm, cs, -1, 1, -1)   # (fill it in: the middle of the leaf is paler than its edge)
lm = cv2.erode(cv2.morphologyEx(lm, cv2.MORPH_OPEN, np.ones((13, 13), np.uint8)), np.ones((5, 5), np.uint8)); save("g131_leaf", rgba(l, tidy(biggest(lm, 1), 3, 1.2)))
# the wasp: black, yellow and brown wings against pale concrete
w = cv2.resize(crop(load("25"), 0.25, 0.24, 0.70, 0.56), (512, 512), interpolation=cv2.INTER_AREA); hsv = cv2.cvtColor(w, cv2.COLOR_BGR2HSV)
mk = (hsv[..., 2] < 95) | ((hsv[..., 1] > 95) & (hsv[..., 0] > 8) & (hsv[..., 0] < 36))
save("g131_wasp", rgba(w, tidy(biggest(cv2.morphologyEx(mk.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((15, 15), np.uint8)) > 0, 1), 5, 1.5)))
# one pear leaf (green going red), cut out along an outline traced by hand (other leaves overlap it; colour alone will not do)
pf = load("47"); H, W = pf.shape[:2]; poly = np.array([(0.10, 0.19), (0.25, 0.185), (0.42, 0.17), (0.55, 0.03), (0.63, 0.10), (0.68, 0.30), (0.68, 0.50), (0.60, 0.62), (0.45, 0.70), (0.31, 0.755), (0.20, 0.66), (0.08, 0.52), (0.04, 0.35)]) * [W, H]
pm = np.zeros((H, W), np.uint8); cv2.fillPoly(pm, [poly.astype(np.int32)], 1); pm = cv2.GaussianBlur(pm.astype(np.float32), (0, 0), 30) > 0.5
box = (0.0, 0.0, 0.72, 0.78); pl = cv2.resize(crop(pf, *box), (512, 960), interpolation=cv2.INTER_AREA); pa = cv2.resize(crop(pm.astype(np.float32), *box), (512, 960), interpolation=cv2.INTER_AREA)
save("g131_pearleaf", rgba(pl, cv2.GaussianBlur(pa, (0, 0), 1.5)))
