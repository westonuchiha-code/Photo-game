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
