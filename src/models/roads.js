// Elm Loop + the Loop Jump Lot (driving, round 3). A four-lane boulevard round the district: two 3.5 m lanes each
// way, a 2 m planted median with trees and double-arm lamps, 1 m shoulders, W-beam guardrail on the outside, grass
// verges. Every district street runs on through the outer building rows to meet it (district.js). Off the east side,
// through a gap in the rail, a fenced asphalt stunt lot with ramps you can jump, cones, tyre stacks, floodlights.
// Boost pads (glowing chevrons) in the stunt lot only give a shove.
//   makeRoads()  world coordinates. userData:
//     areas            drivable/walkable rects
//     colliders        [{ type: 'box' | 'circle', ... }]
//     groundY(x, z)    ramp height, or null off the ramps
//     pads             boost pads [{ minX, maxX, minZ, maxZ }]
//     tick(t)          animates the pads (the pad set is its own child, `padSet`)
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { GRID } from './district.js';
import { streetTreeParts, spruceParts, placeStreetTrees } from './trees.js';
import { F, fitText } from '../fonts.js';

const _L = new THREE.TextureLoader();
function tex(name, color = true) { const t = _L.load(`assets/textures/${name}.png`); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; if (color) t.colorSpace = THREE.SRGBColorSpace; return t; }
function canvasT(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); draw(x, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (document.fonts) document.fonts.ready.then(() => { draw(x, w, h); t.needsUpdate = true; }); return t; }
function flat(x0, x1, z0, z1, y, tw = 1) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([x0, y, z1, x1, y, z1, x1, y, z0, x0, y, z0], 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0], 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute([x0 / tw, z1 / tw, x1 / tw, z1 / tw, x1 / tw, z0 / tw, x0 / tw, z0 / tw], 2));
  g.setIndex([0, 1, 2, 0, 2, 3]); return g;
}
function boxG(x0, x1, y0, y1, z0, z1, tw = 1) {
  const g = new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0); g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  const uv = g.attributes.uv, p = g.attributes.position, n = g.attributes.normal;
  for (let i = 0; i < uv.count; i++) { const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)); const u = ax > 0.5 ? p.getZ(i) : p.getX(i), v = ay > 0.5 ? p.getZ(i) : p.getY(i); uv.setXY(i, u / tw, v / tw); }
  return g;
}
class Bin { constructor() { this.m = new Map(); } push(k, g) { if (!this.m.has(k)) this.m.set(k, []); this.m.get(k).push(g); } }
const smooth = (t) => { t = Math.min(1, Math.max(0, t)); return t * t * (3 - 2 * t); };

// ramp profiles: u = 0..1 along the run (the direction you drive up it)
const PROFILES = {
  kick: (u) => Math.pow(u, 1.5),                                           // a curved kicker with a sharp lip
  table: (u) => (u < 0.32 ? smooth(u / 0.32) : u > 0.68 ? smooth((1 - u) / 0.32) : 1),   // up, flat top, down
  hump: (u) => Math.sin(Math.PI * u) ** 2,                                 // a rolling hump
};
// a ramp's solid: top surface following the profile, two sides, the back (lip) face. Local: run along +x, width along z
function rampGeo(len, wid, h, prof, segs = 24) {
  const pos = [], uv = [], idx = [];
  const top = [], v = (x, y, z, u, w) => { pos.push(x, y, z); uv.push(u, w); return pos.length / 3 - 1; };
  for (let i = 0; i <= segs; i++) { const u = i / segs, y = h * PROFILES[prof](u) + 0.02; top.push([v(u * len, y, -wid / 2, u * len / 2, 0), v(u * len, y, wid / 2, u * len / 2, wid / 2)]); }
  for (let i = 0; i < segs; i++) { const [a, b] = top[i], [c, d] = top[i + 1]; idx.push(a, b, c, b, d, c); }
  // sides (fan down to the ground) + the back face
  for (const sd of [-1, 1]) { const ring = []; for (let i = 0; i <= segs; i++) { const u = i / segs, y = h * PROFILES[prof](u) + 0.02; ring.push([v(u * len, y, sd * wid / 2, u * len / 2, y / 2), v(u * len, 0, sd * wid / 2, u * len / 2, 0)]); }
    for (let i = 0; i < segs; i++) { const [a, b] = ring[i], [c, d] = ring[i + 1]; if (sd > 0) idx.push(a, c, b, b, c, d); else idx.push(a, b, c, b, d, c); } }
  const yE = h * PROFILES[prof](1) + 0.02; if (yE > 0.05) { const a = v(len, yE, -wid / 2, 0, yE / 2), b = v(len, yE, wid / 2, wid / 2, yE / 2), c = v(len, 0, -wid / 2, 0, 0), d = v(len, 0, wid / 2, wid / 2, 0); idx.push(a, c, b, b, c, d); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g;
}

export function makeRoads() {
  const g = new THREE.Group(); g.name = 'elm_loop';
  const bin = new Bin(), areas = [], colliders = [], pads = [], ramps = [];
  const { xs, zs, road: RH, walk: WH, ring: RG } = GRID;
  const XMAX = xs[xs.length - 1] + WH, ZMIN = zs[0] - WH, ZMAX = zs[zs.length - 1] + WH;
  const HW = RG.hw, X0 = xs[0] - RH;   // the Loop's west end lines up with the avenue's west kerb
  const box = (minX, maxX, minZ, maxZ) => colliders.push({ type: 'box', minX, maxX, minZ, maxZ });

  // ---- carriageways: north + south run X0..e+HW, east runs s-HW..n+HW
  const N = RG.n, S = RG.s, E = RG.e;
  const roadsR = [[X0, E + HW, N - HW, N + HW], [X0, E + HW, S - HW, S + HW], [E - HW, E + HW, S + HW, N - HW]];
  for (const [a, b, c, d] of roadsR) { bin.push('asphalt', flat(a, b, c, d, 0.012, 3)); areas.push({ minX: a + 0.3, maxX: b - 0.3, minZ: c + 0.3, maxZ: d - 0.3 }); }
  // markings. `run(along, from, to, centre, horizontal)` lays a carriageway's lines: median edge (yellow), lane dashes,
  // edge lines (white), with the median broken at junction gaps
  const gapsN = xs.map((x) => [x - RH - 4, x + RH + 4]).concat([[E - HW - 2, E + HW]]), gapsE = zs.map((z) => [z - RH - 4, z + RH + 4]).concat([[-14, 14]]);
  const inGap = (v, gaps) => gaps.some(([a, b]) => v > a && v < b);
  const line = (horiz, c, a, b, off, w, key) => bin.push(key, horiz ? flat(a, b, c + off - w / 2, c + off + w / 2, 0.022) : flat(c + off - w / 2, c + off + w / 2, a, b, 0.022));
  function carriage(horiz, c, a, b, gaps) {
    for (const sd of [-1, 1]) {
      line(horiz, c, a, b, sd * (HW - 0.6), 0.15, 'paint_w');   // edge lines
      for (let p = a + 2; p < b - 4; p += 9) if (!inGap(p, gaps) && !inGap(p + 3, gaps)) line(horiz, c, p, p + 3, sd * 4.55, 0.13, 'paint_w');   // lane dashes
    }
    // median: raised kerbed strip with grass, broken at the junctions; yellow lines along its edges
    let p = a + 6; const segs = [];
    for (const [ga, gb] of [...gaps].sort((q, r) => q[0] - r[0])) { if (ga > p + 4) segs.push([p, ga]); p = Math.max(p, gb); } if (b - 6 > p + 4) segs.push([p, b - 6]);
    for (const [ma, mb] of segs) {
      if (horiz) { bin.push('kerb', boxG(ma, mb, 0, 0.16, c - 1, c + 1, 1)); bin.push('grass', flat(ma + 0.15, mb - 0.15, c - 0.85, c + 0.85, 0.165, 4)); box(ma, mb, c - 1, c + 1); }
      else { bin.push('kerb', boxG(c - 1, c + 1, 0, 0.16, ma, mb, 1)); bin.push('grass', flat(c - 0.85, c + 0.85, ma + 0.15, mb - 0.15, 0.165, 4)); box(c - 1, c + 1, ma, mb); }
      for (const sd of [-1, 1]) line(horiz, c, ma - 1, mb + 1, sd * 1.15, 0.12, 'paint_y');
      for (let q = ma + 8; q < mb - 4; q += 24) { (horiz ? treePts.push([q, c]) : treePts.push([c, q])); }
      for (let q = ma + 20; q < mb - 6; q += 32) { (horiz ? lampPts.push([q, c, horiz]) : lampPts.push([c, q, horiz])); }
    }
  }
  const treePts = [], lampPts = [], outerTrees = [];
  carriage(true, N, X0, E + HW, gapsN); carriage(true, S, X0, E + HW, gapsN); carriage(false, E, S + HW, N - HW, gapsE);
  // stop bars where each connector meets the Loop
  for (const x of xs) { bin.push('paint_w', flat(x - RH + 0.3, x - 0.2, N - HW - 0.6, N - HW - 0.25, 0.022)); bin.push('paint_w', flat(x + 0.2, x + RH - 0.3, S + HW + 0.25, S + HW + 0.6, 0.022)); }
  for (const z of zs) bin.push('paint_w', flat(E - HW - 0.6, E - HW - 0.25, z - RH + 0.3, z - 0.2, 0.022));

  // ---- verges: inside (between the outer rows and the Loop) and outside, grass; the outside gets the guardrail + trees
  const conn = (v, list) => list.some((q) => Math.abs(v - q) < WH);
  for (const [z0, z1] of [[ZMAX + 16, N - HW], [S + HW, ZMIN - 16]]) { let p = X0 - 4; for (const x of [...xs, E + 100]) { const a = Math.min(x - WH, E - HW); if (a > p) bin.push('grass', flat(p, a, z0, z1, 0.005, 4)); p = x + WH; } }
  { let p = S + HW; for (const z of [...zs, N + 100]) { const a = Math.min(z - WH, N - HW); if (a > p) bin.push('grass', flat(XMAX + 16, E - HW, p, a, 0.005, 4)); p = z + WH; } }
  bin.push('grass', flat(X0 - 30, E + HW + 24, N + HW, N + HW + 24, 0.005, 4)); bin.push('grass', flat(X0 - 30, E + HW + 24, S - HW - 24, S - HW, 0.005, 4));
  bin.push('grass', flat(E + HW, E + HW + 24, S - HW, -64, 0.005, 4)); bin.push('grass', flat(E + HW, E + HW + 24, 64, N + HW, 0.005, 4));
  // guardrail: W-beam on posts, outer edge of all three sides + both west ends; a gap on the east side for the lot
  const railRuns = [[true, N + HW + 0.35, X0 - 0.5, E + HW + 0.35], [true, S - HW - 0.35, X0 - 0.5, E + HW + 0.35], [false, E + HW + 0.35, S - HW - 0.35, -13], [false, E + HW + 0.35, 13, N + HW + 0.35],
    [false, X0 - 0.4, N - HW, N + HW + 0.35], [false, X0 - 0.4, S - HW - 0.35, S + HW]];
  const posts = [];
  for (const [horiz, c, a, b] of railRuns) {
    if (horiz) { bin.push('rail', boxG(a, b, 0.5, 0.82, c - 0.05, c + 0.05, 2)); box(a, b, c - 0.15, c + 0.15); } else { bin.push('rail', boxG(c - 0.05, c + 0.05, 0.5, 0.82, a, b, 2)); box(c - 0.15, c + 0.15, a, b); }
    for (let p = a; p <= b; p += 2) posts.push(horiz ? [p, c + 0.12 * Math.sign(c)] : [c + 0.12, p]);
  }
  for (let x = X0 + 6; x < E + HW + 18; x += 11) { outerTrees.push([x + (x * 7.3 % 3), N + HW + 9 + (x * 3.1 % 6)], [x + (x * 5.1 % 3), S - HW - 9 - (x * 2.3 % 6)]); }
  for (let z = S - HW; z < N + HW; z += 11) { if (Math.abs(z) < 75) continue; outerTrees.push([E + HW + 9 + (z * 3.7 % 6 + 6) % 6, z]); }

  // ---- Loop Jump Lot: a fenced asphalt pad east of the Loop, reached through the rail gap
  const LX0 = E + HW + 9, LX1 = LX0 + 130, LZ0 = -64, LZ1 = 64;
  bin.push('lot', flat(LX0, LX1, LZ0, LZ1, 0.014, 4)); bin.push('lot', flat(E + HW, LX0, -12, 12, 0.014, 4));
  areas.push({ minX: LX0 + 0.5, maxX: LX1 - 0.5, minZ: LZ0 + 0.5, maxZ: LZ1 - 0.5 }, { minX: E + HW - 1, maxX: LX0 + 1, minZ: -11.5, maxZ: 11.5 });
  // fence (chain-link panels between posts) round the lot, open at the entrance
  const fence = [[true, LZ0, LX0, LX1], [true, LZ1, LX0, LX1], [false, LX1, LZ0, LZ1], [false, LX0, LZ0, -12], [false, LX0, 12, LZ1]];
  const fpost = [];
  for (const [horiz, c, a, b] of fence) { if (horiz) { bin.push('fence', boxG(a, b, 0.05, 2.2, c - 0.02, c + 0.02, 1)); box(a, b, c - 0.3, c + 0.3); } else { bin.push('fence', boxG(c - 0.02, c + 0.02, 0.05, 2.2, a, b, 1)); box(c - 0.3, c + 0.3, a, b); } for (let p = a; p <= b; p += 3) fpost.push(horiz ? [p, c] : [c, p]); }
  // ramps: { x, z (start of the run), dir (unit run direction), len, wid, h, prof }
  const R = [
    { x: LX0 + 30, z: 0, dir: [1, 0], len: 10, wid: 8, h: 1.9, prof: 'kick' },        // the big kicker, straight off the entrance
    { x: LX0 + 20, z: 22, dir: [0, 1], len: 24, wid: 10, h: 1.4, prof: 'table' },     // a table-top along the north side
    { x: LX0 + 95, z: -38, dir: [-1, 0], len: 7, wid: 5, h: 0.95, prof: 'kick' },     // twin small kickers, heading back west
    { x: LX0 + 95, z: -28, dir: [-1, 0], len: 7, wid: 5, h: 0.95, prof: 'kick' },
    { x: LX0 + 70, z: 40, dir: [1, 0], len: 14, wid: 9, h: 0.9, prof: 'hump' },       // a rolling hump
    { x: LX0 + 100, z: 30, dir: [0, -1], len: 18, wid: 9, h: 1.2, prof: 'table' },
  ];
  const deck = new THREE.MeshStandardMaterial({ map: tex('slat_wood'), color: '#b8a080', roughness: 0.8 });
  const lipM = new THREE.MeshStandardMaterial({ color: '#f2c21a', roughness: 0.5 }); deck.side = THREE.DoubleSide;
  for (const r of R) {
    const m = new THREE.Mesh(rampGeo(r.len, r.wid, r.h, r.prof), deck); m.castShadow = m.receiveShadow = true;
    m.position.set(r.x, 0, r.z); m.rotation.y = -Math.atan2(r.dir[1], r.dir[0]); g.add(m);
    if (r.prof === 'kick') { const lip = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.03, r.wid + 0.02), lipM); lip.position.set(r.len - 0.16, r.h * PROFILES.kick(1 - 0.16 / r.len) + 0.035, 0); lip.rotation.z = Math.atan(1.5 * r.h / r.len); m.add(lip); }
    // footprint for the height field
    const ex = r.x + r.dir[0] * r.len, ez = r.z + r.dir[1] * r.len, w2 = r.wid / 2;
    ramps.push({ ...r, minX: Math.min(r.x, ex) - (r.dir[0] ? 0 : w2), maxX: Math.max(r.x, ex) + (r.dir[0] ? 0 : w2), minZ: Math.min(r.z, ez) - (r.dir[1] ? 0 : w2), maxZ: Math.max(r.z, ez) + (r.dir[1] ? 0 : w2) });
  }
  // cones (a slalom), tyre stacks along the fence, a painted donut ring
  const cones = []; for (let k = 0; k < 9; k++) cones.push([LX0 + 40 + k * 7, -50 + (k % 2) * 3]);
  for (let k = 0; k < 6; k++) cones.push([LX0 + 60 + (k % 3) * 2, 8 + Math.floor(k / 3) * 6]);
  const tyres = []; for (let k = 0; k < 14; k++) tyres.push([LX0 + 6 + k * 9, LZ1 - 2.2]); for (let k = 0; k < 6; k++) tyres.push([LX1 - 2.2, -50 + k * 20]);
  for (const [x, z] of tyres) colliders.push({ type: 'circle', x, z, r: 0.55 });
  { const ring = new THREE.RingGeometry(9, 9.35, 64); ring.rotateX(-Math.PI / 2); ring.translate(LX0 + 100, 0.022, -6); bin.push('paint_w', ring); }

  // ---- boost pads: chevrons on the Loop's straights (both directions) and in the lot
  const padDefs = [];
  // (none on Elm Loop itself: the roads are for getting around, the stunt lot keeps its toys)
  padDefs.push([LX0 + 22, 0, 1, 0], [LX0 + 25, 15, 0, 1], [LX0 + 104, -38, -1, 0], [LX0 + 104, -28, -1, 0]);
  const padT = canvasT(128, 256, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = 'rgba(20,20,24,0.65)'; x.fillRect(0, 0, w, h); for (let i = 0; i < 3; i++) { const y = h - 30 - i * 80; const gr = x.createLinearGradient(0, y, 0, y - 60); gr.addColorStop(0, '#ff8a1a'); gr.addColorStop(1, '#ffe24a'); x.fillStyle = gr; x.beginPath(); x.moveTo(12, y); x.lineTo(w / 2, y - 50); x.lineTo(w - 12, y); x.lineTo(w - 12, y - 22); x.lineTo(w / 2, y - 72); x.lineTo(12, y - 22); x.fill(); } });
  padT.wrapT = THREE.RepeatWrapping;
  const padMat = new THREE.MeshStandardMaterial({ map: padT, emissive: '#ffffff', emissiveMap: padT, emissiveIntensity: 0.9, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 });
  const padSet = new THREE.Group(); padSet.name = 'boost_pads'; g.add(padSet);
  for (const [x, z, dx, dz] of padDefs) {
    // the chevrons point along the plane's +y; laid flat that's local -z, turned to face the pad's direction
    const pg = new THREE.Group(); pg.position.set(x, 0.03, z); pg.rotation.y = Math.atan2(-dx, -dz); padSet.add(pg);
    const p = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 4.2), padMat); p.rotation.x = -Math.PI / 2; pg.add(p);
    pads.push({ minX: x - (dx ? 2.1 : 1.3), maxX: x + (dx ? 2.1 : 1.3), minZ: z - (dz ? 2.1 : 1.3), maxZ: z + (dz ? 2.1 : 1.3) });
  }
  const tick = (t) => { padT.offset.y = -(t * 1.6) % 1; };

  // ---- signs: "ELM LOOP" at each connector, the lot's arch
  const signT = canvasT(512, 192, (x, w, h) => { x.fillStyle = '#1d5a34'; x.fillRect(0, 0, w, h); x.strokeStyle = '#f4f4ee'; x.lineWidth = 6; x.strokeRect(8, 8, w - 16, h - 16); x.fillStyle = '#f4f4ee'; fitText(x, 'ELM LOOP', w / 2, 82, w - 60, 78, F.label, { weight: 700, spacing: 4 }); fitText(x, '← EAST · WEST →   ·   STUNT LOT ⟶ E', w / 2, 150, w - 50, 30, F.label); });
  const signM = new THREE.MeshStandardMaterial({ map: signT, roughness: 0.5 }), poleM = new THREE.MeshStandardMaterial({ color: '#8a8c90', metalness: 0.6, roughness: 0.4 });
  const sign = (x, z, ry) => { const s = new THREE.Group(); s.position.set(x, 0, z); s.rotation.y = ry; g.add(s); const pa = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.98, 0.06), [poleM, poleM, poleM, poleM, signM, poleM]); pa.position.y = 2.6; s.add(pa); for (const sx of [-1.1, 1.1]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3.1, 8), poleM); p.position.set(sx, 1.55, -0.05); s.add(p); } colliders.push({ type: 'circle', x, z, r: 1.2 }); };
  for (const x of xs) { sign(x + WH + 1.2, ZMAX + 14, Math.PI); sign(x - WH - 1.2, ZMIN - 14, 0); }
  for (const z of zs) sign(XMAX + 14, z - WH - 1.2, -Math.PI / 2);
  const archT = canvasT(1024, 192, (x, w, h) => { x.fillStyle = '#141416'; x.fillRect(0, 0, w, h); x.fillStyle = '#ff8a1a'; fitText(x, 'LOOP JUMP LOT', w / 2, 92, w - 80, 110, F.heavy, { spacing: 6 }); x.fillStyle = '#e8e6e0'; fitText(x, 'ramps · cones · no speed limit · drive nice', w / 2, 160, w - 120, 34, F.label); });
  { const a = new THREE.Group(); a.position.set(LX0 - 0.5, 0, 0); g.add(a); for (const sz of [-12.5, 12.5]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.4, 6.2, 0.4), poleM); p.position.set(0, 3.1, sz); a.add(p); colliders.push({ type: 'circle', x: LX0 - 0.5, z: sz, r: 0.4 }); }
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.6, 25.4), [new THREE.MeshStandardMaterial({ map: archT, emissive: '#ffffff', emissiveMap: archT, emissiveIntensity: 0.6 }), new THREE.MeshStandardMaterial({ map: archT, emissive: '#ffffff', emissiveMap: archT, emissiveIntensity: 0.6 }), poleM, poleM, poleM, poleM]); b.position.y = 6.0; a.add(b);
    archT.center.set(0.5, 0.5); }

  // ---- instanced props: median trees, outer treeline, median lamps (double arm), rail posts, fence posts, cones, tyres, floodlights
  const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), UP = new THREE.Vector3(0, 1, 0), V3 = new THREE.Vector3(), SC = new THREE.Vector3();
  const inst = (geo, mat, pts, fn) => { const im = new THREE.InstancedMesh(geo, mat, pts.length); pts.forEach((p, i) => { const [x, z, sc, ry] = fn(p, i); Q.setFromAxisAngle(UP, ry); M4.compose(V3.set(x, 0, z), Q, SC.setScalar(sc)); im.setMatrixAt(i, M4); }); im.castShadow = true; im.receiveShadow = true; g.add(im); return im; };
  const rnd = (i, k) => { const s = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return s - Math.floor(s); };
  g.add(placeStreetTrees(treePts, [streetTreeParts('oak', 7), streetTreeParts('pale', 9), streetTreeParts('cherry', 4)], { baseY: 0.16, seed: 8 }));   // the median: real grown trees (trees.js)
  g.add(placeStreetTrees(outerTrees, [spruceParts(3), spruceParts(8, 11)], { seed: 5, scale: 0.9 }));   // the outer tree line: spruces
  const poleG = new THREE.CylinderGeometry(0.08, 0.12, 8, 8); poleG.translate(0, 4, 0);
  const armG = new THREE.BoxGeometry(5.2, 0.1, 0.1); armG.translate(0, 8, 0);
  const headG = new THREE.BoxGeometry(0.7, 0.14, 0.32); const heads = mergeGeometries([headG.clone().translate(2.45, 7.9, 0), headG.clone().translate(-2.45, 7.9, 0)]);
  const lampM = new THREE.MeshStandardMaterial({ color: '#3a3c3e', metalness: 0.6, roughness: 0.4 }), headM = new THREE.MeshStandardMaterial({ color: '#fff2d8', emissive: '#ffd89a', emissiveIntensity: 2 });
  const lampFn = ([x, z, horiz]) => [x, z, 1, horiz ? Math.PI / 2 : 0];
  for (const [geo, mat] of [[poleG, lampM], [armG, lampM], [heads, headM]]) inst(geo, mat, lampPts, lampFn).position.y = 0.16;
  // light pools on the road under each head (the district's look)
  const pc = document.createElement('canvas'); pc.width = pc.height = 128; { const x = pc.getContext('2d'); const gr = x.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,220,160,0.55)'); gr.addColorStop(1, 'rgba(255,220,160,0)'); x.fillStyle = gr; x.fillRect(0, 0, 128, 128); }
  const poolM = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(pc), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const poolG = mergeGeometries([new THREE.CircleGeometry(5, 24).rotateX(-Math.PI / 2).translate(3.6, 0.03, 0), new THREE.CircleGeometry(5, 24).rotateX(-Math.PI / 2).translate(-3.6, 0.03, 0)]);
  const pools = inst(poolG, poolM, lampPts, lampFn); pools.castShadow = pools.receiveShadow = false;
  const postG = new THREE.BoxGeometry(0.1, 0.8, 0.1); postG.translate(0, 0.4, 0); inst(postG, lampM, posts, ([x, z]) => [x, z, 1, 0]);
  const fpG = new THREE.CylinderGeometry(0.04, 0.04, 2.3, 6); fpG.translate(0, 1.15, 0); inst(fpG, lampM, fpost, ([x, z]) => [x, z, 1, 0]);
  const coneG = mergeGeometries([new THREE.ConeGeometry(0.2, 0.7, 12).translate(0, 0.38, 0), new THREE.BoxGeometry(0.42, 0.04, 0.42).translate(0, 0.02, 0)]);
  inst(coneG, new THREE.MeshStandardMaterial({ color: '#ff5a14', roughness: 0.6 }), cones, ([x, z]) => [x, z, 1, 0]);
  for (const [x, z] of cones) colliders.push({ type: 'circle', x, z, r: 0.25, soft: true });
  const tyreG = mergeGeometries([0, 1, 2].map((k) => new THREE.TorusGeometry(0.42, 0.16, 8, 18).rotateX(Math.PI / 2).translate(0, 0.16 + k * 0.3, 0)));
  inst(tyreG, new THREE.MeshStandardMaterial({ color: '#16161a', roughness: 0.9 }), tyres, ([x, z], i) => [x, z, 1, i]);
  // floodlights: four tall masts with lamp banks (emissive) + big pools
  const masts = [[LX0 + 4, LZ0 + 4], [LX0 + 4, LZ1 - 4], [LX1 - 4, LZ0 + 4], [LX1 - 4, LZ1 - 4]];
  const mastG = new THREE.CylinderGeometry(0.14, 0.22, 14, 8); mastG.translate(0, 7, 0); inst(mastG, lampM, masts, ([x, z]) => [x, z, 1, 0]);
  const bankG = new THREE.BoxGeometry(1.8, 0.8, 0.3); bankG.translate(0, 14, 0); inst(bankG, headM, masts, ([x, z]) => [x, z, 1, Math.atan2(LX0 + 65 - x, -z)]);
  for (const [x, z] of masts) colliders.push({ type: 'circle', x, z, r: 0.3 });
  for (const [x, z] of masts) { const l = new THREE.PointLight('#ffe8c8', 900, 95, 1.5); l.position.set(x + (LX0 + 65 - x) * 0.08, 13.4, z * 0.92); g.add(l); }   // (the town's light budget keeps the nearest few on)
  const bigPool = new THREE.Mesh(new THREE.CircleGeometry(24, 32).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: poolM.map, transparent: true, opacity: 0.45, depthWrite: false, blending: THREE.AdditiveBlending })); for (const [x, z] of masts) { const p = bigPool.clone(); p.position.set(x + (LX0 + 65 - x) * 0.3, 0.03, z * 0.7); g.add(p); }

  // ---- merge the binned flat stuff per material
  const MATS = {
    asphalt: new THREE.MeshStandardMaterial({ map: tex('city_asphalt'), color: '#7a7c80', roughness: 0.92 }),
    lot: new THREE.MeshStandardMaterial({ map: tex('pk_asphalt'), color: '#8a8a8a', roughness: 0.9 }),
    grass: new THREE.MeshStandardMaterial({ map: tex('hs_grass'), color: '#7a8a6a', roughness: 1 }),
    kerb: new THREE.MeshStandardMaterial({ map: tex('lot_concrete'), color: '#b8b6ae', roughness: 0.9 }),
    rail: new THREE.MeshStandardMaterial({ color: '#b8bcc0', metalness: 0.75, roughness: 0.35 }),
    fence: new THREE.MeshStandardMaterial({ map: canvasT(64, 64, (x, w, h) => { x.clearRect(0, 0, w, h); x.strokeStyle = '#9a9c9e'; x.lineWidth = 3; for (let i = -64; i < 128; i += 16) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 64, 64); x.stroke(); x.beginPath(); x.moveTo(i + 64, 0); x.lineTo(i, 64); x.stroke(); } }), transparent: true, alphaTest: 0.3, side: THREE.DoubleSide, metalness: 0.5, roughness: 0.5 }),
    paint_w: new THREE.MeshStandardMaterial({ color: '#e8e6de', roughness: 0.7 }),
    paint_y: new THREE.MeshStandardMaterial({ color: '#e0b21a', roughness: 0.7 }),
  };
  MATS.fence.map.wrapS = MATS.fence.map.wrapT = THREE.RepeatWrapping; MATS.fence.map.repeat.set(1, 1);
  for (const [k, list] of bin.m) { const m = new THREE.Mesh(mergeGeometries(list, false), MATS[k]); m.receiveShadow = true; m.castShadow = k === 'rail' || k === 'kerb'; m.name = 'loop_' + k; g.add(m); }

  // ---- height field: the ramps
  function groundY(x, z) {
    for (const r of ramps) {
      if (x < r.minX || x > r.maxX || z < r.minZ || z > r.maxZ) continue;
      const u = ((x - r.x) * r.dir[0] + (z - r.z) * r.dir[1]) / r.len; if (u < 0 || u > 1) continue;
      return r.h * PROFILES[r.prof](u) + 0.02;
    }
    return null;
  }
  g.userData = { tick, mergeSafe: true, areas, colliders, groundY, pads, ramps, padSet, lot: { x0: LX0, x1: LX1, z0: LZ0, z1: LZ1 } };
  return g;
}
