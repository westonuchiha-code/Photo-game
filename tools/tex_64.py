"""Textures for queue item 64 (photos/random/).
  rs_tile    the corner store's grey square tiles: colours + grain from konbini-night2, grid rebuilt square
  rs_skin    the aircraft nose's weathered dark-grey paint over metal (aircraft-nose-carport), seamless
"""
import os, numpy as np, cv2
OUT = "assets/textures"
def seamless(p, size, flat=8):
    p = cv2.resize(p, size, interpolation=cv2.INTER_AREA).astype(np.float32); w, h = size
    r = np.roll(np.roll(p, h // 2, 0), w // 2, 1)
    wx = np.minimum(np.minimum(np.arange(w), w - 1 - np.arange(w)) / (w / 2), 1); wy = np.minimum(np.minimum(np.arange(h), h - 1 - np.arange(h)) / (h / 2), 1)
    m = np.minimum(wy[:, None], wx[None, :])[:, :, None] ** 0.6
    out = p * m + r * (1 - m)
    if flat: low = cv2.GaussianBlur(out, (0, 0), w / flat); out = out - low + low.mean((0, 1))
    return out.clip(0, 255).astype(np.uint8)
def save(n, a): cv2.imwrite(os.path.join(OUT, n + ".png"), a); print("wrote", n)
k = cv2.imread("photos/random/konbini-night2.jpg")
pier = k[780:1000, 120:200].astype(np.float32)               # tiles below the alarm bell
tile_c = np.percentile(pier.reshape(-1, 3), 70, axis=0) * 1.1; grout_c = np.percentile(pier.reshape(-1, 3), 8, axis=0)
# rebuild the regular grid (the photo's is tilted and has the alarm bell on it): 4 x 4 tiles per texture, each tile
# a touch different in tone, the photo's own grain on top
N, T = 4, 96; img = np.zeros((N * T, N * T, 3), np.float32); rng = np.random.default_rng(64)
grain = cv2.resize(k[800:980, 130:190], (N * T, N * T)).astype(np.float32); grain = grain - cv2.GaussianBlur(grain, (0, 0), 1.5)
for r in range(N):
    for c in range(N):
        img[r * T:(r + 1) * T, c * T:(c + 1) * T] = tile_c * rng.uniform(0.93, 1.06)
        g = np.linspace(1.04, 0.96, T)[:, None, None]; img[r * T:(r + 1) * T, c * T:(c + 1) * T] *= g   # slight glaze shading
img += grain * 0.5
for q in range(N): img[q * T:q * T + 4, :] = grout_c; img[:, q * T:q * T + 4] = grout_c
save("rs_tile", img.clip(0, 255).astype(np.uint8))
a = cv2.imread("photos/random/aircraft-nose-carport.jpg")
save("rs_skin", seamless(a[665:945, 700:1070], (512, 384), 6))
