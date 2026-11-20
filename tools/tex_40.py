"""Textures for queue item 40 (photos/trail/). Run from the repo root: python3 tools/tex_40.py
Ground tiles are crops of the photos' near ground (least foreshortened), made seamless by a half-offset
cross-fade; the bark is a vertical strip; the stone relief is the photo itself on a carved slab.
"""
import os, numpy as np, cv2
from PIL import Image, ImageOps
OUT = "assets/textures"
def load(n): return cv2.cvtColor(np.asarray(ImageOps.exif_transpose(Image.open(f"photos/trail/{n}")).convert("RGB")), cv2.COLOR_RGB2BGR)
def crop(im, f): h, w = im.shape[:2]; return im[int(f[1] * h):int(f[3] * h), int(f[0] * w):int(f[2] * w)]
def seamless(p, size):
    p = cv2.resize(p, size, interpolation=cv2.INTER_AREA).astype(np.float32); W, H = size
    r = np.roll(np.roll(p, H // 2, 0), W // 2, 1)
    wx = np.minimum(np.minimum(np.arange(W), W - 1 - np.arange(W)) / (W / 2), 1); wy = np.minimum(np.minimum(np.arange(H), H - 1 - np.arange(H)) / (H / 2), 1)
    m = np.minimum(wy[:, None], wx[None, :])[:, :, None] ** 0.6
    out = p * m + r * (1 - m)
    # flatten big lighting gradients (the model's lighting supplies them)
    low = cv2.GaussianBlur(out, (0, 0), W / 6); out = out - low + low.mean((0, 1))
    return out.clip(0, 255).astype(np.uint8)
def save(name, a): cv2.imwrite(os.path.join(OUT, name), a); print("wrote", name)
save("tr_leaf.png", seamless(crop(load("trail-leaf-pebbles.jpg"), (0.08, 0.72, 0.92, 0.98)), (512, 512)))
save("tr_moss.png", seamless(crop(load("moss-cobble-path.jpg"), (0.05, 0.62, 0.62, 0.9)), (512, 512)))
save("tr_cobble.png", seamless(crop(load("cobble-stone-steps.jpg"), (0.02, 0.8, 0.98, 1.0)), (512, 256)))
save("tr_clay.png", seamless(crop(load("mossy-trunks-roots.jpg"), (0.25, 0.8, 0.85, 1.0)), (512, 512)))
save("tr_gravel.png", seamless(crop(load("junk-pile-forest-path.jpg"), (0.02, 0.86, 0.36, 1.0)), (512, 512)))
b = crop(load("giant-cedar-sacred-rope.jpg"), (0.43, 0.58, 0.6, 0.85)); b = cv2.resize(b, (256, 1024), interpolation=cv2.INTER_AREA).astype(np.float32)
b = b / (b.mean(0, keepdims=True) + 1) * b.mean((0, 1), keepdims=True); b = np.concatenate([b, b[:, ::-1]], 1)
save("tr_cedar.png", b.clip(0, 255).astype(np.uint8))
rel = crop(load("stone-guardian-relief.webp"), (0.29, 0.0, 0.69, 0.74)); rel = cv2.resize(rel, (512, 768), interpolation=cv2.INTER_AREA)
save("tr_relief.png", rel)
