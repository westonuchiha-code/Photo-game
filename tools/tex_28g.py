"""Textures for 28g (stair entrance, from photos/city/stairway-sign-entrance.jpg).
Run from the repo root: python3 tools/tex_28g.py
  sg_red.png       weathered orange brick pier facing (straight crop of the photo's left pier, top half)
  sg_grey.png      charcoal / grey textured brick facing (left pier, lower half)
  sg_tiletop.png   white glazed tiles peeling off to old yellow tile (right pier, top)
  sg_tilelow.png   beige tiles with rust drips (right pier, bottom)
  sg_step.png      speckled grey terrazzo for the worn stair treads (quilted from the stair)
  sg_plaster.png   rough grey-white wall plaster in the stairwell (quilted)
  sg_darkbrick.png the dark glazed brick wall over the entrance (tiles across)
  sg_pave.png      the sidewalk: speckled grey pavers in running bond, one dark paver, gum spots
"""
import os
import numpy as np
from PIL import Image, ImageFilter

OUT = "assets/textures"
rng = np.random.default_rng(29)


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
    def put(ty, tx):
        sy, sx = rng.integers(0, src.shape[0] - patch), rng.integers(0, src.shape[1] - patch)
        yy, xx = (np.arange(patch) + ty) % H, (np.arange(patch) + tx) % W
        canvas[np.ix_(yy, xx)] += src[sy:sy + patch, sx:sx + patch] * win
        weight[np.ix_(yy, xx)] += win
    for _ in range(n):
        put(rng.integers(0, H), rng.integers(0, W))
    for _ in range(3000):
        holes = np.argwhere(weight[..., 0] < 0.3)
        if len(holes) == 0:
            break
        cy, cx = holes[rng.integers(0, len(holes))]
        put(cy - patch // 2, cx - patch // 2)
    out = canvas / weight
    m, s = src.reshape(-1, 3).mean(0), src.reshape(-1, 3).std(0)
    om, os_ = out.reshape(-1, 3).mean(0), out.reshape(-1, 3).std(0)
    return (out - om) / (os_ + 1e-3) * s + m


def flat(a, r=40):
    """remove broad light falloff, keep detail"""
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    lo = np.asarray(im.filter(ImageFilter.GaussianBlur(r))).astype(np.float32)
    return a - lo + lo.reshape(-1, 3).mean(0)


def save(name, a):
    Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(os.path.join(OUT, name), optimize=True)
    print("wrote", name, a.shape[1], "x", a.shape[0])


im = cload("stairway-sign-entrance")
k = im.size[0] / 788
crop = lambda b, size: np.asarray(im.crop(tuple(int(v * k) for v in b)).resize(size, Image.LANCZOS)).astype(np.float32)

save("sg_red.png", crop((72, 448, 214, 705), (512, 928)))
save("sg_grey.png", crop((90, 705, 236, 1030), (512, 1140)))
save("sg_tiletop.png", crop((440, 392, 580, 498), (512, 388)))
save("sg_tilelow.png", crop((446, 842, 556, 998), (512, 726)))

# stair treads: speckled terrazzo from the lower flight
st = np.asarray(im.crop(tuple(int(v * k) for v in (285, 900, 425, 935)))).astype(np.float32)
st = flat(st, 30)
save("sg_step.png", quilt(st, 512, 512, 40))

# stairwell plaster: generated (the photo's wall is crossed by the rail), grey-white with grit
def fbm(H, W, cells, octaves, seed):
    r = np.random.default_rng(seed)
    acc = np.zeros((H, W), np.float32); amp = tot = 0.0; amp = 1.0
    for o in range(octaves):
        c = cells * 2 ** o
        g = np.tile(r.random((c, c)).astype(np.float32), (2, 2))
        a = np.asarray(Image.fromarray((g * 255).astype(np.uint8)).resize((W * 2, H * 2), Image.BICUBIC)).astype(np.float32)[:H, :W] / 255
        acc += a * amp; tot += amp; amp *= 0.55
    return acc / tot
base = np.array([196, 196, 190], np.float32)
P = base[None, None, :] + ((fbm(512, 512, 4, 6, 3) - 0.5) * 40)[..., None]
grit = rng.random((512, 512)) ** 6 * 70 - rng.random((512, 512)) ** 8 * 90
P += grit[..., None]
P = np.asarray(Image.fromarray(np.clip(P, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.7))).astype(np.float32)
save("sg_plaster.png", P)

# dark brick over the entrance: a clean band above the cables, crossfaded to tile sideways
wb = np.asarray(im.crop(tuple(int(v * k) for v in (265, 100, 545, 146)))).astype(np.float32)
wb = flat(wb, 60)
h, w = wb.shape[:2]
x = np.linspace(0, 1, w)
wx = np.clip(np.sin(np.pi * x) * 1.6, 0, 1)[None, :, None]
wb = wb * wx + np.roll(wb, w // 2, axis=1) * (1 - wx)
wb = np.asarray(Image.fromarray(np.clip(wb, 0, 255).astype(np.uint8)).resize((1024, int(1024 * h / w)), Image.LANCZOS)).astype(np.float32)
# stack 2 copies (flipped rows would misalign bond, so plain stack) and crossfade the joint
stack = np.concatenate([wb, wb], 0)
save("sg_darkbrick.png", stack * 1.5)

# sidewalk pavers: speckle from the photo, laid as 300 x 450 mm pavers in running bond
pc = im.crop((1250, 3555, 1452, 3724))                 # inside a single paver (no joints)
pv = np.asarray(pc.resize((pc.size[0], int(pc.size[1] * 1.6)), Image.LANCZOS)).astype(np.float32)   # undo foreshortening
pv = flat(pv, 30)
N = 1024                                     # 1.8 m square -> 300 x 450 mm pavers (6 x 4)
G = quilt(pv, N, N, 48)
G = (G - G.mean()) * 1.0 + np.array([150, 150, 148], np.float32)
yy, xx = np.mgrid[0:N, 0:N]
cw, ch = N // 6, N // 4                      # 0.3 m wide, 0.45 m long
colI = xx // cw
off = (colI % 2) * (ch // 2)
row = (yy + off) // ch
tid = (colI * 7 + row * 3) % 23
G += rng.normal(0, 5, 23)[tid][..., None]
dark = (colI == 3) & (row % 4 == 2)          # one charcoal paver
G[dark] = G[dark] * 0.45 + np.array([40, 40, 42]) * 0.55
gm = ((xx % cw) < 3) | (((yy + off) % ch) < 3)
G[gm] = G[gm] * 0.4 + np.array([78, 66, 60]) * 0.6        # reddish-brown joints like the photo
for _ in range(14):                                       # old gum spots
    cy, cx, r = rng.integers(0, N), rng.integers(0, N), rng.uniform(5, 13)
    d = np.sqrt(((yy - cy + N // 2) % N - N // 2) ** 2 + ((xx - cx + N // 2) % N - N // 2) ** 2 * 0.8)
    a = np.clip((r - d) / 2.5, 0, 1)[..., None] * 0.85
    G = G * (1 - a) + np.array([28, 28, 30]) * a
save("sg_pave.png", G)
