// Old Town South (phone area). The southern part of the big town's old town, lifted across as it stands: the lot and
// the boarded-up storefront, the tire shop, the street row, the rocks and trees, the sidewalk objects, the apartment
// building, the junked van, the tree with a door, the alien formation, the scooter, the wheel display, the hooded
// figure, the police vehicles, the grocery, the roadside shrines, the house fronts, the boarded blue house and the dirt
// construction site. The placement code between the marker lines is main.js lines 457-640, 656-680, 708-844 and
// 846-974, unchanged (the big town is the reference); this file only supplies what that code leans on.
// Left out: the restaurant's own inside (its walls, lights, furniture, the food and pictures in it).
//   buildOldSouth({ add, rect, circle, colliders }) -> { areas, ground(x, z, prevY), cars, tick(t, dt, pos) }
import * as THREE from 'three';
import { plane } from '../world/util.js';
import { makeMaterials } from '../materials.js';
import { makeAbandonedBuilding, makeStreetLamp, makeFireHydrant } from '../models/abandoned.js';
import { makeTireShop } from '../models/tireshop.js';
import { makeRustyPole, makeWalkSignalPole } from '../models/street.js';
import { makeStreetBuilding } from '../models/buildings.js';
import { makePaverSidewalk, makeDrainCover, makePaverCrosswalk, makeTactilePlate, makeCracks, makeUtilityLid, makeTrafficIsland, makeDirtLot } from '../models/streetground.js';
import { makeGrocery } from '../models/grocery.js';
import { makePatrolCart, makePatrolScooter } from '../models/police.js';
import { makeCreep } from '../models/creep.js';
import { makeScooter, makeBattery } from '../models/scooter.js';
import { makeAlienFormation } from '../models/alien.js';
import { makeApartment } from '../models/apartment.js';
import { makeNewsBox, makeParkingSignBlock, makeParkingRamp, makeTealStorefront, makeRabbitSculpture } from '../models/locations.js';
import { makeSpruce, makeCherry, makePaleTree, makeOak, makeTreePit, makeMulchBed, makeDoorTree } from '../models/trees.js';
import { makeRockBed, makeGrassTufts, makeCurbWithLeaves, makeLooseLeaves, makeBikeRack } from '../models/ground.js';
import { makeStatueShrine, makeStoneShrine } from '../models/shrines.js';
import { makeTireWheel } from '../models/wheel.js';
import { makeHouse } from '../models/houses.js';
import { makeBlueHouse } from '../models/bluehouse.js';
import { makePlywoodSheet, makeGlassShards, makePasteWall, makePickupZone } from '../models/misc27e.js';
import { makeDumpTruck, makePipeBarrier, makeSiteSign, makeWeeds } from '../models/dumpsite.js';

export function buildOldSouth({ add, rect, circle, colliders }) {
const mats = makeMaterials();
const X0 = -8, X1 = 8, Z0 = -5, Z1 = 5, DOOR_Z = -1.3;   // the restaurant's footprint
const townCars = [];   // [type, opts, x, z, heading(+z nose)]
const H90 = Math.PI / 2;
// ======== main.js 457-640 ========
// ------------------------------------------------------------------ boarded-up storefront across the lot
// (four "abandoned" photos) with the street lamp and fire hydrant from the side photo.
const abandoned = makeAbandonedBuilding();
const AB = { x: X1 + 11.5, z: 0 }; // facade line, facing -x (toward the signs and the restaurant)
abandoned.position.set(AB.x, 0, AB.z);
abandoned.rotation.y = -Math.PI / 2;
add(abandoned);
add(plane(mats.sidewalkLeaves, X1 + 9, AB.x + 1.45, -6, 6.5, 0.004, 1.5)); // runs into the recessed doorways
// local (x, z) -> world (AB.x - z, AB.z + x) for this rotation
for (const [x0, x1, z0, z1] of abandoned.userData.colliders) rect(AB.x - z1, AB.x - z0, AB.z + x0, AB.z + x1);
const lamp = makeStreetLamp();
lamp.position.set(X1 + 9.4, 0, 0.9);
add(lamp);
circle(lamp.position.x, lamp.position.z, 0.3);
const hydrant = makeFireHydrant();
hydrant.position.set(X1 + 9.4, 0, -4.2);
hydrant.rotation.y = -Math.PI / 2;
add(hydrant);
circle(hydrant.position.x, hydrant.position.z, 0.25);

// ------------------------------------------------------------------ tire shop (two tire-shop photos)
// Faces south (+z) onto a big cracked concrete lot, north-east of the restaurant.
const TS = { x: 26, z: -17 };
add(plane(mats.lotConcrete, 12, 13, -32, -8, 0.003, 4));
add(plane(mats.lotConcrete, 17, 42, -32, -8, 0.003, 4));
add(plane(mats.lotConcrete, 13, 17, -32, -23, 0.003, 4));
const tireShop = makeTireShop();
tireShop.position.set(TS.x, 0, TS.z);
add(tireShop);
for (const [x0, x1, z0, z1] of tireShop.userData.colliders) rect(TS.x + x0, TS.x + x1, TS.z + z0, TS.z + z1);
const interactables = [];
for (const d of tireShop.userData.doors) {
  const [a, b, c, e] = d.gap;
  const col = { type: 'box', minX: TS.x + a, maxX: TS.x + b, minZ: TS.z + c, maxZ: TS.z + e };
  colliders.push(col);
  interactables.push({ ...d, x: TS.x + d.at[0], z: TS.z + d.at[1], t: 0, target: 0, col,
    speed: d.kind === 'garage' ? 0.6 : 2.2 });
}

// ------------------------------------------------------------------ rusty poles on the sidewalk (rusty-pole photos)
const rustyPoles = [];
for (const [x, z] of [[10.4, -7.2], [10.4, 7.6]]) {
  const p = makeRustyPole();
  p.position.set(x, 0, z);
  add(p);
  rustyPoles.push(p);
  circle(x, z, 0.22);
}

// ------------------------------------------------------------------ street row (wall-texture photos)
// Facing the lot from the south, one building per wall texture.
add(plane(mats.sidewalk, X1 + 0.2, 48, 9, 12, 0.003, 1.5));
const streetRow = [];
const ROW_Z = 12;
let rx = 10;
for (const [wall, w, floors] of [['red_brick', 7, 2], ['olive_stucco', 5.6, 1], ['red_sandstone', 7.6, 3], ['teal_stucco', 5.6, 2], ['gray_tile', 4.6, 1], ['gray_brick', 6, 2]]) {
  const d = 10;
  const b = makeStreetBuilding({ wall, w, d, floors, seed: streetRow.length + 3 });
  b.position.set(rx + w / 2, 0, ROW_Z + d / 2);
  b.rotation.y = Math.PI;
  add(b);
  streetRow.push(b);
  rect(rx, rx + w, ROW_Z, ROW_Z + d);
  rx += w + 0.25;
}

// ------------------------------------------------------------------ rocks, grass, leaves (rock / leaf photos)
// River-rock bed with dry grass tufts between the sidewalk and the rental sign.
add(makeRockBed(11.2, 16.8, 3.6, 8.6, { seed: 2 }));
const tuftSpots = [];
{
  let s = 7;
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 22; i++) tuftSpots.push([11.5 + r() * 5, 3.9 + r() * 4.4]);
}
add(makeGrassTufts(tuftSpots));
// Narrow rock strip along the restaurant sidewalk (sidewalk-rocks photo).
add(makeRockBed(10.6, 11.2, -9.5, 2.4, { seed: 5, density: 500 }));
// Curb between the lot and the street-row sidewalk, leaves drifted in the gutter.
// Curb split for the crosswalk ramp (paver/curb photos).
add(makeCurbWithLeaves(10, 29.6, 9.0, { dir: -1 }));
add(makeCurbWithLeaves(32.4, 48, 9.0, { dir: -1, seed: 8 }));

// ------------------------------------------------------------------ ground & sidewalks (paver / crack / lid photos)
// Herringbone paver sidewalk in front of the first half of the street row.
add(makePaverSidewalk(10, 29.6, 9.0, 12.0));
for (const x of [14.2, 24.6]) { const d = makeDrainCover(); d.position.set(x, 0, 10.3); add(d); }
// Paver crosswalk across the street, through a raised island, to the tire-shop lot.
add(makePaverCrosswalk(29.8, 32.2, -8, 9.0));
add(makeTrafficIsland(26.5, 35.5, -1.2, 0.8, [29.6, 32.4]));
rect(26.5, 29.6, -1.2, 0.8);
rect(32.4, 35.5, -1.2, 0.8);
add(makeTactilePlate(31.0, 9.45));
add(makeTactilePlate(31.0, -8.45));
// Walk signal poles at both ends of the crosswalk (walk-button / ped-signal photos).
const walkPoles = [];
for (const [x, z, ry] of [[32.7, 9.9, Math.PI], [29.3, -8.9, 0]]) {
  const p = makeWalkSignalPole();
  p.position.set(x, 0, z);
  p.rotation.y = ry;
  add(p);
  walkPoles.push(p);
  circle(x, z, 0.24);
}
// Cracked concrete slabs on the rest of the sidewalk, a utility lid with locate paint.
add(makeCracks(32.6, 47.6, 9.3, 11.8, 9, 4));
add(makeUtilityLid(38.5, 10.6, Math.PI / 2));
// Dirt lot behind a blue-screened fence at the end of the street (dirt-lot photo).
add(makeDirtLot(42.5, 46.5, -7.5, 3.5));
rect(46.5, 46.7, -7.5, 3.5);
add(makeUtilityLid(43.6, 1.6));
const lotLamp = makeStreetLamp();
lotLamp.position.set(41.8, 0, -2);
add(lotLamp);
circle(41.8, -2, 0.3);
add(makeLooseLeaves(10, 46, 6.5, 11.8, 90));
add(makeLooseLeaves(8.2, 11, -9, 9, 40, 23));
// Teal bike rack on the street-row sidewalk (curb photo).
const rack = makeBikeRack(5);
rack.position.set(22.5, 0, 10.3);
add(rack);
rect(22.4, 25.6, 10.0, 10.6);

// ------------------------------------------------------------------ trees (bark / tree photos)
// Spruce with holiday lights + cherry in a red mulch bed east of the tire shop.
const bed = makeMulchBed(3.4);
bed.position.set(38.8, 0.012, -12.2);
add(bed);
const spruce = makeSpruce({ seed: 4, height: 10 });
spruce.position.set(38.6, 0, -12.6);
add(spruce);
circle(38.6, -12.6, 0.6);
const cherry = makeCherry({ seed: 11 });
cherry.position.set(41.2, 0, -9.8);
add(cherry);
circle(41.2, -9.8, 0.35);
// Street trees in leaf-filled pits along the paver sidewalk: pale bark and oak alternating.
const streetTrees = [];
[[12.2, makePaleTree, 5], [19.0, makeOak, 7], [27.6, makePaleTree, 9], [35.0, makeOak, 13], [42.0, makePaleTree, 17]].forEach(([x, make, seed]) => {
  const pit = makeTreePit(1.3, 1.3);
  pit.position.set(x, 0, 10.4);
  add(pit);
  const t = make({ seed });
  t.position.set(x, 0, 10.4);
  t.rotation.y = seed;
  add(t);
  streetTrees.push(t);
  circle(x, 10.4, 0.35);
});

// ------------------------------------------------------------------ objects & locations (objects/locations photos)
// Underground parking ramp down from the tire-shop lot, with a lit tunnel and roll-up door.
const ramp = makeParkingRamp({ x0: 13, x1: 17, z0: -9, z1: -17, zDoor: -23, depth: 2.8 });
// built facing north, then turned 180 deg about its centre so the open top of the ramp faces the
// lot by the tire shop (south end, z -23) and the garage door is at the north end (z -9)
const rampPivot = new THREE.Group();
rampPivot.position.set(15, 0, -16); rampPivot.rotation.y = Math.PI;
ramp.position.set(-15, 0, 16); rampPivot.add(ramp);
add(rampPivot);
const rampFloorY = (x, z) => ramp.userData.floorY(30 - x, -32 - z);
rect(12.75, 13.0, -23, -8.8);   // side walls / parapets (you enter from the open end)
rect(17.0, 17.25, -23, -8.8);
rect(13, 17, -9.0, -8.6);      // garage door
const parkSign = makeParkingSignBlock();
parkSign.position.set(18.2, 0, -8.4);
add(parkSign);
circle(18.2, -8.4, 0.5);
// Teal storefront at the east end of the lot.
const tealShop = makeTealStorefront({ number: '714' });
tealShop.position.set(45, 0, -21);
add(tealShop);
rect(41, 49, -26, -16);
// Red news box by the restaurant door; rabbit sculpture on the paver sidewalk.
const newsBox = makeNewsBox();
newsBox.position.set(8.55, 0, -3.1);
newsBox.rotation.y = Math.PI / 2;
add(newsBox);
circle(8.55, -3.1, 0.3);
const rabbit = makeRabbitSculpture();
rabbit.position.set(16.0, 0, 10.3);
rabbit.rotation.y = Math.PI + 0.4;
add(rabbit);
rect(15.5, 16.5, 9.8, 10.8);

// ======== main.js 656-680 ========
// ------------------------------------------------------------------ apartment building (apartment photos)
// Faces west across a sidewalk toward the dirt lot. local (x, z) -> world (AP.x - z, AP.z + x)
const AP = { x: 57, z: -1 };
add(plane(mats.sidewalk, 46.8, 52.2, -10, 8, 0.003, 1.5));
const apt = makeApartment();
apt.position.set(AP.x, 0, AP.z);
apt.rotation.y = -Math.PI / 2;
add(apt);
for (const [x0, x1, z0, z1, y0, y1] of apt.userData.colliders) {
  colliders.push({ type: 'box', minX: AP.x - z1, maxX: AP.x - z0, minZ: AP.z + x0, maxZ: AP.z + x1, ...(y0 !== undefined ? { y0, y1 } : {}) });
}
{
  const d = apt.userData.door;
  const [a, b, c, e] = d.gap;
  const col = { type: 'box', minX: AP.x - e, maxX: AP.x - c, minZ: AP.z + a, maxZ: AP.z + b };
  colliders.push(col);
  interactables.push({ name: 'front door', kind: 'door', setOpen: d.setOpen, x: AP.x - d.at[1] + 0.6, z: AP.z + d.at[0], t: 0, target: 0, col, speed: 2.2 });
}
for (const d of apt.userData.unitDoors) {
  const [a, b, c, e] = d.gap;      // local x range a..b, z range c..e
  const col = { type: 'box', minX: AP.x - e, maxX: AP.x - c, minZ: AP.z + a, maxZ: AP.z + b, y0: d.y, y1: d.y + 1 };
  colliders.push(col);
  interactables.push({ name: 'apartment door', kind: 'door', setOpen: d.setOpen, x: AP.x - d.at[1], z: AP.z + d.at[0], y: d.y, t: 0, target: 0, col, speed: 2.2 });
}

// ======== main.js 708-844 ========
// ------------------------------------------------------------------ junked van behind the tire shop (old-van photo)
townCars.push(['oldvan', { name: 'old van', color: '#8a857a', roofColor: '#a9ad9f', dust: 0.7, rim: 'steel', plate: 'ELM 1977',
  bands: [[0, 0.66, '#4a3a33'], [0.93, 0.955, '#6b4a3a'], [0.985, 1.005, '#9a7e74']] }, 21.5, -26.5, 0.35 + H90]);

// ------------------------------------------------------------------ tree with a door (tree-door photos)
// In the gravel + leaf patch by the rental sign, door facing the sidewalk.
const doorTree = makeDoorTree();
doorTree.position.set(12.8, 0, 5.2);
doorTree.rotation.y = -Math.PI / 2;
add(doorTree);
circle(12.8, 5.2, 0.55);
add(makeLooseLeaves(11.4, 14.2, 4.0, 6.4, 50, 31));

// ------------------------------------------------------------------ alien formation (alien texture photos)
// Hidden in the dirt lot behind the blue construction fence.
const alien = makeAlienFormation();
alien.position.set(44.5, 0, -3);
alien.scale.setScalar(0.85);
add(alien);
for (const [x, z, cr] of alien.userData.colliders) circle(44.5 + x * 0.85, -3 + z * 0.85, cr * 0.85);

// ------------------------------------------------------------------ scooter + batteries (scooter photos)
// Parked on the sidewalk by the apartment building; press E to lift the seat.
const scooter = makeScooter();
scooter.position.set(50.4, 0, 5.3);
scooter.rotation.y = Math.PI * 0.85;
add(scooter);
circle(50.4, 5.3, 0.55);
interactables.push({ name: 'scooter seat', kind: 'door', setOpen: scooter.userData.setOpen, x: 50.4, z: 5.3, t: 0, target: 0, col: { active: false }, speed: 1.8 });
// Red-topped workbench in the tire-shop office with the old and new batteries.
{
  const bench = new THREE.Group();
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.05, 0.6), new THREE.MeshStandardMaterial({ color: '#c7322b', roughness: 0.6 }));
  top.position.y = 0.9;
  bench.add(top);
  const steel = new THREE.MeshStandardMaterial({ color: '#8e9296', roughness: 0.5, metalness: 0.3 });
  for (const [x, z] of [[-0.65, -0.25], [0.65, -0.25], [-0.65, 0.25], [0.65, 0.25]]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.88, 0.04), steel);
    leg.position.set(x, 0.44, z);
    bench.add(leg);
  }
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.02, 0.56), steel);
  shelf.position.y = 0.2;
  bench.add(shelf);
  const b1 = makeBattery('old'); b1.position.set(-0.12, 0.925, 0); bench.add(b1);
  const b2 = makeBattery('new'); b2.position.set(0.06, 0.925, 0.02); b2.rotation.y = -0.1; bench.add(b2);
  bench.position.set(TS.x + 6.5, 0, TS.z - 3.0);
  add(bench);
  rect(TS.x + 5.8, TS.x + 7.2, TS.z - 3.3, TS.z - 2.7);
}

// ------------------------------------------------------------------ tire + alloy wheel display (car-tire-wheel photo)
// Outside the tire shop office: two wheels leaning on the front wall, one lying flat with a bare tire on it.
{
  const zf = TS.z + 3.75;
  const shadowTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const x = c.getContext('2d'); const gr = x.createRadialGradient(32, 32, 2, 32, 32, 32);
    gr.addColorStop(0, 'rgba(0,0,0,0.75)'); gr.addColorStop(0.5, 'rgba(0,0,0,0.35)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();
  const contact = (x, z, sx, sz) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(sx, sz), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.position.set(x, 0.008, z); add(m);
  };
  contact(TS.x + 2.55, zf + 0.22, 0.75, 0.45); contact(TS.x + 4.45, zf + 0.22, 0.75, 0.45); contact(TS.x - 0.6, zf + 0.75, 1.0, 1.0);
  for (const [dx, ry] of [[2.55, 0.06], [4.45, -0.05]]) {
    const w = makeTireWheel();
    w.position.set(TS.x + dx, 0.364, zf + 0.15);
    w.rotation.set(-0.16, ry, dx * 0.7);
    add(w);
    rect(TS.x + dx - 0.4, TS.x + dx + 0.4, zf, zf + 0.35);
  }
  const flat = makeTireWheel();
  flat.rotation.x = -Math.PI / 2; flat.position.set(TS.x - 0.6, 0.118, zf + 0.75); add(flat);
  const bare = makeTireWheel({ withWheel: false });
  bare.rotation.x = -Math.PI / 2; bare.rotation.z = 0.5; bare.position.set(TS.x - 0.58, 0.118 + 0.236, zf + 0.74); add(bare);
  circle(TS.x - 0.6, zf + 0.75, 0.4);
  // gooseneck wall light over the display
  const arm = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.02, 6, 16, Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#2c2e30', roughness: 0.5 }));
  arm.rotation.y = Math.PI / 2; arm.position.set(TS.x + 2.2, 2.85, zf + 0.02); add(arm);
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.14, 16, 1, true), new THREE.MeshStandardMaterial({ color: '#2c2e30', roughness: 0.5, side: THREE.DoubleSide }));
  shade.position.set(TS.x + 2.2, 2.82, zf + 0.29); add(shade);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 2.0, 1.6), toneMapped: false }));
  bulb.position.set(TS.x + 2.2, 2.76, zf + 0.29); add(bulb);
  const wl = new THREE.PointLight('#ffe7c4', 7, 7, 1.3); wl.position.set(TS.x + 2.2, 2.6, zf + 0.5); add(wl);
}

// ------------------------------------------------------------------ the creepy hoodie figure (character photos)
// Slowly paces the street-row sidewalk, turning at each end.
const creep = makeCreep();
add(creep);
const CREEP = { x0: 11.2, x1: 30.0, z: 11.55, speed: 0.75 };
creep.userData.update = (t) => {
  const len = CREEP.x1 - CREEP.x0, period = (2 * len) / CREEP.speed;
  const u = (t % period) / period;                 // 0..1 there and back
  const out = u < 0.5;
  const k = out ? u * 2 : 2 - u * 2;
  creep.position.set(CREEP.x0 + k * len, 0, CREEP.z);
  creep.rotation.y = out ? Math.PI / 2 : -Math.PI / 2;
  creep.userData.pose(t * CREEP.speed * 4.2);
};

// ------------------------------------------------------------------ police vehicles (police photos, made-up MCPD)
// Parked on the lot by the rental sign, lights flashing on the cart.
const cart = makePatrolCart();
cart.position.set(35.5, 0, -9.6);
cart.rotation.y = 0.2;
add(cart);
rect(34.7, 36.3, -10.9, -8.3);
const pScooters = [];
for (const [x, z] of [[32.6, -9.9], [33.6, -9.8]]) {
  const sc = makePatrolScooter();
  sc.position.set(x, 0, z);
  sc.rotation.y = 0.35;
  sc.rotation.z = 0.04;
  add(sc);
  pScooters.push(sc);
  circle(x, z, 0.5);
}

// ------------------------------------------------------------------ grocery store (store / dairy-cooler photos)
// North of the tire-shop lot, front facing the lot. local (x, z) -> world (GS.x + x, GS.z + z)
const GS = { x: 24, z: -41 };
const grocery = makeGrocery();
grocery.position.set(GS.x, 0, GS.z);
add(grocery);
add(plane(mats.lotConcrete, 12, 42, -35, -32, 0.003, 4));
const groceryCols = [];
for (const [x0, x1, z0, z1] of grocery.userData.colliders) {
  const c = { type: 'box', minX: GS.x + x0, maxX: GS.x + x1, minZ: GS.z + z0, maxZ: GS.z + z1 };
  colliders.push(c);
  groceryCols.push(c);
}
const groceryDoor = groceryCols[grocery.userData.colliders.indexOf(grocery.userData.doorCol)];

// ======== main.js 846-974 ========
// ------------------------------------------------------------------ roadside shrines (shrine photos)
// A small wooded grove east of the grocery lot: leaf-litter ground, trees behind, the two shrines
// side by side facing the lot (+z faces south toward the street).
{
  const lt = new THREE.TextureLoader().load('assets/textures/leaf_litter.png');
  lt.colorSpace = THREE.SRGBColorSpace; lt.wrapS = lt.wrapT = THREE.RepeatWrapping;
  const ln = new THREE.TextureLoader().load('assets/textures/leaf_litter_normal.png');
  ln.wrapS = ln.wrapT = THREE.RepeatWrapping;
  add(plane(new THREE.MeshStandardMaterial({ map: lt, normalMap: ln, color: '#a89c8c', roughness: 1 }), 50, 64.5, -46.5, -29, 0.006, 0.7));
  for (const [x, z] of [[53.6, -34.0], [60.2, -34.2]]) {   // soft light on each shrine (night)
    const l = new THREE.PointLight('#ffe2b8', 6, 9, 1.4); l.position.set(x, 3.4, z); add(l);
  }
  add(makeLooseLeaves(50, 64.5, -46, -29, 140, 61));
  const shrA = makeStatueShrine(); shrA.position.set(53.6, 0, -36.2); add(shrA);
  const shrB = makeStoneShrine(); shrB.position.set(60.2, 0, -36.4); shrB.rotation.y = -0.08; add(shrB);
  for (const [sh, rot] of [[shrA, 0], [shrB, -0.08]]) {
    for (const [x0, x1, z0, z1] of sh.userData.colliders) {
      // rotate the box corners (small angles: take the bounding box)
      const pts = [[x0, z0], [x1, z0], [x0, z1], [x1, z1]].map(([x, z]) => [x * Math.cos(rot) + z * Math.sin(rot), -x * Math.sin(rot) + z * Math.cos(rot)]);
      rect(sh.position.x + Math.min(...pts.map((p) => p[0])), sh.position.x + Math.max(...pts.map((p) => p[0])),
        sh.position.z + Math.min(...pts.map((p) => p[1])), sh.position.z + Math.max(...pts.map((p) => p[1])));
    }
  }
  // trees behind and around the grove
  [[51.2, -42.5, makeSpruce, { seed: 31, height: 11 }], [56.8, -44.5, makeOak, { seed: 33 }], [62.6, -42.8, makeSpruce, { seed: 35, height: 12 }],
    [50.8, -32.0, makePaleTree, { seed: 37 }], [63.8, -31.5, makeOak, { seed: 39 }], [59.4, -45.6, makePaleTree, { seed: 41 }]].forEach(([x, z, make, o]) => {
    const t = make(o); t.position.set(x, 0, z); add(t); circle(x, z, 0.45);
  });
  add(makeRockBed(51, 53, -40.5, -39.0, { density: 60, seed: 43 }));
  add(makeGrassTufts([[52.2, -33.0], [57.0, -33.6], [62.8, -34.2], [55.2, -40.6], [58.2, -39.8], [63.4, -38.6]], 45));
}

// ------------------------------------------------------------------ house fronts (misc door photos)
// A little lane east of the grocery lot: four houses facing west along x = 46, two facing north
// along z = -44, dry-grass lawns (cat photo grass) and concrete walks to each door.
const houseLights = [];
{
  const gt = new THREE.TextureLoader().load('assets/textures/hs_grass.png');
  gt.colorSpace = THREE.SRGBColorSpace; gt.wrapS = gt.wrapT = THREE.RepeatWrapping;
  add(plane(new THREE.MeshStandardMaterial({ map: gt, roughness: 1 }), 34.5, 46, -47.5, -27.6, 0.004, 2.2));
  const walkMat = new THREE.MeshStandardMaterial({ color: '#b3b0a8', roughness: 0.95 });
  const placeHouse = (kind, w, gx, gz, rot) => {
    const h = makeHouse(kind, w);
    h.position.set(gx, 0, gz); h.rotation.y = rot; add(h);
    const c = Math.cos(rot), s = Math.sin(rot);
    for (const [x0, x1, z0, z1] of h.userData.colliders) {
      const pts = [[x0, z0], [x1, z0], [x0, z1], [x1, z1]].map(([x, z]) => [gx + x * c + z * s, gz - x * s + z * c]);
      rect(Math.min(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[0])), Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[1])));
    }
    return h;
  };
  // east row, fronts at x = 46 facing -x (local z -> world -x)
  let z = -44.0;
  for (const [kind, w, dz] of [['brick', 4.0, -0.2], ['yellow', 4.0, 0], ['gray', 3.8, -0.25], ['porch', 4.6, 0]]) {
    placeHouse(kind, w, 46, z + w / 2, -Math.PI / 2);
    add(plane(walkMat, 41.5, 46 - (kind === 'porch' ? 2.9 : 1.3), z + w / 2 + dz - 0.45 + (kind === 'porch' ? -0.9 : 0), z + w / 2 + dz + 0.45 + (kind === 'porch' ? -0.9 : 0), 0.008, 1));
    z += w + 0.1;
  }
  // south row, fronts at z = -44 facing +z
  for (const [kind, x, dx] of [['stone', 37.6, -0.3], ['tan', 42.0, -0.4]]) {
    placeHouse(kind, 4.2, x, -44, 0);
    add(plane(walkMat, x + dx - 0.45, x + dx + 0.45, -42.7, -38.5, 0.008, 1));
  }
}

// ------------------------------------------------------------------ boarded blue house + cats (misc photos)
// West side of the house lane, facing east (+x).
const blueHouse = makeBlueHouse();
{
  const gx = 38.4, gz = -34.6, rot = Math.PI / 2;
  blueHouse.position.set(gx, 0, gz); blueHouse.rotation.y = rot; add(blueHouse);
  const c = Math.cos(rot), s = Math.sin(rot);
  for (const [x0, x1, z0, z1] of blueHouse.userData.colliders) {
    const pts = [[x0, z0], [x1, z0], [x0, z1], [x1, z1]].map(([x, z]) => [gx + x * c + z * s, gz - x * s + z * c]);
    rect(Math.min(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[0])), Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[1])));
  }
}

// ------------------------------------------------------------------ dirt construction site (dump-truck + cairn photos)
// North of the house lane, behind a rusty pipe barrier with a gap to walk through.
{
  const dirtMat = mats.dirt;                // same dirt as the other lots
  add(plane(dirtMat, 33, 63, -64, -47.7, 0.006, 1.6));
  // tyre ruts
  const rut = new THREE.MeshStandardMaterial({ color: '#4a3a2c', roughness: 1, transparent: true, opacity: 0.45, depthWrite: false });
  for (const z of [-55.6, -58.4]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(26, 0.7), rut); m.rotation.x = -Math.PI / 2; m.rotation.z = 0.12; m.position.set(48, 0.009, z); add(m); }
  // dirt berms
  for (const [x, z, sx, sy, sz] of [[37.5, -60.5, 3.2, 1.3, 2.4], [58.5, -61.0, 3.8, 1.7, 2.2], [55.0, -50.8, 1.6, 0.6, 1.1]]) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), dirtMat);
    m.scale.set(sx, sy, sz); m.position.set(x, 0, z); m.receiveShadow = true; add(m);
    rect(x - sx * 0.8, x + sx * 0.8, z - sz * 0.8, z + sz * 0.8);
  }
  const truck = makeDumpTruck(); truck.position.set(47.5, 0, -57.2); truck.rotation.y = 0.25; add(truck);
  { const [x0, x1, z0, z1] = truck.userData.collider, c = Math.cos(0.25), s = Math.sin(0.25);
    const pts = [[x0, z0], [x1, z0], [x0, z1], [x1, z1]].map(([x, z]) => [47.5 + x * c + z * s, -57.2 - x * s + z * c]);
    rect(Math.min(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[0])), Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[1]))); }
  for (const [x0, x1] of [[34.5, 44.5], [49.0, 61.5]]) {
    const b = makePipeBarrier(x1 - x0); b.position.set((x0 + x1) / 2, 0, -48.6); add(b);
    rect(x0, x1, -48.75, -48.45);
    const w = makeWeeds(Math.round((x1 - x0) * 1.2), x1 - x0, 0.9, Math.round(x0)); w.position.set((x0 + x1) / 2, 0, -48.3); add(w);
  }
  const sign = makeSiteSign(); sign.position.set(50.2, 0, -48.9); sign.rotation.y = -0.15; add(sign); rect(49.5, 50.9, -49.05, -48.75);
  // site floodlight
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 6, 10), new THREE.MeshStandardMaterial({ color: '#77797c', metalness: 0.5, roughness: 0.5 }));
  pole.position.set(39.0, 3, -57.5); add(pole); circle(39.0, -57.5, 0.2);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.2), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 2.1, 1.8), toneMapped: false }));
  head.position.set(39.25, 5.9, -57.4); head.rotation.x = 0.5; add(head);
  const fl = new THREE.PointLight('#fff2d8', 22, 22, 1.2); fl.position.set(40.0, 5.5, -57.0); add(fl);
}

// ------------------------------------------------------------------ small misc props (27e)
{
  // night pickup crosswalk in the grocery lot, lane running north-south
  const pz = makePickupZone(); const gx = 30.0, gz = -27.6, rot = Math.PI / 2;
  pz.position.set(gx, 0, gz); pz.rotation.y = rot; add(pz);
  for (const [x0, x1, z0, z1] of pz.userData.colliders) {
    const pts = [[x0, z0], [x1, z0], [x0, z1], [x1, z1]].map(([x, z]) => [gx + z, gz - x]);
    rect(Math.min(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[0])), Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[1])));
  }
  // teal concrete wall with wheat-paste art on the west edge of the dirt site
  const pw = makePasteWall(7, 2.6); pw.position.set(34.25, 0, -54.5); pw.rotation.y = Math.PI / 2; add(pw);
  rect(33.95, 34.3, -58.0, -51.0);
  // plywood sheet leaning on the side of the boarded blue house
  const ply = makePlywoodSheet(); ply.position.set(36.6, 0, -31.42); ply.rotation.x = -0.14; add(ply);
  rect(35.95, 37.25, -31.75, -31.3);
  // broken car-window glass on the lot beside the old van
  const gl = makeGlassShards(1.4, 0.9, 420, 7); gl.position.set(23.3, 0, -25.6); add(gl);
}

// ======== end of main.js lines ========
  const areas = [
    { minX: X1 + 0.3, maxX: 66, minZ: -47.5, maxZ: 11.7 }, // outside (incl. the grocery)
    { minX: GS.x + 0.3, maxX: GS.x + 8.7, minZ: GS.z - 13.7, maxZ: GS.z - 5.5 }, // grocery stockroom
    { minX: 34.0, maxX: 62.5, minZ: -63.5, maxZ: -47.0 }, // dirt site
    { minX: -9.5, maxX: 9.0, minZ: 5.4, maxZ: 11.7 }, // strip along the restaurant's south wall (the way to the square)
  ];
  const ground = (x, z, prevY) => { const ay = apt.userData.floorY(z - AP.z, AP.x - x, prevY); return ay !== null ? ay : rampFloorY(x, z); };
  // doors open as you come up to them (the big town asks for a key press); the moving things move
  const tick = (t, dt, pos, gy = 0) => {
    for (const it of interactables) { const near = Math.hypot(pos.x - it.x, pos.z - it.z) < 2.6 && (it.y === undefined || Math.abs(gy - it.y) < 1.2); it.target = near ? 1 : 0; it.t += Math.sign(it.target - it.t) * Math.min(Math.abs(it.target - it.t), dt * (it.speed || 2.2)); it.setOpen(it.t); if (it.col) it.col.active = it.t < 0.6; }
    alien.userData.update(t); creep.userData.update(t); cart.userData.update(t); walkPoles.forEach((p, i) => p.userData.update(t, i * 0.3));
    const nearG = Math.abs(pos.x - GS.x) < 2.2 && Math.abs(pos.z - (GS.z + 6)) < 2.6; grocery.userData.update(dt, nearG); blueHouse.userData.update(dt); groceryDoor.active = !grocery.userData.doorsOpen();
  };
  return { areas, ground, cars: townCars, tick };
}
