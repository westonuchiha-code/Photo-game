// City district (town expansion). A street grid east of the old town, lined with generated buildings dressed in
// the user's wall photos (brick, stucco, sandstone, tile, plaster, siding), with lit windows from the blinds
// photo, made-up shopfronts on the ground floors, photo-asphalt roads, raised sidewalks, street lamps and trees.
// Beyond it a ring of far towers and low hills so the world never ends at a void.
// Everything is merged per material, so the whole district is a few dozen draw calls.
//   makeDistrict()  world coordinates (no transform needed). userData:
//     areas      walkable rects (streets + sidewalks)
//     floorY(x, z) -> 0.14 on a sidewalk, else null
//     lots       reserved lots { id, x0, x1, z0, z1, face } kept free for hand-built places
//     views      a few camera views
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { streetTreeParts, placeStreetTrees } from './trees.js';
import { F, fitText } from '../fonts.js';

// ---- layout ---------------------------------------------------------------------------------------------------
export const GRID = {
  xs: [75, 161, 245, 329, 413],   // N-S street centre lines (75 = the avenue next to the old town)
  zs: [-168, -84, 0, 84, 168],    // E-W street centre lines
  road: 5, walk: 7,               // half-widths: road, road + sidewalk
  ring: { n: 212, s: -212, e: 462, hw: 9 },   // Elm Loop, the boulevard round the district (see roads.js): centre lines + half-width
};
const SW_H = 0.14;                // sidewalk top
// reserved lots: kept empty of generated buildings (front = the street side)
export const LOTS = [
  { id: 'dentist', x0: 82, x1: 108, z0: 28, z1: 50, face: 'w', built: true },   // Brightwater Dental (item 57)
  { id: 'lotB', x0: 82, x1: 104, z0: -50, z1: -30, face: 'w', built: true },   // utility + parking lot (item 59)
  { id: 'lotC', x0: 175, x1: 195, z0: 91, z1: 115, face: 'n', built: true },   // Cedar Self Storage (item 62)
  { id: 'store', x0: 168, x1: 184, z0: -17, z1: -7, face: 's', built: true },        // corner store (item 64)
  { id: 'aircraft', x0: 252, x1: 266, z0: 7, z1: 21, face: 'n', built: true },     // aircraft-nose carport (item 64)
  { id: 'gallery', x0: 336, x1: 352, z0: 7, z1: 19, face: 'n', built: true },   // art gallery (item 68)
  { id: 'warehouse', x0: 266, x1: 306, z0: 91, z1: 124, face: 'n', built: true },  // Bulk Barn warehouse store (item 69)
  { id: 'pottery', x0: 99, x1: 112, z0: -16, z1: -7, face: 's', built: true },     // Kiln & Co. pottery (item 70)
  { id: 'izakaya', x0: 112, x1: 121, z0: -15, z1: -7, face: 's', built: true },    // old izakaya (item 70)
  { id: 'ruins', x0: 122, x1: 154, z0: -22, z1: -7, face: 's', built: true },      // aqueduct garden + plaza (item 70)
  { id: 'pinkhouse', x0: 168, x1: 182, z0: 63, z1: 77, face: 's', built: true },   // pink bungalow (item 71)
  { id: 'arcade', x0: 336, x1: 368, z0: 91, z1: 112, face: 'n', built: true },   // Pixel Den arcade + shutter stall (item 72)
  { id: 'temple', x0: 378, x1: 408, z0: -40, z1: -7, face: 's', built: true },   // lantern temple (item 72)
  { id: 'fair', x0: 176, x1: 236, z0: 128, z1: 161, face: 's', built: true },   // fairgrounds (item 72)
  { id: 'oldtown', x0: 252, x1: 322, z0: -101, z1: -91, face: 's', built: true },   // old-town shop row (item 73)
  { id: 'pocketpark', x0: 268, x1: 308, z0: -77, z1: -60, face: 'n', built: true },   // pocket park (item 73)
  { id: 'nakamachi', x0: 252, x1: 266, z0: -77, z1: -60, face: 'n', built: true },   // Nakamachi Arcade mall passage (item 75)
  { id: 'keigarage', x0: 183, x1: 190, z0: 70, z1: 77, face: 's', built: true },   // kei car garage (item 76)
  { id: 'hearth', x0: 258, x1: 290, z0: 136, z1: 161, face: 's', built: true },   // Hearth Market (item 77)
  { id: 'calzone', x0: 300, x1: 312, z0: 150, z1: 161, face: 's', built: true },   // Calzone Kid takeout (item 80)
  { id: 'lotD', x0: 210, x1: 236, z0: -31, z1: -7, face: 's', built: true },   // canal walkway park (item 67)
];

function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const _L = new THREE.TextureLoader();
function tex(name, color = true) { const t = _L.load(`assets/textures/${name}.png`); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; if (color) t.colorSpace = THREE.SRGBColorSpace; return t; }

// facade photos: file, tile size (m), normal map?
const FACADES = [
  ['wall_red_brick', 0.86, 0.61, true], ['wall_gray_brick', 0.67, 1.2, true], ['wall_gray_tile', 0.8, 0.94, true],
  ['wall_olive_stucco', 1.5, 1.5, true], ['wall_teal_stucco', 1.5, 1.5, true], ['wall_red_sandstone', 1.6, 2.0, true],
  ['hs_brick', 1.0, 0.7, false], ['hs_ybrick', 1.0, 0.7, false], ['sg_darkbrick', 1.0, 0.7, false], ['ab_stucco', 1.6, 1.6, false],
  ['th_plaster', 1.6, 1.6, false], ['hs_siding', 1.6, 1.2, false], ['cy_brick', 1.0, 0.7, false], ['concrete_cracked', 2.2, 2.2, false],
  // texture library (item 60): tan stucco, stacked-stone veneer, white ribbed metal panels (normal maps named <file>_n)
  ['tx_stucco', 1.8, 1.8, 'tx_stucco_n'], ['tx_stone', 1.0, 2.0, 'tx_stone_n'], ['tx_fins', 1.2, 1.2, 'tx_fins_n'],
];

// small parts that share the one vertex-coloured 'det' material (colour per part, linear RGB)
const DET = Object.fromEntries(Object.entries({ frame: '#3a3c42', iron: '#232326', trim: '#e8e4da', shut0: '#4a7a5a', shut1: '#4a6a94', shut2: '#c8b08a', equip: '#a8aaac', tank: '#a07a54', riser: '#7aa09a' }).map(([k, v]) => { const c = new THREE.Color(v); return [k, [c.r, c.g, c.b]]; }));
// ---- geometry helpers: quads / boxes with world-metre UVs, collected per material ------------------------------
class Bin {
  constructor() { this.parts = new Map(); }
  push(key, geo) { const dc = DET[key]; if (dc) { const n = geo.attributes.position.count, c = new Float32Array(n * 3); for (let i = 0; i < n; i++) { c[i * 3] = dc[0]; c[i * 3 + 1] = dc[1]; c[i * 3 + 2] = dc[2]; } geo.setAttribute('color', new THREE.BufferAttribute(c, 3)); key = 'det'; }
    if (this.tag) key += '@' + this.tag; if (!this.parts.has(key)) this.parts.set(key, []); this.parts.get(key).push(geo); }   // (tag: buildings are merged per block, so whole blocks cull)
}
// a vertical quad from (x0,z0) to (x1,z1) along the ground, y from ya to yb, normal to the right of the a->b
// direction... we pass the outward normal explicitly. UV: u along the wall (m / tw), v up (m / th) with offsets
function wallQuad(ax, az, bx, bz, ya, yb, tw, th, u0 = 0, v0 = 0, uvRect = null) {
  const g = new THREE.BufferGeometry(); const L = Math.hypot(bx - ax, bz - az);
  g.setAttribute('position', new THREE.Float32BufferAttribute([ax, ya, az, bx, ya, bz, bx, yb, bz, ax, yb, az], 3));
  const nx = -(bz - az) / L, nz = (bx - ax) / L;   // front-face normal of the a, b, b', a' winding
  g.setAttribute('normal', new THREE.Float32BufferAttribute([nx, 0, nz, nx, 0, nz, nx, 0, nz, nx, 0, nz], 3));
  let uv;
  if (uvRect) { const [ua, va, ub, vb] = uvRect; uv = [ua, va, ub, va, ub, vb, ua, vb]; }
  else uv = [u0 / tw, (ya + v0) / th, (u0 + L) / tw, (ya + v0) / th, (u0 + L) / tw, (yb + v0) / th, u0 / tw, (yb + v0) / th];
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex([0, 1, 2, 0, 2, 3]); return g;
}
function flatQuad(x0, x1, z0, z1, y, tw = 1, th = 1) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([x0, y, z1, x1, y, z1, x1, y, z0, x0, y, z0], 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0], 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute([x0 / tw, z1 / th, x1 / tw, z1 / th, x1 / tw, z0 / th, x0 / tw, z0 / th], 2));
  g.setIndex([0, 1, 2, 0, 2, 3]); return g;
}
function boxGeo(x0, x1, y0, y1, z0, z1, tw = 1, th = 1) {
  const g = new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0); g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  const uv = g.attributes.uv; const sx = (x1 - x0) / tw, sy = (y1 - y0) / th, sz = (z1 - z0) / tw;
  // BoxGeometry face order: +x, -x, +y, -y, +z, -z (4 verts each)
  const sc = [[sz, sy], [sz, sy], [sx, sz], [sx, sz], [sx, sy], [sx, sy]];
  for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) * sc[f][0], uv.getY(i) * sc[f][1]); }
  return g;
}

// ---- shopfront atlas (drawn here: made-up names, lit interiors) -----------------------------------------------
const SHOPS = [
  ['HANA NOODLE', '#b8262a', '#f6e6c8', F.brush], ['BLUE DOOR CAFE', '#1f4f8a', '#f2f2ea', F.roman], ['QUICK WASH LAUNDRY', '#2a8ac8', '#ffffff', F.label],
  ['MAPLE HARDWARE', '#2f5a2a', '#f2e6c0', F.heavy], ['LUCKY 8 MART', '#d8262a', '#ffe14a', F.heavy], ['PIXEL GAMES', '#141414', '#3ae0ff', F.retro],
  ['SUNNY FLOWERS', '#f2c21a', '#3a2a10', F.marker], ['IRON & OAK BARBER', '#1c1c1c', '#e8c878', F.roman], ['GOOD DAY PHARMACY', '#f2f4f2', '#1a7a4a', F.label],
  ['TOWN BOOKS', '#5a2a1a', '#f2dcb0', F.roman], ['RED LANTERN', '#7a1414', '#ffcf6a', F.brush], ['ELM ST. TAILOR', '#2a2a3a', '#d8d0c0', F.roman],
  ['MOONLIGHT DINER', '#1a2a4a', '#ff7aa8', F.retro], ['FRESH CUTS', '#e8e4dc', '#c8262a', F.heavy], ['VIDEO RENT 24', '#f2d21a', '#1a3aa8', F.heavy], ['FOR LEASE', '#d8d4c8', '#1a1a1a', F.label],
];
let _shop = null;
function shopAtlas() {
  if (_shop) return _shop;
  const c = document.createElement('canvas'); c.width = 2048; c.height = 1024; const x = c.getContext('2d');
  const e = document.createElement('canvas'); e.width = 2048; e.height = 1024; const ex = e.getContext('2d');
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  const te = new THREE.CanvasTexture(e); te.colorSpace = THREE.SRGBColorSpace;
  const draw = () => { drawShops(x, ex); t.needsUpdate = true; te.needsUpdate = true; };
  draw(); if (document.fonts) document.fonts.ready.then(draw);
  _shop = { map: t, emit: te }; return _shop;
}
function drawShops(x, ex) {
  const r = rng(11); ex.fillStyle = '#000'; ex.fillRect(0, 0, 2048, 1024);
  SHOPS.forEach(([name, band, ink, font], i) => {
    const ox = (i % 4) * 512, oy = Math.floor(i / 4) * 256, lease = name === 'FOR LEASE';
    // storefront: sign band (top 22%), glass with a lit interior, mullions, a door
    x.fillStyle = '#26272a'; x.fillRect(ox, oy, 512, 256);
    x.fillStyle = band; x.fillRect(ox + 6, oy + 6, 500, 52);
    x.fillStyle = ink; fitText(x, name, ox + 256, oy + 34, 470, 40, font, { spacing: 2 });
    const gi = x.createLinearGradient(0, oy + 64, 0, oy + 250);
    if (lease) { gi.addColorStop(0, '#2a2c30'); gi.addColorStop(1, '#141518'); }
    else { const warm = r() < 0.6; gi.addColorStop(0, warm ? '#ffe2a8' : '#e8f2ff'); gi.addColorStop(1, warm ? '#b07a3a' : '#7a8aa0'); }
    x.fillStyle = gi; x.fillRect(ox + 10, oy + 66, 492, 184);
    if (!lease) {   // shelves / counter silhouettes inside
      x.fillStyle = 'rgba(40,30,20,0.45)'; for (let k = 0; k < 4; k++) x.fillRect(ox + 30 + k * 120, oy + 120 + (k % 2) * 20, 70, 130);
      x.fillStyle = 'rgba(255,255,255,0.25)'; x.fillRect(ox + 10, oy + 66, 492, 6);
    } else {        // a paper sign in the glass
      x.fillStyle = '#f4f2ea'; x.fillRect(ox + 150, oy + 110, 212, 100); x.fillStyle = '#c81e28'; fitText(x, 'FOR LEASE', ox + 256, oy + 145, 190, 34, F.heavy); x.fillStyle = '#222'; fitText(x, '(555) 014-2290', ox + 256, oy + 185, 190, 24, F.label);
    }
    x.strokeStyle = '#1a1a1c'; x.lineWidth = 8; for (const mx of [ox + 180, ox + 330]) { x.beginPath(); x.moveTo(mx, oy + 66); x.lineTo(mx, oy + 252); x.stroke(); }
    x.fillStyle = 'rgba(20,20,22,0.6)'; x.fillRect(ox + 200, oy + 96, 112, 156);   // door
    x.fillStyle = '#c8c8c0'; x.fillRect(ox + 296, oy + 170, 6, 26);
    if (!lease) { ex.drawImage(x.canvas, ox, oy, 512, 256, ox, oy, 512, 256); ex.fillStyle = 'rgba(0,0,0,0.45)'; ex.fillRect(ox + 10, oy + 66, 492, 184); }
    else { ex.fillStyle = '#404040'; ex.fillRect(ox + 150, oy + 110, 212, 100); }
  });
}
const shopUV = (i) => { const q = i % 4, r = Math.floor(i / 4); return [q / 4, 1 - (r + 1) / 4, (q + 1) / 4, 1 - r / 4]; };
const winUV = (i) => { const q = i % 4, r = Math.floor(i / 4); return [q / 4 + 0.002, 1 - (r + 1) / 4 + 0.002, (q + 1) / 4 - 0.002, 1 - r / 4 - 0.002]; };

// ---- one generated building -----------------------------------------------------------------------------------
// footprint x0..x1, z0..z1; front faces the street on side `face` (n = -z, s = +z, w = -x, e = +x);
// `street` = which sides are on a street (get windows); r = random
// every generated building gets a real doorway in its street front (interiors are built on demand: src/interiors.js)
// a quad through four points (any orientation), wound to face `want`; UVs in metres along its two edges
function quad4(p, want, tw = 1, th = 1) {
  const e1 = [p[1][0] - p[0][0], p[1][1] - p[0][1], p[1][2] - p[0][2]], e2 = [p[3][0] - p[0][0], p[3][1] - p[0][1], p[3][2] - p[0][2]];
  let n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]]; const nl = Math.hypot(...n) || 1; n = n.map((v) => v / nl);
  const flip = n[0] * want[0] + n[1] * want[1] + n[2] * want[2] < 0, l1 = Math.hypot(...e1) / tw, l2 = Math.hypot(...e2) / th; if (flip) n = n.map((v) => -v);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p.flat(), 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute([...n, ...n, ...n, ...n], 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, l1, 0, l1, l2, 0, l2], 2)); g.setIndex(flip ? [0, 2, 1, 0, 3, 2] : [0, 1, 2, 0, 2, 3]); return g;
}
// a box-section bar from p to q (w wide, h deep), for stairs, braces and rails
function barGeo(p, q, w, h) { const a = new THREE.Vector3(...p), c = new THREE.Vector3(...q), d = c.clone().sub(a), g = new THREE.BoxGeometry(w, d.length(), h); g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize())); const m = a.add(c).multiplyScalar(0.5); g.translate(m.x, m.y, m.z); return g; }
const cylGeo = (r0, r1, h, x, y, z, seg = 12) => { const g = new THREE.CylinderGeometry(r0, r1, h, seg); g.translate(x, y + h / 2, z); return g; };
// what kind of building a facade material makes: decides the windows, trim and roofline
const STYLE = { wall_red_brick: 'brick', wall_gray_brick: 'brick', hs_brick: 'brick', hs_ybrick: 'brick', sg_darkbrick: 'brick', cy_brick: 'brick', wall_olive_stucco: 'stucco', wall_teal_stucco: 'stucco', ab_stucco: 'stucco', th_plaster: 'stucco', tx_stucco: 'stucco',
  wall_red_sandstone: 'stone', tx_stone: 'stone', wall_gray_tile: 'stone', concrete_cracked: 'modern', tx_fins: 'modern', hs_siding: 'modern' };

export const DOOR = { w: 1.1, h: 2.15 };
const BUILDINGS = [];
function building(bin, b, r) {
  const { x0, x1, z0, z1, face, floors, fac, shop } = b;
  const [file, tw, th] = FACADES[fac], style = STYLE[file] || 'brick', FK = 'f' + fac;
  const GF = 3.8, FH = 3.2, H = GF + (floors - 1) * FH, PAR = 0.7;
  const sides = { n: [x1, z0, x0, z0], s: [x0, z1, x1, z1], w: [x0, z0, x0, z1], e: [x1, z1, x1, z0] };   // a->b so the wall faces outward
  { const [ax, az, bx, bz] = sides[face]; const L = Math.hypot(bx - ax, bz - az); const n = Math.max(1, Math.floor((L - 1.2) / 2.6)), step = L / n;
    b.doorU = shop >= 0 ? L - 1.3 : step * (Math.floor(n / 2) + 0.5); b.L = L; b.front = [ax, az, bx, bz]; b.index = BUILDINGS.length; BUILDINGS.push(b); }
  const d = rng(b.index * 9973 + 17);   // detail choices (separate from r, which lays the town out)
  const shutters = style === 'stucco' && d() < 0.5 ? 'shut' + Math.floor(d() * 3) : null, balconies = style === 'stucco' && floors >= 3 && d() < 0.45, escape = style === 'brick' && floors >= 3 && floors <= 7 && d() < 0.6, awning = shop >= 0 && d() < 0.45 ? 'awn' + Math.floor(d() * 4) : null, acs = d() < 0.5;
  // a wall's own frame: u along it, y up, o outward
  const kit = (k) => { const [ax, az, bx, bz] = sides[k], L = Math.hypot(bx - ax, bz - az), dx = (bx - ax) / L, dz = (bz - az) / L, nx = -dz, nz = dx, uo = (ax + az) * 0.37 % 7, P = (u, o = 0) => [ax + dx * u + nx * o, az + dz * u + nz * o];
    const K = { L, P, n: [nx, 0, nz], t: [dx, 0, dz],
      Q: (u0, u1, y0, y1, o, key, uv) => { const [px, pz] = P(u0, o), [qx, qz] = P(u1, o); bin.push(key, uv ? wallQuad(px, pz, qx, qz, y0, y1, 1, 1, 0, 0, uv) : wallQuad(px, pz, qx, qz, y0, y1, tw, th, uo + u0)); },
      BX: (u0, u1, y0, y1, o0, o1, key, tile = 1) => { const [px, pz] = P(u0, o0), [qx, qz] = P(u1, o1); bin.push(key, boxGeo(Math.min(px, qx), Math.max(px, qx), y0, y1, Math.min(pz, qz), Math.max(pz, qz), tile, tile)); },
      V: (u, y, o) => { const [x, z] = P(u, o); return [x, y, z]; },
      // the four inner faces of an opening cut `dep` into the wall
      reveal: (u0, u1, y0, y1, dep, key = FK) => { const V = K.V; bin.push(key, quad4([V(u0, y0, 0), V(u0, y0, -dep), V(u0, y1, -dep), V(u0, y1, 0)], [dx, 0, dz], tw, th)); bin.push(key, quad4([V(u1, y0, 0), V(u1, y0, -dep), V(u1, y1, -dep), V(u1, y1, 0)], [-dx, 0, -dz], tw, th));
        bin.push(key, quad4([V(u0, y1, 0), V(u1, y1, 0), V(u1, y1, -dep), V(u0, y1, -dep)], [0, -1, 0], tw, th)); bin.push(key, quad4([V(u0, y0, 0), V(u1, y0, 0), V(u1, y0, -dep), V(u0, y0, -dep)], [0, 1, 0], tw, th)); },
      // the wall itself, laid round its openings [{u0, u1, y0, y1}]
      wall: (ya, yb, ops) => { const ys = [...new Set([ya, yb, ...ops.flatMap((o) => [o.y0, o.y1])].filter((y) => y >= ya && y <= yb))].sort((p, q) => p - q);
        for (let i = 0; i < ys.length - 1; i++) { const a = ys[i], c = ys[i + 1], act = ops.filter((o) => o.y0 <= a + 1e-6 && o.y1 >= c - 1e-6).sort((p, q) => p.u0 - q.u0); let u = 0; for (const o of act) { if (o.u0 > u + 1e-4) K.Q(u, o.u0, a, c, 0, FK); u = Math.max(u, o.u1); } if (L > u + 1e-4) K.Q(u, L, a, c, 0, FK); } } };
    return K; };
  // ---- roof: deck, parapet with coping, then what stands on it
  bin.push('roof', flatQuad(x0, x1, z0, z1, H + 0.05, 4, 4));
  const capM = 0.12, cw = 0.35, ct = H + PAR, cb = H + PAR + 0.18;
  bin.push('cap', boxGeo(x0 - capM, x1 + capM, ct, cb, z0 - capM, z0 + cw, 1, 1)); bin.push('cap', boxGeo(x0 - capM, x1 + capM, ct, cb, z1 - cw, z1 + capM, 1, 1));
  bin.push('cap', boxGeo(x0 - capM, x0 + cw, ct, cb, z0 + cw, z1 - cw, 1, 1)); bin.push('cap', boxGeo(x1 - cw, x1 + capM, ct, cb, z0 + cw, z1 - cw, 1, 1));
  for (const [ax, az, bx, bz] of [[x0 + cw, z0 + cw, x1 - cw, z0 + cw], [x1 - cw, z1 - cw, x0 + cw, z1 - cw], [x0 + cw, z1 - cw, x0 + cw, z0 + cw], [x1 - cw, z0 + cw, x1 - cw, z1 - cw]]) bin.push('cap', wallQuad(ax, az, bx, bz, H + 0.05, ct, 1, 1));   // inner parapet faces
  if (r() < 0.7) { const cx = x0 + 1.5 + r() * Math.max(0.5, x1 - x0 - 4), cz = z0 + 1.5 + r() * Math.max(0.5, z1 - z0 - 4), w = 1.6 + r(), h = 1.0 + r() * 0.6, dd = 1.2 + r(); bin.push('equip', boxGeo(cx, cx + w, H + 0.15, H + 0.15 + h, cz, cz + dd, 1, 1));
    bin.push('iron', boxGeo(cx - 0.05, cx + w + 0.05, H, H + 0.15, cz + 0.1, cz + 0.25)); bin.push('iron', boxGeo(cx - 0.05, cx + w + 0.05, H, H + 0.15, cz + dd - 0.25, cz + dd - 0.1)); bin.push('iron', cylGeo(Math.min(w, dd) * 0.36, Math.min(w, dd) * 0.36, 0.06, cx + w / 2, H + 0.15 + h, cz + dd / 2, 14)); }   // an air handler on rails, its fan on top
  if (floors > 4 && r() < 0.4) { const cx = x0 + 2 + r() * Math.max(0.5, x1 - x0 - 6), cz = z0 + 2 + r() * Math.max(0.5, z1 - z0 - 6); bin.push('equip', boxGeo(cx, cx + 3, H, H + 2.6, cz, cz + 3, 1, 1)); for (let i = 0; i < 6; i++) bin.push('iron', boxGeo(cx - 0.02, cx + 3.02, H + 0.5 + i * 0.3, H + 0.56 + i * 0.3, cz - 0.03, cz + 3.03)); }   // a louvred plant room
  { const rx0 = x0 + 1, rx1 = x1 - 1, rz0 = z0 + 1, rz1 = z1 - 1, at = () => [rx0 + d() * Math.max(0.1, rx1 - rx0 - 3), rz0 + d() * Math.max(0.1, rz1 - rz0 - 3)];
    if (floors >= 3) { const [sx, sz] = at(); bin.push(FK, boxGeo(sx, sx + 2.4, H, H + 2.5, sz, sz + 2.8, tw, th)); bin.push('cap', boxGeo(sx - 0.1, sx + 2.5, H + 2.5, H + 2.62, sz - 0.1, sz + 2.9)); bin.push('frame', boxGeo(sx + 0.7, sx + 1.7, H + 0.05, H + 2.1, sz + 2.8, sz + 2.84)); }   // the stair bulkhead + its door
    if (floors >= 4 && d() < 0.45) { const [tx, tz] = at(), R = 1.15, ty = H + 1.9; for (const [lx, lz] of [[-0.8, -0.8], [0.8, -0.8], [-0.8, 0.8], [0.8, 0.8]]) bin.push('iron', boxGeo(tx + 1.2 + lx - 0.06, tx + 1.2 + lx + 0.06, H, ty, tz + 1.2 + lz - 0.06, tz + 1.2 + lz + 0.06));
      bin.push('iron', boxGeo(tx + 0.3, tx + 2.1, ty - 0.12, ty, tz + 0.3, tz + 2.1)); bin.push('tank', cylGeo(R, R * 0.94, 2.2, tx + 1.2, ty, tz + 1.2, 16)); bin.push('tank', cylGeo(0.05, R + 0.12, 0.7, tx + 1.2, ty + 2.2, tz + 1.2, 16)); for (const hy of [0.4, 1.1, 1.8]) bin.push('iron', cylGeo(R + 0.015, R + 0.015, 0.05, tx + 1.2, ty + hy, tz + 1.2, 16)); }   // a wooden water tank
    for (let i = 0, n = 1 + Math.floor(d() * 3); i < n; i++) { const [vx, vz] = at(); bin.push('equip', cylGeo(0.12, 0.12, 0.7 + d() * 0.5, vx, H, vz, 8)); bin.push('equip', cylGeo(0.2, 0.2, 0.08, vx, H + 0.75, vz, 8)); }   // vent stacks
    if (d() < 0.4) { const [mx, mz] = at(); bin.push('iron', boxGeo(mx, mx + 0.05, H, H + 3.4, mz, mz + 0.05)); for (const [hy, hw] of [[2.6, 0.7], [2.9, 0.55], [3.2, 0.4]]) bin.push('iron', boxGeo(mx - hw, mx + hw, H + hy, H + hy + 0.03, mz, mz + 0.03)); } }   // an aerial
  // ---- walls
  for (const k of ['n', 's', 'w', 'e']) {
    const K = kit(k), L = K.L;
    if (!b.street.includes(k)) { K.Q(0, L, 0, H + PAR, 0, FK); continue; }
    const isFront = k === face, n = Math.max(1, Math.floor((L - 1.2) / 2.6)), step = L / n, modern = style === 'modern';
    const ww = modern ? Math.min(2.2, step * 0.82) : style === 'brick' ? Math.min(1.25, step * 0.55) : Math.min(1.4, step * 0.58), wh = modern ? 1.6 : style === 'brick' ? 1.9 : 1.7, dep = modern ? 0.22 : 0.16, ops = [], wins = [];
    for (let f = 1; f < floors; f++) { const y = GF + (f - 1) * FH + (style === 'brick' ? 0.7 : 0.8); for (let i = 0; i < n; i++) { const u = step * (i + 0.5), lit = r() < 0.32, cell = lit ? Math.floor(r() * 7) : 7 + Math.floor(r() * 9); wins.push({ u0: u - ww / 2, u1: u + ww / 2, y0: y, y1: y + wh, cell, f, i }); } }
    let shopOp = null;
    if (isFront && shop >= 0) { const sw = Math.max(2.5, Math.min(L - 0.8 - 1.9, 11)), u0 = Math.max(0.4, (L - 1.9 - sw) / 2); shopOp = { u0, u1: u0 + sw, y0: SW_H, y1: 3.5 }; ops.push(shopOp); }
    else for (let i = 0; i < n; i++) { const u = step * (i + 0.5), cell = r() < 0.25 ? Math.floor(r() * 7) : 7 + Math.floor(r() * 9); if (isFront && Math.abs(u - b.doorU) < 0.01) continue; wins.push({ u0: u - ww / 2, u1: u + ww / 2, y0: 1.1, y1: 2.9, cell, f: 0, i }); }
    if (isFront) ops.push({ u0: b.doorU - DOOR.w / 2, u1: b.doorU + DOOR.w / 2, y0: 0, y1: SW_H + DOOR.h, door: true });
    ops.push(...wins); K.wall(0, H + PAR, ops);
    // windows: glass set back in the wall, reveals, a frame, a sill; then each style's own dressing
    for (const w of wins) { const { u0, u1, y0, y1 } = w, panes = modern ? 2 : 1, pw = (u1 - u0) / panes;
      for (let q = 0; q < panes; q++) K.Q(u0 + q * pw, u0 + (q + 1) * pw, y0, y1, -dep, 'win', winUV(q ? (w.cell + 3) % 16 < 7 === w.cell < 7 ? (w.cell + 3) % 16 : w.cell : w.cell));
      K.reveal(u0, u1, y0, y1, dep, modern ? 'frame' : FK); const fo = -dep + 0.01, f1 = -dep + 0.06, fk = modern ? 'frame' : 'trim';
      const FQ = (a0, a1, b0, b1) => K.Q(a0, a1, b0, b1, f1, fk, [0, 0, 1, 1]); FQ(u0, u0 + 0.06, y0, y1); FQ(u1 - 0.06, u1, y0, y1); FQ(u0 + 0.06, u1 - 0.06, y1 - 0.06, y1); FQ(u0 + 0.06, u1 - 0.06, y0, y0 + 0.06);
      if (modern) FQ(u0 + pw - 0.035, u0 + pw + 0.035, y0 + 0.06, y1 - 0.06); else { FQ((u0 + u1) / 2 - 0.022, (u0 + u1) / 2 + 0.022, y0 + 0.06, y1 - 0.06); FQ(u0 + 0.06, u1 - 0.06, (y0 + y1) / 2 - 0.022, (y0 + y1) / 2 + 0.022); }
      if (!modern) K.BX(u0 - 0.09, u1 + 0.09, y0 - 0.11, y0, -0.03, 0.1, 'capd');
      if (style === 'brick') { K.BX(u0 - 0.14, u1 + 0.14, y1, y1 + 0.24, 0, 0.045, 'capd'); K.BX((u0 + u1) / 2 - 0.09, (u0 + u1) / 2 + 0.09, y1 - 0.02, y1 + 0.3, 0.045, 0.075, 'capd'); }   // stone lintel + keystone
      if (style === 'stucco') { K.BX(u0 - 0.1, u0, y0, y1 + 0.1, 0, 0.05, 'trim'); K.BX(u1, u1 + 0.1, y0, y1 + 0.1, 0, 0.05, 'trim'); K.BX(u0 - 0.14, u1 + 0.14, y1, y1 + 0.14, 0, 0.08, 'trim');
        if (shutters) for (const s of [-1, 1]) { const a = s < 0 ? u0 - 0.12 - ww * 0.46 : u1 + 0.12; K.BX(a, a + ww * 0.46, y0, y1, 0, 0.045, shutters); for (let l = 0; l < 3; l++) K.BX(a + 0.04, a + ww * 0.46 - 0.04, y0 + 0.14 + l * (wh - 0.2) / 3, y0 + 0.14 + (l + 0.8) * (wh - 0.2) / 3, 0.045, 0.058, shutters); } }
      if (style === 'stone') { K.BX(u0 - 0.12, u1 + 0.12, y1, y1 + 0.18, 0, 0.1, 'capd'); K.BX(u0 - 0.2, u1 + 0.2, y1 + 0.18, y1 + 0.26, 0, 0.16, 'capd'); K.BX(u0 - 0.12, u0, y0, y1, 0, 0.06, 'capd'); K.BX(u1, u1 + 0.12, y0, y1, 0, 0.06, 'capd'); }   // a surround with a hood
      if (balconies && w.f >= 1 && (w.i + w.f) % 2 === 0) { const a = u0 - 0.35, c = u1 + 0.35, by = y0 - 0.75; K.BX(a, c, by - 0.12, by, 0, 0.85, 'cap'); for (const [p, q2] of [[a, a + 0.04], [c - 0.04, c]]) { K.BX(p, q2, by + 0.95, by + 1.0, 0, 0.85, 'iron'); K.BX(p, q2, by, by + 0.06, 0, 0.85, 'iron'); } K.BX(a, c, by + 0.95, by + 1.0, 0.81, 0.85, 'iron'); K.BX(a, c, by, by + 0.06, 0.81, 0.85, 'iron');
        for (let t = a + 0.02; t < c; t += 0.2) K.BX(t, t + 0.025, by, by + 0.97, 0.82, 0.845, 'iron'); for (let t = 0.2; t < 0.8; t += 0.27) for (const p of [a + 0.01, c - 0.035]) K.BX(p, p + 0.025, by, by + 0.97, t, t + 0.025, 'iron'); }
      else if (acs && w.f >= 1 && (w.i * 7 + w.f * 3 + b.index) % 5 === 0) { K.BX((u0 + u1) / 2 - 0.36, (u0 + u1) / 2 + 0.36, y0, y0 + 0.42, -0.05, 0.38, 'equip'); K.BX((u0 + u1) / 2 - 0.3, (u0 + u1) / 2 + 0.3, y0 + 0.05, y0 + 0.37, 0.38, 0.39, 'iron'); } }   // a window air conditioner
    // ---- the base: a plinth course either side of the door / shopfront
    { const gaps = ops.filter((o) => o.y0 < 0.6).sort((p, q) => p.u0 - q.u0); let u = 0; for (const o of gaps) { if (o.u0 - 0.1 > u + 0.05) K.BX(u, o.u0 - 0.1, 0, 0.55, 0, 0.06, 'cap'); u = o.u1 + 0.1; } if (L > u + 0.05) K.BX(u, L, 0, 0.55, 0, 0.06, 'cap'); }
    // ---- the shopfront: pilasters, a tiled stall riser, glass set back behind mullions, a sign fascia, maybe an awning
    if (shopOp) { const { u0, u1 } = shopOp, sw = u1 - u0, [ua, va, ub, vb] = shopUV(shop), sd = 0.4, gy0 = SW_H + 0.5, gy1 = 2.72, vs = va + (vb - va) * 0.78;
      K.reveal(u0, u1, SW_H, 3.5, sd, 'frame'); K.BX(u0, u1, SW_H, gy0, -sd, -sd + 0.14, 'riser', 0.6); K.BX(u0, u1, gy0, gy0 + 0.05, -sd, -sd + 0.2, 'cap');
      K.Q(u0, u1, gy0, gy1, -sd + 0.05, 'shop', [ua + 0.02 * (ub - ua), va + (vb - va) * 0.03, ub - 0.02 * (ub - ua), vs]); K.BX(u0, u1, gy1, 3.5, -sd, -sd + 0.1, 'frame');
      for (const m of [0, 180 / 512, 330 / 512, 1]) { const mu = u0 + 0.05 + m * (sw - 0.1); K.BX(mu - 0.04, mu + 0.04, gy0, gy1, -sd + 0.04, -sd + 0.13, 'frame'); } K.BX(u0, u1, gy1 - 0.04, gy1 + 0.04, -sd + 0.04, -sd + 0.13, 'frame');
      for (const pu of [u0 - 0.32, u1 + 0.02]) { K.BX(pu, pu + 0.3, 0, 3.5, 0, 0.1, 'cap'); K.BX(pu - 0.04, pu + 0.34, 0, 0.3, 0, 0.14, 'cap'); K.BX(pu - 0.04, pu + 0.34, 3.3, 3.5, 0, 0.14, 'cap'); }
      K.BX(u0 - 0.36, u1 + 0.36, 2.78, 3.48, -0.02, 0.16, 'frame'); K.Q(u0 - 0.3, u1 + 0.3, 2.82, 3.44, 0.165, 'shop', [ua + 0.012 * (ub - ua), vs + (vb - va) * 0.015, ub - 0.012 * (ub - ua), vb - (vb - va) * 0.025]); K.BX(u0 - 0.4, u1 + 0.4, 3.48, 3.56, -0.02, 0.24, 'cap');
      if (awning) { const V = K.V, a = u0 - 0.2, c = u1 + 0.2, yt = 2.74, yb = 2.28, out = 1.25; bin.push(awning, quad4([V(a, yb, out), V(c, yb, out), V(c, yt, 0.17), V(a, yt, 0.17)], [K.n[0], 1, K.n[2]], 1, 1)); bin.push(awning, quad4([V(a, yb - 0.2, out), V(c, yb - 0.2, out), V(c, yb, out), V(a, yb, out)], K.n, 1, 1));
        for (const e of [a, c]) { bin.push('iron', barGeo(V(e, yb, out), V(e, yt, 0.17), 0.03, 0.03)); bin.push('iron', barGeo(V(e, yb, out), V(e, yb - 0.02, 0.05), 0.03, 0.03)); } }
      else for (let t = u0 + 0.6; t < u1; t += 1.9) { bin.push('iron', barGeo(K.V(t, 3.5, 0.1), K.V(t, 3.78, 0.5), 0.025, 0.025)); bin.push('iron', barGeo(K.V(t, 3.78, 0.5), K.V(t, 3.62, 0.62), 0.025, 0.025)); const [gx, gz] = K.P(t, 0.62); bin.push('iron', cylGeo(0.03, 0.13, 0.12, gx, 3.5, gz, 8)); bin.push('glow', cylGeo(0.05, 0.05, 0.03, gx, 3.48, gz, 6)); } }   // gooseneck sign lamps
    // ---- the door: frame, threshold, a hood on brackets, a lamp beside it
    if (isFront) { const d0 = b.doorU - DOOR.w / 2, d1 = b.doorU + DOOR.w / 2, top = SW_H + DOOR.h; K.BX(d0 - 0.09, d0, 0, top + 0.09, -0.1, 0.1, 'cap'); K.BX(d1, d1 + 0.09, 0, top + 0.09, -0.1, 0.1, 'cap'); K.BX(d0, d1, top, top + 0.09, -0.1, 0.1, 'cap'); K.BX(d0, d1, 0, SW_H + 0.012, -0.5, 0.1, 'cap'); K.reveal(d0, d1, SW_H, top, 0.5);
      if (shop < 0) { K.BX(d0 - 0.3, d1 + 0.3, top + 0.22, top + 0.32, 0, 0.6, style === 'modern' ? 'frame' : 'cap'); if (style !== 'modern') for (const e of [d0 - 0.24, d1 + 0.16]) { K.BX(e, e + 0.08, top - 0.1, top + 0.22, 0, 0.12, 'cap'); bin.push('cap', barGeo(K.V(e + 0.04, top - 0.08, 0.1), K.V(e + 0.04, top + 0.2, 0.5), 0.07, 0.07)); } K.BX(d0 - 0.2, d1 + 0.2, 0, SW_H + 0.1, 0.1, 0.5, 'cap'); }
      const lu = d0 - 0.4; K.BX(lu - 0.05, lu + 0.05, top - 0.35, top - 0.3, 0, 0.14, 'iron'); K.BX(lu - 0.06, lu + 0.06, top - 0.3, top - 0.08, 0.06, 0.18, 'glow'); K.BX(lu - 0.08, lu + 0.08, top - 0.08, top - 0.04, 0.04, 0.2, 'iron'); }
    // ---- the band over the ground floor, then each style's own roofline + vertical dressing
    K.BX(0, L, GF - 0.25, GF, 0, 0.18, 'cap'); K.BX(0, L, GF - 0.33, GF - 0.25, 0, 0.1, 'cap');
    if (style === 'brick') { K.BX(0, L, H + PAR - 0.5, H + PAR - 0.32, 0, 0.14, 'cap'); K.BX(0, L, H + PAR - 0.32, H + PAR - 0.06, 0, 0.3, 'cap'); K.BX(0, L, H + PAR - 0.06, H + PAR + 0.02, 0, 0.38, 'cap'); for (let t = 0.25; t < L - 0.25; t += 0.72) K.BX(t, t + 0.24, H + PAR - 0.5, H + PAR - 0.32, 0.14, 0.26, 'capd');   // a bracketed cornice
      for (let f = 2; f < floors; f++) K.BX(0, L, GF + (f - 1) * FH - 0.06, GF + (f - 1) * FH + 0.06, 0, 0.035, FK, tw); }
    if (style === 'stucco') { const V = K.V, ye = H + PAR + 0.1; bin.push('tile', quad4([V(-0.1, ye - 0.55, 0.7), V(L + 0.1, ye - 0.55, 0.7), V(L + 0.1, ye, 0), V(-0.1, ye, 0)], [K.n[0], 1, K.n[2]], 1.2, 1.2)); bin.push('cap', quad4([V(-0.1, ye - 0.55, 0.7), V(L + 0.1, ye - 0.55, 0.7), V(L + 0.1, ye - 0.62, 0.02), V(-0.1, ye - 0.62, 0.02)], [0, -1, 0], 1, 1)); K.BX(-0.1, L + 0.1, ye - 0.62, ye - 0.52, 0.66, 0.72, 'cap');
      for (let t = 0.3; t < L; t += 1.6) bin.push('capd', barGeo(V(t, ye - 0.95, 0.03), V(t, ye - 0.6, 0.6), 0.09, 0.09)); }   // a tiled pent eave on brackets
    if (style === 'stone') { for (let i = 0; i <= n; i++) { const u = Math.min(L - 0.42, Math.max(0, step * i - 0.21)); K.BX(u, u + 0.42, GF, H + PAR - 0.6, 0, 0.12, FK, tw); K.BX(u - 0.05, u + 0.47, GF, GF + 0.3, 0, 0.17, 'cap'); K.BX(u - 0.05, u + 0.47, H + PAR - 0.9, H + PAR - 0.6, 0, 0.17, 'cap'); }
      K.BX(0, L, H + PAR - 0.6, H + PAR - 0.3, 0, 0.22, 'cap'); K.BX(0, L, H + PAR - 0.3, H + PAR + 0.04, 0, 0.42, 'cap'); for (let f = 2; f < floors; f++) K.BX(0, L, GF + (f - 1) * FH - 0.09, GF + (f - 1) * FH + 0.09, 0, 0.07, 'cap');
      if (isFront && L > 8) { K.BX(L / 2 - 2.2, L / 2 + 2.2, H + PAR + 0.18, H + PAR + 0.75, -0.3, 0.05, FK, tw); K.BX(L / 2 - 1.3, L / 2 + 1.3, H + PAR + 0.75, H + PAR + 1.2, -0.3, 0.05, FK, tw); K.BX(L / 2 - 2.3, L / 2 + 2.3, H + PAR + 0.72, H + PAR + 0.8, -0.34, 0.1, 'cap'); K.BX(L / 2 - 1.4, L / 2 + 1.4, H + PAR + 1.2, H + PAR + 1.3, -0.34, 0.1, 'cap'); } }   // pilasters, courses, a stepped pediment
    if (modern) { for (let i = 0; i <= n; i++) { const u = Math.min(L - 0.14, Math.max(0, step * i - 0.07)); K.BX(u, u + 0.14, GF, H + PAR, 0, 0.3, 'cap'); } for (let f = 1; f < floors; f++) K.BX(0, L, GF + (f - 1) * FH + 0.32, GF + (f - 1) * FH + 0.42, 0, 0.12, 'frame'); }   // fins + slab edges
    for (const e of [0.12, L - 0.2]) { if (d() < 0.5) continue; const [px, pz] = K.P(e + 0.04, 0.1); bin.push('iron', cylGeo(0.05, 0.05, H + PAR - 0.4, px, 0.2, pz, 8)); for (let y = 2.5; y < H; y += 3.2) K.BX(e - 0.03, e + 0.11, y, y + 0.05, 0, 0.17, 'iron'); }   // rainwater pipes
    // ---- a fire escape down the front of a brick walk-up: landings, rails, stairs between, a drop ladder
    if (escape && isFront && n >= 2) { const i0 = Math.max(0, Math.min(n - 2, Math.floor(n / 2) - (shop >= 0 ? 0 : 1) + (shop < 0 && n > 2 ? 2 : 0) > n - 2 ? 0 : Math.floor(n / 2) - 1)), a = step * (i0 + 0.5) - ww / 2 - 0.35, c = step * (i0 + 1.5) + ww / 2 + 0.35, W = 1.0, V = K.V;
      for (let f = 1; f < floors; f++) { const y = GF + (f - 1) * FH + 0.55; K.BX(a, c, y - 0.05, y, 0, W, 'iron'); 
        for (const hy of [0.5, 1.0]) { K.BX(a, c, y + hy - 0.02, y + hy + 0.02, W - 0.04, W, 'iron'); K.BX(a, a + 0.04, y + hy - 0.02, y + hy + 0.02, 0, W, 'iron'); K.BX(c - 0.04, c, y + hy - 0.02, y + hy + 0.02, 0, W, 'iron'); }
        for (let t = a; t <= c + 0.01; t += (c - a) / 6) K.BX(Math.min(t, c - 0.03), Math.min(t, c - 0.03) + 0.03, y, y + 1.0, W - 0.04, W - 0.01, 'iron'); for (const e of [a, c - 0.05]) bin.push('iron', barGeo(V(e + 0.025, y - 0.05, W - 0.05), V(e + 0.025, y - 0.7, 0.03), 0.04, 0.04));
        if (f < floors - 1) { const s0 = V(a + 0.5, y, W * 0.5), s1 = V(c - 0.5, y + FH, W * 0.5); for (const o of [-0.26, 0.26]) bin.push('iron', barGeo([s0[0] + K.n[0] * o, s0[1], s0[2] + K.n[2] * o], [s1[0] + K.n[0] * o, s1[1], s1[2] + K.n[2] * o], 0.05, 0.12)); for (let q = 1; q < 9; q++) { const t = q / 9, ux = a + 0.5 + (c - a - 1) * t; K.BX(ux - 0.11, ux + 0.11, y + FH * t - 0.02, y + FH * t + 0.01, W * 0.5 - 0.26, W * 0.5 + 0.26, 'iron'); } } }
      const y1 = GF + 0.55; for (const o of [0, 0.42]) K.BX(a + 0.2 + o, a + 0.24 + o, y1 - 1.9, y1 + 0.9, W - 0.1, W - 0.06, 'iron'); for (let y = y1 - 1.8; y < y1 + 0.9; y += 0.3) K.BX(a + 0.2, a + 0.66, y, y + 0.03, W - 0.1, W - 0.06, 'iron'); }
  }
}

// fill one side of a block with buildings. The frontage runs a..b along the street; depth goes inward.
function fillFrontage(bin, r, side, bx0, bx1, bz0, bz1, a, b, depth, blockStreets, skip, tallness) {
  let t = a;
  while (t < b - 3) {
    let w = 7 + r() * 9; if (b - t - w < 6) w = b - t;
    const lo = t, hi = t + w; t = hi + 0.0;
    let fp;
    if (side === 'n') fp = { x0: lo, x1: hi, z0: bz0, z1: bz0 + depth };
    if (side === 's') fp = { x0: lo, x1: hi, z0: bz1 - depth, z1: bz1 };
    if (side === 'w') fp = { x0: bx0, x1: bx0 + depth, z0: lo, z1: hi };
    if (side === 'e') fp = { x0: bx1 - depth, x1: bx1, z0: lo, z1: hi };
    if (skip.some((l) => fp.x0 < l.x1 && fp.x1 > l.x0 && fp.z0 < l.z1 && fp.z1 > l.z0)) continue;
    const street = [side]; // plus exposed ends on the block corners
    if (blockStreets.includes('w') && Math.abs(fp.x0 - bx0) < 0.01 && side !== 'w') street.push('w');
    if (blockStreets.includes('e') && Math.abs(fp.x1 - bx1) < 0.01 && side !== 'e') street.push('e');
    if (blockStreets.includes('n') && Math.abs(fp.z0 - bz0) < 0.01 && side !== 'n') street.push('n');
    if (blockStreets.includes('s') && Math.abs(fp.z1 - bz1) < 0.01 && side !== 's') street.push('s');
    const floors = Math.max(2, Math.round(2 + r() * 3 + (r() < 0.18 ? 3 + r() * 5 : 0) * tallness));
    building(bin, { ...fp, face: side, floors, fac: Math.floor(r() * FACADES.length), shop: r() < 0.7 ? Math.floor(r() * 15) : -1, street }, r);
  }
}
let _blk = 0;
function fillBlock(bin, r, bx0, bx1, bz0, bz1, streets, tallness = 1) {
  bin.tag = 'b' + (_blk++); try { fillBlock0(bin, r, bx0, bx1, bz0, bz1, streets, tallness); } finally { bin.tag = ''; }
}
function fillBlock0(bin, r, bx0, bx1, bz0, bz1, streets, tallness) {
  const D = 16;
  // n and s rows run the full width; w and e rows fill between them
  if (streets.includes('n')) fillFrontage(bin, r, 'n', bx0, bx1, bz0, bz1, bx0, bx1, D, streets, LOTS, tallness);
  if (streets.includes('s')) fillFrontage(bin, r, 's', bx0, bx1, bz0, bz1, bx0, bx1, D, streets, LOTS, tallness);
  const za = streets.includes('n') ? bz0 + D : bz0, zb = streets.includes('s') ? bz1 - D : bz1;
  if (streets.includes('w')) fillFrontage(bin, r, 'w', bx0, bx1, bz0, bz1, za, zb, D, streets, LOTS, tallness);
  if (streets.includes('e')) fillFrontage(bin, r, 'e', bx0, bx1, bz0, bz1, za, zb, D, streets, LOTS, tallness);
}

export function makeDistrict() {
  BUILDINGS.length = 0; _blk = 0;
  const g = new THREE.Group(); g.name = 'city_district';
  const bin = new Bin(); const r = rng(2026);
  const { xs, zs, road: RH, walk: WH } = GRID;
  const XMIN = xs[0] - WH, XMAX = xs[xs.length - 1] + WH, ZMIN = zs[0] - WH, ZMAX = zs[zs.length - 1] + WH;
  // ---- blocks between the streets
  for (let i = 0; i < xs.length - 1; i++) for (let j = 0; j < zs.length - 1; j++)
    fillBlock(bin, r, xs[i] + WH, xs[i + 1] - WH, zs[j] + WH, zs[j + 1] - WH, ['n', 's', 'w', 'e'], 1 + 0.4 * (i === 1 || i === 2 ? 1 : 0));
  // ---- outer rows facing in: past the east street, beyond the north/south edge streets, and the avenue's west side
  // (the outer rows stop either side of every street, which runs on through them to Elm Loop)
  const spans = (a, b, cuts) => { const out = []; let p = a; for (const c of cuts) { if (c - WH - p > 8) out.push([p, c - WH]); p = Math.max(p, c + WH); } if (b - p > 8) out.push([p, b]); return out; };
  for (const [a, b] of spans(ZMIN, ZMAX, zs)) fillBlock(bin, r, XMAX, XMAX + 16, a, b, ['w'], 0.6);
  for (const [a, b] of spans(XMIN, XMAX, xs)) fillBlock(bin, r, a, b, ZMIN - 16, ZMIN, ['s'], 0.6);
  for (const [a, b] of spans(XMIN, XMAX, xs)) fillBlock(bin, r, a, b, ZMAX, ZMAX + 16, ['n'], 0.6);
  fillBlock(bin, r, 50, XMIN, ZMIN, -70, ['e'], 0.6);
  fillBlock(bin, r, 50, XMIN, 14, ZMAX, ['e'], 0.6);

  // ---- streets: roads (segments between intersections + the intersections), sidewalks, curbs, markings
  const segs = []; // [x0,x1,z0,z1] road rects
  for (const x of xs) { let za = ZMIN + 2; for (const z of zs) { if (z - RH > za) segs.push([x - RH, x + RH, za, z - RH]); za = z + RH; } if (ZMAX - 2 > za) segs.push([x - RH, x + RH, za, ZMAX - 2]); }
  for (const z of zs) { let xa = xs[0] + RH; for (const x of xs.slice(1)) { segs.push([xa, x - RH, z - RH, z + RH]); xa = x + RH; } }
  for (const x of xs) for (const z of zs) segs.push([x - RH, x + RH, z - RH, z + RH]);
  // the E-W main street at z = 0 also runs west from the avenue into the old town's road
  segs.push([62.4, xs[0] - RH, -RH, RH]);
  // connectors out to Elm Loop: each N-S street north + south, each E-W street east
  const RG = GRID.ring, cut = (list, a, b, gaps, w) => { let p = a; for (const g0 of gaps) { if (g0 - w > p) list.push([p, g0 - w]); p = g0 + w; } if (b > p) list.push([p, b]); };
  for (const x of xs) { segs.push([x - RH, x + RH, ZMAX - 2, RG.n - RG.hw + 0.05]); segs.push([x - RH, x + RH, RG.s + RG.hw - 0.05, ZMIN + 2]); }
  for (const z of zs) segs.push([XMAX - 2, RG.e - RG.hw + 0.05, z - RH, z + RH]);
  for (const [a, b, c, d] of segs) bin.push('asphalt', flatQuad(a, b, c, d, 0.012, 3, 3));
  // sidewalk rings around every block + outer strips, as raised slabs with a concrete curb face
  const walks = [];
  for (let i = 0; i < xs.length - 1; i++) for (let j = 0; j < zs.length - 1; j++) {
    const bx0 = xs[i] + RH, bx1 = xs[i + 1] - RH, bz0 = zs[j] + RH, bz1 = zs[j + 1] - RH, w = WH - RH;
    walks.push([bx0, bx1, bz0, bz0 + w], [bx0, bx1, bz1 - w, bz1], [bx0, bx0 + w, bz0 + w, bz1 - w], [bx1 - w, bx1, bz0 + w, bz1 - w]);
  }
  { const ew = [], ns = [], ss = []; cut(ew, ZMIN, ZMAX, zs, RH); cut(ns, XMIN, XMAX, xs, RH); cut(ss, XMIN, XMAX, xs, RH);
    for (const [a, b] of ew) walks.push([XMAX - 2, XMAX, a, b]); for (const [a, b] of ss) walks.push([a, b, ZMIN, ZMIN + 2]); for (const [a, b] of ns) walks.push([a, b, ZMAX - 2, ZMAX]);
    // sidewalks along the connectors, through the outer rows
    for (const x of xs) for (const sd of [-1, 1]) { const a = x + sd * RH, b = x + sd * WH; walks.push([Math.min(a, b), Math.max(a, b), ZMAX, ZMAX + 16], [Math.min(a, b), Math.max(a, b), ZMIN - 16, ZMIN]); }
    for (const z of zs) for (const sd of [-1, 1]) { const a = z + sd * RH, b = z + sd * WH; walks.push([XMAX, XMAX + 16, Math.min(a, b), Math.max(a, b)]); } }
  walks.push([XMIN, XMIN + 2, ZMIN + 2, -RH], [XMIN, XMIN + 2, RH, ZMAX - 2]);   // avenue west sidewalk (gap where the main street comes in)
  for (const [a, b, c, d] of walks) { bin.push('walk', flatQuad(a, b, c, d, SW_H, 2, 2)); bin.push('curb', boxGeo(a, b, 0, SW_H - 0.005, c, d, 1, 1)); }
  // lane markings: dashed centre lines, stop bars and zebra crosswalks at every intersection
  for (const x of xs) for (let z = ZMIN + 4; z < ZMAX - 4; z += 6) { if (zs.some((q) => Math.abs(z - q) < RH + 4)) continue; bin.push('paint_y', flatQuad(x - 0.08, x + 0.08, z, z + 3, 0.02)); }
  for (const z of zs) for (let x = xs[0] + RH + 4; x < XMAX - 4; x += 6) { if (xs.some((q) => Math.abs(x - q) < RH + 4)) continue; bin.push('paint_y', flatQuad(x, x + 3, z - 0.08, z + 0.08, 0.02)); }
  for (const x of xs) for (const z of zs) {
    for (let k = -4; k <= 4; k++) {
      const o = k * 1.0; // zebra stripes 0.5 m wide across each approach
      bin.push('paint_w', flatQuad(x + o - 0.25, x + o + 0.25, z - RH - 3.2, z - RH - 0.6, 0.021));
      bin.push('paint_w', flatQuad(x + o - 0.25, x + o + 0.25, z + RH + 0.6, z + RH + 3.2, 0.021));
      bin.push('paint_w', flatQuad(x - RH - 3.2, x - RH - 0.6, z + o - 0.25, z + o + 0.25, 0.021));
      bin.push('paint_w', flatQuad(x + RH + 0.6, x + RH + 3.2, z + o - 0.25, z + o + 0.25, 0.021));
    }
  }

  // ---- reserved lots, for now vacant: cracked concrete pad, a chain-link fence on posts along the street side
  // with a gate gap, and a lease board
  for (const L of LOTS) {
    if (L.built) continue;
    bin.push('lot', flatQuad(L.x0, L.x1, L.z0, L.z1, 0.02, 2.4, 2.4));
    const [ax, az, bx, bz] = { w: [L.x0, L.z0, L.x0, L.z1], e: [L.x1, L.z1, L.x1, L.z0], n: [L.x1, L.z0, L.x0, L.z0], s: [L.x0, L.z1, L.x1, L.z1] }[L.face];
    const len = Math.hypot(bx - ax, bz - az), dx = (bx - ax) / len, dz = (bz - az) / len;
    for (const [u0, u1] of [[0, len / 2 - 2], [len / 2 + 2, len]]) {
      const p0 = [ax + dx * u0, az + dz * u0], p1 = [ax + dx * u1, az + dz * u1];
      bin.push('fence', wallQuad(p0[0], p0[1], p1[0], p1[1], SW_H, SW_H + 2.0, 1, 1, 0, 0, [0, 0, (u1 - u0) / 0.6, 2.0 / 0.6]));
      bin.push('fence', wallQuad(p1[0], p1[1], p0[0], p0[1], SW_H, SW_H + 2.0, 1, 1, 0, 0, [0, 0, (u1 - u0) / 0.6, 2.0 / 0.6]));
      for (let u = u0; u <= u1 + 0.01; u += Math.max(1, (u1 - u0) / Math.ceil((u1 - u0) / 3))) { const px = ax + dx * u, pz = az + dz * u; bin.push('post', boxGeo(px - 0.03, px + 0.03, 0, SW_H + 2.1, pz - 0.03, pz + 0.03)); }
    }
    const sx = ax + dx * (len / 2 - 4), sz = az + dz * (len / 2 - 4);
    bin.push('lease', wallQuad(sx - dx * 1.1, sz - dz * 1.1, sx + dx * 1.1, sz + dz * 1.1, SW_H + 0.7, SW_H + 1.8, 1, 1, 0, 0, [0, 0, 1, 1]));
    bin.push('lease', wallQuad(sx + dx * 1.1, sz + dz * 1.1, sx - dx * 1.1, sz - dz * 1.1, SW_H + 0.7, SW_H + 1.8, 1, 1, 0, 0, [0, 0, 1, 1]));
  }

  // ---- far towers (ring outside the walkable town) and hills
  const far = [];
  for (let k = 0; k < 900 && far.length < 260; k++) {
    const a = r() * Math.PI * 2, d = 300 + r() * 650, cx = 180 + Math.cos(a) * d, cz = Math.sin(a) * d;
    if (cx > -100 && cx < 660 && cz > GRID.ring.s - 40 && cz < GRID.ring.n + 40) continue;   // keep out of the town, its rows, Elm Loop + the stunt lot
    if (cx > -110 && cx < 80 && cz > -90 && cz < 100) continue;                       // and the old town
    const w = 14 + r() * 26, dd = 14 + r() * 26, h = 14 + r() * r() * 95;
    const fg = boxGeo(cx - w / 2, cx + w / 2, 0, h, cz - dd / 2, cz + dd / 2, 16, 16); const fu = fg.attributes.uv, ou = r(), ov = r(); for (let q = 0; q < fu.count; q++) fu.setXY(q, fu.getX(q) + ou, fu.getY(q) + ov); far.push(fg);
  }
  far.forEach((f) => bin.push('far', f));
  const hills = new THREE.CylinderGeometry(1, 1, 1, 128, 6, true); const hp = hills.attributes.position;
  for (let i = 0; i < hp.count; i++) { const x = hp.getX(i), y = hp.getY(i) + 0.5, z = hp.getZ(i), a = Math.atan2(z, x); const R = 1500 + 120 * Math.sin(a * 5) + 60 * Math.sin(a * 13 + 1); const h = (60 + 50 * Math.sin(a * 3 + 2) + 30 * Math.sin(a * 11)) * y; hp.setXYZ(i, x * R, h - 5, z * R); }
  hills.translate(180, 0, 0); hills.computeVertexNormals();

  // ---- materials + merge
  const facMats = FACADES.map(([file, , , n]) => new THREE.MeshStandardMaterial({ map: tex(file), normalMap: n ? tex(typeof n === 'string' ? n : file + '_normal', false) : null, normalScale: new THREE.Vector2(0.6, 0.6), roughness: 0.9 }));
  const win = new THREE.MeshStandardMaterial({ map: tex('city_windows'), emissiveMap: tex('city_windows_e'), emissive: '#ffffff', emissiveIntensity: 0.9, roughness: 0.25, metalness: 0.1 });
  const sa = shopAtlas();
  const MATS = {
    roof: new THREE.MeshStandardMaterial({ map: tex('b83_gravel'), normalMap: tex('b83_gravel_n', false), color: '#5a5c60', roughness: 0.95 }),   // ballasted flat roofs
    cap: new THREE.MeshStandardMaterial({ map: tex('lot_concrete'), normalMap: tex('lot_concrete_normal', false), color: '#c4beb2', roughness: 0.8 }),   // parapet caps + cornices: cast concrete
    equip: new THREE.MeshStandardMaterial({ map: tex('b85_zinc'), normalMap: tex('b85_zinc_n', false), color: '#a8aaac', roughness: 0.55, metalness: 0.5 }),   // rooftop units: galvanised sheet
    win, shop: new THREE.MeshStandardMaterial({ map: sa.map, emissiveMap: sa.emit, emissive: '#ffffff', emissiveIntensity: 0.7, roughness: 0.3 }),
    asphalt: new THREE.MeshStandardMaterial({ map: tex('city_asphalt'), color: '#7a7c80', roughness: 0.92 }),
    walk: new THREE.MeshStandardMaterial({ map: tex('sidewalk'), normalMap: tex('sidewalk_normal', false), color: '#a8a49c', roughness: 0.9 }),
    curb: new THREE.MeshStandardMaterial({ map: tex('b83_curb'), normalMap: tex('b83_curb_n', false), color: '#b4b2ac', roughness: 0.9 }),
    paint_y: new THREE.MeshStandardMaterial({ color: '#d8b02a', roughness: 0.7 }),
    paint_w: new THREE.MeshStandardMaterial({ color: '#d8d8d2', roughness: 0.7 }),
    far: new THREE.MeshStandardMaterial({ map: tex('city_far'), emissiveMap: tex('city_far_e'), emissive: '#ffffff', emissiveIntensity: 0.55, roughness: 0.9, color: '#9a9aa0' }),
  };
  facMats.forEach((m, i) => { MATS['f' + i] = m; });
  // the modelled dressing: window frames + shop metalwork, painted trim, ironwork, shutters, awnings, tank staves, eave tiles
  const tint = (file, color, o = {}) => new THREE.MeshStandardMaterial({ map: tex(file), color, roughness: 0.7, ...o });
  Object.assign(MATS, { det: new THREE.MeshStandardMaterial({ map: tex('b82_whitewash'), vertexColors: true, roughness: 0.65, metalness: 0.15 }), capd: MATS.cap, tile: tint('shr_roof', '#c8846a', { roughness: 0.85, side: THREE.DoubleSide }), glow: new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 1.9, 1.1), toneMapped: false }) });
  ['#a8322a', '#2e5a3a', '#2a4a7a', '#c8962a'].forEach((col, i) => { const c = document.createElement('canvas'); c.width = 64; c.height = 8; const x = c.getContext('2d'); x.fillStyle = col; x.fillRect(0, 0, 64, 8); x.fillStyle = '#efe9da'; x.fillRect(0, 0, 32, 8); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1.6, 1); t.colorSpace = THREE.SRGBColorSpace; MATS['awn' + i] = new THREE.MeshStandardMaterial({ map: t, roughness: 0.9, side: THREE.DoubleSide }); });
  const chain = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); x.strokeStyle = '#b8bcbc'; x.lineWidth = 3; x.beginPath(); x.moveTo(0, 32); x.lineTo(32, 0); x.lineTo(64, 32); x.lineTo(32, 64); x.closePath(); x.stroke(); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; })();
  const leaseT = (() => { const c = document.createElement('canvas'); c.width = 512; c.height = 256; const x = c.getContext('2d'); const draw = () => { x.fillStyle = '#f2efe6'; x.fillRect(0, 0, 512, 256); x.fillStyle = '#1d4a2a'; x.fillRect(0, 0, 512, 70); x.fillStyle = '#f2ead0'; fitText(x, 'MAPLE CREEK PROPERTIES', 256, 38, 470, 34, F.roman, { spacing: 3 }); x.fillStyle = '#c81e28'; fitText(x, 'LOT FOR LEASE', 256, 130, 470, 70, F.heavy); x.fillStyle = '#222'; fitText(x, 'build to suit · (555) 018-3365', 256, 205, 440, 32, F.label); }; draw(); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; if (document.fonts) document.fonts.ready.then(() => { draw(); t.needsUpdate = true; }); return t; })();
  MATS.lot = new THREE.MeshStandardMaterial({ map: tex('tx_drygrass'), normalMap: tex('tx_drygrass_n', false), color: '#c8b494', roughness: 1 });   // vacant lots: patchy dry grass on sandy dirt (item 60)
  MATS.fence = new THREE.MeshStandardMaterial({ map: chain, alphaTest: 0.4, transparent: false, metalness: 0.5, roughness: 0.5 });
  MATS.post = new THREE.MeshStandardMaterial({ color: '#9a9e9e', metalness: 0.6, roughness: 0.4 });
  MATS.lease = new THREE.MeshStandardMaterial({ map: leaseT, roughness: 0.6 });
  const LODK = /^(det|capd|glow|tile|awn\d)$/, lod = [];   // (the small dressing of each block is only drawn within reach)
  for (const [key, list] of bin.parts) {
    const mk = key.split('@')[0], m = new THREE.Mesh(mergeGeometries(list, false), MATS[mk]); if (!m.geometry) console.warn('district merge failed', key);
    m.receiveShadow = !['far', 'win', 'shop', 'glow'].includes(mk); m.castShadow = false; m.name = 'district_' + key; if (key.includes('@')) { m.userData.noMerge = true; m.geometry.computeBoundingSphere(); if (LODK.test(mk)) lod.push(m); }
    if (key === 'far') m.frustumCulled = false;
    g.add(m);
  }
  const hm = new THREE.Mesh(hills, new THREE.MeshStandardMaterial({ color: '#1a1d22', roughness: 1, side: THREE.DoubleSide })); hm.name = 'district_hills'; g.add(hm);
  // the dark base under everything. Cut into 70 m squares and set well below the roads: as one 4 km square 4 cm under
  // them, its depth was imprecise enough to be drawn over roads and lawns in places (flat black rectangles)
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(4200, 4200, 60, 60), new THREE.MeshStandardMaterial({ color: '#232428', roughness: 1 }));
  ground.rotation.x = -Math.PI / 2; ground.position.set(180, -0.14, 0); g.add(ground);

  // ---- street lamps (instanced) along the curbs, with a soft light pool decal; trees on the avenue
  const lampPts = [];
  for (const x of xs) for (let z = ZMIN + 10; z < ZMAX - 10; z += 28) { if (zs.some((q) => Math.abs(z - q) < WH + 2)) continue; lampPts.push([x - RH - 0.5, z, 1], [x + RH + 0.5, z + 14, -1]); }
  for (const z of zs) for (let x = xs[0] + 18; x < XMAX - 10; x += 28) { if (xs.some((q) => Math.abs(x - q) < WH + 2)) continue; lampPts.push([x, z - RH - 0.5, 2], [x + 14, z + RH + 0.5, -2]); }
  const poleG = new THREE.CylinderGeometry(0.07, 0.1, 6.5, 8); poleG.translate(0, 3.25 + SW_H, 0);
  const armG = new THREE.BoxGeometry(1.6, 0.08, 0.08); armG.translate(0.8, 6.5 + SW_H, 0);
  const headG = new THREE.BoxGeometry(0.6, 0.12, 0.3); headG.translate(1.5, 6.4 + SW_H, 0);
  const poolG = new THREE.CircleGeometry(4.5, 24); poolG.rotateX(-Math.PI / 2); poolG.translate(1.5, 0.03, 0);
  const pc = document.createElement('canvas'); pc.width = pc.height = 128; const px = pc.getContext('2d'); const gr = px.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,214,150,0.32)'); gr.addColorStop(1, 'rgba(255,214,150,0)'); px.fillStyle = gr; px.fillRect(0, 0, 128, 128);
  const poolT = new THREE.CanvasTexture(pc);
  const lampParts = [[poleG, new THREE.MeshStandardMaterial({ color: '#3a3c3e', metalness: 0.6, roughness: 0.4 })], [armG, null], [headG, new THREE.MeshStandardMaterial({ color: '#fff2d8', emissive: '#ffd89a', emissiveIntensity: 2 })], [poolG, new THREE.MeshBasicMaterial({ map: poolT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })]];
  lampParts[1][1] = lampParts[0][1];
  const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), S1 = new THREE.Vector3(1, 1, 1), UP = new THREE.Vector3(0, 1, 0);
  for (const [geo, mat] of lampParts) {
    const im = new THREE.InstancedMesh(geo, mat, lampPts.length);
    lampPts.forEach(([x, z, d], i) => { const yaw = d === 1 ? 0 : d === -1 ? Math.PI : d === 2 ? -Math.PI / 2 : Math.PI / 2; Q.setFromAxisAngle(UP, yaw); M4.compose(new THREE.Vector3(x, 0, z), Q, S1); im.setMatrixAt(i, M4); });
    im.name = 'district_lamps'; g.add(im);
  }
  const treePts = [];
  for (let z = ZMIN + 6; z < ZMAX - 6; z += 14) { if (zs.some((q) => Math.abs(z - q) < WH + 3)) continue; treePts.push([xs[0] + RH + 1.0, z + 7], [xs[0] - RH - 1.0, z]); }
  for (const z of [0]) for (let x = xs[0] + 20; x < XMAX - 10; x += 14) { if (xs.some((q) => Math.abs(x - q) < WH + 3)) continue; if (!(x + 7 > 98 && x + 7 < 124)) treePts.push([x + 7, z - RH - 1.0]); treePts.push([x, z + RH + 1.0]); }   // (no trees in front of the izakaya + pottery)
  // real grown trees (oak / cherry / pale, from trees.js), baked + instanced
  g.add(placeStreetTrees(treePts, [streetTreeParts('oak', 7), streetTreeParts('cherry', 4), streetTreeParts('pale', 9), streetTreeParts('oak', 12)], { baseY: SW_H }));

  // ---- walking: the streets (road + sidewalks) are walkable; blocks are not (their buildings line the edges)
  const areas = [];
  for (const x of xs) areas.push({ minX: x - WH + 0.3, maxX: x + WH - 0.3, minZ: ZMIN + 0.3, maxZ: ZMAX - 0.3 });
  for (const z of zs) areas.push({ minX: XMIN + 0.3, maxX: XMAX - 0.3, minZ: z - WH + 0.3, maxZ: z + WH - 0.3 });
  areas.push({ minX: 60, maxX: XMIN + 1, minZ: -47.5, maxZ: 11.7 });
  { const RG = GRID.ring;   // the connectors out to Elm Loop
    for (const x of xs) { areas.push({ minX: x - WH + 0.3, maxX: x + WH - 0.3, minZ: ZMAX - 1, maxZ: RG.n - RG.hw + 0.5 }, { minX: x - WH + 0.3, maxX: x + WH - 0.3, minZ: RG.s + RG.hw - 0.5, maxZ: ZMIN + 1 }); }
    for (const z of zs) areas.push({ minX: XMAX - 1, maxX: RG.e - RG.hw + 0.5, minZ: z - WH + 0.3, maxZ: z + WH - 0.3 }); }   // the old town's east edge opens onto the avenue
  g.userData = {
    lodTick: (pos, reach = 150) => { for (const m of lod) { const bs = m.geometry.boundingSphere; m.visible = Math.hypot(bs.center.x - pos.x, bs.center.z - pos.z) - bs.radius < reach; } },
    buildings: BUILDINGS, sidewalkY: SW_H,
    areas, lots: LOTS,
    lampPosts: lampPts.map(([x, z]) => [x, z]), treePosts: treePts,
    floorY: (x, z) => (walks.some(([a, b, c, d]) => x >= a && x <= b && z >= c && z <= d) ? SW_H : null),
  };
  return g;
}
