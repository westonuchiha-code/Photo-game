// Photo Town, phone test area: a small district assembled from the modular pieces (district generator, on-demand
// interiors, street services, cars, people), sized for a phone's memory. Its own page (phone.html) and its own build
// (tools/build_phone.mjs), which packs only the textures this file's imports can ask for.
// Everything here is placement + plumbing: the pieces themselves are the same code the big town uses.
import './texcache.js';   // (first: it routes every texture load; phones get textures at 512 px)
import * as THREE from 'three';
import { finishLoading } from './loading.js';
import { fontsReady } from './fonts.js';
import { WalkControls } from './walk.js';
import { makeStreamer, mergeStatic } from './stream.js';
import { makeAqueductGarden, makeIzakaya, makePotteryGallery, makeBarrelPlanter, makeCurvedBench, makeWifiStand, makeWeepingMaple, makePizzaAFrame, makeComicVending, makeStickerPost, makeMural as makeRainbowMural } from './models/inspo70.js';
import { makePinkHouse } from './models/inspo71.js';
import { makeKeiGarage } from './models/batch76.js';
import { makeDistrict, configureDistrict, GRID } from './models/district.js';
import { placeStreetServices } from './models/street92.js';
import { makeInteriors } from './interiors.js';
import { makePeople, makeCharacter, CHARACTERS } from './models/people96.js';
import { useLowDetailBodies } from './models/body97.js';
import { makeDriver } from './drive.js';
import { makeCar, LIVERIES, carEnv } from './vehicle/carbody.js';
import { makeSky } from './models/sky.js';
await fontsReady;

const qs = new URLSearchParams(location.search), PHONE = matchMedia('(pointer: coarse)').matches;
// ---- renderer: no post-processing, no shadows; resolution is the main cost on a phone screen, so it is governed below
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: navigator.webdriver });
const DPR = Math.min(window.devicePixelRatio || 1, 3); let pr = Math.min(DPR, PHONE ? 1.75 : 2); if (qs.has('pr')) pr = +qs.get('pr');
renderer.setPixelRatio(pr); renderer.setSize(innerWidth, innerHeight); renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.95;
document.getElementById('app').appendChild(renderer.domElement);
const scene = new THREE.Scene(); scene.background = new THREE.Color('#0b1018'); scene.fog = new THREE.Fog('#20232c', 90, 520);
const camera = new THREE.PerspectiveCamera(65, innerWidth / innerHeight, 0.1, 2400);
addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });
const sky = makeSky(); scene.add(sky);
const moon = new THREE.DirectionalLight('#b9c6dd', 0.5); moon.position.copy(sky.userData.moonDir).multiplyScalar(50); scene.add(moon);
scene.add(new THREE.HemisphereLight('#dfe6f0', '#5e544a', 0.75));   // (a little more than the big town: there are no real street lights here, only lamp glow)
scene.environment = carEnv(renderer); scene.environmentIntensity = 0.14;

// ---- the area: four blocks (three streets each way) with rows of buildings round the outside
configureDistrict({ xs: [75, 161, 245], zs: [-84, 0, 84], ring: { n: 121, s: -121, e: 282, hw: 9 }, lots: ['pottery', 'izakaya', 'ruins', 'pinkhouse', 'keigarage'] });
const colliders = [];
const district = makeDistrict(); scene.add(district);
colliders.push(...district.userData.colliders);   // (dumpsters, court lamps and tree beds)
for (const [x, z] of district.userData.lampPosts) colliders.push({ type: 'circle', x, z, r: 0.18 });
for (const [x, z] of district.userData.treePosts) colliders.push({ type: 'circle', x, z, r: 0.25 });
const SW = district.userData.sidewalkY;
const svc = placeStreetServices({ grid: GRID, sidewalkY: SW }); scene.add(svc.group); colliders.push(...svc.colliders);
// the streets stop at the edge of the area: a striped barrier across each end
{ const { xs, zs, walk: WH } = GRID, R = GRID.ring, bm = new THREE.MeshStandardMaterial({ color: '#d8c22a', roughness: 0.6 }), dk = new THREE.MeshStandardMaterial({ color: '#1c1c1e', roughness: 0.7 });
  const barrier = (x, z, alongX) => { const g = new THREE.Group(), L = WH * 2; for (let i = 0; i < 8; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(L / 8, 0.22, 0.06), i % 2 ? bm : dk); m.position.set(-L / 2 + (i + 0.5) * L / 8, 0.95, 0); g.add(m); } for (const s of [-1, 0, 1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.1, 0.1), dk); p.position.set(s * (L / 2 - 0.2), 0.55, 0); g.add(p); } g.position.set(x, 0, z); if (!alongX) g.rotation.y = Math.PI / 2; scene.add(g);
    colliders.push(alongX ? { type: 'box', minX: x - WH, maxX: x + WH, minZ: z - 0.15, maxZ: z + 0.15 } : { type: 'box', minX: x - 0.15, maxX: x + 0.15, minZ: z - WH, maxZ: z + WH }); };
  for (const x of xs) { barrier(x, R.n - R.hw - 1.2, true); barrier(x, R.s + R.hw + 1.2, true); } for (const z of zs) { barrier(R.e - R.hw - 1.2, z, false); barrier(xs[0] - WH - 0.6 + 1.2, z, false); } }

// ---- places built by hand from the photo sets, on their reserved lots (same pieces and positions as in the big town)
const siteAreas = [], floors = [], kei = {};
{ const rect = (x0, x1, z0, z1) => colliders.push({ type: 'box', minX: x0, maxX: x1, minZ: z0, maxZ: z1 });
  const put = (o) => { scene.add(o); mergeStatic(o); return o; };   // (each set's fixed parts merge by material: far fewer things to draw)
  const placeL = (o, x, z, ry = 0, y = 0.14) => { o.position.set(x, y, z); o.rotation.y = ry; const c = o.userData.collider; if (c) { const q = Math.round(ry / (Math.PI / 2)) & 3, [a0, b0, c0, c1] = c; const r = q === 0 ? [a0, b0, c0, c1] : q === 2 ? [-b0, -a0, -c1, -c0] : q === 1 ? [c0, c1, -b0, -a0] : [-c1, -c0, a0, b0]; rect(x + r[0], x + r[1], z + r[2], z + r[3]); } return put(o); };
  // Kiln & Co. pottery, the old izakaya, the aqueduct ruins garden and its small plaza with the rainbow mural (main street, west)
  { const pg = makePotteryGallery(); pg.position.set(105.5, 0.14, -11.0); for (const [x0, x1, z0, z1] of pg.userData.colliders) rect(105.5 + x0, 105.5 + x1, -11 + z0, -11 + z1); for (const a of pg.userData.areas) siteAreas.push({ minX: 105.5 + a.minX, maxX: 105.5 + a.maxX, minZ: -11 + a.minZ, maxZ: -11 + a.maxZ }); put(pg); floors.push([100.5, 110.5, -14.5, -7, 0.14]); }
  placeL(makeIzakaya(), 116.5, -7.15);
  { const gd = makeAqueductGarden(); gd.position.set(132, 0, -13.5); for (const [x0, x1, z0, z1] of gd.userData.colliders) rect(132 + x0, 132 + x1, -13.5 + z0, -13.5 + z1); siteAreas.push({ minX: 124.2, maxX: 139.8, minZ: -13.8, maxZ: -7.0 }); put(gd); }
  { const t = new THREE.TextureLoader().load('assets/textures/i5_paving.png'); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 4); const pav = new THREE.Mesh(new THREE.PlaneGeometry(13, 14), new THREE.MeshStandardMaterial({ map: t, roughness: 0.85 })); pav.rotation.x = -Math.PI / 2; pav.position.set(147, 0.03, -14.5); scene.add(pav); siteAreas.push({ minX: 140.6, maxX: 153.4, minZ: -21.2, maxZ: -7.0 }); }
  placeL(makeRainbowMural(), 147, -21.3, 0, 0);
  for (const [x, z] of [[143.5, -17.5], [150.5, -17.5], [143.5, -11.5]]) placeL(makeBarrelPlanter(Math.round(x)), x, z, 0, 0);
  placeL(makeCurvedBench(), 147, -16.2, Math.PI, 0); placeL(makeCurvedBench(), 147, -12.0, 0, 0); placeL(makeWeepingMaple(), 150.5, -11.0, 0, 0); placeL(makeWifiStand(), 152.4, -8.2, 0, 0);
  placeL(makePizzaAFrame(), 101.2, -6.1, 0.3); placeL(makeComicVending(), 110.6, -6.5, 0); placeL(makeStickerPost(), 121.6, -5.6, 0);
  // the pink bungalow with its bottle tree, and the kei car garage beside it (the street at z = 84)
  { const PH = { x: 175, z: 74.6 }, pink = makePinkHouse(); pink.position.set(PH.x, 0.02, PH.z); for (const [x0, x1, z0, z1] of pink.userData.colliders) rect(PH.x + x0, PH.x + x1, PH.z + z0, PH.z + z1); put(pink); }
  { const KG = { x: 186.5, z: 77 }, kgar = makeKeiGarage({ car: false }); kgar.position.set(KG.x, 0.02, KG.z); for (const [x0, x1, z0, z1] of kgar.userData.colliders) rect(KG.x + x0, KG.x + x1, KG.z + z0, KG.z + z1); for (const a of kgar.userData.areas) siteAreas.push({ minX: a.minX + KG.x, maxX: a.maxX + KG.x, minZ: a.minZ + KG.z, maxZ: a.maxZ + KG.z }); kei.x = KG.x + kgar.userData.carPose.x; kei.z = KG.z + kgar.userData.carPose.z; put(kgar); } }

// ---- walking + driving
const walk = new WalkControls(camera, renderer.domElement, { bounds: null, areas: [...district.userData.areas, ...siteAreas], colliders, speed: 2.75 });   // (25% faster than the big town's 2.2 m/s)
const drive = makeDriver({ scene, camera, areas: walk.areas.slice(), colliders, pads: [], ground: (x, z) => district.userData.floorY(x, z) ?? 0 });
const interiors = makeInteriors({ scene, district, colliders, areas: walk.areas });   // (cars keep the earlier area list: they can't enter buildings)
walk.ground = (x, z) => { for (const [x0, x1, z0, z1, y] of floors) if (x > x0 && x < x1 && z > z0 && z < z1) return y; return interiors.floorY(x, z) ?? district.userData.floorY(x, z) ?? 0; };
for (const [type, opt, x, z, h] of [
  ['hatch', { color: '#b3242a', name: 'red hatch', plate: 'ELM 2K7' }, 157.4, 30, 0],
  ['kei', { color: '#a8d6c6', roofColor: '#f2f0ea', rim: 'steel', name: 'mint kei car', plate: 'ELM 55K', metal: 0.2 }, 157.4, 46, 0],
  ['sedan', { color: '#f0c41c', rim: 'steel', name: 'cab', plate: 'ELM T41', livery: LIVERIES.taxi, metal: 0.15 }, 120, 3.7, Math.PI / 2],
  ['pickup', { color: '#5e6e52', rim: 'alloy', name: 'pickup', plate: 'ELM 7P8', chromeGrille: true }, 204, -3.6, -Math.PI / 2],
  ['coupe', { color: '#1b3a78', rim: 'black', name: 'blue coupe', plate: 'ELM 9C3' }, 164.6, -40, Math.PI],
  ['keiold', { name: 'dusty kei car', color: '#4a78b8', dust: 0.9, rim: 'steel', plate: 'ELM 360' }, kei.x, kei.z, 0],   // in its garage by the pink house
]) { const c = makeCar({ type, ...opt }); c.position.set(x, 0, z); c.rotation.y = h; scene.add(c); drive.addCar(c, { name: opt.name }); }
// one more car parked in a bay of each back court
{ const PARK = [['sedan', { color: '#2a2c30', name: 'black sedan', plate: 'ELM 4B1', rim: 'alloy' }], ['hatch', { color: '#d8d4c8', name: 'white hatch', plate: 'ELM 8W2', rim: 'steel' }], ['kei', { color: '#c87a2a', name: 'orange kei car', plate: 'ELM 3K9', rim: 'steel' }], ['pickup', { color: '#6a2a26', name: 'red pickup', plate: 'ELM 6R5', rim: 'steel' }]];
  district.userData.courts.forEach((ct, i) => { const [type, opt] = PARK[i % PARK.length], [x, z] = ct.bays[(i * 2 + 1) % ct.bays.length], c = makeCar({ type, ...opt }); c.position.set(x, 0, z); c.rotation.y = i % 2 ? Math.PI : 0; scene.add(c); drive.addCar(c, { name: opt.name }); }); }
if (PHONE || qs.has('low')) useLowDetailBodies();
const people = makePeople({ scene, grid: GRID, sidewalkY: SW, count: PHONE ? 14 : 20 });
// the first photo-faced character, standing on the sidewalk by the start (he turns his head to watch you)
const hank = makeCharacter(CHARACTERS.hank); hank.position.set(166.4, SW, 25.5); hank.rotation.y = Math.PI * 0.82; scene.add(hank); colliders.push({ type: 'circle', x: 166.4, z: 25.5, r: 0.3 });
console.log('phone area: buildings', district.userData.buildings.length, 'interiors', JSON.stringify(interiors.stats()));

// ---- modes: on foot, or in a car (the one button gets you in and out)
let mode = 'walk'; const useBtn = document.getElementById('use');
const setMode = (m) => { mode = m; walk.enabled = m === 'walk'; document.body.dataset.mode = m; };
const use = () => { if (mode === 'drive') { const out = drive.exit(); if (out) { walk.position.set(out.x, 0, out.z); walk.yaw = out.yaw; walk.pitch = -0.05; } setMode('walk'); walk.apply(); } else { const c = drive.nearest(walk.position); if (c) { drive.enter(c); setMode('drive'); } } };
useBtn.addEventListener('click', use); addEventListener('keydown', (e) => { if (e.code === 'KeyE') use(); });
walk.position.set(+(qs.get('x') ?? 163.5), 0, +(qs.get('z') ?? 20)); walk.yaw = +(qs.get('yaw') ?? 0.15); walk.pitch = 0.02; setMode('walk'); walk.apply();

// ---- drawing less: size-based culling; the outside is not drawn while you're shut indoors; resolution steps down if slow
const streamer = makeStreamer(scene, { phone: true, max: 300 }); streamer.setScale(PHONE ? 0.8 : 1);
let shutIn = null; const shutHidden = [];
function setShutIn(e) { for (const o of shutHidden) o.visible = true; shutHidden.length = 0; shutIn = e; if (!e) return;
  const keep = new Set([e.group, interiors.doors]), special = (o) => { let f = false; o.traverse((c) => { if (c.isLight || c.isCamera || keep.has(c)) f = true; }); return f; };
  const walkIn = (node) => { for (const c of node.children) { if (c.isLight || c.isCamera || keep.has(c) || !c.visible) continue; if (special(c)) walkIn(c); else { c.visible = false; shutHidden.push(c); } } }; walkIn(scene); }
// a readout (?stats, or tap the top-left corner three times): frames per second, resolution scale, draw calls, triangles
const statEl = document.getElementById('stats'); let statOn = qs.has('stats'), taps = 0; statEl.hidden = !statOn;
addEventListener('pointerdown', (e) => { if (e.clientX < 70 && e.clientY < 70) { if (++taps >= 3) { taps = 0; statOn = !statOn; statEl.hidden = !statOn; } } else taps = 0; });
const clock = new THREE.Clock(); let t = 0, tick = 0, acc = 0, frames = 0, fps = 0, slow = 0, fast = 0;
function frame() {
  if (window.__loadingHold) { clock.getDelta(); requestAnimationFrame(frame); return; }
  const raw = clock.getDelta(), dt = Math.min(raw, 0.05); t += dt;
  if (mode === 'walk') walk.update(dt); else drive.update(dt);
  sky.userData.update(camera, t);
  const pos = mode === 'walk' ? walk.position : drive.state;
  interiors.update(mode === 'walk' ? walk.position : camera.position, dt, mode !== 'drive');
  { const e = interiors.enclosed(); if (e !== shutIn) setShutIn(e); }
  if (!shutIn && (tick = (tick + 1) % 10) === 0) { streamer.update(camera.position); district.userData.lodTick(camera.position, PHONE ? 55 : 110); }
  { const hb = hank.userData.bones, dx = camera.position.x - hank.position.x, dz = camera.position.z - hank.position.z; if (dx * dx + dz * dz < 144) { let a = Math.atan2(dx, dz) - hank.rotation.y; a = Math.atan2(Math.sin(a), Math.cos(a)); const want = Math.max(-1.1, Math.min(1.1, a)); hb.head.rotation.y += (want * 0.7 - hb.head.rotation.y) * Math.min(1, dt * 5); hb.neck.rotation.y = hb.head.rotation.y * 0.4; } }
  people.update(pos, dt, mode === 'drive' ? drive.state : null, mode === 'walk');
  const car = mode === 'walk' ? drive.nearest(walk.position) : null;
  useBtn.hidden = mode === 'walk' && !car; useBtn.textContent = mode === 'drive' ? 'Get out' : car ? `Drive the ${car.userData.driveName}` : '';
  renderer.render(scene, camera);
  // once a second: measure, show, and step the resolution (down fast when slow, back up slowly when there's room)
  acc += raw; frames++; if (acc >= 1) { fps = frames / acc; acc = 0; frames = 0;
    if (!qs.has('pr')) { if (fps < 26) { fast = 0; if (++slow >= 2 && pr > 0.8) { pr = Math.max(0.8, pr - 0.25); renderer.setPixelRatio(pr); slow = 0; } } else if (fps > 52) { slow = 0; if (++fast >= 6 && pr < Math.min(DPR, 2)) { pr = Math.min(DPR, 2, pr + 0.25); renderer.setPixelRatio(pr); fast = 0; } } else { slow = 0; fast = 0; } }
    if (statOn) { const i = renderer.info; statEl.textContent = `${fps.toFixed(0)} fps · res x${pr.toFixed(2)} · ${i.render.calls} draws · ${(i.render.triangles / 1000).toFixed(0)}k tris · ${i.memory.textures} tex · ${i.memory.geometries} geo${shutIn ? ' · indoors' : ''}`; } }
  requestAnimationFrame(frame);
}
window.__scene = { renderer, scene, camera, walk, drive, interiors, people, district, streamer, setMode, use, stats: () => ({ fps, pr, calls: renderer.info.render.calls, tris: renderer.info.render.triangles, tex: renderer.info.memory.textures, geo: renderer.info.memory.geometries }) };
requestAnimationFrame(frame);
finishLoading(renderer, scene, camera);
