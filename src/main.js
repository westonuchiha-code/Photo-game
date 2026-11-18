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
import { makeBooth } from './models/booth.js';
import { makeInfinityBox } from './models/neon.js';
import { makeDoubleDoor, makeWindowBay, makeDoorMat } from './models/entrance.js';
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

// ------------------------------------------------------------------ room shell
// 12 m x 9 m diner. North = window wall with the bar, east = storefront with
// the doors and neon sign, west = white tile with booths, south = lime wall.
const ROOM = { w: 12, d: 9, h: 3.2 };
const X0 = -ROOM.w / 2, X1 = ROOM.w / 2, Z0 = -ROOM.d / 2, Z1 = ROOM.d / 2;
const H = ROOM.h;
const room = new THREE.Group();
room.name = 'room';
scene.add(room);

function floorPatch(mat, x0, x1, z0, z1, y = 0) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), mat);
  m.rotation.x = -Math.PI / 2;
  m.position.set((x0 + x1) / 2, y, (z0 + z1) / 2);
  m.receiveShadow = true;
  room.add(m);
  return m;
}
// Main floor: the light laminate from the bar photo.
floorPatch(mats.floorWood(ROOM.w / 1.6, ROOM.d / 1.6), X0, X1, Z0, Z1);
// Booth zone: the walnut planks from the booth photo.
floorPatch(mats.floorWalnut(3.6 / 0.76, ROOM.d / 1.52), X0, X0 + 3.6, Z0, Z1, 0.001);
// Dark green vinyl band along the bar.
floorPatch(mats.floorVinyl(5.4 / 0.6, 1.9 / 0.6), -3.1, 2.3, Z0, Z0 + 1.9, 0.002);
// Triangle tiles at the entrance (0.60 m x 0.75 m per pattern repeat, scaled off the shoes in the photo).
floorPatch(mats.floorTriangle(3.2 / 0.6, 5.5 / 0.75), X1 - 3.2, X1, Z1 - 5.5, Z1, 0.002);

function wallPanel(mat, w, h, x, y, z, ry) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  m.position.set(x, y, z);
  m.rotation.y = ry;
  m.receiveShadow = true;
  room.add(m);
  return m;
}
// West: subway tile, full height (texture repeat = 0.3 m x 0.3 m = 2 x 4 tiles).
wallPanel(mats.subwayTile(ROOM.d / 0.3, H / 0.3), ROOM.d, H, X0, H / 2, 0, Math.PI / 2);
// South: lime green paint with a black baseboard.
wallPanel(mats.limeWall, ROOM.w, H, 0, H / 2, Z1, Math.PI);
const baseboard = new THREE.Mesh(new THREE.BoxGeometry(ROOM.w - 0.02, 0.14, 0.02), mats.post);
baseboard.position.set(0, 0.07, Z1 - 0.01);
room.add(baseboard);
// East: white tile piers between the window and the doors.
const eastTile = (z0, z1) => wallPanel(mats.subwayTile((z1 - z0) / 0.3, H / 0.3), z1 - z0, H, X1, H / 2, (z0 + z1) / 2, -Math.PI / 2);
eastTile(Z0, -2.5);
eastTile(0.6, 0.8);
eastTile(2.8, Z1);
wallPanel(mats.wall, 2.0, H - 2.35, X1, 2.35 + (H - 2.35) / 2, 1.8, -Math.PI / 2); // above the door
// North: short end walls either side of the window run.
wallPanel(mats.wall, 1.3, H, X0 + 0.65, H / 2, Z0, 0);
wallPanel(mats.wall, 1.5, H, X1 - 0.75, H / 2, Z0, 0);

// Ceiling + glowing LED strips (the long linear lights reflected in photo 1).
const ceil = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.w, ROOM.d), mats.ceiling);
ceil.rotation.x = Math.PI / 2;
ceil.position.y = H;
room.add(ceil);
const stripMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.75, 1.8), toneMapped: false });
for (const z of [-3.2, -0.6, 2.0]) {
  const s = new THREE.Mesh(new THREE.BoxGeometry(7, 0.03, 0.06), stripMat);
  s.position.set(-0.5, H - 0.02, z);
  room.add(s);
}

// Storefront glass + doors.
const northWin = makeWindowBay(mats, { w: 9.2, h: H - 0.25, transom: 2.4 });
northWin.position.set(-0.7, 0, Z0);
room.add(northWin);
const eastWin = makeWindowBay(mats, { w: 3.1, h: H - 0.25, transom: 2.4 });
eastWin.position.set(X1, 0, -0.95);
eastWin.rotation.y = -Math.PI / 2;
room.add(eastWin);
wallPanel(mats.wall, 9.2, 0.25, -0.7, H - 0.125, Z0 + 0.001, 0);
wallPanel(mats.wall, 3.1, 0.25, X1 - 0.001, H - 0.125, -0.95, -Math.PI / 2);
const door = makeDoubleDoor(mats, { w: 1.9, h: 2.25 });
door.position.set(X1, 0, 1.8);
door.rotation.y = -Math.PI / 2;
room.add(door);

// Night outside: a dark street backdrop with a few distant lights.
const outside = new THREE.Group();
const nightMat = new THREE.MeshBasicMaterial({ color: '#0d1420' });
const pavement = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({ color: '#2a2c30', roughness: 0.9 }));
pavement.rotation.x = -Math.PI / 2;
pavement.position.y = -0.01;
outside.add(pavement);
const backN = new THREE.Mesh(new THREE.PlaneGeometry(60, 12), nightMat);
backN.position.set(0, 4, Z0 - 12);
const backE = new THREE.Mesh(new THREE.PlaneGeometry(60, 12), nightMat);
backE.position.set(X1 + 12, 4, 0);
backE.rotation.y = -Math.PI / 2;
outside.add(backN, backE);
const farLights = new THREE.InstancedMesh(new THREE.SphereGeometry(0.06, 8, 6),
  new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 2.2, 1.2), toneMapped: false }), 40);
const m4 = new THREE.Matrix4();
for (let i = 0; i < 40; i++) {
  const a = Math.random(), y = 0.6 + Math.random() * 3;
  m4.makeTranslation(...(i < 22 ? [-14 + a * 28, y, Z0 - 11.8] : [X1 + 11.8, y, -14 + a * 28]));
  farLights.setMatrixAt(i, m4);
}
outside.add(farLights);
scene.add(outside);

// ------------------------------------------------------------------ lights
scene.add(new THREE.HemisphereLight('#ffffff', '#7a6c5c', 0.9));
const key = new THREE.DirectionalLight('#fff6ea', 1.3);
key.position.set(1.5, 7, 2);
key.target.position.set(-0.5, 0, -0.5);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
Object.assign(key.shadow.camera, { left: -7, right: 7, top: 6, bottom: -6, near: 0.5, far: 16 });
key.shadow.bias = -0.0004;
key.shadow.normalBias = 0.02;
scene.add(key, key.target);
for (const [x, z] of [[-3.5, -3], [0, -3], [3.5, -3], [-3.5, 1.5], [0, 1.5], [3.5, 1.5]]) {
  const p = new THREE.PointLight('#eef7ff', 3.2, 7, 2);
  p.position.set(x, H - 0.3, z);
  scene.add(p);
}

// Globe pendants over the bar (half black shade + white globe, from photos 1 & 2).
function pendant() {
  const g = new THREE.Group();
  const shade = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), mats.post);
  const globe = new THREE.Mesh(new THREE.SphereGeometry(0.15, 24, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 2.5, 2.6), toneMapped: false }));
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.9, 4), mats.post);
  cord.position.y = 0.6;
  const l = new THREE.PointLight('#fff3df', 2.5, 4, 2);
  l.position.y = -0.2;
  g.add(shade, globe, cord, l);
  return g;
}

// ------------------------------------------------------------------ furniture
const colliders = [];

// Bar: counter + 5 yellow stools along the north window (photo 1).
const counter = makeCounter(mats, { length: 4.4 });
counter.position.set(-0.4, 0, Z0 + 0.32);
scene.add(counter);
colliders.push({ type: 'box', minX: -2.65, maxX: 1.85, minZ: Z0, maxZ: Z0 + 0.6 });
const stools = [];
for (let i = 0; i < 5; i++) {
  const s = makeStool(mats, { seed: i });
  s.position.set(-0.4 + (i - 2) * 0.66 - 0.25, 0, Z0 + 0.32 + 0.48);
  s.rotation.y = Math.PI + (Math.random() - 0.5) * 0.12;
  scene.add(s);
  stools.push(s);
  colliders.push({ type: 'circle', x: s.position.x, z: s.position.z, r: 0.26 });
}
for (const x of [-2.2, -0.4, 1.4]) {
  const p = pendant();
  p.position.set(x, 2.15, Z0 + 0.45);
  scene.add(p);
}

// Booths along the tiled west wall (booth photo).
const booths = [];
for (const z of [-1.1, 1.3, 3.5]) {
  const b = makeBooth(mats, { length: 1.25 });
  b.position.set(X0 + 0.65, 0, z);
  scene.add(b);
  booths.push(b);
  const { x: sx, z: sz } = b.userData.size;
  colliders.push({ type: 'box', minX: X0, maxX: X0 + 0.02 + sx, minZ: z - sz / 2, maxZ: z + sz / 2 });
}

// Entrance (entrance photo): mat in front of the doors, pink chair by the tile pier.
const mat = makeDoorMat(mats, { w: 1.9, d: 0.95 });
mat.rotation.y = Math.PI / 2;
mat.position.set(X1 - 0.6, 0.006, 1.8);
scene.add(mat);
const chair = makePinkChair(mats);
chair.position.set(X1 - 0.45, 0, Z1 - 0.4);
chair.rotation.y = -Math.PI / 2 - 0.5;
scene.add(chair);
colliders.push({ type: 'circle', x: chair.position.x, z: chair.position.z, r: 0.28 });

// Neon OPEN sign in its infinity LED box, in the east window (window photo).
const neon = makeInfinityBox(mats);
neon.position.set(X1 - 0.08, 0.55 + 0.75, -0.95);
neon.rotation.y = -Math.PI / 2;
scene.add(neon);

// ------------------------------------------------------------------ controls
const walk = new WalkControls(camera, renderer.domElement, {
  bounds: { minX: X0 + 0.3, maxX: X1 - 0.3, minZ: Z0 + 0.3, maxZ: Z1 - 0.3 },
  colliders,
});
walk.position.set(3.6, 0, 3.0);
walk.yaw = 0.75;
walk.pitch = -0.12;

const orbit = new OrbitControls(camera, renderer.domElement);
orbit.enableDamping = true;
orbit.maxPolarAngle = Math.PI * 0.49;
orbit.minDistance = 0.4;
orbit.maxDistance = 9;
orbit.enabled = false;

const VIEWS = {
  bar: { pos: [1.4, 1.5, -1.6], target: [-0.6, 0.7, -3.9] },
  booth: { pos: [-3.0, 1.4, -0.1], target: [-5.3, 0.6, 0.1] },
  neon: { pos: [3.9, 1.5, -0.6], target: [5.9, 1.4, -0.95] },
  entrance: { pos: [2.6, 1.7, 3.2], target: [5.4, 0.4, 2.4] },
};
let mode = 'walk';
const modeBtn = document.getElementById('mode');
function setMode(m, view = 'bar') {
  mode = m;
  walk.enabled = m === 'walk';
  orbit.enabled = m === 'orbit';
  if (m === 'orbit') {
    const v = VIEWS[view] || VIEWS.bar;
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
setMode(qs.get('mode') === 'orbit' ? 'orbit' : 'walk', qs.get('view') || 'bar');

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
  butcher_block_bar_counter: () => counter,
  pink_slat_chair: () => chair,
  lime_booth: () => booths[0],
  neon_open_sign_lightbox: () => neon,
  glass_double_door: () => door,
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
const neonAmber = [];
neon.traverse((o) => { if (o.isMesh && o.material.isMeshBasicMaterial && o.material.color.r > 1.9 && o.material.color.b === 0) neonAmber.push(o.material); });
const amberMats = [...new Set(neonAmber)];
function frame() {
  const dt = Math.min(clock.getDelta(), 0.05);
  t += dt;
  if (mode === 'walk') walk.update(dt);
  else orbit.update();
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
