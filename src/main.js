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
import { makeNapkinDispenser, makePoster, makeOpenPlaque, makeWallGlobe } from './models/props.js';
import { makeLiquorSign, makeTwoRiversSign } from './models/signs.js';
import { plane } from './world/util.js';
import { WalkControls } from './walk.js';

// ------------------------------------------------------------------ renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
document.getElementById('app').appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color('#0b1018');
const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.05, 80);
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
const pavement = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshStandardMaterial({ color: '#2a2c30', roughness: 0.9 }));
pavement.rotation.x = -Math.PI / 2;
pavement.position.y = -0.01;
outside.add(pavement);
const nightMat = new THREE.MeshBasicMaterial({ color: '#0d1420' });
const backN = new THREE.Mesh(new THREE.PlaneGeometry(80, 14), nightMat);
backN.position.set(0, 5, Z0 - 16);
const backE = new THREE.Mesh(new THREE.PlaneGeometry(80, 14), nightMat);
backE.position.set(X1 + 16, 5, 0);
backE.rotation.y = -Math.PI / 2;
outside.add(backN, backE);
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
  m4.makeTranslation(...(i < 22 ? [-18 + a * 36, y, Z0 - 15.8] : [X1 + 15.8, y, -18 + a * 36]));
  farLights.setMatrixAt(i, m4);
}
outside.add(farLights);
scene.add(outside);

// ------------------------------------------------------------------ lights
scene.add(new THREE.HemisphereLight('#ffffff', '#7a6c5c', 0.9));
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
  const p = new THREE.PointLight('#eef7ff', 3.0, 7, 2);
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
add(plane(mats.sidewalk, X1, X1 + 3, -9, 9, 0.003, 1.5));
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
const signLight = new THREE.PointLight('#fff1dc', 4, 7, 2); // soft light so the Two Rivers face reads at night
signLight.position.set(X1 + 2.8, 3.2, 3.0);
scene.add(signLight);
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

// ------------------------------------------------------------------ controls
const walk = new WalkControls(camera, renderer.domElement, {
  bounds: { minX: X0 + 0.3, maxX: X1 + 8.6, minZ: Z0 + 0.3, maxZ: Z1 - 0.3 },
  colliders,
});
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
composer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2), 0.55, 0.5, 1.35));
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
  two_rivers_pole_sign: () => twoRivers,
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

// ------------------------------------------------------------------ loop
const clock = new THREE.Clock();
let t = 0;
let doorOpen = 0;
const amberMats = new Set();
neon.traverse((o) => { if (o.isMesh && o.material.isMeshBasicMaterial && o.material.color.r > 1.9 && o.material.color.b === 0) amberMats.add(o.material); });
function frame() {
  const dt = Math.min(clock.getDelta(), 0.05);
  t += dt;
  if (mode === 'walk') walk.update(dt);
  else orbit.update();
  // Doors swing open when you walk up to them (inside or out).
  const near = mode === 'walk' && Math.hypot(walk.position.x - X1, walk.position.z - DOOR_Z) < 2.3;
  doorOpen += ((near ? 1 : 0) - doorOpen) * Math.min(1, dt * 4);
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
window.__scene = { scene, camera, walk, setMode };
