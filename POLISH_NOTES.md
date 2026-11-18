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
