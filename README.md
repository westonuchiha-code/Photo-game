# Photo Game

A browser 3D world built from photos. Photos go in `photos/`. A script turns them
into game textures, and the 3D models are written in code to match what's in the photos.

## The restaurant
A 16 m x 10 m dining room, built only from things that appear in the four photos:

| Photo | What came from it |
|---|---|
| `photos/bar-stools.jpg` | butcher-block window counters, yellow bar stools, napkin dispensers, framed poster, light plank floor, green vinyl floor band, teal window trim, LED strip lights, globe pendants, slatted fence outside |
| `photos/entrance-floor.jpg` | black and white triangle tiles, door mat, pink slat chairs, lime green wall + black baseboard, bronze glass doors, teal "OPEN!" sign |
| `photos/booth.jpg` | lime vinyl booths, terrazzo tables, walnut plank floor, white subway tile |
| `photos/neon-open-sign.jpg` | neon OPEN sign in an infinity-mirror LED light box, wall globe lights outside |

How the room is laid out (two bar counters on the window wall, booths on the tile wall, tables in the middle,
entrance on the east) is made up, since no photo shows the whole room.

- **Textures** (`assets/textures/`): made by `tools/make_textures.py`. The script crops clean patches,
  straightens angled surfaces, removes baked-in lighting, then rebuilds each as a seamless tile
  (stacking strips for wood, scattering patches for terrazzo, carpet and stone). It also writes
  normal maps and `palette.json` (colours sampled from the photos).
- **Models** (`src/models/`): `stool.js` (bar stool and pink chair from one adjustable design),
  `counter.js`, `booth.js` (booth + terrazzo table), `neon.js`, `entrance.js` (doors, windows, mat),
  `props.js` (napkin dispenser, poster, OPEN! sign, wall globe)
- **Exported assets** (`assets/models/*.glb`): stool, counter, pink chair, booth, terrazzo table, neon light box,
  double door, napkin dispenser and globe pendant. Import them into Blender, Unity, Godot and similar tools.

## Run it
```
python3 -m http.server 8000
# open http://localhost:8000
```
Controls: WASD and drag to look (desktop). On a phone, use your left thumb to move and your right thumb to look.
"Inspect (orbit)" switches to an orbit camera, with quick views of the whole room, bar, booths, tables, neon sign and entrance.

## Regenerate textures
```
python3 tools/make_textures.py photos/bar-stools.jpg
```
Requires Python with numpy and Pillow.
