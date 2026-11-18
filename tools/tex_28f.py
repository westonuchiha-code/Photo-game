"""Textures for 28f (underground mall, from photos/city/underground-mall-shutters.jpg).
Run from the repo root: python3 tools/tex_28f.py
  um_floor.png    polished speckled granite in 600 x 300 mm running-bond tiles (1.2 m square repeat);
                  the speckle is quilted from the near floor of the photo with the perspective undone
  um_floor_n.png  matching normal map (grout joints only)
  um_marble.png   white marble with soft grey veins for the shop pilasters (colours from the photo)
"""
import os
import numpy as np
from PIL import Image, ImageFilter

OUT = "assets/textures"
rng = np.random.default_rng(28)


def cload(n):
    im = Image.open(f"photos/city/{n}.jpg")
    try:
        o = im.getexif().get(274, 1)
    except Exception:
        o = 1
    im = im.convert("RGB")
    return {3: im.rotate(180, expand=True), 6: im.rotate(270, expand=True), 8: im.rotate(90, expand=True)}.get(o, im)


def quilt(src, H, W, patch=64):
    n = int(H * W / (patch * patch) * 4)
    canvas = np.zeros((H, W, 3), np.float32)
    weight = np.zeros((H, W, 1), np.float32) + 1e-4
    win = np.outer(np.hanning(patch), np.hanning(patch))[..., None] + 1e-3
    for _ in range(n):
        sy, sx = rng.integers(0, src.shape[0] - patch), rng.integers(0, src.shape[1] - patch)
        ty, tx = rng.integers(0, H), rng.integers(0, W)
        yy, xx = (np.arange(patch) + ty) % H, (np.arange(patch) + tx) % W
        canvas[np.ix_(yy, xx)] += src[sy:sy + patch, sx:sx + patch] * win
        weight[np.ix_(yy, xx)] += win
    for _ in range(2000):                     # patch any spots the scatter missed
        holes = np.argwhere(weight[..., 0] < 0.3)
        if len(holes) == 0:
            break
        cy, cx = holes[rng.integers(0, len(holes))]
        sy, sx = rng.integers(0, src.shape[0] - patch), rng.integers(0, src.shape[1] - patch)
        yy, xx = (np.arange(patch) + cy - patch // 2) % H, (np.arange(patch) + cx - patch // 2) % W
        canvas[np.ix_(yy, xx)] += src[sy:sy + patch, sx:sx + patch] * win
        weight[np.ix_(yy, xx)] += win
    out = canvas / weight
    # keep the speckle crisp: quilting averages overlaps, so restore the source's contrast
    m, s = src.reshape(-1, 3).mean(0), src.reshape(-1, 3).std(0)
    om, os_ = out.reshape(-1, 3).mean(0), out.reshape(-1, 3).std(0)
    return (out - om) / (os_ + 1e-3) * s + m


def fbm(H, W, cells, octaves, seed):
    r = np.random.default_rng(seed)
    acc = np.zeros((H, W), np.float32)
    amp, tot = 1.0, 0.0
    for o in range(octaves):
        c = cells * 2 ** o
        g = r.random((c, c)).astype(np.float32)
        g = np.tile(g, (2, 2))
        im = Image.fromarray((g * 255).astype(np.uint8)).resize((W * 2, H * 2), Image.BICUBIC)
        a = np.asarray(im).astype(np.float32)[:H, :W] / 255
        acc += a * amp
        tot += amp
        amp *= 0.5
    return acc / tot


mall = cload("underground-mall-shutters")
k = mall.size[0] / 1400
# ---- granite floor
src = mall.crop(tuple(int(v * k) for v in (500, 1293, 820, 1364)))
src = src.resize((src.size[0], src.size[1] * 2), Image.LANCZOS)          # undo the foreshortening
S = np.asarray(src).astype(np.float32)
# flatten the light falloff / reflections so the speckle is even
lo = np.asarray(src.filter(ImageFilter.GaussianBlur(30))).astype(np.float32)
S = S - lo + lo.reshape(-1, 3).mean(0)
N = 1024                                  # 1.2 m -> 853 px per metre
G = quilt(S, N, N, 56)
G = (G - G.mean()) * 1.05 + np.array([168, 166, 163], np.float32)   # the photo's warm light grey
tile = np.zeros((N, N), np.float32)
grout = np.zeros((N, N), np.float32)
rowh = N // 4                              # 0.3 m rows
tilew = N // 2                             # 0.6 m tiles
yy, xx = np.mgrid[0:N, 0:N]
row = yy // rowh
off = (row % 2) * (tilew // 2)
col = ((xx + off) // tilew) % 2
tid = row * 2 + col
jit = rng.normal(0, 4.0, 8)
G += jit[tid][..., None]
gx = ((xx + off) % tilew)
gy = yy % rowh
gm = (gx < 2) | (gy < 2)
G[gm] = G[gm] * 0.35 + np.array([40, 38, 36]) * 0.65
Image.fromarray(np.clip(G, 0, 255).astype(np.uint8)).save(os.path.join(OUT, "um_floor.png"), optimize=True)
h = np.where(gm, 0.0, 1.0).astype(np.float32)
h = np.asarray(Image.fromarray((h * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))).astype(np.float32) / 255
dx = (np.roll(h, -1, 1) - np.roll(h, 1, 1)) * 0.5
dy = (np.roll(h, -1, 0) - np.roll(h, 1, 0)) * 0.5
nx, ny, nz = -dx * 3, dy * 3, np.ones_like(h)
ln = np.sqrt(nx ** 2 + ny ** 2 + nz ** 2)
Image.fromarray(((np.stack([nx / ln, ny / ln, nz / ln], -1) * 0.5 + 0.5) * 255).astype(np.uint8)).save(os.path.join(OUT, "um_floor_n.png"))
print("wrote um_floor")

# ---- white marble (pilasters): base and vein colours sampled from the photo's pilaster
pil = np.asarray(mall.crop(tuple(int(v * k) for v in (326, 400, 344, 640)))).astype(np.float32).reshape(-1, 3)
L = pil.mean(1)
base = np.median(pil[L > np.percentile(L, 60)], 0)
vein = np.median(pil[L < np.percentile(L, 8)], 0)
H, W = 1024, 512
x = np.linspace(0, 1, W)[None, :]
y = np.linspace(0, 1, H)[:, None]
base = base * 1.38                                   # the photo's pilaster is lit white; it reads grey in shade
veins = np.zeros((H, W), np.float32)
for i, (ang, wid, strength) in enumerate([(2.6, 0.012, 0.9), (2.2, 0.008, 0.6), (3.4, 0.006, 0.45), (1.8, 0.02, 0.25)]):
    wx, wy = fbm(H, W, 3, 6, 10 + i), fbm(H, W, 3, 6, 20 + i)
    t = x * 1.0 + y * ang * 0.5 + (wx - 0.5) * 0.55 + (wy - 0.5) * 0.25
    f = np.abs(((t * 2) % 1.0) - 0.5)                 # distance to the nearest vein line
    veins += np.exp(-(f / wid) ** 2) * strength * (0.4 + fbm(H, W, 2, 3, 40 + i))
cloud = (fbm(H, W, 5, 5, 3) - 0.5) * 22
M = base[None, None, :] + cloud[..., None]
v = np.clip(veins, 0, 1)[..., None]
M = M * (1 - v * 0.6) + vein[None, None, :] * v * 0.6
M = np.clip(M, 0, 255)
Image.fromarray(M.astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6)).save(os.path.join(OUT, "um_marble.png"), optimize=True)
print("wrote um_marble", base, vein)
