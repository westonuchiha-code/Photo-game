"""Sign faces with made-up text, painted onto weathered panels taken from the photos.

Usage:  python3 tools/make_signs.py

The photos supply the panel material (colour, grime, stains); the words are
generic and drawn here, so no real business names end up in the game.
"""
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

OUT = "assets/textures"
FONT_B = "assets/fonts/LiberationSans-Bold.ttf"
rng = np.random.default_rng(3)


def blank_panel(src_path, size, crop=None, text_mask_thresh=110):
    """Remove the old lettering from a photographed sign face: dark/red text
    pixels are replaced by a heavily blurred copy of the surrounding panel,
    keeping the stains and grime everywhere else."""
    im = Image.open(src_path).convert("RGB")
    if crop:
        im = im.crop(crop)
    im = im.resize(size, Image.LANCZOS)
    a = np.asarray(im).astype(np.float32)
    lum = a @ [0.299, 0.587, 0.114]
    red = (a[..., 0] - a[..., 1]) > 45
    mask = (lum < text_mask_thresh) | red
    m = Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(9))
    w = (np.asarray(m) == 0).astype(np.float32)
    acc = np.zeros_like(a)
    for c in range(3):
        ch = Image.fromarray(np.clip(a[..., c] * w, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(25))
        acc[..., c] = np.asarray(ch).astype(np.float32)
    wb = np.asarray(Image.fromarray((w * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(25))).astype(np.float32) / 255
    fill = acc / np.maximum(wb[..., None], 1e-3)
    fill += rng.normal(0, 4, fill.shape)  # a little grain so fills don't look airbrushed
    soft = np.asarray(m.filter(ImageFilter.GaussianBlur(3))).astype(np.float32)[..., None] / 255
    clean = a * (1 - soft) + fill * soft
    return Image.fromarray(np.clip(clean, 0, 255).astype(np.uint8))


def draw_line(img, text, y, height, color, width_frac=None, font=FONT_B):
    """Draw centred text `height` px tall, optionally squeezed to a width."""
    d = ImageDraw.Draw(img)
    f = ImageFont.truetype(font, height)
    box = d.textbbox((0, 0), text, font=f)
    tw, th = box[2] - box[0], box[3] - box[1]
    layer = Image.new("L", (tw + 4, th + 4), 0)
    ImageDraw.Draw(layer).text((2 - box[0], 2 - box[1]), text, font=f, fill=255)
    if width_frac:
        layer = layer.resize((int(img.width * width_frac), layer.height), Image.LANCZOS)
    x = (img.width - layer.width) // 2
    # slightly worn paint: knock random specks out of the lettering
    wear = (rng.random((layer.height, layer.width)) > 0.06).astype(np.uint8) * 255
    layer = Image.fromarray(np.minimum(np.asarray(layer), wear))
    img.paste(Image.new("RGB", layer.size, color), (x, y), layer.filter(ImageFilter.GaussianBlur(0.6)))


# ---- Rental sign (panel from the Two Rivers photo, text made up)
face = blank_panel(os.path.join(OUT, "two_rivers_face.png"), (600, 540), crop=(0, 0, 600, 505))  # skip the frame edge
ink, red = (52, 50, 48), (196, 70, 62)
draw_line(face, "1180", 14, 46, ink)
draw_line(face, "CEDAR", 88, 62, red, 0.42)
draw_line(face, "555-0148", 180, 64, red, 0.5)
draw_line(face, "RENT FROM", 278, 46, ink, 0.48)
draw_line(face, "MAPLE CREEK", 338, 70, ink, 0.86)
draw_line(face, "PROPERTIES", 430, 70, ink, 0.86)
face.save(os.path.join(OUT, "rental_sign_face.png"))
print("wrote rental_sign_face.png")
