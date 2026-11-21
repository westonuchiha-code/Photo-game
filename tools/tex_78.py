"""Textures for queue item 78 (photos/batch78/): white-painted raked brick and tan speckled flashed brick.
Bricks don't survive a crossfade (the courses ghost), so each texture is rebuilt as a running-bond grid: every brick
face is a patch cut from a real brick in the photo (joints rejected), mortar colour is sampled from the photo's joints,
recesses are shaded, and a normal map is derived from a height field (faces up, joints down, plus the face detail).
Writes bk_white, bk_white_n, bk_tan, bk_tan_n (512 x 384, 4 bricks x 8 courses, tile both ways)."""
import os, numpy as np, cv2
from PIL import Image
OUT = "assets/textures"; ROT = {3: Image.ROTATE_180, 6: Image.ROTATE_270, 8: Image.ROTATE_90}
def load(n):
    im = Image.open(f"photos/batch78/{n}.jpg"); o = im.getexif().get(274, 1)
    if o in ROT: im = im.transpose(ROT[o])
    return cv2.cvtColor(np.asarray(im.convert("RGB")), cv2.COLOR_RGB2BGR)
def crop(im, x0, y0, x1, y1): H, W = im.shape[:2]; return im[int(y0 * H):int(y1 * H), int(x0 * W):int(x1 * W)]
def save(n, a): cv2.imwrite(os.path.join(OUT, n + ".png"), a); print("wrote", n, a.shape[1], a.shape[0])

def course_period(img, band=(30, 18)):
    g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32); prof = g.mean(1); prof -= prof.mean()
    ac = np.correlate(prof, prof, 'full')[len(prof) - 1:]
    # each pillar shows ~20-28 courses: search only that band (a wider search locks onto half/double periods)
    lo, hi = len(prof) // band[0], len(prof) // band[1]
    p = lo + int(np.argmax(ac[lo:hi])); return p, prof
def build(img, seed, out=(512, 384), nb=4, nc=8, mortar_px=6, light=1.0, band=(30, 18), pwf=1.25, faces=None, mortar=None):
    rng = np.random.default_rng(seed); H, W = img.shape[:2]
    per, prof = course_period(img, band); g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32)
    # course boundaries = local minima of the row profile spaced ~per apart
    phase = int(np.argmin(prof[:per])); rows = list(range(phase, H - per, per))
    # mortar colour: the darkest band rows
    mort = np.concatenate([img[max(0, r - 1):r + 2].reshape(-1, 3) for r in rows]); mcol = np.median(mort, 0) if mortar is None else np.array(mortar, np.float32)
    ow, oh = out; bw, bh = ow // nb, oh // nc
    tex = np.zeros((oh, ow, 3), np.float32); hgt = np.zeros((oh, ow), np.float32)
    tex[:] = mcol; hgt[:] = 0.0
    def patch():
        if faces is not None:   # hand-picked clean brick faces: a random sub-rect of one of them
            f = faces[rng.integers(0, len(faces))]; fh, fw = f.shape[:2]; sh_, sw_ = int(fh * 0.8), int(fw * 0.8)
            y = int(rng.integers(0, fh - sh_ + 1)); x = int(rng.integers(0, fw - sw_ + 1)); return f[y:y + sh_, x:x + sw_]
        for _ in range(80):
            r0 = rows[rng.integers(0, len(rows))]; y0 = r0 + int(per * 0.28); y1 = r0 + int(per * 0.72)
            pw = int(per * pwf); x0 = int(rng.integers(0, max(1, W - pw))); p = img[y0:y1, x0:x0 + pw]; pg = g[y0:y1, x0:x0 + pw]
            if p.shape[0] < 4 or p.shape[1] < pw: continue
            col = pg.mean(0); 
            if col.min() < np.median(col) - 18: continue   # a head joint runs through it
            rw = pg.mean(1)
            if rw.min() < np.median(rw) - 14: continue     # a bed joint runs through it
            return p
        return p
    noise = rng.normal(0, 1, (oh, ow)).astype(np.float32)
    for c in range(nc):
        off = (bw // 2) * (c % 2)
        for b in range(-1, nb + 1):
            x0 = b * bw + off; y0 = c * bh; m = mortar_px // 2
            p = cv2.resize(patch(), (bw - mortar_px, bh - mortar_px), interpolation=cv2.INTER_AREA).astype(np.float32)
            p *= light * (0.94 + 0.12 * rng.random())                       # a little brick-to-brick variation
            ys, xs = np.mgrid[y0 + m:y0 + bh - m, x0 + m:x0 + bw - m]; xs = xs % ow
            tex[ys, xs] = p
            pg = cv2.cvtColor(np.clip(p, 0, 255).astype(np.uint8), cv2.COLOR_BGR2GRAY).astype(np.float32) / 255
            hgt[ys, xs] = 0.75 + 0.25 * pg
            # recess shading: the joint's top edge + left edge in shadow (light from above-left), bottom edge lit
            tex[y0 + m:y0 + m + 2, xs[0]] *= 0.82
            for k in range(2): tex[(y0 + bh - m - 1 - k) % oh, xs[0]] *= 1.04
    tex += noise[..., None] * 3
    return np.clip(tex, 0, 255).astype(np.uint8), hgt
def normal(h, strength=6.0):
    h = cv2.GaussianBlur(h, (0, 0), 0.9)
    dx = (np.roll(h, -1, 1) - np.roll(h, 1, 1)) * strength; dy = (np.roll(h, -1, 0) - np.roll(h, 1, 0)) * strength
    n = np.dstack([-dx, dy, np.ones_like(h)]); n /= np.linalg.norm(n, axis=2, keepdims=True)
    return cv2.cvtColor(((n * 0.5 + 0.5) * 255).astype(np.uint8), cv2.COLOR_RGB2BGR)
w_img = crop(load("01-white-painted-brick-pillar"), 0.27, 0.06, 0.75, 0.92)   # the running-bond middle (soldier borders excluded)
t_img = crop(load("02-tan-brick-pillar"), 0.18, 0.02, 0.42, 0.88)
full = load("01-white-painted-brick-pillar")
# clean brick faces picked by eye in the middle band (x0, y0, x1, y1 in px): whole bricks, no joints
FACES = [(570, 1380, 810, 1520), (890, 1390, 1110, 1530), (1170, 1390, 1410, 1530), (1470, 1390, 1710, 1540), (570, 1580, 800, 1730), (890, 1590, 1410, 1730), (1470, 1590, 1710, 1730)]
faces = [full[y0:y1, x0:x1] for x0, y0, x1, y1 in FACES]
wt, wh = build(w_img, 1, out=(480, 384), nb=6, mortar_px=8, band=(24, 14), faces=faces, mortar=(200, 204, 206))
wt = np.clip(wt.astype(np.float32) * (226 / max(1, np.median(wt))), 0, 255).astype(np.uint8)
save("bk_white", wt); save("bk_white_n", normal(wh, 7))   # (brightened back to the paint's level)
tt, th = build(t_img, 2); save("bk_tan", tt); save("bk_tan_n", normal(th, 6))
