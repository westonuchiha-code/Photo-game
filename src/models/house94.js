// Houses (94): detached homes with a garage, driveway, front path, lawn, fence and mailbox, from the texture library.
//   makeHouse({ w, d, seed })  local: body centred on the origin, front wall at z = +d/2 facing +z, ground y = 0.
//     userData: colliders (local rects), doorX (local x of the front door), w, d, lot { x0, x1, z0, z1 }
//   placeHouses({ grid })  a row of homes on the verge inside Elm Loop's south side, facing the Loop.
//     -> { group, colliders, areas, records }  (records go to the interiors manager: each home is enterable)
import * as THREE from 'three';
import { mat, plain, box, rbox, cyl, flat, bar, canvasT, rng, V, projUV } from './kit.js';
import { DOOR } from './district.js';
import { leafBall } from './trees.js';
import { makeMailbox } from './street92.js';
import { F, fitText } from '../fonts.js';

const CLAD = [['hs_siding', '#c8ccc4', 1.2], ['siding', '#d8c8a0', 1.6], ['ab_bluesiding', '#7a9ab0', 1.0], ['bk_tan', '#b08a5a', 0.9], ['hs_brick', '#9a4a3a', 1.0], ['hs_ybrick', '#c8a868', 0.8], ['i5_plaster', '#e0d6c0', 1.5], ['hs_siding', '#8a9a84', 1.2], ['siding', '#b8a0a0', 1.6]];
const ROOFS = [['ba_scale', '#4a3a36'], ['shr_roof', '#6a4a40'], ['ba_scale', '#2e3a44'], ['shr_roof', '#3a4a3a']];
const tri = (pts, m, parent, tile = 1) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts.flat(), 3)); g.setIndex(pts.length === 4 ? [0, 1, 2, 0, 2, 3] : [0, 1, 2]); g.computeVertexNormals(); projUV(g, tile); const o = new THREE.Mesh(g, m); o.castShadow = true; o.receiveShadow = true; parent.add(o); return o; };

export function makeHouse({ w = 10.4, d = 7.9, seed = 1 } = {}) {
  const g = new THREE.Group(); g.name = 'house'; const r = rng(seed * 131 + 7), pick = (a) => a[Math.floor(r() * a.length)], cols = [];
  const [ct, cc, ctile] = pick(CLAD), wallM = mat(ct, { to: cc, rough: 0.85, side: THREE.DoubleSide }), trim = mat('sg_plaster', { to: '#ecebe4', rough: 0.6 }), [rt, rc] = pick(ROOFS), roofM = mat(rt, { to: rc, rough: 0.9, side: THREE.DoubleSide });
  const WH = 2.95, RISE = 1.9 + r() * 0.6, FY = 0.16, hw = w / 2, hd = d / 2, T = 0.14, doorX = pick([-1.2, 0, 1.2]);
  box(w + 0.1, FY, d + 0.1, mat('lot_concrete', { to: '#9a988f' }), 0, FY / 2, 0, g, 2);
  // walls (the front one is laid round the doorway), lit / dark windows with frames + sills
  const wallX = (z, x0, x1, y0 = 0, y1 = WH) => box(x1 - x0, y1 - y0, T, wallM, (x0 + x1) / 2, (y0 + y1) / 2, z, g, ctile);
  wallX(-hd + T / 2, -hw, hw); wallX(hd - T / 2, -hw, doorX - DOOR.w / 2); wallX(hd - T / 2, doorX + DOOR.w / 2, hw); wallX(hd - T / 2, doorX - DOOR.w / 2, doorX + DOOR.w / 2, FY + DOOR.h, WH);
  for (const s of [-1, 1]) box(T, WH, d - 2 * T, wallM, s * (hw - T / 2), WH / 2, 0, g, ctile);
  cols.push([-hw, hw, -hd, -hd + T], [-hw, doorX - DOOR.w / 2, hd - T, hd], [doorX + DOOR.w / 2, hw, hd - T, hd], [-hw, -hw + T, -hd, hd], [hw - T, hw, -hd, hd]);
  for (const s of [-1, 1]) box(0.09, DOOR.h + 0.09, T + 0.06, trim, doorX + s * (DOOR.w / 2 + 0.045), FY + (DOOR.h + 0.09) / 2, hd - T / 2, g); box(DOOR.w + 0.18, 0.09, T + 0.06, trim, doorX, FY + DOOR.h + 0.045, hd - T / 2, g);
  const lightM = (on) => { const m = on ? new THREE.MeshBasicMaterial({ color: new THREE.Color(...pick([[1.5, 1.2, 0.7], [1.3, 1.25, 1.0], [1.4, 1.0, 0.6]])), toneMapped: false }) : plain('#101418', { roughness: 0.15, metalness: 0.4 }); m.userData.flat = true; return m; };
  const win = (x, z, ry, ww = 1.3, hh = 1.3) => { const o = new THREE.Group(); o.position.set(x, FY + 1.55, z); o.rotation.y = ry; g.add(o); const p = new THREE.Mesh(new THREE.PlaneGeometry(ww, hh), lightM(r() < 0.55)); p.position.z = 0.012; o.add(p); for (const s of [-1, 1]) { box(0.07, hh + 0.14, 0.05, trim, s * (ww / 2 + 0.035), 0, 0.02, o); box(ww + 0.14, 0.07, 0.05, trim, 0, s * (hh / 2 + 0.035), 0.02, o); } box(0.04, hh, 0.03, trim, 0, 0, 0.022, o); box(ww, 0.04, 0.03, trim, 0, 0, 0.022, o); box(ww + 0.24, 0.05, 0.12, trim, 0, -hh / 2 - 0.09, 0.05, o); };
  for (const x of [-hw + 1.6, hw - 1.6, 0]) { if (Math.abs(x - doorX) > 1.5) win(x, hd, 0); win(x, -hd, Math.PI); } for (const z of [-hd + 2, hd - 2.2]) { win(-hw, z, -Math.PI / 2); }
  // gable roof (ridge along x) with overhanging eaves, gable ends in the cladding, a brick chimney
  const ov = 0.45, y0 = WH, y1 = WH + RISE; tri([[-hw - ov, y0 - 0.12, hd + ov], [hw + ov, y0 - 0.12, hd + ov], [hw + ov, y1, 0], [-hw - ov, y1, 0]], roofM, g, 1.4); tri([[hw + ov, y0 - 0.12, -hd - ov], [-hw - ov, y0 - 0.12, -hd - ov], [-hw - ov, y1, 0], [hw + ov, y1, 0]], roofM, g, 1.4);
  for (const s of [-1, 1]) tri([[s * hw, y0, -hd], [s * hw, y0, hd], [s * hw, y1 - 0.12, 0]], wallM, g, ctile); box(w + 2 * ov, 0.06, 0.2, trim, 0, y1 + 0.02, 0, g); for (const s of [-1, 1]) box(w + 2 * ov, 0.16, 0.03, trim, 0, y0 - 0.17, s * (hd + ov), g);
  box(0.7, RISE + 1.2, 0.7, mat('hs_brick', { to: '#8a4a3a' }), -hw + 2.2, y0 + (RISE + 1.2) / 2 - 0.3, -hd + 2.0, g, 1.0); box(0.8, 0.1, 0.8, trim, -hw + 2.2, y0 + RISE + 0.92, -hd + 2.0, g);
  // porch: a step, two posts, a small roof; a lamp by the door
  box(2.2, FY, 1.0, mat('lot_concrete', { to: '#a8a69c' }), doorX, FY / 2, hd + 0.5, g, 1.5); box(1.8, FY / 2, 0.4, mat('lot_concrete', { to: '#a8a69c' }), doorX, FY / 4, hd + 1.2, g, 1.5); for (const s of [-1, 1]) box(0.1, 2.3, 0.1, trim, doorX + s * 1.0, FY + 1.15, hd + 0.92, g); tri([[doorX - 1.25, 2.55, hd + 1.15], [doorX + 1.25, 2.55, hd + 1.15], [doorX + 1.25, 2.85, hd], [doorX - 1.25, 2.85, hd]], roofM, g, 1.4);
  { const b = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 1.8, 1.1), toneMapped: false })); b.material.userData.flat = true; b.position.set(doorX + 0.85, FY + 1.95, hd + 0.1); g.add(b); }
  // garage on the +x side: its own walls, a roller door, a flat roof with a trim band
  const gw = 3.4, gd = 5.4, gx = hw + gw / 2, gz = hd - 0.3 - gd / 2, GH = 2.5; box(gw, GH, T, wallM, gx, GH / 2, gz - gd / 2 + T / 2, g, ctile); box(T, GH, gd, wallM, hw + gw - T / 2, GH / 2, gz, g, ctile); box(gw, 0.5, T, wallM, gx, GH - 0.25, gz + gd / 2 - T / 2, g, ctile); for (const s of [-1, 1]) box(0.3, GH - 0.5, T, wallM, gx + s * (gw / 2 - 0.15), (GH - 0.5) / 2, gz + gd / 2 - T / 2, g, ctile);
  { const sh = new THREE.Mesh(new THREE.PlaneGeometry(gw - 0.6, GH - 0.5), mat('gf_shutter_a', { to: pick(['#d8d8d2', '#8a8e92', '#5a6a5a']), rough: 0.5 })); sh.material.map.repeat?.set(1, 1); sh.position.set(gx, (GH - 0.5) / 2, gz + gd / 2 - T - 0.01); g.add(sh); } box(gw + 0.3, 0.14, gd + 0.3, mat('lot_concrete', { to: '#5a5a5c' }), gx, GH + 0.07, gz, g, 2);
  cols.push([hw, hw + gw, gz - gd / 2, gz + gd / 2]);
  // the lot: lawn, driveway, front path, picket fence along the sides + back, shrubs, a mailbox at the kerb
  const lotF = hd + 2.5, lx0 = -hw - 1.6, lx1 = hw + gw + 1.2; flat(lx0, lx1, -hd - 0.4, lotF, 0.012, mat('hs_grass', { to: '#5a7a44', rough: 1 }), g, 3);
  flat(gx - gw / 2 + 0.3, gx + gw / 2 - 0.3, gz + gd / 2, lotF, 0.02, mat('b85_crackconc', { to: '#9a9a96' }), g, 2); flat(doorX - 0.6, doorX + 0.6, hd + 1.4, lotF, 0.02, mat('b85_crackconc', { to: '#a8a69c' }), g, 1.2);
  const pk = mat('b82_whitewash', { tint: '#f4f2ea', rough: 0.8 }), pickets = []; const rail = (x0, z0, x1, z1) => { const len = Math.hypot(x1 - x0, z1 - z0), hz = Math.abs(x1 - x0) > 0.01; for (const y of [0.28, 0.68]) box(hz ? len : 0.035, 0.06, hz ? 0.035 : len, pk, (x0 + x1) / 2, y, (z0 + z1) / 2, g, 0.8); for (let t = 0.08; t < len; t += 0.17) pickets.push([x0 + (x1 - x0) * t / len, z0 + (z1 - z0) * t / len, hz]); cols.push([Math.min(x0, x1) - 0.05, Math.max(x0, x1) + 0.05, Math.min(z0, z1) - 0.05, Math.max(z0, z1) + 0.05]); };
  rail(lx0, -hd - 0.4, lx0, lotF - 0.3); rail(lx1, -hd - 0.4, lx1, lotF - 0.3); rail(lx0, -hd - 0.4, lx1, -hd - 0.4);
  { const pg = new THREE.BoxGeometry(0.085, 0.9, 0.02); pg.translate(0, 0.47, 0); const p = pg.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) > 0.85) p.setX(i, p.getX(i) * 0.15); pg.computeVertexNormals(); projUV(pg, 0.8); const im = new THREE.InstancedMesh(pg, pk, pickets.length), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), up = V(0, 1, 0); pickets.forEach(([x, z, hz], i) => { q.setFromAxisAngle(up, hz ? 0 : Math.PI / 2); m4.compose(V(x, 0, z), q, V(1, 1, 1)); im.setMatrixAt(i, m4); }); im.castShadow = true; g.add(im); }
  for (const x of [-hw + 0.8, -hw + 2.4, hw - 1.0]) { if (Math.abs(x - doorX) < 1.4) continue; const b = leafBall(0.45 + r() * 0.2, Math.floor(r() * 40), [0.29, 0.45, 0.28]); b.position.set(x, 0.4, hd + 0.6); b.scale.y *= 0.8; g.add(b); }
  { const mb = makeMailbox(); mb.scale.setScalar(0.5); mb.position.set(doorX - 1.1, 0.5, lotF - 0.5); g.add(mb); box(0.08, 0.6, 0.08, pk, doorX - 1.1, 0.3, lotF - 0.5, g); const nt = canvasT(128, 64, (x, W, H) => { x.fillStyle = '#23302a'; x.fillRect(0, 0, W, H); x.fillStyle = '#efe6d0'; fitText(x, String(100 + seed * 2), W / 2, 36, W - 20, 44, F.heavy); }); const np = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.15), new THREE.MeshStandardMaterial({ map: nt, roughness: 0.6 })); np.material.userData.flat = true; np.position.set(doorX - 0.95, FY + 1.6, hd + 0.005); g.add(np); }
  g.userData = { colliders: cols, doorX, w, d, lot: { x0: lx0, x1: lx1, z0: -hd - 0.4, z1: lotF }, noFinish: true };
  return g;
}

// a row of homes along the verge inside Elm Loop's south side (z between the outer row's back and the Loop), facing the Loop
export function placeHouses({ grid, startIndex = 10000 }) {
  const { xs, zs, walk: WH, ring: RG } = grid, group = new THREE.Group(); group.name = 'loop_houses'; const colliders = [], areas = [], records = [];
  const zBack = zs[0] - WH - 16 - 0.6, zLoop = RG.s + RG.hw, d = 7.9, w = 10.4, cz = zBack - d / 2 - 0.5; let n = 0;
  for (let i = 0; i < xs.length - 1; i++) { const a = xs[i] + WH + 3.2, b = xs[i + 1] - WH - 3.2, lotW = 17.6, k = Math.floor((b - a) / lotW), pad = (b - a - k * lotW) / 2;
    for (let j = 0; j < k; j++) { const seed = ++n, cx = a + pad + (j + 0.5) * lotW - 1.4, h = makeHouse({ w, d, seed }); h.position.set(cx, 0.006, cz); h.rotation.y = Math.PI; group.add(h);
      const W2 = (lx, lz) => [cx - lx, cz - lz]; for (const [x0, x1, z0, z1] of h.userData.colliders) { const [ax, az] = W2(x0, z0), [bx, bz] = W2(x1, z1); colliders.push({ type: 'box', minX: Math.min(ax, bx), maxX: Math.max(ax, bx), minZ: Math.min(az, bz), maxZ: Math.max(az, bz) }); }
      const L0 = h.userData.lot, [p0x, p0z] = W2(L0.x0, d / 2 + 0.05), [p1x, p1z] = W2(L0.x1, L0.z1 + 1.5); areas.push({ minX: Math.min(p0x, p1x) + 0.1, maxX: Math.max(p0x, p1x) - 0.1, minZ: Math.min(p0z, p1z, zLoop - 0.6), maxZ: Math.max(p0z, p1z) });
      const zf = cz - d / 2; records.push({ front: [cx + w / 2, zf, cx - w / 2, zf], L: w, doorU: w / 2 + h.userData.doorX, dep: d, floors: 2, shop: -1, index: startIndex + n, x0: cx - w / 2, x1: cx + w / 2, z0: zf, z1: cz + d / 2, face: 'n', house: true }); } }
  return { group, colliders, areas, records };
}
