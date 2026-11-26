"""Writes src/texlist.js: the names of every texture in assets/textures, for the viewer's texture page.\n  python3 tools/list_textures.py"""
import os, json
names = sorted(f[:-4] for f in os.listdir('assets/textures') if f.endswith('.png'))
open('src/texlist.js', 'w').write('// every texture in assets/textures (tools/list_textures.py writes this; the model viewer shows them)\nexport const TEXTURES = ' + json.dumps(names) + ';\n')
print(len(names), 'textures listed')
