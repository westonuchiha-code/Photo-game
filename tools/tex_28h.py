"""Textures for 28h (covered electronics market alley, photos/city/electronics-market-arcade.jpg).
Run from the repo root: python3 tools/tex_28h.py
  em_pave.png   speckled granite pavers (speckle quilted from one paver of the photo) laid in
                600 x 400 mm courses with dark joints, a few rust stains and damp patches (2.4 m repeat)
  em_deck.png   the painted concrete deck soffit: pale grey-green paint (colour from the photo),
                black mould spots gathered along hairline cracks and formwork seams (2 m repeat)
  em_tile.png   the shopfront's blue-green glazed tiles in a random ashlar pattern with pale grout,
                colours sampled from the photo (1 m repeat)
"""
import os
import numpy as np
from PIL import Image, ImageFilter, ImageDraw

OUT = "assets/textures"
rng = np.random.default_rng(31)


def cload(n):
    im = Image.open(f"photos/city/{n}.jpg")
    try:
        o = im.getexif().get(274, 1)
    except Exception:
        o = 1
    im = im.convert("RGB")
    return {3: im.rotate(180, expand=True), 6: im.rotate(270, expand=True), 8: im.rotate(90, expand=True)}.get(o, im)


def quilt(src, H, W, patch=48):
    canvas = np.zeros((H, W, 3), np.float32)
    weight = np.zeros((H, W, 1), np.float32) + 1e-4
    win = np.outer(np.hanning(patch), np.hanning(patch))[..., None] + 1e-3
    def put(ty, tx):
        sy, sx = rng.integers(0, src.shape[0] - patch), rng.integers(0, src.shape[1] - patch)
        yy, xx = (np.arange(patch) + ty) % H, (np.arange(patch) + tx) % W
        canvas[np.ix_(yy, xx)] += src[sy:sy + patch, sx:sx + patch] * win
        weight[np.ix_(yy, xx)] += win
    for _ in range(int(H * W / patch / patch * 4)):
        put(rng.integers(0, H), rng.integers(0, W))
    for _ in range(4000):
        holes = np.argwhere(weight[..., 0] < 0.3)
        if len(holes) == 0:
            break
        cy, cx = holes[rng.integers(0, len(holes))]
        put(cy - patch // 2, cx - patch // 2)
    out = canvas / weight
    m, s = src.reshape(-1, 3).mean(0), src.reshape(-1, 3).std(0)
    return (out - out.reshape(-1, 3).mean(0)) / (out.reshape(-1, 3).std(0) + 1e-3) * s + m


def fbm(H, W, cells, octaves, seed):
    r = np.random.default_rng(seed)
    acc = np.zeros((H, W), np.float32); amp = 1.0; tot = 0.0
    for o in range(octaves):
        c = cells * 2 ** o
        g = np.tile(r.random((c, c)).astype(np.float32), (2, 2))
        a = np.asarray(Image.fromarray((g * 255).astype(np.uint8)).resize((W * 2, H * 2), Image.BICUBIC)).astype(np.float32)[:H, :W] / 255
        acc += a * amp; tot += amp; amp *= 0.5
    return acc / tot


def save(name, a):
    Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(os.path.join(OUT, name), optimize=True)
    print("wrote", name, a.shape[1], "x", a.shape[0])


im = cload("electronics-market-arcade")
k = im.size[0] / 900

# ---- pavers
pc = im.crop(tuple(int(v * k) for v in (300, 1335, 425, 1420)))
pc = pc.resize((pc.size[0], int(pc.size[1] * 1.5)), Image.LANCZOS)          # undo foreshortening
P = np.asarray(pc).astype(np.float32)
lo = np.asarray(pc.filter(ImageFilter.GaussianBlur(25))).astype(np.float32)
P = P - lo + lo.reshape(-1, 3).mean(0)
N = 1024                                    # 2.4 m -> 600 x 400 mm pavers: 4 across, 6 down
G = quilt(P, N, N, 44)
G = (G - G.reshape(-1, 3).mean(0)) * 1.1 + np.array([158, 150, 138], np.float32)
yy, xx = np.mgrid[0:N, 0:N]
ch, cw = N // 6, N // 4
row = yy // ch
off = (row % 2) * (cw // 2)
tid = (((xx + off) // cw) % 4) * 7 + row
G += rng.normal(0, 6, 64)[tid % 64][..., None]
damp = fbm(N, N, 3, 4, 5)
G *= (1 - np.clip((damp - 0.6) * 1.2, 0, 0.1))[..., None]                 # faint damp (big stains are an overlay)
rust = fbm(N, N, 6, 3, 9)
ra = np.clip((rust - 0.8) * 2.2, 0, 0.3)[..., None]
G = G * (1 - ra) + np.array([150, 95, 55]) * ra
gm = (((xx + off) % cw) < 4) | ((yy % ch) < 4)
G[gm] = G[gm] * 0.45 + np.array([60, 56, 50]) * 0.55
save("em_pave.png", G)

# ---- deck soffit paint with mould
cp = np.asarray(im.crop(tuple(int(v * k) for v in (300, 150, 520, 250)))).astype(np.float32).reshape(-1, 3)
L = cp.mean(1)
paint = np.clip(np.median(cp[L > np.percentile(L, 50)], 0) * 1.22, 0, 235)
H = W = 1024
D = paint[None, None, :] + ((fbm(H, W, 4, 5, 2) - 0.5) * 22)[..., None]
img = Image.fromarray(np.clip(D, 0, 255).astype(np.uint8))
dr = ImageDraw.Draw(img, "RGBA")
# formwork seams (straight) and wandering hairline cracks, each with mould dots strung along it
paths = [[(0, 340), (1024, 352)], [(0, 790), (1024, 778)], [(512, 0), (520, 1024)]]
for _ in range(5):
    x, y = rng.uniform(0, 1024), rng.uniform(0, 1024)
    pts = [(x, y)]
    a = rng.uniform(0, 6.28)
    for _ in range(14):
        a += rng.normal(0, 0.35); x += np.cos(a) * 30; y += np.sin(a) * 30; pts.append((x, y))
    paths.append(pts)
for pts in paths:
    dr.line(pts, fill=(70, 72, 70, 70), width=2)
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        n = int(np.hypot(x1 - x0, y1 - y0) / 7)
        for t in np.linspace(0, 1, max(n, 1)):
            if rng.random() < 0.55:
                cx, cy = x0 + (x1 - x0) * t + rng.normal(0, 4), y0 + (y1 - y0) * t + rng.normal(0, 4)
                r = rng.uniform(1.0, 3.0) if rng.random() < 0.88 else rng.uniform(3.5, 5.5)
                dr.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(30, 33, 30, int(rng.uniform(110, 200))))
for _ in range(260):                                           # stray spots
    cx, cy, r = rng.uniform(0, 1024), rng.uniform(0, 1024), rng.uniform(0.8, 2.2)
    dr.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(30, 32, 30, int(rng.uniform(80, 200))))
D = np.asarray(img.filter(ImageFilter.GaussianBlur(0.8))).astype(np.float32)
save("em_deck.png", D)

# ---- blue-green ashlar tiles
tp = np.asarray(im.crop(tuple(int(v * k) for v in (720, 870, 790, 1000)))).astype(np.float32).reshape(-1, 3)
L = tp.mean(1)
tile_cols = tp[(L > np.percentile(L, 20)) & (L < np.percentile(L, 70))]
base = np.median(tile_cols, 0)
T = Image.new("RGB", (1024, 1024), (205, 210, 205))
dr = ImageDraw.Draw(T)
# random ashlar: rows of varying height, tiles of varying width, a few tall tiles spanning two rows
y = 0
while y < 1024:
    h = int(rng.choice([96, 128, 160]))
    x = 0
    while x < 1024:
        w = int(rng.choice([96, 128, 192, 256]))
        w = min(w, 1024 - x)
        c = base * np.array([0.92, 1.02, 1.0]) + rng.normal(0, 2.5, 3) + rng.normal(0, 7)
        dr.rectangle((x + 4, y + 4, x + w - 4, y + h - 4), fill=tuple(int(v) for v in np.clip(c, 0, 255)))
        x += w
    y += h
A = np.asarray(T).astype(np.float32)
glaze = (fbm(1024, 1024, 8, 4, 12) - 0.5) * 18
A[A[..., 0] < 200] += glaze[A[..., 0] < 200][..., None]
save("em_tile.png", A)
