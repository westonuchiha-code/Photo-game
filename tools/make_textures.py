"""Turn the reference photo into game-ready textures.

Usage:  python3 tools/make_textures.py [photos/bar-stools.jpg]

Writes PNG textures + normal maps to assets/textures/ and a palette of
colours sampled from the photo to assets/textures/palette.json.

Everything here is plain numpy + Pillow so it runs anywhere.
"""
import json
import os
import sys

import numpy as np
from PIL import Image, ImageFilter

SRC = sys.argv[1] if len(sys.argv) > 1 else "photos/bar-stools.jpg"
OUT = "assets/textures"
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(7)

photo = Image.open(SRC).convert("RGB")
P = np.asarray(photo).astype(np.float32)


# ---------------------------------------------------------------- helpers
def to_img(a):
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def blur(a, r):
    """Gaussian blur of a float RGB / gray array via Pillow."""
    if a.ndim == 2:
        return np.asarray(to_img(a).filter(ImageFilter.GaussianBlur(r))).astype(np.float32)
    return np.stack([blur(a[..., c], r) for c in range(a.shape[2])], -1)


def delight(a, r):
    """Remove baked-in lighting: divide out the low-frequency brightness
    and put back the average, so only surface detail/colour remains."""
    low = blur(a, r) + 1.0
    return a / low * low.reshape(-1, a.shape[-1]).mean(0)


def seamless(a, axes=(0, 1)):
    """Offset-and-crossfade so the image wraps without visible seams."""
    h, w = a.shape[:2]
    out = a.copy()
    if 1 in axes:
        rolled = np.roll(out, w // 2, axis=1)
        x = np.linspace(0, 1, w)
        wx = np.clip(np.sin(np.pi * x) * 1.6, 0, 1)[None, :, None]
        out = out * wx + rolled * (1 - wx)
    if 0 in axes:
        rolled = np.roll(out, h // 2, axis=0)
        y = np.linspace(0, 1, h)
        wy = np.clip(np.sin(np.pi * y) * 1.6, 0, 1)[:, None, None]
        out = out * wy + rolled * (1 - wy)
    return out


def match_stats(a, ref_mean, contrast=1.0):
    m = a.reshape(-1, 3).mean(0)
    return (a - m) * contrast + ref_mean


def normal_from_height(h, strength):
    """Tangent-space normal map from a height field (wraps at edges)."""
    dx = (np.roll(h, -1, 1) - np.roll(h, 1, 1)) * 0.5
    dy = (np.roll(h, -1, 0) - np.roll(h, 1, 0)) * 0.5
    nx, ny, nz = -dx * strength, dy * strength, np.ones_like(h)
    ln = np.sqrt(nx ** 2 + ny ** 2 + nz ** 2)
    n = np.stack([nx / ln, ny / ln, nz / ln], -1)
    return (n * 0.5 + 0.5) * 255


def lum(a):
    return a[..., 0] * 0.299 + a[..., 1] * 0.587 + a[..., 2] * 0.114


def save(name, a):
    to_img(a).save(os.path.join(OUT, name), optimize=True)
    print("wrote", name, a.shape[1], "x", a.shape[0])


def quad(box_pts, size):
    """Perspective-rectify a quadrilateral of the photo (TL, BL, BR, TR)."""
    flat = [c for p in box_pts for c in p]
    return np.asarray(photo.transform(size, Image.QUAD, flat, Image.BICUBIC)).astype(np.float32)


palette = {}


def sample(mask_fn, region):
    x0, y0, x1, y1 = region
    px = P[y0:y1, x0:x1].reshape(-1, 3)
    px = px[mask_fn(px)]
    return np.median(px, 0)


def hexc(c):
    return "#%02x%02x%02x" % tuple(int(np.clip(v, 0, 255)) for v in c)


# ---------------------------------------------------------------- palette
yellow = sample(lambda p: (p[:, 0] > 120) & (p[:, 1] > 100) & (p[:, 2] < 90) & (p[:, 0] - p[:, 2] > 70),
                (150, 1150, 2252, 2300))
frame = sample(lambda p: (np.abs(p[:, 0] - p[:, 1]) < 12) & (p[:, 0] > 140), (60, 1095, 1600, 1150))
palette["stool_paint"] = hexc(yellow * 1.12)       # photo was shot under dim light; lift a touch
palette["counter_frame"] = hexc(frame * 1.08)
palette["post"] = "#1d1d1f"
palette["glass_tint"] = "#9fb8b4"
palette["wall"] = "#ece9e2"
print("palette", palette)


# ---------------------------------------------------------------- 1. butcher-block countertop
# The front edge of the countertop shows the glued wooden blocks. Straighten
# that band column by column, then stack copies of it (shuffled, flipped,
# re-tinted) the way a butcher-block top is built.
H = 64
cols = []
for x in range(0, 1760):
    c = P[980:1140, x]
    m = (c[:, 0] - c[:, 2] > 28) & (c[:, 0] > 80)
    idx = np.where(m)[0]
    if len(idx) < 25:
        continue
    seg = c[idx.max() - 32: idx.max() - 3]  # front face of the edge only
    sm = (seg[:, 0] - seg[:, 2] > 28) & (seg[:, 0] > 80)
    if sm.mean() < 0.97:  # something in front of the wood -> skip column
        continue
    cols.append(np.asarray(to_img(seg[None]).resize((H, 1), Image.BICUBIC)).astype(np.float32)[0])
edge = np.stack(cols, 1)  # H x W x 3
edge = delight(edge, 40)
edge = np.asarray(to_img(edge).resize((2048, H), Image.BICUBIC)).astype(np.float32)
edge = seamless(edge, axes=(1,))
wood_mean = edge.reshape(-1, 3).mean(0)

rows = []
for i in range(8):  # 8 strips across the texture height
    s = np.roll(edge, rng.integers(0, 2048), axis=1)
    if rng.random() < 0.5:
        s = s[:, ::-1]
    if rng.random() < 0.5:
        s = s[::-1]
    s = s * rng.uniform(0.88, 1.1) + rng.uniform(-6, 6, 3)
    s[:2] *= 0.75  # glue line
    rows.append(s)
butcher = np.concatenate(rows, 0)  # 512 x 2048
butcher = match_stats(butcher, wood_mean * 1.05, 1.05)
save("butcher_block.png", butcher)
save("butcher_block_edge.png", edge)
hb = blur(lum(butcher), 1.0)
save("butcher_block_normal.png", normal_from_height(hb / 255.0, 6.0))


# ---------------------------------------------------------------- 2. wood plank floor
# Rectify a patch of the laminate floor so the planks run horizontally,
# then rebuild a plank layout from slices of it.
patch = quad([(1759, 2246), (1529, 2345), (1813, 2513), (2043, 2414)], (512, 256))
patch = delight(patch, 60)
plank_src = np.asarray(to_img(patch).resize((1024, 256), Image.BICUBIC)).astype(np.float32)
plank_src = seamless(plank_src, axes=(1,))
floor_mean = plank_src.reshape(-1, 3).mean(0)
PH = 128  # plank width in px -> texture covers 8 planks
planks = []
for i in range(8):
    y0 = rng.integers(0, 256 - PH)
    s = np.roll(plank_src[y0:y0 + PH], rng.integers(0, 1024), axis=1)
    if rng.random() < 0.5:
        s = s[:, ::-1]
    s = s * rng.uniform(0.9, 1.08)
    # butt joint somewhere along the plank
    j = rng.integers(100, 900)
    s = np.concatenate([s[:, :j], s[:, j:] * rng.uniform(0.92, 1.06)], 1)
    s[:, j - 1:j + 1] *= 0.6
    s[:3] *= 0.7
    planks.append(np.repeat(s, 1, 0))
floor = np.concatenate(planks, 0)  # 1024 x 1024
floor = match_stats(floor, floor_mean, 1.0)
save("wood_floor.png", floor)
hf = lum(floor) / 255.0
save("wood_floor_normal.png", normal_from_height(blur(hf, 0.8), 4.0))


# ---------------------------------------------------------------- 3. dark green vinyl floor tile
# A clean patch of the green speckled floor, delit and quilted into a tile.
vin = P[2420:2570, 400:800]
vin = delight(vin, 50)
vin_mean = vin.reshape(-1, 3).mean(0)
canvas = np.zeros((512, 512, 3), np.float32)
weight = np.zeros((512, 512, 1), np.float32)
ph, pw = 96, 96
win = np.outer(np.hanning(ph), np.hanning(pw))[..., None] + 1e-3
for _ in range(220):  # random overlapping patches with soft windows
    sy, sx = rng.integers(0, vin.shape[0] - ph), rng.integers(0, vin.shape[1] - pw)
    ty, tx = rng.integers(0, 512), rng.integers(0, 512)
    p = vin[sy:sy + ph, sx:sx + pw]
    yy = (np.arange(ph) + ty) % 512
    xx = (np.arange(pw) + tx) % 512
    canvas[np.ix_(yy, xx)] += p * win
    weight[np.ix_(yy, xx)] += win
vinyl = canvas / weight
vinyl = match_stats(vinyl, vin_mean, 1.35)
vinyl[:2] *= 0.8
vinyl[:, :2] *= 0.8  # tile seam
save("vinyl_green.png", vinyl)
save("vinyl_green_normal.png", normal_from_height(blur(lum(vinyl) / 255.0, 0.6), 2.5))


# ---------------------------------------------------------------- 4. stool slat wood
# The seat/back slats: straighten one back slat and make it tile lengthwise.
slat = quad([(272, 1341), (272, 1377), (672, 1367), (672, 1327)], (512, 48))
slat = delight(slat, 30)
slat = seamless(slat, axes=(1,))
slat = np.concatenate([slat, slat[::-1]], 0)  # 512 x 96, two variants
slat_mean = sample(lambda p: (p[:, 0] - p[:, 2] > 60) & (p[:, 0] > 120), (250, 1250, 950, 1420))
slat = match_stats(slat, slat_mean * 1.05, 1.1)
save("slat_wood.png", slat)
palette["slat_wood"] = hexc(slat_mean)
palette["counter_wood"] = hexc(wood_mean)
palette["floor_wood"] = hexc(floor_mean)
palette["vinyl"] = hexc(vin_mean)

with open(os.path.join(OUT, "palette.json"), "w") as f:
    json.dump(palette, f, indent=2)
print("wrote palette.json")
