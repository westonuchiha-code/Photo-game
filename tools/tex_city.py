"""Textures for the city district (town expansion).
  city_asphalt.png      road surface: the aggregate asphalt from photos/misc/asphalt-spider.jpg (spider left out),
                        seamless, darkened toward night-road grey
  city_windows.png      4 x 4 window atlas (256 px cells): lit cells use the blinds photo (blinds.png) warm/cool,
                        curtains, a TV-blue room; dark cells are dark glass with a faint sky sheen, closed blinds
  city_windows_e.png    its emissive mask (only the lit cells glow)
  city_far.png          distant-tower facade tile (16 x 16 m): dark panels with scattered lit windows
  city_far_e.png        its emissive mask
"""
import os, numpy as np, cv2
from PIL import Image
OUT = "assets/textures"; rng = np.random.default_rng(7)
def save(n, a): cv2.imwrite(os.path.join(OUT, n), a); print("wrote", n)
def seamless(p, size):
    p = cv2.resize(p, size, interpolation=cv2.INTER_AREA).astype(np.float32); w, h = size
    r = np.roll(np.roll(p, h // 2, 0), w // 2, 1)
    wx = np.minimum(np.minimum(np.arange(w), w - 1 - np.arange(w)) / (w / 2), 1); wy = np.minimum(np.minimum(np.arange(h), h - 1 - np.arange(h)) / (h / 2), 1)
    m = np.minimum(wy[:, None], wx[None, :])[:, :, None] ** 0.6
    out = p * m + r * (1 - m); low = cv2.GaussianBlur(out, (0, 0), w / 10); return (out - low + low.mean((0, 1)))
# asphalt
im = cv2.cvtColor(np.asarray(Image.open("photos/misc/asphalt-spider.jpg").convert("RGB").transpose(Image.ROTATE_270)), cv2.COLOR_RGB2BGR)
H, W = im.shape[:2]; a = im[int(0.52 * H):int(0.97 * H), int(0.02 * W):int(0.62 * W)]
a = seamless(a, (512, 512)); a = (a - a.mean()) * 0.8 + 92; save("city_asphalt.png", a.clip(0, 255).astype(np.uint8))
# window atlas
bl = cv2.imread(os.path.join(OUT, "blinds.png")); bl = cv2.resize(bl, (256, 256))
atlas = np.zeros((1024, 1024, 3), np.float32); emit = np.zeros_like(atlas)
def frame(c, col=(40, 42, 46)):
    c[:10, :] = col; c[-14:, :] = col; c[:, :10] = col; c[:, -10:] = col; c[118:126, :] = col
    return c
cells = []
warm = np.array([0.55, 0.8, 1.0]); cool = np.array([1.0, 0.95, 0.88])
for k in range(16):
    c = np.zeros((256, 256, 3), np.float32); e = np.zeros_like(c)
    if k in (0, 1, 2):        # blinds, lit warm (BGR multipliers)
        c = bl.astype(np.float32) * warm * (0.9 + 0.1 * k); e = c * 0.9
        if k == 2: c[:110] *= 0.35; e[:110] *= 0.2          # half drawn: dark top
    elif k == 3:              # blinds lit cool white
        c = bl.astype(np.float32) * cool; e = c * 0.85
    elif k == 4:              # curtains, warm
        x = np.arange(256); stripe = 0.75 + 0.25 * np.sin(x / 9.0) ** 2
        c[:] = np.array([60, 120, 190])[None, None, :] * stripe[None, :, None]; c[:, 100:156] = np.array([90, 180, 245]); e = c * 0.9
    elif k == 5:              # TV-blue room with a lamp
        yy, xx = np.mgrid[0:256, 0:256]; g = np.exp(-((xx - 180) ** 2 + (yy - 170) ** 2) / 5000.0)
        c[:] = np.array([120, 70, 40]); c += g[:, :, None] * np.array([90, 160, 220]); e = c * 0.8
    elif k == 6:              # lit room, plant silhouette
        c[:] = np.array([110, 170, 220]); cv2.ellipse(c, (70, 190), (40, 55), 0, 0, 360, (20, 30, 25), -1); cv2.rectangle(c, (55, 230), (85, 256), (25, 30, 40), -1); e = c * 0.85
    else:                     # dark glass: sky sheen gradient, some with closed blinds
        yy = np.linspace(0, 1, 256)[:, None, None]; base = np.array([38, 30, 26]) + (1 - yy) * np.array([40, 32, 28]) * rng.uniform(0.6, 1.2)
        c[:] = base; d = rng.uniform(0, 1)
        if d < 0.35: c = bl.astype(np.float32) * 0.18
        cv2.line(c, (int(rng.uniform(0, 256)), 0), (int(rng.uniform(0, 256)), 256), (70, 64, 60), 6)
    c = frame(c); e[:10] = e[-14:] = 0; e[:, :10] = e[:, -10:] = 0; e[118:126] = 0
    r, q = divmod(k, 4); atlas[r * 256:(r + 1) * 256, q * 256:(q + 1) * 256] = c; emit[r * 256:(r + 1) * 256, q * 256:(q + 1) * 256] = e
save("city_windows.png", atlas.clip(0, 255).astype(np.uint8)); save("city_windows_e.png", emit.clip(0, 255).astype(np.uint8))
# far tower facade: 512 px = 16 m, 5 floors x 8 bays
f = np.zeros((512, 512, 3), np.float32); fe = np.zeros_like(f); f[:] = (44, 40, 38)
for fl in range(5):
    for b in range(8):
        y0, x0 = fl * 102 + 30, b * 64 + 10; lit = rng.uniform() < 0.16
        col = (np.array([90, 170, 230]) if rng.uniform() < 0.7 else np.array([235, 225, 200])) * rng.uniform(0.5, 0.9) if lit else np.array([56, 50, 47])
        f[y0:y0 + 52, x0:x0 + 44] = col
        if lit: fe[y0:y0 + 52, x0:x0 + 44] = col
save("city_far.png", f.astype(np.uint8)); save("city_far_e.png", fe.astype(np.uint8))
