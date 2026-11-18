"""PS2-style hand-painted textures for the creepy hoodie figure.

Usage:  python3 tools/make_creep_textures.py

Low-ish resolution, painted detail with baked shading (folds, seams, stitching,
ribbing, wear) the way PS2-era character textures were made. All original.
"""
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

OUT = "assets/textures"
rng = np.random.default_rng(13)


def noise(h, w, sigma, amp=1.0):
    n = rng.random((h, w)).astype(np.float32)
    n = np.asarray(Image.fromarray((n * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(sigma))).astype(np.float32) / 255
    return (n - n.mean()) / max(n.std(), 1e-6) * amp


# Real fabric grain from the dark knit photo (photos/fabric/dark-knit-jersey.jpg):
# a clean patch, lighting flattened, made seamless, used as the knit everywhere.
_fl = Image.open("photos/fabric/dark-knit-jersey.jpg").convert("L")   # sweatshirt knit (was fleece)
_fl = np.asarray(_fl.crop((300, 200, 1100, 1000)).resize((512, 512), Image.LANCZOS)).astype(np.float32)
_low = np.asarray(Image.fromarray(_fl.astype(np.uint8)).filter(ImageFilter.GaussianBlur(40))).astype(np.float32)
_fl = _fl - _low
_fl = (_fl - _fl.mean()) / max(_fl.std(), 1e-6)
_r = np.roll(np.roll(_fl, 256, 0), 256, 1)
_w = np.outer(np.sin(np.linspace(0, np.pi, 512)), np.sin(np.linspace(0, np.pi, 512)))
FLEECE = _fl * _w + _r * (1 - _w)


_dn = Image.open("photos/fabric/dark-denim-cargo-pocket.jpg").convert("L")
_dn = np.asarray(_dn.crop((300, 150, 700, 550)).resize((256, 256), Image.LANCZOS)).astype(np.float32)
_dn = _dn - np.asarray(Image.fromarray(_dn.astype(np.uint8)).filter(ImageFilter.GaussianBlur(20))).astype(np.float32)
_dn = (_dn - _dn.mean()) / max(_dn.std(), 1e-6)
_r2 = np.roll(np.roll(_dn, 128, 0), 128, 1)
_w2 = np.outer(np.sin(np.linspace(0, np.pi, 256)), np.sin(np.linspace(0, np.pi, 256)))
DENIM = _dn * _w2 + _r2 * (1 - _w2)


def fleece(h, w, amp):
    t = np.tile(FLEECE, (h // 512 + 1, w // 512 + 1))[:h, :w]
    return t * amp


def save(img, name):
    img.save(os.path.join(OUT, name))
    print("wrote", name)


def shade(a, m):
    """multiply an RGB float array by a 2D shading map"""
    return np.clip(a * m[..., None], 0, 255)


# ---------------------------------------------------------------- hoodie body (wraps the torso; front = middle)
W, H = 512, 512
base = np.array([62, 62, 70], np.float32)
a = np.ones((H, W, 3), np.float32) * base
a += fleece(H, W, 9)[..., None]                                         # fleece grain (photo)
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
u = xx / W
fold = 1 + 0.10 * np.sin(u * np.pi * 14 + yy / 40) + 0.06 * noise(H, W, 10)   # vertical-ish folds
ao = 1 - 0.35 * np.clip((yy / H - 0.6) / 0.4, 0, 1) ** 2                # darker toward the hem
ao *= 1 - 0.25 * np.exp(-((u - 0.25) / 0.05) ** 2) - 0.25 * np.exp(-((u - 0.75) / 0.05) ** 2)   # under arms / sides
a = shade(a, fold * ao)
img = Image.fromarray(a.astype(np.uint8))
d = ImageDraw.Draw(img)
# side seams + shoulder seam line
for x in (W * 0.25, W * 0.75):
    d.line([(x, 0), (x, H)], fill=(38, 38, 44), width=3)
    for y in range(0, H, 10):
        d.line([(x + 4, y), (x + 4, y + 5)], fill=(88, 88, 96), width=1)
# kangaroo pocket on the front (centre), stitched
px0, px1, py0, py1 = W * 0.36, W * 0.64, H * 0.58, H * 0.86
d.polygon([(px0 + 20, py0), (px1 - 20, py0), (px1, py1), (px0, py1)], fill=(54, 54, 61), outline=(32, 32, 37))
for t in np.linspace(0, 1, 40):
    for (xa, ya, xb, yb) in ((px0 + 24, py0 + 4, px0 + 4, py1 - 4), (px1 - 24, py0 + 4, px1 - 4, py1 - 4)):
        x = xa + (xb - xa) * t; y = ya + (yb - ya) * t
        d.line([(x, y), (x, y + 3)], fill=(92, 92, 100), width=1)
d.line([(px0 + 20, py0 + 2), (px1 - 20, py0 + 2)], fill=(30, 30, 35), width=4)   # pocket opening shadow
# ribbed waistband
for x in range(0, W, 5):
    d.line([(x, H * 0.9), (x, H)], fill=(44, 44, 50) if x % 10 else (70, 70, 78), width=2)
d.line([(0, H * 0.9), (W, H * 0.9)], fill=(30, 30, 35), width=3)
# drawstring eyelets at the neck
for x in (W * 0.47, W * 0.53):
    d.ellipse((x - 4, 8, x + 4, 16), fill=(150, 150, 155), outline=(40, 40, 44))
save(img, "creep_hoodie.png")

# ---------------------------------------------------------------- sleeves (wrap around an arm; cuff at the bottom)
W, H = 256, 512
a = np.ones((H, W, 3), np.float32) * base + fleece(H, W, 9)[..., None]
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
creases = 1 - 0.18 * np.clip(np.sin(yy / 18 + np.sin(xx / 30) * 2), 0, 1) ** 4       # bunched horizontal creases
a = shade(a, creases * (1 + 0.05 * noise(H, W, 8)))
img = Image.fromarray(a.astype(np.uint8))
d = ImageDraw.Draw(img)
for x in range(0, W, 5):
    d.line([(x, H * 0.88), (x, H)], fill=(44, 44, 50) if x % 10 else (70, 70, 78), width=2)
d.line([(W * 0.5, 0), (W * 0.5, H * 0.88)], fill=(40, 40, 46), width=2)               # underarm seam
save(img, "creep_sleeve.png")

# ---------------------------------------------------------------- hood (wrapped by the sphere UVs)
W, H = 512, 256
a = np.ones((H, W, 3), np.float32) * base + fleece(H, W, 9)[..., None]
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
a = shade(a, (1 + 0.12 * np.sin(xx / 22 + noise(H, W, 12) * 2)) * (0.75 + 0.25 * yy / H))
img = Image.fromarray(a.astype(np.uint8))
d = ImageDraw.Draw(img)
d.line([(W * 0.5, 0), (W * 0.5, H)], fill=(36, 36, 42), width=3)                      # centre seam
save(img, "creep_hood.png")

# frayed thread fringe (RGBA) for the hood edge
W, H = 256, 64
fr = Image.new("RGBA", (W, H), (0, 0, 0, 0))
d = ImageDraw.Draw(fr)
for i in range(140):
    x = rng.uniform(0, W)
    L = rng.uniform(8, H - 2)
    c = int(rng.uniform(40, 80))
    pts = [(x, 0)]
    for k in range(1, 6):
        pts.append((x + rng.normal(0, 2) * k * 0.6, L * k / 5))
    d.line(pts, fill=(c, c, c + 6, int(rng.uniform(150, 255))), width=int(rng.choice([1, 1, 2])))
d.rectangle((0, 0, W, 6), fill=(58, 58, 66, 255))
save(fr, "creep_fringe.png")

# ---------------------------------------------------------------- jeans (one leg; front = middle; hip at top)
W, H = 256, 512
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
twill = np.tile(np.asarray(Image.fromarray(((DENIM - DENIM.min()) / np.ptp(DENIM) * 255).astype(np.uint8)).resize((128, 128))).astype(np.float32) / 255 - 0.5, (H // 128, W // 128)) * 22                                    # denim twill (photo)
a = np.stack([np.full((H, W), 74.0), np.full((H, W), 112.0), np.full((H, W), 160.0)], -1)
a += (twill + noise(H, W, 0.7, 6))[..., None]
u = xx / W
fade = np.exp(-((u - 0.5) / 0.18) ** 2) * (0.25 * np.exp(-((yy / H - 0.45) / 0.12) ** 2) + 0.18 * np.exp(-((yy / H - 0.12) / 0.1) ** 2))
a = a + fade[..., None] * np.array([120, 110, 80])                                    # worn knee + thigh fade
bunch = 1 - 0.22 * np.clip(np.sin(yy / 9 + np.sin(xx / 20) * 1.5), 0, 1) ** 3 * (yy / H > 0.78)   # stacked creases at the ankle
side = 1 - 0.25 * (np.exp(-((u - 0.0) / 0.06) ** 2) + np.exp(-((u - 1.0) / 0.06) ** 2))
a = shade(a, bunch * side)
img = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
d = ImageDraw.Draw(img)
for x in (2, W - 3):                                                                   # outseam + gold stitch
    d.line([(x, 0), (x, H)], fill=(40, 60, 92), width=3)
    for y in range(0, H, 9):
        d.line([(x + (5 if x < W / 2 else -5), y), (x + (5 if x < W / 2 else -5), y + 5)], fill=(196, 150, 70), width=1)
for i in range(6):                                                                     # whiskers at the hip
    y = 30 + i * 9
    d.line([(W * 0.4 - i * 4, y), (W * 0.6 + i * 4, y + 6)], fill=(150, 175, 205), width=2)
cx, cy = W * 0.52, H * 0.44                                                           # the knee rip
d.ellipse((cx - 30, cy - 14, cx + 30, cy + 14), fill=(225, 220, 205))
for k in range(-12, 13, 3):
    d.line([(cx - 32, cy + k), (cx + 32, cy + k + rng.uniform(-2, 2))], fill=(240, 236, 222), width=1)
d.arc((cx - 32, cy - 16, cx + 32, cy + 16), 0, 360, fill=(52, 76, 112), width=3)
for _ in range(40):                                                                    # small distress spots
    x, y = rng.uniform(0, W), rng.uniform(0, H)
    d.ellipse((x, y, x + 2, y + 1), fill=(170, 190, 215))
img = img.filter(ImageFilter.SMOOTH)
save(img, "creep_jeans.png")

# ---------------------------------------------------------------- sneaker upper (black canvas, stitching, eyelets)
W, H = 256, 128
a = np.ones((H, W, 3), np.float32) * 26 + noise(H, W, 0.6, 6)[..., None]
img = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
d = ImageDraw.Draw(img)
for y in (18, 104):
    for x in range(0, W, 8):
        d.line([(x, y), (x + 4, y)], fill=(120, 120, 120), width=1)
for i in range(6):
    x = W * 0.5 + (i % 2 * 2 - 1) * 14
    y = 24 + i * 12
    d.ellipse((x - 3, y - 3, x + 3, y + 3), fill=(190, 190, 190))
for i in range(5):
    d.line([(W * 0.5 - 14, 24 + i * 12), (W * 0.5 + 14, 36 + i * 12)], fill=(225, 225, 220), width=3)
    d.line([(W * 0.5 + 14, 24 + i * 12), (W * 0.5 - 14, 36 + i * 12)], fill=(205, 205, 200), width=3)
d.ellipse((W * 0.82, 40, W * 0.95, 70), fill=(225, 225, 220), outline=(80, 80, 80))     # ankle patch (blank)
save(img, "creep_shoe.png")
