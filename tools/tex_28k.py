"""Textures for 28k (leftover city photos). Run from the repo root: python3 tools/tex_28k.py
  rp_slab.png / rp_slab_r.png   rain-soaked concrete slabs (rainy-plaza): 1.5 m saw-cut slabs, brown-grey
                                wet concrete colour and grit from the photo, darker damp patches; the _r map is
                                roughness (puddles ~0.05 = mirror-like, wet film ~0.3, joints rough), 3 m repeat
  mp_paver.png                  square concrete pavers with moss + weeds in the joints (sidewalk-tiles photo):
                                300 mm pavers, colour and speckle quilted from the photo's dark field (0.9 m repeat)
  mp_paver_light.png            the photo's light-grey variant (for banding), same layout
  sky_day.png                   the sun-flare photo's sky above the rooftops (pole cropped out), for a later day mode
"""
import os
import numpy as np
from PIL import Image, ImageFilter

OUT = "assets/textures"
rng = np.random.default_rng(41)


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


def flat(a, r=30):
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    lo = np.asarray(im.filter(ImageFilter.GaussianBlur(r))).astype(np.float32)
    return a - lo + lo.reshape(-1, 3).mean(0)


def save(name, a, mode=None):
    img = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), mode) if mode else Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    img.save(os.path.join(OUT, name), optimize=True)
    print("wrote", name, a.shape[1], "x", a.shape[0])


# ---------------------------------------------------------------- wet concrete slabs
im = cload("rainy-plaza")
k = im.size[0] / 787
src = np.asarray(im.crop(tuple(int(v * k) for v in (60, 1170, 600, 1380)))).astype(np.float32)
src = flat(src, 40)
col = src.reshape(-1, 3)
L = col.mean(1)
wet = np.median(col[(L > np.percentile(L, 30)) & (L < np.percentile(L, 80))], 0)
N = 1024                                            # 3 m -> two 1.5 m slabs each way
G = quilt(src, N, N, 56)
G = (G - G.reshape(-1, 3).mean(0)) * 0.9 + wet * 1.25           # lift a little: it's lit by street lights, not daylight
damp = fbm(N, N, 3, 5, 7)
G *= (0.85 + 0.25 * damp)[..., None]
yy, xx = np.mgrid[0:N, 0:N]
joint = ((xx % (N // 2)) < 3) | ((yy % (N // 2)) < 3)
G[joint] = G[joint] * 0.45
# per-slab tone shift
sid = (yy // (N // 2)) * 2 + (xx // (N // 2))
G += rng.normal(0, 6, 4)[sid][..., None]
# roughness: puddles where the low-frequency noise dips (slabs settle at their corners), wet film elsewhere
pud = fbm(N, N, 4, 4, 11)
corner = np.minimum(np.minimum(xx % (N // 2), (N // 2) - xx % (N // 2)), np.minimum(yy % (N // 2), (N // 2) - yy % (N // 2))) / (N / 4)
pmask = np.clip((0.4 - pud + (0.5 - corner) * 0.12) * 9, 0, 1)
pmask = np.asarray(Image.fromarray((pmask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(4))).astype(np.float32) / 255
R = 0.32 + (fbm(N, N, 16, 3, 13) - 0.5) * 0.12
R = R * (1 - pmask) + 0.04 * pmask
R[joint] = 0.85
G *= (1 - pmask * 0.35)[..., None]                  # puddles read darker
save("rp_slab.png", G)
save("rp_slab_r.png", np.repeat((R * 255)[..., None], 3, -1))

# ---------------------------------------------------------------- pavers with moss joints
im = cload("sidewalk-tiles-backpack")
k = im.size[0] / 1400
def paver(box, name, tint=None):
    s = np.asarray(im.crop(tuple(int(v * k) for v in box))).astype(np.float32)
    s = flat(s, 25)
    N = 1024                                    # 0.9 m -> 3 x 3 pavers of 300 mm
    G = quilt(s, N, N, 40)
    if tint is not None:
        G = (G - G.reshape(-1, 3).mean(0)) + tint
    p = N // 3
    yy, xx = np.mgrid[0:N, 0:N]
    tid = ((yy // p) * 3 + (xx // p)) % 9
    G += rng.normal(0, 4, 9)[tid][..., None]
    # slightly chipped arrises: darker towards the edges
    e = np.minimum(np.minimum(xx % p, p - 1 - xx % p), np.minimum(yy % p, p - 1 - yy % p)).astype(np.float32)
    G *= (0.84 + 0.16 * np.clip(e / 8, 0, 1))[..., None]
    joint = e < 4
    jc = np.array([58, 58, 54], np.float32)
    G[joint] = jc + rng.normal(0, 6, (joint.sum(), 3))
    # moss and weed tufts along the joints, more where the noise says (patchy, like the photo)
    moss = fbm(N, N, 6, 4, 21)
    near = (e < 11) & (moss > 0.45)
    mc = np.array([92, 120, 52], np.float32)
    amt = np.clip((moss - 0.42) * 4, 0, 1) * np.clip(1 - e / 11, 0, 1)
    G = G * (1 - amt[..., None] * 0.85) + mc * (amt[..., None] * 0.85) + (rng.random((N, N, 1)) - 0.5) * 30 * amt[..., None]
    # a few weed sprigs: tiny bright green leaf clusters on the joint lines
    img = Image.fromarray(np.clip(G, 0, 255).astype(np.uint8))
    from PIL import ImageDraw
    d = ImageDraw.Draw(img)
    for _ in range(70):
        if rng.random() < 0.5:
            x, y = int(rng.integers(0, 3)) * p + rng.integers(-2, 3), int(rng.integers(0, N))
        else:
            x, y = int(rng.integers(0, N)), int(rng.integers(0, 3)) * p + rng.integers(-2, 3)
        for _ in range(int(rng.integers(3, 8))):
            a = rng.uniform(0, 6.28); l = rng.uniform(5, 14)
            d.line((x, y, x + np.cos(a) * l, y + np.sin(a) * l), fill=(110, 160, 60), width=3)
    save(name, np.asarray(img).astype(np.float32))
paver((400, 120, 900, 300), "mp_paver.png", np.array([104, 104, 102], np.float32))
paver((1000, 150, 1300, 450), "mp_paver_light.png", np.array([176, 176, 172], np.float32))

# ---------------------------------------------------------------- daytime sky (crop above the rooftops, no pole)
im = cload("sun-flare-sky")
k = im.size[0] / 1400
sk = im.crop(tuple(int(v * k) for v in (0, 0, 1150, 860))).resize((2048, 1532), Image.LANCZOS)
save("sky_day.png", np.asarray(sk).astype(np.float32))
