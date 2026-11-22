# Photo Town — design document

State of the game as of 22 Nov 2026 (232 commits, branch `ccr-f462110c-3rsiw7`).

## 1. What the game is

A first-person 3D town you walk and drive around in a web browser, built from the owner's own photos. Every
surface in the world is a texture cut from one of those photos, and every object is a 3D model written in code to
match what the photo shows.

The owner's direction, in their words and by reference:

- **The feel:** "Morrowind in a modern city". A hand-made, dense, slightly strange place you explore on foot,
  where every building is a real modelled thing you can look at up close.
- **The scale reference:** the PS1 open-world game the owner calls "Germ" (most likely *Germs: Nerawareta Machi*,
  1999): a whole small city with enterable buildings, on PS1-era budgets.
- **Driving:** cars are transport, "like getting a horse in Daggerfall". Driving should be fun (GTA and Mario Kart
  were the references for fun) but the game is **not** a racing game.
- **People:** PS1-style characters: one male and one female body, with "skins" (skin photo, face map, clothes)
  wrapped over them.
- **How the game actually plays is not decided yet.** The owner's last design statement was: "now we need to figure
  more about how the game works". There are no goals, quests, dialogue, inventory, saves or fail states yet.

## 2. Art rules (fixed by the owner)

1. Real 3D models, never a photo pasted on a flat surface.
2. Textures come from the owner's photo library. Recolouring an existing texture to make something new is expected
   (one fabric photo becomes any blanket; one metal photo any metal). New photos are not needed for each new object.
3. All names, brands and signs are made up. Phone numbers are 555 numbers. No real logos, characters or plates.
4. The whole world must hold one style. Flat "box with a picture" buildings next to modelled ones were rejected.
5. Full-resolution PNG texture masters stay in the repository; the playable build uses compressed WebP packs.

## 3. The world

Night-time town, about 700 m across. Two parts:

**Old town (west, x < 62).** The original hand-built area, one bespoke model set per photo batch: the restaurant
(the first room built), grocery and its lot, apartments, a house lane, an underground mall, shopping street,
station gateway and lotus pond, teahouse, bar alley, covered electronics market, abandoned office, knot room, dump
site, tyre shop, shrines, and several dozen smaller sets and props.

**The district (east, x 75 to 420).** A 4 x 4 street grid added for driving:
- about 330 generated buildings in four modelled styles (brick, stucco, stone, modern) with recessed windows,
  shopfronts, fire escapes, balconies and roof plant;
- every one has a working door and a ground-floor interior built when you approach: shop, flat, studio, office,
  clinic (4), police station (2), school (3);
- about 20 bespoke sites on reserved lots (dentist, self storage, corner store, gallery, warehouse store, pottery,
  izakaya, aqueduct garden, arcade, temple, fairgrounds, pocket park, market and more);
- street services: traffic lights, bus stops, phone booths, mailboxes, benches, bins, news stands, cash machines;
- 40 pedestrians walking the sidewalks.

**Elm Loop** is a boulevard round the district. On its verges: a community garden, three furniture showrooms, the
Elm Works factory shed (north), a row of 12 enterable houses (south). Off the east side is a stunt lot with ramps
and boost pads.

## 4. What the player can do today

- **Walk** in first person (WASD + mouse, or two thumbs on a phone). Doors of district buildings swing open.
- **Drive** any parked car in third person (E to get in or out). Weighty handling, drift on Space with a
  charge-and-release boost, ramps and boost pads. Cars cannot enter buildings.
- **Inspect:** an orbit camera with about 335 preset view buttons, used for looking at individual models.

## 5. Systems

| System | What it does |
|---|---|
| Texture library | 536 PNG textures (colour + normal maps) cut from photos by scripts in `tools/` |
| Model kit | helpers for building objects from library textures, with recolouring to a target colour |
| Interiors on demand | builds a building's interior within 24 m of its door, removes it beyond 44 m |
| People | two skinned base bodies (17 bones), one square texture atlas per character, hair shells, walk cycle |
| Car generator | builds every car body procedurally; shared drive physics |
| Streaming and merging | hides small things at a distance, merges static meshes to cut draw calls |
| Quality governor | 7 automatic quality levels (resolution, bloom, lights, shadows, draw distance) |
| Loading | world builds while texture packs download; packs are cached by the browser |
| Single-file build | the whole game as one ~59 MB HTML file that runs from disk |

## 6. Known gaps

- No gameplay loop (see section 1).
- People: skins are code-painted placeholders. Photo skins and face maps are the next step for them. People exist
  only on district sidewalks; they do not enter buildings, cross streets, talk or sit.
- District buildings: sides that do not face a street are still blank walls.
- Interiors are ground floor only; you cannot see into them through windows.
- Frame rate on real devices has not been measured since the buildings and people were added.
- Day and night: the town is night only.
