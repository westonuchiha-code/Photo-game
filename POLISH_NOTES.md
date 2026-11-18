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
- Building rebuilt with real window openings; the 7 new units + the living room each have windows that
  match the outside. The 3rd floor still has no interior (curtained windows only).
- Possible next: furniture variety per unit (only 3 layouts), unit kitchens on the upper floor need
  backsplash tile, bathrooms aren't modelled, hallway ceiling could use the drop-ceiling tiles from the
  stairs photo.
