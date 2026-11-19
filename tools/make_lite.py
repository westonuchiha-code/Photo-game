"""Writes assets/textures_lite/: every texture scaled so its longer side is at most 512 px (phones/tablets
load these; see src/texcache.js). Run after changing textures: python3 tools/make_lite.py"""
import os
from PIL import Image
src, dst = "assets/textures", "assets/textures_lite"
os.makedirs(dst, exist_ok=True)
n = 0
for f in os.listdir(src):
    if not f.lower().endswith((".png", ".jpg", ".jpeg")):
        continue
    im = Image.open(os.path.join(src, f))
    w, h = im.size
    k = 512 / max(w, h)
    if k < 1:
        im = im.resize((max(1, round(w * k)), max(1, round(h * k))), Image.LANCZOS)
    im.save(os.path.join(dst, f), optimize=True)
    n += 1
print("wrote", n, "lite textures")
