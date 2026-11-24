"""Face map for a character head (body97.js) from a straight-on photo, plus a back-of-head map.
  python3 tools/make_face.py <name> <front photo> --eyes X1,X2,Y --mouth Y [--view W] [--side <side photo> --hat x0,y0,x1,y1 --hair x0,y0,x1,y1 --neck x0,y0,x1,y1] [--outline x,y x,y ...]
Writes assets/textures/np_face_<name>.png and np_back_<name>.png (512 x 512 each), and prints the sampled skin colour.

The head's face region is a flat front projection (ATLAS.face in body97.js): across it is 0.168 m of head width, up it
is 0.241 m from just under the chin to the crown, with the eyes 0.128 m and the mouth 0.046 m above the chin. So the
map is a straight crop of the photo, scaled across by the distance between the eyes (0.062 m on the head) and up by
the eyes-to-mouth distance (0.082 m). --outline is the head's outline in photo pixels: everything outside it
(the background) is replaced by mirroring what is just inside, so no background wraps onto the sides of the head.
"""
import argparse, numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageOps
ap = argparse.ArgumentParser(); ap.add_argument('name'); ap.add_argument('front'); ap.add_argument('--eyes', required=True); ap.add_argument('--mouth', required=True, type=float)
ap.add_argument('--side'); ap.add_argument('--hat'); ap.add_argument('--hair'); ap.add_argument('--neck'); ap.add_argument('--outline', nargs='*'); ap.add_argument('--hatgain', type=float, default=1.0, help='darken (<1) or lighten the hat patch'); ap.add_argument('--view', type=float, default=0, help='width of the picture the coordinates were read from (if it was a scaled-down view of the photo)'); a = ap.parse_args()
S = 512; W_M, H_M, EYE, MOUTH, BELOW = 0.168, 0.241, 0.128, 0.046, 0.012
load = lambda f: ImageOps.exif_transpose(Image.open(f)).convert('RGB')   # (phone photos are stored sideways with a rotation tag)
im = load(a.front); K = im.size[0] / a.view if a.view else 1
x1, x2, ey = (float(v) * K for v in a.eyes.split(',')); a.mouth *= K; cx = (x1 + x2) / 2
sx = abs(x2 - x1) / 0.062; sy = (a.mouth - ey) / (EYE - MOUTH)
box = [cx - W_M / 2 * sx, ey - (H_M - BELOW - EYE) * sy, cx + W_M / 2 * sx, ey + (EYE + BELOW) * sy]
arr = np.asarray(im).astype(np.float32)
if a.outline:   # background -> mirrored head
    pts = [tuple(float(v) * K for v in p.split(',')) for p in a.outline]; m = Image.new('L', im.size, 0); ImageDraw.Draw(m).polygon(pts, fill=255); mask = np.asarray(m) > 0
    out = arr.copy()
    for y in range(arr.shape[0]):
        xs = np.nonzero(mask[y])[0]
        if len(xs) < 4: continue
        l, r = xs[0], xs[-1]
        for x in range(0, l): out[y, x] = arr[y, min(r, l + (l - x))]
        for x in range(r + 1, arr.shape[1]): out[y, x] = arr[y, max(l, r - (x - r))]
    arr = out
face = Image.fromarray(arr.clip(0, 255).astype(np.uint8)).crop([int(round(v)) for v in box]).resize((S, S), Image.LANCZOS)
face.save(f'assets/textures/np_face_{a.name}.png')
# skin colour: the cheek, a little below and outside each eye
ck = np.concatenate([arr[int(ey + 0.035 * sy):int(ey + 0.05 * sy), int(x + s * 0.012 * sx - 12):int(x + s * 0.012 * sx + 12)].reshape(-1, 3) for x, s in ((x1, -1), (x2, 1))]); skin = np.median(ck, axis=0)
print('skin #%02x%02x%02x' % tuple(int(v) for v in skin), 'scale px/m', round(sx), round(sy), 'crop', [int(v) for v in box])
# back of the head: hat (or hair) over the top, hair at the nape, neck skin under it
back = Image.new('RGB', (S, S), tuple(int(v) for v in skin))
if a.side:
    sd = load(a.side); K2 = sd.size[0] / a.view if a.view else 1; patch = lambda s: sd.crop(tuple(int(float(v) * K2) for v in s.split(',')))
    def fill(p, y0, y1):
        t = p.resize((S // 2, S // 2), Image.LANCZOS)
        for yy in range(y0, y1, S // 2):
            for xx in range(0, S, S // 2): back.paste(t.crop((0, 0, S // 2, min(S // 2, y1 - yy))), (xx, yy))
    if a.neck: fill(patch(a.neck), 0, S)
    hair_top = int(S * (1 - (0.085 + BELOW) / H_M)); hat_bot = int(S * (1 - (0.10 + BELOW) / H_M)) if a.hat else 0
    if a.hair: fill(patch(a.hair), hat_bot, int(S * (1 - (0.03 + BELOW) / H_M)))
    if a.hat: fill(patch(a.hat).point(lambda v: int(v * a.hatgain)), 0, hat_bot + 8)
    back = back.filter(ImageFilter.GaussianBlur(1.2))
back.save(f'assets/textures/np_back_{a.name}.png')
