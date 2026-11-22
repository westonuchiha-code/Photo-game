// Elm Loop Community Garden (models from the texture library only: no new photos).
//   A glasshouse on a tan-brick knee wall with a galvanised frame, potting benches and clay pots inside; a blue
//   corrugated tool shed with a plywood door, rusty hinges, ivy up one side and moss on the roof; raised beds edged
//   in old planks, a gravel path, a compost bay, a blue water butt, a potting table, a picket fence and a sign.
//   Textures used: bk_tan, gf_galv, b85_zinc, slat_wood, tr_clay, b83_gravel, tr_gravel, ab_bluesiding, wh_ply,
//   b84_rust, st_ivy, tr_moss, planter_soil, mulch, butcher_block, b82_blueplastic, wd_plank_b, b85_crackconc,
//   spruce_spray + oak_leaf (through trees.js).
//   makeCommunityGarden()  local: 19 x 10 m plot centred on the origin, entrance on the +x side, ground y = 0.
//     userData: colliders [[x0, x1, z0, z1], ...], area { minX, maxX, minZ, maxZ } (local)
import * as THREE from 'three';
import { NORMAL_OF } from '../normals.js';
import { leafBall, sprayMound } from './trees.js';
import { F, fitText } from '../fonts.js';

const _L = new THREE.TextureLoader(), _M = new Map();
function tex(name, color = true) { const t = _L.load(`assets/textures/${name}.png`); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; if (color) t.colorSpace = THREE.SRGBColorSpace; return t; }
// one material per (texture, tint, options); UVs carry the tiling (box-projected in metres), so the texture is shared
function mat(name, { tint = '#ffffff', rough = 0.85, metal = 0, side = THREE.FrontSide, normal = 0.7 } = {}) {
  const k = [name, tint, rough, metal, side].join('|'); if (_M.has(k)) return _M.get(k);
  const o = { map: tex(name), color: Array.isArray(tint) ? new THREE.Color().setRGB(tint[0], tint[1], tint[2]) : tint, roughness: rough, metalness: metal, side };
  if (NORMAL_OF[name] && normal) { o.normalMap = tex(NORMAL_OF[name], false); o.normalScale = new THREE.Vector2(normal, normal); }
  const m = new THREE.MeshStandardMaterial(o); _M.set(k, m); return m;
}
// box-project UVs at `tile` metres per repeat (so nothing stretches whatever the box's proportions)
function projUV(g, tile) {
  const p = g.attributes.position, n = g.attributes.normal, uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) { const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i)); let u, v;
    if (ax >= ay && ax >= az) { u = p.getZ(i); v = p.getY(i); } else if (ay >= az) { u = p.getX(i); v = p.getZ(i); } else { u = p.getX(i); v = p.getY(i); }
    uv[i * 2] = u / tile; uv[i * 2 + 1] = v / tile; }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); return g;
}
function box(w, h, d, m, x, y, z, parent, tile = 1) { const g = new THREE.BoxGeometry(w, h, d); g.translate(x, y, z); projUV(g, tile); const o = new THREE.Mesh(g, m); o.castShadow = o.receiveShadow = true; parent.add(o); return o; }
function cyl(rt, rb, h, m, x, y, z, parent, seg = 18) { const o = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; parent.add(o); return o; }
function flat(x0, x1, z0, z1, y, m, parent, tile = 1) { const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0); g.rotateX(-Math.PI / 2); g.translate((x0 + x1) / 2, y, (z0 + z1) / 2); projUV(g, tile); const o = new THREE.Mesh(g, m); o.receiveShadow = true; parent.add(o); return o; }
function canvasT(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); draw(x, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (document.fonts) document.fonts.ready.then(() => { draw(x, w, h); t.needsUpdate = true; }); return t; }
const rng = (s) => () => ((s = (s * 16807) % 2147483647) / 2147483647);
const V = (x, y, z) => new THREE.Vector3(x, y, z);
function bar(a, b, t, m, parent) { const d = new THREE.Vector3().subVectors(b, a); const o = new THREE.Mesh(new THREE.BoxGeometry(t, d.length(), t), m); o.position.copy(a).addScaledVector(d, 0.5); o.quaternion.setFromUnitVectors(V(0, 1, 0), d.clone().normalize()); o.castShadow = true; parent.add(o); return o; }

// a terracotta pot (lathe: tapered wall, rolled rim, soil disc) with an optional plant
function pot(r = 0.12, plant = null, seed = 1) {
  const g = new THREE.Group(); const clay = mat('tr_clay', { tint: '#d88a5a', rough: 0.9 });
  const prof = [[r * 0.62, 0], [r * 0.95, r * 1.55], [r * 1.08, r * 1.55], [r * 1.1, r * 1.8], [r * 0.98, r * 1.8], [r * 0.9, r * 1.6]].map(([a, b]) => new THREE.Vector2(a, b));
  const body = new THREE.Mesh(new THREE.LatheGeometry(prof, 20), clay); body.material.side = THREE.DoubleSide; body.castShadow = true; g.add(body);
  const soil = new THREE.Mesh(new THREE.CircleGeometry(r * 0.92, 16), mat('planter_soil', { rough: 1 })); soil.rotation.x = -Math.PI / 2; soil.position.y = r * 1.62; g.add(soil);
  if (plant === 'leaf') { const b = leafBall(r * 1.5, seed, [0.28, 0.5, 0.36]); b.position.y = r * 2.6; g.add(b); }
  if (plant === 'spray') { const sm = sprayMound(1 + (seed % 3)); const b = new THREE.Mesh(sm.geo, sm.mat); b.scale.setScalar(r * 2.6); b.position.y = r * 1.6; b.rotation.y = seed; g.add(b); }
  if (plant === 'tomato') { cyl(0.008, 0.008, 0.9, new THREE.MeshStandardMaterial({ color: '#b89a5a', roughness: 0.9 }), 0, r * 1.6 + 0.45, 0, g, 6);
    for (let k = 0; k < 4; k++) { const b = leafBall(0.13, seed + k, [0.3, 0.5, 0.34]); b.position.set(Math.sin(k * 2.1) * 0.06, r * 1.9 + k * 0.2, Math.cos(k * 2.1) * 0.06); g.add(b); }
    for (let k = 0; k < 5; k++) { const t = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 8), new THREE.MeshStandardMaterial({ color: k % 3 ? '#c8281e' : '#8aa02a', roughness: 0.35 })); t.position.set(Math.sin(k * 1.9 + seed) * 0.1, r * 2 + (k * 0.17) % 0.7, Math.cos(k * 1.9 + seed) * 0.1); g.add(t); } }
  return g;
}

// ---- the glasshouse: 6.0 x 3.6 m, door in the +x gable (open), ridge along x
function glasshouse(cols) {
  const g = new THREE.Group(); g.name = 'glasshouse'; const L = 6, W = 3.6, KW = 0.6, EV = 2.05, RG = 3.05, hw = W / 2, hl = L / 2;
  const brick = mat('bk_tan'), galv = mat('gf_galv', { tint: '#c8ccd0', rough: 0.45, metal: 0.5 }), cap = mat('b85_crackconc', { tint: '#c8c4bc' });
  const glass = new THREE.MeshPhysicalMaterial({ color: '#cfe6dc', roughness: 0.06, metalness: 0, transparent: true, opacity: 0.2, side: THREE.DoubleSide, depthWrite: false, clearcoat: 1 });
  // floor: gravel with a centre path of cracked concrete slabs
  flat(-hl, hl, -hw, hw, 0.02, mat('b83_gravel', { tint: '#8a847a' }), g, 1.6); flat(-hl + 0.1, hl, -0.4, 0.4, 0.03, mat('b85_crackconc', { tint: '#8e8c86' }), g, 1.2);
  // knee wall (gap for the door in the +x end) + concrete coping
  for (const s of [-1, 1]) { box(L, KW, 0.22, brick, 0, KW / 2, s * (hw - 0.11), g, 0.9); box(L + 0.06, 0.05, 0.28, cap, 0, KW + 0.025, s * (hw - 0.11), g); }
  box(0.22, KW, W - 0.44, brick, -hl + 0.11, KW / 2, 0, g, 0.9); box(0.28, 0.05, W - 0.38, cap, -hl + 0.11, KW + 0.025, 0, g);
  for (const s of [-1, 1]) { box(0.22, KW, hw - 0.45 - 0.22, brick, hl - 0.11, KW / 2, s * (0.45 + (hw - 0.45 - 0.22) / 2 + 0.11), g, 0.9); box(0.28, 0.05, hw - 0.45 - 0.16, cap, hl - 0.11, KW + 0.025, s * (0.45 + (hw - 0.45 - 0.22) / 2 + 0.11), g); }
  // frame: sills, eaves, ridge, posts + glazing bars every 0.6 m, rafters
  const T = 0.045;
  for (const s of [-1, 1]) { bar(V(-hl, KW + 0.07, s * (hw - 0.11)), V(hl, KW + 0.07, s * (hw - 0.11)), T, galv, g).rotation.x += 0; bar(V(-hl, EV, s * (hw - 0.11)), V(hl, EV, s * (hw - 0.11)), T * 1.3, galv, g); }
  bar(V(-hl, RG, 0), V(hl, RG, 0), T * 1.3, galv, g);
  for (let x = -hl; x <= hl + 0.01; x += 0.6) for (const s of [-1, 1]) { const z = s * (hw - 0.11); const main = Math.abs((x + hl) % 1.8) < 0.01 || Math.abs(x - hl) < 0.01; bar(V(x, KW + 0.05, z), V(x, EV, z), main ? T : T * 0.55, galv, g); bar(V(x, EV, z), V(x, RG, 0), main ? T : T * 0.55, galv, g); }
  for (const x of [-hl, hl]) { for (const z of [-0.45, 0.45]) bar(V(x, x > 0 ? 0 : KW + 0.05, z), V(x, EV + (hw - 0.11 - 0.45) * (RG - EV) / (hw - 0.11), z), T, galv, g); bar(V(x, x > 0 ? 2.05 : EV, -0.45), V(x, x > 0 ? 2.05 : EV, 0.45), T, galv, g); if (x < 0) bar(V(x, EV, -hw + 0.11), V(x, EV, hw - 0.11), T, galv, g); }
  // glass: side walls, the two roof slopes, both gables (the door opening is left clear)
  const pane = (pts) => { const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pts.flat(), 3)); geo.setIndex(pts.length === 4 ? [0, 1, 2, 0, 2, 3] : [0, 1, 2]); geo.computeVertexNormals(); const o = new THREE.Mesh(geo, glass); o.renderOrder = 3; g.add(o); };
  for (const s of [-1, 1]) { const z = s * (hw - 0.11); pane([[-hl, KW + 0.1, z], [hl, KW + 0.1, z], [hl, EV, z], [-hl, EV, z]]); pane([[-hl, EV, z], [hl, EV, z], [hl, RG, 0], [-hl, RG, 0]]); }
  pane([[-hl, KW + 0.1, -hw + 0.11], [-hl, KW + 0.1, hw - 0.11], [-hl, EV, hw - 0.11], [-hl, EV, -hw + 0.11]]); pane([[-hl, EV, -hw + 0.11], [-hl, EV, hw - 0.11], [-hl, RG, 0]]);
  for (const s of [-1, 1]) pane([[hl, KW + 0.1, s * 0.47], [hl, KW + 0.1, s * (hw - 0.11)], [hl, EV, s * (hw - 0.11)], [hl, EV, s * 0.47]]);
  pane([[hl, EV, -hw + 0.11], [hl, EV, hw - 0.11], [hl, RG, 0]]);
  // the door: a galvanised frame with glass, swung open outward
  { const d = new THREE.Group(); d.position.set(hl, 0, 0.45); d.rotation.y = -1.9; g.add(d); for (const z of [0, -0.88]) bar(V(0, 0.03, z), V(0, 2.0, z), T, galv, d); for (const y of [0.05, 0.9, 2.0]) bar(V(0, y, 0), V(0, y, -0.88), T, galv, d);
    const dg = new THREE.Mesh(new THREE.PlaneGeometry(0.84, 1.9), glass); dg.rotation.y = Math.PI / 2; dg.position.set(0, 1.03, -0.44); d.add(dg); cyl(0.012, 0.012, 0.14, galv, 0.03, 1.0, -0.8, d, 8); }
  // roof vent propped open on one slope
  { const v = new THREE.Group(); v.position.set(-0.9, RG - 0.02, 0); v.rotation.x = 0.507 - 0.42; g.add(v); for (const x of [-0.3, 0.3]) bar(V(x, 0, 0), V(x, 0, 0.95), T * 0.6, galv, v); bar(V(-0.3, 0, 0.95), V(0.3, 0, 0.95), T * 0.6, galv, v); const vg = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.95), glass); vg.rotation.x = Math.PI / 2; vg.position.set(0, 0, 0.475); v.add(vg); }
  // benches down both sides: slat-wood tops on galvanised legs, a lower shelf; pots, seed trays, a watering can
  const slat = mat('slat_wood', { tint: [0.8, 1.15, 1.9] }), r = rng(87);
  for (const s of [-1, 1]) { const z = s * (hw - 0.62);
    for (let k = 0; k < 9; k++) box(L - 1.0, 0.025, 0.075, slat, -0.25, 0.82, z + (k - 4) * 0.085, g, 0.8);
    for (let k = 0; k < 4; k++) box(L - 1.0, 0.02, 0.1, slat, -0.25, 0.3, z + (k - 1.5) * 0.16, g, 0.8);
    for (let x = -hl + 0.4; x <= hl - 0.9; x += 1.5) for (const dz of [-0.33, 0.33]) bar(V(x, 0, z + dz), V(x, 0.8, z + dz), 0.035, galv, g);
    for (let i = 0; i < 9; i++) { const kind = ['tomato', 'leaf', 'spray', 'leaf', null][Math.floor(r() * 5)]; const p = pot(0.09 + r() * 0.06, s > 0 && i < 4 ? 'tomato' : kind, i + (s > 0 ? 20 : 0)); p.position.set(-hl + 0.6 + i * 0.52 + r() * 0.1, 0.835, z + (r() - 0.5) * 0.3); g.add(p); }
    for (let i = 0; i < 4; i++) { const p = pot(0.11, null); p.position.set(-hl + 0.8 + i * 0.35, 0.31 + (i % 2) * 0.05, z); p.rotation.z = i % 2 ? 0.05 : 0; g.add(p); } }
  // seed trays: black plastic with rows of seedlings
  for (let t = 0; t < 2; t++) { const tr = new THREE.Group(); tr.position.set(1.6 + t * 0.6, 0.835, -(hw - 0.62)); g.add(tr); box(0.5, 0.05, 0.3, new THREE.MeshStandardMaterial({ color: '#1c1c1e', roughness: 0.7 }), 0, 0.025, 0, tr); flat(-0.23, 0.23, -0.13, 0.13, 0.052, mat('planter_soil', { rough: 1 }), tr, 0.3);
    for (let i = 0; i < 18; i++) { const b = leafBall(0.028, i, [0.3, 0.6, 0.42]); b.position.set(-0.2 + (i % 6) * 0.08, 0.075, -0.09 + Math.floor(i / 6) * 0.09); tr.add(b); } }
  // watering can (galvanised): body, spout, handle, rose
  { const c = new THREE.Group(); c.position.set(hl - 1.3, 0.03, 0.9); c.rotation.y = 0.7; g.add(c); cyl(0.11, 0.12, 0.26, galv, 0, 0.13, 0, c, 20); bar(V(0.1, 0.08, 0), V(0.36, 0.3, 0), 0.03, galv, c); cyl(0.045, 0.02, 0.04, galv, 0.37, 0.31, 0, c, 12).rotation.z = -0.85;
    const h = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.01, 6, 16, Math.PI), galv); h.position.set(-0.06, 0.26, 0); h.rotation.set(0, 0, -0.4); c.add(h); }
  // a warm work light under the ridge
  { const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 2.0, 1.3), toneMapped: false })); bulb.position.set(0, RG - 0.45, 0); g.add(bulb); bar(V(0, RG, 0), V(0, RG - 0.4, 0), 0.008, new THREE.MeshStandardMaterial({ color: '#222' }), g);
    const l = new THREE.PointLight('#ffd9a0', 5, 11, 1.6); l.position.set(0, RG - 0.5, 0); g.add(l); }
  cols.push([-hl, hl, -hw, -hw + 0.24], [-hl, hl, hw - 0.24, hw], [-hl, -hl + 0.24, -hw, hw], [hl - 0.24, hl, -hw, -0.45], [hl - 0.24, hl, 0.45, hw], [-hl + 0.3, hl - 0.6, -hw + 0.24, -hw + 1.0], [-hl + 0.3, hl - 0.6, hw - 1.0, hw - 0.24]);
  return g;
}

// ---- the tool shed: 3.0 x 2.4 m, mono-pitch roof, door on the +z side
function shed(cols) {
  const g = new THREE.Group(); g.name = 'tool_shed'; const W = 3.0, D = 2.4, H0 = 2.0, H1 = 2.45;
  const sid = mat('ab_bluesiding', { rough: 0.6, metal: 0.25 }), ply = mat('wh_ply', { tint: [1.1, 1.5, 2.2] }), rust = mat('b84_rust'), galv = mat('gf_galv', { tint: '#b8bcc0', rough: 0.45, metal: 0.5 }), zinc = mat('b85_zinc', { tint: '#a8acb0', rough: 0.5, metal: 0.4 });
  box(W + 0.2, 0.12, D + 0.2, mat('b85_crackconc'), 0, 0.06, 0, g, 1.5);   // slab
  // walls: corrugated sheet (the siding photo runs along its ribs: 1.1 m per repeat), timber corner posts
  const sidUV = (geo) => { projUV(geo, 1); const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) / 2.4); return geo; };   // ribs run up the wall; the photo is a wide strip
  const wall = (w, h, x, z, ry) => { const geo = new THREE.BoxGeometry(w, h, 0.05); sidUV(geo); const o = new THREE.Mesh(geo, sid); o.position.set(x, 0.12 + h / 2, z); o.rotation.y = ry; o.castShadow = o.receiveShadow = true; g.add(o); };
  wall(W, H0, 0, -D / 2, 0); wall(D, H0, -W / 2, 0, Math.PI / 2); wall(D, H0, W / 2, 0, Math.PI / 2); wall(0.95, H0, -W / 2 + 0.475, D / 2, 0); wall(0.95, H0, W / 2 - 0.475, D / 2, 0);
  { const lint = new THREE.BoxGeometry(1.1, 0.14, 0.05); sidUV(lint); const o = new THREE.Mesh(lint, sid); o.position.set(0, 0.12 + H0 - 0.07, D / 2); g.add(o); }
  const post = mat('wd_plank_b', { tint: [1.7, 2.5, 3.6] }); for (const [x, z] of [[-W / 2, -D / 2], [W / 2, -D / 2], [-W / 2, D / 2], [W / 2, D / 2]]) box(0.09, H0 + 0.1, 0.09, post, x, 0.12 + H0 / 2, z, g, 0.8);
  // roof: galvanised sheet sloping back, fascia board, moss creeping in from the low edge
  { const roof = new THREE.Group(); roof.position.set(0, 0.12 + H0 + 0.03, D / 2 + 0.2); roof.rotation.x = -Math.atan2(H1 - H0, D + 0.4) + 0; g.add(roof);
    const rg = new THREE.BoxGeometry(W + 0.4, 0.04, D + 0.5); rg.translate(0, 0.02, -(D + 0.5) / 2 + 0.05); projUV(rg, 1.2); const rm = new THREE.Mesh(rg, zinc); rm.castShadow = true; roof.add(rm); roof.rotation.x = Math.atan2(H1 - H0, D + 0.4);
    const moss = mat('tr_moss', { rough: 1 }); const r = rng(5); for (let i = 0; i < 9; i++) { const w = 0.3 + r() * 0.5, d = 0.15 + r() * 0.35; const mg = new THREE.PlaneGeometry(w, d); mg.rotateX(-Math.PI / 2); mg.translate(0, 0, 0); projUV(mg, 0.8); const mm = new THREE.Mesh(mg, moss); mm.position.set(-W / 2 + r() * W, 0.043, -(D + 0.3) + r() * 0.5); roof.add(mm); }
    box(W + 0.4, 0.14, 0.03, post, 0, -0.05, 0.05, roof, 0.8); }
  // door: plywood on rusty strap hinges, a hasp, slightly ajar
  { const d = new THREE.Group(); d.position.set(-0.55, 0.12, D / 2 + 0.03); d.rotation.y = -0.5; g.add(d); box(1.08, 1.92, 0.035, ply, 0.54, 0.96, 0, d, 1.2);
    for (const y of [0.3, 1.6]) { box(0.5, 0.05, 0.012, rust, 0.25, y, 0.024, d, 0.4); cyl(0.018, 0.018, 0.09, rust, 0, y, 0.02, d, 8); } for (const y of [0.22, 1.72]) box(1.0, 0.09, 0.02, post, 0.54, y, -0.027, d, 0.8); bar(V(0.1, 0.28, -0.03), V(0.98, 1.66, -0.03), 0.07, post, d).scale.set(1, 1, 0.25);
    box(0.09, 0.035, 0.012, rust, 0.98, 1.0, 0.024, d, 0.3); cyl(0.012, 0.012, 0.05, galv, 1.0, 1.0, 0.04, d, 8); }
  // inside (seen through the door): a shelf of pots, a spade + rake leaning in the corner
  box(W - 0.3, 0.03, 0.3, post, 0, 1.3, -D / 2 + 0.2, g, 0.8); for (let i = 0; i < 5; i++) { const p = pot(0.08 + (i % 2) * 0.02, null); p.position.set(-1.0 + i * 0.5, 1.32, -D / 2 + 0.2); g.add(p); }
  { const handle = new THREE.MeshStandardMaterial({ color: '#b08a50', roughness: 0.8 }); bar(V(0.9, 0.14, -0.7), V(1.15, 1.6, -0.95), 0.03, handle, g); const bl = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.28, 0.012), mat('b84_rust', { tint: '#b8b0a8' })); bl.position.set(0.88, 0.2, -0.68); bl.rotation.set(0.15, 0.3, 0.1); g.add(bl);
    bar(V(0.5, 0.14, -0.8), V(0.6, 1.7, -1.0), 0.028, handle, g); for (let k = -3; k <= 3; k++) cyl(0.005, 0.005, 0.1, galv, 0.5 + k * 0.03, 0.19, -0.8, g, 5); }
  // ivy up the west wall and round the back corner (overlapping patches of the ivy photo, lifted off the sheet)
  { const ivy = mat('st_ivy', { rough: 1, side: THREE.DoubleSide }); const r = rng(9); for (let i = 0; i < 16; i++) { const w = 0.5 + r() * 0.7, h = 0.4 + r() * 0.7, y = 0.3 + r() * 1.7; const pg = new THREE.PlaneGeometry(w, h, 3, 3); const pp = pg.attributes.position; for (let k = 0; k < pp.count; k++) pp.setZ(k, (r() - 0.5) * 0.06); pg.computeVertexNormals(); projUV(pg, 0.9);
      const m = new THREE.Mesh(pg, ivy); if (i < 11) { m.position.set(-W / 2 - 0.05 - r() * 0.03, y, -D / 2 + 0.3 + r() * (D - 0.5)); m.rotation.y = -Math.PI / 2; } else { m.position.set(-W / 2 + 0.2 + r() * 1.0, y, -D / 2 - 0.05 - r() * 0.03); m.rotation.y = Math.PI; } m.rotation.z = (r() - 0.5) * 0.5; m.castShadow = true; g.add(m); }
    for (let i = 0; i < 7; i++) { const b = leafBall(0.22 + r() * 0.15, i, [0.3, 0.42, 0.24]); b.position.set(-W / 2 - 0.12, 0.3 + r() * 1.9, -D / 2 + 0.2 + r() * (D - 0.4)); b.scale.x *= 0.35; g.add(b); } }
  // a caged lamp over the door
  { cyl(0.05, 0.05, 0.1, galv, 0, 0.12 + H0 + 0.02, D / 2 + 0.1, g, 10); const b = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 1.9, 1.3), toneMapped: false })); b.position.set(0, 0.12 + H0 - 0.06, D / 2 + 0.12); g.add(b); const l = new THREE.PointLight('#ffe0b0', 5, 8, 1.6); l.position.set(0, 0.12 + H0 - 0.15, D / 2 + 0.5); g.add(l); }
  cols.push([-W / 2 - 0.1, W / 2 + 0.1, -D / 2 - 0.1, D / 2 + 0.1]);
  return g;
}

// a raised bed: plank sides, soil, a crop
function bed(w, d, crop, seed) {
  const g = new THREE.Group(); g.name = 'raised_bed'; const pl = mat('wd_plank_b', { tint: [1.5, 2.3, 3.4] }), r = rng(seed);
  for (const s of [-1, 1]) { box(w, 0.32, 0.045, pl, 0, 0.16, s * d / 2, g, 0.9); box(0.045, 0.32, d, pl, s * w / 2, 0.16, 0, g, 0.9); }
  for (const [x, z] of [[-w / 2, -d / 2], [w / 2, -d / 2], [-w / 2, d / 2], [w / 2, d / 2]]) box(0.08, 0.4, 0.08, pl, x, 0.2, z, g, 0.9);
  flat(-w / 2 + 0.03, w / 2 - 0.03, -d / 2 + 0.03, d / 2 - 0.03, 0.27, mat(crop === 'mulch' ? 'mulch' : 'planter_soil', { rough: 1 }), g, 0.7);
  const nx = Math.floor(w / 0.42), nz = Math.floor(d / 0.4);
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) { const x = -w / 2 + 0.25 + i * (w - 0.5) / Math.max(1, nx - 1), z = -d / 2 + 0.22 + j * (d - 0.44) / Math.max(1, nz - 1);
    if (crop === 'greens') { const b = leafBall(0.13 + r() * 0.05, i * 7 + j, [0.27 + r() * 0.04, 0.55, 0.4]); b.position.set(x, 0.36, z); b.scale.y *= 0.6; g.add(b); }
    else if (crop === 'herbs') { const sm = sprayMound(1 + ((i + j) % 3)); const b = new THREE.Mesh(sm.geo, sm.mat); b.scale.setScalar(0.34 + r() * 0.1); b.position.set(x, 0.27, z); b.rotation.y = r() * 6; g.add(b); }
    else if (crop === 'beans' && j === 0) { for (const dz of [-0.25, 0.25]) bar(V(x, 0.27, dz * (d / 0.8)), V(x, 1.75, 0), 0.016, new THREE.MeshStandardMaterial({ color: '#b89a5a', roughness: 0.9 }), g); for (let k = 0; k < 5; k++) { const b = leafBall(0.16, i * 5 + k, [0.3, 0.5, 0.36]); b.position.set(x + (r() - 0.5) * 0.1, 0.5 + k * 0.27, (r() - 0.5) * 0.3 * (1 - k / 6)); g.add(b); } } }
  if (crop === 'beans') bar(V(-w / 2 + 0.2, 1.72, 0), V(w / 2 - 0.2, 1.72, 0), 0.016, new THREE.MeshStandardMaterial({ color: '#b89a5a', roughness: 0.9 }), g);
  return g;
}

export function makeCommunityGarden() {
  const g = new THREE.Group(); g.name = 'community_garden'; const cols = [], X0 = -9.5, X1 = 9.5, Z0 = -5, Z1 = 5;
  const put = (o, x, z, ry = 0, c = null) => { o.position.set(x, 0, z); o.rotation.y = ry; g.add(o); return o; };
  // ground: paths of pea gravel with plank edging; the plot itself keeps the verge's grass
  const gravel = mat('tr_gravel', { tint: '#c4bcae' }), edge = mat('wd_plank_b', { tint: [1.4, 2.1, 3.1] });
  flat(-8.6, X1, -0.75, 0.75, 0.022, gravel, g, 1.4); flat(-8.6, -7.1, -4.3, 4.3, 0.022, gravel, g, 1.4); flat(2.2, 3.7, 0.75, 4.3, 0.022, gravel, g, 1.4);
  for (const s of [-1, 1]) box(X1 + 7.1, 0.06, 0.04, edge, (X1 - 7.1) / 2, 0.03, s * 0.77, g, 0.9);
  // the glasshouse (south-west), the shed (north-east), linked by the paths
  const cg = []; put(glasshouse(cg), -3.0, -3.0); for (const c of cg) cols.push([c[0] - 3.0, c[1] - 3.0, c[2] - 3.0, c[3] - 3.0]);
  const cs = []; put(shed(cs), 6.6, 3.4, Math.PI); for (const c of cs) cols.push([6.6 - c[1], 6.6 - c[0], 3.4 - c[3], 3.4 - c[2]]);
  // raised beds north of the path
  const beds = [[-5.2, 2.6, 2.6, 1.3, 'greens', 3], [-2.0, 2.6, 2.6, 1.3, 'beans', 4], [0.9, 3.2, 1.6, 1.3, 'herbs', 5], [-5.2, 4.2, 2.6, 0.9, 'mulch', 6], [-2.0, 4.2, 2.6, 0.9, 'herbs', 7]];
  for (const [x, z, w, d, crop, seed] of beds) { put(bed(w, d, crop, seed), x, z); cols.push([x - w / 2, x + w / 2, z - d / 2, z + d / 2]); }
  put(bed(2.4, 1.2, 'greens', 9), 4.6, -3.2); cols.push([3.4, 5.8, -3.8, -2.6]); put(bed(2.4, 1.2, 'herbs', 11), 7.4, -3.2); cols.push([6.2, 8.6, -3.8, -2.6]);
  // compost bay: three slatted plywood sides, a heap of mulch
  { const c = new THREE.Group(); put(c, 1.4, -4.1); const ply = mat('i4_ply', { tint: [0.9, 1.3, 1.9] }); for (let k = 0; k < 5; k++) { box(1.3, 0.14, 0.025, ply, 0, 0.1 + k * 0.19, -0.6, c, 0.8); for (const s of [-1, 1]) box(0.025, 0.14, 1.2, ply, s * 0.65, 0.1 + k * 0.19, 0, c, 0.8); }
    for (const [x, z] of [[-0.65, -0.6], [0.65, -0.6], [-0.65, 0.6], [0.65, 0.6]]) box(0.07, 1.0, 0.07, edge, x, 0.5, z, c, 0.9);
    const heap = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), mat('mulch', { rough: 1 })); heap.scale.set(1, 0.75, 0.95); heap.position.y = 0.02; c.add(heap); cols.push([0.7, 2.1, -4.75, -3.45]); }
  // water butt: a blue plastic barrel on blocks, lid, brass tap, a downpipe from the glasshouse gutter
  { const b = new THREE.Group(); put(b, 0.5, -1.55); const blue = mat('b82_blueplastic', { rough: 0.45 }); for (const s of [-1, 1]) box(0.5, 0.2, 0.18, mat('b85_crackconc'), 0, 0.1, s * 0.16, b, 0.6);
    const prof = [[0.26, 0], [0.3, 0.1], [0.31, 0.45], [0.3, 0.8], [0.26, 0.9], [0.0, 0.92]].map(([a, c]) => new THREE.Vector2(a, c)); const body = new THREE.Mesh(new THREE.LatheGeometry(prof, 24), blue); body.position.y = 0.2; body.castShadow = true; b.add(body);
    for (const y of [0.42, 0.88]) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.012, 6, 28), blue); ring.rotation.x = Math.PI / 2; ring.position.y = y; b.add(ring); }
    cyl(0.018, 0.018, 0.09, new THREE.MeshStandardMaterial({ color: '#c8a040', metalness: 0.6, roughness: 0.35 }), 0.33, 0.36, 0, b, 8).rotation.z = Math.PI / 2; cols.push([0.15, 0.85, -1.9, -1.2]); }
  // potting table by the shed: butcher-block top, a stack of pots, a trowel, a bag of soil
  { const t = new THREE.Group(); put(t, 3.0, 2.6, Math.PI / 2); box(1.5, 0.05, 0.6, mat('butcher_block'), 0, 0.86, 0, t, 1.2); const leg = mat('wd_plank_b', { tint: [1.5, 2.3, 3.4] }); for (const [x, z] of [[-0.68, -0.24], [0.68, -0.24], [-0.68, 0.24], [0.68, 0.24]]) box(0.06, 0.84, 0.06, leg, x, 0.42, z, t, 0.9); box(1.36, 0.03, 0.48, leg, 0, 0.3, 0, t, 0.9);
    for (let i = 0; i < 4; i++) { const p = pot(0.1, null); p.position.set(-0.5, 0.885 + i * 0.045, 0.05); t.add(p); } const p1 = pot(0.13, 'leaf', 4); p1.position.set(0.1, 0.885, -0.08); t.add(p1); const p2 = pot(0.09, 'spray', 2); p2.position.set(0.45, 0.885, 0.1); t.add(p2);
    const bag = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.14, 0.6, 3, 2, 3), new THREE.MeshStandardMaterial({ map: canvasT(256, 384, (x, w, h) => { x.fillStyle = '#3a6a34'; x.fillRect(0, 0, w, h); x.fillStyle = '#f2e8c8'; x.fillRect(20, 60, w - 40, 150); x.fillStyle = '#2a4a24'; fitText(x, 'LOAM & LEAF', w / 2, 120, w - 60, 40, F.heavy); fitText(x, 'potting mix · 40 L', w / 2, 170, w - 70, 22, F.label); }), roughness: 0.6 })); { const bp = bag.geometry.attributes.position; for (let i = 0; i < bp.count; i++) bp.setY(i, bp.getY(i) * (1 - 0.5 * Math.abs(bp.getX(i)) / 0.21 * Math.abs(bp.getZ(i)) / 0.3)); bag.geometry.computeVertexNormals(); }
    bag.position.set(0.1, 0.39, 0); t.add(bag); cols.push([2.65, 3.35, 1.8, 3.4]); }
  // wheelbarrow on the path: galvanised tray, timber handles, one wheel
  { const w = new THREE.Group(); put(w, -6.2, 0.2, 0.5); const galv = mat('gf_galv', { tint: '#b4b8bc', rough: 0.45, metal: 0.5 }); const tray = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.26, 0.3, 4, 1, true), galv); tray.material.side = THREE.DoubleSide; tray.rotation.y = Math.PI / 4; tray.scale.set(1.35, 1, 0.85); tray.position.y = 0.5; w.add(tray); flat(-0.24, 0.24, -0.15, 0.15, 0.36, galv, w, 0.6);
    const heap = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat('mulch', { rough: 1 })); heap.scale.set(1.3, 0.5, 0.85); heap.position.y = 0.52; w.add(heap);
    const hm = mat('wd_plank_b', { tint: [1.7, 2.5, 3.6] }); for (const s of [-1, 1]) { bar(V(-0.55, 0.2, s * 0.2), V(1.0, 0.52, s * 0.28), 0.035, hm, w); bar(V(0.35, 0.36, s * 0.24), V(0.4, 0, s * 0.26), 0.03, galv, w); }
    const wh = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.05, 8, 20), new THREE.MeshStandardMaterial({ color: '#18181a', roughness: 0.9 })); wh.position.set(-0.55, 0.2, 0); w.add(wh); cyl(0.1, 0.1, 0.04, galv, -0.55, 0.2, 0, w, 14).rotation.x = Math.PI / 2; cols.push([-6.9, -5.4, -0.3, 0.7]); }
  // picket fence round the plot (slat wood), open at the gate on the +x side; gate posts + the sign arch
  { const pk = mat('b82_whitewash', { tint: '#f4f2ea', rough: 0.8 }); const pickets = []; const rail = (x0, z0, x1, z1) => { const len = Math.hypot(x1 - x0, z1 - z0), horiz = Math.abs(x1 - x0) > 0.01; for (const y of [0.3, 0.75]) box(horiz ? len : 0.04, 0.07, horiz ? 0.04 : len, pk, (x0 + x1) / 2, y, (z0 + z1) / 2, g, 0.8);
      for (let t = 0.08; t < len; t += 0.16) pickets.push([x0 + (x1 - x0) * t / len, z0 + (z1 - z0) * t / len, horiz]); for (let t = 0; t <= len + 0.01; t += len / Math.max(1, Math.round(len / 2.4))) box(0.09, 1.1, 0.09, pk, x0 + (x1 - x0) * t / len, 0.55, z0 + (z1 - z0) * t / len, g, 0.8); };
    rail(X0, Z0, X1, Z0); rail(X0, Z1, X1, Z1); rail(X0, Z0, X0, Z1); rail(X1, Z0, X1, -1.0); rail(X1, 1.0, X1, Z1);
    const pg = new THREE.BoxGeometry(0.09, 0.95, 0.022); pg.translate(0, 0.5, 0); { const p = pg.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) > 0.9) p.setX(i, p.getX(i) * 0.15); } pg.computeVertexNormals(); projUV(pg, 0.8);
    const im = new THREE.InstancedMesh(pg, pk, pickets.length); const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), up = V(0, 1, 0); pickets.forEach(([x, z, horiz], i) => { q.setFromAxisAngle(up, horiz ? 0 : Math.PI / 2); m4.compose(V(x, 0, z), q, V(1, 1, 1)); im.setMatrixAt(i, m4); }); im.castShadow = true; g.add(im);
    cols.push([X0 - 0.1, X1 + 0.1, Z0 - 0.1, Z0 + 0.1], [X0 - 0.1, X1 + 0.1, Z1 - 0.1, Z1 + 0.1], [X0 - 0.1, X0 + 0.1, Z0, Z1], [X1 - 0.1, X1 + 0.1, Z0, -1.0], [X1 - 0.1, X1 + 0.1, 1.0, Z1]);
    const post = mat('wd_plank_b', { tint: [1.5, 2.3, 3.4] }); for (const s of [-1, 1]) box(0.14, 2.5, 0.14, post, X1, 1.25, s * 1.05, g, 0.9); box(0.12, 0.12, 2.5, post, X1, 2.5, 0, g, 0.9);
    const st = canvasT(1024, 256, (x, w, h) => { x.fillStyle = '#2f5a34'; x.fillRect(0, 0, w, h); x.strokeStyle = '#f2ead0'; x.lineWidth = 8; x.strokeRect(14, 14, w - 28, h - 28); x.fillStyle = '#f2ead0'; fitText(x, 'Elm Loop Community Garden', w / 2, 112, w - 90, 92, F.script || F.heavy); fitText(x, 'plots · seedlings · compost   ·   555-0187', w / 2, 200, w - 160, 34, F.label, { spacing: 2 }); });
    const sm = new THREE.MeshStandardMaterial({ map: st, roughness: 0.6 }); const sign = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.5, 2.0), [sm, sm, post, post, post, post]); sign.position.set(X1, 2.15, 0); g.add(sign); }
  // a few clay pots + a low shrub by the gate, loose leaves of ivy along the fence foot
  { const r = rng(21); for (let i = 0; i < 5; i++) { const p = pot(0.14 + r() * 0.06, ['leaf', 'spray', 'leaf', 'tomato', 'spray'][i], i + 30); p.position.set(8.2 + r() * 0.8, 0, (i < 3 ? -1.6 - i * 0.5 : 1.5 + (i - 3) * 0.55)); g.add(p); }
    for (let i = 0; i < 10; i++) { const b = leafBall(0.3 + r() * 0.2, i + 40, [0.29, 0.42, 0.26]); b.position.set(X0 + 0.4 + r() * 0.3, 0.3, Z0 + 0.6 + i * 0.95); b.scale.y *= 0.8; g.add(b); } }
  g.userData = { colliders: cols, area: { minX: X0 + 0.2, maxX: X1 + 0.6, minZ: Z0 + 0.2, maxZ: Z1 - 0.2 } };
  return g;
}
