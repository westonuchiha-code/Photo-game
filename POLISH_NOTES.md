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
- 120b (owner: pushing a person into a wall seemed to let the car through). `tools/devtests/pin.js` drives at
  people standing in front of a wall: 10 to 100 km/h, forward and reversing, 61 runs. The car never went through
  (the fix above covers it). People did: nothing stopped a pushed, diving or thrown person at a wall. Now walls
  stop people as well (`makePeople({ ok })`): after the change, 0 of 61 ended up through one.

## 121 Lamp posts and signposts come down
- A collider can carry `knock(dirX, dirZ, impact)` and `knockAt` (m/s). Hit harder than that by the driven car, it
  stops being solid, the car keeps most of its speed (and takes a dent, sparks, a shake), and the thing topples the
  way it was pushed, bounces once and lies there.
- Street lamps (58 in Midtown; instanced, so each one's own matrices are turned about its foot, and its pool of
  light goes out) give way above about 20 km/h; the green signposts above about 13. At walking pace both still
  stop the car. Trees, utility poles, dumpsters and the rest stay solid.
- `tools/devtests/lamp.js`: 12 km/h stops; 30, 60, 100 km/h knock it down and carry on.

## 122 People, second pass: keepers for the hand-built places, gifts, things that do something, memory
- Keepers with parts of their own (lines.js CHARACTERS + PLACES): Ines Carrow the potter inside Kiln & Co. (bowls,
  vases), Kenji Sato at the izakaya door (skewers, pickles, tea), Farah Quill in the art gallery (postcards; the
  paintings are not for sale), Abe Imai at the foot of the temple stairs (charms, fortunes). Each has their own
  greeting, background and a few answers; the rest come from the area like anyone's. They turn their heads to you.
- What people think of you (a bar by their name, 0..100): starts from temperament; +1 for meeting; a gift raises it
  (more for a dear one, half as much again for the kind of thing they like); being nearby when you run someone down
  lowers it (12, or 22 if the person died) and the whole area's opinion drops a little each time. Under 25 they
  greet you coldly, under 20 they will only give their name. From 70 a new topic appears, "A word of advice".
  Prices move up to 15% either way with it. They remember having met you and greet you differently.
- "Give a gift" in the talk panel. Your things are on the purse button (top left on foot, or I): tap to use.
  Drinks (coffee, soda, milkshake, tea): walk 25% faster for 90 s. Duct tape / hammer: patch up the car you are
  standing by (30% / 15% of its health). Lottery ticket: scratch it.
- Stored with the wallet (`phototown.wallet.v1`: money, items, people, rep).
- `tools/devtests/npc2.js` visits every standing person, gives gifts, uses the bag, mends a car, checks witnesses.

## 123 The body shop
- `src/shop/bodyshop.js`. "ELM AUTO BODY": a brick spray booth at the far side of the first back court in Midtown
  and in Eastside, opening toward the parking bays. Park in it (below walking pace) and the menu opens; the car is
  held and shown from a slow sweep behind it, kept inside the booth so no wall gets in the way.
- Repair (priced by damage, up to $120: health full, dents and dead lamps gone). Paint: 14 colours at $40, metallic
  or flat finish. Wheels (five / six / multi-spoke alloys, steel + hubcaps), wheel colour, spoiler (boot wing, body
  colour wing, roof spoiler), windows (light, dark, limo), extras (front lip, fog lamps, roof rails, two-tone roof).
  Tap to buy and fit; fitted parts are marked. Money is the same purse as the shops.
- How it works: a car is its options (`carbody2.js makeCar`, kept in `userData.opts`). Every job builds the same car
  again with one option changed and swaps it in under you (`drive.refit`): same car object, same health unless
  repaired. A new part is one line in PARTS plus whatever makeCar does with the option. New in makeCar: `tint`.
- `drive.lock` holds the car; `drive.view(camera, dt)` lets something else aim the camera.
- `tools/devtests/shop.js` crashes a cab, drives it in, repairs, resprays, fits parts, drives out.
- Not done: the fitted parts are not saved between visits; no previews before paying; one booth an area.

## 124 Old Town South; people in both old-town areas
- `src/areas/oldsouth.js`: the southern old town lifted across the way Old Town Square was (main.js lines 457-640,
  656-680, 708-844, 846-974 unchanged, plus what they lean on): the lot and boarded-up storefront, tire shop, street
  row, rocks and trees, the apartment building, junked van, tree with a door, alien formation, scooter, wheel display,
  the hooded figure, police vehicles, grocery, roadside shrines, house fronts, boarded blue house, dirt site.
  Not brought: the restaurant's inside (its block stands shut, in brick) and the nature trail.
- The areas now join as the town does: Midtown's west end -> Old Town South (the lot) -> Old Town Square. On foot.
- Doors there (tire shop, apartments, grocery, scooter seat) open as you walk up; the big town asks for a key press.
- Too much for a phone as it stood: about 1,230 separate meshes (the apartments and grocery alone use some 300
  different materials). Multi-material meshes are now split and merged for every hand-built area, and this area
  draws its small parts from much nearer (`streamScale: 0.35`). Measured at phone size from eight spots, worst view
  each: 126-299 draws and about 180-620k triangles (Midtown is about 216 / 390k). Texture memory by the same
  estimate: Midtown 262 MB, Old Town Square 432 MB, Old Town South 300 MB. Not yet tried on the real phone.
- People: five stand about in each old-town area (no sidewalk grid to walk), each with a name, job and temperament
  like anyone. Topics, five an area, six answers each: Old Town Square (the square, underground mall, bar alley,
  lotus pond, the station), Old Town South (the lot, tire shop, the restaurant, the grocery, roadside shrines).
- The single file is 43.1 MB (was 35.3): 350 of 534 textures.
- `tools/devtests/walkthru.js` walks Midtown -> lot -> square -> lot -> Midtown and pokes the doors;
  `draws.js <url> <area> <scale...>` measures the worst view from eight spots.

## 125 Traffic
- `src/vehicle/traffic.js`: cars that drive the street grid of Midtown and Eastside by themselves (4 on a phone, 6
  on a desktop). The crossings of the grid are nodes; a car goes node to node in the right-hand lane, chooses a way on
  at each crossing (not straight back unless it must) and steers at a point a few metres ahead on its lane, which
  rounds the corners. It slows for corners, stops for whatever is in front of it (traffic, a car pushed into the
  road, the car you drive, you on foot), gives way at a crossing to whoever is in it or nearer to it, and after nine
  seconds stuck behind something turns round and goes another way.
- Each is an ordinary drivable car. Hit one, wreck it or get into it and it stops being traffic (it is then just a
  car in the road); a new one starts somewhere out of sight a little later.
- `drive.moving(g, on)` / `drive.follow(g)`: a self-driven car's colliders leave the 8 m grid and are simply always
  tested (re-filing them every frame was the expensive part).
- `tools/devtests/traffic.js <url> <area> <secs>`: 4 minutes in each area: never off the road, no two cars
  overlapping, moving 96-97% of the time, none stopped for 10 s; a car coming at you on foot stops 4.8 m short; a
  rammed one drops out of traffic and takes damage; a taken one drives. The chaos run now has traffic in it and still
  never leaves the road.
- Not done: they do not obey the traffic lights, signal, park or pull out; they do not run people over; no drivers
  are shown in them; nobody reacts to being rammed or having their car taken (no police, no anger).

## 126 Consequences: police, wanted stars, your health
- Heat (0..8) is what the police know you have done lately: knocking someone down 0.6, killing 1.5, ramming a
  driven car 0.5 (a parked one 0.12, a police car 1.2), taking a car someone is driving 1 (a police car 2).
  One star at 1, two at 3, three at 6, shown top centre; they flash while a police car has sight of you (50 m).
- Police cars (white sedans, black roof, light bar) are part of `vehicle/traffic.js`: as many as you have stars. With
  a target they take the shortest way through the grid, fast, and from about 30 m drive straight at you: to stop
  beside you if you are on foot or stopped, to ram you if you are moving. They keep to ground a car can be on; held
  against a wall they go round by the streets. A knock does not stop them; wrecking one or taking it does. With no
  target they drive like anyone and are removed once out of your sight.
- BUSTED: stopped (or on foot) with one within 8.5 m for 2.5 s. Dark screen, a fine of $40 a star, stars gone, you
  are put on your feet. Losing them: heat only cools once they have had no sight of you for 26 s (about 45 s to
  shed two stars). A respray at the body shop with none within 30 m clears it at once.
- Health (bar under the purse, only shown when hurt): a crash above about 40 km/h of impact, an explosion nearby,
  being in a car when it blows (70). It comes back slowly after ten quiet seconds; food gives 22, vitamins 18,
  bandages 40, painkillers 55 (used from your bag). At nothing: WASTED, a tenth of your money, and you come round
  where the area begins.
- `tools/devtests/law.js`: on foot one star, a car arrives and you are taken in at 16 s; three stars driving: three
  cars, closest 4.5 m, none ever off the road; losing two stars out of sight 45 s; respray clears; crash, blast and
  WASTED. The chaos run (now with traffic and the law running) still never leaves the road. The one "trapped" case
  it reported was the body-shop menu opening on a car that stopped in the booth.
- Not done: no officers on foot (a car beside you is the arrest); no sirens to hear; nothing on foot hurts you except
  explosions; pedestrians and shopkeepers do not react to your stars.

## 127 Police, wanted stars, arrests and health: parked. What this game is.
- Owner: number 2 on the list ("consequences") was left out on purpose and should not have been built. All of 126
  is switched off (`LAW_ON` in phone.js, false unless the address has `?law`): no police cars, no stars, no BUSTED,
  no health bar, no WASTED, food and medicine have no "use" again. Nothing is deleted. People still run from a car
  and still remember being run at (that is the conversation system, not a warrant system).
  `tools/devtests/nolaw.js` commits every crime and checks nothing happens.
- Rule, again: build only what was asked for. A bare "continue" after a list is finished means ask what is next.
- What the game is (owner's words, condensed): a first-person game. Morrowind's way of dealing with people, in a
  modern city simulated the way an open-city game simulates one (walk, drive, go into shops, buy ordinary things),
  with the mood of Germs: Nerawareta Machi: a strange, creepy, interesting place to walk round and look at. It will
  not be as big as Morrowind, as deep, or do as much as an open-city sandbox, so the reason to play it is the world
  itself: odd, surreal, built from photographs, people worth talking to. Not shooting, not running from police.
  The other games are inspirations, not things to copy; when unsure which way a feature should lean, ask.
- Germs: Nerawareta Machi (PS1, 1999, KAJ), from reviews: first person throughout; a reporter back in his home town
  as something strange spreads; walk, drive, bus, subway, train; information from a computer at your office, from
  people, from what you find; a clock with day and night; exteriors almost black and white, interiors in colour;
  no other cars or people on the streets, which reviewers say is what makes it eerie; rough and unfinished, and
  remembered for its atmosphere, not its systems.

## 128 Mood pass (owner chose 2-9 of nine; no outdoor hum)
- Kept as they are by the owner's answers: traffic, pedestrians being hit, the lighting and colour.
- `src/mood/sound.js` (all synthesised, no files; outdoors is silent on purpose):
  2. Room tone by kind of interior: a shop's fridge hum that cuts in and out, strip-light buzz and vents in offices,
     clinics, police and schools, a quiet flat with a clock ticking; louder once the street door has shut behind you.
  3. Footsteps, one a stride, left and right slightly different: street, tile, carpet, wood, stone.
  4. Voices: whoever speaks murmurs a wordless run of notes as long as the line; pitch by sex and person, pace and
     steadiness by temperament (gruff low and slow, nervous high and quick, dreamy slow and wandering).
- 5. Two people in each street area do not walk. One stands and watches you; one stands with their face to the wall.
     Both can be spoken to. Now and then, on foot, everyone within 26 m stops and looks at you for a couple of seconds.
- 6. Changed only where you are not looking: the watcher is somewhere else when you look again (always out of your
     view when it moves); a door you passed stands ajar, and is shut again after you have been to it; a parked car is
     a little way along from where it was (never one you are using, never into anything).
- 7. One more subject in every area, asked like the rest, that nobody agrees about: Midtown "last Tuesday", Eastside
     "the lanterns going out", Old Town Square "the last train", Old Town South "the night of the argument". Six
     answers each (some deny it, some contradict each other). Four new rumours point at the rest of this list.
- 8. `src/mood/wrong.js`: one door in Midtown and one in Eastside is always a little open. Through Midtown's is a
     corridor 66 m long (the building is 9 m deep) of the same door again and again; through Eastside's a hall 44 m
     square, dark, with a table, one chair pulled out and a lamp. The door at the far end puts you back on the street
     where you went in. A blink covers the step. They are built off to one side of the area; the general light is
     turned down while you are in one. No real lights (painted glow), so no cost to the rest of the area.
- 9. Quiet spells: every four to seven minutes, for a minute or so, nobody new comes onto the street and the traffic
     is gone once it is away from you (14 people -> 2, 4 cars -> 0 in the test), then it fills again.
- `tools/devtests/mood.js` and `watcher.js` check each of these; `docs/mood.png` shows them.
- Not judged by ear: every sound here was only checked as "running", in a browser with no speakers.

## 129. Shops you can use (owner's answers: shelves + keeper's menu; clothes seen and reacted to; hunger; torch, map, radio)

Asked first, built to the answers.

- **Goods on the shelves** (`src/shop/goods.js`): every generated shop puts two of each thing it sells on its wall
  shelving as real objects (one merged mesh each, 43 models). Look at one and the button reads "Take the jacket · $45";
  taking it is free (stealing). Owner: no karma and no reaction from anyone yet. Taken things stay gone for ten minutes.
  The keeper's buy / sell list (Barter) is unchanged. The four hand-built places (kiln, izakaya, gallery, temple) have
  no shelf goods yet.
- **Clothes** (`WEAR`, `DRESS` in lines.js): Clean shirt, Jacket, Scarf and Umbrella are worn from the bag. Each moves
  what a person thinks of you by temperament while it is on, and each person remarks on it the first time they see it.
- **Hands** (`src/player/hands.js`): forearms on the camera, seen only when doing something: taking from a shelf,
  pushing a door, reaching for a car door, eating, holding the torch, holding the umbrella (canopy over the view).
  Sleeve follows what is worn (grey sweatshirt / white shirt / navy jacket). The scarf is not visible on you.
  Not done: hands on the steering wheel (driving is seen from behind the car). Skin tone is one constant (`SKIN`).
- **Hunger**: `wallet.hunger` 0..100, full to starving in 30 minutes; past 60 the walk slows, to six tenths at 100.
  Food from the bag is eaten (dearer = more filling); drinks still quicken the step. `wallet.stats.eaten / walked`
  are counted for later use (owner mentioned a fat stat like San Andreas). Nothing reads them yet.
- **Flashlight**: a real spot lamp carried on the camera (always present, dark when off). Bag, or F.
- **Town map** (`src/player/map.js`): drawn from the area as built: roads, pavements, buildings, shops by trade,
  ways out, you. Drag to move. Bag, or M. Needs the map (bookseller).
- **Pocket radio** (in `mood/sound.js`): one synthesized tune, static, and breaks (dropout / half speed / a flat
  counting voice); static rises near the ajar door, behind it, and near the people who do not walk. Bag, or R.
- Test: `tools/devtests/goods.js`. Headless only; the radio was confirmed running, not heard.

## 130. Errands (deeper NPCs), and flashlight / radio / map on the controller buttons

- **Buttons** (owner: "don't add extra buttons, assign them to the buttons we already have"): on foot the controller's
  face buttons appear in the same place and style as in the car: **Y flashlight, X radio, B map**, each shown only once
  you have the thing. Keys F / R / M. No A on foot (the centre button already does that job).
- On-foot messages ("Taken: ...", hunger) now have their own line on screen; before, they went to the car's HUD, which
  is hidden on foot, so 129's messages were never visible.
- **Errands** (`src/npc/errands.js`): ask anyone "Any work?". Keepers, written characters and standing people always
  have one; about two in five passers-by do (always a parcel). Three kinds: fetch a thing a shop here sells; carry a
  parcel to a named person (sometimes in another area); ask a named person about the area's odd subject and report back.
  Paid in money, +10 liking with the giver, +1 standing in the area.
- **Memory**: the giver greets you differently afterwards; other people in the area bring it up under Latest rumours.
- **Notes**: the bag lists every errand, open ones first. With a town map, the people an open errand wants you to see
  are marked on it in red.
- One errand per person, for good. No timed errands, no failing, no chains yet.
- Test: `tools/devtests/errands.js` (all three kinds through the real talk window; keeper names match the real keepers).

## 131. Street photo dumps -> library; the viewer shows every model and every texture

Owner: these are for a repository of things, not all to be placed ("use stuff, but don't use it just to use it").
Nothing from this batch is placed in the game yet.

- Photos: `photos/10001364xx.jpg` (47 so far, originals). Processed so far: 24-50. Still to do: 52-74
  (yellow litter, stone-block wall x3, e-bike + rack, vape shop front, food window posters, wall access plate, cluster
  mailbox, skip nameplate, slatted bin, blue skip with rubble x2, grey skip + portable toilet + cone + container,
  scratched metal x3, green pedestal box x4), and from earlier: the lorries, the supermarket sign.
- Textures (`tools/tex_131.py`, 14 + normals): g131_gravel, dirt, sand, asphalt, concrete, sandstone, polemetal, mat,
  juniper, bark, pine, pearleaves; cut-outs g131_crack, leaf, wasp, pearleaf. New `seam_margin` (no doubled features).
- Models (`src/models/props131.js`): ground samples, gravel bed, juniper bed, road crack, door mat, sandstone rock,
  anthill, cigarette butt, dead leaf, pear leaf, wasp, pipeline sign, utility box, advertising bench, donation bin,
  bark trunk. Every name, number and piece of artwork on them is made up (real ones in the photos were not copied).
- Viewer (`viewer.html`): all model files listed again (was stuck at batch 86), `src/models/extras131.js` wraps the
  cars, shop goods, rooms, wrong places and people so they show too; a Textures page (grid, search, tap for large /
  tiled); fits a tall phone screen. `node tools/build_viewer.mjs` -> `dist-viewer/photo-town-library.html`, one file
  with every texture (76 MB). 562 models, 562 textures, all build without error (tools/devtests/viewtest.js).

## 132. Street photos, second half -> library

All 47 street photos are now processed. Nothing from 131 / 132 is placed in the game (owner: a repository; use where
it belongs).

- Textures (`tools/tex_132.py`, 8 + normals + 1 cut-out): g132_stoneblocks, stoneface, asphalt_coarse,
  metal_scratched, metal_pitted, galv_streaked, rustpaint, brick_tan; g132_litter.
- Models (`src/models/props132.js`): roll-off skip (with rubble), tall skip, portable toilet, traffic cone, shipping
  container, lorry (cab + box trailer), slatted bin, cluster mailbox, pedestal box, bike rack, fat-tyre bike, wall
  access plate, stone-block wall, neon shop front, big store sign, yellow litter, metal samples.
- Not copied on purpose: every real name, logo, phone number and number plate; the restaurant's food posters
  (someone else's advertising photographs); what the real shop sells (ours sells teas, incense, water pipes).
- Viewer rebuilt: 579 models, 579 textures, 81 MB, all build without error.
- Weak: the tan brick texture does not tile cleanly along its courses; the lorry and shop front are simple; the
  bike has no chain or cables.

## 133. Weak spots from 131 / 132 fixed (owner chose "Fix weak spots")

- `tools/tex_133.py`: tan brick cut on its own repeat (2 bricks x 2 courses, found by self-correlation; tile is
  1024 x 455, about 0.42 x 0.19 m, so set repeats from that); dead leaf and wasp cut out with GrabCut; new
  `g131_pine_card` (needles as a round cut-out tuft, colour corrected from the lamp-lit photo).
- Lorry rebuilt: cab drawn in side view and extruded (sloped bonnet, raked two-pane screen, sleeper, fairing), grille,
  mirrors, exhaust stacks, tanks, twin rear wheels, fifth wheel; ribbed fridge trailer with unit, legs, doors, underrun.
- Neon shop front rebuilt: self-lit interior (hexagon ceiling lights, shelves of stock, counter, drinks fridge, stool),
  steel canopy with bunting, neon drawn as tube + glow on backing boards.
- Fat bike: knobbly tyres, real mudguards, hub motor, battery in the down tube, chainset + chain + derailleur, cables,
  levers, headlamp, tail lamp, rack stays; leans on its stand.
- New: `makePineTree`, `makePearTree` (instanced leaf / needle cards, one draw each). `makePineBough` / `makePearBranch`
  (the blob samples) are gone.
- Still plain: the pear tree's crown is thin from below; skip and container are simple boxes with detail.

## 134. Library pieces placed where they belong (owner: "use them where they fit")

`streetLibrary()` in phone.js, Midtown and Eastside only. Each model is built once and cloned; copies are merged per
60 m cell. Nothing is placed where a collider, a site or a car already is.
- Back courts (not the body-shop court): one gets a roll-off skip and cone; one a fit-out site (container, portable
  toilet, tall skip, cones); one the lorry; a donation bin where there is room; a utility box or pedestal box each.
- Pavements, by doors: slatted bin at every 5th shop (sometimes a cigarette butt), bike rack at every 9th (a bike at
  some), cluster mailbox at every 3rd flat, pedestal box at every other office, a pipeline marker at a few, dead leaves.
- Counts (west): 15 bins, 8 racks, 2 bikes, 5 mailboxes, 4 pedestal boxes, 2 utility boxes, 2 pipeline signs, 1 skip,
  1 container, 1 toilet, 1 tall skip, 1 lorry, 3 cones, 15 bits of litter. East is similar, plus a donation bin.
- Not placed: neon shop front, big store sign, stone wall, benches, gravel / juniper beds, trees, rock, anthill, wasp,
  road crack, door mat (no fitting spot without changing the street layout; the streets already have benches).
- Test: `tools/devtests/placed.js`. Pedestrians do not yet steer round the new pavement pieces.

## 135. Placed pieces checked; pavement pieces moved out of the walking strip

- People walk a ring 6.05 to 6.65 m from the street centre line (0.35 to 0.95 m from the fronts; road half-width 5,
  pavement to 7). 134 had put every pavement piece at 6.3 to 6.7: all 30 stood in that strip. They now stand at the
  kerb (5.5 m, `KV`), mailboxes / pedestal boxes / signs facing in. Measured: west 30 pieces, east 35, none in the strip.
- Seen up close in the game (`tools/devtests/placed2.js`, free camera with a clear line): skip, tall skip, portable
  toilet, lorry, pedestal box, mailbox, bin, bike at its rack. All stand on the ground, upright, clear of walls.
- The pipeline marker is 4 mm thick and edge-on from along the pavement; it reads only from the road or the fronts.

## 136. People step round what stands on the pavement

Owner: "continue with your problems". Measuring showed the street's own benches, bins, lamps and trees also stand in
the walking strip, not only the 134 pieces, so walkers were inside something on about 5,200 of 137,000 steps per lap.
- `sidestep()` in phone.js + a `steer` hook in people96.js (additive): each walker looks 2 m ahead for fixed things
  under 5 m across, and eases to whichever side keeps them on the pavement (5.3 to 6.78 m from the street centre).
- Measured (`tools/devtests/sidestep.js`, every block, 3 lanes, both ways): west 5,294 -> 392 steps inside something,
  east 5,190 -> 86. Largest step aside 1.14 m. West still has 112 steps just off the pavement edge.
- Not solved: the remaining hits are where two things leave no gap (a bench beside a tree bed) and at corners.
- New photos saved, not yet processed: `photos/10000xxxxx.jpg` (20: Japan street set).
- 136b: library pavement pieces now keep 1.5 m from anything else on the pavement, so a way past always exists.
  West 392 -> 160 steps inside something, 0 off the pavement; east 86, 0. The rest are hand-placed site clusters
  (a standing character beside a sign, a lamp beside a tree bed).
- Photos logged: 40 in `photos/10000xxxxx.jpg` + `1000131923.jpg` (Japan / Korea street sets 1 and 2), unprocessed.

## 137. Japan / Korea street photos -> library (40 photos; first pass)

- Textures (`tools/tex_137.py`, 11 + normals): g137_brick_brown, pavers_grey, pavers_red, granite_wet,
  concrete_stained, grime_wall, needle_floor, weeds, azalea, boulder, fur_tabby. Tried and dropped (bad crops):
  rail ballast, red pine bark, peeling steel, roof tarp.
- Models (`src/models/props137.js`, 19): tabby cat (one clouded eye), calico cat (one eye shut), sparrows at a puddle,
  ring arch, ring-arch walk, boulder, playground slide, stepped wall, bollard, cargo trike, kiosk trailer with bike,
  stand sign, rate-board wall, face wall, junk robot, robot-head sign, display case with number sign, ride-on arcade,
  surface samples. Nothing placed in the game.
- Not copied (other people's work): the anime stickers and shrine, the monster shutter mural, shop / arcade / CD
  names and mascots, the real robot painting, the wall face (ours is a new drawing), the man under the umbrella.
- Bug found and fixed in kit.js `canvasT`: drawings are made twice (again once fonts load) on the same canvas, so any
  drawing that left a setting behind (erase mode) wiped itself on the second pass. Now saved / restored round each
  draw. This also brings back the stencilled words on the 131 donation bin.
- Still to do from these 40: arcade corridor of shutters, izakaya front, canal + rail bridge, rooftop junk terrace,
  rail machine, brick corner building, note desk, alley, tarp roofs with tyres, overgrown bike, repair-stall front.
- Logged, not started: 20 supermarket photos (`photos/10001xxxxx.jpg`: coolers, aisles, pallets, back room, bread racks).

## 138. Supermarket photos + more street scenes -> library

- Textures (`tools/tex_138.py`, 4 + normals): g138_floor_polished, floor_backroom, cooler_panel, tile_dark.
- Models (`src/models/props138.js`, 24). Shop floor: gondola shelving (juice / granola / bread / pet food), drinks
  cooler, freezer doors, brand tower, case-stack display, cardboard shipper, wet-floor sign, dome bin, an aisle sample.
  Back room: pallet stack, ice pallet, milk-crate stack, bread-tray stack on a dolly, roll cage, strip curtain,
  walk-in cooler room, safety post, spray bottle, hand scanner. Street: shutter bay, arcade corridor, tarp roof with
  tyres, bike overgrown by a hedge, rail maintenance machine.
- Stock is instanced coloured boxes / bottles / bags (one draw per kind per fixture), no labels: every product in the
  photos is a real brand. Signs and the one brand ("HAYWIRE") are invented. The shoppers in one photo are not used.
- Not done from the photo sets: izakaya front, canal + rail bridge, rooftop junk terrace, brick corner building,
  note desk, graffiti alley, repair-stall front. Nothing from 137 / 138 is placed in the game.

## 139. The market in Old Town South made usable (owner: "do what makes the most sense")

A second supermarket would have duplicated the Freshway grocery the area already has, so that one was finished instead.
- `marketSite()` in phone.js. A clerk on the till (`CHARACTERS.clerk`, Dell Marsh, nervous; own topics "the scanner",
  "the stock room"; gives errands like any keeper). `PLACES.market`: bread, milk, soup, energy drink, ice.
- Nine goods stand on the checkout counter: look and take, or buy from the clerk. Hand-set goods (`A.picks`) hide when
  taken and return after ten minutes; the look / take code now reads both shop shelves and these.
- New goods models: Loaf of bread, Carton of milk, Tin of soup, Energy drink (walk faster), Bag of ice. Food feeds.
- Dressing from the library, each only if its spot is clear: scanner on the counter, wet-floor sign, crisp stand;
  two pallets, roll cage, bread trays, a dropped spray bottle in the stock room; outside a dome bin, two bollards,
  the case stack by the glass, the tabby by the door and the calico round the back. The ice pallet found no clear spot.
- Test: `tools/devtests/market.js` (take, buy, eat, topics; 0 errors; 52 to 190 draws at the five views tried).
- Not checked: whether pedestrians / cars in the lot meet the new outside pieces; the calico was not seen in a picture.

## 140. The last seven scenes from the Japan / Korea photos -> library

`src/models/props140.js`: izakaya front (tiled eave, lantern row, big red lantern, chalked flowers, name plaques),
canal with a girder rail bridge and a yellow train, rooftop junk terrace, brick corner building (cut corner door,
arched windows, cornice, awnings), note desk, graffiti alley (walkable: has `areas`), repair stall (awning, crowded
window, number sign, OPEN, lamp; reuses the 137 display case and hi-fi robot). All names and drawings invented.
Every photo sent so far is now processed. None of these seven is placed. Viewer: 631 models, 610 textures.

## 141. High-plains photos -> library (6 photos)

- Textures (`tools/tex_141.py`): g141_rust_roof, siding_white, sand_pebbles, dry_brush, dry_grass (+ normals),
  g141_plywood (one sheet), and two backdrops made to wrap round (each half mirrored): g141_horizon (cloud over the
  mountains), g141_clouds (layered cloud).
- Models (`src/models/props141.js`): arched barn (curved rusted roof in strips, white corrugated walls), junk pile
  against it, billboard on one pole with catwalk and caged ladder (advertiser invented: "Ridgeline Roofing", 555-0172),
  speed limit sign, bare tree, tumbleweed, dry lot, horizon backdrop ring.
- Not placed. The game's sky is night; the backdrops are daylight, so using them would change the look (owner said
  leave the look) - they wait for a daytime area or the owner's say. The person's shadow in the billboard photo is not
  in any texture.

## 142. Figure lamp posts -> library (3 photos)

`src/models/props142.js`: `makeFigureLamp` (a post bent into a figure: knee, hip, a second short leg, narrow chest,
pale joint caps, one arm holding a lit round sign, a globe lamp in a wire cage for a head, painted light pool on the
ground), two paint styles ('flowers', 'stripes'; ours, not the brands on the real ones), `makeFigureLampPair`,
`makeWoodPowerPole` (cross-arms, insulators, transformer, wires). Not placed.

## 143. Odds and ends from the owner's photos (15 photos)

- Textures (`tools/tex_143.py`): g143_clay_cracked, wood_counter, steel_scratched, plaza_tile, pole_steel, plaster,
  foam (+ normals).
- Models (`src/models/props143.js`): two dried clay heads, plaster bust being painted, an old brick-shaped handheld
  console ("Tinker POCKET", invented), a case of 16 cartridges with invented games, a tin of oddments (two pocket pets,
  cartridges in sleeves), a ten-ounce silver bar (our own die), a drink and a foil wrap, two ink drawings on a
  scratched steel door (our drawings in that manner), a station plaza (loop road, planted island, domed stair, shelter).
- Not used: the real games, consoles' names, the toy box, the store hiring poster, the people walking, the sticker,
  the photos' shop signs. Not placed in the game.

## 144. Park edge, bus stop, car park (photos/1000137323..347)

- Textures (`tools/tex_144.py`): g144_corten, corten_streaked, dry_ground, dry_litter, pavement, wood_grey, wood_grey2,
  wood_knot, binbag, wood_bolted, endgrain, wood_furred (+ normals); cut-outs g144_glass_shard, g144_leaf_dry.
- Models (`src/models/props144.js`): park sign (rusted post, curved panel; name invented), rebar rubble, the bus-stop
  litter bin with ash tray, a heap of bin bags, broken glass, twigs (modelled; the cut-out failed), dog mess in leaves,
  a pen, a green bottle (no brand), a cup and straw, a dropped charity leaflet (our own words), bolted timber, the
  two-basket shopping trolley, the car-park lamp, surface samples. Not placed.
- Not used: the real food bank's leaflet text, the brand on the bin liner's cans, the store's sign behind the lamp.
- Logged, not started: 6 more store photos (photos/1000137348..353: brown siding, sports drinks, cut fruit, a sale
  bin, hand gel, a time-clock tablet). Packaging is all brands; the staff notice and time clock are workplace screens.
- Shopping cart rebuilt after the owner's markup (the gap between the baskets): one bent frame tube a side, the bottom basket's tall leaning back reaching up under the top basket, finer wire, low tray between the rear wheels, forked castors. Logged: 3 more photos (two speckled counter tops, hanging toys).

## 145. Store, desk, out and about (29 photos: 1000137348..357, 10000751xx..86095)

Owner: "don't leave anything out, just change stuff if you need to... if you have an issue ask me first."
- Textures (`tools/tex_145.py`): cedar siding, two speckled counter tops, glitter airport tile, dock concrete,
  freezer wall, sealed shop floor, dragon skin; the owner's four drawings cut from the paper (used as drawn); the
  owner's notes page as photographed.
- Models (`src/models/props145.js`, 25): produce sale bin, cut-fruit cooler, sports-drink rack ("Surge"), time clock,
  hand gel ("CleanHands"), hanging squeeze toys ("Squishies"), dairy rack on rollers, aluminium stock cart, step stool,
  shelf-counting robot ("Dot"), blue soda shelf ("Orbit VOLT", from the game-branded soda), dragon pipe, note card
  (numbers changed), gamepad ("Pixelworks"), purple handheld with chews and a tea can ("Mesa"), console tub ("Orbis"),
  notes page, drawing cards, sketch wall, used SUV with dealer tags ("Elm Auto"), airport kiosk ("Tern Air"), gallery
  wall text (invented artist "Oda Merrin", our own text), night shop window with hero cut-outs (our silhouettes), a
  katakana sign ("Capsule King!" in the same lettering), surface samples. Not placed.
- Changed, not dropped: every brand, the airline, the game soda, the real artist / curators / museum, the card numbers.

## 146. Everything left out of earlier batches, now made (owner: "don't just disregard the pictures I send")

`src/models/props146.js` (17): fan's shrine table (our idol group "STELLA / HOSHI 4", our girl drawn by `girl()`),
sticker set (watching-eye, occult girl, bean bun), pole sticker (our ramen shop), railing face, no-smoking standee (our
girl), the man under the umbrella (an invented figure, same place and pose, our green sign), shoppers with trolleys
(invented people), a long shadow with nobody casting it, plum sour can, hamburger-sandwich packs, banana-cake snack,
CD shelf (our covers), boxed figures (our heroes), hiring poster (ours, adults only), retro screen (our pixel game and
line), cheese-chicken shop front ("Milo's Melt"), grey facade with air-conditioners. Not placed.
Still open from older notes, not in these batches: the orange full moon and the inspo7 lakeshore / snowy forest
(sky ideas), and the face profile photos for the photo-faced character.

## 147. The last unused older photos

inspo6 orange full moon -> `g147_moon_orange` + `makeHarvestMoon` (props141); inspo7 foggy lakeshore and snowy pine
forest -> `g147_lake_fog`, `g147_snow_forest` + `makeLakeFogBackdrop`, `makeSnowForestBackdrop`. Library only (they
change the night look, which the owner asked to keep). Every photo sent so far is now used in the library.
- 147b weak spots refined: boxed figures now in open window boxes (figure visible, contrasting colour); the umbrella hangs from where the posed hand actually is; the lake backdrop shows the shore, stumps and the tree.
- 147c: the foggy-lake backdrop removed (owner: it made no sense; the mirroring doubled the stumps). Owner's rule:
  if a photo has nothing usable for a thing, don't force it into one. The lake photo was then deleted at the owner's word.
- Owner's rule (147c): when a photo has nothing useful, say so; the owner will usually say to delete it, and then the
  photo itself is deleted from photos/, not left unused.
- 147d: snow-forest backdrop removed. Owner: a far-off backdrop works only for things that are really far off (sky,
  mountains); anything with a near tree or stump in it cannot sit on the horizon. Kept: the sky over the mountains.
- 147e: the snowy-pine-forest photo deleted at the owner's word.
- Owner's rule (148): do not tell the owner that something has not been tested on the phone. The owner tests when
  they get round to it, often away from the computer, and does not report every test. Say what was checked here
  (headless) only when it matters to a specific result, never as a standing "not tested on your phone" line.

## 148 — Filling gaps from the textures we already have
161 new library items, built only from textures already in the library (via `src/models/fill_kit.js`), so they sit with the photographed stuff:
- **Fill: street** (22) fences, gates, barriers, road signs, meters, flagpole, fountains, fire escape, scaffold, manhole, meter box.
- **Fill: yard + play** (21) swings, see-saw, sandpit, hoop, picnic table, grill, shed, compost, washing line, kennel, pool, porch swing.
- **Fill: garage + works** (19) workbench, tyres, jack, hoist, shelving, compressor, generator, fuel island, car lift, cement mixer.
- **Fill: home** (27) piano, radiator, fireplace, fan, laundry, bunk bed, cot, fish tank, plants, water heater, fuse board, dining set.
- **Fill: public places** (21) laundrette, gym, bar, pool table, jukebox, pews, lectern, card catalogue, carrel, ticket dispenser, stage.
- **Fill: roofs + walls** (15) water tower, vents, dish, aerial, chimney, condenser, window AC, skylight, hatch, solar, gutter, caged ladder.
- **Fill: rough ground** (17) boulders, rock pile, mossy rock, stump, logs, hedge, bush, dead tree, leaves, puddle, reeds, brambles, culvert.
- **Fill: kitchens** (19) units with sink, cooker, fridge, hood, microwave, kettle, dish rack, diner prep table, fryer, range, pass, walk-in.

## 149 — Blend textures, don't repeat them (owner's standing note)
- Textures may be reshaded, colour-matched, filtered, cut up and recombined. Parts next to each other should sit in one
  palette, not clash. Never let one texture visibly repeat (the old ceiling problem).
- Tools in `src/models/texmix.js`, on by default for every fill-set texture through `T()` in fill_kit:
  - `noTile` shader: every repeat is shifted and flipped at random, with soft seams, a slow light/dark wash, and a gentle shared grade (saturation 0.9, contrast 0.94).
  - `match: '#hex'` option: tints so the texture's average colour lands on a target, so wood, stone and tile in one piece agree.
  - `patchwork()` / `rustPaint()`: a clean painted base with rust blotches cut out of `rusty_paint` and pasted three times (as is, upside down, half turned), faint run-stains, then one grade over it. It replaced the camo-repeat rusty paint everywhere in the fill sets.
- The kitchen run is now wood cabinets, with the worktop and tiles colour-matched.

## 150: No-repeat pass on the whole game (phone game + library)
- `src/texpolish.js` is imported right after texcache.js in `src/phone.js` and `viewer.html`. It tags every loaded texture with its file name and patches every textured material when it compiles. No model file had to change. The big-town files are not touched (frozen).
- How each texture is treated is set in `src/tiling.js`, written by `tools/classify_tiling.py`. The script decides by seam test, name rules and hand lists, all checked by eye on contact sheets:
  - `full`: organic surfaces. Each repeat is shifted and flipped at random, with soft seams.
  - `flip`: square tiles, including the drop-ceiling tile ab_ceil. Each repeat is flipped at random.
  - `tone`: grids (brick, planks, siding, paving). The layout is kept; they get a stronger light/dark wash.
  - `off`: signs, photos, food, faces, cut-outs. Untouched.
  - Every mode except `off` also gets the shared gentle grade.
- The normal map follows the same shuffle and flips (bump directions flipped to match), so bumps stay on their pits.
- Each object's position seeds the shuffle (a flat varying, rounded), so identical copies differ. A ceiling of separate identical tiles no longer repeats tile for tile.
- `?notp` on the URL turns the pass off, for comparing.
- New textures: rerun `python3 tools/classify_tiling.py` and check the new ones on a contact sheet.
- Sweep: every library model (870) was screenshotted with the pass on and checked. No artifacts. Black items in the sweep were only textures still loading.
- Fixed along the way:
  - Normal maps now follow the shuffle (before, bumps landed off their pits and looked like fine noise).
  - A seed-precision bug that drew streaks.
  - ab_ceil moved to flip-only, because it has tile borders printed in it.
  - Box hedge repeats made smaller.
  - The laundry basket's drawn checkerboard replaced with the braided library texture.
  - Viewer: 8 models crashed the triangle counter (geometry with no position data).
  - Bundled library: 22 models failed because the bundler renames clashing names (`mats` became `mats9`, `makeWallSign` became `makeWallSign2`). The build no longer renames identifiers, and the viewer's name checks ignore an added number.

## 151: The owner's PSX packs, imported into the library
- Packs: Horror-Fantasy Megapack 1, Modular PSX Sewer Kit 1, Street Furniture 1, PSX Rigged Character Bases 1.2.
- Unpacked into `.packprev/` (git-ignored). `tools/import_psx.py` copies what is used into `assets/textures` as `px_*`:
  - models (.glb/.fbx) ride in the texture packs as raw files;
  - textures are capped at 512 px.
- Left out:
  - the "lara" textures (a famous game character's look);
  - the underwear-only textures;
  - the cardboard FBX (FBXLoader can't read it; the sewer kit has cardboard boxes);
  - f_shorts_base.png (truncated in the upload).
- The Bottles can label looked like a real beer brand and was painted over with a made-up one ("ELM PALE").
- `src/models/psx_kit.js`: loads by URL string (so the single-file builds serve the files), parses with FBXLoader/GLTFLoader (vendored from r170 with fflate, NURBS and SkeletonUtils), and rebuilds FBX materials from px_ textures by material name.
- The monsters only ship a T-pose, so `glbRig` poses them: arms down by world-space aim (works for both the CC_Base and Mixamo rigs), a breathing sway, and an occasional head twitch.
- Library groups:
  - PSX pack: monsters (23);
  - PSX pack: people (35 dressed bases + line-up; head tone matched to each body texture);
  - PSX pack: street props (12);
  - PSX pack: sewer props (139);
  - PSX pack: sewer architecture (56).
- `px_*` textures are classed `off` for the no-repeat pass (they are atlases).

## 152: PSX pack people walk the town (owner's choice: "PSX people as NPCs")
- The pack's FBX bases carry no usable rig. `src/models/psx_rig.js` rigs each one onto the same skeleton the town's own people use (body97 makeBody names and layout, facing +z) with the same walk pose, so `makePeople` walks them, steers them, and knocks them over like everyone else:
  - joints are read off the mesh (hip width, hand tips, toes);
  - each vertex is weighted to its two nearest bones;
  - the A-pose arms are baked down to hang beside the body.
- `makePeople` takes an optional `make(i)`. The phone game preloads the 4 bases (top-level await) and makes every second person one of the 35 PSX looks.
- Phone build: px_* model files are packed only when an imported file names them, and all px_ch_ textures are packed when psx_rig is in. The phone file is 48.1 MB (was 44.7).
- Library: "PSX pack: people walking" (one walker, a walking row of 8).
- 152b: the owner's tools pack (Axe01, Pickaxe01 OBJ) is in "PSX pack: street props" (`objTool`, OBJLoader vendored from r170). Its texture AxePickaxe01_a.jpg was not in the zip (the .mtl points at the author's disk), so for now the head is library steel and the handle oak. Swap in the real texture if it comes.

## 153: The owner's OBJ packs, dressed from library textures only (owner: "use the textures we have")
- The owner leaves the packs' own textures out on purpose. Every model is dressed from library textures instead, through fill_kit `T()`, so the no-repeat shader, the shared grade and colour matching apply. The pack UVs point into atlases we don't have, so faces get real-world UVs by facing direction (`objDress` in psx_kit). Card foliage keeps its own UVs (`keepUV`) with our cut-out textures.
- Packs: tools, lights, office, signs, buildings and fairground (hand-made, `psx_objs.js`, 24). Then by generator: exercise 41, foliage 16, traffic 22, utilities 40, vehicles 19, residential 25, outdoors 28, misc 37, furniture 22, food 32, finances 20, construction 13, electronics 42.
- `tools/gen_psx_objs.py <unpacked pack dirs...>` copies each model to `px_o_<pack>_<name>.obj` and writes `src/models/psx_g_<pack>.js`, one `E()` line per model. The look comes from a keyword table on the name: base skin, zones, real size, sign faces.
- `src/models/psx_auto.js` is the rule engine:
  - skins are short strings ('paint:#hex' colour-matched, 'wood', 'rubber', 'net', 'stripes', 'tile', 'cut:<tex>', ...);
  - shared part rules: wheels, tyres and tracks rubber; windows glass; hoses rubber; nets wire;
  - zones: top, low, up, side, height bands, an axis split, a trunk radius, and a lamp glow at the underside of the top;
  - drawn faces on signs, screens, the ATM, arcades, the billboard and the dartboard, all with made-up names.
- The pool's Godot water shader stands in as `makePxPoolWater` (animated sewer-kit water texture).
- Line elements in the OBJs (ropes, guides) are stripped before parsing, because OBJLoader turns a whole part into lines otherwise. The tarp and the tennis racket keep theirs as ropes and strings.
- Re-run the generator when packs are re-sent; tune looks in its table, not in the generated files.
- 153b: vehicles are dressed by hand in `src/models/psx_vehicles.js`; the generator skips that pack. The generic pass had painted single-mesh car bodies one colour. Now:
  - windows come from each body's cabin faces (Car01 is a van, so cab only);
  - lights, grille, bumpers, ELM COUNTY plates and the POLICE doors are placed by raycast onto the body;
  - the police car has a black lower band and a red/blue bar;
  - bumper cars: glossy shell, rubber skirt, seat, spark and number;
  - excavator: glass cab, drawn tracks and chrome rams;
  - military: drawn NATO, desert or field-grey camo, track links, dark road wheels and gunmetal guns;
  - the jet is two-tone with a gold canopy and white stores.
- `objDress` now flips parts whose faces are wound inward. Car01 was inside out; the fix applies to every OBJ model.
- 153c (owner's markup on the close-ups): car windows and the police band are no longer picked per triangle. Low-poly faces span the window line, so that came out as jagged dark wedges that read as holes.
  - Each car now has a drawn livery per side, in 'fit' UVs: the windows are traced from the body's own roofline (sampled from the geometry), with a B pillar, door seams, handles, a sill, the police band and POLICE lettering. The front and back get a skin with a clean screen line (a van gets back doors).
  - The roof uses the same smooth paint plus a faint pass of library scratched metal.
- `objDress` options: `uv: { key: 'cyl' | 'fit' }` (round-wrap, or fitted 0..1 per side, mirrored so lettering reads from outside), and grime vertex colours on every OBJ model (darker toward the ground, blotchy stains; `grime: 0` turns it off).
- 153d (owner: "get up in there"): the utilities pack is detailed by hand in `src/models/psx_utilities.js`; the generator skips it.
  - Fitted skins: a library texture painted over with the real thing's detail (ribs, seams, stencils, worn stickers, rust runs, scuffs), mapped round the object ('cyl') or per side ('fit').
  - Modelled parts: lid rims, bung caps, jerry-can handles and spout, crate corners, fuse-box handle and hinges, locker handles and padlock, radiator valve, the water in the bucket.
  - The same approach should roll out to the other packs.
- 153e: electronics detailed by hand in `src/models/psx_electronics.js`, with the shared kit `src/models/psx_detail.js`: skins, plus parts placed on any face (screens, knobs, buttons, LEDs, key beds, vents, cables, rods, feet, labels).
  - Made-up names: PLAYBOX, TINKER POCKET, ELMVISION, NOVA SYSTEMS, COLDWELL, ELM TONE, film and game titles.
  - The pinball machine (owner's markup: "wallpapered over") is built as a machine: playfield art in its own tilted frame (bumpers, flippers, slings, rails, ball, glass, side rails, lockdown bar), a lit backglass with score display and grille, a coin door, plunger and flipper buttons; side art only on the sides.
  - Top-face 'fit' UVs flipped so art on lids reads from the front.
- 153f: the pinball machine has painted art (`src/models/pinball_art.js`), all made up. The backglass 'MIDNIGHT TILT': night sky, a moon with a sad face behind a cloud, two skylines with lit windows, a water tower, a neon MOTEL/VACANCY sign, a road with a car's headlights, a figure under a streetlamp with red eyes, chrome-and-neon title, a frame of bulbs, '1–4 PLAYERS', 'INSERT COIN', 'ELM AMUSEMENT CO. 1987'. The playfield: the moon motif, top lanes with rollovers, a ramp, TILT targets, lit arrow inserts, bonus multipliers, inlanes and the drain.
