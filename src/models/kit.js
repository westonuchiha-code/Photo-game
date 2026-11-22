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
export function canvasT(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); draw(x, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (document.fonts) document.fonts.ready.then(() => { draw(x, w, h); t.needsUpdate = true; }); return t; }
export const rng = (s) => () => ((s = (s * 16807) % 2147483647) / 2147483647);
export const V = (x, y, z) => new THREE.Vector3(x, y, z);
// soften a (rounded) box into a cushion: bulge the top, sag the edges a little, with some noise
export function puff(mesh, amount = 0.03, seed = 1) { const g = mesh.geometry, p = g.attributes.position; g.computeBoundingBox(); const b = g.boundingBox, cx = (b.min.x + b.max.x) / 2, cz = (b.min.z + b.max.z) / 2, hx = (b.max.x - b.min.x) / 2, hz = (b.max.z - b.min.z) / 2, r = rng(seed);
  for (let i = 0; i < p.count; i++) { const u = (p.getX(i) - cx) / hx, w = (p.getZ(i) - cz) / hz, t = (p.getY(i) - b.min.y) / (b.max.y - b.min.y); const dome = Math.max(0, 1 - u * u) * Math.max(0, 1 - w * w); p.setY(i, p.getY(i) + amount * dome * t + (r() - 0.5) * amount * 0.15 * t); }
  g.computeVertexNormals(); return mesh; }
