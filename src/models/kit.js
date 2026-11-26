// Model kit: the helpers for building things out of the texture library alone (no new photos).
//   mat(name, { to, tint, rough, metal, side, normal })   a shared material from a library texture.
//       `to: '#rrggbb'` recolours it: the texture is tinted so its AVERAGE colour becomes that colour, keeping its
//       grain (weave, wood figure, brushed metal). That's how one fabric photo becomes any blanket, one plank any wood.
//   box / rbox (rounded) / cyl / flat / bar   meshes with real-world UVs (projUV: `tile` metres per texture repeat)
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { NORMAL_OF } from '../normals.js';

// average linear colour of each texture (so `to` can hit a target colour)
export const AVG = {
  fb_cotton: [0.09, 0.07, 0.07], fb_denim: [0.03, 0.03, 0.03], fb_fleece: [0.02, 0.02, 0.02], fb_knit: [0.04, 0.04, 0.05], fb_plaid_navy: [0.13, 0.1, 0.08], fb_plaid_red: [0.07, 0.07, 0.07],
  fb_velour: [0.02, 0.02, 0.02], b82_chenille: [0.33, 0.33, 0.33], op_leather: [0.27, 0.25, 0.22], dn_carpet: [0.15, 0.12, 0.1], dn_walnut: [0.29, 0.14, 0.09], wd_plank_a: [0.2, 0.09, 0.03],
  wd_plank_b: [0.2, 0.09, 0.035], wd_plank_c: [0.21, 0.11, 0.05], wd_plank_d: [0.24, 0.13, 0.05], laminate_oak: [0.35, 0.24, 0.16], liv_wood: [0.04, 0.02, 0.02], b80_blackplastic: [0.11, 0.1, 0.09],
  booth_vinyl: [0.43, 0.4, 0.16], liv_shade: [0.13, 0.11, 0.1], b82_canvasgrey: [0.28, 0.27, 0.26], sg_plaster: [0.547, 0.547, 0.51], gf_galv: [0.42, 0.45, 0.5], b85_zinc: [0.3, 0.3, 0.3],
  b86_floortile: [0.39, 0.30, 0.22], b86_walltile: [0.55, 0.51, 0.45], b82_quartz: [0.40, 0.34, 0.27], terrazzo: [0.48, 0.44, 0.46], subway_tile: [0.81, 0.81, 0.77], butcher_block: [0.34, 0.17, 0.09],
  ab_tile: [0.51, 0.42, 0.33], em_tile: [0.18, 0.33, 0.38], um_marble: [0.73, 0.74, 0.77], store_floor: [0.35, 0.33, 0.32],
  hs_siding: [0.21, 0.21, 0.20], siding: [0.52, 0.42, 0.31], hs_brick: [0.39, 0.25, 0.22], hs_ybrick: [0.49, 0.38, 0.26], bk_tan: [0.25, 0.18, 0.10], bk_white: [0.71, 0.69, 0.65], shr_roof: [0.45, 0.30, 0.28],
  ba_scale: [0.25, 0.14, 0.13], ab_bluesiding: [0.27, 0.39, 0.47], hs_grass: [0.49, 0.36, 0.20], gf_shutter_a: [0.24, 0.25, 0.28], b85_crackconc: [0.44, 0.45, 0.46], i5_plaster: [0.56, 0.44, 0.26],
  b84_rust: [0.28, 0.19, 0.15], store_crate_blue: [0.14, 0.18, 0.36], cardboard: [0.22, 0.12, 0.05], i4_ply: [0.28, 0.09, 0.05], b82_rust: [0.32, 0.09, 0.02], tx_drygrass: [0.20, 0.20, 0.19], b83_gravel: [0.461, 0.378, 0.293],
  b82_canvasblue: [0.199, 0.271, 0.365], creep_jeans: [0.074, 0.158, 0.326], i3_cloth: [0.118, 0.079, 0.222],
  wood_floor: [0.41, 0.27, 0.19], walnut_floor: [0.35, 0.22, 0.14], lot_concrete: [0.303, 0.295, 0.269], b82_speckle: [0.439, 0.39, 0.367], i7_brass: [0.4, 0.3, 0.12],
};
const _L = new THREE.TextureLoader(), _T = new Map(), _M = new Map();
export function tex(name, color = true) { const k = name + color; if (_T.has(k)) return _T.get(k); const t = _L.load(`assets/textures/${name}.png`); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; if (color) t.colorSpace = THREE.SRGBColorSpace; _T.set(k, t); return t; }
export function mat(name, { to = null, tint = '#ffffff', rough = 0.85, metal = 0, side = THREE.FrontSide, normal = 0.6, emissive = null } = {}) {
  const k = [name, to, tint, rough, metal, side, emissive].join('|'); if (_M.has(k)) return _M.get(k);
  const col = new THREE.Color(Array.isArray(tint) ? 0xffffff : tint); if (Array.isArray(tint)) col.setRGB(tint[0], tint[1], tint[2]);
  if (to) { const t = new THREE.Color(to), a = AVG[name] || [0.3, 0.3, 0.3]; col.setRGB(Math.min(12, t.r / a[0]), Math.min(12, t.g / a[1]), Math.min(12, t.b / a[2])); }
  const o = { map: tex(name), color: col, roughness: rough, metalness: metal, side };
  if (NORMAL_OF[name] && normal) { o.normalMap = tex(NORMAL_OF[name], false); o.normalScale = new THREE.Vector2(normal, normal); }
  if (emissive) { o.emissive = new THREE.Color(emissive); }
  const m = new THREE.MeshStandardMaterial(o); m.userData.flat = true; _M.set(k, m); return m;
}
export const plain = (color, o = {}) => { const k = 'plain|' + color + JSON.stringify(o); if (_M.has(k)) return _M.get(k); const m = new THREE.MeshStandardMaterial({ color, roughness: 0.6, ...o }); m.userData.flat = true; _M.set(k, m); return m; };
// box-project UVs at `tile` metres per repeat
export function projUV(g, tile = 1) {
  if (!g.attributes.normal) g.computeVertexNormals();
  const p = g.attributes.position, n = g.attributes.normal, uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) { const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i)); let u, v;
    if (ax >= ay && ax >= az) { u = p.getZ(i); v = p.getY(i); } else if (ay >= az) { u = p.getX(i); v = p.getZ(i); } else { u = p.getX(i); v = p.getY(i); }
    uv[i * 2] = u / tile; uv[i * 2 + 1] = v / tile; }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); return g;
}
const add = (g, m, parent, shadow = true) => { const o = new THREE.Mesh(g, m); o.castShadow = shadow; o.receiveShadow = true; parent.add(o); return o; };
export function box(w, h, d, m, x, y, z, parent, tile = 1) { const g = new THREE.BoxGeometry(w, h, d); g.translate(x, y, z); return add(projUV(g, tile), m, parent); }
export function rbox(w, h, d, r, m, x, y, z, parent, tile = 1, seg = 3) { const g = new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001)); g.translate(x, y, z); return add(projUV(g, tile), m, parent); }
export function cyl(rt, rb, h, m, x, y, z, parent, seg = 18) { const o = add(new THREE.CylinderGeometry(rt, rb, h, seg), m, parent); o.position.set(x, y, z); return o; }   // (positioned, not baked: callers turn it with .rotation)
export function flat(x0, x1, z0, z1, y, m, parent, tile = 1) { const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0); g.rotateX(-Math.PI / 2); g.translate((x0 + x1) / 2, y, (z0 + z1) / 2); return add(projUV(g, tile), m, parent, false); }
export function bar(a, b, t, m, parent) { const d = new THREE.Vector3().subVectors(b, a); const o = new THREE.Mesh(new THREE.BoxGeometry(t, d.length(), t), m); o.position.copy(a).addScaledVector(d, 0.5); o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize()); o.castShadow = true; parent.add(o); return o; }
export function canvasT(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'), go = () => { x.save(); draw(x, w, h); x.restore(); };   /* (drawn twice, the second time once the fonts are in: whatever a drawing leaves set must not carry over) */ go(); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (document.fonts) document.fonts.ready.then(() => { go(); t.needsUpdate = true; }); return t; }
export const rng = (s) => () => ((s = (s * 16807) % 2147483647) / 2147483647);
export const V = (x, y, z) => new THREE.Vector3(x, y, z);
// soften a (rounded) box into a cushion: bulge the top, sag the edges a little, with some noise
export function puff(mesh, amount = 0.03, seed = 1) { const g = mesh.geometry, p = g.attributes.position; g.computeBoundingBox(); const b = g.boundingBox, cx = (b.min.x + b.max.x) / 2, cz = (b.min.z + b.max.z) / 2, hx = (b.max.x - b.min.x) / 2, hz = (b.max.z - b.min.z) / 2, r = rng(seed);
  for (let i = 0; i < p.count; i++) { const u = (p.getX(i) - cx) / hx, w = (p.getZ(i) - cz) / hz, t = (p.getY(i) - b.min.y) / (b.max.y - b.min.y); const dome = Math.max(0, 1 - u * u) * Math.max(0, 1 - w * w); p.setY(i, p.getY(i) + amount * dome * t + (r() - 0.5) * amount * 0.15 * t); }
  g.computeVertexNormals(); return mesh; }
// draw one model many times: the group is flattened to one geometry per material and each becomes an InstancedMesh.
//   transforms: [{ x, y, z, ry, s }]. Returns a Group (a handful of draw calls however many copies there are).
import { mergeGeometries as _mergeGeos } from 'three/addons/utils/BufferGeometryUtils.js';
// (the copies are split into `cell`-metre squares, one instanced mesh per square, so squares off screen or far away aren't drawn)
export function instanceGroup(src, transforms, { shadow = true, cell = 250 } = {}) {
  src.updateMatrixWorld(true); const inv = new THREE.Matrix4().copy(src.matrixWorld).invert(), by = new Map();
  src.traverse((o) => { if (!o.isMesh || o.isInstancedMesh) return; const mats = Array.isArray(o.material) ? o.material : [o.material]; const m4 = new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld);
    mats.forEach((m, mi) => { let g = o.geometry; if (Array.isArray(o.material)) { const grp = g.groups.filter((q) => q.materialIndex === mi); if (!grp.length) return; const ng = g.index ? g.toNonIndexed() : g.clone(); const pos = [], nor = [], uv = []; for (const q of grp) for (let i = q.start; i < q.start + q.count; i++) { pos.push(ng.attributes.position.getX(i), ng.attributes.position.getY(i), ng.attributes.position.getZ(i)); if (ng.attributes.normal) nor.push(ng.attributes.normal.getX(i), ng.attributes.normal.getY(i), ng.attributes.normal.getZ(i)); if (ng.attributes.uv) uv.push(ng.attributes.uv.getX(i), ng.attributes.uv.getY(i)); } g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); if (nor.length) g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); if (uv.length) g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); }
      else g = g.index ? g.toNonIndexed() : g.clone();
      for (const n of Object.keys(g.attributes)) if (n !== 'position' && n !== 'normal' && n !== 'uv') g.deleteAttribute(n); if (!g.attributes.normal) g.computeVertexNormals(); if (!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
      g.applyMatrix4(m4); if (!by.has(m)) by.set(m, []); by.get(m).push(g); }); });
  const out = new THREE.Group(), M = new THREE.Matrix4(), Q = new THREE.Quaternion(), UP = new THREE.Vector3(0, 1, 0), P = new THREE.Vector3(), S = new THREE.Vector3();
  const cells = new Map(); for (const t of transforms) { const k = Math.floor(t.x / cell) + ',' + Math.floor(t.z / cell); if (!cells.has(k)) cells.set(k, []); cells.get(k).push(t); }
  for (const [m, geos] of by) { const geo = geos.length > 1 ? _mergeGeos(geos, false) : geos[0]; if (!geo) continue; for (const list of cells.values()) { const im = new THREE.InstancedMesh(geo, m, list.length);
    list.forEach((t, i) => { Q.setFromAxisAngle(UP, t.ry || 0); M.compose(P.set(t.x, t.y || 0, t.z), Q, S.setScalar(t.s || 1)); im.setMatrixAt(i, M); }); im.castShadow = shadow; im.receiveShadow = true; im.computeBoundingBox(); im.computeBoundingSphere(); out.add(im); } }
  return out;
}
