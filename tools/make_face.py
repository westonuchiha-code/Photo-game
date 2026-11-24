"""Head maps for a character (body97.js) from a straight-on photo and a profile photo.
  python3 tools/make_face.py <name> <front photo> --eyes X1,X2,Y --mouth Y
        --side <profile photo, nose pointing right> --side-eye-y Y --side-mouth-y Y --side-nose-x X --side-back-x X
        [--view W] [--hat x0,y0,x1,y1 --hatgain G] [--hair x0,y0,x1,y1] [--neck x0,y0,x1,y1]
Writes assets/textures/np_face_<name>.png (front half of the head) and np_back_<name>.png (back half), 512 x 512 each,
and prints the sampled skin colour.

The head's two texture regions are half-cylinder unwraps (see body97.js): across each is 180 degrees round the head,
up each is 0.241 m from just under the chin to the crown (eyes 0.128 m and mouth 0.046 m above the chin).
For every texel this works out where that point of the head sits in 3D (from the head's ring measurements, HEAD
below, a copy of body97.js), then looks it up in the photos:
  - the front photo for the middle of the face (scaled across by the eye spacing, 0.062 m on the head, and up by
    the eyes-to-mouth distance, 0.082 m);
  - the profile photo for the sides and round toward the back (scaled front-to-back between the nose tip and the back
    of the head, up by its own eye + mouth heights); the same profile is mirrored onto both sides;
  - plain patches (hat, hair, neck) cut from the profile photo for the strip down the very back, which no photo sees.
--view: the width of the picture the coordinates were read from, if that was a scaled-down view of the photo.
Phone photos are stored sideways with a rotation tag: it is applied on load.
"""
import argparse, numpy as np
from PIL import Image, ImageFilter, ImageOps
ap = argparse.ArgumentParser(); ap.add_argument('name'); ap.add_argument('front'); ap.add_argument('--eyes', required=True); ap.add_argument('--mouth', required=True, type=float)
ap.add_argument('--side', required=True); ap.add_argument('--side-eye-y', type=float, required=True); ap.add_argument('--side-mouth-y', type=float, required=True); ap.add_argument('--side-nose-x', type=float, required=True); ap.add_argument('--side-back-x', type=float, required=True)
ap.add_argument('--hat'); ap.add_argument('--hatgain', type=float, default=1.0); ap.add_argument('--hair'); ap.add_argument('--neck'); ap.add_argument('--view', type=float, default=0); a = ap.parse_args()
S = 512; H_M, EYE, MOUTH, BELOW = 0.241, 0.128, 0.046, 0.012
HEAD = np.array([[-0.012, 0.04, 0.03, 0.05], [0.0, 0.046, 0.066, 0.052], [0.014, 0.055, 0.084, 0.056], [0.032, 0.063, 0.092, 0.064], [0.05, 0.069, 0.095, 0.074], [0.068, 0.073, 0.094, 0.084], [0.086, 0.076, 0.093, 0.092], [0.104, 0.078, 0.093, 0.098],
                 [0.122, 0.079, 0.094, 0.102], [0.14, 0.079, 0.097, 0.104], [0.158, 0.078, 0.098, 0.104], [0.176, 0.075, 0.096, 0.102], [0.194, 0.068, 0.088, 0.096], [0.21, 0.056, 0.072, 0.082], [0.222, 0.036, 0.046, 0.054], [0.229, 0.0, 0.0, 0.0]])
load = lambda f: np.asarray(ImageOps.exif_transpose(Image.open(f)).convert('RGB')).astype(np.float32)
F = load(a.front); K = F.shape[1] / a.view if a.view else 1; SD = load(a.side); K2 = SD.shape[1] / a.view if a.view else 1
x1, x2, ey = (float(v) * K for v in a.eyes.split(',')); cx = (x1 + x2) / 2; sx = abs(x2 - x1) / 0.062; sy = (a.mouth * K - ey) / (EYE - MOUTH)
sey = a.side_eye_y * K2; ssy = (a.side_mouth_y * K2 - sey) / (EYE - MOUTH); Z_NOSE, Z_BACK = 0.129, -0.098
ssz = (a.side_nose_x - a.side_back_x) * K2 / (Z_NOSE - Z_BACK); sz0 = a.side_nose_x * K2 - Z_NOSE * ssz
def sample(img, px, py):   # bilinear, clamped at the edges
    h, w = img.shape[:2]; px = np.clip(px, 0, w - 1.001); py = np.clip(py, 0, h - 1.001); x0 = px.astype(int); y0 = py.astype(int); fx = (px - x0)[..., None]; fy = (py - y0)[..., None]
    return (img[y0, x0] * (1 - fx) + img[y0, x0 + 1] * fx) * (1 - fy) + (img[y0 + 1, x0] * (1 - fx) + img[y0 + 1, x0 + 1] * fx) * fy
ss = lambda e0, e1, x: (lambda t: t * t * (3 - 2 * t))(np.clip((x - e0) / (e1 - e0), 0, 1))
u, v = np.meshgrid((np.arange(S) + 0.5) / S, 1 - (np.arange(S) + 0.5) / S); ang = (u - 0.5) * np.pi; dy = v * H_M - BELOW
rx, rf, rb = (np.interp(dy, HEAD[:, 0], HEAD[:, k]) for k in (1, 2, 3)); yF = ey - (dy - EYE) * sy; yS = sey - (dy - EYE) * ssy
# front half
front = sample(F, cx + rx * np.sin(ang) * sx, yF); side = sample(SD, sz0 + (rf * np.cos(ang) + 0.006) * ssz, yS)
w = ss(np.radians(44), np.radians(60), np.abs(ang))[..., None]; face = front * (1 - w) + side * w
Image.fromarray(face.clip(0, 255).astype(np.uint8)).save(f'assets/textures/np_face_{a.name}.png')
ck = np.concatenate([F[int(ey + 0.035 * sy):int(ey + 0.05 * sy), int(x + s * 0.012 * sx - 12):int(x + s * 0.012 * sx + 12)].reshape(-1, 3) for x, s in ((x1, -1), (x2, 1))]); skin = np.median(ck, axis=0)
print('skin #%02x%02x%02x' % tuple(int(c) for c in skin))
# back half: the profile round the sides, plain patches down the middle of the back
fill = Image.new('RGB', (S, S), tuple(int(c) for c in skin)); sdi = Image.fromarray(SD.astype(np.uint8)); patch = lambda s: sdi.crop(tuple(int(float(c) * K2) for c in s.split(',')))
def tile(p, y0, y1):
    t = p.resize((S // 2, S // 2), Image.LANCZOS)
    for yy in range(y0, y1, S // 2):
        for xx in range(0, S, S // 2): fill.paste(t.crop((0, 0, S // 2, min(S // 2, y1 - yy))), (xx, yy))
row = lambda d: int(S * (1 - (d + BELOW) / H_M))
if a.neck: tile(patch(a.neck), 0, S)
if a.hair: tile(patch(a.hair), row(0.10) if a.hat else 0, row(0.03))
if a.hat: tile(patch(a.hat).point(lambda c: int(c * a.hatgain)), 0, row(0.10) + 8)
fill = np.asarray(fill.filter(ImageFilter.GaussianBlur(1.2))).astype(np.float32)
sideB = sample(SD, sz0 + (-rb * np.cos(ang) + 0.006) * ssz, yS); wp = (1 - ss(np.radians(38), np.radians(66), np.abs(ang)))[..., None]
Image.fromarray((sideB * (1 - wp) + fill * wp).clip(0, 255).astype(np.uint8)).save(f'assets/textures/np_back_{a.name}.png')
