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

# ================================================================ more photos
from PIL import ImageOps  # noqa: E402


def load(name):
    im = ImageOps.exif_transpose(Image.open(f"photos/{name}.jpg")).convert("RGB")
    return im, np.asarray(im).astype(np.float32)


def quilt(src, size, patch=96, n=None, contrast=1.0):
    """Texture synthesis: scatter soft-edged random patches of `src` over a
    wrapping canvas. Good for isotropic surfaces (terrazzo, carpet, stone)."""
    H, W = size
    n = n or int(H * W / (patch * patch) * 3.5)
    canvas = np.zeros((H, W, 3), np.float32) + src.reshape(-1, 3).mean(0) * 1e-4
    weight = np.zeros((H, W, 1), np.float32) + 1e-4
    win = np.outer(np.hanning(patch), np.hanning(patch))[..., None] + 1e-3
    for _ in range(n):
        sy, sx = rng.integers(0, src.shape[0] - patch), rng.integers(0, src.shape[1] - patch)
        ty, tx = rng.integers(0, H), rng.integers(0, W)
        yy, xx = (np.arange(patch) + ty) % H, (np.arange(patch) + tx) % W
        canvas[np.ix_(yy, xx)] += src[sy:sy + patch, sx:sx + patch] * win
        weight[np.ix_(yy, xx)] += win
    out = canvas / weight
    return match_stats(out, src.reshape(-1, 3).mean(0), contrast)


def med(A, box, mask=None):
    x0, y0, x1, y1 = box
    px = A[y0:y1, x0:x1].reshape(-1, 3)
    if mask is not None:
        px = px[mask(px)]
    return np.median(px, 0)


# ---------------------------------------------------------------- entrance photo
_, E = load("entrance-floor")

# Triangle floor: real stone-look surfaces from a light and a dark tile,
# laid into the harlequin triangle pattern from the photo.
light_src = delight(E[2800:2980, 80:260], 60)
dark_src = delight(E[3040:3220, 1320:1500], 60)
light = quilt(light_src, (640, 512), patch=96, contrast=2.0) * 0.93
dark = quilt(dark_src, (640, 512), patch=96, contrast=1.6)
# one repeat = one "up" triangle (dark) + light around it; 0.40 m x 0.50 m
h, w = 640, 512
yy, xx = np.mgrid[0:h, 0:w]
half = (yy / h) * (w / 2)  # half-width of the up-triangle at this row
inside = np.abs(xx - w / 2) < half
tri = np.where(inside[..., None], dark, light)
edge = np.abs(np.abs(xx - w / 2) - half) < 1.6
tri[edge] = tri[edge] * 0.55 + 20
tri[:2] = tri[:2] * 0.55 + 20
save("triangle_tile.png", tri)
save("triangle_tile_normal.png", normal_from_height(blur(lum(tri) / 255.0, 1.2), 1.5))
palette["tile_light"] = hexc(light_src.reshape(-1, 3).mean(0))
palette["tile_dark"] = hexc(dark_src.reshape(-1, 3).mean(0))

# Door mat.
mat_src = delight(E[1800:2200, 400:1200], 50)
mat = quilt(mat_src, (512, 512), patch=80, contrast=1.15)
save("door_mat.png", mat)
save("door_mat_normal.png", normal_from_height(lum(mat) / 255.0, 5.0))

palette["lime_wall"] = hexc(med(E, (200, 300, 400, 600)) * 1.3)  # photo was underexposed
palette["chair_pink"] = hexc(med(E, (450, 0, 1100, 1000),
                                 lambda p: (p[:, 0] > 170) & (p[:, 0] - p[:, 2] > 45) & (p[:, 1] < p[:, 0] - 30) & (p[:, 1] > 90)))
palette["door_frame"] = hexc(med(E, (1450, 300, 2252, 1900),
                                 lambda p: (np.abs(p[:, 0] - p[:, 1]) < 15) & (p[:, 0] - p[:, 2] > 8) & (p[:, 0] > 70) & (p[:, 0] < 150)))

# ---------------------------------------------------------------- booth photo
_, B = load("booth")

# Terrazzo table top.
terr_src = delight(B[260:1040, 20:500], 60)
terr = quilt(terr_src, (512, 512), patch=72, contrast=1.15)
save("terrazzo.png", terr)
palette["terrazzo"] = hexc(terr_src.reshape(-1, 3).mean(0))

# Lime-green vinyl upholstery (back cushion of the booth).
vin_src = delight(B[600:1700, 1500:2100], 80)
vinylg = quilt(vin_src * 1.3, (512, 512), patch=96, contrast=1.6)  # lift exposure
save("booth_vinyl.png", vinylg)
save("booth_vinyl_normal.png", normal_from_height(blur(lum(vinylg) / 255.0, 0.8), 3.0))
palette["booth_vinyl"] = hexc(vin_src.reshape(-1, 3).mean(0) * 1.3)
palette["booth_frame"] = hexc(med(B, (1700, 2050, 2000, 2250)))

# Walnut-look plank floor: three clean plank interiors, cut into lengths and
# laid in staggered columns (planks run along the texture's V axis).
o = (0, 2360)  # crop origin used when choosing these windows
wins = [(450, 705), (735, 985), (1030, 1260)]
sources = []
for x0, x1 in wins:
    s = B[o[1] + 340:o[1] + 780, x0:x1]
    s = delight(s, 50)
    sources.append(np.asarray(to_img(s).resize((256, 1300), Image.BICUBIC)).astype(np.float32))
walnut_mean = np.mean([s.reshape(-1, 3).mean(0) for s in sources], 0)
sources = [match_stats(s, walnut_mean) for s in sources]  # same tone, different grain
cols = []
for c in range(4):
    col, hgt = [], 0
    off = rng.integers(0, 1300)
    while hgt < 2048 + 1300:
        s = sources[rng.integers(0, 3)]
        if rng.random() < 0.5:
            s = s[::-1]
        if rng.random() < 0.5:
            s = s[:, ::-1]
        s = s * rng.uniform(0.94, 1.06)
        s = s.copy()
        s[:2] *= 0.55  # butt joint
        col.append(s)
        hgt += s.shape[0]
    col = np.concatenate(col, 0)[off:off + 2048]
    col[:, :2] *= 0.6  # long edge
    cols.append(col)
walnut = np.concatenate(cols, 1)  # 2048 x 1024
walnut = match_stats(walnut, walnut_mean, 1.05)
walnut = np.asarray(to_img(walnut).resize((512, 1024), Image.BICUBIC)).astype(np.float32)
save("walnut_floor.png", walnut)
save("walnut_floor_normal.png", normal_from_height(blur(lum(walnut) / 255.0, 0.6), 4.0))
palette["walnut_floor"] = hexc(walnut_mean)

# White bevelled subway tile (pattern drawn, colour/grout sampled from photo).
tw, th = 256, 128  # one tile = 150 x 75 mm
H2, W2 = th * 4, tw * 2
yy, xx = np.mgrid[0:H2, 0:W2]
row = yy // th
xs = (xx + (row % 2) * (tw // 2)) % tw
ys = yy % th
d = np.minimum(np.minimum(xs, tw - 1 - xs), np.minimum(ys, th - 1 - ys)).astype(np.float32)
height = np.clip(d / 14.0, 0, 1)  # bevel ramps up over 14 px
height = height ** 0.7
tile_col = np.array([236, 236, 230], np.float32)
grout = np.array([196, 196, 190], np.float32)
tile = np.where((d < 2)[..., None], grout, tile_col * (0.94 + 0.06 * height[..., None]))
save("subway_tile.png", tile)
save("subway_tile_normal.png", normal_from_height(height + (d < 2) * -0.2, 3.0))

# Framed poster on the tile wall (bar photo): straighten it in two passes.
_poster = photo.transform((300, 600), Image.QUAD, [1927, 474, 1921, 825, 2075, 838, 2091, 509], Image.BICUBIC)
_poster.transform((256, 640), Image.QUAD, [72, 22, 36, 578, 252, 580, 284, 22], Image.BICUBIC).save(os.path.join(OUT, "poster.png"))
print("wrote poster.png")

# ---------------------------------------------------------------- street sign photos
LQ, LA = load("liquor-sign")
TR, TA = load("two-rivers-sign")

# Sign faces, straightened. The LIQUOR face is backlit, so its baked light is kept.
LQ.transform((1024, 400), Image.QUAD, [396, 670, 450, 1344, 1656, 1330, 1652, 864], Image.BICUBIC).save(os.path.join(OUT, "liquor_face.png"))
TR.transform((600, 540), Image.QUAD, [890, 550, 890, 1110, 1490, 1096, 1504, 696], Image.BICUBIC).save(os.path.join(OUT, "two_rivers_face.png"))
print("wrote liquor_face.png, two_rivers_face.png")
palette["liquor_letters"] = hexc(med(LA, (600, 900, 1500, 1200), lambda p: (p[:, 1] > p[:, 2]) & (p[:, 0] < 190) & (p[:, 0] > 90)))

# Sidewalk concrete (Two Rivers photo): quilt a smooth patch, then cut the
# tooled joints back in at the slab size seen in the photos (~1.5 m).
walk_src = delight(TA[2350:2680, 0:450], 70)
walk = quilt(walk_src, (512, 512), patch=96, contrast=1.4)
yy, xx = np.mgrid[0:512, 0:512]
joint = (np.minimum(yy, 511 - yy) < 2) | (np.minimum(xx, 511 - xx) < 2)
walk[joint] *= 0.62
save("sidewalk.png", walk)
save("sidewalk_normal.png", normal_from_height(blur(np.where(joint, 0.0, 1.0) + lum(walk) / 255.0 * 0.3, 1.0), 2.0))

# Packed dirt (LIQUOR photo, outside the shadow) and gravel bed (Two Rivers photo).
dirt_src = delight(LA[2500:3000, 1550:2240], 80)
dirt = quilt(dirt_src, (512, 512), patch=96, contrast=1.3)
save("dirt.png", dirt)
save("dirt_normal.png", normal_from_height(blur(lum(dirt) / 255.0, 0.7), 4.0))
gravel_src = delight(TA[2000:2700, 1300:2252], 80)
gravel = quilt(gravel_src, (512, 512), patch=112, contrast=1.2)
save("gravel.png", gravel)
save("gravel_normal.png", normal_from_height(blur(lum(gravel) / 255.0, 0.6), 6.0))

with open(os.path.join(OUT, "palette.json"), "w") as f:
    json.dump(palette, f, indent=2)
print("wrote palette.json")
