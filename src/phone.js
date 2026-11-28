// Photo Town, phone build. The world is a set of AREAS, each small enough for a phone's memory: only one is ever
// built. Walking or driving out along a street that leads to another area shows a short loading screen, clears the
// area you left (its meshes and textures leave the graphics memory) and builds the next one; a car you're driving
// comes with you. Each area is assembled from the modular pieces (district generator, on-demand interiors, street
// services, cars, people) plus the hand-built photo sets that stand on its reserved lots.
// Its own page (phone.html) and its own build (tools/build_phone.mjs), which packs only the textures these imports use.
import { shrinkCanvases } from './texcache.js';   // (first: it routes every texture load; phones get textures at 512 px)
import './texpolish.js';   // (second: the no-repeat pass, POLISH_NOTES 150)
import * as THREE from 'three';
import { finishLoading } from './loading.js';
import { fontsReady } from './fonts.js';
import { WalkControls } from './walk.js';
import { makeStreamer, mergeStatic } from './stream.js';
import { makeDistrict, configureDistrict, GRID } from './models/district.js';
import { placeStreetServices } from './models/street92.js';
import { makeInteriors } from './interiors.js';
import { makePeople, makePerson, makeCharacter, CHARACTERS } from './models/people96.js';
import { makeTalk, whoIs, keeperOf, character } from './npc/talk.js';
import { SHOP_KINDS, ITEM } from './npc/lines.js';
import { makeBooth, makeShopMenu } from './shop/bodyshop.js';
import { makeTraffic } from './vehicle/traffic.js';
import { makeSound } from './mood/sound.js';
import { makeHands } from './player/hands.js';
import { makeMap } from './player/map.js';
import { stockShop, makeGood } from './shop/goods.js';
import { makeWrongPlace } from './mood/wrong.js';
import { useLowDetailBodies } from './models/body97.js';
import { makeDriver2 } from './vehicle/drive2.js';
import { makeCar, LIVERIES, carEnv } from './vehicle/carbody2.js';
import { makeSky } from './models/sky.js';
import { makeAqueductGarden, makeIzakaya, makePotteryGallery, makeBarrelPlanter, makeCurvedBench, makeWifiStand, makeWeepingMaple, makePizzaAFrame, makeComicVending, makeStickerPost, makeMural as makeRainbowMural } from './models/inspo70.js';
import { makePinkHouse } from './models/inspo71.js';
import { preloadPxPeople, pxPeopleReady, pxPerson } from './models/psx_rig.js';
import { makeKeiGarage } from './models/batch76.js';
import { makeArtGallery } from './models/inspo68.js';
import { makeTempleFront } from './models/inspo72.js';
import { makePocketPark } from './models/batch73.js';
import * as P131 from './models/props131.js';
import * as P132 from './models/props132.js';
import * as P137 from './models/props137.js';
import * as P138 from './models/props138.js';
import { makeMallPassage } from './models/batch75.js';
import { buildOldSquare } from './areas/oldsquare.js';
import { buildOldSouth } from './areas/oldsouth.js';
await fontsReady;
await preloadPxPeople().catch((e) => console.warn('psx people', e && e.message));   // the PSX pack people (POLISH_NOTES 152): half the crowd

const qs = new URLSearchParams(location.search), PHONE = matchMedia('(pointer: coarse)').matches;
if (PHONE || qs.has('low')) useLowDetailBodies();
// ---- the engine: made once. No post-processing, no shadows; resolution is governed in the frame loop.
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: navigator.webdriver });
const DPR = Math.min(window.devicePixelRatio || 1, 3); let pr = Math.min(DPR, PHONE ? 1.75 : 2); if (qs.has('pr')) pr = +qs.get('pr');
renderer.setPixelRatio(pr); renderer.setSize(innerWidth, innerHeight); renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.95;
document.getElementById('app').appendChild(renderer.domElement);
const scene = new THREE.Scene(); scene.background = new THREE.Color('#0b1018'); scene.fog = new THREE.Fog('#20232c', 90, 520);
const camera = new THREE.PerspectiveCamera(65, innerWidth / innerHeight, 0.1, 2400);
addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });
const sky = makeSky(); scene.add(sky);
const moon = new THREE.DirectionalLight('#b9c6dd', 0.5); moon.position.copy(sky.userData.moonDir).multiplyScalar(50); scene.add(moon);
const hemi = new THREE.HemisphereLight('#dfe6f0', '#5e544a', 0.75); scene.add(hemi); scene.add(camera);   /* (the camera carries your hands and the torch) */   // (there are no real street lights here, only lamp glow)
scene.environment = carEnv(renderer); scene.environmentIntensity = 0.14;
// the walker and the driver keep these three arrays for good: an area fills them, leaving it empties them
const colliders = [], walkAreas = [], driveAreas = [];
let A = null;   // the area that is built now
const walk = new WalkControls(camera, renderer.domElement, { bounds: null, areas: walkAreas, colliders, speed: 2.75 });   // (25% faster than the big town's 2.2 m/s)
const drive = makeDriver2({ scene, camera, areas: driveAreas, colliders, ground: (x, z) => (A && A.district ? A.district.userData.floorY(x, z) ?? 0 : 0),
  hooks: { blast: (x, z, r) => { if (A && A.people) A.people.blast(x, z, r); const me = mode === 'drive' ? drive.state : walk.position, d = Math.hypot(me.x - x, me.z - z); if (d < 1.5 && mode === 'drive') hurtPlayer(70); else if (d < r) hurtPlayer(85 * (1 - d / r)); },
    crash: (imp) => hurtPlayer((imp - 11) * 3.5), rammed: (o, imp) => { const t = o.userData.trafficRef; crime(t && t.police ? 1.2 : t ? 0.5 : 0.12); }, wrecked: () => { if (mode === 'drive') use(); }, horn: (x, z, h) => { if (A && A.people) A.people.honk(x, z, h); } } });
// what the pedestrians are told about the car being driven, and what hitting one does to it
const carInfo = { x: 0, z: 0, vx: 0, vz: 0, h: 0, half: null, onHit: (speed, dead, x, z) => { const S = drive.state; S.vx *= 0.94; S.vz *= 0.94; S.shake = Math.min(1, S.shake + 0.25); if (drive.car) drive.hurt(drive.car, 4 + speed * 0.6, x, z, 0.7);
  crime(dead ? 1.5 : 0.6);
  /* everyone near enough to see it remembers, and the area hears */ if (A && A.people) talk.witness(A.people.list.filter((q) => q.active && Math.hypot(q.mesh.position.x - x, q.mesh.position.z - z) < 25).map((q) => 'p:' + A.id + ':' + q.seed), A.id, dead);   /* (a person dents a car; it takes a wall to wreck one) */ } };
walk.ground = (x, z, prevY) => { if (!A) return 0; if (A.ground) return A.ground(x, z, prevY); for (const [x0, x1, z0, z1, y] of A.floors) if (x > x0 && x < x1 && z > z0 && z < z1) return typeof y === 'function' ? y(x, z) : y; return A.interiors.floorY(x, z) ?? A.district.userData.floorY(x, z) ?? 0; };

// ---- the market in Old Town South (the Freshway grocery the area already has): somebody on the till, things on the
// counter that can be bought from them or simply taken, and the stock, signs and animals that belong round such a place
function marketSite(S, gx, gz) { stand(S, 'clerk', gx - 5.5, gz + 2.7, 0, 0.01); S.picks = [];
  const good = (name, x, z, ry = 0) => { const o = makeGood(name); if (!o) return; o.userData.noMerge = true; o.position.set(x, 0.945, z); o.rotation.y = ry; S.root.add(o); const b = o.geometry.boundingBox; S.picks.push({ name, obj: o, wx: x, wy: 0.945 + (b.max.y - b.min.y) / 2, wz: z, gone: false, goneT: 0 }); };
  [['Loaf of bread', -6.3, 0.2], ['Tin of soup', -6.05, 0], ['Tin of soup', -5.95, 0.4], ['Carton of milk', -5.75, 0], ['Energy drink', -5.5, 0.3], ['Energy drink', -5.4, 0], ['Loaf of bread', -5.1, 1.2], ['Carton of milk', -4.85, 0], ['Bag of ice', -4.6, 0.5]].forEach(([n, x, ry]) => good(n, gx + x, gz + 3.72, ry));
  const hit = (x0, x1, z0, z1) => colliders.some((k) => k.active !== false && (k.type === 'circle' ? k.x > x0 - k.r && k.x < x1 + k.r && k.z > z0 - k.r && k.z < z1 + k.r : k.maxX > x0 && k.minX < x1 && k.maxZ > z0 && k.minZ < z1));
  // a library piece at the first of `spots` that is clear: [x, z, ry] relative to the shop
  const set = (name, spots, { y = 0.012, solid = true, args = [] } = {}) => { for (const [x, z, ry = 0] of spots) { const o = lib(name, ...args), c = (o.userData.colliders || [[-0.2, 0.2, -0.2, 0.2]])[0], q = Math.round(ry / (Math.PI / 2)) & 3, [a0, b0, c0, c1] = c, w = q === 0 ? [a0, b0, c0, c1] : q === 2 ? [-b0, -a0, -c1, -c0] : q === 1 ? [c0, c1, -b0, -a0] : [-c1, -c0, a0, b0], X = gx + x, Z = gz + z; if (solid && hit(X + w[0] - 0.1, X + w[1] + 0.1, Z + w[2] - 0.1, Z + w[3] + 0.1)) continue; o.position.set(X, y, Z); o.rotation.y = ry; S.root.add(o); if (solid) colliders.push({ type: 'box', minX: X + w[0], maxX: X + w[1], minZ: Z + w[2], maxZ: Z + w[3] }); return o; } return null; };
  const done = {}; const D = (k, o) => { done[k] = !!o; };
  D('scanner', set('makeHandScanner', [[-6.45, 3.45, 0.4]], { y: 0.945, solid: false })); D('wetFloor', set('makeWetFloorSign', [[1.6, 4.7, 0.5], [-2.5, 4.8, 0.3], [3, 4.9, 0]])); D('shipper', set('makeShipperStand', [[6.9, 5.3, Math.PI], [5.2, 5.3, Math.PI], [-8.2, 0.5, Math.PI / 2]]));
  // the stock room behind: pallets as they came in, a cage half unloaded
  D('pallet', set('makePalletStack', [[7.6, -12.6], [6.0, -12.6], [1.2, -12.6], [7.6, -7.0]], { args: [{ seed: 3 }] })); D('pallet2', set('makePalletStack', [[6.0, -12.6], [4.4, -12.6], [1.2, -12.6], [1.2, -7.0]], { args: [{ seed: 8, layers: 6, color: '#2a4ab8' }] })); D('ice', set('makeIcePallet', [[2.8, -12.6], [1.2, -11.0], [7.6, -10.6]])); D('cage', set('makeRollCage', [[4.5, -8.0, 0.0], [3.0, -9.0, Math.PI / 2], [6.5, -9.5, 0]])); D('bread', set('makeBreadTrayStack', [[7.9, -9.0, Math.PI / 2], [1.0, -9.2, Math.PI / 2], [5.0, -10.5]])); D('spray', set('makeSprayBottle', [[3.6, -10.2, 1.1]], { solid: false }));
  // outside: a bin and two posts by the doors, the cases stacked against the glass, and the cats
  D('bin', set('makeDomeBin', [[3.2, 6.9], [-3.4, 6.9]])); D('post1', set('makeBollard', [[-2.0, 8.2]])); D('post2', set('makeBollard', [[2.0, 8.2]])); D('cases', set('makeCaseStackDisplay', [[6.2, 6.55, 0], [-6.0, 6.55, 0]])); D('tabby', set('makeTabbyCat', [[-3.6, 7.5, 0.9], [4.4, 7.6, -0.6]], { solid: false })); D('calico', set('makeCalicoCat', [[8.2, -6.3, -2.2], [7.0, 7.4, 2.4]], { solid: false }));
  S.marketDone = done; }
// ---- walking round things: the fixed things that stand on a pavement (benches, bins, lamps, trees, mailboxes...) are
// looked for a little way ahead of each walker; if one is in the way they are asked to pass it on whichever side
// leaves them on the pavement (5.3 to 6.75 m from the middle of the street) and is the smaller step.
let obstFor = null, obst = [];
function sidestep(def, x, z, h) { if (obstFor !== A && A) { obstFor = A; obst = colliders.filter((k) => !k.car && k.active === undefined && (k.type === 'circle' ? k.r < 1.2 : k.maxX - k.minX < 5 && k.maxZ - k.minZ < 5)).map((k) => (k.type === 'circle' ? { x: k.x, z: k.z, r: k.r } : { x: (k.minX + k.maxX) / 2, z: (k.minZ + k.maxZ) / 2, hx: (k.maxX - k.minX) / 2, hz: (k.maxZ - k.minZ) / 2 })); }
  const fx = Math.sin(h), fz = Math.cos(h), lx = Math.cos(h), lz = -Math.sin(h), B = 0.32; let lo = 0, hi = 0, any = false;   // lo..hi: the stretch across the path (to the left) that is taken up
  for (const k of obst) { const dx = k.x - x, dz = k.z - z; if (Math.abs(dx) > 4 || Math.abs(dz) > 4) continue; const half = k.r !== undefined ? k.r : Math.abs(lx) * k.hx + Math.abs(lz) * k.hz, len = k.r !== undefined ? k.r : Math.abs(fx) * k.hx + Math.abs(fz) * k.hz, al = dx * fx + dz * fz, lat = dx * lx + dz * lz;
    if (al < -len - 0.5 || al > len + 2.2 || Math.abs(lat) > half + B) continue; if (!any) { lo = lat - half - B; hi = lat + half + B; any = true; } else { lo = Math.min(lo, lat - half - B); hi = Math.max(hi, lat + half + B); } }
  if (!any) return 0; const dist = (px, pz) => Math.min(...def.xs.map((v) => Math.abs(px - v)), ...def.zs.map((v) => Math.abs(pz - v))), fits = (s) => { const d = dist(x + lx * s, z + lz * s); return d > 5.3 && d < 6.78; };
  const a = fits(hi), b = fits(lo); return a && b ? (Math.abs(hi) < Math.abs(lo) ? hi : lo) : a ? hi : b ? lo : (Math.abs(hi) < Math.abs(lo) ? hi : lo); }
// ---- things from the street-photo library (models/props131.js, props132.js), put where that kind of thing belongs:
// back courts get what is left in back courts (a skip, a fit-out site, a donation bin, the lorry making a delivery,
// utility boxes); pavements get a litter bin by some shop doors, a rack with a bike, mailboxes outside flats, a
// pedestal box here and there, a pipeline marker, and a little litter. Each model is built once and copied, and each
// part of town's copies are merged together, so the whole lot costs a few dozen draws.
const libCache = new Map(); const lib = (name, ...a) => { const k = name + JSON.stringify(a); if (!libCache.has(k)) libCache.set(k, (P131[name] || P132[name] || P137[name] || P138[name])(...a)); return libCache.get(k).clone(); };
function streetLibrary(S, district, interiors, id) { const cells = new Map(), count = {}, spots = [], r = (() => { let q = id === 'east' ? 977 : 331; return () => ((q = (q * 16807) % 2147483647) / 2147483647); })();
  const hit = (x0, x1, z0, z1, m = 0.25) => colliders.some((k) => k.active !== false && (k.type === 'circle' ? k.x > x0 - k.r - m && k.x < x1 + k.r + m && k.z > z0 - k.r - m && k.z < z1 + k.r + m : k.maxX > x0 - m && k.minX < x1 + m && k.maxZ > z0 - m && k.minZ < z1 + m)) || S.areas.some((a) => a.maxX > x0 && a.minX < x1 && a.maxZ > z0 && a.minZ < z1) || drive.cars.some((c) => Math.abs(c.position.x - (x0 + x1) / 2) < 3 + (x1 - x0) / 2 && Math.abs(c.position.z - (z0 + z1) / 2) < 3 + (z1 - z0) / 2);
  // put a library piece at (x, z) turned ry (a quarter turn at a time), unless something is already there
  const place = (name, x, z, ry = 0, y = 0.02, args = [], solid = true, force = false, gap = 0.25) => { const o = lib(name, ...args), c = (o.userData.colliders || [[-0.2, 0.2, -0.2, 0.2]])[0], q = Math.round(ry / (Math.PI / 2)) & 3, [a0, b0, c0, c1] = c, w = q === 0 ? [a0, b0, c0, c1] : q === 2 ? [-b0, -a0, -c1, -c0] : q === 1 ? [c0, c1, -b0, -a0] : [-c1, -c0, a0, b0];
    if (!force && hit(x + w[0], x + w[1], z + w[2], z + w[3], gap)) return null; o.position.set(x, y, z); spots.push([name, x, z]); o.rotation.y = ry; if (solid) S.rect(x + w[0], x + w[1], z + w[2], z + w[3]); const key = Math.floor(x / 60) + ':' + Math.floor(z / 60); if (!cells.has(key)) cells.set(key, new THREE.Group()); cells.get(key).add(o); count[name] = (count[name] || 0) + 1; return o; };
  const first = (name, spots, y, args) => { for (const [x, z, ry] of spots) { const o = place(name, x, z, ry, y, args); if (o) return o; } return null; };
  // back courts (the first has the body shop and is left alone)
  district.userData.courts.forEach((ct, i) => { if (i === 0 || !ct.rect) return; const [x0, x1, z0, z1] = ct.rect, mx = (x0 + x1) / 2, mz = (z0 + z1) / 2, kind = (i + (id === 'east' ? 1 : 0)) % 4;
    if (kind === 1) { const sk = first('makeRollOffSkip', [[mx + 3, z1 - 3.4, 0], [mx - 4, z1 - 3.4, 0], [x1 - 3.2, mz + 2, Math.PI / 2]]); if (sk) place('makeTrafficCone', sk.position.x + (sk.rotation.y ? 0 : 3.4), sk.position.z - (sk.rotation.y ? 3.4 : 1.8), 0); }
    if (kind === 2) { const co = first('makeShippingContainer', [[mx - 3, z1 - 3.3, 0], [mx + 4, z1 - 3.3, 0], [x0 + 3.2, mz + 3, Math.PI / 2]]); if (co) { const cx = co.position.x, cz = co.position.z; first('makePortableToilet', [[cx + 4.6, cz + 0.4, Math.PI], [cx - 4.6, cz + 0.4, Math.PI], [cx, cz - 3.2, Math.PI]]); first('makeTallSkip', [[cx + 2, cz - 4.6, 0], [cx - 2, cz - 4.6, 0], [mx, mz - 2, 0]]); for (const dx of [-3.6, 3.9]) place('makeTrafficCone', cx + dx, cz - 6.6, 0); } }
    if (kind === 3) first('makeLorry', [[mx + 1.5, z1 - 3.6, 0, 0], [mx + 1.5, mz + 2, 0, 0]], 0);
    first('makeDonationBin', kind === 0 ? [[x1 - 1.4, z0 + 9, -Math.PI / 2], [x0 + 1.4, z0 + 9, Math.PI / 2], [x1 - 1.4, mz + 3, -Math.PI / 2]] : []);
    first(i % 2 ? 'makeUtilityBox' : 'makePedestalBox', [[x0 + 1.3, z0 + 5.2, Math.PI / 2], [x1 - 1.3, z1 - 6, -Math.PI / 2], [x0 + 1.3, mz, Math.PI / 2]]); });
  // pavements, by the doors (W(u, v): u along the frontage, v < 0 out from the wall). People walk the strip 0.3 to 1 m
  // from the fronts, so everything stands out at the kerb (KV), with the street's own bins and benches, facing in.
  const KV = -1.96;
  let nShop = 0, nFlat = 0, nOff = 0; for (const e of interiors.list) { const at = (name, u, v, turn = Math.PI, y = S.SW, args, force) => { const [x, z] = e.W(u, v); return place(name, x, z, e.th + turn, y, args, true, force, 1.5); },   /* (on a pavement: well clear of whatever else stands there, so there is always a way past) */ side = e.doorX > e.U / 2 ? -1 : 1;
    if (e.type === 'shop') { nShop++; if (nShop % 5 === 1) { const b = at('makeSlattedBin', e.doorX + side * 1.5, KV); if (b && r() < 0.7) { const [x, z] = e.W(e.doorX + side * 1.5 - 0.5, KV + 0.3); place('makeCigaretteButt', x, z, 0, S.SW + 0.002, [], false); } }
      if (nShop % 9 === 4) { const rk = at('makeBikeRack', e.doorX + side * 2.4, KV, Math.PI / 2); if (rk && r() < 0.6) at('makeFatBike', e.doorX + side * 2.4 + 0.3, KV, Math.PI / 2, S.SW, [], true);   /* (leaning at its own rack) */ }
      if (nShop % 7 === 3) { const [x, z] = e.W(e.doorX - side * 1.2, -1.6 - r()); place(r() < 0.5 ? 'makeDeadLeaf' : 'makeCigaretteButt', x, z, 0, S.SW + 0.002, [], false); } }
    else if (e.type === 'flat' || e.type === 'studio') { nFlat++; if (nFlat % 3 === 1) at('makeClusterMailbox', e.doorX + side * 1.25, KV, 0); if (nFlat % 6 === 2) { const [x, z] = e.W(e.doorX - side * 1.4, -1.3 - r() * 0.8); place('makeDeadLeaf', x, z, 0, S.SW + 0.002, [], false); } }
    else if (e.type === 'office') { nOff++; if (nOff % 2 === 1) at('makePedestalBox', e.doorX + side * 2.0, KV, 0); if (nOff % 4 === 2) at('makePipelineSign', e.doorX - side * 2.2, KV - 0.1, 0); } }
  for (const g of cells.values()) S.put(g); count.spots = spots; return count; }
// ---- the areas. Both are halves of the big town's district, at the same coordinates, so a street keeps its place
// when you cross: you (or your car) arrive at the spot you left. `exits`: where an area hands over to another.
const RING_W = { n: 121, s: -121, e: 282, hw: 9 }, RING_E = { n: 121, s: -121, e: 450, hw: 9 };
const AREAS = {
  west: { name: 'Midtown', xs: [75, 161, 245], zs: [-84, 0, 84], ring: RING_W, lots: ['pottery', 'izakaya', 'ruins', 'pinkhouse', 'keigarage'], westStub: true,
    exits: [{ to: 'east', side: 'e', test: (x) => x > 262, label: 'Heading east' }, { to: 'south', side: 'w', test: (x) => x < 56.5, label: 'Walking into the old town', onFoot: true, spawn: [63.2, 2.0, Math.PI / 2] }], open: { e: true, w: true },
    cars: [['hatch', { color: '#b3242a', name: 'red hatch', plate: 'ELM 2K7' }, 157.4, 30, 0], ['kei', { color: '#a8d6c6', roofColor: '#f2f0ea', rim: 'steel', name: 'mint kei car', plate: 'ELM 55K', metal: 0.2 }, 157.4, 46, 0],
      ['sedan', { color: '#f0c41c', rim: 'steel', name: 'cab', plate: 'ELM T41', livery: LIVERIES.taxi, metal: 0.15 }, 120, 3.7, Math.PI / 2], ['pickup', { color: '#5e6e52', rim: 'alloy', name: 'pickup', plate: 'ELM 7P8', chromeGrille: true }, 204, -3.6, -Math.PI / 2],
      ['coupe', { color: '#1b3a78', rim: 'black', name: 'blue coupe', plate: 'ELM 9C3' }, 164.6, -40, Math.PI]],
    sites(S) { const { put, rect, placeL, areas, floors } = S;
      // Kiln & Co. pottery, the old izakaya, the aqueduct ruins garden and its small plaza with the rainbow mural (main street, west)
      { const pg = makePotteryGallery(); pg.position.set(105.5, 0.14, -11.0); for (const [x0, x1, z0, z1] of pg.userData.colliders) rect(105.5 + x0, 105.5 + x1, -11 + z0, -11 + z1); for (const a of pg.userData.areas) areas.push({ minX: 105.5 + a.minX, maxX: 105.5 + a.maxX, minZ: -11 + a.minZ, maxZ: -11 + a.maxZ }); put(pg); floors.push([100.5, 110.5, -14.5, -7, 0.14]); }
      placeL(makeIzakaya(), 116.5, -7.15);
      { const gd = makeAqueductGarden(); gd.position.set(132, 0, -13.5); for (const [x0, x1, z0, z1] of gd.userData.colliders) rect(132 + x0, 132 + x1, -13.5 + z0, -13.5 + z1); areas.push({ minX: 124.2, maxX: 139.8, minZ: -13.8, maxZ: -7.0 }); put(gd); }
      { const t = new THREE.TextureLoader().load('assets/textures/i5_paving.png'); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 4); const pav = new THREE.Mesh(new THREE.PlaneGeometry(13, 14), new THREE.MeshStandardMaterial({ map: t, roughness: 0.85 })); pav.rotation.x = -Math.PI / 2; pav.position.set(147, 0.03, -14.5); S.root.add(pav); areas.push({ minX: 140.6, maxX: 153.4, minZ: -21.2, maxZ: -7.0 }); }
      placeL(makeRainbowMural(), 147, -21.3, 0, 0);
      for (const [x, z] of [[143.5, -17.5], [150.5, -17.5], [143.5, -11.5]]) placeL(makeBarrelPlanter(Math.round(x)), x, z, 0, 0);
      placeL(makeCurvedBench(), 147, -16.2, Math.PI, 0); placeL(makeCurvedBench(), 147, -12.0, 0, 0); placeL(makeWeepingMaple(), 150.5, -11.0, 0, 0); placeL(makeWifiStand(), 152.4, -8.2, 0, 0);
      placeL(makePizzaAFrame(), 101.2, -6.1, 0.3); placeL(makeComicVending(), 110.6, -6.5, 0); placeL(makeStickerPost(), 121.6, -5.6, 0);
      // the pink bungalow with its bottle tree, and the kei car garage beside it (the street at z = 84)
      { const PH = { x: 175, z: 74.6 }, pink = makePinkHouse(); pink.position.set(PH.x, 0.02, PH.z); for (const [x0, x1, z0, z1] of pink.userData.colliders) rect(PH.x + x0, PH.x + x1, PH.z + z0, PH.z + z1); put(pink); }
      { const KG = { x: 186.5, z: 77 }, kgar = makeKeiGarage({ car: false }); kgar.position.set(KG.x, 0.02, KG.z); for (const [x0, x1, z0, z1] of kgar.userData.colliders) rect(KG.x + x0, KG.x + x1, KG.z + z0, KG.z + z1); for (const a of kgar.userData.areas) areas.push({ minX: a.minX + KG.x, maxX: a.maxX + KG.x, minZ: a.minZ + KG.z, maxZ: a.maxZ + KG.z });
        S.cars.push(['keiold', { name: 'dusty kei car', color: '#4a78b8', dust: 0.9, rim: 'steel', plate: 'ELM 360' }, KG.x + kgar.userData.carPose.x, KG.z + kgar.userData.carPose.z, 0]); put(kgar); }
      // the first photo-faced character, standing on the sidewalk by the start (he turns his head to watch you)
      stand(S, 'potter', 108.0, -13.0, 0, 0.16); stand(S, 'host', 118.3, -6.0, 0, S.SW);
      const hank = makeCharacter(CHARACTERS.hank); hank.position.set(166.4, S.SW, 25.5); hank.rotation.y = Math.PI * 0.82; S.root.add(hank); colliders.push({ type: 'circle', x: 166.4, z: 25.5, r: 0.3 }); S.npcs.push({ who: character('hank'), x: 166.4, z: 25.5, mesh: hank, reach: 2.4 });
      S.tick = (dt) => { const hb = hank.userData.bones, dx = camera.position.x - hank.position.x, dz = camera.position.z - hank.position.z; if (dx * dx + dz * dz < 144) { let a = Math.atan2(dx, dz) - hank.rotation.y; a = Math.atan2(Math.sin(a), Math.cos(a)); const want = Math.max(-1.1, Math.min(1.1, a)); hb.head.rotation.y += (want * 0.7 - hb.head.rotation.y) * Math.min(1, dt * 5); hb.neck.rotation.y = hb.head.rotation.y * 0.4; } }; } },
  east: { name: 'Eastside', xs: [245, 329, 413], zs: [-84, 0, 84], ring: RING_E, lots: ['gallery', 'temple', 'pocketpark', 'nakamachi'], westStub: true,
    exits: [{ to: 'west', side: 'w', test: (x) => x < 229, label: 'Heading west' }], open: { w: true },
    cars: [['sedan', { color: '#7a1c22', name: 'maroon sedan', plate: 'ELM 5M3', rim: 'alloy' }, 325.4, 30, 0], ['hatch', { color: '#e8e2d0', name: 'cream hatch', plate: 'ELM 1H8', rim: 'steel' }, 290, 3.7, Math.PI / 2], ['kei', { color: '#3a6a8a', name: 'blue kei car', plate: 'ELM 7K2', rim: 'steel' }, 332.6, -44, Math.PI]],
    sites(S) { stand(S, 'attendant', 339.6, 10.6, Math.PI, 0.16); stand(S, 'keeper', 389.6, -8.6, 0, 0.08);
      const { put, rect, areas, floors } = S, piMap = (X, Z, c) => [X - c[1], X - c[0], Z - c[3], Z - c[2]];   // local rect -> world for a set turned half round
      // the art gallery (the owner's paintings), facing the main street
      { const AG = { x: 344, z: 13 }, g = makeArtGallery(); g.position.set(AG.x, 0.14, AG.z); g.rotation.y = Math.PI; for (const c of g.userData.colliders) rect(...piMap(AG.x, AG.z, c)); for (const a of g.userData.areas) { const [minX, maxX, minZ, maxZ] = piMap(AG.x, AG.z, [a.minX, a.maxX, a.minZ, a.maxZ]); areas.push({ minX, maxX, minZ, maxZ }); } put(g); floors.push([337, 351, 7.9, 18, 0.14]); }
      // the lantern temple: plaza, stairs and platform, on the main street
      { const TM = { x: 393, z: -7 }, t = makeTempleFront(); t.position.set(TM.x, 0.02, TM.z); for (const [x0, x1, z0, z1] of t.userData.colliders) rect(TM.x + x0, TM.x + x1, TM.z + z0, TM.z + z1); const st = t.userData.stairs; areas.push({ minX: TM.x - 13, maxX: TM.x + 13, minZ: TM.z - 26.6, maxZ: TM.z + 0.3 }); put(t);
        floors.push([TM.x + st.x0, TM.x + st.x1, TM.z + st.front, TM.z + st.z1, (x, z) => { const zz = z - TM.z; return 0.02 + (zz <= st.zTop ? st.top : st.top * (st.z1 - zz) / (st.z1 - st.zTop)); }], [TM.x - 13, TM.x + 13, TM.z - 18, TM.z, 0.06]); }
      // the pocket park and the Nakamachi Arcade passage beside it (the street at z = -84)
      { const PP = { x: 288, z: -77 }, pk = makePocketPark(); pk.position.set(PP.x, 0, PP.z); for (const [x0, x1, z0, z1] of pk.userData.colliders) rect(PP.x + x0, PP.x + x1, PP.z + z0, PP.z + z1); areas.push({ minX: PP.x - 19.8, maxX: PP.x + 19.8, minZ: PP.z - 0.6, maxZ: PP.z + 16.8 }); put(pk); floors.push([268, 308, -77, -60, 0]); }
      { const NM = { x: 259, z: -77 }, m = makeMallPassage(); m.position.set(NM.x, 0.14, NM.z); m.rotation.y = Math.PI; for (const c of m.userData.colliders) rect(...piMap(NM.x, NM.z, c)); for (const a of m.userData.areas) { const [minX, maxX, minZ, maxZ] = piMap(NM.x, NM.z, [a.minX, a.maxX, a.minZ, a.maxZ]); areas.push({ minX, maxX, minZ, maxZ }); } put(m); floors.push([252.5, 265.5, -77.4, -61, 0.14]); } } },
  // the northern old town, lifted across from the big town as it stands (src/areas/oldsquare.js). On foot only.
  old: { name: 'Old Town Square', exits: [{ to: 'south', test: (x, z) => x > 8.4 && z > 5 && z < 12, label: 'Through to the lot', spawn: [10.6, 8.5, -Math.PI / 2] }],
    build(S) { const r = buildOldSquare(S); const { root } = S, wallM = new THREE.MeshStandardMaterial({ map: (() => { const t = new THREE.TextureLoader().load('assets/textures/wall_red_brick.png'); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(12, 5); return t; })(), roughness: 0.9 });
      // the restaurant block stood east of the plaza and north of the strip; until it is brought across, a brick wall closes those two sides
      const wall = (x0, x1, z0, z1, h = 5.5) => { const m = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, h, z1 - z0), wallM); m.position.set((x0 + x1) / 2, h / 2, (z0 + z1) / 2); root.add(m); S.rect(x0, x1, z0, z1); };
      wall(-9.0, -8.6, -14, 5.3); wall(-9.0, 9.4, 4.9, 5.3); wall(9.0, 9.4, 4.9, 6.2, 5.5); wall(9.0, 9.4, 10.9, 12.2, 5.5);
      { const lint = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.6, 4.7), wallM); lint.position.set(9.2, 4.7, 8.55); root.add(lint); S.sign('The lot \u00b7 Midtown  \u2192', 8.2, 6.0, Math.PI / 2, 0); }
      for (const [sd, x, z, ry] of [[1, -24.5, -3.5, 0.6], [2, -27.5, 31, Math.PI], [3, -30, 60.5, 1.2], [4, 4.5, 64, -1.6], [5, -15.5, 8.2, 2.4]]) standAny(S, 'old', sd, x, z, ry, 0.01);
      return r; } },
  // the southern old town, lifted across the same way (src/areas/oldsouth.js): the lot between the square and Midtown. On foot only.
  south: { name: 'Old Town South', hole: [900, 901, 900, 901], streamScale: 0.35,   /* (a great many small parts in a small space: they are drawn from much nearer than elsewhere) */ exits: [{ to: 'west', test: (x) => x > 65.3, label: 'Back to Midtown', spawn: [59.5, 0, -Math.PI / 2] }, { to: 'old', test: (x, z) => x < 8.8 && z > 5.4 && z < 11.7, label: 'Old Town Square', spawn: [6.2, 8.6, Math.PI / 2] }],
    build(S) { const r = buildOldSouth(S); const { root } = S, wallM = new THREE.MeshStandardMaterial({ map: (() => { const t = new THREE.TextureLoader().load('assets/textures/wall_red_brick.png'); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(8, 2); return t; })(), roughness: 0.9 });
      // the restaurant itself is not brought across yet: its block stands shut
      { const m = new THREE.Mesh(new THREE.BoxGeometry(16.6, 3.6, 10.6), wallM); m.position.set(0, 1.8, 0); root.add(m); S.rect(-8.3, 8.3, -5.3, 5.3); }
      S.sign('\u2190  Old Town Square', 9.4, 6.0, -Math.PI / 2, 0); S.sign('Midtown  \u2192', 63.5, 4.6, Math.PI / 2, 0);
      // the cars left about the place stand where they were left
      for (const [type, opt, x, z, h] of r.cars) { const c = makeCar({ type, ...opt }); c.position.set(x, 0, z); c.rotation.y = h; root.add(c); const sn = Math.sin(h), cs = Math.cos(h), u = c.userData; for (const lz of [u.half.zF - u.half.x, 0, u.half.zR + u.half.x]) S.circle(x + lz * sn, z + lz * cs, u.half.x); }
      for (const [sd, x, z, ry] of [[1, 20, 3.5, -1.2], [2, 27.5, -9.2, 0], [3, 31, 10.2, Math.PI], [4, 47, -20, 1.6], [5, 14, 8.4, 2.2]]) standAny(S, 'south', sd, x, z, ry, 0.01);
      marketSite(S, 24, -41);
      return r; } },
};

// what drives about: [type, options]
const TRAFFIC = [['sedan', { color: '#8a8f96', name: 'grey sedan' }], ['hatch', { color: '#2f5a8a', name: 'blue hatch', rim: 'steel' }], ['kei', { color: '#e8e2d0', name: 'white kei car', rim: 'steel' }], ['wagon', { color: '#5a3a2a', name: 'brown estate' }], ['van', { color: '#c8ccd0', name: 'delivery van', rim: 'steel' }], ['sedan', { color: '#f0c41c', name: 'cab', rim: 'steel', livery: LIVERIES.taxi, metal: 0.15 }], ['pickup', { color: '#2a2c30', name: 'black pickup' }], ['coupe', { color: '#a8201e', name: 'red coupe', rim: 'black' }], ['hatch', { color: '#3f6a4a', name: 'green hatch' }], ['scout', { color: '#b8a888', name: 'tan 4x4', rim: 'steel' }]];
const PARK = [['sedan', { color: '#2a2c30', name: 'black sedan', plate: 'ELM 4B1', rim: 'alloy' }], ['hatch', { color: '#d8d4c8', name: 'white hatch', plate: 'ELM 8W2', rim: 'steel' }], ['kei', { color: '#c87a2a', name: 'orange kei car', plate: 'ELM 3K9', rim: 'steel' }], ['pickup', { color: '#6a2a26', name: 'red pickup', plate: 'ELM 6R5', rim: 'steel' }], ['van', { color: '#d9d6cc', name: 'white van', plate: 'ELM 2V6', rim: 'steel' }], ['scout', { color: '#3f5a46', name: 'green 4x4', plate: 'ELM 9S4', rim: 'steel' }], ['wagon', { color: '#6f7f8c', name: 'grey estate', plate: 'ELM 5E1', rails: true }]];
// someone who stands at a place: a body of the right sex, a collider, and their part from lines.js
function stand(S, id, x, z, ry, y) { const who = character(id); let body = null; for (let sd = 500 + id.length * 7, k = 0; k < 40; sd++, k++) { const b = makePerson(sd); if (b.userData.sex === who.sex) { body = b; break; } } if (!body) return; body.position.set(x, y, z); body.rotation.y = ry; S.root.add(body); colliders.push({ type: 'circle', x, z, r: 0.3 }); S.npcs.push({ who, x, z, mesh: body, reach: 2.7, ry }); }
// an ordinary person standing about (areas without sidewalks to walk): who they are comes from the area and a number
function standAny(S, areaId, seed, x, z, ry, y) { const body = makePerson(700 + seed * 13 + areaId.length); body.position.set(x, y, z); body.rotation.y = ry; S.root.add(body); colliders.push({ type: 'circle', x, z, r: 0.3 }); S.npcs.push({ who: whoIs(areaId, 's' + seed, body.userData.sex), x, z, mesh: body, reach: 2.6, ry }); }
// things knocked over by a car, falling: each { a (angle), v (its speed), set(angle) } drops under its own weight, bounces once, and lies still
const falls = [];
function tickFalls(dt) { for (let i = falls.length - 1; i >= 0; i--) { const f = falls[i]; f.v += (0.4 + Math.sin(f.a) * 5.5) * dt; f.a += f.v * dt; if (f.a >= 1.5) { f.a = 1.5; if (f.v > 1.2 && !f.b) { f.b = true; f.v *= -0.25; } else { f.set(1.5); falls.splice(i, 1); continue; } } f.set(f.a); } }
// a signpost: a green board on a post, on the sidewalk (y)
function signpost(root, text, x, z, ry, y) { const c = document.createElement('canvas'); c.width = 512; c.height = 128; const g = c.getContext('2d'); g.fillStyle = '#1d4a2a'; g.fillRect(0, 0, 512, 128); g.strokeStyle = '#f2ead0'; g.lineWidth = 6; g.strokeRect(8, 8, 496, 112); g.fillStyle = '#f2ead0'; g.textAlign = 'center'; g.textBaseline = 'middle'; let fs = 62; do { g.font = `600 ${fs}px system-ui, sans-serif`; fs -= 4; } while (g.measureText(text).width > 470 && fs > 20); g.fillText(text, 256, 68);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; const grp = new THREE.Group(), dk = new THREE.MeshStandardMaterial({ color: '#2a2c2e', roughness: 0.6, metalness: 0.4 }); const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3.1, 8), dk); post.position.y = 1.55; grp.add(post);
  const board = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.5, 0.05), [dk, dk, dk, dk, new THREE.MeshBasicMaterial({ map: t }), new THREE.MeshBasicMaterial({ map: t })]); board.position.y = 2.85; grp.add(board); grp.position.set(x, y, z); grp.rotation.y = ry; root.add(grp); const col = { type: 'circle', x, z, r: 0.12, knockAt: 3.5 }; colliders.push(col);
  col.knock = (dx, dz, imp) => { const q0 = grp.quaternion.clone(), axis = new THREE.Vector3(dz, 0, -dx).normalize(), q = new THREE.Quaternion(); falls.push({ t: 0, a: 0, v: 0.8 + imp * 0.15, set(a) { grp.quaternion.copy(q.setFromAxisAngle(axis, a)).multiply(q0); } }); }; }
// an area that is not a street grid: its own build function places everything (the hand-built old town pieces)
function buildCustomArea(id, def, root) {
  const lights = [];
  const S = { root, colliders, npcs: [], rect: (x0, x1, z0, z1) => colliders.push({ type: 'box', minX: x0, maxX: x1, minZ: z0, maxZ: z1 }), circle: (x, z, r) => colliders.push({ type: 'circle', x, z, r }), sign: (text, x, z, ry, y = 0) => signpost(root, text, x, z, ry, y) };
  S.add = (o) => { root.add(o); return o; };
  const r = def.build(S);
  // the dark base everything stands on (with a hole where the underground mall's stair goes down), and a far skyline
  { const gm = new THREE.MeshStandardMaterial({ color: '#232428', roughness: 1 }), H = def.hole || [0.2, 3.8, 50.9, 58.7], E = 420; for (const [x0, x1, z0, z1] of [[-E, H[0], -E, E], [H[1], E, -E, E], [H[0], H[1], -E, H[2]], [H[0], H[1], H[3], E]]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0, 6, 6), gm); m.rotation.x = -Math.PI / 2; m.position.set((x0 + x1) / 2, -0.06, (z0 + z1) / 2); root.add(m); }
    const fm = new THREE.MeshStandardMaterial({ color: '#14171c', roughness: 1 }), wm = new THREE.MeshBasicMaterial({ color: '#e8c070' }), sky = new THREE.Group(); let sd = 7; const rnd = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 46; i++) { const a = rnd() * Math.PI * 2, d = 170 + rnd() * 160, w = 14 + rnd() * 22, h = 22 + rnd() * 70, bx = -15 + Math.cos(a) * d, bz = 40 + Math.sin(a) * d, b = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), fm); b.position.set(bx, h / 2, bz); sky.add(b);
      for (let k = 0; k < 10; k++) { const q = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.6), wm); const ang = Math.atan2(-15 - bx, 40 - bz); q.position.set(bx + Math.sin(ang) * (w / 2 + 0.2) + Math.cos(ang) * (rnd() - 0.5) * w * 0.8, 4 + rnd() * (h - 8), bz + Math.cos(ang) * (w / 2 + 0.2) - Math.sin(ang) * (rnd() - 0.5) * w * 0.8); q.rotation.y = ang; sky.add(q); } }
    root.add(sky); mergeStatic(sky); }
  // each set's fixed parts merge by material; lights inside the sets are found (the nearest few are lit: see the frame loop); things that animate keep running
  // (a mesh with several materials cannot be merged as it is: it is first split into one mesh a material, in place.
  // Anything under a part that moves is left alone.)
  const splitMulti = (set) => { const list = []; const visit = (o, moving) => { const ud = o.userData || {}; const mv = moving || (o !== set && (ud.noMerge || typeof ud.tick === 'function' || typeof ud.update === 'function' || typeof ud.setOpen === 'function')); if (o.isMesh && !mv && Array.isArray(o.material) && !o.isInstancedMesh && !o.isSkinnedMesh && o.geometry.groups.length) list.push(o); for (const c of o.children) visit(c, mv); }; visit(set, false);
    for (const m of list) { const g = m.geometry, idx = g.index ? g.index.array : null; for (const gr of g.groups) { const mat = m.material[gr.materialIndex]; if (!mat || !gr.count) continue; const ng = new THREE.BufferGeometry(); for (const k of Object.keys(g.attributes)) ng.setAttribute(k, g.attributes[k]); const ia = new Uint32Array(gr.count); for (let i = 0; i < gr.count; i++) ia[i] = idx ? idx[gr.start + i] : gr.start + i; ng.setIndex(new THREE.BufferAttribute(ia, 1)); const nm = new THREE.Mesh(ng, mat); nm.position.copy(m.position); nm.quaternion.copy(m.quaternion); nm.scale.copy(m.scale); nm.castShadow = m.castShadow; nm.receiveShadow = m.receiveShadow; nm.renderOrder = m.renderOrder; m.parent.add(nm); } for (const c of [...m.children]) { /* (children stay with the first piece's frame) */ const holder = new THREE.Group(); holder.position.copy(m.position); holder.quaternion.copy(m.quaternion); holder.scale.copy(m.scale); m.parent.add(holder); holder.add(c); } m.parent.remove(m); } };
  for (const o of [...root.children]) if (!o.isLight) { splitMulti(o); mergeStatic(o); }
  const tickers = []; root.traverse((o) => { if (o.isLight) { o.castShadow = false; if (o.isPointLight || o.isSpotLight) lights.push(o); } if (o.userData && typeof o.userData.tick === 'function') tickers.push(o); });
  // the old town's sets carry hundreds of drawn signs and labels at full size (about 900 MB of graphics memory in all,
  // more than a phone gives a page): they are swapped for copies no bigger than `canvasMax` pixels
  const nShrunk = shrinkCanvases(root, +(qs.get('cmax') ?? def.canvasMax ?? 320));
  // ...and the full-size drawings themselves are let go (nothing here redraws its signs: `tickers` is checked below)
  root.traverse((o) => { for (const m of [].concat(o.material || [])) for (const k in m) { const t = m[k]; if (t && t.isTexture && t.source && t.source._orig && !tickers.length) { const cv = t.source._orig; t.source._orig = null; cv.width = cv.height = 1; } } });
  walkAreas.push(...r.areas);
  drive.rebuild();
  const streamer = makeStreamer(root, { phone: true, max: 260 }); streamer.setScale(+(qs.get('ss') ?? def.streamScale ?? (PHONE ? 0.8 : 1)));
  console.log('area', id, ': sets', root.children.length, 'lights', lights.length, 'animated', tickers.length, 'signs resized', nShrunk);
  return { id, def, root, district: null, interiors: null, people: null, streamer, floors: [], ground: r.ground, tick: r.tick ? (dt) => r.tick(t, dt, walk.position, walk.gy || 0) : null, lights, tickers, npcs: S.npcs, picks: S.picks || null, marketDone: S.marketDone || null };
}
function buildArea(id, carried) {
  const def = AREAS[id], root = new THREE.Group(); root.name = 'area_' + id; scene.add(root);
  if (def.build) return buildCustomArea(id, def, root);
  configureDistrict({ xs: def.xs, zs: def.zs, ring: def.ring, lots: def.lots, westStub: def.westStub });
  const district = makeDistrict(); root.add(district); const SW = district.userData.sidewalkY;
  colliders.push(...district.userData.colliders);   // (dumpsters, court lamps and tree beds)
  // street lamps come down when a car hits them hard: the post stops being solid and topples the way it was pushed
  { const ims = district.children.filter((o) => o.name === 'district_lamps'), m0 = new THREE.Matrix4(), mA = new THREE.Matrix4(), mB = new THREE.Matrix4(), mR = new THREE.Matrix4(), ax = new THREE.Vector3();
    district.userData.lampPosts.forEach(([x, z], i) => { const col = { type: 'circle', x, z, r: 0.18, knockAt: 5.5 }; colliders.push(col);
      col.knock = (dx, dz, imp) => { const base = ims.map((im) => { im.getMatrixAt(i, m0); return m0.clone(); }); ax.set(dz, 0, -dx).normalize(); const axis = ax.clone();
        falls.push({ t: 0, a: 0, v: 0.6 + imp * 0.12, set(a) { mA.makeTranslation(x, SW, z); mR.makeRotationAxis(axis, a); mB.makeTranslation(-x, -SW, -z); mA.multiply(mR).multiply(mB); ims.forEach((im, k) => { if (k === 3) { m0.makeScale(0, 0, 0); } else m0.multiplyMatrices(mA, base[k]); im.setMatrixAt(i, m0); im.instanceMatrix.needsUpdate = true; }); } }); }; }); }
  for (const [x, z] of district.userData.treePosts) colliders.push({ type: 'circle', x, z, r: 0.25 });
  const svc = placeStreetServices({ grid: GRID, sidewalkY: SW }); root.add(svc.group); colliders.push(...svc.colliders);
  // a striped barrier across each street end that leads nowhere (the ends that lead to another area are left open)
  { const { xs, zs, walk: WH } = GRID, R = GRID.ring, bm = new THREE.MeshStandardMaterial({ color: '#d8c22a', roughness: 0.6 }), dk = new THREE.MeshStandardMaterial({ color: '#1c1c1e', roughness: 0.7 });
    const barrier = (x, z, alongX) => { const g = new THREE.Group(), L = WH * 2; for (let i = 0; i < 8; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(L / 8, 0.22, 0.06), i % 2 ? bm : dk); m.position.set(-L / 2 + (i + 0.5) * L / 8, 0.95, 0); g.add(m); } for (const s of [-1, 0, 1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.1, 0.1), dk); p.position.set(s * (L / 2 - 0.2), 0.55, 0); g.add(p); } g.position.set(x, 0, z); if (!alongX) g.rotation.y = Math.PI / 2; root.add(g);
      colliders.push(alongX ? { type: 'box', minX: x - WH, maxX: x + WH, minZ: z - 0.15, maxZ: z + 0.15 } : { type: 'box', minX: x - 0.15, maxX: x + 0.15, minZ: z - WH, maxZ: z + WH }); };
    for (const x of xs) { barrier(x, R.n - R.hw - 1.2, true); barrier(x, R.s + R.hw + 1.2, true); } for (const z of zs) { if (!def.open.e) barrier(R.e - R.hw - 1.2, z, false); if (!def.open.w) barrier(xs[0] - WH - 0.6 + 1.2, z, false); } }
  // a signpost on the sidewalk at each street end that leads to another area
  for (const ex of def.exits) for (const z of def.zs) { if (ex.side === 'e') signpost(root, AREAS[ex.to].name + '  \u2192', def.ring.e - 26, z - 6.1, Math.PI / 2, SW); if (ex.side === 'w') signpost(root, '\u2190  ' + AREAS[ex.to].name, def.xs[0] - 12, z + 6.1, Math.PI / 2, SW); }
  // the hand-built places on this area's reserved lots
  const S = { root, SW, areas: [], floors: [], npcs: [], cars: def.cars.slice(), tick: null, rect: (x0, x1, z0, z1) => colliders.push({ type: 'box', minX: x0, maxX: x1, minZ: z0, maxZ: z1 }) };
  S.put = (o) => { root.add(o); mergeStatic(o); return o; };   // (each set's fixed parts merge by material: far fewer things to draw)
  S.placeL = (o, x, z, ry = 0, y = 0.14) => { o.position.set(x, y, z); o.rotation.y = ry; const c = o.userData.collider; if (c) { const q = Math.round(ry / (Math.PI / 2)) & 3, [a0, b0, c0, c1] = c; const r = q === 0 ? [a0, b0, c0, c1] : q === 2 ? [-b0, -a0, -c1, -c0] : q === 1 ? [c0, c1, -b0, -a0] : [-c1, -c0, a0, b0]; S.rect(x + r[0], x + r[1], z + r[2], z + r[3]); } return S.put(o); };
  def.sites(S);
  walkAreas.push(...district.userData.areas, ...S.areas); driveAreas.push(...walkAreas);   // (cars keep this list: interiors are added to the walker's only)
  // someone serves behind the counter of every shop: made when its interior is built, gone when it is let go
  const onBuild = (e, g) => { const k = g.userData.keeper; if (!k || e.b.shop < 0 || !SHOP_KINDS[e.b.shop]) return; const body = makePerson(300 + e.b.index * 3 + (id === 'east' ? 1 : 0)); body.position.set(k[0], 0, k[1]); body.rotation.y = Math.PI; g.add(body);
    const [x, z] = e.W(k[0], k[1]); e.npc = { who: keeperOf(id, e.b.shop, e.b.index, body.userData.sex), x, z, mesh: body, reach: 2.9, room: e };
    // the goods on the shelves: real things that can be taken (what was taken stays gone for ten minutes)
    const key = id + ':' + e.b.index, gm = goneAt.get(key) || new Map(); for (const [s, tt] of gm) if (t - tt > 600) gm.delete(s); goneAt.set(key, gm);
    e.goods = stockShop(g, SHOP_KINDS[e.b.shop], e.U, e.V, e.b.index, gm).map((q) => { const [wx, wz] = e.W(q.x, q.z); return { ...q, wx, wy: g.position.y + q.y, wz, key }; }); };
  const interiors = makeInteriors({ scene: root, district, colliders, areas: walkAreas, onBuild });
  const addCar = ([type, opt, x, z, h]) => { const c = makeCar({ type, ...opt }); c.position.set(x, 0, z); c.rotation.y = h; root.add(c); drive.addCar(c, { name: opt.name }); };
  for (const c of S.cars) { if (carried && Math.hypot(c[2] - carried.position.x, c[3] - carried.position.z) < 6) continue; addCar(c); }
  district.userData.courts.forEach((ct, i) => { const [type, opt] = PARK[(i + (id === 'east' ? 2 : 0)) % PARK.length], [x, z] = ct.bays[(i * 2 + 1) % ct.bays.length]; addCar([type, opt, x, z, i % 2 ? Math.PI : 0]); });   // one more in a bay of each back court
  // the body shop: a spray booth at the far side of the first back court, open toward the parking bays
  let shopPad = null; { const ct = district.userData.courts[0]; if (ct && ct.rect) { const [cx0, cx1, , cz1] = ct.rect, bx = (cx0 + cx1) / 2, bz = cz1 - 9.9, booth = makeBooth(); booth.position.set(bx, 0.014, bz); root.add(booth); mergeStatic(booth);
      for (const [x0, x1, z0, z1] of booth.userData.colliders) colliders.push({ type: 'box', minX: bx + x0, maxX: bx + x1, minZ: bz + z0, maxZ: bz + z1 }); const p = booth.userData.pad; shopPad = [bx + p[0], bx + p[1], bz + p[2], bz + p[3]]; shopPad.room = [bx - 2.15, bx + 2.15, bz - 5, bz + 6.7]; } }
  const libCount = streetLibrary(S, district, interiors, id);
  if (carried) { root.add(carried); drive.adopt(carried); }
  drive.rebuild();
  // the door that is always a little open, and the place behind it (mood/wrong.js), built far off to one side of the area
  let wrong = null; { const kind = id === 'east' ? 'hall' : 'corridor', cand = interiors.list.filter((e) => e.type === 'studio' || e.type === 'flat' || e.type === 'office'), e = cand[(id === 'east' ? 7 : 3) % Math.max(1, cand.length)];
    if (e) { const wp = makeWrongPlace(kind), ox = (def.xs[0] + def.xs[2]) / 2, oz = def.zs[0] - 520; wp.group.position.set(ox, 0, oz); root.add(wp.group); mergeStatic(wp.group);
      for (const a of wp.areas) walkAreas.push({ minX: ox + a.minX, maxX: ox + a.maxX, minZ: oz + a.minZ, maxZ: oz + a.maxZ }); for (const [x0, x1, z0, z1] of wp.colliders || []) colliders.push({ type: 'box', minX: ox + x0, maxX: ox + x1, minZ: oz + z0, maxZ: oz + z1 });
      S.floors.push([ox - 30, ox + 30, oz - 2, oz + 70, 0.004]); e.ajar = 0.3; wrong = { e, wp, ox, oz, kind, inside: false }; } }
  // traffic: a few cars that drive the grid by themselves (see vehicle/traffic.js)
  const traffic = makeTraffic({ xs: def.xs, zs: def.zs, drive, count: PHONE ? 4 : 6, onFoot: () => (mode === 'walk' ? walk.position : null),
    police: !LAW_ON ? null : { want: () => stars(), target: () => (stars() && downT <= 0 ? (mode === 'drive' ? { x: drive.state.x, z: drive.state.z, v: Math.hypot(drive.state.vx, drive.state.vz), foot: false } : { x: walk.position.x, z: walk.position.z, v: 0, foot: true }) : null),
      spawn: (i) => { const c = makeCar({ type: 'sedan', color: '#eef0f2', roofColor: '#15171a', rim: 'steel', livery: LIVERIES.police, name: 'police car', plate: 'ELM P' + (10 + i % 90) }); root.add(c); drive.addCar(c, { name: 'police car' }); return c; } },
    spawn: (i) => { const [type, opt] = TRAFFIC[(i * 5 + (id === 'east' ? 3 : 0)) % TRAFFIC.length], c = makeCar({ type, ...opt, plate: 'ELM ' + (100 + (i * 37) % 900) }); root.add(c); drive.addCar(c, { name: opt.name }); return c; } });
  const people = makePeople({ scene: root, grid: GRID, sidewalkY: SW, count: PHONE ? 14 : 20, odd: 2, make: (i) => (pxPeopleReady() && i % 2 === 1 ? pxPerson(i * 3 + 1) : null), steer: (x, z, h) => sidestep(def, x, z, h), ok: (x, z) => driveAreas.some((a) => x >= a.minX && x <= a.maxX && z >= a.minZ && z <= a.maxZ) });
  const streamer = makeStreamer(root, { phone: true, max: 300 }); streamer.setScale(PHONE ? 0.8 : 1);
  console.log('area', id, ': buildings', district.userData.buildings.length, 'interiors', JSON.stringify(interiors.stats()));
  return { id, def, root, district, interiors, people, streamer, floors: S.floors, tick: S.tick, npcs: S.npcs, shopPad, traffic, wrong, libCount };
}
// leaving an area: everything it built comes off the graphics card, and the shared lists are emptied
function clearArea(carried) {
  if (shutIn) setShutIn(null); if (carried) scene.add(carried);   // (the car you're in is lifted out first)
  drive.cars.length = 0; colliders.length = 0; walkAreas.length = 0; driveAreas.length = 0;
  A.root.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.isInstancedMesh) o.dispose(); for (const m of [].concat(o.material || [])) { for (const k in m) { const v = m[k]; if (v && v.isTexture) v.dispose(); } m.dispose(); } });
  scene.remove(A.root); A = null;
}

// ---- modes: on foot, or in a car (the one button gets you in and out)
let mode = 'walk', myCar = null; const useBtn = document.getElementById('use');
const setMode = (m) => { mode = m; walk.enabled = m === 'walk'; document.body.dataset.mode = m; };
const use = () => { if (busy || talk.active || shop.active || downT > 0 || townMap.active) return; if (mode === 'walk' && pick) { takeGood(pick); return; } if (mode === 'walk' && talkTo && !useCar) { startTalk(talkTo); return; } if (mode === 'drive') { drive.leave(() => { rise = { p: camera.position.clone(), q: camera.quaternion.clone(), t: 0 }; const out = drive.exit(); if (out) { walk.position.set(out.x, 0, out.z); walk.yaw = out.yaw; walk.pitch = -0.05; } myCar = null; setMode('walk'); walk.apply(); }); } else { const c = drive.nearest(walk.position); if (c) { const t = c.userData.trafficRef; if (t) crime(t.police ? 2 : 1);   /* (taking a car that someone is driving) */ hands.play('reach'); handT = 0.55; drive.enter(c); myCar = c; setMode('drive'); } } };
// ---- the law, and your own skin
// heat: what the police know you have done lately (0..8): a star at 1, two at 3, three at 6. It only cools while no police
// car is near enough to see you. Stopped with one beside you for a couple of seconds, you are taken in: BUSTED, a fine.
// health: crashes, explosions. At nothing: WASTED, a tenth of your money, and you come round where the area begins.
// PARKED (owner, after 126): this is not that kind of game. No police, no wanted stars, no arrests, no health bar, no
// WASTED. The code stays here, switched off; `?law` in the address turns it on for anyone who wants to look at it.
const LAW_ON = qs.has('law');
const law = { heat: 0, bustT: 0 }; let health = 100, hurtT = 0, downT = 0;
const stars = () => (law.heat >= 6 ? 3 : law.heat >= 3 ? 2 : law.heat >= 1 ? 1 : 0);
const crime = (n) => { if (!LAW_ON || downT > 0) return; law.heat = Math.min(8, law.heat + n); };
const policeNear = () => { let d = 1e9; if (A && A.traffic) { const me = mode === 'drive' ? drive.state : walk.position; for (const c of A.traffic.cars) if (c.police) d = Math.min(d, Math.hypot(c.x - me.x, c.z - me.z)); } return d; };
function hurtPlayer(n) { if (!LAW_ON || n <= 0 || downT > 0) return; health = Math.max(0, health - n); hurtT = 10; redEl.style.opacity = Math.min(0.6, 0.15 + n / 90); setTimeout(() => { redEl.style.opacity = 0; }, 140); if (health <= 0) down('WASTED'); }
const START = { west: [163.5, 20], east: [327, 20], old: [-20, 4], south: [20, 3] };
const lawEl = document.createElement('div'), hpEl = document.createElement('div'), bigEl = document.createElement('div'), redEl = document.createElement('div');
{ const st = document.createElement('style'); st.textContent = [
    '#wanted{position:fixed;left:50%;top:calc(44px + env(safe-area-inset-top,0px));transform:translateX(-50%);font:700 22px system-ui;letter-spacing:4px;color:#ffd24a;text-shadow:0 2px 6px #000;pointer-events:none;z-index:6}',
    '#wanted.seen{animation:wb .5s steps(2) infinite}', '@keyframes wb{50%{color:#ff5a4a}}',
    '#hpbar{position:fixed;left:10px;top:calc(84px + env(safe-area-inset-top,0px));width:92px;height:8px;border-radius:4px;background:#000a;border:1px solid #fff5;overflow:hidden;z-index:5;pointer-events:none}', '#hpbar i{display:block;height:100%;background:#e0524a}',
    'body[data-mode=drive] #hpbar{top:calc(66px + env(safe-area-inset-top,0px));left:70px}',
    '#bigmsg{position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#000c;color:#fff;font:800 54px system-ui;letter-spacing:6px;z-index:40;opacity:0;pointer-events:none;transition:opacity .5s}',
    '#bigmsg i{font:500 17px system-ui;letter-spacing:1px;margin-top:10px;opacity:.85;font-style:normal}',
    '#redflash{position:fixed;inset:0;background:#c00;opacity:0;pointer-events:none;z-index:7;transition:opacity .25s}'].join('\n'); document.head.appendChild(st);
  if (!LAW_ON) { lawEl.hidden = hpEl.hidden = true; lawEl.style.display = hpEl.style.display = 'none'; }
  lawEl.id = 'wanted'; hpEl.id = 'hpbar'; hpEl.innerHTML = '<i></i>'; bigEl.id = 'bigmsg'; redEl.id = 'redflash'; document.body.append(lawEl, hpEl, bigEl, redEl); }
// taken in, or knocked out: the screen goes dark with the word on it, then you are on foot again
function down(word) { if (downT > 0) return; const fine = word === 'BUSTED' ? Math.min(talk.wallet.money, 40 * Math.max(1, stars())) : Math.round(talk.wallet.money * 0.1); talk.wallet.money -= fine; talk.sync(); talk.close(); shop.close();
  bigEl.innerHTML = word + '<i>' + (word === 'BUSTED' ? 'Fined' : 'It cost you') + ' $' + fine + '</i>'; bigEl.style.opacity = 1; downT = 2.8; law.heat = 0; law.bustT = 0; drive.lock = true; walk.enabled = false;
  downWord = word; downMoved = false; }
let downWord = '', downMoved = false;
function tickLaw(dt) { if (!LAW_ON) return;
  if (downT > 0) { downT -= dt;   // dark screen: half way through you are put on your feet; at the end it lifts
    if (downT < 1.9 && !downMoved) { downMoved = true; if (mode === 'drive') { const out = drive.exit(); if (out) { walk.position.set(out.x, 0, out.z); walk.yaw = out.yaw; } myCar = null; setMode('walk'); }
      if (downWord === 'WASTED') { const s0 = START[A.id]; if (s0) walk.position.set(s0[0], 0, s0[1]); health = 100; } else health = Math.max(health, 30); walk.enabled = false; walk.apply(); }
    if (downT <= 0) { bigEl.style.opacity = 0; drive.lock = false; walk.enabled = mode === 'walk'; } return; }
  const dP = policeNear(), seen = dP < 50, sp = mode === 'drive' ? Math.hypot(drive.state.vx, drive.state.vz) : 0, n = stars();
  // (it cools only once they have had no sight of you for a while: time enough for a car to get to where you were)
  law.unseen = seen || n === 0 ? 0 : (law.unseen || 0) + dt; if (n === 0) law.heat = Math.max(0, law.heat - dt * 0.05); else if (!seen && (law.unseen > 26 || !A.traffic)) law.heat = Math.max(0, law.heat - dt * 0.12);
  if (n > 0 && dP < 8.5 && sp < 2 && !shutIn) { if ((law.bustT += dt) > 2.5) down('BUSTED'); } else law.bustT = Math.max(0, law.bustT - dt * 0.5);
  lawEl.textContent = n ? '★'.repeat(n) + '☆'.repeat(3 - n) : ''; lawEl.className = n && seen ? 'seen' : '';
  if (hurtT > 0) hurtT -= dt; else if (health < 100) health = Math.min(100, health + dt * 1.2);
  hpEl.style.display = health < 99.5 ? '' : 'none'; hpEl.firstChild.style.width = health + '%'; }
// ---- the mood: sound on foot, things that change when you are not looking, the door that is ajar, quiet spells
const sound = makeSound(); const blinkEl = document.createElement('div');
{ blinkEl.style.cssText = 'position:fixed;inset:0;background:#000;opacity:0;pointer-events:none;z-index:35;transition:opacity .16s'; document.body.appendChild(blinkEl); }
let blinkT = 0, blinkFn = null; const blink = (fn) => { if (blinkT > 0) return; blinkT = 0.42; blinkFn = fn; blinkEl.style.opacity = 1; };
const ROOM_FLOOR = { shop: 'tile', clinic: 'tile', office: 'carpet', police: 'carpet', school: 'carpet', flat: 'wood', studio: 'wood' };
const lastPos = new THREE.Vector3(); let strangeT = 30, quietT = 200 + Math.random() * 150, quietLeft = 0; const ajar = [];
function tickMood(dt) {
  if (blinkT > 0) { const b = blinkT; blinkT -= dt; if (b > 0.22 && blinkT <= 0.22 && blinkFn) { blinkFn(); blinkFn = null; } if (blinkT <= 0.2) blinkEl.style.opacity = 0; }
  const onFoot = mode === 'walk', p = walk.position, w = A.wrong;
  // the door that is ajar: step through and you are somewhere the building has no room for; its far door lets you out where you came in
  if (w && onFoot && blinkT <= 0) { if (!w.inside) { const r = w.e.inner; if (p.x > r.minX && p.x < r.maxX && p.z > r.minZ && p.z < r.maxZ) blink(() => { w.inside = true; walk.position.set(w.ox + w.wp.start[0], 0, w.oz + w.wp.start[1]); walk.yaw = w.wp.start[2]; walk.pitch = 0; walk.apply(); hemi.intensity = w.wp.light; moon.intensity = 0;  A.streamer.update(camera.position); }); }
    else { const [x0, x1, z0, z1] = w.wp.exit; if (p.x > w.ox + x0 && p.x < w.ox + x1 && p.z > w.oz + z0 && p.z < w.oz + z1) blink(() => { w.inside = false; const [x, z] = w.e.W(w.e.doorX, -1.9); walk.position.set(x, 0, z); walk.yaw = w.e.th; walk.pitch = 0; walk.apply(); hemi.intensity = 0.75; moon.intensity = 0.5;  A.streamer.update(camera.position); }); } }
  // sound: what room you are in, how fast you are walking and on what
  let inside = null; if (w && w.inside) inside = w.kind === 'hall' ? 'wrong' : 'wrong'; else if (onFoot && A.interiors) for (const e of A.interiors.list) if (e.group && inRoom(e, p)) { inside = e.type; break; }
  const speed = onFoot && dt > 0 ? Math.hypot(p.x - lastPos.x, p.z - lastPos.z) / dt : 0; lastPos.copy(p);
  sound.tick(dt, { interference: fuzz(), inside, shut: !!shutIn || !!(w && w.inside), speed: speed > 12 ? 0 : speed, onFoot: onFoot && !talk.active, surface: w && w.inside ? (w.kind === 'hall' ? 'wood' : 'carpet') : inside ? ROOM_FLOOR[inside] || 'tile' : A.district ? 'street' : 'stone' });
  if (!A.district || (w && w.inside)) return;
  // quiet spells: every few minutes the street empties (nobody new comes, the cars are gone), and later fills again
  if (quietLeft > 0) { if ((quietLeft -= dt) <= 0) { A.people.quiet = false; A.traffic.quiet = false; quietT = 240 + Math.random() * 200; } } else if ((quietT -= dt) <= 0) { quietLeft = 70 + Math.random() * 45; A.people.quiet = true; A.traffic.quiet = true; }
  // things that are not as you left them, changed only where you are not looking: a door standing open, a parked car that has moved
  const fx = -Math.sin(walk.yaw), fz = -Math.cos(walk.yaw), unseen = (x, z) => { const dx = x - p.x, dz = z - p.z, d = Math.hypot(dx, dz) || 1; return (dx * fx + dz * fz) / d < 0.15; };
  for (let i = ajar.length - 1; i >= 0; i--) { const e = ajar[i]; if (e.d < 3.2) e.seenOpen = true; else if (e.seenOpen && e.d > 7 || e.d > 60) { e.ajar = 0; e.seenOpen = false; ajar.splice(i, 1); } }
  if (onFoot && (strangeT -= dt) <= 0) { strangeT = 22 + Math.random() * 30;
    if (Math.random() < 0.5 && ajar.length < 3) { const c = A.interiors.list.filter((e) => e.group && !e.ajar && e.d > 8 && e.d < 26 && unseen(e.door[0], e.door[1])); if (c.length) { const e = c[Math.floor(Math.random() * c.length)]; e.ajar = 0.28 + Math.random() * 0.2; ajar.push(e); } }
    else { const c = drive.cars.filter((g) => { const u = g.userData, d = Math.hypot(g.position.x - p.x, g.position.z - p.z); return !u.trafficRef && !u.wreck && g !== myCar && d > 22 && d < 75 && !(u.dyn && (u.dyn.vx || u.dyn.vz)) && unseen(g.position.x, g.position.z); });
      if (c.length) { const g = c[Math.floor(Math.random() * c.length)], h = g.rotation.y, step = (Math.random() < 0.5 ? -1 : 1) * (1.2 + Math.random() * 2.6), nx = g.position.x + Math.sin(h) * step, nz = g.position.z + Math.cos(h) * step, u = g.userData;
        const fits = [u.half.zF, u.half.zR, 0].every((lz) => driveAreas.some((a) => nx + Math.sin(h) * lz >= a.minX + 0.9 && nx + Math.sin(h) * lz <= a.maxX - 0.9 && nz + Math.cos(h) * lz >= a.minZ + 0.9 && nz + Math.cos(h) * lz <= a.maxZ - 0.9)) && !drive.cars.some((o) => o !== g && Math.hypot(o.position.x - nx, o.position.z - nz) < 5.5) && !colliders.some((k) => !k.car && k.active !== false && (k.type === 'circle' ? Math.hypot(k.x - nx, k.z - nz) < k.r + 2.6 : nx > k.minX - 2.6 && nx < k.maxX + 2.6 && nz > k.minZ - 2.6 && nz < k.maxZ + 2.6));
        if (fits) { g.position.x = nx; g.position.z = nz; drive.syncCols(g); } } } } }
// ---- your own body: hunger, what you wear, your hands, the torch, the map, the radio
// hunger (0 full .. 100 starving) climbs slowly all the time; past 60 it slows your walk, down to six tenths at 100.
// What you eat and how far you walk are counted (wallet.stats) for whatever they are made to do to you later.
const hands = makeHands(camera), goneAt = new Map(), fwd = new THREE.Vector3(), bodyLast = new THREE.Vector3();
let pick = null, saveT = 30, handT = 0;
const townMap = makeMap({ onOpen: () => { walk.enabled = false; }, onClose: () => { walk.enabled = mode === 'walk' && !talk.active; } });
function wearNow() { padNow(); const w = talk.wallet, has = (n) => w.items[n] > 0; hands.dress({ coat: w.wear.coat === 'Jacket', shirt: w.wear.shirt === 'Clean shirt' }); hands.umbrella(w.wear.hand === 'Umbrella'); if (hands.torchOn && !has('Flashlight')) hands.torch(false); if (sound.radioOn && !has('Pocket radio')) sound.radio(false); }
function openMap() { const far = A.wrong ? A.wrong.oz + 200 : -1e9, ok = (r) => r.minZ > far, B = A.district ? A.district.userData.buildings : [];
  const roads = driveAreas.filter(ok), paths = walkAreas.filter(ok), buildings = B.map((b) => ({ x0: b.x0, x1: b.x1, z0: b.z0, z1: b.z1, label: b.shop >= 0 && SHOP_KINDS[b.shop] ? SHOP_KINDS[b.shop].title : null }));
  let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; for (const r of roads.concat(paths)) { x0 = Math.min(x0, r.minX); x1 = Math.max(x1, r.maxX); z0 = Math.min(z0, r.minZ); z1 = Math.max(z1, r.maxZ); }
  // a way out is wherever its test comes true: the middle of that stretch of ground is where its name goes
  const exits = []; for (const ex of A.def.exits) { let sx = 0, sz = 0, n = 0; for (let i = 0; i <= 40; i++) for (let j = 0; j <= 40; j++) { const x = x0 - 3 + (x1 - x0 + 6) * i / 40, z = z0 - 3 + (z1 - z0 + 6) * j / 40; if (ex.test(x, z)) { sx += x; sz += z; n++; } } if (n) exits.push({ x: sx / n, z: sz / n, label: 'to ' + AREAS[ex.to].name }); }
  const marks = (A.npcs || []).filter((n) => n.who && n.who.kind).map((n) => ({ x: n.x, z: n.z, label: n.who.title }));
  if (A.shopPad) marks.push({ x: (A.shopPad[0] + A.shopPad[1]) / 2, z: (A.shopPad[2] + A.shopPad[3]) / 2, label: 'body shop' });
  // the people your errands want you to see
  for (const p of talk.errands.toSee(A.id)) { const q = worldPeople().find((o) => o.id === p.id); if (q && q.x !== undefined) marks.push({ x: q.x, z: q.z, label: '\u2192 ' + p.name, job: true }); }
  townMap.open({ name: A.def.name, roads, paths, buildings, marks, exits, you: { x: walk.position.x, z: walk.position.z, yaw: walk.yaw } }); }
function takeGood(q) { const e = q.room; if (e) { e.goods.splice(e.goods.indexOf(q), 1); q.obj.parent.remove(q.obj); goneAt.get(q.key).set(q.slot, t); } else { q.gone = true; q.goneT = t; q.obj.visible = false; }   /* (a thing set out by hand: hidden, and back in ten minutes) */ talk.gain(q.name); hands.play('reach', q.name); handT = 0.6; note('Taken: ' + q.name, 1.8); pick = null; padNow(); }
function tickBody(dt) { const w = talk.wallet, h0 = w.hunger; w.hunger = Math.min(100, w.hunger + dt * (100 / 1800));
  walk.speed = 2.75 * (briskT > 0 ? 1.25 : 1) * (1 - 0.4 * Math.max(0, Math.min(1, (w.hunger - 60) / 40)));
  if ((h0 < 60 && w.hunger >= 60) || (h0 < 85 && w.hunger >= 85)) { talk.sync(); note(w.hunger >= 85 ? 'You are starving. You can hardly walk.' : 'You are hungry. It is slowing you down.', 4); }
  if (noteT > 0 && (noteT -= dt) <= 0) noteEl.style.opacity = 0; padNow();
  const p = walk.position, d = mode === 'walk' ? Math.hypot(p.x - bodyLast.x, p.z - bodyLast.z) : 0; bodyLast.copy(p); if (d < 2) w.stats.walked += d;
  if ((saveT -= dt) <= 0) { saveT = 30; talk.sync(); }
  // a door you push open as you come to it
  if (mode === 'walk' && A.interiors) for (const e of A.interiors.list) { const open = e.target > 0.9; if (open && !e._open && e.d < 2.6 && !hands.busy) hands.play('push'); e._open = open; }
  // the thing on a shelf you are looking at
  pick = null; if (mode === 'walk' && !talk.active && !townMap.active && A.interiors) for (const e of A.interiors.list) if (e.group && e.goods && e.goods.length && inRoom(e, p)) { camera.getWorldDirection(fwd); let bc = 0.95; const c0 = camera.position; for (const q of e.goods) { const dx = q.wx - c0.x, dy = q.wy - c0.y, dz = q.wz - c0.z, dd = Math.hypot(dx, dy, dz); if (dd > 2.1) continue; const c = (dx * fwd.x + dy * fwd.y + dz * fwd.z) / dd; if (c > bc) { bc = c; pick = q; q.room = e; } } break; }
  if (A.picks && mode === 'walk' && !talk.active && !townMap.active) { camera.getWorldDirection(fwd); let bc = 0.95; const c0 = camera.position; for (const q of A.picks) { if (q.gone) { if (t - q.goneT > 600) { q.gone = false; q.obj.visible = true; } continue; } const dx = q.wx - c0.x, dy = q.wy - c0.y, dz = q.wz - c0.z, dd = Math.hypot(dx, dy, dz); if (dd > 2.1) continue; const c = (dx * fwd.x + dy * fwd.y + dz * fwd.z) / dd; if (c > bc) { bc = c; pick = q; q.room = null; } } }
  if (handT > 0) handT -= dt; hands.hidden = (mode === 'drive' && handT <= 0) || !!(rise); hands.update(dt, d / Math.max(dt, 1e-4) > 0.4); }
// who can be sent to from here (errands): this area's keepers and standing people, and the written characters elsewhere
const sexOf = (seed) => { const s = seed * 104729 + 7; return ((s * 16807) % 2147483647) / 2147483647 < 0.5 ? 'f' : 'm'; };   // (as models/people96.js makePerson decides it)
const FAR = { potter: 'west', host: 'west', attendant: 'east', keeper: 'east' };
function worldPeople() { if (!A) return []; if (A._wp) return A._wp; const out = [];
  for (const n of A.npcs || []) out.push({ id: n.who.id, name: n.who.name, title: n.who.title || n.who.job, area: A.id, x: n.x, z: n.z, sells: n.who.kind ? n.who.kind.goods.map((g) => g[0]) : null });
  if (A.interiors) for (const e of A.interiors.list) if (e.type === 'shop' && e.b.shop >= 0 && SHOP_KINDS[e.b.shop]) { const who = keeperOf(A.id, e.b.shop, e.b.index, sexOf(300 + e.b.index * 3 + (A.id === 'east' ? 1 : 0))); out.push({ id: who.id, name: who.name, title: who.title, area: A.id, x: e.door[0], z: e.door[1], sells: SHOP_KINDS[e.b.shop].goods.map((g) => g[0]) }); }
  for (const [cid, area] of Object.entries(FAR)) if (area !== A.id) { const c = character(cid); out.push({ id: c.id, name: c.name, title: c.title, area }); }
  A._wp = out; return out; }
// a line of words on screen for a moment, on foot (the car has its own)
const noteEl = document.createElement('div'); { noteEl.style.cssText = 'position:fixed;left:50%;top:20%;transform:translateX(-50%);z-index:6;font:600 16px Georgia,serif;color:#e9c77a;background:#000a;padding:8px 14px;border-radius:10px;opacity:0;transition:opacity .4s;pointer-events:none;text-align:center;max-width:84%'; document.body.appendChild(noteEl); }
let noteT = 0; const note = (text, secs = 2.5) => { noteEl.textContent = text; noteEl.style.opacity = 1; noteT = secs; };
// the controller's face buttons on foot: Y the flashlight, X the radio, B the map (each only once you have the thing)
const footPad = document.createElement('div'); { footPad.id = 'footpad'; footPad.innerHTML = '<button data-k="torch" class="y">Y<i>flashlight</i></button><button data-k="radio" class="x">X<i>radio</i></button><button data-k="map" class="b">B<i>map</i></button>';
  const st = document.createElement('style'); st.textContent = `#footpad{display:none} @media (pointer:coarse){body[data-mode=walk]:not([data-talk]) #footpad{display:block;position:fixed;right:8px;bottom:calc(10px + env(safe-area-inset-bottom,0px));width:196px;height:196px;pointer-events:none;z-index:4;font-family:system-ui,sans-serif}}
  #footpad button{pointer-events:auto;position:absolute;width:70px;height:70px;border-radius:50%;background:#000a;color:#fff;font:800 24px/1 system-ui;border:3px solid #fff6;touch-action:none;padding:0} #footpad button[hidden]{display:none} #footpad button i{display:block;font:600 8.5px/1.1 system-ui;font-style:normal;opacity:.85;margin-top:2px;white-space:nowrap}
  #footpad .b{left:126px;top:63px;border-color:#e0524a;color:#ff8a82} #footpad .x{left:0;top:63px;border-color:#4a8ae0;color:#8ab8ff} #footpad .y{left:63px;top:0;border-color:#e0c040;color:#ffe27a} #footpad button.on{background:#fff5}`; document.head.appendChild(st); document.body.appendChild(footPad);
  for (const b of footPad.querySelectorAll('button')) { for (const ev of ['touchstart', 'touchmove', 'touchend', 'mousedown', 'pointerdown', 'pointerup']) b.addEventListener(ev, (e) => e.stopPropagation()); b.addEventListener('click', () => quick(b.dataset.k)); } }
function quick(k) { if (mode !== 'walk' || talk.active || townMap.active) return; const w = talk.wallet; if (k === 'torch' && w.items['Flashlight']) hands.torch(!hands.torchOn); if (k === 'radio' && w.items['Pocket radio']) { const on = sound.radio(!sound.radioOn); note(on ? 'Radio on' : 'Radio off', 1.2); } if (k === 'map' && w.items['Town map']) openMap(); padNow(); }
function padNow() { const w = talk.wallet, B = footPad.children; B[0].hidden = !w.items['Flashlight']; B[1].hidden = !w.items['Pocket radio']; B[2].hidden = !w.items['Town map']; B[0].classList.toggle('on', hands.torchOn); B[1].classList.toggle('on', sound.radioOn); }
// the radio breaks up near the door that is ajar, in the place behind it, and near the people who do not walk
function fuzz() { if (!sound.radioOn) return 0; const p = mode === 'walk' ? walk.position : drive.state, w = A.wrong; let f = 0; if (w) f = w.inside ? 0.9 : Math.max(0, 1 - Math.hypot(p.x - w.e.door[0], p.z - w.e.door[1]) / 22) * 0.85; if (A.people) for (const q of A.people.list) if (q.odd && q.active) f = Math.max(f, Math.max(0, 1 - Math.hypot(p.x - q.mesh.position.x, p.z - q.mesh.position.z) / 9) * 0.6); return f; }
addEventListener('keydown', (e) => { if (e.code === 'KeyF') quick('torch'); if (e.code === 'KeyR') quick('radio'); if (e.code === 'KeyM') quick('map'); });
// ---- talking: the nearest person in reach (someone on the street, a shopkeeper across their counter, a character)
let talkTo = null, useCar = false, talkPed = null, rise = null;   // rise: standing up out of a car (the view comes up from the seat)
let briskT = 0, shopUsed = false;
const talk = makeTalk({ world: () => worldPeople(), onSay: (who, text) => sound.voice(who, text), onOpen: () => { walk.enabled = false; }, onClose: () => { sound.hush(); if (talkPed && talkPed.st === 'talk') talkPed.st = 'walk'; talkPed = null; walk.enabled = mode === 'walk'; },
  // things used from the bag: tape or a hammer patch up the car you are standing by; a drink quickens your step for a while
  use: { mend: (name) => { const c = drive.nearest(walk.position); if (!c || c.userData.wreck) return null; const u = c.userData, add = name === 'Hammer' ? 0.15 : 0.3; if (u.hp >= u.hd.hpMax) return null; u.hp = Math.min(u.hd.hpMax, u.hp + u.hd.hpMax * add); return `You patch up the ${u.driveName}. It will hold.`; },
    brisk: (name) => { briskT = 90; const w = talk.wallet; w.hunger = Math.max(0, w.hunger - 6); w.stats.eaten += ITEM.get(name).price; hands.play('eat', name); return 'That wakes you up. You walk faster for a while.'; },
    // food: the dearer the meal the longer it keeps you
    eat: (name) => { const w = talk.wallet; if (w.hunger < 8) return { msg: 'You are not hungry.', keep: true }; const p = ITEM.get(name).price, was = w.hunger; w.hunger = Math.max(0, w.hunger - Math.max(14, Math.min(75, p * 6))); w.stats.eaten += p; hands.play('eat', name); return w.hunger < 8 ? 'You eat. You are full.' : was >= 60 && w.hunger < 60 ? 'You eat. That is better.' : 'You eat. It takes the edge off.'; },
    torch: () => { hands.torch(!hands.torchOn); return { msg: hands.torchOn ? 'You switch the flashlight on.' : 'You switch the flashlight off.', keep: true }; },
    radio: () => { const on = sound.radio(!sound.radioOn); return { msg: on ? 'You switch the radio on.' : 'You switch the radio off.', keep: true }; },
    map: () => ({ keep: true, msg: '', close: openMap }), state: (k) => (k === 'torch' ? hands.torchOn : sound.radioOn), changed: () => wearNow(),
    heal: (name) => { if (!LAW_ON || health >= 100) return null; health = Math.min(100, health + (name === 'Painkillers' ? 55 : name === 'Bandages' ? 40 : 18)); return 'Patched up.'; } } });
const shop = makeShopMenu({ drive, makeCar, wallet: talk.wallet, paid: () => talk.sync(), resprayed: () => { if (law.heat > 0 && policeNear() > 30) { law.heat = 0; drive.say('THEY HAVE LOST YOU', 3); } } });
const inRoom = (e, p) => p.x > e.inner.minX && p.x < e.inner.maxX && p.z > e.inner.minZ && p.z < e.inner.maxZ;
function findTalk() { const p = walk.position; let best = null, bd = 1e9; const tryN = (n, d, reach) => { if (d < reach && d < bd) { bd = d; best = n; } };
  for (const n of A.npcs || []) tryN(n, Math.hypot(n.x - p.x, n.z - p.z), n.reach);
  if (A.interiors) for (const e of A.interiors.list) if (e.group && e.npc && inRoom(e, p)) tryN(e.npc, Math.hypot(e.npc.x - p.x, e.npc.z - p.z), e.npc.reach);
  if (A.people) for (const q of A.people.list) if (q.active && q.st === 'walk') { const d = Math.hypot(q.mesh.position.x - p.x, q.mesh.position.z - p.z); if (d < 2.8 && d < bd) { bd = d; best = q.npc || (q.npc = { who: whoIs(A.id, q.seed, q.mesh.userData.sex), ped: q, mesh: q.mesh }); } }
  talkTo = best; talkD = bd; }
let talkD = 0;
function startTalk(n) { if (n.ped) { n.ped.st = 'talk'; talkPed = n.ped; } walk.enabled = false; talk.open(n.who, A.id); n.who.known = true;
  const m = n.mesh.position, wx = n.x ?? m.x, wz = n.z ?? m.z; walk.yaw = Math.atan2(walk.position.x - wx, walk.position.z - wz); walk.pitch = innerWidth > innerHeight ? -0.05 : -0.3; walk.apply(); }   // (turn to them; look down a little so their face clears the panel)
useBtn.addEventListener('click', use); addEventListener('keydown', (e) => { if (e.code === 'KeyE') use(); });

// ---- drawing less: size-based culling; the outside is not drawn while you're shut indoors; resolution steps down if slow
let shutIn = null; const shutHidden = [];
function setShutIn(e) { for (const o of shutHidden) o.visible = true; shutHidden.length = 0; shutIn = e; if (!e) return;
  const keep = new Set([e.group, A.interiors.doors]), special = (o) => { let f = false; o.traverse((c) => { if (c.isLight || c.isCamera || keep.has(c)) f = true; }); return f; };
  const walkIn = (node) => { for (const c of node.children) { if (c.isLight || c.isCamera || keep.has(c) || !c.visible) continue; if (special(c)) walkIn(c); else { c.visible = false; shutHidden.push(c); } } }; walkIn(scene); }

// ---- going from one area to the next
let busy = false, pending = 0; const travelEl = document.getElementById('travel');
{ const M = THREE.DefaultLoadingManager, s0 = M.itemStart.bind(M), e0 = M.itemEnd.bind(M), r0 = M.itemError.bind(M); M.itemStart = (u) => { pending++; s0(u); }; M.itemEnd = (u) => { pending = Math.max(0, pending - 1); e0(u); }; M.itemError = (u) => { r0(u); }; }   // (how many texture loads are still out)
const frames = (n) => new Promise((r) => { let k = 0; const f = () => (++k >= n ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); });
async function travel(exit) {
  if (busy) return; busy = true; const t0 = performance.now(), carried = mode === 'drive' ? myCar : null;
  travelEl.querySelector('b').textContent = AREAS[exit.to].name; travelEl.querySelector('i').textContent = exit.label + '…'; travelEl.hidden = false; await frames(3);
  talk.close(); shop.close(); falls.length = 0; ajar.length = 0; quietLeft = 0; hemi.intensity = 0.75; moon.intensity = 0.5; clearArea(carried); A = buildArea(exit.to, carried); if (exit.spawn && mode === 'walk') { walk.position.set(exit.spawn[0], 0, exit.spawn[1]); walk.yaw = exit.spawn[2]; walk.pitch = 0; walk.gy = 0; } if (mode === 'walk') walk.apply();
  pending = 0; await frames(2); for (let i = 0; i < 80 && pending > 0; i++) await new Promise((r) => setTimeout(r, 100));   // let this area's textures arrive (8 s at most)
  try { if (renderer.compileAsync) await renderer.compileAsync(scene, camera); } catch (e) { /* ignore */ }
  travelEl.hidden = true; clock.getDelta(); busy = false; console.log('travel to', exit.to, Math.round(performance.now() - t0), 'ms');
}

// a readout (?stats, or tap the top-left corner three times): frames per second, resolution scale, draw calls, triangles
const statEl = document.getElementById('stats'); let statOn = qs.has('stats'), taps = 0; statEl.hidden = !statOn;
addEventListener('pointerdown', (e) => { if (e.clientX < 70 && e.clientY < 70) { if (++taps >= 3) { taps = 0; statOn = !statOn; statEl.hidden = !statOn; } } else taps = 0; });
const clock = new THREE.Clock(); let t = 0, tick = 0, acc = 0, nfr = 0, fps = 0, slow = 0, fast = 0;
function peopleTick(pos, dt) { if (!A.people) return; let ci = null; if (mode === 'drive' && drive.car) { const S = drive.state; ci = carInfo; ci.x = S.x; ci.z = S.z; ci.vx = S.vx; ci.vz = S.vz; ci.h = S.h; ci.half = drive.car.userData.half; } A.people.update(pos, dt, ci, mode === 'walk', mode === 'walk' ? { fx: -Math.sin(walk.yaw), fz: -Math.cos(walk.yaw) } : null); }
function frame() {
  if (window.__loadingHold || busy || !A) { clock.getDelta(); requestAnimationFrame(frame); return; }
  const raw = clock.getDelta(), dt = Math.min(raw, 0.05); t += dt;
  if (briskT > 0) briskT -= dt; tickBody(dt);
  // parked in the spray booth: the shop opens (once; drive out and back in to open it again)
  if (A.shopPad && mode === 'drive' && drive.car && !shop.active) { const S = drive.state, p = A.shopPad, inside = S.x > p[0] && S.x < p[1] && S.z > p[2] && S.z < p[3]; if (!inside) shopUsed = false; else if (!shopUsed && Math.hypot(S.vx, S.vz) < 1.2 && S.mode === 'wheels' && !drive.car.userData.wreck) { shopUsed = true; S.vx = S.vz = 0; shop.open(drive.car, p.room); } }
  if (mode === 'walk') walk.update(dt); drive.update(dt); if (falls.length) tickFalls(dt);
  if (rise) { rise.t += dt; const k = Math.min(1, rise.t / 0.5), e = k * k * (3 - 2 * k); if (mode === 'walk' && k < 1) { camera.position.lerpVectors(rise.p, camera.position, e); camera.position.y += Math.sin(e * Math.PI) * 0.1; camera.quaternion.slerpQuaternions(rise.q, camera.quaternion, e); } else rise = null; }   // (the driver runs every frame: parked cars that were hit, fires, smoke)
  sky.userData.update(camera, t);
  const pos = mode === 'walk' ? walk.position : drive.state;
  if (A.interiors) { A.interiors.update(mode === 'walk' ? walk.position : camera.position, dt, mode !== 'drive'); const e = A.interiors.enclosed(); if (e !== shutIn) setShutIn(e); }
  if (!shutIn && (tick = (tick + 1) % 10) === 0) { A.streamer.update(camera.position); if (A.district) A.district.userData.lodTick(camera.position, PHONE ? 55 : 110);
    // real lights (the old town's lamps and rooms): only the nearest three are lit, always exactly that many, so no shader changes
    if (A.lights && A.lights.length) { const P3 = camera.position, W = new THREE.Vector3(); for (const l of A.lights) { l.getWorldPosition(W); l.userData._d = W.distanceToSquared(P3); } A.lights.sort((a, b) => a.userData._d - b.userData._d); A.lights.forEach((l, i) => { l.visible = i < 3; }); } }
  if (A.traffic) A.traffic.update(dt); tickLaw(dt); tickMood(dt);
  if (A.tick) A.tick(dt);
  if (A.tickers) for (const o of A.tickers) o.userData.tick(t, dt);
  peopleTick(pos, dt);
  const car = mode === 'walk' ? drive.nearest(walk.position) : null;
  if (mode === 'walk' && !talk.active) findTalk(); else talkTo = null;
  if (talk.active && talkPed && talkPed.st !== 'talk') talk.close();   // (knocked down or scared off mid-sentence)
  // a keeper turns their head to whoever is in the shop
  if (A.interiors && mode === 'walk') for (const e of A.interiors.list) if (e.group && e.npc && inRoom(e, walk.position)) { const hb = e.npc.mesh.userData.bones; let a = Math.atan2(walk.position.x - e.npc.x, walk.position.z - e.npc.z) - (e.th + Math.PI); a = Math.atan2(Math.sin(a), Math.cos(a)); hb.head.rotation.y += (Math.max(-1, Math.min(1, a)) * 0.7 - hb.head.rotation.y) * Math.min(1, dt * 5); }
  for (const n of A.npcs || []) if (n.ry !== undefined) { const hb = n.mesh.userData.bones, dx = camera.position.x - n.x, dz = camera.position.z - n.z; if (dx * dx + dz * dz < 64) { let a = Math.atan2(dx, dz) - n.ry; a = Math.atan2(Math.sin(a), Math.cos(a)); hb.head.rotation.y += (Math.max(-1, Math.min(1, a)) * 0.7 - hb.head.rotation.y) * Math.min(1, dt * 5); } }
  useCar = !!car && !(talkTo && talkD < 1.6 + (car ? Math.hypot(walk.position.x - car.position.x, walk.position.z - car.position.z) - car.userData.half.x : 0));
  useBtn.hidden = mode === 'walk' && !car && !talkTo && !pick; useBtn.textContent = mode === 'drive' ? 'Get out' : pick ? `Take the ${pick.name.toLowerCase()} · $${ITEM.get(pick.name).price}` : car && useCar ? `Drive the ${car.userData.driveName}` : talkTo ? `Talk to ${talkTo.who.known ? talkTo.who.name : talkTo.who.kind ? 'the ' + talkTo.who.title : talkTo.who.sex === 'f' ? 'the woman' : 'the man'}` : '';
  renderer.render(scene, camera);
  for (const ex of A.def.exits) if (ex.test(pos.x, pos.z) && !(ex.onFoot && mode === 'drive')) { travel(ex); break; }
  // once a second: measure, show, and step the resolution (down fast when slow, back up slowly when there's room)
  acc += raw; nfr++; if (acc >= 1) { fps = nfr / acc; acc = 0; nfr = 0;
    if (!qs.has('pr')) { if (fps < 26) { fast = 0; if (++slow >= 2 && pr > 0.8) { pr = Math.max(0.8, pr - 0.25); renderer.setPixelRatio(pr); slow = 0; } } else if (fps > 52) { slow = 0; if (++fast >= 6 && pr < Math.min(DPR, 2)) { pr = Math.min(DPR, 2, pr + 0.25); renderer.setPixelRatio(pr); fast = 0; } } else { slow = 0; fast = 0; } }
    if (statOn) { const i = renderer.info; statEl.textContent = `${A.def.name} · ${fps.toFixed(0)} fps · res x${pr.toFixed(2)} · ${i.render.calls} draws · ${(i.render.triangles / 1000).toFixed(0)}k tris · ${i.memory.textures} tex · ${i.memory.geometries} geo${shutIn ? ' · indoors' : ''}`; } }
  requestAnimationFrame(frame);
}
// ---- start: ?area=east starts in the other area
{ const id = AREAS[qs.get('area')] ? qs.get('area') : 'west'; A = buildArea(id, null);
  walk.position.set(+(qs.get('x') ?? (id === 'west' ? 163.5 : id === 'old' ? -20 : id === 'south' ? 20 : 327)), 0, +(qs.get('z') ?? (id === 'old' ? 4 : id === 'south' ? 3 : 20))); walk.yaw = +(qs.get('yaw') ?? 0.15); walk.pitch = 0.02; setMode('walk'); walk.apply(); }
window.tickLaw = tickLaw; window.tickMood = tickMood; window.tickBody = tickBody; wearNow();
window.__THREE = THREE;   // (for test scripts)
window.__scene = { renderer, scene, camera, walk, drive, setMode, use, talk, shop, sound, hands, worldPeople, quick, footPad, townMap, openMap, get pick() { return pick; }, get wrong() { return A.wrong; }, get libCount() { return A.libCount; }, get picks() { return A.picks; }, get marketDone() { return A.marketDone; }, sidestep: (x, z, h) => sidestep(A.def, x, z, h), get obstacles() { return obst; }, get quiet() { return quietLeft > 0; }, startQuiet() { quietT = 0; }, strangeNow() { strangeT = 0; }, get ajar() { return ajar.length; }, law, crime, hurtPlayer, get health() { return health; }, get stars() { return stars(); }, get traffic() { return A.traffic; }, get shopPad() { return A.shopPad; }, get talkTo() { return talkTo; }, get npcs() { return A.npcs || []; }, travel: (to) => travel({ to, label: 'Going' }), peopleTick: (dt) => peopleTick(mode === 'walk' ? walk.position : drive.state, dt), areaIds: Object.keys(AREAS), get area() { return A.id; }, get busy() { return busy; }, get interiors() { return A.interiors; }, get people() { return A.people; }, get district() { return A.district; }, get areaRoot() { return A.root; }, get streamer() { return A.streamer; },
  stats: () => ({ area: A.id, fps, pr, calls: renderer.info.render.calls, tris: renderer.info.render.triangles, tex: renderer.info.memory.textures, geo: renderer.info.memory.geometries }) };
requestAnimationFrame(frame);
finishLoading(renderer, scene, camera);
