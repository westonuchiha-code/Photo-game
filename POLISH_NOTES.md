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
