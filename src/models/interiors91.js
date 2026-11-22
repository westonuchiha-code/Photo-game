// Interiors kit (91): the inside of a generated district building, built from the furniture / kitchen-bath / office
// sets. Local frame: x 0..U along the street front, z 0..V going in from the front wall, floor y = 0. The street door
// is in the front wall (z = 0) at x = doorX.
//   makeInterior({ U, V, doorX, type: 'flat' | 'studio' | 'office' | 'shop', seed })
//     -> Group, userData: colliders [[x0, x1, z0, z1]] (local), lights [[x, y, z], [x, y, z]] (where the two shared
//        interior lights should sit), type
// Rooms: flat = hall + living room + kitchen + bedroom + bathroom; studio = one room with a kitchenette and a
// screened washroom; office = workstations, cabinets, copier, meeting corner; shop = counter, till, shelving.
import * as THREE from 'three';
import { mat, plain, box, rbox, cyl, flat, bar, canvasT, rng, V as V3, projUV } from './kit.js';
import { makeBed, makeNightstand, makeWardrobe, makeDesk, makeChair, makeSofa, makeCoffeeTable, makeTV, makeTVStand, makeLamp, makeBookshelf, makeRug } from './furniture88.js';
import { makeFridge, makeStove, makeBaseCabinet, makeWallCabinet, makeKitchenTable, makeBathtub, makeShower, makeToilet, makeWashbasin, makeMirror, makeTowelRail } from './kitchen89.js';
import { makeWorkstation, makeFilingCabinet, makeCopier, makeWaterCooler, makeWhiteboard, makeCorkBoard, makeWasteBin, makePartition } from './office90.js';
import { makeHospitalBed, makeDripStand, makeTrolley, makeWheelchair, makeWaitingChairs, makeReceptionDesk, makeHoldingCell, makeLockers, makeFrontCounter, makeStudentDesk, makeChalkboard, makeTeacherDesk, makeWallSign } from './civic93.js';
import { F, fitText } from '../fonts.js';

const PI = Math.PI, H = 2.6, T = 0.1;
const WALLS = ['#d8d2c4', '#cfd6d2', '#e0d6c0', '#d2cfd8', '#d6dccc', '#e2dcd2'];
const SOFAS = [['b82_chenille', '#5a6a5a'], ['fb_denim', '#3a4a6a'], ['op_leather', '#6a4a30'], ['fb_velour', '#5a2a3a'], ['b82_chenille', '#8a7a5a'], ['b82_canvasgrey', '#6a7078']];
const BLANKETS = [['b82_chenille', '#4a6a8a'], ['fb_plaid_red', '#a8483a'], ['b82_chenille', '#6a8a5a'], ['fb_plaid_navy', '#3a4a6a'], ['b82_chenille', '#b89a4a'], ['b82_chenille', '#8a5a7a']];
const WOODK = ['oak', 'walnut', 'pine', 'cherry', 'white', 'black'];
const RUGS = ['#8a4a3a', '#5a6a7a', '#6a5a3a', '#4a6a5a', '#7a4a5a'];

export function makeInterior({ U, V, doorX, type = 'flat', seed = 1 }) {
  const g = new THREE.Group(); g.name = 'interior_' + type; const cols = [], r = rng(seed * 7919 + 13), pick = (a) => a[Math.floor(r() * a.length)];
  const wallM = mat('sg_plaster', { to: pick(WALLS), rough: 0.9 }), trim = mat('sg_plaster', { to: '#ecebe4', rough: 0.6 });
  const put = (o, x, z, ry = 0, y = 0) => { o.position.set(x, y, z); o.rotation.y = ry; g.add(o); for (const c of (o.userData.colliders || (o.userData.collider ? [o.userData.collider] : []))) { const cs = Math.cos(ry), sn = Math.sin(ry); const pts = [[c[0], c[2]], [c[1], c[2]], [c[0], c[3]], [c[1], c[3]]].map(([px, pz]) => [x + px * cs + pz * sn, z - px * sn + pz * cs]); cols.push([Math.min(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[0])), Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[1]))]); } return o; };
  // walls: along x at depth z, or along z at x; `gaps` = [[from, to], ...] doorways (a lintel is left above each)
  const wall = (alongX, c, a, b, gaps = [], collide = true) => { let p = a; const segs = []; for (const [g0, g1] of [...gaps].sort((q, w) => q[0] - w[0])) { if (g0 > p) segs.push([p, g0]); p = g1; if (alongX) box(g1 - g0, H - 2.05, T, wallM, (g0 + g1) / 2, 2.05 + (H - 2.05) / 2, c, g, 2.4); else box(T, H - 2.05, g1 - g0, wallM, c, 2.05 + (H - 2.05) / 2, (g0 + g1) / 2, g, 2.4); } if (b > p) segs.push([p, b]);
    for (const [s0, s1] of segs) { if (alongX) { box(s1 - s0, H, T, wallM, (s0 + s1) / 2, H / 2, c, g, 2.4); if (collide) cols.push([s0, s1, c - T / 2 - 0.02, c + T / 2 + 0.02]); } else { box(T, H, s1 - s0, wallM, c, H / 2, (s0 + s1) / 2, g, 2.4); if (collide) cols.push([c - T / 2 - 0.02, c + T / 2 + 0.02, s0, s1]); } } };
  // shell: front wall with the street doorway, back + side walls (the building's own walls are just outside these)
  wall(true, T / 2, 0, U, [[doorX - 0.55, doorX + 0.55]], false); wall(true, V - T / 2, 0, U, [], false); wall(false, T / 2, 0, V, [], false); wall(false, U - T / 2, 0, V, [], false);
  const ceil = flat(0, U, 0, V, H, mat('b82_speckle', { to: '#e6e2da', side: THREE.DoubleSide }), g, 1.2); ceil.castShadow = false;
  const lightPanel = (x, z, w = 0.5, d = 0.5) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.03, d), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.0, 1.9, 1.7), toneMapped: false })); m.position.set(x, H - 0.016, z); g.add(m); };
  const floorOf = (x0, x1, z0, z1, kind) => { const F0 = { wood: ['wood_floor', pick(['#a87a52', '#96704a', '#b08660'])], dark: ['walnut_floor', '#7a5236'], oak: ['laminate_oak', '#b89468'], tile: ['b86_floortile', '#a89a84'], bath: ['ab_tile', '#8e8a80'], carpet: ['dn_carpet', pick(['#4a5560', '#5a5248', '#48584e'])], shop: ['store_floor', '#9a9892'] }[kind]; flat(x0, x1, z0, z1, 0.004, mat(F0[0], { to: F0[1], rough: kind === 'carpet' ? 1 : 0.45 }), g, kind === 'tile' || kind === 'bath' ? 1.1 : 1.5); };
  const skirt = () => { for (const [x0, x1, z0, z1] of [[T, U - T, V - T - 0.012, V - T], [T, T + 0.012, T, V - T], [U - T - 0.012, U - T, T, V - T]]) box(x1 - x0, 0.07, z1 - z0, trim, (x0 + x1) / 2, 0.035, (z0 + z1) / 2, g); };
  // an inner door that stays shut (stairs / back rooms): a panelled leaf in a frame
  const shutDoor = (x, z, ry, label) => { const d = new THREE.Group(); d.position.set(x, 0, z); d.rotation.y = ry; g.add(d); const wd = mat('wood_floor', { to: pick(['#7a5a3a', '#e4e0d6', '#5a4030']), rough: 0.5 }); box(0.86, 2.02, 0.04, wd, 0, 1.01, 0.03, d, 0.9); for (const [y0, y1] of [[0.2, 0.9], [1.05, 1.85]]) box(0.6, y1 - y0, 0.01, wd, 0, (y0 + y1) / 2, 0.055, d, 0.9); for (const s of [-1, 1]) box(0.06, 2.08, 0.07, trim, s * 0.46, 1.04, 0.02, d); box(0.98, 0.06, 0.07, trim, 0, 2.08, 0.02, d); const k = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 8), mat('i7_brass', { rough: 0.3, metal: 0.7 })); k.position.set(0.34, 1.0, 0.07); d.add(k);
    if (label) { const t = canvasT(256, 64, (x2, w, h) => { x2.fillStyle = '#f2efe4'; x2.fillRect(0, 0, w, h); x2.fillStyle = '#2a2a2c'; fitText(x2, label, w / 2, 36, w - 20, 30, F.label, { weight: 700 }); }); const p = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.1), new THREE.MeshStandardMaterial({ map: t, roughness: 0.6 })); p.position.set(0, 1.62, 0.062); d.add(p); } };
  const lights = [[U / 2, H - 0.35, V * 0.3], [U / 2, H - 0.35, V * 0.75]];

  if (type === 'flat') {
    // hall straight in from the door; living room + kitchen on the low-x side, bedroom + bathroom on the high-x side
    const hx0 = doorX - 0.8, hx1 = doorX + 0.8, zs = Math.max(3.4, V * 0.55), wk = pick(WOODK), mir = r() < 0.5;
    floorOf(T, hx0, T, zs, 'wood'); floorOf(hx0, hx1, T, V - T, 'oak'); floorOf(hx1, U - T, T, zs, 'wood'); floorOf(T, hx0, zs, V - T, 'tile'); floorOf(hx1, U - T, zs, V - T, 'bath'); skirt();
    wall(false, hx0, T, V - T, [[zs * 0.5 - 0.5, zs * 0.5 + 0.5], [(zs + V) / 2 - 0.5, (zs + V) / 2 + 0.5]]); wall(false, hx1, T, V - T, [[zs * 0.45 - 0.5, zs * 0.45 + 0.5], [(zs + V) / 2 - 0.45, (zs + V) / 2 + 0.45]]);
    wall(true, zs, T, hx0); wall(true, zs, hx1, U - T);
    shutDoor(doorX, V - T - 0.001, PI, 'STAIRS · RESIDENTS'); { const m = makeRug({ w: 1.0, d: 2.2, fabric: ['fb_plaid_navy', pick(RUGS)], border: '#c8c0b0' }); put(m, doorX, V * 0.45); }
    lightPanel(doorX, V * 0.5, 0.3, 0.3);
    // living room
    { const x0 = T, x1 = hx0 - T / 2, cz = (T + zs) / 2, sofa = pick(SOFAS), wide = x1 - x0 > 3.3;
      put(makeRug({ w: Math.min(2.4, x1 - x0 - 1.0), d: 1.8, fabric: ['dn_carpet', pick(RUGS)] }), (x0 + x1) / 2, cz);
      put(makeSofa({ seats: zs > 4.2 ? 3 : 2, fabric: sofa }), x0 + 0.5, cz, PI / 2); put(makeCoffeeTable({ wood: wk, w: 0.9 }), (x0 + x1) / 2 + 0.1, cz, PI / 2);
      put(makeTVStand({ wood: wk, w: 1.1 }), x1 - 0.28, cz + (zs * 0.5 > cz ? -0.9 : 0.9) * 0 + (cz > zs * 0.5 ? 0 : 0) + 1.05, -PI / 2); { const tv = makeTV({ kind: r() < 0.5 ? 'crt' : 'flat', w: 0.6 }); tv.position.set(x1 - 0.3, 0.515, cz + 1.05); tv.rotation.y = -PI / 2; g.add(tv); }
      put(makeBookshelf({ wood: wk, seed: seed + 1, w: Math.min(1.0, x1 - x0 - 1.6) }), x0 + 1.6 + (wide ? 0.3 : 0), T + 0.17, 0); put(makeLamp({ kind: 'floor', shade: '#e8d8b8' }), x0 + 0.35, T + 0.4); lightPanel((x0 + x1) / 2, cz); }
    // kitchen: a run along the back wall, table if there's room
    { const x0 = T, x1 = hx0 - T / 2, bz = V - T - 0.33; let x = x0 + 0.37; put(makeFridge(), x, bz - 0.02, PI); x += 0.36 + 0.5;
      if (x1 - x0 > 3.5) { put(makeBaseCabinet({ w: 0.6, drawers: true, wood: 'white' }), x - 0.2, bz, PI); put(makeWallCabinet({ w: 0.6 }), x - 0.2, V - T - 0.17, PI); x += 0.6; }
      put(makeBaseCabinet({ w: 1.0, sink: true, wood: 'white' }), x, bz, PI); x += 0.5 + 0.3; if (x + 0.3 < x1) { put(makeStove(), x, bz - 0.01, PI); x += 0.3; }
      const sp = new THREE.PlaneGeometry(Math.min(x1 - x0 - 0.8, 2.6), 0.5); projUV(sp, 0.6); const spm = new THREE.Mesh(sp, mat('subway_tile', { rough: 0.25 })); spm.position.set(x0 + 0.75 + sp.parameters.width / 2, 1.17, V - T - 0.003); spm.rotation.y = PI; g.add(spm);
      if (V - zs > 3.3) { put(makeKitchenTable({ w: 1.0, d: 0.7, wood: 'pine' }), (x0 + x1) / 2, zs + 1.0); put(makeChair({ wood: 'pine', seat: ['fb_plaid_red', '#a8483a'] }), (x0 + x1) / 2 - 0.2, zs + 0.4, 0); put(makeChair({ wood: 'pine', seat: ['fb_plaid_red', '#a8483a'] }), (x0 + x1) / 2 + 0.2, zs + 1.65, PI); }
      lightPanel((x0 + x1) / 2, (zs + V) / 2); }
    // bedroom
    { const x0 = hx1 + T / 2, x1 = U - T, cz = (T + zs) / 2, dbl = x1 - x0 > 3.0 && zs > 3.6;
      put(makeBed({ size: dbl ? 'double' : 'single', frame: r() < 0.3 ? 'metal' : 'wood', wood: wk, blanket: pick(BLANKETS) }), x1 - 1.08, cz, -PI / 2); put(makeNightstand({ wood: wk }), x1 - 0.3, cz + (dbl ? 1.05 : 0.8), -PI / 2); { const l = makeLamp({ kind: 'table' }); l.position.set(x1 - 0.3, 0.58, cz + (dbl ? 1.05 : 0.8)); g.add(l); }
      put(makeWardrobe({ wood: pick(['oak', 'white', 'walnut']), w: 1.0 }), x0 + 0.8, T + 0.32, 0); put(makeRug({ w: 1.6, d: 1.1, fabric: ['dn_carpet', pick(RUGS)] }), x0 + 1.2, cz + 0.2); lightPanel((x0 + x1) / 2, cz); }
    // bathroom
    { const x0 = hx1 + T / 2, x1 = U - T; put(makeBathtub(), Math.min(x1 - 0.85, x0 + 1.9), V - T - 0.38, 0); put(makeToilet(), x1 - 0.4, zs + 0.75, -PI / 2); put(makeWashbasin(), x1 - 0.32, zs + 1.7 < V - 1.3 ? zs + 1.7 : zs + 1.5, -PI / 2); { const m = makeMirror({ w: 0.5, h: 0.7 }); m.position.set(x1 - 0.015, 0, zs + 1.7 < V - 1.3 ? zs + 1.7 : zs + 1.5); m.rotation.y = -PI / 2; g.add(m); }
      { const t = makeTowelRail({}); t.position.set(x0 + 0.9, 0, zs + T / 2 + 0.003); g.add(t); } put(makeRug({ w: 0.9, d: 0.6, fabric: ['fb_fleece', '#6a9aa8'], border: '#e8e4d8' }), x0 + 1.5, V - 1.25); lightPanel((x0 + x1) / 2, (zs + V) / 2, 0.35, 0.35); }
    lights[0] = [doorX, H - 0.35, zs * 0.5]; lights[1] = [doorX, H - 0.35, (zs + V) / 2];
  } else if (type === 'studio') {
    const wk = pick(WOODK); floorOf(T, U - T, T, V - T, 'wood'); skirt();
    // washroom boxed into the back corner on the high-x side
    const bx0 = U - T - 1.9, bz0 = V - T - 2.3; wall(false, bx0, bz0, V - T, [[bz0 + 0.5, bz0 + 1.4]]); wall(true, bz0, bx0, U - T); floorOf(bx0, U - T, bz0, V - T, 'bath');
    put(makeToilet(), U - T - 0.4, V - T - 0.6, -PI / 2); put(makeWashbasin(), U - T - 0.32, bz0 + 0.6, -PI / 2); put(makeShower(), bx0 + 0.52, V - T - 0.47, 0);
    put(makeBed({ size: 'single', frame: r() < 0.5 ? 'metal' : 'wood', wood: wk, blanket: pick(BLANKETS) }), T + 0.55, V - T - 1.08, PI); put(makeNightstand({ wood: wk }), T + 1.35, V - T - 0.3, PI);
    put(makeSofa({ seats: 2, fabric: pick(SOFAS) }), T + 0.5, Math.max(1.4, V * 0.32), PI / 2); put(makeCoffeeTable({ wood: wk, w: 0.8 }), T + 1.5, Math.max(1.4, V * 0.32), PI / 2); put(makeRug({ w: 1.8, d: 1.5, fabric: ['dn_carpet', pick(RUGS)] }), T + 1.4, Math.max(1.4, V * 0.32));
    // kitchenette along the high-x wall near the front
    { const kx = U - T - 0.33; let z = T + 0.45; if (Math.abs(doorX - kx) < 1.2) z += 0; put(makeFridge(), kx - 0.02, z, -PI / 2); z += 0.36 + 0.5; put(makeBaseCabinet({ w: 1.0, sink: true, wood: 'white' }), kx, z, -PI / 2); z += 0.5 + 0.3; if (z + 0.3 < bz0 - 0.2) put(makeStove(), kx - 0.01, z, -PI / 2); }
    if (U > 5.4) { put(makeKitchenTable({ w: 0.9, d: 0.7, wood: 'pine' }), U / 2 + 0.4, V * 0.5); put(makeChair({ wood: 'pine' }), U / 2 + 0.4, V * 0.5 - 0.62, 0); }
    put(makeTVStand({ wood: wk, w: 1.0 }), T + 2.6 < bx0 - 0.6 ? T + 2.9 : T + 2.4, T + 0.24, 0); lightPanel(U / 2, V * 0.35); lightPanel(U / 2, V * 0.7);
  } else if (type === 'office') {
    floorOf(T, U - T, T, V - T, 'carpet'); skirt();
    // rows of facing workstation pairs, back wall of cabinets + boards, copier + cooler, a waiting sofa by the door
    const nx = Math.max(1, Math.floor((U - 2.2) / 1.9)), nz = V > 7.5 ? 2 : 1; let k = 0;
    for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { const x = 1.2 + i * 1.9 + (U - 2.4 - (nx - 1) * 1.9) / 2, z = 2.6 + j * 3.0; if (Math.abs(x - doorX) < 1.1 && z < 3.2) continue; put(makeWorkstation({ kind: r() < 0.5 ? 'crt' : 'flat', screen: r() < 0.5 ? 'doc' : 'sheet', seed: seed + (++k), partition: true }), x, z, PI); }
    let cx = T + 0.4; for (let i = 0; i < Math.min(4, Math.floor((U - 4) / 0.5)); i++) { put(makeFilingCabinet({ drawers: r() < 0.3 ? 2 : 4, color: pick(['#8a8c84', '#6a7a6a', '#7a7468']) }), cx, V - T - 0.33, PI); cx += 0.5; }
    { const wb = makeWhiteboard({ w: Math.min(1.8, U - cx - 1.6) }); wb.position.set(cx + 1.3, 0, V - T - 0.003); wb.rotation.y = PI; g.add(wb); } if (U > 8.5) { const cb = makeCorkBoard({}); cb.position.set(U - 1.2, 0, V - T - 0.003); cb.rotation.y = PI; g.add(cb); }
    put(makeCopier(), U - T - 0.36, V * 0.55, -PI / 2); put(makeWaterCooler(), U - T - 0.2, V * 0.55 + 1.0, -PI / 2); put(makeWasteBin(), T + 0.3, V * 0.5);
    put(makeSofa({ seats: 2, fabric: ['op_leather', '#3a3230'], cushions: [] }), doorX < U / 2 ? U - T - 0.5 : T + 0.5, 1.2, doorX < U / 2 ? -PI / 2 : PI / 2);
    shutDoor(U * 0.75, V - T - 0.001, PI, 'STAFF ONLY'); for (let x = 1.5; x < U - 1; x += 3) { lightPanel(x, V * 0.35, 0.25, 1.6); lightPanel(x, V * 0.75, 0.25, 1.6); }
  } else if (type === 'clinic') {
    // reception + waiting at the front, a ward behind a partition wall: beds with curtains along the back wall
    floorOf(T, U - T, T, V - T, 'bath'); skirt(); const zp = 4.4; wall(true, zp, T, U - T, [[doorX - 0.9, doorX + 0.9]]);
    put(makeReceptionDesk({ w: Math.min(2.6, U - 5), sign: 'RECEPTION' }), doorX < U / 2 ? doorX + 2.6 : doorX - 2.6, 3.2, PI); put(makeWaitingChairs({ n: 4 }), doorX < U / 2 ? U - 1.6 : 1.6, 0.5, 0); put(makeWaitingChairs({ n: 3, color: '#3a7a6a' }), doorX < U / 2 ? T + 0.35 : U - T - 0.35, 2.4, doorX < U / 2 ? PI / 2 : -PI / 2);
    put(makeWheelchair(), doorX + (doorX < U / 2 ? -1.6 : 1.6), 2.0, 0.8); { const sg = makeWallSign('WARD', { w: 1.2, h: 0.3, bg: '#2a6a5a' }); sg.position.set(doorX, 2.3, zp - T / 2 - 0.002); sg.rotation.y = PI; g.add(sg); }
    const nb = Math.max(2, Math.floor((U - 1.0) / 2.3)); for (let i = 0; i < nb; i++) { const x = 1.0 + (i + 0.5) * (U - 1.4) / nb; put(makeHospitalBed({ curtain: pick(['#8ab8c8', '#a8c8a8', '#c8b8d8']), blanket: pick(['#c8dce8', '#d8e8d0', '#e8dcc8']) }), x, V - T - 1.12, PI); if (i % 2 === 0) put(makeDripStand(), x - 0.75, V - T - 0.5); }
    put(makeTrolley(), U / 2 + 0.6, zp + 1.3, 0.4); put(makeLockers({ n: 2, color: '#e4e0d6' }), T + 0.27, zp + 0.9, PI / 2);
    for (let x = 1.6; x < U - 1; x += 2.8) { lightPanel(x, 2.2, 0.25, 1.4); lightPanel(x, (zp + V) / 2, 0.25, 1.4); } lights[0] = [U / 2, H - 0.35, 2.2]; lights[1] = [U / 2, H - 0.35, (zp + V) / 2];
  } else if (type === 'police') {
    // front counter behind glass, benches for the public, two desks, lockers, a holding cell in the back corner
    floorOf(T, U - T, T, V - T, 'shop'); skirt(); const cw = Math.min(3.4, U - 4.5), cx = doorX < U / 2 ? U - T - 0.6 - cw / 2 : T + 0.6 + cw / 2;
    put(makeFrontCounter({ w: cw, sign: 'FRONT DESK' }), cx, 3.3, PI); put(makeWaitingChairs({ n: 3, color: '#4a5a6a' }), doorX < U / 2 ? U - 1.4 : 1.4, 0.5, 0);
    { const cb = makeWallSign('ELM COUNTY POLICE', { w: Math.min(3.2, cw), h: 0.36, bg: '#16243a', sub: 'to protect the Loop' }); cb.position.set(cx, 2.25, V - T - 0.002); cb.rotation.y = PI; g.add(cb); }
    put(makeHoldingCell({ w: 2.4, d: 2.2 }), T + 1.22, V - T - 1.12, PI); put(makeLockers({ n: 4, color: '#4a5a6e' }), U - T - 0.25, V - 2.0, -PI / 2);
    put(makeWorkstation({ kind: 'crt', screen: 'doc', seed: seed + 1 }), U / 2 + 1.2, V - 2.6, PI); if (U > 9) put(makeWorkstation({ kind: 'flat', screen: 'sheet', seed: seed + 2 }), U / 2 - 0.7, V - 2.6, PI); put(makeFilingCabinet({ drawers: 4, color: '#5a6470' }), U / 2 + 2.6 < U - 1 ? U / 2 + 2.6 : U / 2 + 0.2, V - T - 0.33, PI);
    { const b = makeCorkBoard({ w: 1.0 }); b.position.set(doorX < U / 2 ? T + 0.003 : U - T - 0.003, 0, 2.0); b.rotation.y = doorX < U / 2 ? PI / 2 : -PI / 2; g.add(b); } put(makeWaterCooler(), doorX < U / 2 ? T + 0.2 : U - T - 0.2, 3.6, doorX < U / 2 ? PI / 2 : -PI / 2);
    for (let x = 1.6; x < U - 1; x += 2.8) { lightPanel(x, V * 0.3, 0.25, 1.4); lightPanel(x, V * 0.72, 0.25, 1.4); }
  } else if (type === 'school') {
    // one classroom: chalkboard + teacher's desk at the back wall, rows of desks facing it, lockers down a side wall
    floorOf(T, U - T, T, V - T, 'oak'); skirt(); { const cb = makeChalkboard({ w: Math.min(3.4, U - 3) }); cb.position.set(U / 2, 0, V - T - 0.003); cb.rotation.y = PI; g.add(cb); } put(makeTeacherDesk(), U / 2 + 1.6 < U - 1.2 ? U / 2 + 1.6 : U / 2, V - T - 1.25, PI);
    const nc = Math.max(2, Math.floor((U - 2.6) / 1.15)), nr = Math.max(2, Math.floor((V - 5.0) / 1.35)); for (let j = 0; j < nr; j++) for (let i = 0; i < nc; i++) { const x = 1.6 + i * 1.15 + (U - 3.2 - (nc - 1) * 1.15) / 2, z = 2.2 + j * 1.35; if (Math.abs(x - doorX) < 0.9 && z < 2.6) continue; put(makeStudentDesk(), x, z, PI); }
    put(makeLockers({ n: Math.min(6, Math.floor((V - 3) / 0.38)), color: pick(['#5a7a8a', '#8a5a4a', '#5a8a6a']) }), T + 0.25, V / 2 + 0.4, PI / 2); { const b = makeCorkBoard({ w: 1.2 }); b.position.set(U - T - 0.003, 0, V / 2); b.rotation.y = -PI / 2; g.add(b); } put(makeWasteBin(), U - T - 0.3, V - 0.6);
    for (let x = 1.6; x < U - 1; x += 2.8) { lightPanel(x, V * 0.3, 0.25, 1.4); lightPanel(x, V * 0.72, 0.25, 1.4); }
  } else {   // shop
    floorOf(T, U - T, T, V - T, 'shop'); const cols3 = ['#c8281e', '#2a6ad8', '#f2c21a', '#2a8a4a', '#e8742a', '#7a3a8a', '#f4f2ea', '#1a1a1c', '#3aa8b8'];
    // gondolas: steel uprights + four shelves, stocked with instanced boxes + tins
    const items = []; const gondola = (x, z0, z1) => { const st = mat('gf_galv', { to: '#b8bcc0', rough: 0.4, metal: 0.5 }); box(0.08, 1.5, z1 - z0, st, x, 0.75, (z0 + z1) / 2, g); box(0.7, 0.1, z1 - z0, plain('#3a3c40'), x, 0.05, (z0 + z1) / 2, g); for (let s = 0; s < 4; s++) { const y = 0.14 + s * 0.36; box(0.66, 0.02, z1 - z0 - 0.04, st, x, y, (z0 + z1) / 2, g); for (const sd of [-1, 1]) { let z = z0 + 0.08; while (z < z1 - 0.12) { const w = 0.07 + r() * 0.07, h = 0.12 + r() * 0.16, col = pick(cols3), n = 1 + Math.floor(r() * 3); for (let q = 0; q < n && z < z1 - 0.12; q++) { items.push([x + sd * 0.19, y + 0.01 + h / 2, z + w / 2, 0.2, h, w, col]); z += w + 0.012; } } } } cols.push([x - 0.36, x + 0.36, z0, z1]); };
    const ng = Math.max(1, Math.floor((U - 3.0) / 2.0)); for (let i = 0; i < ng; i++) { const x = 1.9 + i * 2.0 + (U - 3.8 - (ng - 1) * 2.0) / 2; if (Math.abs(x - doorX) < 0.9) continue; gondola(x, 1.7, V - 2.6); }
    // wall shelving down the low-x wall
    for (let s = 0; s < 4; s++) { const y = 0.3 + s * 0.42; box(0.3, 0.025, V - 3.2, mat('wood_floor', { to: '#b08660', rough: 0.5 }), T + 0.15, y, V / 2 - 0.3, g, 0.9); let z = 1.5; while (z < V - 1.9) { const w = 0.08 + r() * 0.08, h = 0.14 + r() * 0.2; items.push([T + 0.16, y + 0.013 + h / 2, z + w / 2, 0.2, h, w, pick(cols3)]); z += w + 0.015; } } cols.push([T, T + 0.32, 1.3, V - 1.9]);
    { const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), plain('#ffffff', { roughness: 0.55 }), items.length), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color(); items.forEach(([x, y, z, sx, sy, sz, col], i) => { m4.compose(V3(x, y, z), q, V3(sx, sy, sz)); im.setMatrixAt(i, m4); im.setColorAt(i, c.set(col).multiplyScalar(0.75 + r() * 0.4)); }); g.add(im); }
    // counter across the back with a till, a shut stock-room door behind it
    { const cw = Math.min(3.2, U - 2.4), cx = U - T - 0.6 - cw / 2, cz = V - T - 1.5, top = mat('laminate_oak', { to: '#b89468', rough: 0.45 }); box(cw, 0.92, 0.6, mat('wood_floor', { to: '#6a4a30', rough: 0.5 }), cx, 0.46, cz, g, 0.9); box(cw + 0.06, 0.04, 0.68, top, cx, 0.94, cz, g, 0.9); cols.push([cx - cw / 2, cx + cw / 2, cz - 0.34, cz + 0.34]);
      const till = new THREE.Group(); till.position.set(cx + cw / 2 - 0.5, 0.96, cz); till.rotation.y = PI; g.add(till); rbox(0.36, 0.14, 0.38, 0.02, plain('#3a3c40', { roughness: 0.4 }), 0, 0.07, 0, till); const kp = rbox(0.3, 0.02, 0.2, 0.006, plain('#d8d8d2', { roughness: 0.5 }), 0, 0.16, 0.06, till); kp.rotation.x = 0.35; box(0.22, 0.12, 0.03, plain('#1a2a1a', { roughness: 0.3, emissive: '#0a3a14' }), 0, 0.22, -0.13, till);
      shutDoor(Math.min(U - 1.0, cx), V - T - 0.001, PI, 'STOCK ROOM'); }
    for (let x = 1.6; x < U - 1; x += 2.6) { lightPanel(x, V * 0.3, 0.25, 1.4); lightPanel(x, V * 0.7, 0.25, 1.4); }
  }
  g.userData = { colliders: cols, lights, type };
  return g;
}
