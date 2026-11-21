"""Regenerates the NORMAL_OF table in src/normals.js from assets/textures (colour maps with a *_n / *_normal sibling).
  python3 tools/list_normals.py"""
import os, re
names = {}
for f in sorted(os.listdir('assets/textures')):
    for suf in ('_normal.png', '_n.png'):
        if f.endswith(suf) and os.path.exists(f'assets/textures/{f[:-len(suf)]}.png'): names[f[:-len(suf)]] = f[:-4]
p = 'src/normals.js'; s = open(p).read()
s = re.sub(r'export const NORMAL_OF = \{[^}]*\};', 'export const NORMAL_OF = ' + repr(names).replace("'", '"') + ';', s)
open(p, 'w').write(s); print(len(names), 'normal maps listed')
