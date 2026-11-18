// A whole restaurant assembled only from things in the four photos:
// bar counter + yellow stools, lime booths + terrazzo tables, pink slat chairs,
// triangle-tile entrance with bronze glass doors and mat, the neon OPEN sign,
// teal window trim, subway tile and lime walls, globe pendants, LED strips,
// napkin dispensers, the framed poster, the slatted fence and wall globes outside.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { makeMaterials } from './materials.js';
import { makeStool, makePinkChair } from './models/stool.js';
import { makeCounter } from './models/counter.js';
import { makeBooth, makeTerrazzoTable } from './models/booth.js';
import { makeInfinityBox } from './models/neon.js';
import { makeDoubleDoor, makeWindowBay, makeDoorMat } from './models/entrance.js';
import { makeNapkinDispenser, makePoster, makeOpenPlaque, makeWallGlobe, makeCanvas, makeMural, makeSoupPot } from './models/props.js';
import { makeLiquorSign, makeTwoRiversSign } from './models/signs.js';
import { makeAbandonedBuilding, makeStreetLamp, makeFireHydrant, makePlasticBottle } from './models/abandoned.js';
import { plane } from './world/util.js';
import { makeTireShop, TIRE_SHOP } from './models/tireshop.js';
import { makeRustyPole, makeWalkSignalPole } from './models/street.js';
import { makeStreetBuilding } from './models/buildings.js';
import { makePaverSidewalk, makeDrainCover, makePaverCrosswalk, makeTactilePlate, makeCracks, makeUtilityLid, makeTrafficIsland, makeDirtLot } from './models/streetground.js';
import { makeSky } from './models/sky.js';
import { makeOldVan } from './models/van.js';
import { makeGrocery } from './models/grocery.js';
import { makePatrolCart, makePatrolScooter } from './models/police.js';
import { makeCreep } from './models/creep.js';
import { makeScooter, makeBattery } from './models/scooter.js';
import { makePizza, makeRamenTray, makeSpaghettiTray, makeCurryPlate, makeWaffleSandwich, makeCerealPuffCup, makeClearSoda, makeDarkSodaCan, makeCupNoodles } from './models/food.js';
import { makeAlienFormation } from './models/alien.js';
import { makeApartment } from './models/apartment.js';
import { makeNewsBox, makeParkingSignBlock, makeParkingRamp, makeTealStorefront, makeRabbitSculpture } from './models/locations.js';
import { makeSpruce, makeCherry, makePaleTree, makeOak, makeTreePit, makeMulchBed, makeDoorTree } from './models/trees.js';
import { makeRockBed, makeGrassTufts, makeCurbWithLeaves, makeLooseLeaves, makeBikeRack } from './models/ground.js';
import { makeStatueShrine, makeStoneShrine } from './models/shrines.js';
import { makeTireWheel } from './models/wheel.js';
import { makeHouse } from './models/houses.js';
import { makeBlueHouse } from './models/bluehouse.js';
import { makeCargoTrike, makeArcadeCabinet, makeGraffitiFront } from './models/street28d.js';
import { makeShutterShop, makeVendingMachine, makeJunkShop } from './models/shops28c.js';
import { makeShopHouse, makeStreetLamp as makeOldTownLamp, makeBollard, makeMonkey, makeBanner, makeClockTower, makeGreenPillar } from './models/oldtown.js';
import { makeBrickGable, makeSpiral, makeOvalBuilding, makePebbleBench, makeOrnateLamp, makePlanter, makePaverTexture, makeGreyBandTexture } from './models/cityplaza.js';
import { makePlywoodSheet, makeGlassShards, makePasteWall, makePickupZone } from './models/misc27e.js';
import { makeDumpTruck, makePipeBarrier, makeSiteSign, makeWeeds } from './models/dumpsite.js';
import { makeDeliveryBag, makeCupCarrier, makePaperBag } from './models/delivery.js';
import { WalkControls } from './walk.js';
import { fontsReady } from './fonts.js';
await fontsReady;   // sign fonts must be loaded before any canvas sign is drawn

// ------------------------------------------------------------------ renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, precision: 'highp', powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, matchMedia('(pointer: coarse)').matches ? 1.5 : 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.85;
document.getElementById('app').appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color('#0b1018');
const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.05, 900);
const mats = makeMaterials();

// ------------------------------------------------------------------ shell
// 16 m x 10 m dining room. North = window wall (bar counters), east = storefront
// (doors + neon sign), west = subway tile (booths), south = lime green wall.
const X0 = -8, X1 = 8, Z0 = -5, Z1 = 5, H = 3.2;
const room = new THREE.Group();
room.name = 'restaurant';
scene.add(room);
const add = (o) => { room.add(o); return o; };

// Floors (each texture repeats at its real-world size).
add(plane(mats.floorWood(1, 1), X0, X1, Z0, Z1, 0, 1.6));                 // bar photo laminate
add(plane(mats.floorWalnut(1, 1), X0, X0 + 2.7, Z0, Z1, 0.001, 0.76, 1.52)); // booth photo walnut
add(plane(mats.floorVinyl(1, 1), -7.1, 4.3, Z0, Z0 + 1.8, 0.002, 0.6));    // bar photo green band
add(plane(mats.floorTriangle(1, 1), 5.4, X1, -3.6, 1.0, 0.002, 0.6, 0.75)); // entrance photo tiles

function wallPanel(mat, w, h, x, y, z, ry) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  m.position.set(x, y, z);
  m.rotation.y = ry;
  m.receiveShadow = true;
  return add(m);
}
function tilePanel(w, h, x, y, z, ry) {
  // subway_tile.png covers 0.3 m x 0.3 m (2 x 4 tiles of 150 x 75 mm)
  const geo = new THREE.PlaneGeometry(w, h);
  const uv = geo.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / 0.3, uv.getY(i) * h / 0.3);
  const m = new THREE.Mesh(geo, mats.subwayTile(1, 1));
  m.material.side = THREE.DoubleSide;
  m.position.set(x, y, z);
  m.rotation.y = ry;
  m.receiveShadow = true;
  return add(m);
}
// Walls seen from both sides now that you can walk outside.
mats.wall.side = THREE.DoubleSide;
// West: white subway tile.
tilePanel(Z1 - Z0, H, X0, H / 2, 0, Math.PI / 2);
// South: lime green paint + black baseboard.
wallPanel(mats.limeWall, X1 - X0, H, 0, H / 2, Z1, Math.PI);
const baseboard = new THREE.Mesh(new THREE.BoxGeometry(X1 - X0, 0.14, 0.02), mats.post);
baseboard.position.set(0, 0.07, Z1 - 0.01);
add(baseboard);
// East: tile piers around the storefront openings.
const DOOR_Z = -1.3;
tilePanel(0.67, H, X1, H / 2, 0.065, -Math.PI / 2);
tilePanel(1.6, H, X1, H / 2, 4.2, -Math.PI / 2);
wallPanel(mats.wall, 2.06, H - 2.35, X1, 2.35 + (H - 2.35) / 2, DOOR_Z, -Math.PI / 2);

// Ceiling + LED strips (the long linear lights reflected in the bar photo).
const ceil = new THREE.Mesh(new THREE.PlaneGeometry(X1 - X0, Z1 - Z0), mats.ceiling);
ceil.rotation.x = Math.PI / 2;
ceil.position.y = H;
add(ceil);
const stripMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.75, 1.8), toneMapped: false });
for (const z of [-3.6, -1.2, 1.2, 3.6]) {
  const s = new THREE.Mesh(new THREE.BoxGeometry(11, 0.03, 0.06), stripMat);
  s.position.set(-0.5, H - 0.02, z);
  add(s);
}

// Windows: teal-framed bays along the north (bar photo), bronze storefront on
// the east with the double doors (entrance photo).
for (let i = 0; i < 8; i++) {
  const w = makeWindowBay(mats, { w: 2.0, h: H, transom: 2.45, frame: mats.teal });
  w.position.set(X0 + 1 + i * 2, 0, Z0);
  add(w);
}
const eastWinN = makeWindowBay(mats, { w: 2.6, h: H, transom: 2.45 });
eastWinN.position.set(X1, 0, -3.65);
eastWinN.rotation.y = -Math.PI / 2;
add(eastWinN);
const eastWinS = makeWindowBay(mats, { w: 3.0, h: H, transom: 2.45 });
eastWinS.position.set(X1, 0, 1.9);
eastWinS.rotation.y = -Math.PI / 2;
add(eastWinS);
const door = makeDoubleDoor(mats, { w: 1.9, h: 2.25 });
door.position.set(X1, 0, DOOR_Z);
door.rotation.y = -Math.PI / 2;
add(door);
const plaque = makeOpenPlaque(mats);
plaque.position.set(X1 - 0.02, 2.75, DOOR_Z);
plaque.rotation.y = -Math.PI / 2;
add(plaque);

// ------------------------------------------------------------------ outside (night)
const outside = new THREE.Group();
// Ground plane in 4 pieces around the parking-ramp opening (x 13..17, z -23..-9).
const pavementMat = new THREE.MeshStandardMaterial({ color: '#2a2c30', roughness: 0.9 });
const pavement = new THREE.Group();
// (the Elmwood footprint, world x 52..62 z -8..6, is left open so its garden-level floor isn't capped)
for (const [a, b, c, d] of [[-80, 13, -120, 80], [17, 52, -120, 80], [62, 120, -120, 80], [52, 62, -120, -8], [52, 62, 6, 80], [13, 17, -120, -23], [13, 17, -9, 80]]) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(b - a, d - c), pavementMat);
  m.rotation.x = -Math.PI / 2;
  m.position.set((a + b) / 2, 0, (c + d) / 2);
  m.receiveShadow = true;
  pavement.add(m);
}
pavement.position.set(0, -0.01, 0);
outside.add(pavement);
// Night sky with the photographed clouds and the half moon (sky + moon photos).
const sky = makeSky();
scene.add(sky);
// Moonlight: a cool, faint key light from the moon's direction.
const moonLight = new THREE.DirectionalLight('#b9c6dd', 0.35);
moonLight.position.copy(sky.userData.moonDir).multiplyScalar(50);
scene.add(moonLight);
// Vertical slatted fence seen through the bar window (bar photo).
const slatGeo = new THREE.BoxGeometry(0.06, 2.4, 0.03);
const slatMat = new THREE.MeshStandardMaterial({ color: '#4b4741', roughness: 0.8 });
const nSlats = 180;
const fence = new THREE.InstancedMesh(slatGeo, slatMat, nSlats);
const m4 = new THREE.Matrix4();
for (let i = 0; i < nSlats; i++) {
  m4.makeTranslation(-9 + i * 0.1, 1.2, Z0 - 2.6);
  fence.setMatrixAt(i, m4);
}
outside.add(fence);
// Wall globe lights on outside posts (neon photo).
for (const x of [-6, -2, 2, 6]) {
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.2, 0.3), mats.post);
  post.position.set(x, 1.6, Z0 - 1.2);
  outside.add(post);
  const lamp = makeWallGlobe(mats);
  lamp.position.set(x, 2.1, Z0 - 1.05);
  outside.add(lamp);
}
for (const z of [0.07, 4.2]) { // in line with the tile piers, clear of the windows
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.2, 0.3), mats.post);
  post.position.set(X1 + 1.2, 1.6, z);
  outside.add(post);
  const lamp = makeWallGlobe(mats);
  lamp.position.set(X1 + 1.05, 2.1, z);
  lamp.rotation.y = -Math.PI / 2;
  outside.add(lamp);
}
const farLights = new THREE.InstancedMesh(new THREE.SphereGeometry(0.06, 8, 6),
  new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 2.2, 1.2), toneMapped: false }), 40);
for (let i = 0; i < 40; i++) {
  const a = Math.random(), y = 0.6 + Math.random() * 3;
  m4.makeTranslation(...(i < 22 ? [-30 + a * 100, y, -69.8] : [74.8, y, -70 + a * 90]));
  farLights.setMatrixAt(i, m4);
}
outside.add(farLights);
scene.add(outside);

// ------------------------------------------------------------------ lights
scene.add(new THREE.HemisphereLight('#dfe6f0', '#5e544a', 0.55));
const key = new THREE.DirectionalLight('#fff6ea', 1.2);
key.position.set(1.5, 8, 2);
key.target.position.set(0, 0, 0);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
Object.assign(key.shadow.camera, { left: -9, right: 9, top: 6, bottom: -6, near: 0.5, far: 18 });
key.shadow.bias = -0.0004;
key.shadow.normalBias = 0.02;
scene.add(key, key.target);
for (const [x, z] of [[-5, -2.5], [0, -2.5], [5, -2.5], [-5, 2.5], [0, 2.5], [5, 2.5]]) {
  const p = new THREE.PointLight('#eef7ff', 2.2, 7, 2);
  p.position.set(x, H - 0.3, z);
  scene.add(p);
}

// Globe pendants (half black shade + white globe, bar + neon photos).
function makePendant() {
  const g = new THREE.Group();
  g.name = 'globe_pendant';
  const shade = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), mats.post);
  const globe = new THREE.Mesh(new THREE.SphereGeometry(0.15, 24, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 2.5, 2.6), toneMapped: false }));
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.9, 4), mats.post);
  cord.position.y = 0.6;
  g.add(shade, globe, cord);
  return g;
}

// ------------------------------------------------------------------ furniture
const colliders = [];
const circle = (x, z, r) => colliders.push({ type: 'circle', x, z, r });
const rect = (x0, x1, z0, z1) => colliders.push({ type: 'box', minX: x0, maxX: x1, minZ: z0, maxZ: z1 });

// Two bar counters along the north window, 5 yellow stools each (bar photo).
const counters = [];
const stools = [];
const stoolProto = makeStool(mats);
const pendantProto = makePendant();
const napkinProto = makeNapkinDispenser(mats);
for (const cx of [-4.6, 1.7]) {
  const counter = makeCounter(mats, { length: 4.4 });
  counter.position.set(cx, 0, Z0 + 0.32);
  add(counter);
  counters.push(counter);
  rect(cx - 2.25, cx + 2.25, Z0, Z0 + 0.6);
  for (let i = 0; i < 5; i++) {
    const s = stoolProto.clone();
    s.position.set(cx + (i - 2) * 0.66 - 0.25, 0, Z0 + 0.8);
    s.rotation.y = Math.PI + (Math.random() - 0.5) * 0.12;
    add(s);
    stools.push(s);
    circle(s.position.x, s.position.z, 0.26);
  }
  for (const dx of [-1.6, 0.4]) {
    const n = napkinProto.clone();
    n.position.set(cx + dx, 1.07, Z0 + 0.25);
    add(n);
  }
  for (const dx of [-1.5, 0, 1.5]) {
    const p = pendantProto.clone();
    p.position.set(cx + dx, 2.15, Z0 + 0.5);
    add(p);
  }
}

// Booths along the tiled west wall (booth photo), with the framed poster above each.
const booths = [];
for (const z of [-2.1, 0.3, 2.7]) {
  const b = makeBooth(mats, { length: 1.25 });
  b.position.set(X0 + 0.65, 0, z);
  add(b);
  booths.push(b);
  const { x: sx, z: sz } = b.userData.size;
  rect(X0, X0 + 0.02 + sx, z - sz / 2, z + sz / 2);
  const poster = makePoster(mats);
  poster.position.set(X0 + 0.005, 1.85, z);
  poster.rotation.y = Math.PI / 2;
  add(poster);
}

// Terrazzo tables with pink slat chairs (pink chair from the entrance photo,
// terrazzo from the booth photo).
const chairProto = makePinkChair(mats);
const chairs = [];
function chairAt(x, z, ry) {
  const c = chairProto.clone();
  c.position.set(x, 0, z);
  c.rotation.y = ry + (Math.random() - 0.5) * 0.15;
  add(c);
  chairs.push(c);
  return c;
}
const tableProto4 = makeTerrazzoTable(mats, { w: 0.8, d: 0.8 });
const tables = [];
for (const x of [-3.4, -0.6, 2.2]) {
  for (const z of [-1.4, 1.4]) {
    const t = tableProto4.clone();
    t.position.set(x, 0, z);
    add(t);
    tables.push(t);
    chairAt(x, z - 0.6, 0);
    chairAt(x, z + 0.6, Math.PI);
    chairAt(x - 0.6, z, Math.PI / 2);
    chairAt(x + 0.6, z, -Math.PI / 2);
    rect(x - 0.85, x + 0.85, z - 0.85, z + 0.85);
  }
}
// Two-tops against the lime wall.
const tableProto2 = makeTerrazzoTable(mats, { w: 0.7, d: 0.6 });
for (const x of [-4.2, -2.0, 0.2, 2.4]) {
  const t = tableProto2.clone();
  const z = Z1 - 0.35;
  t.position.set(x, 0, z);
  add(t);
  chairAt(x - 0.55, z, Math.PI / 2);
  chairAt(x + 0.55, z, -Math.PI / 2);
  rect(x - 0.8, x + 0.8, z - 0.4, Z1);
}

// Entrance: mat inside the doors, a pink chair by the tile pier, neon OPEN sign
// in its LED box in the window beside the door.
const mat = makeDoorMat(mats, { w: 1.9, d: 0.95 });
mat.rotation.y = Math.PI / 2;
mat.position.set(X1 - 0.6, 0.006, DOOR_Z);
add(mat);
const waitChair = chairAt(X1 - 0.45, Z1 - 0.45, -Math.PI / 2 - 0.5);
circle(waitChair.position.x, waitChair.position.z, 0.3);
const neon = makeInfinityBox(mats);
neon.position.set(X1 - 0.08, 1.3, -3.65);
neon.rotation.y = -Math.PI / 2;
add(neon);

// ------------------------------------------------------------------ outside the front doors
// Sidewalk, dirt and gravel from the two sign photos, with both signs.
add(plane(mats.sidewalk, X1, X1 + 3, -9.5, 9, 0.003, 1.5));
add(plane(mats.dirt, X1 + 3, X1 + 9, -9, 1.0, 0.003, 2.0));
add(plane(mats.gravel, X1 + 3, X1 + 9, 1.0, 9, 0.003, 1.2));
const liquor = makeLiquorSign(mats);
liquor.position.set(X1 + 5.2, 0, -2.8);
liquor.rotation.y = -Math.PI / 2; // face toward the sidewalk and the doors
add(liquor);
const twoRivers = makeTwoRiversSign();
twoRivers.position.set(X1 + 4.6, 0, 3.0);
twoRivers.rotation.y = -Math.PI / 2;
add(twoRivers);
for (const s of [liquor, twoRivers]) {
  s.updateMatrixWorld(true);
  for (const [px, , r] of s.userData.poles) {
    const v = new THREE.Vector3(px, 0, 0).applyMatrix4(s.matrixWorld);
    circle(v.x, v.z, r);
  }
}
// Walls of the storefront either side of the doors, and the doors themselves.
rect(X1 - 0.1, X1 + 0.1, Z0, DOOR_Z - 1.03);
rect(X1 - 0.1, X1 + 0.1, DOOR_Z + 1.03, Z1);
const doorCollider = { type: 'box', minX: X1 - 0.12, maxX: X1 + 0.12, minZ: DOOR_Z - 1.03, maxZ: DOOR_Z + 1.03 };
colliders.push(doorCollider);
circle(X1 + 1.2, 0.07, 0.25);
circle(X1 + 1.2, 4.2, 0.25);

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

// ------------------------------------------------------------------ wall art (painting photos)
// Four canvases above the two-tops on the lime wall in the restaurant.
[['canvas_impasto.png', -4.2, 0.62, 1.1], ['canvas_drip.png', -2.0, 0.62, 1.1], ['canvas_sunset.png', 0.2, 1.3, 0.73], ['canvas_splatter.png', 2.4, 0.62, 1.1]]
  .forEach(([file, x, w, h]) => {
    const c = makeCanvas(file, w, h);
    c.position.set(x, 1.85, Z1 - 0.005);
    c.rotation.y = Math.PI;
    add(c);
  });
// The graffiti painting as a lit mural on the end wall of the street row, facing the lot.
const mural = makeMural('canvas_graffiti.png', 2.9, 5.1);
mural.position.set(9.99, 3.0, 16.2);
mural.rotation.y = -Math.PI / 2;
add(mural);

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

// ------------------------------------------------------------------ soup pots on the bar (soup photos)
const soupPots = [];
for (const [x, soup] of [[-3.1, 'soup_lentil'], [0.45, 'soup_smooth']]) {
  const p = makeSoupPot({ soup });
  p.position.set(x, 1.07, Z0 + 0.3);
  add(p);
  soupPots.push(p);
}

// ------------------------------------------------------------------ food on the tables (food photos)
// Terrazzo four-tops are 0.76 m tall; the tables sit at x -3.4/-0.6/2.2, z -1.4/1.4.
const foods = [];
const onTable = (obj, x, z, ry = 0) => { obj.position.set(x, 0.76, z); obj.rotation.y = ry; add(obj); foods.push(obj); };
onTable(makePizza('mushroom'), -3.45, -1.45, 0.3);
onTable(makeRamenTray(), -0.6, -1.4, 0.2);
onTable(makeSpaghettiTray(), 2.2, -1.4, -0.3);
onTable(makeCurryPlate(), -3.4, 1.4, 0.8);
onTable(makePizza('corn'), 2.2, 1.4, 1.1);
// Snacks on the two-tops along the lime wall (food set 2).
const twoZ = Z1 - 0.35;
onTable(makeWaffleSandwich(), -4.32, twoZ, 0.4);
const puffCup = makeCerealPuffCup(); onTable(puffCup, -4.08, twoZ + 0.05, 0);
onTable(makeCupNoodles(), -2.1, twoZ, 0.3);
onTable(makeClearSoda(), -1.85, twoZ + 0.05, 1.88);
onTable(makeDarkSodaCan(), 0.08, twoZ, -1.4);
onTable(makeDarkSodaCan(), 0.17, twoZ + 0.04, -1.8);

// ------------------------------------------------------------------ junked van behind the tire shop (old-van photo)
const van = makeOldVan();
van.position.set(21.5, 0, -26.5);
van.rotation.y = 0.35;
add(van);
rect(20.2, 22.8, -28.8, -24.2);

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

// ------------------------------------------------------------------ controls
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

// ------------------------------------------------------------------ city plaza (city photos, 28a)
// West of the restaurant: a paved square reached by a sidewalk strip along the restaurant's south wall.
{
  const PX0 = -44, PX1 = -9, PZ0 = -14, PZ1 = 11.8;
  const pt = makePaverTexture(); pt.repeat.set(1, 1);
  const pavMat = new THREE.MeshStandardMaterial({ map: pt, roughness: 0.85 });
  const placeRot = (o, gx, gz, rot) => {
    o.position.set(gx, 0, gz); o.rotation.y = rot; add(o);
    const c = Math.cos(rot), s = Math.sin(rot);
    const col = (r) => { const [x0, x1, z0, z1] = r; const pts = [[x0, z0], [x1, z0], [x0, z1], [x1, z1]].map(([x, z]) => [gx + x * c + z * s, gz - x * s + z * c]);
      rect(Math.min(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[0])), Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[1]))); };
    if (o.userData.collider) col(o.userData.collider);
    return o;
  };
  add(plane(pavMat, PX0, PX1, PZ0, PZ1, 0.006, 2.4));
  add(plane(pavMat, PX1, 9.0, 5.3, 11.8, 0.006, 2.4));                    // connecting strip
  // grey paver bands crossing the square (photo)
  const bandMat = new THREE.MeshStandardMaterial({ map: makeGreyBandTexture(), roughness: 0.85 });
  add(plane(bandMat, PX0, PX1, 2.2, 3.4, 0.008, 1.2, 2.4));
  add(plane(bandMat, -27.6, -26.4, PZ0, PZ1, 0.009, 1.2, 2.4));
  // brick warehouse gable on the west side, facing the square
  placeRot(makeBrickGable(16, 12, 5.0, 4.0), PX0 + 0.2, -3.0, Math.PI / 2);
  const sp1 = makeSpiral(false); placeRot(sp1, PX0 + 3.0, -6.2, 0.4); circle(PX0 + 2.6, -6.0, 0.6);
  const sp2 = makeSpiral(true); placeRot(sp2, PX0 + 3.4, 1.4, -2.6); circle(PX0 + 3.5, 1.2, 0.6);
  // white oval-window building on the north side
  const ov = placeRot(makeOvalBuilding(24, 14, 11), -25.5, PZ0 + 0.2, 0);
  // pebble benches in front of it
  [[-35, -11.4, 0.1], [-32.8, -11.6, -0.2], [-30.6, -11.3, 0.3], [-19.6, -11.4, 0.2], [-17.2, -11.5, -0.1], [-15, -11.2, 0.4]].forEach(([x, z, r]) => {
    const b = makePebbleBench(); b.position.set(x, 0, z); b.rotation.y = r; add(b); circle(x, z, 0.4);
  });
  // ornate lamps (lit) round the square
  [[-38.5, -6.5], [-38.5, 8.5], [-30.2, -8.0], [-26.8, 8.5], [-14.0, -6.5], [-14.0, 8.5], [-2.0, 10.8]].forEach(([x, z]) => {
    const l = makeOrnateLamp(); l.position.set(x, 0, z); add(l); circle(x, z, 0.25);
    const pl = new THREE.PointLight('#ffd9a8', 7, 11, 1.5); pl.position.set(x, 3.4, z); add(pl);
  });
  // raised planters with small trees
  [[-33, 0, 3.2, 2.0, 2], [-20, 0, 3.6, 2.2, 5], [-22, 7.5, 2.6, 1.8, 8], [-34, 7.8, 2.2, 1.8, 11]].forEach(([x, z, w, d, sd]) => {
    const p = makePlanter(w, d, sd); p.position.set(x, 0, z); add(p); rect(x - w / 2, x + w / 2, z - d / 2, z + d / 2);
  });
}

// ------------------------------------------------------------------ old-town shopping street (city photos, 28b)
// Runs south from the plaza: granite-slab road with white lane markings, shops either side.
{
  const SX = -26.5, Z0 = 11.8, Z1 = 52;
  const st = new THREE.TextureLoader().load('assets/textures/ot_stone.png');
  st.colorSpace = THREE.SRGBColorSpace; st.wrapS = st.wrapT = THREE.RepeatWrapping;
  const stoneMat = new THREE.MeshStandardMaterial({ map: st, roughness: 0.85 });
  add(plane(stoneMat, SX - 7, SX + 7, Z0, Z1, 0.006, 1.2));
  const line = new THREE.MeshStandardMaterial({ color: '#e8e8e2', roughness: 0.8 });
  for (let z = Z0 + 2; z < Z1 - 1; z += 3.2) add(plane(line, SX - 0.08, SX + 0.08, z, z + 1.6, 0.01));
  for (const dx of [-4.6, 4.6]) add(plane(line, SX + dx - 0.07, SX + dx + 0.07, Z0, Z1, 0.01));
  const placeR = (o, gx, gz, rot) => {
    o.position.set(gx, 0, gz); o.rotation.y = rot; add(o);
    const c = o.userData.collider; if (!c) return o;
    const cs = Math.cos(rot), sn = Math.sin(rot);
    const pts = [[c[0], c[2]], [c[1], c[2]], [c[0], c[3]], [c[1], c[3]]].map(([x, z]) => [gx + x * cs + z * sn, gz - x * sn + z * cs]);
    rect(Math.min(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[0])), Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[1])));
    return o;
  };
  // shops: west side face +x, east side face -x
  const norens = ['#2a3a6a', '#7a1f24', '#2f5a3a', '#4a2a5a', '#8a5a1a'];
  let z = Z0 + 1.5, k = 0;
  for (const w of [6, 5.5, 7, 6, 5, 6.5]) { placeR(makeShopHouse({ w, d: 8, seed: k + 3, front: k % 3 === 2 ? 'lattice' : 'glass', sign: k, noren: norens[k % 5] }), SX - 7, z + w / 2, Math.PI / 2); z += w + 0.3; k++; }
  z = Z0 + 3.5;
  for (const w of [5.5, 6.5, 5, 7, 6]) { placeR(makeShopHouse({ w, d: 8, seed: k + 9, front: k % 3 === 1 ? 'lattice' : 'glass', sign: k, noren: norens[k % 5] }), SX + 7, z + w / 2, -Math.PI / 2); z += w + 0.3; k++; }
  placeR(makeClockTower(), SX + 9.5, Z1 + 2.5, Math.PI);
  // lamps (lit) + stone bollards + banners along both edges
  for (let zz = Z0 + 4; zz < Z1; zz += 7) for (const s of [-1, 1]) {
    const l = makeOldTownLamp(); l.position.set(SX + s * 6.0, 0, zz); l.rotation.y = s > 0 ? Math.PI : 0; add(l); circle(SX + s * 6.0, zz, 0.2);
    const pl = new THREE.PointLight('#ffd9a8', 6, 11, 1.5); pl.position.set(SX + s * 5.4, 3.3, zz); add(pl);
  }
  let bs = 1;
  for (let zz = Z0 + 2.5; zz < Z1; zz += 2.2) for (const s of [-1, 1]) { if ((zz | 0) % 7 === 0) continue; const b = makeBollard(bs++); b.position.set(SX + s * 5.1, 0, zz); add(b); circle(SX + s * 5.1, zz, 0.25); }
  [[SX - 6.3, Z0 + 9, '#2a4aa8'], [SX - 6.3, Z0 + 23, '#c8202a'], [SX + 6.3, Z0 + 15, '#2a4aa8'], [SX + 6.3, Z0 + 30, '#2a8a4a']].forEach(([x, zz, c], i) => { const b = makeBanner(c, i); b.position.set(x, 0, zz); b.rotation.y = x < SX ? 0 : Math.PI; add(b); });
  // stone monkey statues by a shop door, and the green sign pillar
  const m1 = makeMonkey(); m1.position.set(SX - 5.7, 0, Z0 + 5.5); m1.rotation.y = 0.2; add(m1); circle(SX - 5.7, Z0 + 5.5, 0.4);
  const m2 = makeMonkey(); m2.position.set(SX + 5.7, 0, Z0 + 19); m2.rotation.y = Math.PI - 0.3; add(m2); circle(SX + 5.7, Z0 + 19, 0.4);
  placeR(makeGreenPillar(), SX + 6.4, Z0 + 26, -Math.PI / 2);
}

// ------------------------------------------------------------------ shops off the restaurant strip (city photos, 28c)
// South of the strip that links the plaza to the restaurant, both facing north (-z).
const junkArea = {};
{
  const rotPI = (o, gx, gz, list) => {
    o.position.set(gx, 0, gz); o.rotation.y = Math.PI; add(o);
    for (const [x0, x1, z0, z1] of list) rect(gx - x1, gx - x0, gz - z1, gz - z0);
  };
  const shut = makeShutterShop(10); rotPI(shut, -6.4, 12.2, [shut.userData.collider]);
  const junk = makeJunkShop(9, 12); rotPI(junk, 3.5, 12.2, junk.userData.colliders);
  const a2 = junk.userData.area;
  Object.assign(junkArea, { minX: 3.5 - a2.x1, maxX: 3.5 - a2.x0, minZ: 12.2 - a2.z1, maxZ: 12.2 - a2.z0 });
  const vm = makeVendingMachine(); vm.position.set(-0.85, 0, 11.7); vm.rotation.y = Math.PI; add(vm); rect(-1.25, -0.4, 11.65, 12.45);
}

// ------------------------------------------------------------------ street props (city photos, 28d)
// South edge of the plaza by the old-town street: a closed graffiti shop with a pallet, an arcade
// cabinet outside; two cargo trikes parked on the plaza and on the strip.
{
  const put = (o, gx, gz, rot) => {
    o.position.set(gx, 0, gz); o.rotation.y = rot; add(o);
    const c = o.userData.collider; if (!c) return;
    const cs = Math.cos(rot), sn = Math.sin(rot);
    const pts = [[c[0], c[2]], [c[1], c[2]], [c[0], c[3]], [c[1], c[3]]].map(([x, z]) => [gx + x * cs + z * sn, gz - x * sn + z * cs]);
    rect(Math.min(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[0])), Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[1])));
  };
  put(makeGraffitiFront(4.4), -15.5, 12.1, Math.PI);
  add(plane(new THREE.MeshStandardMaterial({ color: '#4a4c4e', roughness: 0.9 }), -18.4, -12.6, 12.1, 16, 2.0, 1));
  put(makeArcadeCabinet(), -12.2, 11.55, Math.PI);
  put(makeCargoTrike({ cab: false, seed: 2 }), -19.0, 8.6, 0.0);
  put(makeCargoTrike({ cab: true, seed: 5 }), 0.6, 7.6, Math.PI + 0.15);
}

// delivery props elsewhere: drinks + bag outside an Elmwood unit door, a delivery tote by the scooter
{
  const c = makeCupCarrier(); c.position.set(-0.6, 1.4, -2.8); apt.add(c);
  const b = makePaperBag({ seed: 9 }); b.position.set(-0.6, 1.4, -3.65); b.rotation.y = 0.3; apt.add(b);
  const d = makeDeliveryBag(); d.position.set(49.6, 0, 6.0); d.rotation.y = -0.8; add(d);
}

const walk = new WalkControls(camera, renderer.domElement, {
  bounds: null,
  areas: [
    { minX: X0 + 0.3, maxX: X1 - 0.3, minZ: Z0 + 0.3, maxZ: Z1 - 0.3 }, // restaurant
    { minX: X1 - 0.5, maxX: X1 + 0.6, minZ: DOOR_Z - 0.9, maxZ: DOOR_Z + 0.9 }, // doorway
    { minX: X1 + 0.3, maxX: 66, minZ: -47.5, maxZ: 11.7 }, // outside (incl. the grocery)
    { minX: GS.x + 0.3, maxX: GS.x + 8.7, minZ: GS.z - 13.7, maxZ: GS.z - 5.5 }, // grocery stockroom
    { minX: 34.0, maxX: 62.5, minZ: -63.5, maxZ: -47.0 }, // dirt site
    { minX: -43.6, maxX: -9.0, minZ: -13.6, maxZ: 11.7 }, // city plaza
    { minX: -33.3, maxX: -19.7, minZ: 11.0, maxZ: 51.8 }, // old-town street
    { minX: -9.5, maxX: 9.0, minZ: 5.4, maxZ: 11.7 }, // strip along the restaurant's south wall
    junkArea, // junk shop interior
  ],
  colliders,
});
walk.ground = (x, z, prevY) => {
  const ay = apt.userData.floorY(z - AP.z, AP.x - x, prevY);
  return ay !== null ? ay : rampFloorY(x, z);
};
walk.position.set(6.6, 0, 0.2);
walk.yaw = 1.25;
walk.pitch = -0.1;

const orbit = new OrbitControls(camera, renderer.domElement);
orbit.enableDamping = true;
orbit.maxPolarAngle = Math.PI * 0.49;
orbit.minDistance = 0.1;
orbit.maxDistance = 12;
orbit.enabled = false;

const VIEWS = {
  room: { pos: [6.8, 2.9, 4.4], target: [-1, 0.5, -0.8] },
  bar: { pos: [0.4, 1.6, -1.6], target: [-2.6, 0.7, -4.3] },
  booth: { pos: [-4.6, 1.5, -0.8], target: [-7.3, 0.7, 0.3] },
  tables: { pos: [3.8, 1.8, 3.2], target: [0.8, 0.5, 0.2] },
  neon: { pos: [5.8, 1.5, -2.6], target: [7.9, 1.4, -3.65] },
  entrance: { pos: [4.4, 1.7, 2.2], target: [7.6, 0.6, -1.0] },
  signs: { pos: [9.4, 1.8, 1.4], target: [13.2, 2.6, -0.8] },
  tireshop: { pos: [36, 2.6, -2], target: [24, 2.2, -14] },
  pole: { pos: [12.2, 1.6, -5.6], target: [10.4, 1.8, -7.2] },
  streetrow: { pos: [24, 3.2, -1], target: [26, 3.5, 12] },
  rocks: { pos: [12.6, 1.5, 1.2], target: [14.2, 0.1, 5.6] },
  rockclose: { pos: [13.6, 0.75, 3.3], target: [14.3, 0.05, 4.9] },
  curb: { pos: [20.5, 1.4, 6.8], target: [23.5, 0.1, 9.6] },
  pavers: { pos: [16.5, 1.7, 7.4], target: [19.5, 0, 10.4] },
  crosswalk: { pos: [33.5, 2.6, 10.8], target: [31, 0, 0] },
  cracks: { pos: [37, 1.8, 7.6], target: [39.5, 0, 10.6] },
  dirtlot: { pos: [39.0, 2.4, -6.5], target: [44.5, 0.4, -1] },
  sky: { pos: [20, 1.7, 2], target: [14.5, 6.6, -5.5] },
  walksignal: { pos: [33.6, 1.6, 7.2], target: [32.7, 1.9, 9.9] },
  spruce: { pos: [33.5, 2.2, -5.5], target: [39, 4, -12] },
  streettrees: { pos: [23.5, 1.9, 4.6], target: [19, 2.6, 10.4] },
  trunks: { pos: [37.3, 0.9, -8.4], target: [39.6, 0.9, -11.3] },
  ramp: { pos: [15, 2.6, -27.5], target: [15, -1.5, -15] },
  tealshop: { pos: [44, 1.8, -10.5], target: [45, 1.8, -16] },
  rabbit: { pos: [17.4, 1.5, 7.6], target: [16, 1.6, 10.3] },
  newsbox: { pos: [10.2, 1.3, -1.6], target: [8.55, 0.5, -3.1] },
  canvases: { pos: [-1, 1.7, 1.2], target: [-1, 1.8, 5] },
  mural: { pos: [5.2, 2.2, 10.2], target: [10, 3, 16.2] },
  apartment: { pos: [38.5, 3.5, 4.5], target: [52, 5, -1] },
  aptside: { pos: [62.5, 4.2, 12.5], target: [57, 4.0, 4.0] },
  aptback: { pos: [70.0, 4.5, -1.0], target: [62, 4.2, -1.0] },
  apthall: { pos: [52.6, 3.0, 0.2], target: [60.0, 2.4, -0.4] },
  aptgarden: { pos: [53.0, -0.1, 0.4], target: [60.0, -0.6, -0.6] },
  aptgardenunit: { pos: [55.2, -0.05, 2.4], target: [52.3, -0.45, 4.2] },
  apthall2: { pos: [61.2, 6.1, -0.4], target: [52.5, 5.6, -0.8] },
  aptunit: { pos: [58.5, 3.0, -3.6], target: [63.0, 2.2, -6.0] },
  aptunit2: { pos: [55.0, 6.0, 1.9], target: [56.5, 5.2, 5.6] },
  stoop: { pos: [47.6, 2.4, 3.4], target: [50.5, 1.0, -1] },
  alien: { pos: [40.4, 2.4, 1.6], target: [44.5, 1.4, -3] },
  doortree: { pos: [10.4, 1.3, 5.7], target: [12.8, 0.9, 5.2] },
  scooter: { pos: [48.9, 1.0, 4.0], target: [50.4, 0.55, 5.3] },
  scooterseat: { pos: [50.75, 1.75, 6.15], target: [50.45, 0.7, 5.5] },
  batteries: { pos: [32.5, 1.12, -19.6], target: [32.5, 0.96, -20.0] },
  creep: { pos: [21.6, 1.35, 9.4], target: [19.5, 1.05, 11.55] },
  creepface: { pos: [20.05, 1.72, 11.0], target: [19.5, 1.66, 11.55] },
  police: { pos: [34.0, 1.9, -5.4], target: [36.8, 0.8, -9.7] },
  policefront: { pos: [31.0, 1.3, -7.8], target: [33.1, 0.8, -9.8] },
  grocery: { pos: [24, 3.2, -26], target: [24, 2, -35] },
  dairy: { pos: [24.2, 1.6, -42.3], target: [25.2, 1.0, -46.5] },
  walkin: { pos: [21.0, 1.8, -42.6], target: [16.5, 0.9, -46] },
  eggs: { pos: [29.2, 1.7, -39.2], target: [32.5, 1.2, -41.0] },
  stockroom: { pos: [30.6, 1.7, -48.3], target: [27.0, 1.0, -53.5] },
  stockroom2: { pos: [31.6, 1.9, -53.2], target: [25.0, 0.9, -51.0] },
  shrines: { pos: [57.0, 2.2, -27.6], target: [57.0, 1.0, -37.0] },
  shrineA: { pos: [53.4, 1.4, -32.6], target: [53.6, 0.8, -37.4] },
  shrineB: { pos: [60.6, 1.4, -32.4], target: [60.1, 1.0, -37.4] },
  tirewheel: { pos: [29.6, 0.75, -11.75], target: [28.6, 0.4, -13.1] },
  tiredisplay: { pos: [27.6, 1.6, -10.4], target: [27.6, 0.4, -13.2] },
  livingroom: { pos: [56.6, 3.0, -2.2], target: [52.6, 2.4, -6.6] },
  bookshelves: { pos: [55.2, 2.6, -4.6], target: [52.4, 2.5, -6.9] },
  lamptable: { pos: [54.6, 2.7, -4.4], target: [54.6, 2.3, -7.6] },
  houses: { pos: [38.5, 2.6, -33.0], target: [46.0, 1.6, -38.5] },
  housesouth: { pos: [40.0, 1.8, -36.5], target: [40.0, 1.4, -44.0] },
  porchhouse: { pos: [40.8, 1.9, -27.8], target: [46.0, 1.5, -31.2] },
  deliveries: { pos: [43.3, 1.4, -40.0], target: [45.6, 0.35, -40.0] },
  deliveries2: { pos: [42.4, 1.7, -31.6], target: [45.3, 0.55, -29.8] },
  bluehouse: { pos: [44.0, 2.0, -33.0], target: [38.4, 1.4, -34.8] },
  cats: { pos: [40.1, 0.55, -35.05], target: [39.2, 0.18, -35.4] },
  kitten: { pos: [39.7, 1.0, -32.3], target: [38.4, 0.8, -32.6] },
  dumpsite: { pos: [44.5, 2.6, -48.2], target: [48.0, 1.6, -57.0] },
  dumptruck: { pos: [54.6, 2.4, -53.0], target: [48.0, 1.8, -57.0] },
  pickup: { pos: [37.0, 2.4, -23.0], target: [30.0, 1.8, -28.4] },
  pastewall: { pos: [36.4, 1.6, -54.2], target: [34.25, 1.4, -54.4] },
  plywood: { pos: [37.4, 1.7, -28.9], target: [36.6, 1.25, -31.5] },
  glass: { pos: [23.6, 1.1, -24.4], target: [23.3, 0.0, -25.6] },
  plaza: { pos: [-12.0, 4.5, 10.5], target: [-28.0, 1.5, -2.0] },
  warehouse: { pos: [-33.0, 2.4, -1.0], target: [-44.0, 4.5, -3.0] },
  ovalbuilding: { pos: [-25.5, 2.4, 1.5], target: [-25.5, 4.5, -14.0] },
  oldtown: { pos: [-26.5, 2.0, 14.0], target: [-26.5, 2.4, 40.0] },
  oldtownshops: { pos: [-23.5, 1.7, 20.0], target: [-31.0, 1.8, 24.0] },
  monkey: { pos: [-29.8, 1.0, 19.0], target: [-32.2, 0.5, 17.3] },
  shutters: { pos: [-5.0, 1.8, 6.4], target: [-6.4, 1.7, 12.2] },
  vending: { pos: [-0.95, 1.45, 9.9], target: [-0.85, 1.0, 11.7] },
  vendingclose: { pos: [-0.75, 1.55, 10.85], target: [-0.85, 1.45, 11.7] },
  vendinglow: { pos: [-0.8, 0.95, 10.75], target: [-0.85, 0.7, 11.7] },
  junkshop: { pos: [6.8, 1.8, 13.2], target: [1.5, 1.0, 20.5] },
  junkfront: { pos: [3.5, 2.2, 5.8], target: [3.5, 2.0, 12.2] },
  graffiti: { pos: [-15.2, 1.9, 7.0], target: [-15.5, 1.9, 12.1] },
  arcade: { pos: [-11.6, 1.6, 9.8], target: [-12.2, 1.3, 11.4] },
  trike: { pos: [-16.4, 1.6, 6.2], target: [-19.4, 0.8, 8.6] },
  trike2: { pos: [-2.6, 1.6, 6.2], target: [0.6, 1.0, 7.6] },
  walkinshelf: { pos: [17.6, 1.6, -44.0], target: [21.4, 1.0, -45.6] },
  van: { pos: [25.5, 1.9, -22.4], target: [21.5, 0.9, -26.5] },
  vanside: { pos: [24.6, 1.3, -29.2], target: [21.5, 0.7, -26.3] },
  soup: { pos: [-2.85, 1.62, -4.0], target: [-3.1, 1.2, -4.7] },
  food1: { pos: [-3.1, 1.45, -0.9], target: [-3.42, 0.78, -1.45] },
  food2: { pos: [-0.35, 1.4, -0.95], target: [-0.62, 0.8, -1.4] },
  food3: { pos: [1.95, 1.4, -0.95], target: [2.2, 0.8, -1.4] },
  food4: { pos: [-3.1, 1.4, 1.95], target: [-3.4, 0.78, 1.4] },
  snacks1: { pos: [-4.2, 1.0, 4.28], target: [-4.2, 0.82, 4.65] },
  snacks2: { pos: [-1.95, 1.0, 4.28], target: [-1.97, 0.83, 4.65] },
  snacks3: { pos: [0.13, 0.95, 4.35], target: [0.13, 0.83, 4.65] },
  food6: { pos: [2.5, 1.4, 1.95], target: [2.2, 0.78, 1.4] },
  abandoned: { pos: [13.0, 2.0, 2.0], target: [19.5, 1.4, 0.2] },
};
let mode = 'walk';
const modeBtn = document.getElementById('mode');
function setMode(m, view = 'room') {
  mode = m;
  walk.enabled = m === 'walk';
  orbit.enabled = m === 'orbit';
  if (m === 'orbit') {
    const v = VIEWS[view] || VIEWS.room;
    camera.position.set(...v.pos);
    orbit.target.set(...v.target);
    orbit.update();
  } else {
    walk.apply();
  }
  modeBtn.textContent = m === 'walk' ? 'Inspect (orbit)' : 'Walk';
  document.body.dataset.mode = m;
}
modeBtn.addEventListener('click', () => setMode(mode === 'walk' ? 'orbit' : 'walk'));
document.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => setMode('orbit', b.dataset.view)));
const qs = new URLSearchParams(location.search);
setMode(qs.get('mode') === 'orbit' ? 'orbit' : 'walk', qs.get('view') || 'room');

// ------------------------------------------------------------------ post: neon glow
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2), 0.35, 0.45, 1.5));
composer.addPass(new OutputPass());

// ------------------------------------------------------------------ GLB export
function download(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
async function exportGLB(object) {
  const clone = object.clone(true);
  clone.position.set(0, 0, 0);
  clone.rotation.set(0, 0, 0);
  const lights = [];
  clone.traverse((o) => { if (o.isLight) lights.push(o); });
  lights.forEach((l) => l.removeFromParent());
  const res = await new GLTFExporter().parseAsync(clone, { binary: true });
  return new Blob([res], { type: 'model/gltf-binary' });
}
const ASSETS = {
  yellow_bar_stool: () => stools[0],
  butcher_block_bar_counter: () => counters[0],
  pink_slat_chair: () => chairs[0],
  lime_booth: () => booths[0],
  terrazzo_table: () => tables[0],
  neon_open_sign_lightbox: () => neon,
  glass_double_door: () => door,
  liquor_pole_sign: () => liquor,
  rental_pole_sign: () => twoRivers,
  tire_shop: () => tireShop,
  rusty_pole: () => rustyPoles[0],
  ...Object.fromEntries(streetRow.map((b) => [b.name, () => b])),
  abandoned_storefront: () => abandoned,
  street_lamp: () => lamp,
  fire_hydrant: () => hydrant,
  napkin_dispenser: () => napkinProto,
  globe_pendant: () => pendantProto,
};
window.exportAssets = async () => {
  const out = {};
  for (const [name, get] of Object.entries(ASSETS)) out[name] = await exportGLB(get());
  return out;
};
document.getElementById('export')?.addEventListener('click', async () => {
  const files = await window.exportAssets();
  let i = 0;
  for (const [name, blob] of Object.entries(files)) setTimeout(() => download(blob, `${name}.glb`), 400 * i++);
});

// ------------------------------------------------------------------ light budget
// Phone GPUs garble colours (green/pink surfaces) when a shader has to handle
// too many lights. Only the MAX_LIGHTS point lights nearest the camera are on;
// the count never changes, so shaders compile once and stay small.
const IS_PHONE = matchMedia('(pointer: coarse)').matches;
const MAX_LIGHTS = IS_PHONE ? 4 : 8;
const pointLights = [];
scene.traverse((o) => { if (o.isPointLight) pointLights.push(o); });
const _lp = new THREE.Vector3();
let lightTimer = 0;
function updateLightBudget() {
  const cam = camera.position;
  pointLights.forEach((l) => { l.getWorldPosition(_lp); l.userData.d = _lp.distanceToSquared(cam); });
  const sorted = [...pointLights].sort((a, b) => a.userData.d - b.userData.d);
  sorted.forEach((l, i) => { l.visible = i < MAX_LIGHTS; });
}
updateLightBudget();

// ------------------------------------------------------------------ loop
const clock = new THREE.Clock();
let t = 0;
let doorOpen = 0;
let nearest = null;
const useBtn = document.getElementById('use');
const useNearest = () => { if (nearest) nearest.target = nearest.target ? 0 : 1; };
useBtn.addEventListener('click', useNearest);
addEventListener('keydown', (e) => { if (e.code === 'KeyE') useNearest(); });
const amberMats = new Set();
neon.traverse((o) => { if (o.isMesh && o.material.isMeshBasicMaterial && o.material.color.r > 1.9 && o.material.color.b === 0) amberMats.add(o.material); });
function frame() {
  const dt = Math.min(clock.getDelta(), 0.05);
  t += dt;
  if (mode === 'walk') walk.update(dt);
  else if (!window.__lock) orbit.update();
  sky.userData.update(camera, t);
  alien.userData.update(t);
  soupPots.forEach((p) => p.userData.update(t));
  puffCup.userData.update(t);
  creep.userData.update(t);
  cart.userData.update(t);
  {
    const near = mode === 'walk' && Math.abs(walk.position.x - GS.x) < 2.2 && Math.abs(walk.position.z - (GS.z + 6)) < 2.6;
    grocery.userData.update(dt, near);
    blueHouse.userData.update(dt);
    groceryDoor.active = !grocery.userData.doorsOpen();
  }
  if ((lightTimer += dt) > 0.4) { lightTimer = 0; updateLightBudget(); }
  walkPoles.forEach((p, i) => p.userData.update(t, i * 0.3));
  // Doors swing open when you walk up to them (inside or out).
  const near = mode === 'walk' && Math.hypot(walk.position.x - X1, walk.position.z - DOOR_Z) < 2.3;
  doorOpen += ((near ? 1 : 0) - doorOpen) * Math.min(1, dt * 4);
  // Doors you open yourself (E key or the on-screen button).
  let best = null, bestD = 3.2;
  for (const it of interactables) {
    it.t += Math.sign(it.target - it.t) * Math.min(Math.abs(it.target - it.t), dt * it.speed);
    it.setOpen(it.t);
    it.col.active = it.t < 0.6;
    const dd = Math.hypot(walk.position.x - it.x, walk.position.z - it.z);
    const sameFloor = it.y === undefined || Math.abs(walk.gy - it.y) < 1.2;
    if (mode === 'walk' && sameFloor && dd < bestD) { best = it; bestD = dd; }
  }
  nearest = best;
  useBtn.hidden = !best;
  if (best) useBtn.textContent = `${best.target ? 'Close' : 'Open'} ${best.name} (E)`;
  door.userData.setOpen(doorOpen);
  doorCollider.active = doorOpen < 0.7;
  const f = 0.94 + 0.06 * Math.sin(t * 31) * Math.sin(t * 7.3); // subtle neon buzz
  for (const m of amberMats) m.color.setRGB(2.0 * f, 0.42 * f, 0.0);
  composer.render();
  requestAnimationFrame(frame);
}
frame();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});
window.__scene = { scene, camera, walk, setMode, interactables, walkPoles, creep };
