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
import { makeNapkinDispenser, makePoster, makeOpenPlaque, makeWallGlobe, makeCanvas, makeMural } from './models/props.js';
import { makeLiquorSign, makeTwoRiversSign } from './models/signs.js';
import { makeAbandonedBuilding, makeStreetLamp, makeFireHydrant, makePlasticBottle } from './models/abandoned.js';
import { plane } from './world/util.js';
import { makeTireShop, TIRE_SHOP } from './models/tireshop.js';
import { makeRustyPole, makeWalkSignalPole } from './models/street.js';
import { makeStreetBuilding } from './models/buildings.js';
import { makePaverSidewalk, makeDrainCover, makePaverCrosswalk, makeTactilePlate, makeCracks, makeUtilityLid, makeTrafficIsland, makeDirtLot } from './models/streetground.js';
import { makeSky } from './models/sky.js';
import { makeAlienFormation } from './models/alien.js';
import { makeApartment } from './models/apartment.js';
import { makeNewsBox, makeParkingSignBlock, makeParkingRamp, makeTealStorefront, makeRabbitSculpture } from './models/locations.js';
import { makeSpruce, makeCherry, makePaleTree, makeOak, makeTreePit, makeMulchBed } from './models/trees.js';
import { makeRockBed, makeGrassTufts, makeCurbWithLeaves, makeLooseLeaves, makeBikeRack } from './models/ground.js';
import { WalkControls } from './walk.js';

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
for (const [a, b, c, d] of [[-80, 13, -120, 80], [17, 120, -120, 80], [13, 17, -120, -23], [13, 17, -9, 80]]) {
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
add(ramp);
rect(12.75, 13.0, -23.2, -9);   // side walls / parapets (you enter from the open end)
rect(17.0, 17.25, -23.2, -9);
rect(13, 17, -23.4, -23.0);    // garage door
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

// ------------------------------------------------------------------ alien formation (alien texture photos)
// Hidden in the dirt lot behind the blue construction fence.
const alien = makeAlienFormation();
alien.position.set(44.5, 0, -3);
alien.scale.setScalar(0.85);
add(alien);
for (const [x, z, cr] of alien.userData.colliders) circle(44.5 + x * 0.85, -3 + z * 0.85, cr * 0.85);

// ------------------------------------------------------------------ controls
const walk = new WalkControls(camera, renderer.domElement, {
  bounds: null,
  areas: [
    { minX: X0 + 0.3, maxX: X1 - 0.3, minZ: Z0 + 0.3, maxZ: Z1 - 0.3 }, // restaurant
    { minX: X1 - 0.5, maxX: X1 + 0.6, minZ: DOOR_Z - 0.9, maxZ: DOOR_Z + 0.9 }, // doorway
    { minX: X1 + 0.3, maxX: 66, minZ: -40, maxZ: 11.7 }, // outside
  ],
  colliders,
});
walk.ground = (x, z, prevY) => {
  const ay = apt.userData.floorY(z - AP.z, AP.x - x, prevY);
  return ay !== null ? ay : ramp.userData.floorY(x, z);
};
walk.position.set(6.6, 0, 0.2);
walk.yaw = 1.25;
walk.pitch = -0.1;

const orbit = new OrbitControls(camera, renderer.domElement);
orbit.enableDamping = true;
orbit.maxPolarAngle = Math.PI * 0.49;
orbit.minDistance = 0.4;
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
  ramp: { pos: [15, 2.6, -4.5], target: [15, -1.5, -17] },
  tealshop: { pos: [44, 1.8, -10.5], target: [45, 1.8, -16] },
  rabbit: { pos: [17.4, 1.5, 7.6], target: [16, 1.6, 10.3] },
  newsbox: { pos: [10.2, 1.3, -1.6], target: [8.55, 0.5, -3.1] },
  canvases: { pos: [-1, 1.7, 1.2], target: [-1, 1.8, 5] },
  mural: { pos: [5.2, 2.2, 10.2], target: [10, 3, 16.2] },
  apartment: { pos: [38.5, 3.5, 4.5], target: [52, 5, -1] },
  stoop: { pos: [47.6, 2.4, 3.4], target: [50.5, 1.0, -1] },
  alien: { pos: [40.4, 2.4, 1.6], target: [44.5, 1.4, -3] },
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
  else orbit.update();
  sky.userData.update(camera, t);
  alien.userData.update(t);
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
    if (mode === 'walk' && dd < bestD) { best = it; bestD = dd; }
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
window.__scene = { scene, camera, walk, setMode, interactables, walkPoles };
