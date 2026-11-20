"""Textures for queue item 46 (photos/grime/burl-veneer*). Run from the repo root: python3 tools/tex_46.py
  burl.png      the photo's burl, colour-flattened and four-way bookmatched (the way burl veneer is actually
                laid), which also makes it tile seamlessly
  burl_n.png    a normal map from its dark figure lines (pores/ripples read in raking light)
"""
import os, numpy as np, cv2
from PIL import Image, ImageOps
OUT = "assets/textures"
im = cv2.cvtColor(np.asarray(ImageOps.exif_transpose(Image.open("photos/grime/burl-veneer9.jpg")).convert("RGB")), cv2.COLOR_RGB2BGR)
h, w = im.shape[:2]
p = cv2.resize(im[int(0.05 * h):int(0.95 * h), int(0.04 * w):int(0.96 * w)], (512, 512), interpolation=cv2.INTER_AREA).astype(np.float32)
low = cv2.GaussianBlur(p, (0, 0), min(p.shape[:2]) / 1.5); p = (p - low) * 1.25 + low.mean((0, 1))      # flatten the glare / falloff
p = p.clip(0, 255).astype(np.uint8)
bm = np.concatenate([np.concatenate([p, p[:, ::-1]], 1), np.concatenate([p[::-1], p[::-1, ::-1]], 0 if False else 1)], 0)
cv2.imwrite(os.path.join(OUT, "burl.png"), bm)
gy = cv2.GaussianBlur(cv2.cvtColor(bm, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255, (0, 0), 1.5)
dx = cv2.Sobel(gy, cv2.CV_32F, 1, 0, ksize=3) * 2.5; dy = cv2.Sobel(gy, cv2.CV_32F, 0, 1, ksize=3) * 2.5
n = np.dstack([np.ones_like(gy), -dy, -dx]); n /= np.linalg.norm(n, axis=2, keepdims=True)
cv2.imwrite(os.path.join(OUT, "burl_n.png"), ((n * 0.5 + 0.5) * 255).astype(np.uint8))
print("wrote burl, burl_n")
