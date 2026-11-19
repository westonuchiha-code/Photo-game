"""Textures for 28i (bar alley, photos/city/izakaya-alley-signs.jpg).
Run from the repo root: python3 tools/tex_28i.py
  ba_brick.png     the alley's brick pavers: 200 x 100 mm in running bond (rows across the alley), each
                   brick filled with speckle quilted from the near pavers of the photo, per-brick tint
                   between grey-brown and red-brown like the photo, dark sandy joints (1.2 m square repeat)
  ba_scale.png     the pink building's fish-scale textured render: overlapping scalloped trowel marks
  ba_scale_n.png   its normal map (colour sampled from the lit part of the photo's wall)
  ba_stucco.png    plain beige render with fine grit + grime streaks (right-hand buildings)
"""
import os
import numpy as np
from PIL import Image, ImageFilter

OUT = "assets/textures"
rng = np.random.default_rng(37)


def cload(n):
    im = Image.open(f"photos/city/{n}.jpg")
    try:
        o = im.getexif().get(274, 1)
    except Exception:
        o = 1
    im = im.convert("RGB")
    return {3: im.rotate(180, expand=True), 6: im.rotate(270, expand=True), 8: im.rotate(90, expand=True)}.get(o, im)


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


im = cload("izakaya-alley-signs")
k = im.size[0] / 900

# ---- brick pavers
# speckle source: the faces of a few near bricks (photo thumbnail coords), joints excluded by a
# brightness test; collect pixels into a pool and synthesize each brick from random pool tiles
src = np.asarray(im.crop(tuple(int(v * k) for v in (150, 1500, 750, 1600)))).astype(np.float32)
lo = np.asarray(Image.fromarray(src.astype(np.uint8)).filter(ImageFilter.GaussianBlur(20))).astype(np.float32)
src = src - lo + lo.reshape(-1, 3).mean(0)
L = src.mean(-1)
face = src[L > np.percentile(L, 30)]
mean = face.mean(0)
N = 1024                                  # 1.2 m: bricks 200 x 100 mm -> 6 across, 12 down
bw, bh = N // 6, N // 12
out = np.zeros((N, N, 3), np.float32)
# speckle field: random pixels from the pool, slightly blurred so it reads as aggregate
idx = rng.integers(0, len(face), N * N)
spk = face[idx].reshape(N, N, 3) - mean
spk = np.asarray(Image.fromarray(np.clip(spk + 128, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.9))).astype(np.float32) - 128
yy, xx = np.mgrid[0:N, 0:N]
row = yy // bh
off = (row % 2) * (bw // 2)
colI = ((xx + off) // bw) % 6
tid = (row * 6 + colI) % 72
tints = np.stack([rng.normal(0, 1, 72) for _ in range(3)], -1)
red = rng.random(72)
base = np.array([128, 112, 100], np.float32)
redc = np.array([138, 98, 82], np.float32)
bc = base[None] * (1 - red[:, None] * 0.55) + redc[None] * (red[:, None] * 0.55) + tints[:, :1] * 6 + tints * 1.2
out = bc[tid] + spk * 1.25
# brick edge bevel: darken towards the joints
ex = np.minimum((xx + off) % bw, bw - 1 - (xx + off) % bw)
ey = np.minimum(yy % bh, bh - 1 - yy % bh)
e = np.minimum(ex, ey).astype(np.float32)
out *= (0.78 + 0.22 * np.clip(e / 6, 0, 1))[..., None]
joint = e < 3
out[joint] = np.array([70, 62, 55]) + rng.normal(0, 6, (joint.sum(), 3))
out *= (0.92 + 0.16 * fbm(N, N, 3, 4, 8))[..., None]          # broad wear
save("ba_brick.png", out)

# ---- fish-scale render
wall = np.asarray(im.crop(tuple(int(v * k) for v in (60, 90, 140, 300)))).astype(np.float32).reshape(-1, 3)
Lw = wall.mean(1)
pink = np.median(wall[(Lw > np.percentile(Lw, 40)) & (Lw < np.percentile(Lw, 90))], 0)
H = W = 1024                              # 1.0 m repeat; scales ~125 x 90 mm
sw, sh = 128, 92
h = np.zeros((H, W), np.float32)
for r in range(H // sh + 2):
    for cidx in range(W // sw + 2):
        cx = cidx * sw + (r % 2) * sw // 2 + rng.normal(0, 6)
        cy = r * sh + rng.normal(0, 4)
        rx, ry = sw * 0.62 + rng.normal(0, 4), sh * 1.05 + rng.normal(0, 4)
        x0, x1 = int(cx - rx) - 2, int(cx + rx) + 2
        y0, y1 = int(cy - ry * 0.1), int(cy + ry) + 2
        ys, xs = np.mgrid[y0:y1, x0:x1]
        d = ((xs - cx) / rx) ** 2 + ((ys - cy) / ry) ** 2
        inside = (d < 1) & (ys >= cy)
        t = np.clip(1 - d, 0, 1)
        v = np.where(inside, 0.45 + 0.1 * t + 0.45 * np.exp(-(t / 0.07) ** 2), 0)   # flat face, raised rim ridge
        ys %= H; xs %= W
        cur = h[ys, xs]
        h[ys, xs] = np.where(inside, v, cur)      # later rows overlap earlier ones
h += (fbm(H, W, 16, 3, 3) - 0.5) * 0.25
hb = np.asarray(Image.fromarray((np.clip(h, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.5))).astype(np.float32) / 255
dx = (np.roll(hb, -1, 1) - np.roll(hb, 1, 1)) * 0.5
dy = (np.roll(hb, -1, 0) - np.roll(hb, 1, 0)) * 0.5
nx, ny, nz = -dx * 6, dy * 6, np.ones_like(hb)
ln = np.sqrt(nx ** 2 + ny ** 2 + nz ** 2)
save("ba_scale_n.png", (np.stack([nx / ln, ny / ln, nz / ln], -1) * 0.5 + 0.5) * 255)
col = pink[None, None, :] * (0.9 + 0.16 * hb[..., None]) + ((fbm(H, W, 4, 4, 5) - 0.5) * 18)[..., None]
streak = fbm(H, W, 3, 3, 6)
col *= (1 - np.clip((streak - 0.6) * 0.8, 0, 0.15))[..., None]
save("ba_scale.png", col)

# ---- beige render
H = W = 512
b = np.array([196, 186, 168], np.float32)
S = b[None, None, :] + ((fbm(H, W, 6, 5, 9) - 0.5) * 26)[..., None]
S += (rng.random((H, W)) ** 5 * 30 - rng.random((H, W)) ** 7 * 40)[..., None]
x = np.linspace(0, 1, W)[None, :]
st = (fbm(H, W, 2, 3, 12) - 0.5) * 0 + np.clip(np.sin(x * 37) * 0.5 + 0.5, 0, 1) ** 12 * np.linspace(0.6, 0, H)[:, None]
S *= (1 - st * 0.12)[..., None]
save("ba_stucco.png", np.asarray(Image.fromarray(np.clip(S, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6))).astype(np.float32))
