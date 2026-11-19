"""Textures for queue item 29 (photos/grime/): abandoned-interior surfaces.
Run from the repo root: python3 tools/tex_29.py
Every surface is a centre crop of its photo with the light falloff flattened, made seamless by an
offset crossfade, and (for the bumpy ones) a normal map derived from the photo's fine luminance detail.
  ab_tan_smooth, ab_tan_mottled            dingy tan painted walls
  ab_peel, ab_peel2 (+ _n)                 orange-peel drywall, plain
  ab_peel_stain (+ _n), ab_peel_chip (+ _n) stained / chipped-and-patched drywall
  ab_ceil (+ _n)                           one 600 mm acoustic ceiling tile with bevelled edges (damaged)
  ab_ceil_rust                             the rusty T-bar grid colour strip (from the rust-grid photo)
  ab_wood                                  plain pine board
  ab_tile                                  grimy white wall tile (with the hair)
  ab_particle, ab_particle2                water-stained particleboard
  ab_chip_metal (+ _n)                     white paint chipping off black metal
"""
import os
import numpy as np
from PIL import Image, ImageFilter

OUT = "assets/textures"


def load(n):
    im = Image.open(f"photos/grime/{n}.jpg")
    try:
        o = im.getexif().get(274, 1)
    except Exception:
        o = 1
    im = im.convert("RGB")
    return {3: im.rotate(180, expand=True), 6: im.rotate(270, expand=True), 8: im.rotate(90, expand=True)}.get(o, im)


def centre(im, frac=0.8, square=True):
    w, h = im.size
    if square:
        s = int(min(w, h) * frac)
        return im.crop(((w - s) // 2, (h - s) // 2, (w + s) // 2, (h + s) // 2))
    return im.crop((int(w * (1 - frac) / 2), int(h * (1 - frac) / 2), int(w * (1 + frac) / 2), int(h * (1 + frac) / 2)))


def flat(a, r):
    lo = np.asarray(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r))).astype(np.float32)
    return a - lo + lo.reshape(-1, 3).mean(0)


def seamless(a):
    h, w = a.shape[:2]
    out = a.copy()
    x = np.linspace(0, 1, w); wx = np.clip(np.sin(np.pi * x) * 1.6, 0, 1)[None, :, None]
    out = out * wx + np.roll(out, w // 2, 1) * (1 - wx)
    y = np.linspace(0, 1, h); wy = np.clip(np.sin(np.pi * y) * 1.6, 0, 1)[:, None, None]
    out = out * wy + np.roll(out, h // 2, 0) * (1 - wy)
    return out


def normal(a, strength, blur=1.0, hp=12):
    L = a.mean(-1)
    Li = Image.fromarray(np.clip(L, 0, 255).astype(np.uint8))
    h = np.asarray(Li.filter(ImageFilter.GaussianBlur(blur))).astype(np.float32) - np.asarray(Li.filter(ImageFilter.GaussianBlur(hp))).astype(np.float32)
    h /= 255
    dx = (np.roll(h, -1, 1) - np.roll(h, 1, 1)) * 0.5
    dy = (np.roll(h, -1, 0) - np.roll(h, 1, 0)) * 0.5
    nx, ny, nz = -dx * strength, dy * strength, np.ones_like(h)
    ln = np.sqrt(nx ** 2 + ny ** 2 + nz ** 2)
    return (np.stack([nx / ln, ny / ln, nz / ln], -1) * 0.5 + 0.5) * 255


def save(name, a):
    Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(os.path.join(OUT, name + ".png"), optimize=True)
    print("wrote", name, a.shape[1], "x", a.shape[0])


def surf(src, name, size=1024, frac=0.8, r=60, nstr=None, square=True, gain=1.0):
    im = centre(load(src), frac, square).resize((size, size), Image.LANCZOS)
    a = np.asarray(im).astype(np.float32)
    a = flat(a, r)
    a = seamless(a)
    m = a.reshape(-1, 3).mean(0)
    a = (a - m) * gain + m
    save(name, a)
    if nstr:
        save(name + "_n", normal(a, nstr))
    return a


surf("wall-tan-smooth", "ab_tan_smooth", r=80)
surf("wall-tan-mottled", "ab_tan_mottled", r=120)
surf("wall-orange-peel1", "ab_peel", nstr=10, r=50)
surf("wall-orange-peel2", "ab_peel2", nstr=10, r=50)
surf("wall-orange-peel-stains", "ab_peel_stain", nstr=8, r=200)
surf("wall-orange-peel-chipped", "ab_peel_chip", nstr=10, r=80)
surf("wood-plain", "ab_wood", frac=0.85, square=False, r=120)
surf("tile-white-grout-hair", "ab_tile", frac=0.9, r=150)
surf("particleboard-stained1", "ab_particle", r=200)
surf("particleboard-stained2", "ab_particle2", r=200)
surf("chipped-white-paint-metal", "ab_chip_metal", nstr=6, r=200)

# ---- ceiling tile: one 600 mm tile from the damaged-tile photo, with a bevelled edge darkened into the grid
im = centre(load("ceiling-tile-damaged"), 0.7).resize((1024, 1024), Image.LANCZOS)
a = flat(np.asarray(im).astype(np.float32), 80)
a = seamless(a)
yy, xx = np.mgrid[0:1024, 0:1024]
e = np.minimum(np.minimum(xx, 1023 - xx), np.minimum(yy, 1023 - yy)).astype(np.float32)
a *= (0.72 + 0.28 * np.clip(e / 22, 0, 1))[..., None]
save("ab_ceil", a)
n = normal(a, 9)
save("ab_ceil_n", n)
# ---- rusty grid strip: the band across the rust-grid photo, stretched along its length
im = load("ceiling-tile-rust-grid")
w, h = im.size
strip = im.crop((0, int(h * 0.38), w, int(h * 0.5))).resize((1024, 64), Image.LANCZOS)
save("ab_ceil_rust", np.asarray(strip).astype(np.float32))
