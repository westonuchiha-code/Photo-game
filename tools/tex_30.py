"""(helpers copied from tex_29) Textures for queue item 30 (photos/grime/): abandoned-interior surfaces.
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



# crackled varnish panels, scratched stainless, worn planks (planks run along u; wrap along u only, the
# vertical wrap lands on a plank joint)
surf("crackle-tan-surface1", "wd_crackle", r=160, nstr=5)
surf("crackle-tan-surface2", "wd_crackle2", r=160, nstr=5)
surf("scratched-steel", "wd_steel", frac=0.55, r=250, gain=1.4)


def planks(src, name, box, rot=False, nstr=6):
    im = load(src)
    if rot:
        im = im.rotate(90, expand=True)
    w, h = im.size
    im = im.crop(tuple(int(v) for v in (box[0] * w, box[1] * h, box[2] * w, box[3] * h))).resize((1024, 512), Image.LANCZOS)
    a = flat(np.asarray(im).astype(np.float32), 140)
    x = np.linspace(0, 1, a.shape[1]); wx = np.clip(np.sin(np.pi * x) * 1.6, 0, 1)[None, :, None]
    a = a * wx + np.roll(a, a.shape[1] // 2, 1) * (1 - wx)
    save(name, a)
    save(name + "_n", normal(a, nstr))


planks("wood-planks-worn1", "wd_plank_a", (0.0, 0.08, 1.0, 0.92))
planks("wood-planks-worn2", "wd_plank_b", (0.0, 0.05, 1.0, 0.95))
planks("wood-planks-gouged", "wd_plank_c", (0.0, 0.05, 1.0, 0.95), nstr=8)
planks("wood-planks-gouged-dark", "wd_plank_d", (0.0, 0.2, 0.84, 0.72), nstr=8)

# the abstract grey/orange painting: centre crop at the canvas proportions (3:4)
im = load("abstract-gray-orange-paint")
w, h = im.size
im.crop((int(w * 0.04), int(h * 0.12), int(w * 0.96), int(h * 0.12) + int(w * 0.92 * 4 / 3))).resize((600, 800), Image.LANCZOS).save(os.path.join(OUT, "wd_painting.png"), optimize=True)
print("wrote wd_painting")

# plaster scroll relief: the fan of scrolls, as a sconce face (+ normal map from the light falloff)
im = load("plaster-scroll-relief")
w, h = im.size
c = im.crop((int(w * 0.02), int(h * 0.08), int(w * 0.98), int(h * 0.78))).resize((512, 640), Image.LANCZOS)
a = np.asarray(c).astype(np.float32)
L = a.mean(-1)
a = a / np.percentile(L, 98) * 235                    # neutralise the warm lamp: it's white plaster
grey = a.mean(-1, keepdims=True)
a = grey * np.array([1.0, 0.97, 0.92]) * 0.6 + a * 0.4
save("wd_scroll", a)
save("wd_scroll_n", normal(a, 7, blur=1.5, hp=20))
