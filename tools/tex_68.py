"""Textures for queue item 68 (photos/inspo3/).
  canvas_art_bluehair / _eyeshroom / _nopurple / _splash / _collage   the user's five paintings, as-is (cropped to
      the painting, levels untouched)
  i3_soot      soot-splattered white plaster, seamless      i3_cloth   the painted purple/yellow tablecloth, seamless
  i3_curry     shredded chicken curry surface, seamless      i3_naan    the naan's blistered crust, seamless
"""
import os, numpy as np, cv2
from PIL import Image
OUT = "assets/textures"; ROT = {3: Image.ROTATE_180, 6: Image.ROTATE_270, 8: Image.ROTATE_90}
def load(n):
    im = Image.open(f"photos/inspo3/{n}.jpg"); o = im.getexif().get(274, 1)
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
art("art-blue-hair-portrait", "canvas_art_bluehair")
art("art-eye-mushrooms", "canvas_art_eyeshroom")
art("art-purple-face-no", "canvas_art_nopurple")
art("art-yellow-black-splash", "canvas_art_splash")
art("art-yellow-face-collage", "canvas_art_collage")
save("i3_soot", seamless(crop(load("soot-plaster-texture"), 0.05, 0.05, 0.95, 0.75), (512, 512), 6))
save("i3_cloth", seamless(crop(load("chicken-curry-naan"), 0.0, 0.0, 0.13, 0.13), (256, 256), 0))
save("i3_curry", seamless(crop(load("chicken-curry-bowl"), 0.15, 0.3, 0.75, 0.75), (512, 512), 10))
save("i3_naan", seamless(crop(load("chicken-curry-naan"), 0.74, 0.3, 0.92, 0.5), (256, 256), 6))
