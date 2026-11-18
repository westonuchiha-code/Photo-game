import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { makeMaterials } from './materials.js';
import { makeStool } from './models/stool.js';
import { makeCounter } from './models/counter.js';
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
scene.background = new THREE.Color('#d9d6cf');
const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.05, 60);

const mats = makeMaterials();

// ------------------------------------------------------------------ blank room
const ROOM = { w: 10, d: 8, h: 3 };
const room = new THREE.Group();
room.name = 'room';

const floor = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.w, ROOM.d), mats.floorWood(ROOM.w / 1.6, ROOM.d / 1.6));
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
room.add(floor);

const COUNTER_Z = -1.6;
// Dark green vinyl band in front of the counter, like in the photo.
const band = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 1.8), mats.floorVinyl(6.2 / 0.6, 1.8 / 0.6));
band.rotation.x = -Math.PI / 2;
band.position.set(0, 0.002, COUNTER_Z + 0.45);
band.receiveShadow = true;
room.add(band);

const wallGeo = (w) => new THREE.PlaneGeometry(w, ROOM.h);
const walls = [
  [ROOM.w, [0, ROOM.h / 2, -ROOM.d / 2], 0],
  [ROOM.w, [0, ROOM.h / 2, ROOM.d / 2], Math.PI],
  [ROOM.d, [-ROOM.w / 2, ROOM.h / 2, 0], Math.PI / 2],
  [ROOM.d, [ROOM.w / 2, ROOM.h / 2, 0], -Math.PI / 2],
];
for (const [w, p, ry] of walls) {
  const m = new THREE.Mesh(wallGeo(w), mats.wall);
  m.position.set(...p);
  m.rotation.y = ry;
  m.receiveShadow = true;
  room.add(m);
}
const ceil = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.w, ROOM.d), mats.ceiling);
ceil.rotation.x = Math.PI / 2;
ceil.position.y = ROOM.h;
room.add(ceil);

// Long LED strip lights (as seen reflected in the photo's windows).
const stripMat = new THREE.MeshBasicMaterial({ color: '#f2fbff' });
for (const z of [-2.2, 0.4, 2.6]) {
  const s = new THREE.Mesh(new THREE.BoxGeometry(6, 0.03, 0.06), stripMat);
  s.position.set(0, ROOM.h - 0.02, z);
  room.add(s);
}
scene.add(room);

// ------------------------------------------------------------------ lights
scene.add(new THREE.HemisphereLight('#ffffff', '#8a7a68', 1.1));
const key = new THREE.DirectionalLight('#fff6ea', 1.6);
key.position.set(2.5, 6, 3);
key.target.position.set(0, 0, COUNTER_Z);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
Object.assign(key.shadow.camera, { left: -5, right: 5, top: 4, bottom: -4, near: 0.5, far: 15 });
key.shadow.bias = -0.0004;
key.shadow.normalBias = 0.02;
scene.add(key, key.target);
for (const x of [-2.5, 0, 2.5]) {
  const p = new THREE.PointLight('#eef7ff', 6, 7, 2);
  p.position.set(x, ROOM.h - 0.3, -0.6);
  scene.add(p);
}

// ------------------------------------------------------------------ assets
const counter = makeCounter(mats, { length: 4.4 });
counter.position.set(0, 0, COUNTER_Z);
scene.add(counter);

const stools = [];
const N = 5, SPACING = 0.66;
for (let i = 0; i < N; i++) {
  const s = makeStool(mats, { seed: i });
  s.position.set((i - (N - 1) / 2) * SPACING - 0.25, 0, COUNTER_Z + 0.48);
  s.rotation.y = Math.PI + (Math.random() - 0.5) * 0.12; // facing the counter, slightly uneven
  scene.add(s);
  stools.push(s);
}

// ------------------------------------------------------------------ colliders
const colliders = [
  { type: 'box', minX: -2.25, maxX: 2.25, minZ: COUNTER_Z - 0.27, maxZ: COUNTER_Z + 0.27 },
  ...stools.map((s) => ({ type: 'circle', x: s.position.x, z: s.position.z, r: 0.26 })),
];

// ------------------------------------------------------------------ controls
const walk = new WalkControls(camera, renderer.domElement, {
  bounds: { minX: -ROOM.w / 2 + 0.3, maxX: ROOM.w / 2 - 0.3, minZ: -ROOM.d / 2 + 0.3, maxZ: ROOM.d / 2 - 0.3 },
  colliders,
});
walk.position.set(0.6, 0, 1.6);
walk.yaw = 0.25;
walk.pitch = -0.28;

const orbit = new OrbitControls(camera, renderer.domElement);
orbit.target.set(0, 0.7, COUNTER_Z + 0.3);
orbit.enableDamping = true;
orbit.maxPolarAngle = Math.PI * 0.49;
orbit.minDistance = 0.6;
orbit.maxDistance = 7;
orbit.enabled = false;

let mode = 'walk';
const modeBtn = document.getElementById('mode');
function setMode(m) {
  mode = m;
  walk.enabled = m === 'walk';
  orbit.enabled = m === 'orbit';
  if (m === 'orbit') {
    camera.position.set(1.9, 1.5, COUNTER_Z + 2.4);
    orbit.update();
  } else {
    walk.apply();
  }
  modeBtn.textContent = m === 'walk' ? 'Inspect (orbit)' : 'Walk';
  document.body.dataset.mode = m;
}
modeBtn.addEventListener('click', () => setMode(mode === 'walk' ? 'orbit' : 'walk'));
setMode(new URLSearchParams(location.search).get('mode') === 'orbit' ? 'orbit' : 'walk');

// ------------------------------------------------------------------ GLB export
function download(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
async function exportGLB(object, name) {
  const clone = object.clone(true);
  clone.position.set(0, 0, 0);
  clone.rotation.set(0, 0, 0);
  const res = await new GLTFExporter().parseAsync(clone, { binary: true });
  return new Blob([res], { type: 'model/gltf-binary' });
}
window.exportAssets = async () => ({
  stool: await exportGLB(stools[0], 'stool'),
  counter: await exportGLB(counter, 'counter'),
});
document.getElementById('export').addEventListener('click', async () => {
  const { stool, counter: c } = await window.exportAssets();
  download(stool, 'yellow_bar_stool.glb');
  setTimeout(() => download(c, 'butcher_block_bar_counter.glb'), 400);
});

// ------------------------------------------------------------------ loop
const clock = new THREE.Clock();
function frame() {
  const dt = Math.min(clock.getDelta(), 0.05);
  if (mode === 'walk') walk.update(dt);
  else orbit.update();
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
frame();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
window.__scene = { scene, camera, walk, setMode };
