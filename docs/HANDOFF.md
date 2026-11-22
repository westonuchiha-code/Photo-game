# Photo Town — handoff

For the next model working on this project. Read this, then `docs/DESIGN.md`, then the tail of `POLISH_NOTES.md`
(one section per piece of work, newest last; it is the detailed history).

## 1. Working rules from the owner (these matter more than anything technical)

The owner pays per token and has been burned repeatedly. These rules are theirs, stated directly:

1. **Change only what you are asked to change.** If the fix needs something adjacent changed, stop and ask first.
   Explanations and clarifications from the owner are information, not change requests. (Two failures to learn
   from: the district was built as flat boxes while "adding driving"; the driving was retuned while the owner was
   asking about buildings. The driving change had to be reverted.)
2. **"Save X for last" means stop and talk before building X**, not "build it last".
3. **Answer the exact question asked, briefly.** No padding, no answering a different question. If asked for an
   estimate, look it up and give an educated guess instead of "I don't know".
4. **Deliver the game as one file.** After every change, build `photo-town.html` and send that file plus
   screenshots. The claude.ai artifact link does not work for the owner; do not send it.
5. **Keep one art style.** Real modelled 3D, built from the photo texture library, recoloured as needed. No flat
   picture-on-a-box shortcuts anywhere. Think about whether a new area matches the old town before building it.
6. Made-up names and brands, 555 phone numbers, no real logos, characters or number plates.
7. The staff-roster photo (real names) never goes in the repository. Never send the owner's email or personal
   details to outside services.
8. Keep `POLISH_NOTES.md` updated. Commit and push to the working branch after each piece of work. Never open a
   pull request unless asked.
9. The owner swears when frustrated. Fix the thing, keep the reply short, do not argue.

## 2. Run, build, test

```
python3 -m http.server 8123          # dev: open http://localhost:8123/  (ES modules, no build step)
node tools/record_zones.js           # re-run whenever new textures are used (see section 5)
node tools/build_web.mjs             # bundle + WebP texture packs -> dist/
node tools/build_single.mjs          # dist/photo-town.html, the one-file game (~59 MB)
cp dist/photo-town.html photo-town.html   # the file sent to the owner (gitignored)
```

URL switches: `?q=0..6` locks the quality level, `?imgdecode` uses the fallback image decoder.

Test scripts (Playwright, headless Chromium) are in `tools/devtests/`. They were written for a scratch folder, so
check paths before use. The useful ones:
- `errchk.js` loads the dev build and prints page errors. Run it after every code change.
- `svc.js '[[name,px,py,pz,tx,ty,tz],…]'` screenshots from any camera position.
- `cmpenv.js PREFIX "query" view…` screenshots named view buttons.
- `filetest.js path/to/photo-town.html` loads the single file from disk and reports errors and missing textures.
- `bt.js` + `bodytest.html` render the character bodies alone (fast); `tpl.js` writes the skin templates.
- `tri.js` counts district triangles.

Headless rendering is software (SwiftShader): slow (40 s to load), run one browser at a time, and the ground
sometimes renders black at some viewport sizes. It says nothing about real frame rate.

## 3. Repository map

| Path | What |
|---|---|
| `index.html`, `src/main.js` | the game page and the world assembly: placements, walk areas, views, frame loop |
| `src/models/*.js` | 114 model files. Each builds one set or prop family in code |
| `src/models/kit.js` | model kit: `mat(name,{to})` recolours a library texture to a target colour |
| `src/models/district.js` | the street grid and the building generator (`building()`), `GRID`, `LOTS`, `DOOR` |
| `src/interiors.js`, `src/models/interiors91.js` | doors + on-demand interiors; the room layouts |
| `src/models/body97.js`, `people96.js` | base bodies, skin atlas, hair; pedestrian pool |
| `src/drive.js`, `src/vehicle/carbody.js` | drive physics; car generator |
| `src/models/roads.js` | Elm Loop, stunt lot, ramps, boost pads |
| `src/stream.js`, `quality.js`, `texcache.js`, `loading.js`, `defer.js` | performance and loading |
| `assets/textures/` | 536 PNG masters (colour maps, `_n` / `_normal` normal maps) |
| `assets/models/` | 9 exported `.glb` models from the first room |
| `tools/` | texture-cutting scripts (`tex_*.py`, `make_textures.py`), build scripts, `boot.js` |
| `photos/` | the owner's source photos (1.5 GB) |
| `docs/` | this file, the design document, skin templates |

World coordinates: old town x < 62; district streets at x = 75, 161, 245, 329, 413 and z = -168, -84, 0, 84, 168;
Elm Loop at z = ±212 and x = 462. Sidewalk top is y = 0.14.

## 4. State of the last three pieces of work

**District buildings (item 98, done today).** `building()` in `district.js` models every generated building. The
layout uses random stream `r`; detail uses a separate stream `d`, so adding detail never moves a building. Do not
add or remove `r()` calls. Buildings merge per block (`bin.tag`) and are flagged `noMerge`; small parts share the
vertex-coloured `det` material; fine detail is hidden beyond 150 m (`userData.lodTick`).
Open: blank side walls; walking into buildings was not re-tested after interiors moved 0.46 m back (`IN` in
`interiors.js`).

**People (items 96/97).** `makeBody(sex, material)` gives a skinned mesh; `ATLAS` in `body97.js` is the texture
layout; `docs/skin_template_m.png` / `_f.png` show it. The face region is a flat front projection so a face photo
drops in. `paintSkin()` is a placeholder. The owner will upload skin and face photos; the job then is a photo-to-
atlas pipeline. The owner called the current people "fine as a placeholder".

**Driving.** Unchanged since driving round 3. A retune was made today without being asked and reverted (commits
33f9cfa, bafa0e5). Leave it alone unless asked.

## 5. Things that will bite you

- **Textures missing in the build:** packs only contain textures the game requested during `record_zones.js`. A new
  texture that was never recorded is silently absent from the single file. Re-run it, then check `filetest.js`
  reports `missing 0`.
- **Recolouring:** `mat(name,{to})` scales by the texture's average (table `AVG` in `kit.js`). Recolouring a dark
  photo to a light colour blows out or goes black. Use a light source texture for light things.
- `kit.cyl` positions the mesh (does not bake); pieces face +z; rotate by π to put them against a back wall.
- View buttons must be added to both `index.html` and `tools/publish_page.html`.
- `mergeGeometries` needs every geometry in a bin to have the same attributes and to be indexed.
- Anything with `userData.update` / `tick` / `noMerge` is skipped by the static merge.
- Python patch scripts with `assert` abort half-way; re-check that every replacement landed.

## 6. Not verified (be honest with the owner about these)

- Real-device frame rate with the new buildings and 40 people.
- The single-file test was pointed at a stale copy for most of 22 Nov. The final file was re-tested properly:
  loads, no errors, no missing textures. Its texture-load count was 4073 against 1878 that morning; the cause was
  not investigated (possibly the district's uncached `tex()` helper).
- Entering buildings and houses after the building rebuild.
- The quality governor's behaviour on slow machines.

## 7. What the owner has said comes next

1. Decide how the game plays (the owner wants to work this out together; do not invent and build a design).
2. Photo skins and face maps for the people, once photos arrive.
3. More texture variety (fabric, stone) will be supplied if asked for.
