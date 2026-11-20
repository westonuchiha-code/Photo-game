"""Textures for queue item 70 (photos/inspo5/).
  i5_stone     mossy rough-hewn aqueduct stone, seamless          i5_char    charred weathered wall boards, seamless
  i5_plaster   the izakaya's rough tan plaster, seamless
  i5_mural     the faded rainbow mural on the block wall (whole)  i5_glaze   black lumpy glaze (ceramic sculpture)
  i5_paving    the station plaza's grey stone paving, seamless
"""
import os, numpy as np, cv2
from PIL import Image
OUT = "assets/textures"; ROT = {3: Image.ROTATE_180, 6: Image.ROTATE_270, 8: Image.ROTATE_90}
def load(n):
    im = Image.open(f"photos/inspo5/{n}.jpg"); o = im.getexif().get(274, 1)
    if o in ROT: im = im.transpose(ROT[o])
    return cv2.cvtColor(np.asarray(im.convert("RGB")), cv2.COLOR_RGB2BGR)
def crop(im, x0, y0, x1, y1): H, W = im.shape[:2]; return im[int(y0 * H):int(y1 * H), int(x0 * W):int(x1 * W)]
def seamless(p, size, flat=8, axis="both"):
    p = cv2.resize(p, size, interpolation=cv2.INTER_AREA).astype(np.float32); w, h = size
    r = np.roll(np.roll(p, h // 2 if axis != "x" else 0, 0), w // 2 if axis != "y" else 0, 1)
    wx = np.minimum(np.minimum(np.arange(w), w - 1 - np.arange(w)) / (w / 2), 1) if axis != "y" else np.ones(w)
    wy = np.minimum(np.minimum(np.arange(h), h - 1 - np.arange(h)) / (h / 2), 1) if axis != "x" else np.ones(h)
    m = np.minimum(wy[:, None], wx[None, :])[:, :, None] ** 0.6
    out = p * m + r * (1 - m)
    if flat: low = cv2.GaussianBlur(out, (0, 0), w / flat); out = out - low + low.mean((0, 1))
    return out.clip(0, 255).astype(np.uint8)
def save(n, a): cv2.imwrite(os.path.join(OUT, n + ".png"), a); print("wrote", n, a.shape[1], a.shape[0])
st = load("stone-window-block2")
save("i5_stone", seamless(crop(st, 0.13, 0.12, 0.42, 0.33), (512, 512), 6))
iz = load("old-izakaya-facade")
save("i5_char", seamless(crop(iz, 0.72, 0.75, 0.99, 0.9), (512, 256), 0, "x"))
save("i5_plaster", seamless(crop(iz, 0.76, 0.385, 0.95, 0.47), (256, 256), 6))
m = load("mural-rainbow-wall"); save("i5_mural", cv2.resize(crop(m, 0.02, 0.1, 0.99, 0.98), (1024, 512), interpolation=cv2.INTER_AREA))
save("i5_glaze", seamless(crop(load("ceramic-gallery"), 0.2, 0.56, 0.55, 0.64), (256, 256), 0))
save("i5_paving", seamless(crop(load("station-plaza-barrels"), 0.05, 0.72, 0.95, 0.98), (512, 512), 6))
