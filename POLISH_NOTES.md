# Polish pass notes

Things to revisit in the big walk-around once every photo batch is built.
This is a running list, added to as models get built. Nothing here is urgent.

## Whole town
- Lighting: it's night, and only the nearest 8 point lights (4 on phones) are on, so lights may pop on
  and off as you walk. Check for that, and balance the brightness between areas.
- Contact shadows: props without soft ground shadows can look like they float (the tire display has
  them now). Consider adding them everywhere.
- Spruce trees: colored sparkle dots on the needles at night. Check the material and the bloom.
- Clipping and overlap check everywhere, especially where new areas meet: grocery lot, house lane,
  shrine grove, apartment.
- Walk-test every interior and doorway: stockroom, living room, walk-in cooler, tire shop, apartment
  upstairs.
- The ground around the house lane / grocery / shrines is a set of separate patches; blend the edges.

## Grocery (approved; you'll send more photos)
- The middle aisles are generic colored boxes.
- The egg case is open with a canopy; the photo shows glass doors.
- The upper egg and butter shelves are plain boxes.
- Stockroom: the plywood repeat is visible, the ceiling is dark, and the floor stacks could use more
  shrink-wrap variety.

## Shrines
- The leaf-litter ground is blotchy up close.
- The stone figures are simple lathe shapes.
- The gabled roof on the stone shrine reads dark from below.

## Tire + wheel
- The spines between the wheel windows barely show.
- Could put the wheel on vehicles (van, police car).

## Elmwood Apartments
- Revisit the stoop and front per your earlier note.
- Living room: the floor is very dark, the figurines are simple, the window view is a flat picture,
  and the roman shades read brown at night.

## House lane (27a)
- The houses are simple boxes behind detailed entries; neighboring roofs merge.
- Stoops and porches block you instead of being walkable steps.
- The walkway layout overlaps between the two rows.
- Side and back walls are plain siding with no windows.

## Delivery props (27b)
- The plastic bags are fairly boxy; could be softer and more crumpled.
- The deli box contents are small and hard to read.

## Boarded blue house + cats (27c)
- Cats were rebuilt as sculpted single-surface models (src/models/cat.js). Still possible: fur shading
  or a fuzzy shell, softer eye shape, idle animation (tail flick, breathing), and a ~2-3 s build on
  load (could be precomputed and saved).
- The OSB and stucco textures have tree shadows baked in from the photo.
- The roof is plain; it could sag and have missing shingles. Sides and back are blank siding.
- The basement window sash is a flat frame; the photo shows glass and a broken pane.

## Dirt site (27d)
- Light cross-shaped patches show through the dirt near the cairns and the truck. Probably ground
  planes overlapping (house lane / walkways). Find and fix in the overlap pass.
- Truck: built from boxes, so the cab and hood are blocky. Could use rounded edges, a proper sloped
  hood, mud splatter, a raised dump bed variant, and a working beacon flash.
- The berms are plain half-spheres; they need a lumpier shape and tyre tracks running up them.
- The pipe barrier gap lines up with the house lane but there's no path to it.

## Misc small props (27e)
- Pickup zone: the gantry sign faces only one way, and the pillar numbers show on several faces.
  It sits close to the blue house; could move it or give it its own lane.
- The plywood stamp runs sideways because the photo was landscape; that's fine for a stamp.
- Paste-up wall: the handwriting font falls back to a serif on some machines. Could swap in a
  drawn handwriting texture.
- Glass shards could use sparkle under the lot lights.

## Texture tool
- Fixed: quilted textures had flat holes (blank bricks in the red brick, flat spots in dirt and
  terrazzo). Those are filled now. The earlier "light cross patches" in the dirt site were this.

## City plaza (28a)
- Planter trees are lumpy low-poly spheres; swap for the real tree models.
- The spiral sculptures are a bit thin and the curl is loose; the photo's are fatter with a tighter curl.
- Grey paver band shows black gaps between pavers.
- Warehouse brick reads dark at night; needs a wash light. The inscription repeats.
- Oval building: windows are flat; could add depth and interior lights at night.
- No buildings yet on the south/east edges of the plaza; city items 28b+ can fill those.

## Old-town street (28b)
- Shops all share one template; vary heights, add second-floor balconies, and use a different roof for some.
- The shop signs use generic Japanese words (tea, sweets, soba, etc.); swap to English if preferred.
- The road texture is fairly busy/contrasty; could be calmer. No manhole or arrow markings yet.
- The monkey statue is decent but smooth; could add carved fur grooves and a rounder belly.
- The clock tower sits past the end of the street on blank ground; the street needs an end (a building or turn).

## Shops 28c (shutter shop, noodle vending, junk shop)
- Vending machine rebuilt in detail after your notes. Note: photos/city/cup-noodle-vending-machine.jpg and yellow-shutter-shop-night.jpg have each other's names.
- The vending machine sits in front of the junk shop glass; it could move to the shutter shop's side.
- Junk shop: CRTs are simple boxes. Could add retro PCs with drive slots, CD cases spilling, a counter with a till, the hanging green sign.
- The shutter shop has no side/back detail and the planters are simple.

## Signs + fonts (done after your note)
- Sign fonts are now bundled open-licence display faces (assets/fonts, loaded by src/fonts.js):
  Bebas Neue / Oswald for shop + transit signs, Archivo Black / Bungee for bold retail, Shrikhand for
  food logos, Righteous for the old TV shop, Caveat / Permanent Marker for handwriting, VT323 for
  LED displays, Cinzel for carved stone, Pacifico for welcome signs, Alfa Slab for decals, Black Ops
  for stencils, Yuji Syuku / Zen Antique for Japanese brush and print signs.
- Every sign was switched off Arial/Georgia. fitText() keeps lettering inside its board.
- Still to check in the walk-around: every sign's height, depth (no z-fighting), and that it faces where people walk.

## Elmwood Apartments rework (after your notes)
- Parking ramp now opens toward the tire-shop lot (it was reversed).
- Rebuilt again as three floors (garden, entry, top) with six apartments each (18 total), every window real.
- Unit furniture comes from 4 layouts; could vary more. Garden-level units could get radiators / pipes.
- Detail standard from here on: the noodle machine.
- Possible next: furniture variety per unit (only 3 layouts), unit kitchens on the upper floor need
  backsplash tile, bathrooms aren't modelled, hallway ceiling could use the drop-ceiling tiles from the
  stairs photo.

## 28d street props
- Covered trike: clear cab panels barely read; could add frame edges and a reflection streak. No rider.
- Sport trike fairing: the livery shows the logo twice; the engine is a box with fins.
- Arcade cabinet: side art could carry the mascots; a red plastic stool beside it (photo) isn't modelled.
- Graffiti shop: the pallet reads reddish under the lamp; the upper floor is just corrugated metal.

## 28e station, pond, rock door
- Station canopy is a flat white slab; the photo's has a curved underside and a glass strip down the middle.
- Ivy pillars: leaf clumps are low-poly; could use leaf cards. The hall behind is a simple glass box.
- Pond: water reflections are painted streaks, not real reflections. Skyline towers sit inside the world
  (west of the plaza) rather than on the horizon.
- Rock door: rebuilt as a relief-sculpted surface from the photo. The bottom edge of the shutter shows a smear where the photo had debris.

## 28f underground mall
- Shop signs over the shutters are small from the corridor; could be bigger or lit brighter.
- The reflection map is captured once from the middle of the hall; pillars near the ends reflect the centre. Could capture two probes.
- Ceiling plenum is a flat colour; could add a faint photo texture and more ducts.
- No people / mannequins; the half-open shop could get a few displays on stands and a rack.
- Forecourt paving is the station-plaza pattern; could get its own stone.

## 28h market alley
- The junk robot sculpture is simple; could be rebuilt from more audio parts like the photo's.
- Shop interiors repeat the same parts-drawer wall; vary per shop (cables on reels, TVs, LED strips).
- Add hanging cables / extension cords and a few people-less clutter piles to make it busier.

## 28i bar alley
- Building blocks are simple boxes; add eaves, rooftop water tanks and balcony clutter.
- The 2F stair is a painted backdrop; could become real geometry if the building gets an interior.
- More people-less clutter: umbrellas, beer kegs, a vending machine.

## 28j teahouse
- Hairline striping on the plaster beside the tea-tin wall (likely a z-fight); check.
- The street front reuses the carved plaster; a plainer outside render might read better.
- Add steam / teapots on tables, a menu card, the order screen showing a made-up menu.

## 28k leftover city textures
- sky_day.png (sun-flare photo) is ready for a day mode; the town is lit for night, so a day mode needs its own lighting pass.
- Puddles only reflect lights (no environment map outside); a captured street probe would make them mirror the signs.

## 16 food set 1 remainder (noodle shop)
- The bench table is plain wood boxes; could use the wood texture from the bar photos.
- The pizza lids read a little silvery; a real clear-plastic look needs an environment map.
- Noodle shop interior is not built (the lattice doors are lit panels).

## 29 abandoned office
- Box edges of the washroom partitions stretch the drywall texture; give them proper edge UVs.
- Could add mould in the corners, a dripping leak under the missing tiles, dust motes in the light.

## 36 Vehicles
- Vintage scooter: cowl piping is lumpy (sampled onto the surface), horn grille sits a little off-centre; compare to the photo again.
- Work van / coach: the front and back faces are drawn, not from photos.
- River boat (futuristic-river-boat*) skipped at the user's request.
- 37: sound card daughterboard still shows faint acrylic glare streaks (from the photo).
- 36 Kei hatch: streaky texture on the lower rear corners; model bounding box reads 1.74 m tall (something pokes above the 1.425 m roof); compare the rear slant with more photos if any turn up.

## 37–49 (one note per model)
- 37 Portable TV: face is a flat photo; knobs/sliders could be 3D. Sound card: faint acrylic glare on the daughterboard.
  Handhelds: simple shapes, screens flat. Gadget case: reader board texture is from the sound card, not its own photo.
- 38 Bar alley signage: built as 28i; no separate pass.
- 39 Blue crate: lattice windows are an alpha cut, no real depth; torn labels are flat decals.
- 40 Nature trail: ferns + leafy tree tops are simple shapes; trail is very dark at night; distant hill planes visible at edges.
- 41 Pawn shop: guns are simple extruded outlines; ammo-box cardboard reads plain; outside is invented.
- 42 Gig posters: case is fine; posters could get slight paper curl/wrinkle.
- 43 Snacks: hanging bags read small/samey; picnic is dark at night.
- 44 School bus: flat paint, no wear/dirt; plain wheels; the street scenery from those photos (sky, median trees,
  river rock, green street lights) not built.
- 45 Sticker box: galvanized metal reads dark at night; doodle is cruder than the photo's.
- 46 Burl kiosk: one burl photo, the mirrored pattern shows on big surfaces (totem); could mix in the other 8 photos.
- 47 Pachinko: playfield is a flat photo (no 3D pins/pockets). Galaxy PC: OK after re-cut. Retro shelf: fine.
- 48 Prop pistol: copper texture shows square tiling seams. Dried rose: bloom is cup shells, could use real petal curls.
  White PC: inside is just a dark window + ring, no visible fans/parts.
- 49 E-bike: frame is tubes/capsules, could be closer to the photo's shapes; camera view cluttered by a stone block +
  the work van. Pour grid + confetti: fine.
- 49 still unbuilt (moved on at the user's request): dusty doodle kei car, walk-in dairy cooler, loading dock + trailer,
  bread aisle, pet aisle, stockroom pallets, iced-tea packs, breakfast sub, pizza slice + soda, dairy tub cart,
  cardboard bale at the dock door, smashed shopping cart.
- 50 Bad parker: truck is box-built (could be a lofted body like the kei cars); the NO TRUCKS sign is hidden behind
  the truck from the main view; asphalt wet sheen is just low roughness (no puddle reflections).
- Camera views: removed accidental duplicate view keys; the 28d graffiti-front view is back, the sticker box view is
  now "stickerbox", the noodle-forecourt drink machine view is "drinkvending".
- 51 Carts: wire grid is many thin rods (~28k triangles for the corral set); could be an alpha-cut texture for performance; the smash is a smooth shear, could add kinks.
- 52 Realty window: flyers read small in the big window (could be 1.4x or a 3x3 grid); the block's south face around it is plain; glare light in the glass is a point light.
- 53 Robot vending: photo front + head are flat photos; arms/hands/feet are boxes (the photo's are rounded with rivets); plain machines are drawn, could use photo fronts.
- 54 Cleaning robot: front is a flat photo plane on a rounded box; patrol is a fixed rectangle (no obstacle avoidance) — fine as is; arcade carpet from that photo not built.
- 55 Moss creature: now a character (roams the trail graph, pauses to look around, rests on its mound, turns to watch the player, backs off when crowded, startle hop). Legs are rebuilt tubes every frame (4 × 48 segs, cheap but could be skinned); no tree avoidance off the node graph; the crust is a bump-mapped texture (the photo's raised flakes could be real geometry); mouth lip is a clean extrude (the photo's is ragged); could add a soft chirp sound and let it follow the player a few steps.
- 56 Fabrics: plain tiles (knit, fleece, velour, denim, cotton) still show faint crossfade seams from the photos' big folds; plaids are rebuilt setts in the photos' colours + grain (not the photo pixels). Garments are thick extruded outlines with sine folds: real drape (cloth sim bake or sculpted folds), proper collars/cuffs, and price tags would help; chest pockets don't pattern-match. The flannel shirt / blanket / curtains can reuse fabricMat anywhere (e.g. living room, Knot Room, the hoodie figure).
- City district (town expansion): 4 x 4 blocks of generated buildings east of the old town (Cedar Avenue x 75, cross streets every 84 m) + outer rows, far towers, hills, fog. To polish: street-name blades + traffic lights at intersections, parked cars / some traffic, block courtyards are empty (only seen from above), building backs are plain, roofs flat (add water towers, signage, billboards), corner buildings could get chamfered shopfronts, more facade variety (awnings, fire escapes, balconies), side streets/alleys into the blocks, a ridable scooter/bike for getting around. Reserved lots: dentist (82..108, 28..50), lotB (82..104, -50..-30), lotC (175..195, 91..115), lotD (210..236, -31..-7) — vacant with lease boards until filled.
- 57 Dentist waiting room (Brightwater Dental, Cedar Avenue lot): massage chairs are rounded boxes (the photo's are sculpted shells with a legrest that sweeps to the floor); lounge chair frames are round rods (photo: square tube); the room has only the front glass (the photo's is a corner with a second glass wall + side door); the cow pumpkin's patches are painted (photo's cow pattern smeared on a sphere); the scarecrow doll / table lamp / fern are simple; the counter's back side is bare; the east "orthodontics & sleep" wing behind frosted film is empty; no interior glass reflections. The frosted lettering reads backwards from inside (correct).
- 58 Dentist treatment rooms: chair couch is now one lofted piece from the side profile (could add the backrest side bolsters + stitched panels as geometry); the photo leather tile shows its pleat seams repeating; tray contents are modelled (cassette, instruments, suction tip, cotton, gauze) — could add more loose bits; headrest arm is a single bar (photo: articulating double joint); delivery hoses are simple loops; operatory 2 is a copy without the tool chest clutter; the staff rooms beyond (x -3.8..3.8) are closed walls; the hallway is bare (could get a sterilization bay, x-ray room, coat hooks).
- 59 Utility + parking lot (Cedar Ave lot B): transformer fins are flat slabs (could be corrugated), its lid could slope more; the wall cabinets' doors are plain (no hinge-side flange / latch hardware detail on the grey box); the stacked-stone column is one textured box (the photo's stones stick out at different depths); no parked cars; the grass strip is a drawn texture (no photo grass in this batch); leaves don't rustle.
- 60 Texture library: tiles + normal maps tx_stone, tx_rock, tx_stucco, tx_band, tx_fins, tx_mulch, tx_drygrass, tx_dirt (libMat in library60.js). Used so far: district facades (stucco, stone, white fins), vacant lots (dry grass), the parking lot's stucco screen walls, mulch planter, dry-grass patch. Polish pass: re-texture older dirt/sand areas (dumpsite, alien rocks, trail spur) with tx_dirt/tx_drygrass; stone band could be real stones; the shrub is a generic spirea.
- 61 Sport coupe: one lofted shell on the real 2nd-gen dimensions; still missing the hood's centre crease, the door's sharp character line and the rear quarter's side intake; headlights are a lens over a chrome backing (could model the real projector + reflector); the tail-light bar is a flat band (could follow the surface exactly); interior is boxes; paint has no dirt (the photo car is dusty). Crashed: the crush is a deformation (no torn panel edges / exposed radiator), the fence it hit isn't bent, no skid marks.
- 62 Self storage (lot C): the portrait painting half-hidden behind the splatter painting in the photo isn't included (too little of it is visible to cut out); the latch close-up is modelled but small; closed units are empty shells; the can wall's shelf is a plain cubby; the open units' floors are dark at night (one bulb each); the gold snack pack sits on a box in the can unit.
- 64 Street batch: corner store's upper floors are a plain dark tiled block (could get balconies / AC units as in the photo); store interior is simple gondolas + coolers (no staff, no ceiling signage); the police sedan's lofted body is generic (Crown-like proportions only; no bumper/grille detail, no light-bar animation); the aircraft nose is a lathe (no panel lines / rivets / antenna, no props) and has no car under the carport.
- 65 Cafe signage: the A-frame posters are flat prints (fine — they are prints); the cafe itself (5F) has no storefront of its own — the signs sit outside a generated diner; the ticket machine's buttons are printed, not pressable; the B1F ramen shop isn't built.
- 66 Grocery 2 (in Corner Mart 24): nigiri are rounded-box rice + bent slices (no grain-of-rice geometry); tray lids are one rounded box; pizza bags are clear pillows with stacked discs; ginger shreds are a texture on a lumpy shell (could be instanced strands); the glasses/wallet/carton sit on the store counter.
- 67 Misc 3: canal park sits on a raised bank (the town ground can't be dug); reeds are flat cards; the elevated road deck is plain boxes (no traffic); the story sign's illustration is an original simple drawing; receipts + rice-ball pack are on the Corner Mart counter.
- 68 Inspiration 3: the gallery is a single white room (no second room / office); paintings use the photos as-is (some have a little background at the edges); the chip-aisle shelf with tags is represented by the display tower in Corner Mart only; curry is a displaced dome with the photo surface.
- 69 Inspiration 4 (Bulk Barn warehouse store): shelf goods are printed fronts on the steel runs (not individual boxes); interior walls reuse the exterior brick (photo shows block/ply inside); the console figure is a tiny simple doll; the moon halo is a sprite (the full-moon photo isn't used yet; the sky keeps the user's half moon); donut decorations are generic pixel critters.
- 70 Inspiration 5: not built — the arcade corridor + overhead arcade balcony views (the mall already covers this look); the izakaya's lettering is a script word cut in gold strokes, boards are boxes; the aqueduct blocks are jittered boxes (could be sculpted with real tool marks + moss geometry); hydrangeas/ferns are simple cards; the weeping maple is instanced leaf cards; sticker post stickers are redrawn generic.

## 71 Inspiration 6
- Bulk Barn staff corner (walk-in egg cooler, baler, clear plastic bags, shelf-strip box): the cooler could get a
  working door the player can push, frost on the inside panels, a hum.
- Used-games shelf: cases are real boxes with an atlas of 32 made-up spines; could add price stickers and let the
  player pick up the open case.
- Pink house: hip roof is a scaled cone (fine from the street); a proper hipped roof with fascia + gutters would be
  nicer. The orange full moon photo is not used yet (could be an optional "harvest moon" sky state).
- Parked sedans share the police car body; a second body style (hatchback / SUV) would add variety.

## 72 Inspiration 7
- Pixel Den arcade: cabinets are static; screens could animate (scrolling canvas), the air hockey could be playable.
- Temple: the lantern walls are instanced and lit by one point light; lantern flicker + a night-only glow would help.
  The hip roofs are lofted panels; add ridge tiles and hanging eave bells.
- Jet trainer: the black anti-glare nose panel on the wrapped skin texture does not read; paint it as a separate
  mesh. Add intake covers / "REMOVE BEFORE FLIGHT" tags.
- Ride trailers: the rides sit still; a slow loop of the dragon train around its oval when the fair is "open".
- Not used yet from inspo7: the foggy lakeshore stump and snowy pine forest (sky/backdrop ideas for a winter mode).

## 73 Batch 73
- Old-town row: the shops are fronts with solid bodies; Denki Land's window is a printed shelf panel, could become a
  real interior. Club Nova's cabinets have no animated screens.
- Pocket park: pines are trunk + flattened spheres; proper layered pine canopies would read better. The parking kiosk
  stairs drop into a black void (no car park below).
- Gyudon bowl: beef strips are bent boxes; a glossier sauce pool between them would help.

## 74 Batch 74
- Sticker pillar: brushed steel reads grey without an environment map; a local reflection probe would make it shine.
- More stickers could be scattered on other poles in the old town (reuse makeStickerPole with other seeds).

## 75 Batch 75
- Nakamachi Arcade: only one stall is open; the passage could continue to a B1 staircase and a tiny cinema lobby
  (the kaiju shutter's "Hoshizora" picture house).
- The kaiju shutter's red title runs into the monster's tail; nudge the lettering left.
- The CRT console TV could show a static/attract screen when switched on.

## 76 Batch 76
- Kei car: the glasshouse is a squashed rounded box; a proper lofted cabin with A-pillar curves, door gaps, a bench
  seat and dash would make it hold up close. The mirror stalks render as black discs (no env map for chrome).
- Walk-in freezer: no frost/vapour; add breath fog + a cold blue tint inside, and frost on the evaporators.
- The camp stove is a plain box; add knobs, a gas canister.

## 77 Batch 77
- Hearth Market: the middle gondolas are printed faces; real product meshes on at least one run would help close up.
  The tote groceries are plain cylinders/boxes. A roster sheet with invented names could go on the pickup wall.
- The open dairy case could get a cold mist + a hum.

## 78 Batch 78
- The two bricks are rebuilt brick by brick from the photos (tools/tex_78.py). More walls could switch to them
  (Coconut Raft's front, the Pixel Den piers); the white brick's soldier edge only exists on makeBrickPillar.

## 79 Batch 79
- Free-paper boxes: the window doors read pale; the newspaper behind the glass could be brighter/lit by a street lamp.

## 80 Batch 80
- Message trailer: the board could cycle through 2-3 messages (the 5x7 font in batch80.js makes that easy).
- Calzone Kid: no kitchen behind the counter yet (an oven + prep table would fill the back), the menu board is flat.

## 81 Batch 81
- Cake-mix aisle: frosting tubs were planned on shelf 2 but only the boxes went in; add the tubs + a few tipped boxes.
- Fortune cookies read as a lump at a distance; a crisper fold with a visible paper slip would help.
- Box trailer: add a dock plate/ramp and a few pallets inside.

## 82 Batch 82
- Texture library 2 (tools/tex_82.py, libMat82 in batch82.js): seamless now uses a two-pass, variance-preserving
  blend (no faded cross). Used so far: tread plate (toolbox, trailer ramp), quartz (deli counter, cabinet top),
  oak laminate (deli tables), chenille (Pixel Den sofa), speckled panel (cabinet), whitewash (comic box), canvases.
  Not yet used in the world: rust, blue pebbled plastic, impasto texture (the painting is hung).
- The two primed canvases in the gallery corner sit in shadow; give them a spot.
- Older textures (i5_*, i7_*, tx_*) still use the one-pass crossfade; re-run them through seamless_vp.

## 83 Batch 83
- Utility corner: the gas meter is small against the wall; a second regulator run + a bigger meter body would read
  better. The cans face sideways in the close view (rotate the wordmark toward the path).
- The sandy-dirt pocket-park ground streaks at grazing angles; raise its anisotropy or add a detail layer.

## 84 Batch 84
- Bark trees use the low-poly icosahedron crown; the bark is the photo texture but the crowns don't match the
  quality yet (layered leaf cards would). The pocket park pines now carry the shaggy bark.
- Cake slices read as white boxes from above at a distance; tint the clamshell lids less / add a reflection.
- The steel door's photo texture is lit flat; a small normal map from it would show the dents.

## 85 Batch 85
- Creek: built at grade between raised berms (the district ground plane can't be cut); the water is still. A gentle
  normal-map scroll on the water and a trickle sound would bring it alive.
- Flyer shelf + service counter: the counter has no back side / staff area; add a register and the printed notice
  board from the photo behind it.
- Bleach aisle: the jug handles are generic loops; mould them into the jug shoulder.
- Unused from batch 85: brushed bronze (only on the flyer shelf caps) and blue pebbled plastic (could be a slide /
  kids' play set in the pocket park).

## Streaming (in progress)
- Step 1 done: size-based distance culling (src/stream.js) + per-building static mesh merge. Hearth view draw calls
  ~93k -> ~1.6k, fairgrounds ~77k -> ~0.5k. Old town still ~4-6k (interactables make merging risky there).
- Step 2a done: texture zones. Core packs (72 MB) before start, district packs (38 MB) stream in afterwards.
  Re-run tools/record_zones.js whenever new district content adds textures (else they ride in the core packs).
- Next: 2b lazy-build district sites (needed once the map grows; today the district's JS build is only ~2 s),
  split the old town into zones too (it's most of the 72 MB), drop textures/geometry of far sites from GPU memory.

## Driving (round 1)
- src/vehicle/carbody.js: parametric car bodies, modelled (no photos). Lower body + greenhouse lofted through
  rounded-trapezoid rings; roof + sail panels split out of the glass by face. Clearcoat metallic paint, studio env map
  (RoomEnvironment PMREM) for paint/chrome, alloy or steel wheels with lathe tyres, discs + calipers, lamps, plates
  (made-up "ELM COUNTY"), mirrors, handles, wipers, seats, dash. Presets: hatch, sedan, coupe, kei, wagon, pickup, van;
  liveries: taxi (ELM CAB), police.
- src/drive.js: third-person chase cam; heavy-but-forgiving arcade-sim (power-limited accel, ~0.95 g grip cap,
  slow-building steering that tightens with speed, spring pitch/roll, per-wheel ground following for curbs);
  Space/Shift drift with a hop, charge -> blue/orange/pink mini-turbo; skid marks, sparks, boost flames,
  synthesized engine + tyre squeal, FOV kick. Collides with colliders (8 m grid) and stays on walkable areas.
  Touch pads on phones. E to get in/out, hold C to look back. ?drive=N starts in car N.
- Next: round 2 rebuild every parked vehicle with the generator (drivable); round 3 roads (ring road, wider avenue,
  ramps, a route out to the fairground / Hearth Market).

## Driving (round 2): every town car rebuilt + drivable
- Generator gained: colour bands by height (two-tone, stripe liveries; ring cut points keep edges crisp), side
  lettering decals, proper load beds (ribbed floor, walls, tailgate, headboard, rope hooks, cab guard on kei trucks),
  cab-over vans/trucks, boxy 4x4 sections, wing / roof / lip spoilers, black body kit, fog lamps, round sealed-beam
  lamps, tube brush guard, dust (matte, faded paint), rim colours, a flat tyre, crash damage (crumpled nose, lost
  headlight, snapped wing, wheel knocked in). Paint/glass split decided per quad on exact roof stations (no zig-zags).
- Replaced (same spots, now drivable): old two-tone van, kei truck, Hataraku Shokai work van, Kestrel Sport kei hatch,
  BIG-RIG 1 red pickup (compact corner), olive scout 4x4 (flat tyre, brush guard), white kit coupe, police car,
  black + white sedans, the dusty blue kei car in the garage. The crashed coupe is a generator wreck (static).
- Kept as-is (not cars): school bus, coach, dump truck, train, scooters.

## Driving (round 3): roads
- Elm Loop (src/models/roads.js): 4-lane boulevard (2 x 3.5 m each way, 2 m planted median, 1 m shoulders) round the
  north, east and south of the district (~1.6 km), meeting the avenue on the west. Every district street now runs on
  through the outer building rows to it (district.js: outer rows split at the streets, connector roads + sidewalks).
  Median trees + double-arm lamps with light pools, lane dashes / edge / median lines, stop bars, W-beam guardrail,
  grass verges, a pine treeline, green ELM LOOP signs at every connector. Far towers kept clear of it.
- Loop Jump Lot (east, through the rail gap): fenced 130 x 128 m asphalt pad, floodlight masts (4 point lights in the
  light budget), big kicker (1.9 m), two table-tops, twin small kickers, a rolling hump, cone slalom, tyre stacks,
  a painted donut ring, LOOP JUMP LOT arch.
- Boost pads: scrolling chevrons on the Loop's straights both ways + in the lot; driving over one = a shove.
- Jumps (drive.js): ramps are a height field; the car rides them, and if the ground falls away while it's climbing it
  flies (gravity, slight air-steer, nose follows the arc, landing thump). A ramp's side or back is a wall.
- Views: elmloop, loopeast, jumplot, jumpramps.

## Loading times (pass 2)
- Texture encoding (tools/pack_textures.py): colour maps WebP q88, normal maps lossy q90, transparency = lossy colour +
  lossless alpha; PSNR < 32 dB falls back to q96 / lossless; small flat graphics stay lossless. PNG masters unchanged.
  Startup (core) packs 72 MB -> 25 MB, all packs 110 MB -> 42 MB. Rendered frames old vs new: PSNR 51-60 dB.
- Boot (tools/boot.js): the world builds while the core packs download (texture loads wait on their pack); the
  loading bar shows MB. Packs are cached in the browser (Cache Storage, keyed by a per-pack content hash in
  packs.json), so repeat visits load from disk and only changed packs download again.
- loading.js: only textures within ~70 m of the start are uploaded before the world shows; the other ~3000 go up in
  6 ms batches afterwards.
- Off-thread decoding (texcache.js): textures load as ImageBitmaps (fetch + createImageBitmap, flipped at decode
  because WebGL ignores flipY for bitmaps; a 1x2 probe checks the browser really flips, else plain images). Phones
  get the 512 px downscale in the same step. ?imgdecode forces the old path.
- After-start jobs (src/defer.js): the cats' fur bodies and the food sculpts (SDF surface nets) are meshed once the
  world is on screen; the mall's reflection capture runs once, 3 s after the start, instead of twice during loading.
- Headless test (software GL, 4 cores, 40 Mbit/s): loading screen lifts at 19 s first visit / 17 s repeat visit,
  was 81 s. (The headless box then spends a while drawing first frames; a real GPU doesn't.)
- Not done (diminishing returns now): lazy district build, splitting the old town's textures by area.

## Polish pass 2 (whole-game sweep)
Audit tools (scratch, not in repo): every camera view captured to contact sheets; a material audit listing big
untextured surfaces and colour maps missing their normal map; unused-export / unused-import / dead-code scan.
- Code: removed the photo-based car models the generator replaced (van.js, coupe61.js, four models in vehicles36.js,
  unused imports in main.js); two duplicate camera-view keys renamed (pickupzone, brickwarehouse); Loop / jump-lot
  view buttons added to the published page; a 404 fixed (b85Mat asked for a normal map that doesn't exist).
- normals.js: NORMAL_OF table (tools/list_normals.py regenerates it) + autoNormals(scene): every material using a
  colour map that has a normal map on file gets it (95 materials had been left flat).
- finishes.js: applyFinishes(scene): every large flat-coloured wall / ceiling / deck / roof gets plaster, concrete,
  gravel, acoustic tile, stucco or plank from the library, tinted so its designed colour is kept; box-projected UVs
  at world scale. 340 meshes, ~17,400 m2. Opt out per material with userData.flat, per object with userData.noFinish.
- District: roofs = ballast gravel, parapets/cornices = cast concrete, rooftop units = galvanised sheet, kerbs =
  the kerb photo (all were flat colours).
- Trees: district avenue / main-street trees and Elm Loop's median are the grown oak / cherry / pale trees from
  trees.js, baked (bark + leaf-cluster cards) and instanced in 90 m chunks; Elm Loop's tree line is spruces built
  from the bark + needle-spray photos; trail cedars get needle-spray crowns; every flat-shaded foliage ball
  (plaza planters, hedges, bark tree, pond trees, pottery tree) is leaf cards now (leafBall / leafBlob).
- Old town ground: worn asphalt texture at world scale instead of a flat dark colour.
- Reflections: a low studio environment (0.1) on the whole scene so metal, glass and glazed surfaces aren't black.
- Old-town merge (step 1c): movers detected by running every animation + opening every door and diffing world
  matrices; the rest merges per set: 18,788 -> 3,332 meshes, 1,088 moving meshes left alone. mergeStatic keeps vertex
  colours now.
- Packs: textures the game never requests are left out (record_zones logs fetches as well as <img> loads).
- Round 2 (after reviewing every view): auto normal maps at 0.5 and never for th_plaster (dentist / gallery walls had
  gone gritty); painted-wall finishes use a softened copy of the plaster (contrast pulled 60 % toward its mean) and
  softer stucco; lamp pools: an additive pool under every outdoor PointLight (nothing overhead), one instanced draw,
  so streets and parks don't go black when the light budget is spent elsewhere; juniper = needle-spray mound
  (sprayMound) not 60 balls; scooter paint clearcoated; camera views fixed: ramp, aptunit, gallery, stainless.
- Known, not fixed: in the headless software renderer some floors/roads draw black at certain viewport sizes
  (depth precision); not reproducible at other sizes.

## 87 Elm Loop Community Garden (library textures only)
- src/models/garden87.js, on the verge inside Elm Loop west of the 2nd Street connector (CG 143.5, 197.5). Glasshouse
  (tan-brick knee wall, galvanised frame, glass panes, open door + roof vent, slat benches, clay pots, tomato canes,
  seed trays, watering can, work light); blue corrugated tool shed (plywood door on rust hinges, mossy zinc roof,
  ivy, tools inside); raised beds (greens, beans on canes, herbs, mulch); compost bay; blue water butt; potting
  table; wheelbarrow; whitewashed picket fence (instanced); gate arch + sign (made-up name, 555 number).
- mat() takes a hex tint or a linear [r,g,b] multiplier above 1 to lift a dark photo (plank timber); projUV gives
  every box real-world texture scale. Views: garden, glasshouse, glasshousein, gardenshed, gardenbeds.

## Efficiency pass (any machine)
- quality.js: automatic quality. Seven levels (pixel ratio 0.5-2.0, glow, 4/8 lights + shadows, draw distance
  55-100 %). Starting level guessed from the device (software renderer -> 0, phones 1-2, desktops 4-5) or the level
  remembered in localStorage; a governor averages frame time over 1.5 s windows and steps down above 34 ms, up below
  13.5 ms (more evidence needed to cross the 2<->3 step, which rebuilds shaders). ?q=N locks; automated browsers
  lock at 4. stream.js gained setScale.
- Shadow map: the diner's key light is the only caster; its map is redrawn only while the camera is near the diner
  (shadowMap.autoUpdate off).
- Startup: circuit-board normal map (2 MP per-pixel loop), the monkey statue's surface nets and the lamp-pool
  overhead checks moved to after-start jobs; rock-bed packing without square roots. Old-town build 9.7 s -> 4.4 s in
  the headless test; loading screen work done at 16 s first visit / 14 s repeat (was 19 / 17).

## Single-file download
- tools/build_single.mjs -> dist/photo-town.html (~58 MB): game code, texture packs and fonts embedded as base64 in
  one page; opens from disk (file://) with no server. boot.js reads embedded packs / game (window.__packIndex,
  #pkN, #gamecode); fonts.js takes window.__fontURL. Run after tools/build_web.mjs. Send this file to the user
  after every change (the hosted page did not work for them).

## 88 Home furniture set (library textures only)
- src/models/kit.js: shared helpers. mat(name, { to: '#hex' }) recolours a library texture so its average becomes
  that colour (AVG table) while keeping its grain; box / rbox / cyl / flat / bar with real-world UVs; puff() turns a
  rounded box into a cushion. Lesson: recolour light photos for light things (dark plank photos pushed up to pale
  wood blow out into cracks; dark knit pushed to blue goes white) -> light woods use laminate_oak / wood_floor /
  plaster, blankets use chenille.
- src/models/furniture88.js: makeBed (single/double, wood/metal frame), makeNightstand, makeWardrobe, makeDesk,
  makeChair, makeSofa (1/2/3 seats), makeCoffeeTable, makeTV (crt/flat) + makeTVStand, makeLamp (floor/table),
  makeBookshelf (instanced books), makeRug. All take wood / fabric / colour options; userData.collider each.
- Nestwell Home showroom (NH 178.5, 196.4, east of the 2nd Street connector, front to Elm Loop): bedroom, living
  room, study. Views: showroom, bedroom, livingroom88, study88, bedsingle.

## 89 Kitchen + bathroom set (library textures only)
- src/models/kitchen89.js: makeFridge, makeStove, makeBaseCabinet ({ sink, drawers }), makeWallCabinet,
  makeKitchenTable, makeBathtub, makeShower, makeToilet, makeWashbasin, makeMirror, makeTowelRail. Showroom
  "Nestwell Kitchen & Bath" (KB 194.2, 196.4) beside Nestwell Home. Views: kitchenbath, kitchen89, kitchenrun,
  bathroom89, bathfix.
- kit.cyl now positions the mesh instead of baking the offset (rotating a baked cylinder swung it round the origin:
  stove knobs had landed on the floor; the same bug had misplaced knobs in furniture88).

## 90 Office set (library textures only)
- src/models/office90.js: makeOfficeDesk, makeOfficeChair (swivel), makeComputer (crt/flat, made-up screens),
  makeDeskPhone, makeFilingCabinet (2/4 drawers, one open with folders), makeCopier, makeWaterCooler, makePartition,
  makeWhiteboard, makeCorkBoard, makeWasteBin, makeWorkstation (desk + chair + computer + phone, for the interiors
  kit). Showroom "Nestwell Office" (NO 206.3, 196.4). Views: office90, officedesks, officewall, officecorner.

## 91 Enterable district buildings (interiors on demand)
- district.js: every generated building gets a doorway in its street front (front wall laid in three pieces, frame,
  threshold); shops keep the shopfront and get a door bay at the end, others swap the middle ground-floor window for
  the door. userData.buildings lists them.
- src/models/interiors91.js: makeInterior({ U, V, doorX, type, seed }): flat (hall, living room, kitchen, bedroom,
  bathroom), studio, office (workstations, cabinets, copier), shop (gondolas of instanced stock, counter, till).
  Variety from the seed (wall colour, woods, fabrics). Ground floor only: stairs / back rooms are shut doors.
- src/interiors.js: one InstancedMesh of doors (they swing open within 3.2 m); the interior is built when you're
  within 24 m of its door (one per 0.25 s tick), merged by material, removed beyond 44 m; per-building walk area +
  threshold, floor height, wall + furniture colliders; two shared lights move into the interior you're in (light
  count never changes). Cars use the area list from before the interiors were added.
- 329 buildings: 230 shops, 42 flats, 21 studios, 36 offices.

## 92 Street services (street92.js)
- Bus stops, phone booths, mailboxes, traffic lights, cash machines, benches, bins and news stands, built from library
  textures and placed along the district sidewalks as instanced groups (`placeStreetServices`). Cash machines sit in
  the wall beside the door of every fourth office building.

## 93 Hospital, police station, school (civic93.js)
- Hospital beds, drip stands, trolleys, wheelchairs, waiting chairs, reception desk; holding cell, lockers, front
  counter; student desks, chalkboard, teacher desk. They are interior types (`clinic`, `police`, `school`) in
  interiors91.js: a few wide non-shop buildings get them, with a wall sign outside.

## 94 Loop houses (house94.js)
- `makeHouse`: detached home with clad walls, framed windows (lit or dark), gable roof, chimney, porch, garage with
  roller door, driveway, path, lawn, instanced picket fence, mailbox, house number. Nine claddings x four roofs.
- `placeHouses` puts a row on the verge inside Elm Loop's south side, facing the Loop. Each house adds a record to
  `district.userData.buildings`, so the interiors manager gives it a working door and a furnished flat inside.
- The verge is only 12 m deep, so houses are 10.4 x 7.9 with a 2.5 m front yard.

## 95 Elm Works (factory95.js)
- Parts: pallet (empty / boxes / drums / crate), drum, crate, machine, roller conveyor, tank with ladder, pipe runs
  with flanges and wheel valves, forklift. `makeWorks` assembles an open-fronted steel shed (portal frames, sheet walls
  with instanced ribs), a catwalk with stair, and a tank yard, on the north verge at (290, 197).

## 96/97 People (body97.js, people96.js)
- The first people (boxes + ball heads, separate rigid parts) were rejected as too simplistic and removed.
- body97.js: one male + one female base body, each a single skinned mesh (17 bones) lofted from measured rings
  (torso, neck, head with sculpted nose / eye sockets / brow / lips / chin / ears, arms, hands with thumb, legs, feet).
  One square atlas per character ("skin"), regions in `ATLAS`: face (flat front projection, so a face photo drops
  in), headBack (hair), torso (unwrapped, seam down the spine), arm + leg (both sides share, mirrored), foot, sole.
  `drawTemplate(sex)` draws the UV guide (docs/skin_template_m.png / _f.png). Hair = shells on the head bone
  (short, crop, bob, long, bald) using the headBack region.
- `paintSkin` is only a painted stand-in (flat skin tone, drawn face, plain clothes). Next: skins from photos (skin
  photo for tone, face photos fitted to the face region, clothes from the fabric textures).
- people96.js: 40 pedestrians on the district sidewalk rings (respawn 34-72 m away, dropped past 84 m; stop for the
  player, wait for cars, step clear). 9 looks per sex share materials. Two workers at Elm Works.
- bodytest.html (dev only): bodies on a plain background; ?grey=1 bare mesh, ?walk=1 poses, ?tpl=m|f template.
- Fixes: four separate fingers + slimmer thumb; hair shells get a clean edge (vertices under the hairline sit on it,
  smooth hairline by angle, closed crown); arm tops lean in under the shoulder slope and are weighted partly to the
  chest, so the shoulder reads as one surface; thigh tops no longer poke through the hip.
- Not done: people indoors / in the old town, crossing streets, talking, sitting.

## 98 District buildings rebuilt as modelled buildings (district.js)
- The generated district buildings were flat boxes with window + shopfront pictures: out of keeping with the modelled
  old town. `building()` now models them. The layout (footprints, shops, doors) is unchanged: detail choices use a
  separate random stream.
- Street walls are laid round their openings (`K.wall`), so windows are really recessed: glass set back, reveals,
  frame + glazing bars, sill. Four styles from the facade material (`STYLE`): brick (stone lintels + keystones,
  bracketed cornice, fire escapes with landings / stairs / drop ladder), stucco (trim surrounds, shutters, iron
  balconies, tiled pent eave), stone (pilasters, string courses, hooded surrounds, stepped pediment), modern (paired
  panes, fins, slab edges).
- Shopfronts: recessed glazing behind mullions, tiled stall riser, pilasters, projecting sign fascia, striped awning or
  gooseneck sign lamps. Doors: frame, recessed leaf, hood on brackets, step, wall lamp. Plinth course, rain pipes,
  window air conditioners. Roofs: stair bulkhead, water tank on legs, air handler, vents, aerial.
- Interiors now start 0.46 m behind the front wall (interiors.js `IN`), so they sit behind the recessed fronts.
- Cost control: buildings merge per block (`bin.tag`, `noMerge`) so whole blocks frustum-cull; small parts share one
  vertex-coloured material (`det`); the small dressing (det, capd, glow, tile, awnings) is only shown within 150 m
  (`userData.lodTick`). About 1.1 M triangles in total, roughly 200 k of them always candidates for drawing.
- Not done: blank party walls (sides not on a street) are still plain; real-device frame rate unmeasured.

## 100 Draw less: indoors, by area, merged movers
Owner's idea: segment the world so the whole of it is not drawn all the time. Measured first (objects and triangles
inside the view cone at five fixed camera spots, `tools/devtests/where2.js`), then cut what the numbers showed.
- **Indoors (interiors.js `enclosed`, main.js `setShutIn`):** inside a district building with the street door shut,
  everything outside is hidden (lights are left alone, so no shader changes) and streaming / LOD bookkeeping pauses.
  The door now shuts behind you once you are more than 3.2 m inside, and opens as you walk back to it.
  About 1,500 draw calls and 1.6 M triangles per frame outside a shop become about 40 calls and 27 k triangles inside.
- **Cars (carbody.js):** each car was ~130 separate meshes. The sprung body and each wheel now merge by material
  (the body and wheel groups stay, so roll, steering and spin work; siren beacons are left separate). ~43 per car.
- **Moving parts (main.js step 1c):** parts that move as one rigid piece (a door leaf with knob, plate and bolt) are
  found by comparing their world-space move in the animation probe, and merged inside the node that carries them:
  1,093 -> 207 meshes. `mergeStatic` gained `force` and `flag` options for this.
- **Streamer (stream.js):** tiny parts cull by size (8 + radius x 330 m, a knob at ~25 m, was 70 m); a big building
  with a few moving parts keeps per-part culling instead of being drawn whole to 450 m; `userData.streamMax` caps a
  set's draw distance (street trees 230 m, street services 220 m).
- **Repeated street furniture (kit.js `instanceGroup`):** split into 250 m squares so squares off screen are culled.
- Result, objects / triangles in view, before -> after: district street 800 / 892 k -> 568 / 723 k; district looking
  west 1312 / 1.71 M -> 896 / 1.48 M; old town looking east 3025 / 2.06 M -> 1728 / 1.61 M; old town looking west
  1657 / 2.01 M -> 1407 / 1.82 M; Elm Loop south 536 / 747 k -> 533 / 530 k.
- Not done: building only the zone you start in (the district is about a third of the start-up build time; it needs
  main.js reorganised, since the district is assembled inline with dozens of top-level constants used later);
  old-town interiors as separate cells; the restaurant's 132 chairs and the 2,885-rock river bed are still heavy.
- Startup timeline in the slow test browser (dev build): old town built at 5.7 s, district grid 7.1 s, district
  sites 9.3 s, merges done 12 s, downloads 17 s, shaders 19 s.

## 101 Black rectangles on the ground
- Owner reported "a lot of black blank squares and rectangles". Found: roads, lane paint, crosswalks and lawns were
  being overdrawn in places by the district's dark base plane. It was one 4,200 m square (two triangles) only 4 cm
  below the road surface; depth across a triangle that large is imprecise enough to beat the road. Shown by hiding
  the plane (road reappears) while changing the road's own material did nothing.
- Fix (district.js): the base plane is cut into 70 m squares and sits at y = -0.14.
- This is the "black ground at some viewport sizes" artefact noted earlier and wrongly put down to the test browser.
- Not changed: unlit windows are still flat black rectangles (loop houses use a plain near-black material; district
  buildings use dark window photos). Waiting for the owner to say whether those are what they meant.

## 102 Phone test area (src/phone.js, phone.html, tools/build_phone.mjs)
- Why: the owner plays on a phone (Galaxy S21 Ultra) and the town does not load there or runs as a slideshow. Cause:
  the whole town is in memory at once (532 textures, several million triangles, a 59 MB file). Drawing less did not
  help; loading less does. The owner also said the current town layout was never an approved level: the pieces are
  meant to be modular, and worlds built from them afterwards.
- What: a separate small area assembled from the same modular pieces: 4 district blocks (3 streets each way) with
  outer rows, 135 enterable buildings, street services, 5 drivable cars, 14 people, barriers where the streets end.
  `configureDistrict({ xs, zs, ring })` (district.js) makes the generator build any grid; `solo` drops the old-town
  link and the reserved lots. The big town is untouched (all of this is guarded by `GRID.solo`).
- Phone budget: no post-processing, no shadows, no real lights outdoors; resolution steps down when under 26 fps and
  back up over 52; lighter people (`useLowDetailBodies`, about a third of the triangles); every other tree; building
  detail within 80 m; outside hidden when shut indoors. Readout: `?stats` or three taps in the top-left corner.
- Build: `node tools/build_phone.mjs` -> dist-phone/photo-town-phone.html, one file. Packs only textures the build
  can ask for, found by scanning every file phone.js imports for texture names (quoted names, `name.png`, and names
  built from parts such as `bark_${kind}`). 106 of 532 textures, 11.9 MB against 58.8 MB.
- Check: `node tools/devtests/phfile.js dist-phone/photo-town-phone.html` opens it from disk at phone size, walks into
  three buildings of every interior type and must report 0 failed requests (it caught 10 missing textures once).
- Measured in the slow test browser, phone area vs town: playable 11 s vs 54 s; textures in memory 104 vs 1,478;
  geometries ~210 vs ~3,800; about 205 draw calls and 400 k triangles in a street view. Real phone numbers unknown.
- Next for a real game: worlds as layout data (pieces + positions), areas this size joined by a loading step.

## 103 Phone area: alleys, freestanding buildings, back courts
- Decision (owner): development moves to the phone area; the big town stays frozen as a reference.
- Owner: "every single building is connected... no alleyways... none of the buildings have corners."
- district.js, phone area only (`GRID.solo`, full blocks): `fillFrontageSolo` leaves an alley (3.2-4.5 m) after about
  a third of the buildings, sets about 30% back 1.6-3.4 m behind a paved forecourt, and varies depth 11-16 m. All
  four sides of every building are finished walls with windows. Backs get a steel door with a step and a lamp.
  `backCourt` makes the middle of each block an open court: asphalt, parking bays, dumpsters, a lamp, a tree in a
  kerbed bed. Wheelie bins stand in the alleys. Alleys, forecourts, yards behind shallow buildings and courts are
  walkable (and drivable); `SOLO` carries the extra areas, paving, lamps, trees and colliders to makeDistrict.
- 124 buildings, 21 alleys, 4 courts. Triangles in view: about 500 k in an alley, up to 700 k in a court (all four
  sides detailed costs more than the old joined rows). Not yet tuned against real phone frame rates.

## 104 Phone area: fixes from the first play on the owner's phone
- It loads and runs on the Galaxy S21 Ultra ("loads pretty good"). Owner's screenshots showed three faults.
- Walking 25% faster: `WalkControls` takes a `speed` option (default 2.2 m/s, unchanged for the big town); phone 2.75.
- Blind slots that looked like alleys but could not be entered: a shallow corner building left a 5 m gap behind it,
  open to the side street. Corner buildings are now full depth. Alleys along the north and south rows are only made
  clear of the corner zones, so each one comes out in the back court. Alley chance raised to keep the count (23).
- Lamps and trees in the roadway: each pair's second lamp / tree was placed a fixed step from the first without the
  crossing check. Phone area now drops any lamp or tree inside a crossing (`inCrossing`). The big town has the same
  fault and is left as it is (frozen reference).
- `tools/devtests/phchk.js` checks: nothing standing in a roadway, every alley touches a court and crosses no
  building, walk speed.

## 105 Phone area: dark-glass windows, dressed alleys + courts, first photo-faced character
- Unlit windows (phone area): the window material is smooth glass with strong environment reflection, so dark panes
  get a sheen that moves with the view instead of being flat black. Subtle in screenshots; to be judged on the phone.
- Courts: pallet stack, cartons, an air-conditioning condenser, two utility poles with crossarms and sagging wires,
  one drivable car parked in a bay of each court (phone.js). Alleys: a bulkhead wall lamp, sometimes a crate stack.
  Back doors are still dummies (interiors only reach 9 m in from the front, so they cannot connect).
- Face mapping prototype. Owner supplied three photos of one face (front, both profiles): photos/npc-face-a-*.jpg.
  `tools/make_face.py` crops the front photo to the head's face layout (scaled across by the eye spacing, up by the
  eyes-to-mouth distance; phone photos need the rotation tag applied; `--view` lets coordinates be read off a scaled
  view), mirrors the head over the background outside a hand-given outline, samples the skin colour, and builds a
  back-of-head map from patches of a profile photo (hat, hair, neck). Output: np_face_a.png, np_back_a.png.
  `paintSkin({ face, back, collar })` lays the maps into the atlas; hair style `beanie` is a hat shell;
  `makeCharacter(CHARACTERS.hank)` (people96.js) builds him. He stands by the start and turns his head to watch you.
- Known limits of the prototype: the sides of the head stretch the front photo (the profile photos are not used for
  the sides yet: that needs the head unwrapped round instead of front / back); the beard is cut at the chin (no
  beard shape below it), which leaves the neck looking long; one body build for everyone.

## 106 Photo-faced character, second pass
- Head texture layout changed (body97.js): the face and headBack regions are now half-cylinder unwraps (180 degrees
  round the head each, even by angle) instead of flat front / back projections. The sides no longer smear, and a
  profile photo can cover them. The painted placeholder faces were re-aimed (`FX`); docs/skin_template_*.png redone.
- tools/make_face.py rewritten: for every texel it finds that point of the head in 3D from the head's ring
  measurements, then samples the front photo (middle of the face), the profile photo (sides, round toward the back;
  mirrored to both sides) and plain hat / hair / neck patches (the strip down the back). Blend front to profile
  between 44 and 60 degrees. No head outline is needed any more.
- `addBeard(body, material, len)`: a beard shell from under the lip, round the jaw and down past the chin, using the
  face map's chin strip. `makeCharacter` takes `build` (body breadth; the head bone is scaled back so the face does
  not widen), `head` (head size), `beard`, `collar`.
- Still rough: the beard shell is one smooth shape and a little lighter than the cheeks; glasses are only painted
  on (no frame standing off the face); where front and profile photos meet at the glasses rim there is some doubling;
  each face still needs landmarks read off by hand.

## 107 Photo-faced character: hat and body
- Owner: "fix the hat and body" (no detail given; read as: the hat was a tight helmet, the body a thin mannequin in a
  skin-tight top, where the photos show a slouchy knit beanie and a stocky man in a loose hoodie).
- Hat (`beanie` style in hairGeometry): thicker, a rolled cuff at the edge, a full rounded crown that stands off the
  skull, lifts and slouches back; sits lower on the brow and over more of the ears.
- Body: `specFor(sex, shape)` makes a build variant of the base body by scaling the rings by region
  ({ chest, waist, hips, arm, leg, neck }; belly comes forward with the waist; shoulders and hips move out so limbs
  stay attached). `makeBody(sex, material, shape)`. Hank uses chest 1.27, waist 1.55, hips 1.3, arm 1.42, leg 1.34.
  The earlier whole-group `build` scale is gone.
- Hoodie: `addHood` (a roll of cloth behind the neck, on the chest bone); `paintSkin({ hoodie })` paints a ribbed
  hem, front pocket and drawstrings and lets the top hang over the hips.
- A soft ground-shadow disc under `makeCharacter` figures (pedestrians do not have one yet).

## 108 Phone area: the first photo-built places, and finer detail culling
- Five hand-built sets from the photo batches now stand in the phone area, on the same reserved lots and at the same
  coordinates as in the big town (the phone grid is the big district's western half): Kiln & Co. pottery, the old
  izakaya, the aqueduct ruins garden, the small plaza with the rainbow mural (benches, planters, maple), the pink
  bungalow, the kei car garage with its dusty kei car (drivable). Street props from the same batch on the sidewalk.
  `configureDistrict({ lots: [...] })` keeps those lots; the phone rows are built in the stretches between lots.
  Each set is merged by material when placed (`mergeStatic`). Not brought over yet: the corner store (about 330 k
  triangles and three more texture sets), dentist, self storage, canal park and everything outside this grid.
- Phone build: 130 of 534 textures, 14.8 MB (was 106 textures, 12.1 MB).
- Finer culling of building detail: a street view had crept to about 800 k triangles because each block's fine
  dressing (frames, sills, ironwork) was one mesh, so all four blocks' detail was drawn at once. In the phone area
  it is now grouped in 28 m squares (`bin.cell`), shown within 55 m. Street views about 400 k, a back court 180 k.
- `tools/devtests/phspot.js` reports draw calls / triangles / textures standing at given spots.

## 109 Phone build: areas with a loading step between them
- First real-phone numbers (Galaxy S21 Ultra, street view): 60 fps at resolution x2.00, 216 draws, 390 k triangles.
- src/phone.js is now an engine plus `AREAS`. One area is built at a time. `buildArea(id, carriedCar)` configures the
  district generator, places that area's hand-built sets, cars, people, interiors and streamer under one root group.
  `clearArea` disposes every geometry, material and texture under that root and empties the shared collider / area
  lists. `travel(exit)` shows the #travel overlay, swaps areas, waits for the new textures (8 s at most), compiles
  shaders. Exits are tests on position (`exits: [{ to, test }]`); a car being driven is lifted out and adopted by
  the new area (`drive.adopt`, `drive.rebuild`: small additions to drive.js, no change to how driving behaves).
- Both areas are halves of the big town's district at the same world coordinates, so you arrive where you left.
  Midtown (west): pottery, izakaya, aqueduct garden, mural plaza, pink house, kei garage, the photo-faced character.
  Eastside (east): the art gallery, the lantern temple with its plaza and stairs, the pocket park, the Nakamachi
  Arcade passage. `configureDistrict({ westStub })` runs the cross streets out through the west row. Signposts stand
  at the street ends that lead across; the other ends keep their barriers.
- Measured in the slow test browser: a crossing takes 1.2-2.5 s; after seven crossings GPU textures (about 100-150)
  and geometries (about 200-430) are no higher than after the first, so nothing accumulates there. JS-side image
  caches (texcache, kit) are not cleared: not measured on a real phone.
- Build: textures are now found two ways. Generator files are scanned for names (rooms vary at random, so a run
  can't see them all); every other file is covered by running the dev page headless through every area and recording
  texture requests (hand-built files hold many pieces the phone doesn't place: scanning them packed 211 textures,
  recording packs 156). 21.3 MB. `phtravel.js` / `phfile.js ...?area=east` must report 0 failed requests.
- Not done: the old town (restaurant, grocery, apartments, mall...) as a third area; corner store; dentist; storage.

## 110 Phone build: Old Town Square (third area)
- The old town is 435 sets and about 3 M triangles: it comes across as several areas. First: its northern part, as
  src/areas/oldsquare.js. The placement code is main.js lines 975-1190 and 1297-1312 copied unchanged inside
  `buildOldSquare({ add, rect, circle, colliders })`: city plaza, old-town shopping street, strip shops (shutter shop,
  junk shop, thrift corner), street props, station gateway, lotus pond, rock bar door, underground mall + forecourt,
  Go-club stair, market alley, bar alley + teahouse, noodle shop + food, abandoned office, Knot Room. It returns the
  walk areas and `ground(x, z, prevY)` (mall hall and stairs are below street level).
- phone.js: `buildCustomArea` for areas that are not a street grid (no generated district, interiors, people or cars):
  dark base with a hole at the mall stair well, a simple far skyline, sets merged by material, animated sets ticked.
  Real lights inside the sets (92) are budgeted: the nearest three are lit, always three.
- Reached on foot only from Midtown's west street ends (signposted; `configureDistrict` westStub for Midtown);
  exits can carry a `spawn` since this area is not at Midtown's coordinates. A brick wall stands where the
  restaurant block would be, with the way back through it.
- Memory: this area needed about 930 MB of texture memory at phone settings (721 canvas-drawn signs and labels,
  156 megapixels) against 164 / 216 MB for Midtown / Eastside. `shrinkCanvases(root, max)` (new `max` argument)
  caps them at 320 px and the full-size canvases are released: about 220 MB. Signs stay readable up close.
  `tools/devtests/phmem.js` estimates an area's texture memory.
- Phone file: 235 of 534 textures, 35.2 MB. Not yet tried on the real phone.
- Still to bring across: restaurant, lot, tire shop, street row, grocery, apartments, houses, dirt site, shrines,
  nature trail, vehicles (each a further area or two).

## 111 Cars, stage 1: a new driving system for the phone build (src/vehicle/drive2.js)
- Owner asked for an in-depth pass on the cars with an early-2000s open-city feel: types that drive differently,
  damage and health, flipping, pedestrians that dive clear or get hit and die, better drifting and controls, better
  models; and after that an NPC conversation / shop system. This is stage 1 (how cars drive and what they do). The
  big town keeps src/drive.js unchanged.
- Model: front and rear axle grip separately. Load shifts with braking / power; what a tyre uses along the car
  is not there across it (so power and the handbrake use up rear grip); slip angles give the side forces; below
  walking pace the car follows its front wheels. Assists: yaw damping, stronger front bite when you steer into a
  slide, and extra damping past about 35 degrees of slide so a drift can be held.
- `CLASS` / `handlingFor`: sports, sedan, hatch, kei, pickup, offroad, van, truck: drive wheels, pull and top speed,
  grip, rear grip share, steering lock and fade, turn-in, brakes, height of the centre of mass, toughness, body roll,
  engine note. The kart drift-charge and boost are gone here.
- Measured with tools/devtests/drv.js (0-60 km/h, braking, cornering at 30 / 60 / 90, handbrake turn, power slide,
  crash). After tuning: 0-60 in 2.2 s (sports) to 4.9 s (kei); yaw about 60 deg/s at 30 km/h; a handbrake turn at
  60 km/h swings 70-105 degrees in 0.9 s; rear-drive cars power-slide from a slow corner, front-drive ones don't.
- Health (1000 x toughness): impacts cost speed squared, dent the bodywork round the contact point, kill lamps;
  below 62% the engine smokes, below 40% / 20% it loses power, below 10% it burns down and explodes into a burnt
  wreck (blast shoves and hurts nearby cars, throws people). A 70-85 km/h head-on costs roughly 15-25%.
- Going over: a `tumble` mode. The car rolls as a box over its edges, sliding on its bodywork, losing energy at each
  edge; it can come back onto its wheels, or rest on its side or roof (on the roof it starts to burn). Triggered by
  hard sideways hits, or by cornering force against the height of the weight for tall / narrow cars at speed.
  "Flip car" button (R) puts it back.
- Other cars are bodies too: a parked car that is hit is shoved, spun, dented; a car you jump out of rolls on.
- Pedestrians (people96.js, only when the phone driver supplies the car's outline): they throw themselves clear of
  a car coming at them (fewer manage the faster it comes), are shouldered aside at a crawl, are thrown when struck
  (dead above about 27 km/h, otherwise they get up and run), others nearby run; blasts throw and scatter them.
  tools/devtests/pedtest.js: at 35 km/h all ten tried dived clear; at 60 km/h seven of ten were hit.
- Controls: touch has a steering slider under the left thumb (analog), gas / brake+reverse / handbrake on the right,
  a look-back button, and a drag on the screen looks round; keys W/S A/D Space, E out, R flip, C look back.
  HUD: speed, health bar, messages.
- Not done in this stage: the car models themselves; traffic; police; sounds beyond the synth engine and thumps;
  the photo-faced character cannot be hit; nothing can kill the player.

## 112 No flip button
- Owner: no way to flip a car back; in the older open-city games a car that goes over catches fire and blows up.
  The "Flip car" button, the R key and `drive.flip` are removed. A car resting on its roof starts to burn at once
  (explodes about 6 s later); one left on its side does the same after 4 s. Get out or go up with it.

## 113 New car models (phone areas)
- `src/vehicle/carbody2.js`, used by `src/phone.js` only; the big town keeps `carbody.js` untouched.
- One shell lofted through cross-sections that all share the same eleven points a side (sill, body side, shoulder
  crease, belt, window, cant rail, roof), so glass, lamps, grille, cladding and the pickup bed are faces of the shell
  with another material and always follow the body. Corners are rounded in plan, the lamp panels lean back, arches are
  true cut-outs with lips and liners. Bumpers, valances, arch lips and shut lines are swept along the same curves.
- Per type: hatch, sedan, coupe, kei, wagon, pickup, van, scout (4x4), bigtruck, keitruck, keivan, keiold, keisport,
  oldvan, each with its own proportions and style numbers (corner radius, lamp height, doors, quarter glass, sail
  panel, bumper kind, cladding).
- Wheels: rounded tyre with tread grooves, dished rim with five / six / ten spokes or a pressed steel wheel + hubcap.
- One indexed mesh per material: 16 draws and about 7,000 triangles a car (was 44 draws, 14,000). Dents keep the
  panels smooth. Each car has its own lamp materials: parked cars are dim, the one you drive lights up, a hard hit
  kills that end's lamps.
- Fixed on the way: the old bodies had open holes at the nose and tail.
- Back courts can now also hold a van, a 4x4 and an estate (Eastside gets the van and the 4x4).
- Not carried over (big-town-only options): crash-posed bodies, flat tyres, colour bands, side lettering, brush guard.
- `tools/devtests/carstudio.html?mod=carbody2[&only=n&a=deg&h=&d=]` shows the cars in daylight; `carshot2.js`,
  `cargame.js`, `cargame2.js` take the pictures. `docs/cars_new.png` is the line-up.

## 114 Talking to people, shopkeepers, buying and selling (first version, phone areas)
- `src/npc/lines.js` is all the words, as plain data; `src/npc/talk.js` is the panel and the rules.
- Every area has five topics everybody there knows, and each topic has one answer per temperament (warm, gruff,
  gossip, nervous, proud, dreamy): thirty answers an area. Midtown: Midtown, aqueduct ruins, Kiln & Co., rainbow
  mural, the traffic. Eastside: Eastside, lantern temple, art gallery, Nakamachi Arcade, pocket park.
  Known everywhere: Background, Latest rumours, and My trade for people who run a shop.
- A word in [brackets] in an answer is a link: tap it to ask about it. A topic from another area gets "that's not
  round here" in the speaker's own voice, and joins the topic list for that conversation.
- Who someone is (name, job, temperament) comes from their seed, so the same person is always the same person.
  Pedestrians: 14 an area. The button reads "Talk to the man / the woman" until you have spoken, then their name.
- Shopkeepers: one stands behind the counter of every shop interior (15 kinds, matched to the shopfront sign), made
  with the interior and removed with it. Barter: tap theirs to buy, yours to sell. A shop only buys its own kind of
  goods (the mart buys anything, cheaply); each area pays half as much again for two kinds (Midtown: media, gifts;
  Eastside: tools, clothes); temperament moves prices about 10% either way. You start with $60 and a pocket radio;
  money and things are kept in the browser's storage where it allows.
- Hank has his own lines and an extra topic (kei garage).
- Additive hooks in shared files (the big town does not use them): `interiors91` userData.keeper, `interiors`
  onBuild, `district` exports SHOPS, `people96` 'talk' state + seed.
- Not done: keepers for the hand-built places (pottery, izakaya, gallery, temple); disposition / reputation; things
  doing anything once owned; keepers share the pedestrians' looks; Old Town Square has nobody in it.
- `tools/devtests/talktest.js` walks through a pedestrian, Hank, a shop and a trade.

## 115 Controller buttons for driving (touch)
- Owner: the steering slider and GAS / BRAKE pads were not what a car game's controls should be.
- Left: two arrow buttons steer. Right: a pad's four face buttons. A accelerate, X brake (hold on when stopped to
  reverse), B handbrake, Y get out. Each is labelled. Speed and health moved above the arrows. Dragging elsewhere
  on the screen still looks round. Keyboard unchanged.
- `tools/devtests/ctltest.js` presses them in portrait and landscape.

## 116 Headlight beams
- The light on the road was two hard-edged rectangles. Now one soft cone a lamp: narrow at the car, widening and
  fading to nothing ahead and at the sides, brightest a few metres out. Smashed lamps throw no light.
- 116b: the new cones were laid out backwards (running under the car). Turned to run forward from the lamps;
  `tools/devtests/beamshots.js` photographs them from above, the side and the front.

## 117 Car animations, burnout, horn, finer car detail
- Getting in: the driver's door swings open, the view glides from where you stood to behind the car, someone sits
  down at the wheel, the door shuts (with a thump). Getting out (standing still, on its wheels): door opens, you
  are out, door shuts behind you. At speed, on its side or wrecked you are simply out, as before.
  The door is three meshes cut from the shell (paint, glass, lining) hung on its front edge; the steering wheel is
  its own part and turns with the steering; the driver is one figure posed sitting, leaned back to fit low roofs.
- Burnout: hold accelerate and brake together below about 18 km/h. Rear-drive cars hold the front wheels, spin the
  rears, pour smoke, lay marks and swing the tail round as you steer (donuts); let go of the brake and it launches.
  Front-drive cars sit and smoke the fronts. Four-wheel-drive ones do not.
- Horn: HORN button by the pad (H on a keyboard). People ahead and close hurry off along the sidewalk.
- Car detail: belt mouldings, drip rails, rubbing strips, bonnet and boot shut lines, a dark scuttle under the
  windscreen, amber corner lamps and white reversing lamps at the back, side repeaters, high brake lamp, aerial,
  filler cap, plate surrounds, a badge, a silencer, bumper inserts, mud flaps on the trucks, wheel nuts, steering
  column and rear-view mirror. About 8,500 triangles and 20 draws a car now.
- For later (owner's idea, not started): a drive-in body shop. Park inside, a menu opens with the car shown at a
  good angle: respray any colour, full repair, and bolt-on parts shared across all cars (spoilers, wheels /
  hubcaps, window tint, and so on). `carbody2.js` already takes these as plain options (color, rim, rimColor, wing,
  roofSpoiler, lip, rails, fog), so the shop would rebuild the car from its spec with the options changed.
- `tools/devtests/caranim.js` photographs the door, the driver, both burnouts and counts who runs from the horn.

## 118 First person in and out of the car; no horn button
- Owner: this is a first-person game. No figure in the car (the player has no model); getting in and out is head
  movement. And the pad is a standard controller: no extra buttons.
- The driver figure is removed. Getting in: the door opens, your view goes from where you stood down through the
  door into the seat, the door shuts, then the view draws back to behind the car. Getting out: the view comes
  forward into the seat, the door opens, and you rise to standing beside the car.
- The HORN button is removed. Horn = both steering arrows pressed together (as clicking the stick would be), or H.
- Rule for later work: copy an idea from a third-person game only after turning it into what you would see in
  first person.

## 119 Getting in and out, polished (first person)
- In: the latch clicks and the door swings; you step to the open door looking down at the seat (the time depends on
  how far away you stood); you duck in with a tilt of the head and swing round to face the bonnet; you settle with a
  glance at the door as it thumps shut; the starter turns, the engine catches with a small shake; only then the view
  draws back and the driving buttons appear. The engine is silent until the starter has turned.
- Out: the view comes forward into the seat, the engine stops, you look to the door and open it, swing out and up,
  stand beside the car, and the door shuts behind you.
- `tools/devtests/carfp.js` steps through both and saves the frames.

## 120 Chaos run: driving through walls fixed; people and car damage rebalanced
- Owner: "I seem to go through a lot of walls". `tools/devtests/chaos.js <url> <area> <secs> <seed>` drives every
  car with random hard inputs (full gas, handbrake turns, reversing) and checks every frame that the car is on
  drivable ground and not inside anything solid.
- Before: in 4 minutes in Midtown the car spent 3,288 frames outside the drivable ground, up to 12 m inside
  buildings. Cause: the edge of the road only stopped a car that had been fully inside a moment before. Once a
  corner was over the line (spun there, shoved by a hit, rolled) nothing stopped it again.
- Fix: a car found over the edge is pushed back to the nearest drivable ground and takes the hit as a wall.
  After: 24 minutes of chaos over both areas, five seeds: 0 frames through a wall (2 frames 0.25 m over a kerb line),
  0 inside a solid, never trapped (when stuck nose-in, reversing always got it out), no errors.
- Walls (cab, 35-60 km/h, square on / 45 / 15 degrees / reversing): stops, dents, never through.
- People (tools/devtests/pedtest.js forward, pedrev.js reversing): they react the same to a car backing at them.
  Changed: hitting a person cost the car far too much (about 75 a hit at 100 km/h; a few people wrecked it); now
  about 20. Under about 40 km/h most people hit are knocked down, get up and run instead of dying.
- Still true: lamp posts, poles and trees are solid and do not fall or shake; nothing on the street breaks.
