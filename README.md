# Photo Game

A browser 3D world built from photos. Photos go in `photos/`. A script turns them
into game textures, and the 3D models are written in code to match what's in the photos.

## Scene 1: bar counter and yellow stools
Source photo: `photos/bar-stools.jpg`

- **Textures** (`assets/textures/`): made by `tools/make_textures.py`
  - `butcher_block.png`: the countertop's front edge, straightened and stacked into a butcher-block top
  - `wood_floor.png`: the laminate floor, perspective-corrected and rebuilt as planks
  - `vinyl_green.png`: the dark green floor, with the lighting removed and made to tile seamlessly
  - `slat_wood.png`: the stool's back slat, straightened and made to tile
  - `*_normal.png`: surface-relief maps, so the textures catch the light
  - `palette.json`: paint and metal colours sampled from the photo
- **Models** (`src/models/`): `stool.js` (tubular frame, curved slats, bolts) and `counter.js`
  (butcher-block top, steel frame, glass panel, post)
- **Exported assets** (`assets/models/*.glb`): import these into Blender, Unity, Godot and similar tools,
  or use the "Download models" button in the game

## Run it
```
python3 -m http.server 8000
# open http://localhost:8000
```
Controls: WASD and drag to look (desktop). On a phone, use your left thumb to move and your right thumb to look.
"Inspect (orbit)" switches to an orbit camera.

## Regenerate textures
```
python3 tools/make_textures.py photos/bar-stools.jpg
```
Requires Python with numpy and Pillow.
