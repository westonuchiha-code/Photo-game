# Photo Game

A browser 3D world built from photos. Photos go in `photos/`. A script turns them
into game textures, and the 3D models are written in code to match what's in the photos.

## The diner
One room built from four photos:

| Photo | What came from it |
|---|---|
| `photos/bar-stools.jpg` | butcher-block counter, yellow bar stools, light plank floor, green vinyl floor band |
| `photos/entrance-floor.jpg` | black and white triangle tiles, door mat, pink slat chair, lime wall colour, bronze door frames |
| `photos/booth.jpg` | lime vinyl booths, terrazzo table, walnut plank floor, white subway tile |
| `photos/neon-open-sign.jpg` | neon OPEN sign in an infinity-mirror LED light box, globe pendant lights |

- **Textures** (`assets/textures/`): made by `tools/make_textures.py`. The script crops clean patches,
  straightens angled surfaces, removes baked-in lighting, then rebuilds each as a seamless tile
  (stacking strips for wood, scattering patches for terrazzo, carpet and stone). It also writes
  normal maps and `palette.json` (colours sampled from the photos).
- **Models** (`src/models/`): `stool.js` (bar stool and pink chair from one adjustable design),
  `counter.js`, `booth.js`, `neon.js`, `entrance.js` (doors, windows, mat)
- **Exported assets** (`assets/models/*.glb`): stool, counter, pink chair, booth, neon light box and
  double door. Import them into Blender, Unity, Godot and similar tools.

## Run it
```
python3 -m http.server 8000
# open http://localhost:8000
```
Controls: WASD and drag to look (desktop). On a phone, use your left thumb to move and your right thumb to look.
"Inspect (orbit)" switches to an orbit camera, with quick views of the bar, booth, neon sign and entrance.

## Regenerate textures
```
python3 tools/make_textures.py photos/bar-stools.jpg
```
Requires Python with numpy and Pillow.
