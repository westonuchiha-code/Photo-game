"""Textures for queue item 67 (photos/misc3/canal-path-bridge.jpg).
  cn_path   the mossy gravel walkway, seamless      cn_wall   the channel's ribbed concrete wall, seamless along x
  cn_water  the shallow dark water over silt, seamless
"""
import os, numpy as np, cv2
OUT = "assets/textures"
def seamless(p, size, flat=8, axis="both"):
    p = cv2.resize(p, size, interpolation=cv2.INTER_AREA).astype(np.float32); w, h = size
    r = np.roll(np.roll(p, h // 2 if axis != "x" else 0, 0), w // 2 if axis != "y" else 0, 1)
    wx = np.minimum(np.minimum(np.arange(w), w - 1 - np.arange(w)) / (w / 2), 1) if axis != "y" else np.ones(w)
    wy = np.minimum(np.minimum(np.arange(h), h - 1 - np.arange(h)) / (h / 2), 1) if axis != "x" else np.ones(h)
    m = np.minimum(wy[:, None], wx[None, :])[:, :, None] ** 0.6
    out = p * m + r * (1 - m)
    if flat: low = cv2.GaussianBlur(out, (0, 0), w / flat); out = out - low + low.mean((0, 1))
    return out.clip(0, 255).astype(np.uint8)
def save(n, a): cv2.imwrite(os.path.join(OUT, n + ".png"), a); print("wrote", n)
im = cv2.imread("photos/misc3/canal-path-bridge.jpg"); H, W = im.shape[:2]
c = lambda x0, y0, x1, y1: im[int(y0 * H):int(y1 * H), int(x0 * W):int(x1 * W)]
save("cn_path", seamless(c(0.02, 0.66, 0.58, 0.98), (512, 512)))
save("cn_wall", seamless(c(0.8, 0.405, 0.99, 0.47), (512, 128), 0, "x"))
save("cn_water", seamless(c(0.79, 0.58, 0.99, 0.8), (512, 512), 6))
