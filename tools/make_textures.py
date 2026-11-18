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
    # fill any spots the random scatter missed (own rng so the main scatter is unchanged)
    frng = np.random.default_rng(H * 7919 + W)
    for _ in range(400):
        holes = np.argwhere(weight[..., 0] < 0.02)
        if len(holes) == 0:
            break
        cy, cx = holes[frng.integers(0, len(holes))]
        sy, sx = frng.integers(0, src.shape[0] - patch), frng.integers(0, src.shape[1] - patch)
        yy, xx = (np.arange(patch) + cy - patch // 2) % H, (np.arange(patch) + cx - patch // 2) % W
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
# poster.png is now a made-up cartoon ad drawn by tools/make_signs.py
# _poster = photo.transform((300, 600), Image.QUAD, [1927, 474, 1921, 825, 2075, 838, 2091, 509], Image.BICUBIC)
# _poster.transform((256, 640), Image.QUAD, [72, 22, 36, 578, 252, 580, 284, 22], Image.BICUBIC).save(os.path.join(OUT, "poster.png"))
# print("wrote poster.png")

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

# ---------------------------------------------------------------- abandoned building photos
AF, AFA = load("abandoned-front")
AS, ASA = load("abandoned-side")
AD, ADA = load("abandoned-alcove-door")
AT, ATA = load("abandoned-alcove-steps")


def rect_(im, pts, size, name):
    im.transform(size, Image.QUAD, [v * 2 for v in pts], Image.BICUBIC).save(os.path.join(OUT, name))
    print("wrote", name)


# Hero pieces kept whole (straightened): the boarded alcove door with its
# handle cut-out, the boarded front door with paper scraps, the "1402"
# transom, the flattened cardboard box.
rect_(AD, (240, 280, 330, 1175, 912, 1125, 975, 345), (600, 700), "osb_alcove_door.png")
rect_(AF, (1068, 280, 1068, 640, 1240, 630, 1240, 285), (240, 500), "osb_front_door.png")
rect_(AF, (1070, 165, 1070, 270, 1243, 268, 1243, 180), (320, 160), "transom_1402.png")
rect_(AD, (325, 1170, 322, 1312, 650, 1288, 600, 1160), (400, 180), "cardboard.png")

# OSB sheathing: tiling version quilted from the evenly lit middle of the alcove board.
_osb_full = np.asarray(Image.open(os.path.join(OUT, "osb_alcove_door.png")).convert("RGB")).astype(np.float32)
osb_src = np.concatenate([_osb_full[230:420, 20:540], _osb_full[520:690, 20:540]], 0)  # skip the handle cut-out
osb_src = delight(osb_src, 60)
osb = quilt(osb_src, (512, 512), patch=128, contrast=1.15)
save("osb.png", osb)
save("osb_normal.png", normal_from_height(blur(lum(osb) / 255.0, 0.8), 3.0))
palette["osb"] = hexc(osb_src.reshape(-1, 3).mean(0))

# Tan brick with black spray-paint blobs (planter front).
brick = np.asarray(AF.transform((900, 260), Image.QUAD, [570, 1730, 580, 2252, 2450, 1720, 2456, 1380], Image.BICUBIC)).astype(np.float32)
brick = delight(brick, 60)
brick = seamless(brick, axes=(1,))
save("brick_planter.png", brick)
save("brick_planter_normal.png", normal_from_height(blur(lum(brick) / 255.0, 1.0), 3.0))

# Vertical ribbed siding with peeling paint (side photo pier), straightened.
siding = np.asarray(AS.transform((360, 820), Image.QUAD, [2340, 700, 2310, 1880, 2830, 1880, 2860, 700], Image.BICUBIC)).astype(np.float32)
siding = delight(siding, 90)
siding = seamless(siding, axes=(0, 1))
siding = match_stats(siding, np.array([190, 172, 150], np.float32), 1.0)  # remove the sodium-light cast; paint reads tan-pink in person
save("siding.png", siding)
save("siding_normal.png", normal_from_height(blur(lum(siding) / 255.0, 1.2), 4.0))
palette["siding"] = hexc(siding.reshape(-1, 3).mean(0))

# Planter soil, and the leaf-strewn sidewalk in front of the building.
soil_src = delight(AFA[1340:1500, 1000:1900], 50)
save("planter_soil.png", quilt(soil_src, (256, 256), patch=64, contrast=1.2))
leafwalk_src = delight(AFA[1700:2240, 2700:3950], 90)
leafwalk = quilt(leafwalk_src, (512, 512), patch=128, contrast=1.3)
save("sidewalk_leaves.png", leafwalk)
save("sidewalk_leaves_normal.png", normal_from_height(blur(lum(leafwalk) / 255.0, 0.8), 2.0))

# Colours: grey painted-over patch, teal steps.
palette["gray_patch"] = hexc(med(AFA, (2840, 760, 3220, 960)))
palette["teal_steps"] = hexc(med(ATA, (100, 2500, 2000, 3100), lambda p: (p[:, 2] > p[:, 0] + 10) & (p[:, 1] > p[:, 0])) * 1.1)

# ---------------------------------------------------------------- tire shop photos
TF, TFA = load("tire-shop-front")
TC, TCA = load("tire-shop-corner")
rect_(TF, (805, 415, 805, 700, 1320, 655, 1320, 470), (1600, 560), "tire_front.png")
rect_(TF, (635, 445, 635, 690, 805, 700, 805, 415), (700, 560), "tire_left.png")
rect_(TC, (1030, 362, 1062, 770, 1475, 742, 1468, 437), (1400, 560), "tire_side.png")
lot_src = delight(TFA[1500:2200, 1200:3000], 120)
lot = quilt(lot_src, (512, 512), patch=128, contrast=1.3)
lot = lum(lot)[..., None] / max(lum(lot).mean(), 1) * np.array([150, 148, 142], np.float32)  # grey concrete, sodium cast removed
save("lot_concrete.png", lot)
save("lot_concrete_normal.png", normal_from_height(blur(lum(lot) / 255.0, 1.0), 2.0))


# ---------------------------------------------------------------- wall, pole and blinds photos
def wall_tex(name, out, box_frac, size, contrast=1.1, radius=120, normal=3.0):
    _, A = load(name)
    h, w = A.shape[:2]
    x0, y0, x1, y1 = box_frac
    crop = A[int(y0 * h):int(y1 * h), int(x0 * w):int(x1 * w)]
    crop = delight(crop, radius)
    crop = np.asarray(to_img(crop).resize(size, Image.BICUBIC)).astype(np.float32)
    crop = seamless(crop)
    crop = match_stats(crop, crop.reshape(-1, 3).mean(0), contrast)
    save(out + ".png", crop)
    save(out + "_normal.png", normal_from_height(blur(lum(crop) / 255.0, 1.0), normal))
    return crop


_ss = wall_tex("wall-red-sandstone", "wall_red_sandstone", (0.0, 0.0, 1.0, 0.72), (512, 640))
_g = lum(_ss)[..., None]
save("wall_red_sandstone.png", _g + (_ss - _g) * 1.6)  # restore the reddish tone
wall_tex("wall-gray-tile", "wall_gray_tile", (0.0, 0.0, 1.0, 0.6), (512, 600))
wall_tex("wall-gray-brick", "wall_gray_brick", (0.0, 0.0, 1.0, 0.9), (512, 920))
wall_tex("wall-olive-stucco", "wall_olive_stucco", (0.0, 0.0, 1.0, 0.56), (512, 512), contrast=1.3)
wall_tex("wall-teal-stucco", "wall_teal_stucco", (0.3, 0.05, 0.62, 0.42), (512, 512), contrast=1.2)
# Red brick (also the apartment stair wall): the photo is at a steep angle, so
# straighten the near part, split brick face from mortar by colour, and lay a
# clean running bond: each brick gets its own patch of real face + tint.
_rb = np.asarray(load("wall-red-brick")[0].transform((1600, 640), Image.QUAD, [140, 380, 300, 1800, 2800, 1240, 2800, 620], Image.BICUBIC)).astype(np.float32)[:, :900]
_rb = delight(_rb, 120)
_face = (_rb[..., 0] - _rb[..., 2]) > 18
face_src = quilt(np.where(_face[..., None], _rb, np.median(_rb[_face], 0)), (1024, 1024), patch=72, contrast=1.15)
mortar_c = np.median(_rb[~_face], 0)
BW, CH, J = 240, 80, 14          # brick pitch, course pitch, joint (px); 4 x 8 bricks per tile
out = np.zeros((CH * 8, BW * 4, 3), np.float32)
mortar = quilt(np.where((~_face)[..., None], _rb, mortar_c), (CH * 8, BW * 4), patch=48, contrast=1.0)
out[:] = mortar
hgt = np.zeros(out.shape[:2], np.float32)
for r in range(8):
    off = (BW // 2) * (r % 2)
    for c in range(-1, 5):
        x0 = c * BW + off + J // 2
        y0 = r * CH + J // 2
        bw, bh = BW - J, CH - J
        sy, sx = rng.integers(0, 1024 - bh), rng.integers(0, 1024 - bw)
        brick = face_src[sy:sy + bh, sx:sx + bw] * rng.uniform(0.85, 1.12) * np.array([1.0, rng.uniform(0.93, 1.03), rng.uniform(0.92, 1.05)])
        e = np.minimum(np.minimum(np.arange(bw)[None], bw - 1 - np.arange(bw)[None]), np.minimum(np.arange(bh)[:, None], bh - 1 - np.arange(bh)[:, None]))
        brick *= (0.82 + 0.18 * np.clip(e / 5, 0, 1))[..., None]  # rounded arrises
        xs = (np.arange(x0, x0 + bw)) % out.shape[1]
        out[np.ix_(np.arange(y0, y0 + bh), xs)] = brick
        hgt[np.ix_(np.arange(y0, y0 + bh), xs)] = np.clip(e / 4, 0, 1)
_g = lum(out)[..., None]
out = np.where(hgt[..., None] > 0, _g + (out - _g) * 1.7 + np.array([10, -2, -8], np.float32), out)  # brick faces: back to red-brown
save("wall_red_brick.png", out)
save("wall_red_brick_normal.png", normal_from_height(blur(hgt + lum(out) / 255 * 0.15, 1.0), 4.0))
# Rusty pole, built in layers. Colours and grain come from the close-up photo:
# the cleanest all-paint and all-rust windows are found automatically and quilted.
# Flake shapes are a wrapping, domain-warped noise mask (crisp, jagged edges,
# ~20% coverage like the full-pole photo), with a pale lifted-paint rim.
_, RPA = load("rusty-pole-closeup")
h, w = RPA.shape[:2]
pole = delight(RPA[:, int(0.36 * w):int(0.82 * w)], 250)
is_rust = (pole[..., 0] - pole[..., 2]) > 25


def _best_window(want_rust, size=220):
    best, bw = -1, None
    for y in range(0, pole.shape[0] - size, 60):
        for x in range(0, pole.shape[1] - size, 60):
            f = is_rust[y:y + size, x:x + size].mean()
            score = f if want_rust else 1 - f
            if score > best:
                best, bw = score, pole[y:y + size, x:x + size]
    return bw


def _wrap_noise(H, W, cells, octaves=4, seed=0):
    r = np.random.default_rng(seed)
    out = np.zeros((H, W), np.float32)
    amp = tot = 0.0
    amp = 1.0
    for o in range(octaves):
        gh, gw = cells[0] * 2 ** o, cells[1] * 2 ** o
        g = np.tile(r.random((gh, gw)).astype(np.float32), (3, 3))
        up = np.asarray(Image.fromarray(g).resize((W * 3, H * 3), Image.BICUBIC)).astype(np.float32)[H:2 * H, W:2 * W]
        out += up * amp
        tot += amp
        amp *= 0.5
    return out / tot


H_, W_ = 1024, 512
paint = quilt(_best_window(False), (H_, W_), patch=96, contrast=1.0)
paint = lum(paint)[..., None] / max(lum(paint).mean(), 1) * np.array([166, 184, 196], np.float32)  # pale grey-blue in person
rust = quilt(_best_window(True), (H_, W_), patch=96, contrast=1.3)
rust = match_stats(rust, np.array([132, 72, 40], np.float32), 1.2)  # reddish-brown rust as in the photo
base = _wrap_noise(H_, W_, (6, 3), 5, seed=4)
wx = _wrap_noise(H_, W_, (8, 4), 3, seed=5) - 0.5
wy = _wrap_noise(H_, W_, (8, 4), 3, seed=6) - 0.5
yy, xx = np.mgrid[0:H_, 0:W_]
warped = base[(yy + (wy * 90).astype(int)) % H_, (xx + (wx * 90).astype(int)) % W_]
thr = np.percentile(warped, 80)
m = np.clip((warped - thr) * 60, 0, 1)
chips = _wrap_noise(H_, W_, (40, 20), 2, seed=7)  # small scattered chips
m = np.maximum(m, np.clip((chips - np.percentile(chips, 97)) * 80, 0, 1))
rim = np.clip(blur(m * 255, 2.0) / 255 * (1 - m) * 5, 0, 1)
out = paint * (1 - m[..., None]) + rust * m[..., None]
out = out * (1 - rim[..., None] * 0.55) + np.array([236, 226, 205], np.float32) * rim[..., None] * 0.55
save("rusty_paint.png", out)
height = (1 - m) * 0.6 + rim * 0.4 + lum(out) / 255 * 0.1
save("rusty_paint_normal.png", normal_from_height(blur(height, 1.0), 5.0))
save("rusty_paint_rough.png", np.repeat((0.45 + 0.5 * blur(m * 255, 1) / 255)[..., None] * 255, 3, -1))
print("rust coverage", round(float(m.mean()), 2))
_bl = wall_tex("window-blinds", "blinds", (0.0, 0.3, 1.0, 0.95), (512, 512), contrast=1.0, radius=200, normal=4.0)
save("blinds.png", lum(_bl)[..., None] / max(lum(_bl).mean(), 1) * np.array([214, 210, 200], np.float32))  # off-white, streetlight cast removed

# ---------------------------------------------------------------- rocks, grass, leaves, ground photos
wall_tex("river-rock", "river_rock", (0.03, 0.03, 0.97, 0.6), (512, 512), contrast=1.15, radius=150, normal=6.0)
wall_tex("dirt-lot", "dirt_lot", (0.15, 0.3, 0.95, 0.72), (512, 512), contrast=1.2, radius=150, normal=5.0)
wall_tex("pavers-herringbone-cover", "pavers_herringbone", (0.0, 0.0, 1.0, 0.36), (512, 640), contrast=1.1, radius=150)
wall_tex("crack2", "concrete_cracked", (0.0, 0.0, 1.0, 1.0), (1024, 576), contrast=1.1, radius=200, normal=4.0)
rect_(load("rusty-tactile-plate")[0], (362, 585, 425, 1295, 768, 1235, 668, 612), (300, 600), "tactile_plate.png")

# Leaf litter: quilted from the gutter pile, plus a ragged-edged strip version
# (RGBA) for laying along curbs.
_, LV = load("leaves-curb")
h, w = LV.shape[:2]
leaf_src = delight(LV[int(0.22 * h):int(0.48 * h), int(0.03 * w):int(0.5 * w)], 100)
litter = quilt(leaf_src, (512, 512), patch=112, contrast=1.15)
save("leaf_litter.png", litter)
yy, xx = np.mgrid[0:512, 0:1024]
edge = 0.5 + 0.18 * np.sin(xx / 1024 * np.pi * 6) + 0.12 * np.sin(xx / 1024 * np.pi * 22 + 1.3)
dist = np.abs(yy / 512 - 0.5) * 2
noise = blur(rng.random((512, 1024)).astype(np.float32) * 255, 3) / 255
alpha = np.clip((edge + (noise - 0.5) * 0.6 - dist) * 6, 0, 1)
strip = np.concatenate([np.tile(litter, (1, 2, 1)), alpha[..., None] * 255], -1)
Image.fromarray(np.clip(strip, 0, 255).astype(np.uint8), "RGBA").save(os.path.join(OUT, "leaf_strip.png"))
print("wrote leaf_strip.png")

# Single oak leaf cut out from the concrete (bright leaf vs dark ground).
_, OK = load("oak-leaf")
h, w = OK.shape[:2]
leaf = OK[int(0.15 * h):int(0.72 * h), int(0.03 * w):int(0.92 * w)]
L_ = blur(lum(leaf), 2)
mask = np.clip((L_ - 95) / 25, 0, 1)
leaf_rgba = np.concatenate([leaf, mask[..., None] * 255], -1)
Image.fromarray(np.clip(leaf_rgba, 0, 255).astype(np.uint8), "RGBA").resize((256, 296)).save(os.path.join(OUT, "oak_leaf.png"))
print("wrote oak_leaf.png")

# Dry grass colours (tuft photo) and rock colours (river rock photo).
_, GT = load("rocks-grass-tuft")
h, w = GT.shape[:2]
gpx = GT[int(0.15 * h):int(0.5 * h), int(0.3 * w):int(0.8 * w)].reshape(-1, 3)
gpx = gpx[(gpx[:, 0] > gpx[:, 2] + 25)]
palette["grass"] = [hexc(np.percentile(gpx, q, axis=0)) for q in (20, 50, 80, 95)]
_, RR = load("river-rock")
rpx = RR[::8, ::8].reshape(-1, 3)
palette["rocks"] = [hexc(c) for c in rpx[rng.choice(len(rpx), 12)]]

# ---------------------------------------------------------------- sky, moon, walk signals
_, SK = load("sky-clouds-moon")
h, w = SK.shape[:2]
sky = SK[0:int(0.62 * h)]  # clouds above the buildings (moon is in here too)
sky = np.asarray(to_img(sky).resize((1024, 1280), Image.BICUBIC)).astype(np.float32)
sky = seamless(sky, axes=(1,))
save("sky_clouds.png", sky)

# Half moon cut out of black: alpha follows brightness.
_, MO = load("moon2")
L_ = lum(MO)
ys, xs = np.where(blur(L_, 4) > 40)                     # the moon disc, tight crop
y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
pad = 40
moon = MO[max(0, y0 - pad):y1 + pad, max(0, x0 - pad):x1 + pad]
Lm = lum(moon)
a = np.clip((blur(Lm, 1.5) - 22) / 28, 0, 1)
moon = np.clip(moon * 1.35, 0, 255)
Image.fromarray(np.clip(np.concatenate([moon, a[..., None] * 255], -1), 0, 255).astype(np.uint8), "RGBA").resize((384, int(384 * moon.shape[0] / moon.shape[1])), Image.LANCZOS).save(os.path.join(OUT, "moon.png"))
print("wrote moon.png", moon.shape)

rect_(load("walk-button3")[0], (352, 232, 342, 838, 746, 836, 735, 232), (300, 450), "walk_button_sign.png")
_, PH = load("ped-signal-hand")
save("ped_hand.png", PH[1300:1930, 710:1490])
_, PW = load("ped-signal-walk")
save("ped_walk.png", PW[1500:2500, 760:1500])

# ---------------------------------------------------------------- bark, art, street objects
# Purple holiday lighting removed from the spruce bark by matching to a neutral brown.
for name, out, box, tint in [
    ("spruce-bark-knots3", "bark_spruce", (0.0, 0.0, 1.0, 1.0), (118, 98, 86)),
    ("cherry-bark1", "bark_cherry", (0.0, 0.05, 1.0, 0.95), None),
    ("pale-bark-closeup", "bark_pale", (0.38, 0.05, 0.9, 0.95), None),
    ("oak-bark-trunk1", "bark_oak", (0.3, 0.1, 0.72, 0.9), None),
]:
    t = wall_tex(name, out, box, (512, 1024), contrast=1.1, radius=150, normal=6.0)
    if tint is not None:
        g = lum(t)[..., None] / max(lum(t).mean(), 1)
        save(out + ".png", g * np.array(tint, np.float32))
_, MU = load("spruce-tree-lights")
h, w = MU.shape[:2]
mulch = delight(MU[int(0.78 * h):int(0.98 * h), :], 120)
mulch = quilt(mulch, (512, 512), patch=112, contrast=1.2)
g = lum(mulch)[..., None] / max(lum(mulch).mean(), 1)
save("mulch.png", g * np.array([104, 70, 52], np.float32))

wall_tex("graffiti-painting", "art_graffiti", (0.0, 0.0, 1.0, 1.0), (512, 1024), contrast=1.0, radius=400, normal=1.5)
wall_tex("painted-wall-impasto", "art_impasto", (0.0, 0.0, 1.0, 1.0), (512, 1024), contrast=1.0, radius=400, normal=5.0)

rect_(load("newspaper-box")[0], (432, 730, 432, 930, 525, 932, 525, 735), (200, 420), "news_box_logo.png")
rect_(load("parking-sign-block")[0], (318, 686, 318, 1006, 748, 1006, 748, 686), (430, 320), "parking_sign.png")
rect_(load("parking-sign-block")[0], (395, 606, 395, 668, 665, 668, 665, 606), (270, 62), "no_trespassing.png")

# Rabbit sculpture silhouette: cut the bright cut-out from the night sky.
_, RB = load("rabbit-sculpture")
h, w = RB.shape[:2]
rb = RB[int(0.2 * h):int(0.62 * h), int(0.3 * w):int(0.62 * w)]
a = np.clip((blur(lum(rb), 1.5) - 150) / 30, 0, 1)
Image.fromarray(np.clip(np.concatenate([rb, a[..., None] * 255], -1), 0, 255).astype(np.uint8), "RGBA").save(os.path.join(OUT, "rabbit.png"))
print("wrote rabbit.png")

# ---------------------------------------------------------------- apartment building
wall_tex("apartment-stair-wall", "brick_scratched", (0.03, 0.15, 0.7, 0.75), (1024, 512), contrast=1.1, radius=150, normal=5.0)
wall_tex("apartment-laminate-closeup", "laminate_oak", (0.0, 0.0, 1.0, 1.0), (512, 1024), contrast=1.05, radius=300, normal=1.5)
wall_tex("apartment-stair-treads", "stair_tread", (0.1, 0.3, 0.92, 0.42), (512, 160), contrast=1.0, radius=300, normal=2.0)
rect_(load("apartment-front")[0], (437, 780, 437, 840, 590, 840, 590, 780), (400, 160), "airlie_sign.png")
rect_(load("apartment-mailboxes")[0], (520, 330, 545, 720, 1440, 715, 1460, 370), (1000, 420), "mailboxes.png")
_, AF2 = load("apartment-front")
palette["apartment_brick"] = hexc(med(AF2, (100, 1000, 700, 1500)))
palette["hall_trim"] = "#c9b48c"

# ---------------------------------------------------------------- alien textures (painted impasto)
for i in range(1, 6):
    wall_tex(f"alien-texture{i}", f"alien_{i}", (0.0, 0.0, 1.0, 1.0), (512, 1024), contrast=1.0, radius=400, normal=7.0)

# Tire shop: white painted panels and the chipped blue base band (corner photo).
_, TCA2 = load("tire-shop-corner")
tw = delight(TCA2[1180:1440, 2700:2930], 60)
tw = quilt(tw, (512, 512), patch=96, contrast=1.3)
g_ = lum(tw)[..., None] / max(lum(tw).mean(), 1)
tw = (g_ - 1) * 0.7 * 255 * 0.25 + np.array([226, 226, 220], np.float32)  # neutral off-white paint, sodium cast removed
yy, xx = np.mgrid[0:512, 0:512]
tw[(yy % 256) < 3] *= 0.86  # panel joints every 0.6 m
tw[(xx % 256) < 3] *= 0.88
save("tire_wall.png", tw)
save("tire_wall_normal.png", normal_from_height(blur(np.where(((yy % 256) < 3) | ((xx % 256) < 3), 0.0, 1.0), 1.0), 2.0))
band = TCA2[1455:1525, 1800:2440]
band = np.asarray(to_img(band).resize((1024, 112), Image.BICUBIC)).astype(np.float32)
save("tire_base.png", seamless(band, axes=(1,)))

# ---------------------------------------------------------------- leaf litter v2
# A clean single-leaf cut-out (largest bright blob only), then litter made by
# stamping hundreds of rotated, scaled, tinted copies, like the gutter photos.
_, OK2 = load("oak-leaf")
h, w = OK2.shape[:2]
leaf = OK2[int(0.15 * h):int(0.72 * h), int(0.03 * w):int(0.92 * w)]
m = blur(lum(leaf), 3) > 110
# keep only the biggest connected region (flood fill from the brightest point)
from collections import deque
lab = np.zeros(m.shape, bool)
sy, sx = np.unravel_index(np.argmax(blur(lum(leaf), 25) * m), m.shape)
q = deque([(sy, sx)]); lab[sy, sx] = True
while q:
    y, x = q.popleft()
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        ny, nx = y + dy, x + dx
        if 0 <= ny < m.shape[0] and 0 <= nx < m.shape[1] and m[ny, nx] and not lab[ny, nx]:
            lab[ny, nx] = True; q.append((ny, nx))
alpha = blur(lab.astype(np.float32) * 255, 1.2)
ys, xs = np.where(lab)
leaf, alpha = leaf[ys.min():ys.max(), xs.min():xs.max()], alpha[ys.min():ys.max(), xs.min():xs.max()]
leaf_img = Image.fromarray(np.clip(np.concatenate([leaf, alpha[..., None]], -1), 0, 255).astype(np.uint8), "RGBA").resize((220, 256), Image.LANCZOS)
leaf_img.save(os.path.join(OUT, "oak_leaf.png"))
print("wrote oak_leaf.png (clean)")

_, LVC = load("leaves-curb")
lpx = LVC[int(0.25 * LVC.shape[0]):int(0.45 * LVC.shape[0]), :int(0.5 * LVC.shape[1])].reshape(-1, 3)
lpx = lpx[(lpx[:, 0] > lpx[:, 2] + 40) & (lum(lpx[None])[0] > 70)]
LEAF_TINTS = [np.percentile(lpx, q_, axis=0) for q_ in (15, 35, 55, 75, 90)]
base_l = np.asarray(leaf_img).astype(np.float32)
base_g = lum(base_l[..., :3]) / max(lum(base_l[..., :3])[base_l[..., 3] > 128].mean(), 1)


def stamp_leaves(canvas_rgba, n, size_px, wrap=True, region=None):
    H, W = canvas_rgba.shape[:2]
    for _ in range(n):
        sc = size_px * rng.uniform(0.6, 1.1) / 256
        tint = LEAF_TINTS[rng.integers(0, len(LEAF_TINTS))] * rng.uniform(0.75, 1.15)
        rgb = np.clip(base_g[..., None] * tint, 0, 255)
        im = Image.fromarray(np.concatenate([rgb, base_l[..., 3:]], -1).astype(np.uint8), "RGBA")
        im = im.resize((max(4, int(220 * sc)), max(4, int(256 * sc))), Image.LANCZOS).rotate(rng.uniform(0, 360), expand=True, resample=Image.BICUBIC)
        a = np.asarray(im).astype(np.float32)
        if region is not None:
            y0, x0 = region()
        else:
            y0, x0 = rng.integers(0, H), rng.integers(0, W)
        hh, ww = a.shape[:2]
        yy = (np.arange(hh) + y0 - hh // 2) % H
        xx = (np.arange(ww) + x0 - ww // 2) % W
        sub = canvas_rgba[np.ix_(yy, xx)]
        al = a[..., 3:] / 255
        # slight shadow under each leaf so the pile has depth
        sub[..., :3] = sub[..., :3] * (1 - al * 0.35)
        sub[..., :3] = sub[..., :3] * (1 - al) + a[..., :3] * al
        sub[..., 3:] = np.maximum(sub[..., 3:], a[..., 3:])
        canvas_rgba[np.ix_(yy, xx)] = sub


# full-coverage litter (tiles), 512 px = 0.6 m
lit = np.zeros((512, 512, 4), np.float32)
lit[..., :3] = np.array([70, 52, 36]); lit[..., 3] = 255
stamp_leaves(lit, 520, 120)
save("leaf_litter.png", lit[..., :3])
save("leaf_litter_normal.png", normal_from_height(blur(lum(lit[..., :3]) / 255, 1.0), 3.0))
# curb strip with ragged edge: denser near the curb (top of the texture), 1024 x 256 = 2.4 m x 0.6 m
strip = np.zeros((256, 1024, 4), np.float32)
strip[..., :3] = np.array([70, 52, 36])
def _reg():
    return int(abs(rng.normal(0, 0.28)) * 256) % 256, rng.integers(0, 1024)
stamp_leaves(strip, 900, 100, region=_reg)
Image.fromarray(np.clip(strip, 0, 255).astype(np.uint8), "RGBA").save(os.path.join(OUT, "leaf_strip.png"))
print("wrote leaf_strip.png (v2)")
palette["leaf_tints"] = [hexc(t) for t in LEAF_TINTS]

# ---------------------------------------------------------------- pavers, cracks, lids (ground photos)
# Brick grain: exposed-aggregate texture from the paver close-up, neutralised
# (the photo has a purple streetlight cast), then each brick gets its own tint
# from the herringbone photo's brick colours.
_, PC = load("paver-closeup")
h, w = PC.shape[:2]
grain_src = delight(PC[int(0.3 * h):int(0.95 * h), int(0.05 * w):int(0.95 * w)], 80)
grain = quilt(grain_src[::5, ::5], (512, 512), patch=64, contrast=1.0)  # finer aggregate
grain = lum(grain)[..., None] / max(lum(grain).mean(), 1)
grain = 1 + (grain - 1) * 0.45  # subtler speckle
_, HB = load("pavers-herringbone-cover")
hpx = HB[::6, ::6].reshape(-1, 3)
hpx = hpx[(lum(hpx[None])[0] > np.percentile(lum(hpx[None])[0], 35))]
BRICK_TINTS = [(lambda c: lum(c[None, None])[0, 0] * 0.55 + c * 0.45)(np.percentile(hpx, q_, axis=0)) * 1.08 for q_ in (25, 45, 60, 75, 88)]  # grey-tan, streetlight colour pulled out
JOINT = np.array([58, 54, 50], np.float32)


def brick_field(cells, cell_px, pairs, name, normal=3.0):
    """Paint bricks. `pairs(x, y)` gives the partner cell of (x, y) in its brick."""
    H_ = W_ = cells * cell_px
    out = np.zeros((H_, W_, 3), np.float32) + JOINT
    hgt = np.zeros((H_, W_), np.float32)
    done = set()
    for y in range(cells):
        for x in range(cells):
            if (x, y) in done:
                continue
            px, py = pairs(x, y)
            done.add((x, y)); done.add((px % cells, py % cells))
            x0, x1 = min(x, px), max(x, px) + 1
            y0, y1 = min(y, py), max(y, py) + 1
            tint = BRICK_TINTS[rng.integers(0, len(BRICK_TINTS))] * rng.uniform(0.9, 1.08)
            J = 3
            bw, bh = (x1 - x0) * cell_px - 2 * J, (y1 - y0) * cell_px - 2 * J
            sy, sx = rng.integers(0, 512 - bh), rng.integers(0, 512 - bw)
            b = grain[sy:sy + bh, sx:sx + bw] * tint
            e = np.minimum(np.minimum(np.arange(bw)[None], bw - 1 - np.arange(bw)[None]), np.minimum(np.arange(bh)[:, None], bh - 1 - np.arange(bh)[:, None]))
            b *= (0.8 + 0.2 * np.clip(e / 4, 0, 1))[..., None]
            ys = (np.arange(y0 * cell_px + J, y0 * cell_px + J + bh)) % H_
            xs = (np.arange(x0 * cell_px + J, x0 * cell_px + J + bw)) % W_
            out[np.ix_(ys, xs)] = b
            hgt[np.ix_(ys, xs)] = np.clip(e / 3, 0, 1)
    save(name + ".png", out)
    save(name + "_normal.png", normal_from_height(blur(hgt, 0.8), normal))


# 90-degree herringbone of 1x2 bricks: d = (x - y) mod 4; d 0/1 form a horizontal
# brick, d 2/3 a vertical one. 8x8 cells of 64 px = 0.8 m (brick 100 x 200 mm).
def _herring(x, y):
    d = (x - y) % 4
    return {0: (x + 1, y), 1: (x - 1, y), 2: (x, y - 1), 3: (x, y + 1)}[d]


brick_field(8, 64, _herring, "pavers_herringbone")


# Stretcher band (the straight brick rows between herringbone and concrete):
# running bond, 2 cells wide, offset each row.
def _band(x, y):
    off = y % 2
    return (x + 1, y) if (x + off) % 2 == 0 else (x - 1, y)


brick_field(8, 64, _band, "pavers_band")

# Crack decals: dark crack lines pulled out of the three crack photos as alpha.
for i in (1, 2, 3):
    CRi, _ = load(f"crack{i}")
    CR = np.asarray(CRi.resize((1024, int(1024 * CRi.height / CRi.width)), Image.LANCZOS)).astype(np.float32)
    L_ = lum(CR)
    bg = blur(L_, 30)
    dark = np.clip((bg - L_ - 22) / 30, 0, 1)
    m = Image.fromarray((dark * 255).astype(np.uint8))
    m = m.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(3))   # drop speckle
    dark = np.asarray(m.filter(ImageFilter.GaussianBlur(0.8))).astype(np.float32) / 255
    rgba = np.concatenate([np.zeros_like(CR) + np.array([28, 26, 24], np.float32), dark[..., None] * 230], -1)
    Image.fromarray(np.clip(rgba, 0, 255).astype(np.uint8), "RGBA").save(os.path.join(OUT, f"crack_{i}.png"))
print("wrote crack_1..3.png")

# ---------------------------------------------------------------- sky v2: clouds without the moon
# The real cloud layer from the sky photo (above the rooftops), with the moon
# and its halo taken out so the game can put the moon anywhere. The sky shader
# mirror-tiles this around the dome and adds the halo back around the 3D moon.
_, SKA = load("sky-clouds-moon")
h, w = SKA.shape[:2]
cl = SKA[:int(0.72 * h)]
L_ = lum(cl)
glow = blur(L_, 220)                                  # moon halo + vignetting
flat = L_ / np.maximum(glow, 1) * glow.mean()
moon_mask = blur((L_ > np.percentile(L_, 99.7)).astype(np.float32) * 255, 40) / 255
moon_mask = np.clip(moon_mask * 3, 0, 1)
flat = flat * (1 - moon_mask) + blur(flat, 60) * moon_mask
flat = blur(flat, 2.5)                                # sensor noise off
flat = (flat - flat.mean()) / max(flat.std(), 1)
sky = np.clip(0.5 + flat * 0.24, 0, 1) * 255
sky = np.asarray(to_img(np.repeat(sky[..., None], 3, -1)).resize((1024, 1180), Image.LANCZOS)).astype(np.float32)
save("sky_clouds_pano.png", sky)

# ---------------------------------------------------------------- spruce needle spray (RGBA card)
# A drooping spruce branchlet drawn as a cut-out: a twig with side shoots, each
# densely covered in short needles. Colours sampled from the dark spruce in the
# tree photo (deep blue-green; the photo's purple lights are left out).
from PIL import ImageDraw as _ID
W_, H_ = 512, 256
spr = Image.new("RGBA", (W_, H_), (0, 0, 0, 0))
dd = _ID.Draw(spr)
needle_cols = [(28, 52, 40), (36, 64, 48), (44, 74, 56), (24, 44, 36), (52, 84, 62)]


def shoot(x0, y0, x1, y1, n):
    dd.line([(x0, y0), (x1, y1)], fill=(70, 52, 38, 255), width=3)
    for k in range(n):
        t = k / n
        x, y = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
        for side in (-1, 1):
            ang = np.arctan2(y1 - y0, x1 - x0) + side * rng.uniform(0.7, 1.2)
            L = rng.uniform(9, 15) * (1 - 0.4 * t)
            c = needle_cols[rng.integers(0, len(needle_cols))]
            dd.line([(x, y), (x + np.cos(ang) * L, y + np.sin(ang) * L)], fill=c + (255,), width=2)


shoot(10, 128, 500, 150, 120)                     # main twig (droops a little)
for t in np.linspace(0.12, 0.85, 7):
    bx, by = 10 + 490 * t, 128 + 22 * t
    for side in (-1, 1):
        L = 150 * (1 - t) + 40
        shoot(bx, by, bx + L * 0.75, by + side * L * 0.45 + 20, int(L / 4))
spr.save(os.path.join(OUT, "spruce_spray.png"))
print("wrote spruce_spray.png")

# ---------------------------------------------------------------- rabbit sculpture cut-out (clean)
# Largest bright region of the rabbit photo only (drops street-light specks),
# eye hole kept, painted white with the photo's soft shading.
from collections import deque as _dq
# the earlier crop clipped the ears, so cut from the full photo again
_RB_im, _RB = load("rabbit-sculpture")
_h, _w = _RB.shape[:2]
_crop = _RB[int(0.08 * _h):int(0.66 * _h), int(0.25 * _w):int(0.66 * _w)]
_a = np.clip((blur(lum(_crop), 1.5) - 95) / 25, 0, 1)  # ear tips are greyer than the body
_r = np.concatenate([_crop, _a[..., None] * 255], -1)

_m = _r[..., 3] > 128
_lab = np.zeros(_m.shape, bool)
_sy, _sx = np.unravel_index(np.argmax(blur(_m.astype(np.float32) * 255, 30)), _m.shape)
_q = _dq([(_sy, _sx)]); _lab[_sy, _sx] = True
while _q:
    y, x = _q.popleft()
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        ny, nx = y + dy, x + dx
        if 0 <= ny < _m.shape[0] and 0 <= nx < _m.shape[1] and _m[ny, nx] and not _lab[ny, nx]:
            _lab[ny, nx] = True; _q.append((ny, nx))
# trim lit ground at the feet: below 60% height keep only the body's column span
_ys, _xs = np.where(_lab)
_y60 = int(_ys.min() + 0.6 * (_ys.max() - _ys.min()))
_row = np.where(_lab[_y60])[0]
_lab[_y60:, :max(0, _row.min() - 15)] = False
_lab[_y60:, _row.max() + 15:] = False
ys, xs = np.where(_lab)
_lab = _lab[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
shade = lum(_r[ys.min():ys.max() + 1, xs.min():xs.max() + 1, :3])
shade = 0.85 + 0.15 * shade / max(shade[_lab].mean(), 1)
rgb = np.clip(shade[..., None] * np.array([238, 236, 228], np.float32), 0, 255)
a = blur(_lab.astype(np.float32) * 255, 0.8)
Image.fromarray(np.concatenate([rgb, a[..., None]], -1).astype(np.uint8), "RGBA").save(os.path.join(OUT, "rabbit_cut.png"))
print("wrote rabbit_cut.png", _lab.shape)

# ---------------------------------------------------------------- paintings as whole canvases
for src, out, size in [("graffiti-painting", "canvas_graffiti", (576, 1024)), ("painted-wall-impasto", "canvas_impasto", (576, 1024)),
                       ("grime/art-black-white-drip", "canvas_drip", (576, 1024)), ("grime/art-blurred-sunset", "canvas_sunset", (1024, 576)),
                       ("grime/art-mustard-black-splatter", "canvas_splatter", (576, 1024))]:
    im = ImageOps.exif_transpose(Image.open(f"photos/{src}.jpg")).convert("RGB").resize(size, Image.LANCZOS)
    a = np.asarray(im).astype(np.float32)
    a = delight(a, 260) * 0.5 + a * 0.5      # soften the room lighting, keep the paint
    save(out + ".png", a)

# Alien glow masks: the deepest crevices (much darker than their surroundings) glow.
for i in range(1, 6):
    a = np.asarray(Image.open(os.path.join(OUT, f"alien_{i}.png")).convert("RGB")).astype(np.float32)
    L_ = lum(a)
    crev = np.clip((blur(L_, 12) - L_ - 18) / 40, 0, 1)
    crev = blur(crev * 255, 1.2) / 255
    glow = crev[..., None] * np.array([90, 255, 220], np.float32)
    save(f"alien_{i}_glow.png", glow)

# ---------------------------------------------------------------- soup / curry (soup photos)
# Two seamless surfaces: chunky lentil (close-up) and smooth puree; plus a
# stained pot-rim texture from the edge of the pot photo.
for name, out, box_, tint in [("soup-lentil-closeup", "soup_lentil", (0.1, 0.1, 0.9, 0.9), (196, 92, 42)),
                              ("soup-smooth", "soup_smooth", (0.1, 0.25, 0.9, 0.9), (204, 104, 46))]:
    SPi, _ = load(name)
    w0, h0 = SPi.size
    crop = SPi.crop((int(box_[0] * w0), int(box_[1] * h0), int(box_[2] * w0), int(box_[3] * h0))).resize((768, 768), Image.LANCZOS)
    src = np.asarray(crop).astype(np.float32)
    src = delight(src, 160)
    out_img = seamless(src[128:640, 128:640])          # one real patch, edges crossfaded (no quilt blocks)
    out_img = match_stats(out_img, np.array(tint, np.float32), 1.1)   # back to the photo's red-orange
    save(out + ".png", out_img)
    save(out + "_normal.png", normal_from_height(blur(lum(out_img) / 255.0, 1.5), 3.0))
_, SPT = load("soup-pot")
h, w = SPT.shape[:2]
rim = SPT[int(0.0 * h):int(0.12 * h), int(0.3 * w):int(0.95 * w)]
rim = np.asarray(to_img(delight(rim, 120)).resize((1024, 128), Image.BICUBIC)).astype(np.float32)
save("pot_rim_stain.png", seamless(rim, axes=(1,)))

# ---------------------------------------------------------------- food tops (food photos)
# Round dishes: crop the food ellipse and stretch it to a square disc texture
# (alpha outside the circle). Long foods: plain crops.
def food_disc(name, box_, out, size=512, feather=6):
    im = ImageOps.exif_transpose(Image.open(f"photos/food/{name}.jpg")).convert("RGB").crop(box_).resize((size, size), Image.LANCZOS)
    a = np.asarray(im).astype(np.float32)
    yy, xx = np.mgrid[0:size, 0:size]
    d = np.hypot(xx - size / 2, yy - size / 2) / (size / 2)
    alpha = np.clip((1 - d) * size / (2 * feather), 0, 1) * 255
    Image.fromarray(np.concatenate([a, alpha[..., None]], -1).astype(np.uint8), "RGBA").save(os.path.join(OUT, out + ".png"))
    print("wrote", out)


def food_crop(name, box_, out, size):
    ImageOps.exif_transpose(Image.open(f"photos/food/{name}.jpg")).convert("RGB").crop(box_).resize(size, Image.LANCZOS).save(os.path.join(OUT, out + ".png"))
    print("wrote", out)


food_disc("pizza-mushroom-egg", (110, 150, 2880, 2920), "food_pizza_mushroom")
food_disc("pizza-corn-shrimp", (60, 1420, 2200, 3640), "food_pizza_corn")
food_disc("ramen-tray", (307, 472, 1597, 1370), "food_ramen_top")
food_disc("black-curry-rice", (170, 1180, 2250, 3260), "food_curry_rice")
food_disc("spaghetti-tray", (571, 1028, 2485, 2028), "food_spaghetti")
food_crop("corndog", (830, 820, 1250, 3260), "food_corndog", (128, 512))
food_crop("corndog", (310, 2350, 840, 3250), "food_dip_sauce", (256, 256))
food_crop("pork-bun-bitten", (700, 1100, 2200, 2250), "food_porkbun_bite", (512, 384))
food_crop("pork-bun-bitten", (1500, 1100, 2150, 1500), "food_bun_crust", (256, 160))
food_crop("katsu-curry-desk", (1650, 1220, 2600, 1650), "food_katsu", (512, 232))

# Food v2: tileable crumb coating (corn-dog crust) and flaky pastry (bun crust),
# quilted from the evenly lit middle of each photo so they wrap without streaks.
CDi, _ = load("food/corndog")
crumb = np.asarray(CDi.crop((900, 1300, 1200, 1600)).resize((256, 256), Image.LANCZOS)).astype(np.float32)
crumb = seamless(delight(crumb, 50))
crumb = match_stats(crumb, np.array([214, 160, 82], np.float32), 1.2)
save("food_crumb.png", crumb)
save("food_crumb_normal.png", normal_from_height(blur(lum(crumb) / 255.0, 0.6), 6.0))
PBi, _ = load("food/pork-bun-bitten")
pastry = np.asarray(PBi.crop((1780, 1250, 2020, 1490)).resize((256, 256), Image.LANCZOS)).astype(np.float32)
pastry = seamless(delight(pastry, 50))
pastry = match_stats(pastry, np.array([204, 128, 60], np.float32), 1.1)
save("food_pastry.png", pastry)
save("food_pastry_normal.png", normal_from_height(blur(lum(pastry) / 255.0, 0.8), 4.0))
food_crop("pork-bun-bitten", (1090, 1180, 1880, 1830), "food_porkbun_filling", (384, 320))

# cup noodles top (food/cup-noodles): no brand in frame, use the photo directly
food_disc("cup-noodles", (128, 25, 618, 515), "food_cupnoodle_top", size=384)

# ---------------------------------------------------------------- sculpted clay surface (creepy figurine)
# Multi-scale lumps + small thumb-press dents + fine scratches, wrapping; used
# as a normal map so every part of the figure reads as hand-sculpted clay.
H_ = 512
yy, xx = np.mgrid[0:H_, 0:H_]
clay = np.zeros((H_, H_), np.float32)
for sigma, amp in ((24, 1.0), (9, 0.6), (3, 0.35), (1.2, 0.2)):
    n = rng.random((H_, H_)).astype(np.float32)
    n = np.tile(n, (3, 3))
    n = blur(n * 255, sigma)[H_:2 * H_, H_:2 * H_] / 255
    clay += (n - n.mean()) / max(n.std(), 1e-6) * amp
for _ in range(260):   # thumb / tool presses
    cy, cx = rng.integers(0, H_, 2)
    r = rng.uniform(6, 18)
    d = np.hypot(((yy - cy + H_ // 2) % H_) - H_ // 2, ((xx - cx + H_ // 2) % H_) - H_ // 2)
    clay -= np.exp(-(d / r) ** 2) * rng.uniform(0.4, 1.0)
save("clay_normal.png", normal_from_height(clay / 10.0, 6.0))
save("clay_rough.png", np.repeat(np.clip(0.75 + clay[..., None] * 0.04, 0, 1) * 255, 3, -1))

# ---------------------------------------------------------------- grocery detail (store photos)
def _store(k):
    return ImageOps.exif_transpose(Image.open(f"photos/store/{k}.jpg")).convert("RGB")
_cr, _ca, _eg = _store("dairy-cooler-crates"), _store("dairy-cooler-carts"), _store("egg-butter-cases")
def _crop(im, box_, size, ref=1400):
    k = im.size[0] / ref
    return im.crop(tuple(int(v * k) for v in box_)).resize(size, Image.LANCZOS)
_crop(_cr, (182, 187, 298, 262), (256, 168)).save(os.path.join(OUT, "store_crate_blue.png"))
_crop(_cr, (192, 274, 298, 343), (256, 168)).save(os.path.join(OUT, "store_crate_black.png"))
_crop(_ca, (868, 332, 925, 364), (256, 144)).save(os.path.join(OUT, "store_cardboard.png"))
_crop(_eg, (0, 0, 1400, 80), (2048, 116)).save(os.path.join(OUT, "store_swirl.png"))
_crop(_eg, (497, 446, 640, 524), (512, 280)).save(os.path.join(OUT, "store_eggs.png"))   # front-on stack of egg flats
_crop(_cr, (880, 470, 1200, 560), (512, 144)).save(os.path.join(OUT, "store_curb.png"))
# walk-in wall panel (white insulated) - flat-lit, tiled, with panel seams
wp = np.asarray(_crop(_ca, (430, 240, 570, 375), (256, 256))).astype(np.float32)
wp = delight(wp, 60)
wp = seamless(wp)
wp[:, :3] *= 0.8
save("store_panel.png", wp)
# walk-in floor (worn concrete with scuffs)
fl = delight(np.asarray(_crop(_cr, (700, 470, 1100, 620), (800, 300))).astype(np.float32), 80)
fq = quilt(fl, (512, 512), patch=96, contrast=1.0)
g_ = fq[..., :3].mean(-1, keepdims=True)                       # sealed concrete: mostly gray, soft scuffs
fq[..., :3] = (g_ + (fq[..., :3] - g_) * 0.25 - 128) * 0.55 + 140
save("store_floor.png", fq)
cb = np.asarray(Image.open(os.path.join(OUT, "store_cardboard.png")).convert("RGB")).astype(np.float32)
Image.fromarray(np.clip(cb * 1.35 + 10, 0, 255).astype(np.uint8)).save(os.path.join(OUT, "store_cardboard.png"))

# ---------------------------------------------------------------- warehouse stockroom (pallet photos)
def _pal(i):
    return ImageOps.exif_transpose(Image.open(f"photos/pallets/pallet{i}.jpg")).convert("RGB")
_P2, _P3 = _pal(2), _pal(3)
def _pc(im, b, size):
    k = im.size[0] / 700
    return im.crop(tuple(int(v * k) for v in b)).resize(size, Image.LANCZOS)
# plywood sheathing wall (knots, warm orange), flat-lit + tileable
pw = delight(np.asarray(_pc(_P2, (170, 20, 560, 225), (640, 336))).astype(np.float32), 90)
save("wh_ply.png", seamless(pw))
# sealed warehouse concrete
wf = delight(np.asarray(_pc(_P3, (150, 700, 650, 860), (800, 256))).astype(np.float32), 80)
save("wh_floor.png", quilt(wf, (512, 512), patch=96, contrast=1.05))
# shrink-wrapped water case side + soda can tray top
_pc(_P3, (345, 255, 460, 352), (512, 432)).save(os.path.join(OUT, "wh_water.png"))
_pc(_P3, (342, 492, 482, 578), (512, 314)).save(os.path.join(OUT, "wh_cans.png"))

# ---------------------------------------------------------------- roadside shrines
_SA = ImageOps.exif_transpose(Image.open("photos/shrines/shrine-statues.jpg")).convert("RGB")
_SB = ImageOps.exif_transpose(Image.open("photos/shrines/shrine-stone.jpg")).convert("RGB")
def _sc(im, b, size):
    k = im.size[0] / 600
    return im.crop(tuple(int(v * k) for v in b)).resize(size, Image.LANCZOS)
# peeling red paint on wood (picket boards of the stone shrine), vertical grain
rw = delight(np.asarray(_sc(_SB, (198, 448, 214, 545), (128, 512))).astype(np.float32), 60)
save("shr_redwood.png", seamless(rw))
# weathered roof planks (statue shrine)
rp = delight(np.asarray(_sc(_SA, (110, 290, 460, 340), (1024, 160))).astype(np.float32), 50)
save("shr_roof.png", seamless(rp))
# speckled granite of the standing stone
gs = delight(np.asarray(_sc(_SB, (282, 415, 300, 520), (192, 512))).astype(np.float32), 50)
save("shr_stone.png", seamless(gs))
# mossy concrete platform
cp = delight(np.asarray(_sc(_SA, (150, 590, 430, 632), (1024, 160))).astype(np.float32), 60)
save("shr_concrete.png", seamless(cp))
# flowered bib, carved relief tablet
_sc(_SA, (284, 402, 306, 446), (128, 256)).save(os.path.join(OUT, "shr_bib.png"))
_sc(_SA, (544, 474, 588, 532), (192, 256)).save(os.path.join(OUT, "shr_tablet.png"))

# ---------------------------------------------------------------- apartment living room (interior photos)
_I1, _I2, _I3 = [ImageOps.exif_transpose(Image.open(f"photos/interior/{n}.jpg")).convert("RGB") for n in ("bookshelf-closeup1", "bookshelf-closeup2", "bookshelf-room")]
def _ic(im, b, size):
    k = im.size[0] / 500
    return im.crop(tuple(int(v * k) for v in b)).resize(size, Image.LANCZOS)
lw = delight(np.asarray(_ic(_I1, (345, 160, 470, 440), (256, 512))).astype(np.float32), 120)
save("liv_wall.png", seamless(lw))
ls_ = delight(np.asarray(_ic(_I3, (385, 75, 492, 235), (384, 512))).astype(np.float32), 120)
save("liv_shade.png", seamless(ls_))
lf = delight(np.asarray(_ic(_I3, (195, 612, 298, 662), (512, 256))).astype(np.float32), 80)
save("liv_floor.png", seamless(lf))
lt_ = delight(np.asarray(_ic(_I3, (45, 595, 165, 660), (512, 256))).astype(np.float32), 80)
save("liv_wood.png", seamless(lt_))
_ic(_I3, (4, 211, 88, 286), (512, 456)).save(os.path.join(OUT, "liv_painting.png"))
_ic(_I3, (28, 432, 100, 530), (256, 352)).save(os.path.join(OUT, "liv_lamp.png"))
_ic(_I3, (171, 533, 214, 634), (160, 352)).save(os.path.join(OUT, "liv_vase.png"))
_ic(_I2, (52, 586, 222, 628), (512, 128)).save(os.path.join(OUT, "liv_floralbox.png"))

# ---------------------------------------------------------------- house fronts (misc door photos)
def _mc(n, b, size):
    im = ImageOps.exif_transpose(Image.open(f"photos/misc/{n}.jpg")).convert("RGB")
    k = max(im.size) / 400
    return np.asarray(im.crop(tuple(int(v * k) for v in b)).resize(size, Image.LANCZOS)).astype(np.float32)
for name, f, b, size, r in [
    ("hs_brick", "door-brick-brown", (5, 40, 80, 320), (256, 1024), 90),
    ("hs_ybrick", "door-red-yellow-brick", (2, 170, 38, 300), (128, 448), 60),
    ("hs_tbrick", "door-white-tan-brick", (5, 215, 80, 318), (384, 512), 80),
    ("hs_stone", "door-black-stone-veneer", (122, 10, 215, 200), (384, 768), 90),
    ("hs_siding", "door-white-gray-siding", (3, 110, 70, 228), (256, 448), 90),
    ("hs_grass", "cats-blue-house-vent", (10, 232, 215, 390), (768, 576), 120),
    ("hs_deck", "door-brick-brown", (5, 346, 160, 398), (768, 256), 80),
]:
    save(name + ".png", seamless(delight(_mc(f, b, size), r)))

# ---------------------------------------------------------------- boarded blue house + cats (misc photos)
def _mt(n, b, size, thumb):
    im = ImageOps.exif_transpose(Image.open(f"photos/misc/{n}.jpg")).convert("RGB")
    k = im.size[0] / thumb
    return np.asarray(im.crop(tuple(int(v * k) for v in b)).resize(size, Image.LANCZOS)).astype(np.float32)
# the boards slope ~8 degrees in the photo: level them first, then crop a band clear of the edges
_bh = ImageOps.exif_transpose(Image.open("photos/misc/cats-blue-house-vent.jpg")).convert("RGB")
_bk = _bh.size[0] / 507
_bh = _bh.crop((0, 0, _bh.size[0], int(120 * _bk))).rotate(8.0, resample=Image.BICUBIC, expand=False)
_bs = np.asarray(_bh.crop((int(60 * _bk), int(28 * _bk), int(470 * _bk), int(92 * _bk))).resize((1024, 160), Image.LANCZOS)).astype(np.float32)
save("ab_bluesiding.png", seamless(delight(_bs, 80)))
save("ab_stucco.png", seamless(delight(_mt("cats-blue-house-vent", (345, 200, 505, 370), (384, 384), 507), 80)))
save("ab_osb.png", seamless(delight(_mt("kittens-boarded-wall", (0, 0, 800, 200), (1024, 256), 900), 120)))
Image.fromarray(_mt("kittens-boarded-wall", (300, 215, 810, 650), (768, 656), 900).astype(np.uint8)).save(os.path.join(OUT, "ab_panel.png"))
Image.fromarray(_mt("kittens-boarded-wall", (0, 632, 900, 795), (1024, 186), 900).astype(np.uint8)).save(os.path.join(OUT, "ab_navybase.png"))

# ---------------------------------------------------------------- misc small textures (27e)
def _m8(n, b, size, thumb):
    im = ImageOps.exif_transpose(Image.open(f"photos/misc/{n}.jpg")).convert("RGB")
    k = im.size[0] / thumb
    return im.crop(tuple(int(v * k) for v in b)).resize(size, Image.LANCZOS)
# plywood sheet with its ink stamp (text is already generic)
save("pw_stamp.png", delight(np.asarray(_m8("plywood-stamp", (120, 40, 680, 420), (1024, 696), 800)).astype(np.float32), 220))
# chip-seal asphalt, sampled clear of the spider
cs = delight(np.asarray(_m8("asphalt-spider", (190, 340, 450, 640), (416, 480), 450)).astype(np.float32), 80)
save("as_chipseal.png", quilt(cs, (512, 512), patch=96, contrast=1.05))
# teal concrete wall + the skeleton paste-up (artwork only; the handwritten notes are redrawn)
save("wp_teal.png", seamless(delight(np.asarray(_m8("wheatpaste-street-art", (20, 560, 430, 790), (768, 432), 450)).astype(np.float32), 120)))
_m8("wheatpaste-street-art", (176, 178, 304, 452), (256, 548), 450).save(os.path.join(OUT, "wp_skeleton.png"))

# ---------------------------------------------------------------- city plaza (city photos, 28a)
def _cl(n):
    im = Image.open(f"photos/city/{n}.jpg")
    try:
        o = im.getexif().get(274, 1)
    except Exception:
        o = 1
    im = im.convert("RGB")
    return {3: im.rotate(180, expand=True), 6: im.rotate(270, expand=True), 8: im.rotate(90, expand=True)}.get(o, im)
def _cc(im, b, size, thumb):
    k = im.size[0] / thumb
    return np.asarray(im.crop(tuple(int(v * k) for v in b)).resize(size, Image.LANCZOS)).astype(np.float32)
_wh = _cl("brick-warehouse-sculptures")
def _level(im, box_, thumb):
    """Crop a patch and rotate it so its brick courses run level (max row-variance search)."""
    k = im.size[0] / thumb
    x0, y0, x1, y1 = (int(v * k) for v in box_)
    pad = int(max(x1 - x0, y1 - y0) * 0.25)
    big = im.crop((x0 - pad, y0 - pad, x1 + pad, y1 + pad))
    best, ba = -1, 0.0
    for a10 in range(-120, 121, 5):
        a = a10 / 10
        r = np.asarray(big.rotate(a, resample=Image.BILINEAR).convert("L")).astype(np.float32)[pad:-pad, pad:-pad]
        v = r.mean(1).var()
        if v > best:
            best, ba = v, a
    print("  level", ba)
    return big.rotate(ba, resample=Image.BICUBIC).crop((pad, pad, pad + x1 - x0, pad + y1 - y0))
save("cy_brick.png", seamless(delight(np.asarray(_level(_wh, (600, 430, 880, 590), 900).resize((512, 292), Image.LANCZOS)).astype(np.float32), 80)))
save("cy_brickband.png", seamless(delight(np.asarray(_level(_wh, (320, 650, 600, 750), 900).resize((640, 228), Image.LANCZOS)).astype(np.float32), 80)))

# ---------------------------------------------------------------- old-town street (city photos, 28b)
_od = _cl("old-town-street-day")
_ok = _od.size[0] / 563
_os = np.asarray(_od.crop(tuple(int(v * _ok) for v in (30, 900, 330, 1000))).resize((900, 300), Image.LANCZOS)).astype(np.float32)
ot = quilt(delight(_os, 60), (512, 512), patch=80, contrast=1.0)
# granite slab joints: 4 rows x 2 columns of 0.6 x 0.3 m slabs per 1.2 m repeat, staggered
for r in range(4):
    y = r * 128
    ot[y:y + 3, :] *= 0.55
    off = 0 if r % 2 == 0 else 128
    for x in (off, off + 256):
        ot[y:y + 128, x % 512:(x % 512) + 3] *= 0.55
save("ot_stone.png", ot)

# ---------------------------------------------------------------- graffiti shutters (city photos, 28d)
_gs = _cl("graffiti-shutters-pallets")
_gk = _gs.size[0] / 507
def _gc(b, size):
    return _gs.crop(tuple(int(v * _gk) for v in b)).resize(size, Image.LANCZOS)
_gc((133, 345, 247, 636), (384, 980)).save(os.path.join(OUT, "gf_shutter_a.png"))
_gc((270, 345, 410, 472), (448, 406)).save(os.path.join(OUT, "gf_shutter_b.png"))
save("gf_concrete.png", seamless(delight(np.asarray(_gc((62, 425, 118, 640), (192, 740))).astype(np.float32), 60)))

# ---------------------------------------------------------------- station ivy wall, fake rock, reeds (city photos, 28e)
_st = _cl("station-green-wall-arch"); _sk = _st.size[0] / 900
def _stc(b, size): return _st.crop(tuple(int(v * _sk) for v in b)).resize(size, Image.LANCZOS)
save("st_ivy.png", seamless(delight(np.asarray(_stc((95, 200, 210, 360), (384, 512))).astype(np.float32), 50)))
_fr = _cl("fake-rock-bar-door"); _fk = _fr.size[0] / 900
def _frc(b, size): return _fr.crop(tuple(int(v * _fk) for v in b)).resize(size, Image.LANCZOS)
save("fr_rock.png", seamless(delight(np.asarray(_frc((255, 30, 420, 200), (512, 528))).astype(np.float32), 50)))
_frc((250, 25, 630, 900), (512, 1180)).save(os.path.join(OUT, "fr_front.png"))
_pd = _cl("pond-lotus-night-skyline"); _pk = _pd.size[0] / 900
_rd = np.asarray(_pd.crop(tuple(int(v * _pk) for v in (0, 470, 900, 562))).resize((1024, 104), Image.LANCZOS)).astype(np.float32)
# alpha: reeds are brighter + warmer than the dark sky/trees above them
lumr = _rd[..., :3].mean(-1); warm = _rd[..., 0] - _rd[..., 2]
yy = np.linspace(0, 1, _rd.shape[0])[:, None]
alpha = np.clip((lumr - 70) / 40, 0, 1) * np.clip((warm + 5) / 20, 0, 1)
alpha = np.maximum(alpha, (yy > 0.35).astype(np.float32))
Image.fromarray(np.dstack([np.clip(_rd[..., :3], 0, 255), alpha * 255]).astype(np.uint8), "RGBA").save(os.path.join(OUT, "pd_reeds.png"))

# ---------------------------------------------------------------- rock bar facade: colour + relief (fake-rock photo)
# work in the 900-px thumbnail frame of the photo; facade x 250..630, y 20..845
def _fr_build():
    from PIL import ImageFilter as _IF
    full = _cl("fake-rock-bar-door"); k = full.size[0] / 900
    S = 2.0                                                # output px per thumbnail px
    fx0, fy0, fx1, fy1 = 250, 20, 630, 845
    face = full.crop(tuple(int(v * k) for v in (fx0, fy0, fx1, fy1))).resize((int((fx1 - fx0) * S), int((fy1 - fy0) * S)), Image.LANCZOS)
    A = np.asarray(face).astype(np.float32)
    def box_(x0, y0, x1, y1): return int((x0 - fx0) * S), int((y0 - fy0) * S), int((x1 - fx0) * S), int((y1 - fy0) * S)
    def patch(dst, src):                                  # copy src box over dst box with feathered edges
        a = box_(*dst); b = box_(*src)
        h, w = a[3] - a[1], a[2] - a[0]
        P = A[b[1]:b[1] + h, b[0]:b[0] + w].copy()
        yy, xx = np.mgrid[0:h, 0:w]
        f = np.minimum(np.minimum(xx, w - 1 - xx), np.minimum(yy, h - 1 - yy)).astype(np.float32)
        wgt = np.clip(f / 10, 0, 1)[..., None]
        A[a[1]:a[3], a[0]:a[2]] = A[a[1]:a[3], a[0]:a[2]] * (1 - wgt) + P * wgt
    patch((385, 170, 500, 250), (270, 170, 385, 250))      # the real house number
    patch((365, 400, 505, 495), (365, 545, 505, 640))      # paper notices on the shutter -> plain slats
    patch((555, 430, 605, 545), (555, 590, 605, 705))      # carved name down the right jamb
    col = np.clip(A, 0, 255).astype(np.uint8)
    # relief: high-passed luminance (lit stone faces protrude), plus a gentle overall bulge
    lum = A.mean(-1)
    L = Image.fromarray(np.clip(lum, 0, 255).astype(np.uint8))
    fine = np.asarray(L.filter(_IF.GaussianBlur(5))).astype(np.float32)
    broad = np.asarray(L.filter(_IF.GaussianBlur(40))).astype(np.float32)
    hgt = np.clip((fine - broad) / 90 + 0.5, 0, 1)
    hgt = np.asarray(Image.fromarray((hgt * 255).astype(np.uint8)).filter(_IF.GaussianBlur(3))).astype(np.float32) / 255
    # shutter mask: arch-topped rectangle (thumbnail coords: x 316..548, sides to y 380, crown at 326)
    H_, W_ = lum.shape
    yy, xx = np.mgrid[0:H_, 0:W_]
    tx = xx / S + fx0; ty = yy / S + fy0
    cx, crown, spring = 432, 326, 395
    rx = 116.0
    inside = (tx > 316) & (tx < 548) & (ty < 798) & ((ty > spring) | (((tx - cx) / rx) ** 2 + ((ty - spring) / (spring - crown)) ** 2 < 1))
    # background (wall above the irregular top): bright + grey
    sat = A.max(-1) - A.min(-1)
    bg = (lum > 175) & (sat < 30) & (ty < 75)
    bg = bg | (tx < 259) | ((tx > 612) & (ty > 470))      # neighbour sign / grille at the edges
    out_h = np.where(inside, 0.0, 0.15 + hgt * 0.85)
    rgba = np.dstack([col, (np.where(bg, 0, 255)).astype(np.uint8)])
    Image.fromarray(rgba, "RGBA").save(os.path.join(OUT, "fr_face.png"))
    m = np.where(inside, 0, 255).astype(np.uint8)
    Image.fromarray(np.dstack([(out_h * 255).astype(np.uint8), m, np.where(bg, 0, 255).astype(np.uint8)]), "RGB").save(os.path.join(OUT, "fr_height.png"))
    # round step stone texture
    full.crop(tuple(int(v * k) for v in (345, 805, 515, 885))).resize((512, 240), Image.LANCZOS).save(os.path.join(OUT, "fr_step.png"))
    print("wrote fr_face / fr_height", face.size)
_fr_build()

with open(os.path.join(OUT, "palette.json"), "w") as f:
    json.dump(palette, f, indent=2)
print("wrote palette.json")
