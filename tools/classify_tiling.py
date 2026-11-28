# Sorts every texture for the no-repeat pass (src/texpolish.js): full (organic + seamless: shuffle and flip each repeat),
# tone (structured grids: brick, tile, planks, siding: only the light/dark wash + grade, shuffling would break the joints),
# off (signs, photos, cut-outs, anything not seamless: untouched). Writes src/tiling.js.
import os, re, json, numpy as np
from PIL import Image
D = 'assets/textures'; out = {}
STRUCT = re.compile(r'brick|tile|siding|plank|floor|shingle|roof|fence|grate|grill|panel|ceil|block|slat|lattice|louv|shutter|stair|tread|board|cobble|paving|paver|laminate|parquet|deck|weave|wicker|mesh|grid|stripe|plaid|check|corrug|ribbed|scale|lino|keyboard|vent|bars|rail|window|door|shelf|book|bamboo|stone_wall|wall_|_wall|terrace|step|wainscot|bead|quilt|knit|cane|rattan|sett')
SKIP = re.compile(r'(_n|_normal|_glow|_alpha|_mask)$')
for f in sorted(os.listdir(D)):
    if not f.endswith('.png'): continue
    n = f[:-4]
    if SKIP.search(n): continue
    if n.startswith('px_'): out[n] = 'off'; continue   # owner's PSX packs: atlases, never shuffled
    try: im = Image.open(os.path.join(D, f))
    except Exception: continue
    if im.mode in ('RGBA', 'LA', 'P'):
        a = np.asarray(im.convert('RGBA'))[..., 3]
        if a.min() < 250: out[n] = 'off'; continue
    a = np.asarray(im.convert('RGB').resize((256, 256)), dtype=np.float32)
    inner = (np.abs(a[:, 1] - a[:, 2]).mean() + np.abs(a[1] - a[2]).mean()) / 2 + 1
    seam = (np.abs(a[:, 0] - a[:, -1]).mean() + np.abs(a[0] - a[-1]).mean()) / 2
    ok = seam / inner < 2.2 and seam < 22
    out[n] = ('tone' if STRUCT.search(n) else 'full') if ok else 'off'
OFF = 'apt_name_stone art_graffiti city_far city_far_e creep_jeans creep_shoe ped_hand_face ped_walk_face moon_halo g145_dragon_skin hm_handle'.split()
TONE = 'th_plaster blinds bk_tan bk_white em_pave hs_stone sg_pave tx_stone pk_stone tx_band cr_green'.split()
for n in list(out):
    if n in OFF or n.startswith('tire_'): out[n] = 'off'
    elif n in TONE and out[n] != 'off': out[n] = 'tone'
FULL = 'ab_tile door_mat fb_knit g137_needle_floor g138_cooler_panel g138_floor_backroom g138_floor_polished g138_tile_dark g145_floor_sealed g145_freezer_wall g145_tile_glitter liv_floor liv_wall store_floor wall_olive_stucco ba_scale'.split()
FLIP = 'ab_ceil b86_floortile b86_walltile mp_paver mp_paver_light'.split()
for n in list(out):
    if n in ('city_windows', 'city_windows_e'): out[n] = 'off'
    elif n in FULL and out[n] != 'off': out[n] = 'full'
    elif n in FLIP and out[n] != 'off': out[n] = 'flip'
# not seamless, but used as tiled surfaces (the soft-seam shuffle hides their edges too)
FULL2 = 'ab_navybase b82_chenille b83_curb b83_gravel b83_sandydirt b84_litter b84_rust alien_3 alien_4 city_asphalt cn_wall dn_carpet g131_dirt g131_gravel g131_juniper g131_mat g131_sand g132_asphalt_coarse g137_fur_tabby g137_granite_wet g137_weeds g141_dry_brush g141_dry_grass g141_plywood g144_dry_litter g144_wood_furred g144_wood_grey gf_mildew hs_grass i7_brass m48_twine ot_stone rp_slab rp_slab_r sc_rustbox tr_moss tx_dirt tx_mulch wall_teal_stucco store_panel'.split()
TONE2 = 'bp_block brick_planter butcher_block cord_braid cy_brick dn_ribbed beadboard g137_brick_brown hs_brick sg_grey sg_red sg_tilelow sn_chevron um_floor wood_floor tx_fins'.split()
for n in FULL2: out[n] = 'full'
for n in TONE2: out[n] = 'tone'
for n in ('gs_floor', 'rs_tile'): out[n] = 'flip'
c = {k: sum(1 for v in out.values() if v == k) for k in ('full', 'tone', 'flip', 'off')}
open('src/tiling.js', 'w').write('// tools/classify_tiling.py writes this: how each texture is treated by the no-repeat pass (src/texpolish.js)\nexport const TILING = ' + json.dumps(out, separators=(',', ':')) + ';\n')
print(c)
