"""Textures for queue item 58, the dentist treatment room (photos/dentist/operatory01..09, stored sideways).
  op_floor    light-wood plank floor (operatory01), seamless       op_leather  taupe chair upholstery (operatory08)
  op_tan      tan bucket-stool leather (operatory03)                op_block    butcher-block top of the tool chest (operatory04)
  op_window   the trees through the room's window (operatory01)
"""
import os, numpy as np, cv2
from PIL import Image
OUT = "assets/textures"
def load(i): return cv2.cvtColor(np.asarray(Image.open(f"photos/dentist/operatory{i:02d}.jpg").transpose(Image.ROTATE_270).convert("RGB")), cv2.COLOR_RGB2BGR)
def crop(im, x0, y0, x1, y1): H, W = im.shape[:2]; return im[int(y0 * H):int(y1 * H), int(x0 * W):int(x1 * W)]
def seamless(p, size, flat=8):
    p = cv2.resize(p, size, interpolation=cv2.INTER_AREA).astype(np.float32); w, h = size
    r = np.roll(np.roll(p, h // 2, 0), w // 2, 1)
    wx = np.minimum(np.minimum(np.arange(w), w - 1 - np.arange(w)) / (w / 2), 1); wy = np.minimum(np.minimum(np.arange(h), h - 1 - np.arange(h)) / (h / 2), 1)
    m = np.minimum(wy[:, None], wx[None, :])[:, :, None] ** 0.6
    out = p * m + r * (1 - m)
    if flat: low = cv2.GaussianBlur(out, (0, 0), w / flat); out = out - low + low.mean((0, 1))
    return out.clip(0, 255).astype(np.uint8)
def save(n, a): cv2.imwrite(os.path.join(OUT, n + ".png"), a); print("wrote", n)
o1, o3, o4, o8 = load(1), load(3), load(4), load(8)
save("op_floor", seamless(crop(o1, 0.0, 0.64, 0.33, 0.84), (512, 512)))
save("op_leather", seamless(crop(o8, 0.53, 0.61, 0.66, 0.655), (256, 256)))
save("op_tan", seamless(crop(o3, 0.36, 0.43, 0.50, 0.47), (256, 256)))
save("op_block", seamless(crop(o4, 0.05, 0.59, 0.95, 0.7), (512, 256), 0))
save("op_window", cv2.resize(crop(o1, 0.2, 0.01, 0.64, 0.17), (512, 300), interpolation=cv2.INTER_AREA))
