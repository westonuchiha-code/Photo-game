"""133: the weak textures redone. Tan brick cut on its own repeat (so the courses meet at the edges), the dead leaf and
the wasp cut out with GrabCut instead of by colour, and pine needles as a cut-out card for foliage.
  python3 tools/tex_133.py"""
import numpy as np, cv2
_s = open('tools/tex_131.py').read(); exec(_s[_s.index('import os'):_s.index('for n, name, box')]); exec(_s[_s.index('def rgba'):_s.index('# the tar-sealed crack')])

# ---- brick: find the repeat (two courses down, one brick across) by self-correlation, then cut whole repeats
b = crop(load("71"), 0.0, 0.0, 1.0, 0.33); g = cv2.GaussianBlur(cv2.cvtColor(b, cv2.COLOR_BGR2GRAY), (0, 0), 3).astype(np.float32); g -= g.mean()
def period(sig, lo, hi):
    sig = sig - sig.mean(); ac = np.correlate(sig, sig, 'full')[len(sig) - 1:]; return lo + int(np.argmax(ac[lo:hi]))
course = period(g.mean(1), 300, 460); rows = g[: course // 2].mean(0) if False else None
# across: correlate a band one course high with itself shifted sideways
band = g[course // 4: course // 4 + course // 2].mean(0); brick = period(band, 800, 1100)
print("brick: course", course, "px, brick", brick, "px, image", b.shape[1], "x", b.shape[0])
ky = 2; kx = 2
tw, th = kx * brick, ky * course; mx, my = min(b.shape[1] - tw, brick // 3), min(b.shape[0] - th, course // 2); n = 1024
p = b[: th + my, : tw + mx].astype(np.float32); low = cv2.GaussianBlur(p, (0, 0), 120); p = p - low + low.mean((0, 1))
# cross-fade the strip beyond each edge (which is the same brickwork one repeat on) over the opposite edge
t = np.linspace(0, 1, mx); t = t * t * (3 - 2 * t); p[:, :mx] = p[:, :mx] * t[None, :, None] + p[:, tw:tw + mx] * (1 - t[None, :, None]); p = p[:, :tw]
t = np.linspace(0, 1, my); t = t * t * (3 - 2 * t); p[:my] = p[:my] * t[:, None, None] + p[th:th + my] * (1 - t[:, None, None]); p = p[:th]
tile = cv2.resize(p.clip(0, 255).astype(np.uint8), (n, int(round(n * th / tw))), interpolation=cv2.INTER_AREA)   # (not square: two bricks by two courses)
save("g132_brick_tan", tile); save("g132_brick_tan_n", lum_normal(tile, 2.5, 1.0)); print("brick tile covers", kx, "bricks x", ky, "courses")

# ---- cut-outs by GrabCut: told only a box that holds the thing
def grab(img, rect, it=6):
    mask = np.zeros(img.shape[:2], np.uint8); bg = np.zeros((1, 65), np.float64); fg = np.zeros((1, 65), np.float64); cv2.grabCut(img, mask, rect, bg, fg, it, cv2.GC_INIT_WITH_RECT)
    m = ((mask == 1) | (mask == 3)).astype(np.uint8); m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8)); return biggest(m, 1).astype(np.uint8)
l = cv2.resize(crop(load("29"), 0.24, 0.42, 0.68, 0.70), (512, 512), interpolation=cv2.INTER_AREA); m = grab(l, (60, 50, 400, 400)); m = cv2.erode(m, np.ones((3, 3), np.uint8)); save("g131_leaf", rgba(l, cv2.GaussianBlur(m.astype(np.float32), (0, 0), 1.2)))
w = cv2.resize(crop(load("25"), 0.25, 0.24, 0.70, 0.56), (512, 512), interpolation=cv2.INTER_AREA); m = grab(w, (110, 70, 300, 360)); save("g131_wasp", rgba(w, cv2.GaussianBlur(m.astype(np.float32), (0, 0), 1.2)))

# ---- pine needles as a card: the lit needles kept, the dark between them cut away
pn = cv2.resize(crop(load("45"), 0.30, 0.10, 0.98, 0.62), (512, 512), interpolation=cv2.INTER_AREA); hsv = cv2.cvtColor(pn, cv2.COLOR_BGR2HSV).astype(np.float32)
a = np.clip((hsv[..., 2] - 42) / 34, 0, 1) * np.clip((hsv[..., 1] - 18) / 25, 0, 1) * ((hsv[..., 0] > 14) & (hsv[..., 0] < 95)); yy, xx = np.mgrid[0:512, 0:512]; rr = np.hypot(xx - 256, yy - 256) / 256; a *= np.clip((1.0 - rr) / 0.25, 0, 1)   # (fade to nothing at the rim: a tuft, not a square)
hs = hsv.copy(); hs[..., 1] = np.clip(hs[..., 1] * 1.7, 0, 255); hs[..., 0] = np.clip(hs[..., 0] + 8, 0, 179); hs[..., 2] = np.clip(hs[..., 2] * 0.8, 0, 255); pn = cv2.cvtColor(hs.astype(np.uint8), cv2.COLOR_HSV2BGR)   # (a lamp-lit night photo: greener and deeper, as the needles are by day)
save("g131_pine_card", rgba(pn, cv2.GaussianBlur(a, (0, 0), 0.8)))
