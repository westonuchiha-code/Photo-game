"""Textures for queue item 57, the dentist waiting room (photos/dentist/dentist01..15; some stored sideways).
  dn_carpet    herringbone charcoal carpet (dentist08), seamless
  dn_walnut    reception counter top (dentist07, under the tooth figurine), seamless along the grain
  dn_tan       tan leather (sofa seat, dentist06)   dn_grey   grey leather (lounge chair seat, dentist03)
  dn_ribbed    ribbed-glass cabinet door panel (dentist10)
  dn_forest    the framed forest photo above the coffee cabinet (dentist10, as much as the photo shows)
  dn_cube      wood cube side table face (dentist04)   dn_rustic  wire coffee table's rustic top (dentist08)
  dn_cow       the cow-painted pumpkin (dentist09)     dn_toothface  the tooth figurine's face (dentist07)
"""
import os, numpy as np, cv2
from PIL import Image
OUT = "assets/textures"
ROT = {3: Image.ROTATE_180, 6: Image.ROTATE_270, 8: Image.ROTATE_90}
def load(i):
    im = Image.open(f"photos/dentist/dentist{i:02d}.jpg"); o = im.getexif().get(274, 1)
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
def save(n, a): cv2.imwrite(os.path.join(OUT, n + ".png"), a); print("wrote", n)
d08, d07, d06, d04, d10, d09 = load(8), load(7), load(6), load(4), load(10), load(9)
save("dn_carpet", seamless(crop(d08, 0.05, 0.72, 0.95, 0.98), (512, 512)))
save("dn_walnut", seamless(crop(d07, 0.02, 0.66, 0.98, 0.84), (512, 256), 0))
save("dn_tan", seamless(crop(d06, 0.42, 0.40, 0.58, 0.50), (256, 256)))
save("dn_grey", seamless(crop(load(3), 0.44, 0.33, 0.58, 0.47), (256, 256)))
save("dn_ribbed", cv2.resize(crop(d10, 0.22, 0.53, 0.40, 0.64), (256, 256), interpolation=cv2.INTER_AREA))
save("dn_forest", cv2.resize(crop(d10, 0.0, 0.0, 0.245, 0.168), (384, 512), interpolation=cv2.INTER_AREA))
cb = seamless(crop(d04, 0.40, 0.548, 0.52, 0.578), (256, 256), 0).astype(np.float32)   # the shaded face: grain kept, re-lit to the sunny face's honey tone
save("dn_cube", (cb * (np.array([70, 140, 205]) / cb.mean((0, 1)))).clip(0, 255).astype(np.uint8))
save("dn_rustic", seamless(cv2.resize(crop(d08, 0.62, 0.43, 0.69, 0.48), (512, 256)), (512, 512), 0))
save("dn_cow", cv2.resize(crop(d09, 0.64, 0.43, 0.97, 0.63), (512, 256), interpolation=cv2.INTER_AREA))
save("dn_toothface", cv2.resize(crop(d07, 0.5, 0.19, 0.78, 0.36), (256, 160), interpolation=cv2.INTER_AREA))
