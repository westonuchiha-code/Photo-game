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
import { F, fitText } from '../fonts.js';

// ---- layout ---------------------------------------------------------------------------------------------------
export const GRID = {
  xs: [75, 161, 245, 329, 413],   // N-S street centre lines (75 = the avenue next to the old town)
  zs: [-168, -84, 0, 84, 168],    // E-W street centre lines
  road: 5, walk: 7,               // half-widths: road, road + sidewalk
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

// ---- geometry helpers: quads / boxes with world-metre UVs, collected per material ------------------------------
class Bin {
  constructor() { this.parts = new Map(); }
  push(key, geo) { if (!this.parts.has(key)) this.parts.set(key, []); this.parts.get(key).push(geo); }
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
function building(bin, b, r) {
  const { x0, x1, z0, z1, face, floors, fac, shop } = b;
  const [file, tw, th] = FACADES[fac];
  const GF = 3.8, FH = 3.2, H = GF + (floors - 1) * FH, PAR = 0.7;
  // walls: each side's a->b runs so the quad faces outward (n -> -z, s -> +z, w -> -x, e -> +x)
  const sides = {
    n: [x1, z0, x0, z0], s: [x0, z1, x1, z1], w: [x0, z0, x0, z1], e: [x1, z1, x1, z0],
  };
  for (const k of ['n', 's', 'w', 'e']) {
    const [ax, az, bx, bz] = sides[k];
    bin.push('f' + fac, wallQuad(ax, az, bx, bz, 0, H + PAR, tw, th, (ax + az) * 0.37 % 7));
  }
  bin.push('roof', flatQuad(x0, x1, z0, z1, H + 0.05, 4, 4));
  // parapet cap + a cornice band over the shopfronts on the street sides
  const capM = 0.12;
  const cw = 0.35, ct = H + PAR, cb = H + PAR + 0.18;   // a ring of coping along the parapet edges
  bin.push('cap', boxGeo(x0 - capM, x1 + capM, ct, cb, z0 - capM, z0 + cw, 1, 1)); bin.push('cap', boxGeo(x0 - capM, x1 + capM, ct, cb, z1 - cw, z1 + capM, 1, 1));
  bin.push('cap', boxGeo(x0 - capM, x0 + cw, ct, cb, z0 + cw, z1 - cw, 1, 1)); bin.push('cap', boxGeo(x1 - cw, x1 + capM, ct, cb, z0 + cw, z1 - cw, 1, 1));
  for (const [ax, az, bx, bz] of [[x0 + cw, z0 + cw, x1 - cw, z0 + cw], [x1 - cw, z1 - cw, x0 + cw, z1 - cw], [x0 + cw, z1 - cw, x0 + cw, z0 + cw], [x1 - cw, z0 + cw, x1 - cw, z1 - cw]]) bin.push('cap', wallQuad(ax, az, bx, bz, H + 0.05, ct, 1, 1));   // inner parapet faces
  // rooftop clutter
  if (r() < 0.7) { const cx = x0 + 1.5 + r() * Math.max(0.5, x1 - x0 - 4), cz = z0 + 1.5 + r() * Math.max(0.5, z1 - z0 - 4); bin.push('equip', boxGeo(cx, cx + 1.6 + r(), H, H + 1.0 + r() * 0.6, cz, cz + 1.2 + r(), 1, 1)); }
  if (floors > 4 && r() < 0.4) { const cx = x0 + 2 + r() * Math.max(0.5, x1 - x0 - 6), cz = z0 + 2 + r() * Math.max(0.5, z1 - z0 - 6); bin.push('equip', boxGeo(cx, cx + 3, H, H + 2.6, cz, cz + 3, 1, 1)); }
  // street sides: windows on every upper floor, the front gets a shopfront or a lobby + windows
  for (const k of b.street) {
    const [ax, az, bx, bz] = sides[k]; const L = Math.hypot(bx - ax, bz - az), dx = (bx - ax) / L, dz = (bz - az) / L;
    const nx = -dz, nz = dx, off = 0.04;
    const n = Math.max(1, Math.floor((L - 1.2) / 2.6)), step = L / n;
    const ww = Math.min(1.5, step * 0.6), wh = 1.7;
    for (let f = 1; f < floors; f++) {
      const y = GF + (f - 1) * FH + 0.8;
      for (let i = 0; i < n; i++) {
        const u = step * (i + 0.5); const cx = ax + dx * u + nx * off, cz = az + dz * u + nz * off;
        const lit = r() < 0.32; const cell = lit ? Math.floor(r() * 7) : 7 + Math.floor(r() * 9);
        bin.push('win', wallQuad(cx - dx * ww / 2, cz - dz * ww / 2, cx + dx * ww / 2, cz + dz * ww / 2, y, y + wh, 1, 1, 0, 0, winUV(cell)));
        const sl = ww / 2 + 0.08, sx = cx + nx * 0.07, sz = cz + nz * 0.07, ex = Math.abs(dx) * sl + Math.abs(nx) * 0.07, ez = Math.abs(dz) * sl + Math.abs(nz) * 0.07;
        bin.push('cap', boxGeo(sx - ex, sx + ex, y - 0.12, y, sz - ez, sz + ez));   // sill
      }
    }
    // ground floor
    if (k === face && shop >= 0) {
      const sw = Math.min(L - 0.8, 11), u0 = (L - sw) / 2; const cx0 = ax + dx * u0 + nx * off, cz0 = az + dz * u0 + nz * off;
      bin.push('shop', wallQuad(cx0, cz0, cx0 + dx * sw, cz0 + dz * sw, 0.15, 3.5, 1, 1, 0, 0, shopUV(shop)));
    } else {
      for (let i = 0; i < n; i++) {
        const u = step * (i + 0.5); const cx = ax + dx * u + nx * off, cz = az + dz * u + nz * off;
        const cell = r() < 0.25 ? Math.floor(r() * 7) : 7 + Math.floor(r() * 9);
        bin.push('win', wallQuad(cx - dx * ww / 2, cz - dz * ww / 2, cx + dx * ww / 2, cz + dz * ww / 2, 1.1, 2.9, 1, 1, 0, 0, winUV(cell)));
      }
    }
    // a cornice band between the ground floor and the first floor
    const mnx = Math.min(ax, bx) - (nx < 0 ? 0.18 : 0), mxx = Math.max(ax, bx) + (nx > 0 ? 0.18 : 0), mnz = Math.min(az, bz) - (nz < 0 ? 0.18 : 0), mxz = Math.max(az, bz) + (nz > 0 ? 0.18 : 0);
    bin.push('cap', boxGeo(mnx, mxx, GF - 0.25, GF, mnz, mxz, 1, 1));
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
function fillBlock(bin, r, bx0, bx1, bz0, bz1, streets, tallness = 1) {
  const D = 16;
  // n and s rows run the full width; w and e rows fill between them
  if (streets.includes('n')) fillFrontage(bin, r, 'n', bx0, bx1, bz0, bz1, bx0, bx1, D, streets, LOTS, tallness);
  if (streets.includes('s')) fillFrontage(bin, r, 's', bx0, bx1, bz0, bz1, bx0, bx1, D, streets, LOTS, tallness);
  const za = streets.includes('n') ? bz0 + D : bz0, zb = streets.includes('s') ? bz1 - D : bz1;
  if (streets.includes('w')) fillFrontage(bin, r, 'w', bx0, bx1, bz0, bz1, za, zb, D, streets, LOTS, tallness);
  if (streets.includes('e')) fillFrontage(bin, r, 'e', bx0, bx1, bz0, bz1, za, zb, D, streets, LOTS, tallness);
}

export function makeDistrict() {
  const g = new THREE.Group(); g.name = 'city_district';
  const bin = new Bin(); const r = rng(2026);
  const { xs, zs, road: RH, walk: WH } = GRID;
  const XMIN = xs[0] - WH, XMAX = xs[xs.length - 1] + WH, ZMIN = zs[0] - WH, ZMAX = zs[zs.length - 1] + WH;
  // ---- blocks between the streets
  for (let i = 0; i < xs.length - 1; i++) for (let j = 0; j < zs.length - 1; j++)
    fillBlock(bin, r, xs[i] + WH, xs[i + 1] - WH, zs[j] + WH, zs[j + 1] - WH, ['n', 's', 'w', 'e'], 1 + 0.4 * (i === 1 || i === 2 ? 1 : 0));
  // ---- outer rows facing in: past the east street, beyond the north/south edge streets, and the avenue's west side
  fillBlock(bin, r, XMAX, XMAX + 16, ZMIN, ZMAX, ['w'], 0.6);
  fillBlock(bin, r, XMIN, XMAX, ZMIN - 16, ZMIN, ['s'], 0.6);
  fillBlock(bin, r, XMIN, XMAX, ZMAX, ZMAX + 16, ['n'], 0.6);
  fillBlock(bin, r, 50, XMIN, ZMIN, -70, ['e'], 0.6);
  fillBlock(bin, r, 50, XMIN, 14, ZMAX, ['e'], 0.6);

  // ---- streets: roads (segments between intersections + the intersections), sidewalks, curbs, markings
  const segs = []; // [x0,x1,z0,z1] road rects
  for (const x of xs) { let za = ZMIN + 2; for (const z of zs) { if (z - RH > za) segs.push([x - RH, x + RH, za, z - RH]); za = z + RH; } if (ZMAX - 2 > za) segs.push([x - RH, x + RH, za, ZMAX - 2]); }
  for (const z of zs) { let xa = xs[0] + RH; for (const x of xs.slice(1)) { segs.push([xa, x - RH, z - RH, z + RH]); xa = x + RH; } }
  for (const x of xs) for (const z of zs) segs.push([x - RH, x + RH, z - RH, z + RH]);
  // the E-W main street at z = 0 also runs west from the avenue into the old town's road
  segs.push([62.4, xs[0] - RH, -RH, RH]);
  for (const [a, b, c, d] of segs) bin.push('asphalt', flatQuad(a, b, c, d, 0.012, 3, 3));
  // sidewalk rings around every block + outer strips, as raised slabs with a concrete curb face
  const walks = [];
  for (let i = 0; i < xs.length - 1; i++) for (let j = 0; j < zs.length - 1; j++) {
    const bx0 = xs[i] + RH, bx1 = xs[i + 1] - RH, bz0 = zs[j] + RH, bz1 = zs[j + 1] - RH, w = WH - RH;
    walks.push([bx0, bx1, bz0, bz0 + w], [bx0, bx1, bz1 - w, bz1], [bx0, bx0 + w, bz0 + w, bz1 - w], [bx1 - w, bx1, bz0 + w, bz1 - w]);
  }
  walks.push([XMAX - 2, XMAX, ZMIN, ZMAX], [XMIN, XMAX, ZMIN, ZMIN + 2], [XMIN, XMAX, ZMAX - 2, ZMAX]);
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
    if (cx > -100 && cx < XMAX + 30 && cz > ZMIN - 30 && cz < ZMAX + 30) continue;   // keep out of the town + its rows
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
    roof: new THREE.MeshStandardMaterial({ color: '#2c2d30', roughness: 0.95 }),
    cap: new THREE.MeshStandardMaterial({ color: '#a9a49a', roughness: 0.8 }),
    equip: new THREE.MeshStandardMaterial({ color: '#8a8c8e', roughness: 0.6, metalness: 0.3 }),
    win, shop: new THREE.MeshStandardMaterial({ map: sa.map, emissiveMap: sa.emit, emissive: '#ffffff', emissiveIntensity: 0.7, roughness: 0.3 }),
    asphalt: new THREE.MeshStandardMaterial({ map: tex('city_asphalt'), color: '#7a7c80', roughness: 0.92 }),
    walk: new THREE.MeshStandardMaterial({ map: tex('sidewalk'), normalMap: tex('sidewalk_normal', false), color: '#a8a49c', roughness: 0.9 }),
    curb: new THREE.MeshStandardMaterial({ color: '#8e8c86', roughness: 0.9 }),
    paint_y: new THREE.MeshStandardMaterial({ color: '#d8b02a', roughness: 0.7 }),
    paint_w: new THREE.MeshStandardMaterial({ color: '#d8d8d2', roughness: 0.7 }),
    far: new THREE.MeshStandardMaterial({ map: tex('city_far'), emissiveMap: tex('city_far_e'), emissive: '#ffffff', emissiveIntensity: 0.55, roughness: 0.9, color: '#9a9aa0' }),
  };
  facMats.forEach((m, i) => { MATS['f' + i] = m; });
  const chain = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); x.strokeStyle = '#b8bcbc'; x.lineWidth = 3; x.beginPath(); x.moveTo(0, 32); x.lineTo(32, 0); x.lineTo(64, 32); x.lineTo(32, 64); x.closePath(); x.stroke(); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; })();
  const leaseT = (() => { const c = document.createElement('canvas'); c.width = 512; c.height = 256; const x = c.getContext('2d'); const draw = () => { x.fillStyle = '#f2efe6'; x.fillRect(0, 0, 512, 256); x.fillStyle = '#1d4a2a'; x.fillRect(0, 0, 512, 70); x.fillStyle = '#f2ead0'; fitText(x, 'MAPLE CREEK PROPERTIES', 256, 38, 470, 34, F.roman, { spacing: 3 }); x.fillStyle = '#c81e28'; fitText(x, 'LOT FOR LEASE', 256, 130, 470, 70, F.heavy); x.fillStyle = '#222'; fitText(x, 'build to suit · (555) 018-3365', 256, 205, 440, 32, F.label); }; draw(); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; if (document.fonts) document.fonts.ready.then(() => { draw(); t.needsUpdate = true; }); return t; })();
  MATS.lot = new THREE.MeshStandardMaterial({ map: tex('tx_drygrass'), normalMap: tex('tx_drygrass_n', false), color: '#c8b494', roughness: 1 });   // vacant lots: patchy dry grass on sandy dirt (item 60)
  MATS.fence = new THREE.MeshStandardMaterial({ map: chain, alphaTest: 0.4, transparent: false, metalness: 0.5, roughness: 0.5 });
  MATS.post = new THREE.MeshStandardMaterial({ color: '#9a9e9e', metalness: 0.6, roughness: 0.4 });
  MATS.lease = new THREE.MeshStandardMaterial({ map: leaseT, roughness: 0.6 });
  for (const [key, list] of bin.parts) {
    const m = new THREE.Mesh(mergeGeometries(list, false), MATS[key]);
    m.receiveShadow = !['far', 'win', 'shop'].includes(key); m.castShadow = false; m.name = 'district_' + key;
    if (key === 'far') m.frustumCulled = false;
    g.add(m);
  }
  const hm = new THREE.Mesh(hills, new THREE.MeshStandardMaterial({ color: '#1a1d22', roughness: 1, side: THREE.DoubleSide })); hm.name = 'district_hills'; g.add(hm);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(4200, 4200), new THREE.MeshStandardMaterial({ color: '#232428', roughness: 1 }));
  ground.rotation.x = -Math.PI / 2; ground.position.set(180, -0.03, 0); g.add(ground);

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
  const trunkG = new THREE.CylinderGeometry(0.12, 0.18, 3.2, 7); trunkG.translate(0, 1.6 + SW_H, 0);
  const crownG = new THREE.IcosahedronGeometry(1.9, 1); crownG.scale(1, 1.15, 1); crownG.translate(0, 4.4 + SW_H, 0);
  const trunks = new THREE.InstancedMesh(trunkG, new THREE.MeshStandardMaterial({ map: tex('tr_cedar'), color: '#8a7a6a', roughness: 0.95 }), treePts.length);
  const crowns = new THREE.InstancedMesh(crownG, new THREE.MeshStandardMaterial({ color: '#2a4228', roughness: 1, flatShading: true }), treePts.length);
  treePts.forEach(([x, z], i) => { const s = 0.85 + r() * 0.35; Q.setFromAxisAngle(UP, r() * 6.28); M4.compose(new THREE.Vector3(x, 0, z), Q, new THREE.Vector3(s, s, s)); trunks.setMatrixAt(i, M4); crowns.setMatrixAt(i, M4); });
  trunks.castShadow = crowns.castShadow = true; g.add(trunks, crowns);

  // ---- walking: the streets (road + sidewalks) are walkable; blocks are not (their buildings line the edges)
  const areas = [];
  for (const x of xs) areas.push({ minX: x - WH + 0.3, maxX: x + WH - 0.3, minZ: ZMIN + 0.3, maxZ: ZMAX - 0.3 });
  for (const z of zs) areas.push({ minX: XMIN + 0.3, maxX: XMAX - 0.3, minZ: z - WH + 0.3, maxZ: z + WH - 0.3 });
  areas.push({ minX: 60, maxX: XMIN + 1, minZ: -47.5, maxZ: 11.7 });   // the old town's east edge opens onto the avenue
  g.userData = {
    areas, lots: LOTS,
    lampPosts: lampPts.map(([x, z]) => [x, z]), treePosts: treePts,
    floorY: (x, z) => (walks.some(([a, b, c, d]) => x >= a && x <= b && z >= c && z <= d) ? SW_H : null),
  };
  return g;
}
