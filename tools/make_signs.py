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


# ---- Cartoon burger poster (replaces the photographed ad in the framed poster)
def burger_poster(path, W=512, H=1280):
    img = Image.new("RGB", (W, H), (244, 226, 190))
    d = ImageDraw.Draw(img)
    # sunburst background
    cx, cy = W // 2, 620
    for i in range(24):
        a0, a1 = np.radians(i * 15), np.radians(i * 15 + 7.5)
        pts = [(cx, cy), (cx + 1400 * np.cos(a0), cy + 1400 * np.sin(a0)), (cx + 1400 * np.cos(a1), cy + 1400 * np.sin(a1))]
        d.polygon(pts, fill=(250, 200, 92))
    # header band
    d.rectangle((0, 0, W, 250), fill=(196, 52, 40))
    d.rectangle((0, 250, W, 262), fill=(40, 30, 28))
    f_big = ImageFont.truetype(FONT_B, 112)
    f_mid = ImageFont.truetype(FONT_B, 64)
    f_small = ImageFont.truetype(FONT_B, 40)

    def centred(text, y, font, fill, stroke=0, stroke_fill=(40, 30, 28)):
        b = d.textbbox((0, 0), text, font=font, stroke_width=stroke)
        d.text(((W - (b[2] - b[0])) / 2 - b[0], y), text, font=font, fill=fill, stroke_width=stroke, stroke_fill=stroke_fill)

    centred("BIG BUN", 22, f_big, (255, 236, 160), 6)
    centred("BURGERS", 140, f_mid, (255, 255, 255), 4)

    # the burger: outlined cartoon shapes, bottom to top
    ol = (40, 30, 28)
    def pill(box, fill, r):
        d.rounded_rectangle(box, r, fill=fill, outline=ol, width=8)
    pill((70, 800, 442, 880), (226, 150, 70), 34)                       # bottom bun
    d.polygon([(60, 770), (452, 770), (430, 805), (390, 790), (350, 812), (300, 792), (250, 815), (200, 792), (150, 812), (100, 790), (75, 805)], fill=(120, 190, 70), outline=ol)  # lettuce
    pill((62, 700, 450, 780), (110, 62, 40), 36)                        # patty
    d.polygon([(70, 690), (442, 690), (430, 740), (330, 715), (300, 760), (260, 712), (90, 735)], fill=(255, 200, 40), outline=ol)  # cheese drip
    pill((80, 655, 432, 700), (214, 58, 48), 20)                        # tomato
    d.chord((60, 490, 452, 820), 180, 360, fill=(232, 160, 74), outline=ol, width=8)  # top bun
    for sx, sy in [(160, 560), (230, 530), (300, 545), (370, 590), (250, 600), (120, 620), (390, 625)]:
        d.ellipse((sx - 9, sy - 5, sx + 9, sy + 5), fill=(255, 244, 210))  # sesame seeds
    # face on the bun
    d.ellipse((190, 590, 222, 625), fill=ol); d.ellipse((290, 590, 322, 625), fill=ol)
    d.ellipse((199, 596, 209, 607), fill=(255, 255, 255)); d.ellipse((299, 596, 309, 607), fill=(255, 255, 255))
    d.arc((225, 605, 290, 645), 20, 160, fill=ol, width=7)
    # price starburst
    sx, sy = 420, 360
    star = [(sx + (70 if i % 2 == 0 else 50) * np.cos(np.radians(i * 18)), sy + (70 if i % 2 == 0 else 50) * np.sin(np.radians(i * 18))) for i in range(20)]
    d.polygon(star, fill=(196, 52, 40), outline=ol)
    b = d.textbbox((0, 0), "$4", font=f_mid)
    d.text((sx - (b[2] - b[0]) / 2 - b[0], sy - (b[3] - b[1]) / 2 - b[1]), "$4", font=f_mid, fill=(255, 255, 255))
    # tagline + footer
    centred("STACKED", 930, f_mid, (196, 52, 40), 3, (255, 255, 255))
    centred("HOT & FRESH", 1010, f_small, (40, 30, 28))
    d.rectangle((0, 1140, W, H), fill=(40, 30, 28))
    centred("OPEN LATE", 1175, f_small, (255, 236, 160))
    img.save(path)
    print("wrote", os.path.basename(path))


burger_poster(os.path.join(OUT, "poster.png"))


# ---- Tire shop: hand-painted lettering on the white sign band + window ads
SERIF_B = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"
SERIF_BI = "/usr/share/fonts/truetype/freefont/FreeSerifBoldItalic.ttf"
NAVY, SIGN_RED = (32, 40, 92), (190, 52, 58)
for f in (SERIF_B, SERIF_BI):
    if os.path.exists(f):
        os.makedirs("assets/fonts", exist_ok=True)
        dst = os.path.join("assets/fonts", os.path.basename(f))
        if not os.path.exists(dst):
            Image  # fonts are copied so the script runs anywhere
            import shutil
            shutil.copy(f, dst)
SERIF_B = "assets/fonts/DejaVuSerif-Bold.ttf"
SERIF_BI = "assets/fonts/FreeSerifBoldItalic.ttf"


def wall_strip(w, h):
    tile = Image.open(os.path.join(OUT, "tire_wall.png")).convert("RGB")
    out = Image.new("RGB", (w, h))
    for x in range(0, w, tile.width):
        for y in range(0, h, tile.height):
            out.paste(tile, (x, y))
    return out


def paint(img, text, x, y, size, color, font=FONT_B, stroke=0, stroke_fill=NAVY, sx=1.0):
    """Hand-painted lettering: drawn on its own layer, optionally stretched,
    then worn (random specks) and pasted."""
    f = ImageFont.truetype(font, size)
    tmp = ImageDraw.Draw(img)
    b = tmp.textbbox((0, 0), text, font=f, stroke_width=stroke)
    tw, th = b[2] - b[0] + 8, b[3] - b[1] + 8
    rgb = Image.new("RGB", (tw, th), color)
    a = Image.new("L", (tw, th), 0)
    da = ImageDraw.Draw(a)
    da.text((4 - b[0], 4 - b[1]), text, font=f, fill=255, stroke_width=stroke)
    if stroke:
        st = Image.new("L", (tw, th), 0)
        ImageDraw.Draw(st).text((4 - b[0], 4 - b[1]), text, font=f, fill=255, stroke_width=stroke)
        inner = Image.new("L", (tw, th), 0)
        ImageDraw.Draw(inner).text((4 - b[0], 4 - b[1]), text, font=f, fill=255)
        rgb = Image.composite(Image.new("RGB", (tw, th), color), Image.new("RGB", (tw, th), stroke_fill), inner)
    if sx != 1.0:
        rgb = rgb.resize((int(tw * sx), th), Image.LANCZOS)
        a = a.resize((int(tw * sx), th), Image.LANCZOS)
    wear = (rng.random((a.height, a.width)) > 0.05).astype(np.uint8) * 255
    a = Image.fromarray(np.minimum(np.asarray(a), wear)).filter(ImageFilter.GaussianBlur(0.8))
    img.paste(rgb, (int(x), int(y)), a)
    return int(tw * sx)


# Front sign band: 18 m x 1.4 m -> 4096 x 320 (228 px per metre).
band = wall_strip(4096, 320)
PX = 4096 / 18
paint(band, "TIRE", 0.5 * PX, 40, 220, (30, 30, 34), SERIF_B, stroke=6, stroke_fill=(240, 240, 236), sx=0.95)
paint(band, "Service", 3.6 * PX, 110, 130, SIGN_RED, SERIF_BI)
paint(band, "Rudy's", 6.9 * PX, 70, 190, NAVY, SERIF_BI, stroke=4, stroke_fill=(250, 250, 250))
paint(band, "AUTO", 9.6 * PX, 30, 120, SIGN_RED, FONT_B, sx=0.8)
paint(band, "SALES", 9.45 * PX, 160, 120, SIGN_RED, FONT_B, sx=0.8)
for word, x in (("BUY", 11.6), ("SELL", 13.6), ("TRADE", 15.5)):
    paint(band, word, x * PX, 70, 170, SIGN_RED, SERIF_B, stroke=5, stroke_fill=NAVY, sx=0.78)
band.save(os.path.join(OUT, "tire_band_front.png"))

# Side sign band: 7.5 m -> 1708 x 320.
side = wall_strip(1708, 320)
paint(side, "TIRES", 60, 40, 200, (30, 30, 34), SERIF_B, stroke=6, stroke_fill=(240, 240, 236), sx=0.9)
paint(side, "& Wheels", 860, 110, 120, SIGN_RED, SERIF_BI)
side.save(os.path.join(OUT, "tire_band_side.png"))

# Little white header signs above the office windows (1.6 m x 0.4 m -> 512 x 128).
for name, lines, col in [("tire_header_a", ["BEST DEALS"], SIGN_RED),
                         ("tire_header_b", ["LOW PRICES", "SE HABLA ESPAÑOL"], SIGN_RED),
                         ("tire_header_c", ["OPEN 7 DAYS"], NAVY)]:
    h = Image.new("RGB", (512, 128), (236, 234, 228))
    if len(lines) == 1:
        paint(h, lines[0], 40, 22, 78, col, FONT_B, sx=0.85)
    else:
        paint(h, lines[0], 110, 6, 54, (40, 40, 44), FONT_B, sx=0.85)
        paint(h, lines[1], 30, 66, 50, col, FONT_B, sx=0.85)
    h.save(os.path.join(OUT, name + ".png"))

# Painted window ads: dark green glass paint with bright lettering (1.7 x 1.6 m -> 544 x 512).
ADS = [
    ("tire_ad_1", [("We Finance", SERIF_BI, 90, (236, 236, 240)), ("NO CREDIT OK", FONT_B, 54, (244, 196, 64)),
                   ("BAD CREDIT OK", FONT_B, 54, (236, 90, 70)), ("LOW DOWN", FONT_B, 54, (244, 196, 64))]),
    ("tire_ad_2", [("CREDIT", FONT_B, 80, (244, 196, 64)), ("APPROVAL", FONT_B, 80, (244, 196, 64)),
                   ("Lowest Prices", SERIF_BI, 64, (236, 236, 240)), ("IN TOWN", FONT_B, 60, (236, 90, 70))]),
    ("tire_ad_3", [("We Finance", SERIF_BI, 90, (236, 236, 240)), ("USED TIRES", FONT_B, 58, (244, 196, 64)),
                   ("FROM $25", FONT_B, 70, (236, 90, 70)), ("WALK-INS", FONT_B, 54, (236, 236, 240))]),
]
for name, lines in ADS:
    img = Image.new("RGB", (544, 512), (18, 34, 28))
    a = np.asarray(img).astype(np.float32) + rng.normal(0, 6, (512, 544, 3))  # brushy paint
    img = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
    d = ImageDraw.Draw(img)
    y = 40
    for text, font, size, col in lines:
        f = ImageFont.truetype(font, size)
        b = d.textbbox((0, 0), text, font=f)
        w = min(b[2] - b[0], 500)
        paint(img, text, (544 - w) / 2, y, size, col, font, sx=min(1.0, 500 / (b[2] - b[0])))
        y += size + 34
    img.save(os.path.join(OUT, name + ".png"))
print("wrote tire shop signs")
