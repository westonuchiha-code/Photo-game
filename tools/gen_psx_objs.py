# Generates src/models/psx_g_<pack>.js from the owner's OBJ packs (unpacked under the scratchpad packs*/ folders, or
# .packprev/objpacks/): copies each model to assets/textures/px_o_<pack>_<name>.obj and writes one E() entry per model,
# its look picked from the name by the keyword table below (owner's rule: our library textures only).
import os, re, sys, glob, shutil, json, hashlib
SRC = sys.argv[1:] ; DST = 'assets/textures'
PAL = ['#8a2a22', '#2a4a7a', '#3a5a3a', '#7a6a3a', '#5a5a5e', '#6a3a5a', '#2a6a6a', '#9a5a2a']
def pal(n): return PAL[int(hashlib.md5(n.encode()).hexdigest(), 16) % len(PAL)]
SIGNS = {'sign01': ('#f0ece0', '#c8281e', ['NO', 'PARKING']), 'sign02': ('#1a4a8a', '#ffffff', ['ONE WAY', '→']), 'sign03': ('#2a6a3a', '#ffffff', ['ELM ST']), 'sign04': ('#2a6a3a', '#ffffff', ['CEDAR AVE']), 'sign05': ('#e8742a', '#1a1a1a', ['ROAD', 'CLOSED']),
  'sign06': ('#e8b81e', '#1a1a1a', ['DETOUR', '←']), 'sign07': ('#f0ece0', '#1a1a1a', ['SLOW']), 'sign08': ('#c8281e', '#ffffff', ['NO', 'ENTRY']), 'sign09': ('#e8742a', '#1a1a1a', ['WORK', 'AHEAD']), 'sign10': ('#f0ece0', '#2a4a8a', ['NO', 'DIVING'])}
# (regex on name, base skin, options-as-JS, real largest size in metres or None)
R = [
 (r'grasspatch', 'cut:pd_reeds:8aa86a', "keepUV: ['cut:pd_reeds:8aa86a']", None),
 (r'pinetree', 'cut:g131_pine_card', "keepUV: ['cut:g131_pine_card'], radial: [0.45, 'bark']", None),
 (r'^log0', 'bark', "mtl: { Secondary: 'endgrain' }", None),
 (r'^rock0\d+a', 'stone:fr_rock', '', None), (r'^rock0\d+b', 'stone:g137_granite_wet', '', None), (r'^rock0\d+c', 'stone:river_rock', '', None),
 (r'^pool01(crn|str)', 'tile', "mtl: { Secondary: 'concrete' }", None), (r'^pool01floor', 'tile', '', None), (r'^pool01ladder', 'chrome', '', None),
 (r'startingblock|divingboard', 'plastic:#e8e6e0', "low: 'concrete'", None),
 (r'^basketball0', 'leather:#c8641e', '', 0.24), (r'^football0', 'leather:#e8e4dc', '', 0.22), (r'^tennisball', 'fabric:#c8d84a', '', 0.067), (r'tabletennisball', 'plastic:#f4f2ea', '', 0.04),
 (r'tabletennistable', 'metal', "up: 'paint:#2a5a3a'", 2.74), (r'tabletennisracket', 'wood', "side: 'plastic:#c8281e'", 0.27), (r'tennisracket', 'paint:#2a2a2c', '', 0.68), (r'tennisnet', 'net:#2a2a2a', '', 12.8),
 (r'basketballgoal', 'paint:#2a3a5a', '', None), (r'footballgoal', 'paint:#e8e6e0', '', None),
 (r'dartarrow', 'metal', '', 0.15), (r'dartboard', 'walnut', "plate: { test: front(0.05), face: { dart: true, bg: '#1a1a1a', fg: '#fff' } }", None),
 (r'divinggoggles', 'plastic:#2a6ab8', '', 0.18), (r'floatydonut', 'plastic:#e88aa8', '', 1.1), (r'floatypineapple', 'plastic:#e8c41e', "split: ['z', 0.8, 'plastic:#3a8a3a']", 1.6), (r'lifebuoy', 'plastic:#e8541e', '', 0.75), (r'swimmingfin', 'plastic:#2a4a8a', '', 0.6),
 (r'overlook', 'oldwood', '', None), (r'parkourbarricadelog', 'bark', '', None), (r'parkourbarricadeplank', 'wood', '', None), (r'parkourcrawl', 'wood', "mtl: { Wire: 'net' }", None), (r'parkourramp', 'ply', '', None), (r'parkourscaff', 'galv', "mtl: { Net: 'net' }", None),
 (r'barricade0', 'stripes:#c8281e:#f0ece0', '', None), (r'canallid', 'rust', '', None), (r'roadgate', 'concrete', "parts: [[/pole/i, 'stripes:#c8281e:#f0ece0']]", None),
 (r'streetlight', 'paint:#5a5e62', "lamp: true", None), (r'^track01', 'concrete', "up: 'asphalt'", None),
 (r'trafficcone', 'plastic:#e8642a', "bands: [[0.45, 0.65, 'plastic:#f0ece0', true]]", None), (r'trafficpole', 'stripes:#c8281e:#f0ece0', '', None),
 (r'barrelwood', 'wood', '', None), (r'^barrel0', 'oldpaint:{c}', '', None), (r'bucket', 'galv', '', None), (r'^crate0', 'wood', '', None), (r'fusebox', 'paint:#7a7e82', '', None),
 (r'gaspump', 'paint:#b8281e', "low: 'paint:#e8e6e0'", None), (r'infoboard', 'oldwood', "top: 'tin', plate: { test: front(0.3, 0.8), face: { bg: '#d8ccb0', fg: '#2a2a2a', lines: [['NOTICES', 0.14, '900'], ['lost: grey cat', 0.08, 'italic'], ['the well is closed', 0.08, 'italic']] } }", None),
 (r'jerrycan', 'paint:#3a5a2a', '', None), (r'locker', 'paint:#6a7a6e', '', None), (r'parceldrop', 'paint:#e8b81e', "plate: { test: front(0.55, 0.95), face: { bg: '#1a1a1a', fg: '#e8b81e', lines: [['PARCEL HUB', 0.3, '900']] } }", None),
 (r'^pipe01', 'rust', '', None), (r'postbox', 'paint:#2a4a8a', '', None), (r'radiator', 'paint:#e8e6e0', '', None), (r'^shelf01', 'galv', '', None), (r'signwetfloor', 'plastic:#e8c41e', '', None), (r'storageboxplastic', 'plastic:#c8d0d8', '', None),
 (r'^toilet', 'ceramic', '', None), (r'toolbox', 'paint:#b8281e', '', None), (r'airduct', 'galv', '', None),
 (r'bumpercar', 'paint:{c}', "low: 'rubber', bands: [[0.32, 1.01, 'metal', false]]", None),
 (r'policecar', 'paint:#eceae4', "bands: [[0.62, 0.92, 'glass', true]]", None), (r'^car0', 'paint:{c}', "bands: [[0.62, 0.92, 'glass', true]]", None),
 (r'^eft', 'paint:#7a8088', '', None), (r'escooter', 'plastic:#1c1c1e', '', None), (r'excavator', 'paint:#d8a81e', "parts: [[/chassis/i, 'paint:#3a3a3c']]", None),
 (r'gdwolf|^av7|l1a5|tpzfuchs', 'paint:#4a5232', "parts: [[/pickaxe|axe/i, 'wood'], [/luggage/i, 'canvas:#5a5a3a']]", None), (r'kwagen|m1a2', 'paint:#9a8a5a', '', None), (r'turret', 'gun', '', None), (r'v1rocket', 'paint:#5a6458', '', None),
 (r'^sign\d+', 'paint:#9a9ea2', "plate: { test: front(0.45), face: FACE }", None),
 (r'billboard', 'paint:#5a5a5e', "plate: { test: front(0.45), face: { bg: '#e8e0cc', fg: '#1a1a1c', border: '#1a1a1c', lines: [['ELM COUNTY', 0.16, '900'], ['STAY ON THE ROAD', 0.1, 'bold'], ['it is not far now', 0.07, 'italic']] } }", None),
 (r'blackboard', 'wood', "plate: { test: front(0.25), face: { bg: '#1e2a22', fg: '#e8e4d8', lines: [['today:', 0.12, 'italic'], ['soup  $3', 0.12, 'bold'], ['do not ask about room 6', 0.07, 'italic']] } }", None),
 (r'television|monitor|laptop', 'eplastic:{e}', "plate: { test: front(0.15), face: { bg: '#0e1a1e', fg: '#9ad8c8', lines: [['NO SIGNAL', 0.14, 'bold']] } }", None),
 (r'arcade|pinball|crane', 'paint:' , "plate: { test: front(0.45, 0.9), face: { bg: '#100818', fg: '#ff4a8a', lines: [['INSERT', 0.16, '900'], ['COIN', 0.16, '900']] } }", None),
 (r'atm', 'paint:#5a5e64', "plate: { test: front(0.5, 0.85), face: { bg: '#0a2a4a', fg: '#e8f0f4', lines: [['ELM SAVINGS', 0.12, 'bold'], ['insert card', 0.09, 'italic']] } }", None),
 (r'vending', 'paint:#2a4a8a', "plate: { test: front(0.4), face: { bg: '#e8e0cc', fg: '#1a1a1c', lines: [['SMOKES', 0.14, '900'], ['$6.50', 0.12, 'bold']] } }", None),
 (r'tire|tyre', 'rubber', '', None),
 (r'tent', 'canvas:{c}', "low: 'canvas:#3a3428'", None),
 (r'sleeping(bag|pad)', 'fabric:{c}', '', None),
 (r'umbrella', 'canvas:{c}', "parts: [[/pole|stand|base/i, 'metal']]", None),
 (r'campingchair|campingtable', 'canvas:#3a4a3a', "parts: [[/leg|frame/i, 'metal']]", None),
 (r'grilltongue|breadknife|bolt', 'metal', '', None),
 (r'grill', 'paint:#1c1c1e', '', None),
 (r'coalpack|package|foodpackage|coffeepack|candybag|walnutbag|sausage', 'canvas:#a8865a', '', None),
 (r'catwalk|ladder|scaffold|metalladder', 'galv', '', None),
 (r'wastecontainer|trashcontainer|dumpster', 'oldpaint:#3a5a3a', "lid: 'paint:#2a3a2a'", None),
 (r'trashbin', 'paint:#3a4a3a', '', None),
 (r'fence01', 'oldwood', '', None),
 (r'fence03', 'galv', "parts: [[/^fence03$/i, 'net']]", None),
 (r'fence04', 'paint:#2a3a2c', '', None),
 (r'pallete|palette0|pallet', 'wood:#8a6a4a', '', None),
 (r'palettemoney', 'wood:#8a6a4a', "up: 'paint:#5a7a4a', side: 'paint:#4a6a3a'", None),
 (r'palettegold', 'wood:#8a6a4a', "up: 'paint:#c8a040', side: 'paint:#b89030'", None),
 (r'goldbar', 'paint:#c8a040', '', 0.25),
 (r'moneybundle', 'paint:#6a8a5a', '', 0.16),
 (r'paymentcard', 'plastic:{c}', '', 0.086),
 (r'vaultdoor', 'metal', '', None),
 (r'moneycounter|creditcardreader|moneywiring', 'plastic:#3a3c40', '', None),
 (r'wheelbarrow', 'paint:#2a5a3a', "parts: [[/wheel/i, 'rubber'], [/handle/i, 'wood']]", None),
 (r'bench', 'wood', "low: 'metal'", None),
 (r'door', 'wood:#6a4a30', "parts: [[/handle|knob/i, 'chrome']]", None),
 (r'bookshelf|cabinet|drawer|coffeetable|table|chair|stool|barcounter|liquorshelf|displaycounter|prayer|dispenser', 'walnut', "parts: [[/glass/i, 'glass']]", None),
 (r'barsink|sink', 'chrome', '', None),
 (r'chandelier', 'paint:#b08a3a', '', None),
 (r'book', 'leather:{c}', "side: 'paint:#e8e0c8'", None),
 (r'candle', 'ceramic:#ece4cc', '', None),
 (r'suitcase|briefcase', 'leather:{c}', '', None),
 (r'sandbag', 'canvas:#8a7a5a', '', None),
 (r'dragonteeth|brickweird|brick', 'concrete', '', None),
 (r'bandage', 'fabric:#e8e4d8', '', 0.12),
 (r'healthpack', 'plastic:#e8e4dc', '', 0.35),
 (r'cup|plate|saucer|glas\d', 'ceramic:#ece8e0', '', None),
 (r'tinbox', 'paint:{c}', '', 0.25),
 (r'extinguisher', 'paint:#b8281e', '', 0.6),
 (r'lamp\d|lightbulb|lightindustrial|flashlight', 'metal', "parts: [[/glass|bulb|shade/i, 'glow']]", None),
 (r'bread|pastry|cookie', 'leather:#a8743a', '', None),
 (r'cake', 'ceramic:#e8d8c8', '', None),
 (r'watermelon', 'paint:#3a6a2a', "up: 'paint:#c8323a'", 0.4),
 (r'walnut', 'endgrain', '', 0.04),
 (r'bottleliq|bottle\d|can01', 'glass', '', None),
 (r'stove|dishwasher|aircon|printer|radio|speakers|vhs|dvd|nes|psx|gameboy|computer|hdd|camera|antenna|keyboard|mouse|mobile|controller', 'eplastic:{e}', '', None),
 (r'shampoo|cleaner|deodorant|soap|tissue|toiletpaper|hotwater', 'plastic:{c}', '', None),
 (r'broom', 'wood', '', None),
 (r'mat\d|carpet', 'fabric:{c}', '', None),
 (r'basketwicker', 'cut:cord_braid', '', None),
 (r'mattress', 'fabric:#d8d0c0', '', None),
 (r'clock', 'wood', '', None),
 (r'cuttingboard', 'wood:#9a7a50', '', None),
]
REAL = {'shampoo': .22, 'bottlecleaner': .3, 'deodorant': .15, 'soap01': .09, 'tissuepack': .2, 'toiletpaper01': .12, 'toiletpaperpack': .4, 'hotwaterbottle': .35, 'glas01': .12, 'cup0': .1, 'plate01': .26, 'saucer': .15, 'candle0': .2, 'book0': .25, 'bookstack': .3,
  'bread': .35, 'pastry': .15, 'cookie': .08, 'can01': .12, 'bottle0': .3, 'bottleliqour0': .32, 'bottleliqourstack': .6, 'coffeepack': .2, 'candybag': .2, 'foodpackage': .25, 'sausagepack': .25, 'walnutbag': .3, 'chocolatecake': .3,
  'vhscassette': .19, 'dvd01': .19, 'psxgame': .14, 'psxcontroller': .16, 'nescontroller': .13, 'psx01': .27, 'nes01': .26, 'gameboy': .15, 'mobilephone': .14, 'computermouse': .11, 'keyboard0': .45, 'hdd01': .15, 'camera01': .14, 'laptop': .34, 'radio01': .35, 'vhsplayer': .43, 'speakers': .3, 'printer': .45,
  'grilltongue': .4, 'grillcoal': .45, 'breadknife': .3, 'bolt01': .1, 'cuttingboard': .4, 'rusticclock': .4, 'broom': 1.4, 'paymentcard': .086, 'moneybundle': .16, 'creditcardreader': .18, 'moneycounter': .3}
def info(f):
    vs, objs, mats, nl = [], [], set(), 0
    for l in open(f, errors='ignore'):
        if l.startswith('v '): vs.append(list(map(float, l.split()[1:4])))
        elif l.startswith('o '): objs.append(l.split(None, 1)[1].strip())
        elif l.startswith('usemtl'): mats.add(l.split()[1])
        elif l.startswith('l '): nl += 1
    return [max(v[k] for v in vs) - min(v[k] for v in vs) for k in range(3)], objs, mats, nl
packs = {}
for root in SRC:
    for f in sorted(glob.glob(root + '/*/*/*.obj') + glob.glob(root + '/*/*.obj')):
        rel = os.path.relpath(f, root).split(os.sep); pack = rel[0].lower(); name = os.path.basename(f)[:-4]
        key = re.sub(r'[^a-z0-9]+', '_', name.lower()).strip('_'); fn = f'px_o_{pack}_{key}'; shutil.copyfile(f, f'{DST}/{fn}.obj')
        packs.setdefault(pack, []).append((name, key, fn, *info(f)))
for pack, items in packs.items():
    if pack == 'vehicles': continue   # dressed by hand: src/models/psx_vehicles.js
    out = [f"// Generated by tools/gen_psx_objs.py: the owner's '{pack}' pack, dressed from library textures (POLISH_NOTES 153).", "import { E, front } from './psx_auto.js';"]
    for name, key, fn, size, objs, mats, nl in items:
        low = key.replace('_', ''); base, opt, real = 'paint:' + pal(key), '', None
        for rx, b, o, r in R:
            if re.search(rx, low): base, opt, real = b, o, r; break
        if base == 'paint:': base = 'paint:' + pal(key)
        base = base.replace('{c}', pal(key)).replace('{e}', ['#c8c0a8', '#8a8c90', '#3a3a3c', '#d8d2c2'][int(hashlib.md5(key.encode()).hexdigest(), 16) % 4])
        for k, v in REAL.items():
            if low.startswith(k): real = v
        if 'FACE' in opt: bg, fg, L = SIGNS.get(re.match(r'sign\d+', low).group(0), ('#f0ece0', '#1a1a1a', ['NOTICE'])); opt = opt.replace('FACE', json.dumps({'bg': bg, 'fg': fg, 'border': fg, 'lines': [[t, 0.2 if len(L) > 1 else 0.24, '900'] for t in L]}))
        o = [opt] if opt else []
        if real and max(size) > real * 1.25: o.append(f"size: {{ largest: {real} }}")
        if nl: o.append('lines: true')
        if any(re.search(r'tracks|turret|cannon', x, re.I) for x in objs) or re.search(r'av7|kwagen|l1a5|m1a2|tpz|gdwolf|eft|turret', low): o.append('mil: true')
        nm = 'makePx' + ''.join(w[:1].upper() + w[1:] for w in re.split(r'[^A-Za-z0-9]+', name) if w)
        out.append(f"export const {nm} = E('{fn}', '{base}'{', { ' + ', '.join(o) + ' }' if o else ''});")
    open(f'src/models/psx_g_{pack}.js', 'w').write('\n'.join(out) + '\n'); print(pack, len(items))
