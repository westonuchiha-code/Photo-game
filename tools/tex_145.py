"""Textures for 145, from photos/1000137348..357 and 10000751xx..86095. Surfaces from the photos; the owner's own
drawings and notes used as they are (cut from the paper); everyone else's names and logos are replaced on the models.
  python3 tools/tex_145.py"""
import numpy as np, cv2
from PIL import Image, ImageOps
_s = open('tools/tex_131.py').read(); exec(_s[_s.index('import os'):_s.index('for n, name, box')]); exec(_s[_s.index('def rgba'):_s.index('# the tar-sealed crack')])
def load(n): return cv2.cvtColor(np.asarray(ImageOps.exif_transpose(Image.open(f"photos/{n}.jpg")).convert("RGB")), cv2.COLOR_RGB2BGR)
for n, name, box, size, flat, ns in [
    ("1000137348", "g145_siding_cedar", (0.0, 0.0, 1.0, 0.75), 1024, 5, 2.0),
    ("1000137354", "g145_counter_fleck", (0.0, 0.0, 1.0, 0.55), 1024, 0, 0.8),
    ("1000137355", "g145_counter_fleck_big", (0.0, 0.0, 1.0, 0.55), 1024, 0, 0.8),
    ("1000085982", "g145_tile_glitter", (0.62, 0.48, 0.98, 0.64), 1024, 4, 0.6),
    ("1000085893", "g145_concrete_dock", (0.62, 0.86, 0.98, 0.99), 1024, 6, 1.5),
    ("1000085893", "g145_freezer_wall", (0.62, 0.0, 0.92, 0.10), 1024, 5, 1.0),
    ("1000137357", "g145_floor_sealed", (0.15, 0.78, 0.85, 0.98), 1024, 5, 0.6)]:
    t = seam_margin(crop(load(n), *box), size, flat); save(name, t); save(name + "_n", lum_normal(t, ns, 1.0))
# the owner's drawings: graphite on white, cut out (the paper becomes clear), kept as drawn
for n, name, box in [("1000085868", "g145_drawing_man", (0.20, 0.20, 0.92, 0.82)), ("1000085870", "g145_drawing_bomb", (0.22, 0.36, 0.76, 0.86)), ("1000085869", "g145_drawing_cyclops", (0.30, 0.10, 0.92, 0.78)), ("1000085871", "g145_drawing_eye", (0.06, 0.02, 0.86, 0.98))]:
    a = crop(load(n), *box); s = 768 / max(a.shape[:2]); a = cv2.resize(a, (int(a.shape[1] * s), int(a.shape[0] * s)), interpolation=cv2.INTER_AREA); g = cv2.cvtColor(a, cv2.COLOR_BGR2GRAY).astype(np.float32); bg = cv2.GaussianBlur(g, (0, 0), 25)
    ink = np.clip((bg - g - 10) / 60, 0, 1); save(name, rgba(np.full_like(a, 40), ink))
# the owner's notes page and the note card: as photographed (the card's numbers are redrawn on the model)
p = crop(load("1000084199"), 0.02, 0.0, 1.0, 1.0); p = cv2.rotate(p, cv2.ROTATE_90_CLOCKWISE); p = cv2.resize(p, (768, int(768 * p.shape[0] / p.shape[1])), interpolation=cv2.INTER_AREA); save("g145_notes_page", p)
# the whiskered dragon on the pipe: its green, for the sculpted body
t = seam_margin(crop(load("1000075131"), 0.40, 0.39, 0.58, 0.55), 256, 3); save("g145_dragon_skin", t); save("g145_dragon_skin_n", lum_normal(t, 3.0, 0.8))
