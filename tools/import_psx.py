# Imports the owner's PSX asset packs (unpacked in .packprev/) into assets/textures with a px_ prefix:
#   px_m_*.glb      Horror-Fantasy Megapack monsters (rigged, 2+ animations each)
#   px_sw_*.fbx/png Modular PSX Sewer Kit (architecture + props)
#   px_st_*.fbx/png Street Furniture 1 props
#   px_ch_*.fbx/png PSX Rigged Character Bases (+ skin and clothing textures)
# Textures are capped at 512 px (PSX scale). Left out on purpose: lara_D / head_lara (a famous game character's look);
# the Bottles can label (looked like a real beer brand) is painted over with a made-up one.
import os, shutil, glob, re
from PIL import Image, ImageDraw, ImageFont
SRC = '.packprev'; DST = 'assets/textures'
def tex(src, name, cap=512):
    im = Image.open(src); im.load(); im = im.convert('RGBA') if im.mode in ('RGBA', 'LA', 'P') else im.convert('RGB')
    if max(im.size) > cap: im = im.resize((cap, cap) if im.size[0] == im.size[1] else (cap, round(im.size[1] * cap / im.size[0])), Image.LANCZOS)
    if im.mode == 'RGBA' and min(im.getchannel('A').getextrema()) == 255: im = im.convert('RGB')
    im.save(os.path.join(DST, name + '.png'), optimize=True); return im
def copy(src, name): shutil.copyfile(src, os.path.join(DST, name))
n = 0
# monsters
H = SRC + '/PSX_Horror-Fantasy_Megapack_1/PSX Horror-Fantasy Megapack'
for d, ds, fs in os.walk(H):
    g = [f for f in fs if f.endswith('.glb')]
    if not g: continue
    key = re.sub(r'(godot|fbx)?\.glb$', '', g[0].lower()).replace('final', 'muscular').replace(' ', '')
    copy(os.path.join(d, g[0]), f'px_m_{key}.glb'); n += 1
# sewer kit
K = SRC + '/Modular_PSX_Sewer_Kit_1/__EXPORTABLE'
for f in glob.glob(K + '/**/*.fbx', recursive=True):
    if '_RAW' in f: continue
    copy(f, 'px_sw_' + os.path.basename(f).lower()); n += 1
for f in glob.glob(K + '/**/*.png', recursive=True):
    if '_RAW' in f: continue
    tex(f, 'px_sw_' + os.path.basename(f)[:-4].lower()); n += 1
# street furniture
for d in sorted(glob.glob(SRC + '/Street_Furniture_1/*/')):
    fb = glob.glob(d + '*.fbx'); pn = glob.glob(d + '*.png')
    if not fb or not pn: continue
    key = os.path.basename(fb[0])[:-4].lower().replace('#u0421', 'c')
    copy(fb[0], f'px_st_{key}.fbx'); im = tex(pn[0], f'px_st_{key}'); n += 2
    if key == 'bottles':   # repaint the can label with a made-up brand
        im = im.convert('RGB'); w, h = im.size; x = ImageDraw.Draw(im); x0, y0, x1, y1 = int(w * 0.27), int(h * 0.06), int(w * 0.43), int(h * 0.42)
        x.rectangle((x0, y0 + 4, x1, y1 - 4), fill=(222, 214, 190)); x.rectangle((x0, y0 + (y1 - y0) * 0.38, x1, y0 + (y1 - y0) * 0.62), fill=(150, 40, 34))
        try: ft = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', max(8, (x1 - x0) // 4))
        except Exception: ft = None
        x.text(((x0 + x1) / 2, y0 + (y1 - y0) * 0.5), 'ELM', fill=(240, 230, 200), anchor='mm', font=ft); x.text(((x0 + x1) / 2, y0 + (y1 - y0) * 0.22), 'PALE', fill=(60, 50, 40), anchor='mm', font=ft)
        im.save(os.path.join(DST, f'px_st_{key}.png'))
# character bases
C = SRC + '/PSX_Rigged_Character_Bases/PSX_Rigged_Character_Bases'
for f in glob.glob(C + '/*.fbx'): copy(f, 'px_ch_' + os.path.basename(f).lower()); n += 1
for f in glob.glob(C + '/**/*.png', recursive=True) + glob.glob(C + '/**/*.jpg', recursive=True):
    b = os.path.basename(f).rsplit('.', 1)[0]
    if 'lara' in b.lower(): continue
    try: tex(f, 'px_ch_' + b.lower()); n += 1
    except Exception as e: print('skip', b, e)
print('imported', n)
