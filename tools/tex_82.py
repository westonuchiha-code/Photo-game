"""Textures for queue item 82 (photos/batch82/): the texture library (seamless + normal maps where it helps), the
user's two paintings as-is, and two tread-plate finishes generated with real lug height (normal maps).
Note: the photo named diamond-plate-blue is the purple anodised sheet, diamond-plate-purple the maroon one."""
import os, numpy as np, cv2
from PIL import Image
OUT = "assets/textures"; ROT = {3: Image.ROTATE_180, 6: Image.ROTATE_270, 8: Image.ROTATE_90}
def load(n):
    im = Image.open(f"photos/batch82/{n}.jpg"); o = im.getexif().get(274, 1)
    if o in ROT: im = im.transpose(ROT[o])
    return cv2.cvtColor(np.asarray(im.convert("RGB")), cv2.COLOR_RGB2BGR)
def crop(im, x0, y0, x1, y1): H, W = im.shape[:2]; return im[int(y0 * H):int(y1 * H), int(x0 * W):int(x1 * W)]
def seamless(p, size, flat=8):
    p = cv2.resize(p, size, interpolation=cv2.INTER_AREA).astype(np.float32); w, h = size
    r = np.roll(np.roll(p, h // 2, 0), w // 2, 1)
    wx = np.minimum(np.minimum(np.arange(w), w - 1 - np.arange(w)) / (w / 2), 1); wy = np.minimum(np.minimum(np.arange(h), h - 1 - np.arange(h)) / (h / 2), 1)
    m = np.minimum(wy[:, None], wx[None, :])[:, :, None] ** 0.6
    out = p * m + r * (1 - m)
    if flat: low = cv2.GaussianBlur(out, (0, 0), w / flat); out = out - low + low.mean((0, 1))
    return out.clip(0, 255).astype(np.uint8)
def save(n, a): cv2.imwrite(os.path.join(OUT, n + ".png"), a); print("wrote", n, a.shape[1], a.shape[0])
def art(src, name, box=(0, 0, 1, 1), maxw=1024):
    a = crop(load(src), *box); s = maxw / max(a.shape[:2]); save(name, cv2.resize(a, (int(a.shape[1] * s), int(a.shape[0] * s)), interpolation=cv2.INTER_AREA))

def seamless_vp(p, size, flat=8):
    """seamless in two 1-D passes (x, then y). Each pass blends the image with a copy rolled half a tile along that
    axis: the copy is used near the borders (where it is continuous) and the original near the centre line (where
    the copy has its seam), so neither seam ever shows. The blend is variance-preserving: mixing two uncorrelated
    images drops contrast by sqrt(m^2 + (1-m)^2), so it is re-scaled around the mean (no faded bands)."""
    p = cv2.resize(p, size, interpolation=cv2.INTER_AREA).astype(np.float32); w, h = size
    if flat: low = cv2.GaussianBlur(p, (0, 0), w / flat); p = p - low + low.mean((0, 1))
    mean = p.mean((0, 1))
    def blend(img, axis, n):
        r = np.roll(img, n // 2, axis); t = np.minimum(np.arange(n), n - 1 - np.arange(n)) / (n / 2)
        m = np.clip(t * 1.8 - 0.4, 0, 1); m = m * m * (3 - 2 * m); m = m[:, None, None] if axis == 0 else m[None, :, None]
        return mean + (img * m + r * (1 - m) - mean) / np.sqrt(m * m + (1 - m) ** 2)
    out = blend(blend(p, 1, w), 0, h)
    return out.clip(0, 255).astype(np.uint8)
def normal_from(h, strength):
    dx = (np.roll(h, -1, 1) - np.roll(h, 1, 1)) * strength; dy = (np.roll(h, -1, 0) - np.roll(h, 1, 0)) * strength
    n = np.dstack([-dx, dy, np.ones_like(h)]); n /= np.linalg.norm(n, axis=2, keepdims=True)
    return cv2.cvtColor(((n * 0.5 + 0.5) * 255).astype(np.uint8), cv2.COLOR_RGB2BGR)
def lum_normal(img, strength=3.0, blur=1.0):
    g = cv2.GaussianBlur(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255.0, (0, 0), blur); return normal_from(g, strength)
# plain seamless surfaces (crop boxes chosen to avoid edges, glare and background)
for src, name, box, size, flat in [
    ("blue-textured-surface", "b82_blueplastic", (0.08, 0.08, 0.92, 0.7), 512, 8), ("grey-chenille-fabric", "b82_chenille", (0.05, 0.1, 0.95, 0.9), 512, 6),
    ("oak-laminate", "b82_oak", (0.02, 0.05, 0.98, 0.8), 512, 0), ("quartz-countertop", "b82_quartz", (0.05, 0.05, 0.95, 0.75), 512, 6),
    ("rust-surface", "b82_rust", (0.05, 0.05, 0.95, 0.95), 512, 6), ("speckled-white-panel", "b82_speckle", (0.08, 0.08, 0.92, 0.92), 512, 8),
    ("whitewashed-wood", "b82_whitewash", (0.05, 0.05, 0.95, 0.85), 512, 6), ("painting-blue-canvas", "b82_canvasblue", (0.08, 0.08, 0.92, 0.92), 512, 4),
    ("painting-grey-canvas", "b82_canvasgrey", (0.08, 0.08, 0.92, 0.92), 512, 4)]:
    t = seamless_vp(crop(load(src), *box), (size, size), flat); save(name, t)
    if name in ("b82_rust", "b82_oak", "b82_chenille", "b82_blueplastic"): save(name + "_n", lum_normal(t, 3.5 if name != "b82_oak" else 2.0))
# the user's paintings, as-is
art("painting-figure-drawing", "canvas_art_figure"); art("impasto-painting-closeup", "canvas_art_impasto")
imp = seamless_vp(crop(load("impasto-painting-closeup"), 0.05, 0.05, 0.95, 0.95), (512, 512), 0); save("b82_impasto", imp); save("b82_impasto_n", lum_normal(imp, 6.0, 1.4))
# tread plate: lugs generated as a height field (5-bar diamond pattern: bars alternate +/-45 degrees on a 25 mm grid),
# coloured from the flat areas of each photo, with a fine brushed/anodised sheen and scratches
def tread(src, name, box, seed):
    rng = np.random.default_rng(seed); S = 512; cell = 64
    ref = crop(load(src), *box); base = np.median(ref.reshape(-1, 3), 0).astype(np.float32) * 1.25
    h = np.zeros((S, S), np.float32); yy, xx = np.mgrid[0:S, 0:S].astype(np.float32)
    for j in range(S // cell + 1):
        for i in range(S // cell + 1):
            cx, cy = i * cell + (cell // 2 if j % 2 else 0), j * cell; ang = np.pi / 4 if (i + j) % 2 == 0 else -np.pi / 4
            for ox, oy in [(0, 0), (S, 0), (-S, 0), (0, S), (0, -S)]:
                dx, dy = xx - (cx + ox), yy - (cy + oy); u = dx * np.cos(ang) + dy * np.sin(ang); v = -dx * np.sin(ang) + dy * np.cos(ang)
                L, R = 20.0, 5.0; d = np.sqrt(np.maximum(np.abs(u) - L, 0) ** 2 + v ** 2); h = np.maximum(h, np.clip(1 - d / R, 0, 1) ** 0.5)
    hb = cv2.GaussianBlur(h, (0, 0), 1.0)
    col = np.ones((S, S, 3), np.float32) * base
    col *= (0.78 + 0.5 * hb)[..., None]                                              # lugs catch the light
    brush = cv2.GaussianBlur(rng.normal(0, 1, (S, S)).astype(np.float32), (0, 0), sigmaX=8, sigmaY=0.6); col *= (1 + 0.05 * brush)[..., None]
    for _ in range(40):                                                              # scratches
        x0, y0 = rng.integers(0, S, 2); a = rng.random() * np.pi; l = rng.integers(20, 120)
        cv2.line(col, (int(x0), int(y0)), (int(x0 + np.cos(a) * l), int(y0 + np.sin(a) * l)), tuple(float(c) * 1.25 for c in base), 1)
    save(name, np.clip(col, 0, 255).astype(np.uint8)); save(name + "_n", normal_from(hb * 1.0, 5.0))
tread("diamond-plate-blue", "b82_tread_purple", (0.1, 0.4, 0.4, 0.6), 1); tread("diamond-plate-purple", "b82_tread_maroon", (0.1, 0.4, 0.4, 0.6), 2)
