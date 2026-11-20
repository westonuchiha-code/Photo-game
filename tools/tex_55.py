"""Textures for queue item 55 (photos/character/striding-moss-creature.jpg; stored sideways, turned upright first).
  mc_moss.png   the creature's crusty moss/bark skin, cut from the top of its egg body, made seamless
  mc_mound.png  the bright model-railway grass mound with yellow flower flecks, seamless
"""
import os, numpy as np, cv2
from PIL import Image
OUT = "assets/textures"
im = cv2.cvtColor(np.asarray(Image.open("photos/character/striding-moss-creature.jpg").convert("RGB").transpose(Image.ROTATE_270)), cv2.COLOR_RGB2BGR)
H, W = im.shape[:2]
def crop(a, b): return im[int(b[1] * H):int(b[3] * H), int(b[0] * W):int(b[2] * W)]
def seamless(p, size, flat=True):
    p = cv2.resize(p, size, interpolation=cv2.INTER_AREA).astype(np.float32); w, h = size
    r = np.roll(np.roll(p, h // 2, 0), w // 2, 1)
    wx = np.minimum(np.minimum(np.arange(w), w - 1 - np.arange(w)) / (w / 2), 1); wy = np.minimum(np.minimum(np.arange(h), h - 1 - np.arange(h)) / (h / 2), 1)
    m = np.minimum(wy[:, None], wx[None, :])[:, :, None] ** 0.6
    out = p * m + r * (1 - m)
    if flat: low = cv2.GaussianBlur(out, (0, 0), w / 6); out = out - low + low.mean((0, 1))
    return out.clip(0, 255).astype(np.uint8)
def save(n, a): cv2.imwrite(os.path.join(OUT, n), a); print("wrote", n)
# body skin: the upper body between the antenna root and the right edge, above the mouth
save("mc_moss.png", seamless(im[int(0.31 * H):int(0.45 * H), int(0.49 * W):int(0.78 * W)], (512, 512)))
# mound grass
save("mc_mound.png", seamless(im[int(0.88 * H):int(0.995 * H), int(0.2 * W):int(0.6 * W)], (512, 512)))
