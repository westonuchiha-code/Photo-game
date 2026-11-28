// Shared helpers for the gap-filling sets (fill_*.js): everything there is built from textures already in the
// library, so the new things sit with the photographed ones.
import * as THREE from 'three';
import { mat, plain, canvasT, rng } from './kit.js';
export { THREE, mat, plain, canvasT, rng };
export const PI = Math.PI;
export const B = (w, h, d, m, x, y, z, parent, rx = 0, ry = 0, rz = 0) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.rotation.set(rx, ry, rz); parent.add(o); return o; };
export const C = (rt, rb, h, m, x, y, z, parent, seg = 14, rx = 0, rz = 0) => { const o = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m); o.position.set(x, y, z); o.rotation.set(rx, 0, rz); parent.add(o); return o; };
export const S = (r, m, x, y, z, parent, sx = 1, sy = 1, sz = 1, seg = 14) => { const o = new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.max(6, seg - 4)), m); o.position.set(x, y, z); o.scale.set(sx, sy, sz); parent.add(o); return o; };
export const tube = (g, a, b, r, m, seg = 8) => { const A = new THREE.Vector3(...a), Bv = new THREE.Vector3(...b), d = new THREE.Vector3().subVectors(Bv, A), o = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), seg), m); o.position.copy(A).addScaledVector(d, 0.5); o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); g.add(o); return o; };
export const torus = (g, R, r, m, x, y, z, rx = 0, ry = 0, arc = Math.PI * 2) => { const o = new THREE.Mesh(new THREE.TorusGeometry(R, r, 8, 24, arc), m); o.position.set(x, y, z); o.rotation.set(rx, ry, 0); g.add(o); return o; };
// a texture from the library, repeated rx by ry, tinted (tint multiplies the photo's own colour)
const _T = new Map();
export function T(name, rx = 1, ry = 1, { tint = '#ffffff', rough = 0.8, metal = 0, side = THREE.FrontSide, normal = 0.8 } = {}) { const k = [name, rx, ry, tint, rough, metal, side].join('|'); if (_T.has(k)) return _T.get(k);
  const src = mat(name, { tint, rough, metal, side, normal }), m = src.clone(); if (src.map) { m.map = src.map.clone(); m.map.repeat.set(rx, ry); m.map.needsUpdate = true; } if (src.normalMap) { m.normalMap = src.normalMap.clone(); m.normalMap.repeat.set(rx, ry); m.normalMap.needsUpdate = true; } m.userData.flat = true; _T.set(k, m); return m; }
export const P = (color, o = {}) => plain(color, { roughness: 0.6, ...o });
export const text = (x, s, cx, cy, font, col, maxW) => { x.font = font; x.fillStyle = col; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(s, cx, cy, maxW); };
export const sheet = (w, h, draw, o = {}) => new THREE.MeshStandardMaterial({ map: canvasT(w, h, draw), roughness: 0.7, ...o });
export const decal = (w, h, m, x, y, z, parent, ry = 0) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); p.position.set(x, y, z); p.rotation.y = ry; parent.add(p); return p; };
export const glass = (o = {}) => new THREE.MeshStandardMaterial({ color: '#cfe0e4', roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.25, depthWrite: false, ...o });
export const shadows = (g, col = null) => { g.traverse((o) => { if (o.isMesh && !o.material.transparent) { o.castShadow = true; o.receiveShadow = true; } }); if (col) g.userData.colliders = [col]; return g; };
// the usual materials, all from library textures
export const M = {
  galv: () => T('gf_galv', 1, 1, { rough: 0.45, metal: 0.5 }), steel: () => T('g132_metal_scratched', 1, 1, { rough: 0.4, metal: 0.4, tint: '#d8dade' }), stainless: () => P('#c4c8cc', { roughness: 0.32, metalness: 0.6 }),
  rust: () => T('b84_rust', 1, 1, { rough: 0.9, metal: 0.2 }), rustpaint: (tint = '#ffffff', r = 1) => T('g132_rustpaint', r, r, { tint, rough: 0.6, metal: 0.15 }), paint: (tint, r = 1) => T('rusty_paint', r, r, { tint, rough: 0.6 }),
  wood: (r = 1, tint = '#ffffff') => T('wd_plank_b', r, r, { tint, rough: 0.75 }), oak: (r = 1) => T('laminate_oak', r, r, { rough: 0.5 }), walnut: (r = 1) => T('walnut_floor', r, r, { rough: 0.5 }), greywood: (r = 1) => T('g144_wood_grey', r, r, { rough: 0.9 }), cedar: (r = 1) => T('tr_cedar', r, r, { rough: 0.8 }), osb: (r = 1) => T('osb', r, r, { rough: 0.9 }), ply: (r = 1) => T('g141_plywood', r, r, { rough: 0.85 }),
  concrete: (r = 1) => T('g131_concrete', r, r, { rough: 0.95 }), conc2: (r = 1) => T('lot_concrete', r, r, { rough: 0.95 }), brick: (r = 1) => T('wall_red_brick', r, r, { rough: 0.9 }), tanbrick: (r = 1) => T('b84_tanbrick', r, r, { rough: 0.9 }), stone: (r = 1) => T('g132_stoneface', r, r, { rough: 0.95 }),
  black: () => T('b80_blackplastic', 1, 1, { rough: 0.5 }), blueplastic: () => T('b85_blueplastic', 1, 1, { rough: 0.5 }), leather: (tint = '#ffffff') => T('op_leather', 1, 1, { tint, rough: 0.55 }), vinyl: (tint = '#ffffff') => T('booth_vinyl', 1, 1, { tint, rough: 0.5 }),
  fabric: (name = 'b82_chenille', tint = '#ffffff', r = 1) => T(name, r, r, { tint, rough: 0.95 }), canvas: (tint = '#ffffff') => T('b82_canvasgrey', 1, 1, { tint, rough: 0.95 }),
  grass: (r = 1) => T('hs_grass', r, r, { rough: 1 }), mulch: (r = 1) => T('mulch', r, r, { rough: 1 }), dirt: (r = 1) => T('g131_dirt', r, r, { rough: 1 }), sand: (r = 1) => T('g131_sand', r, r, { rough: 1 }), gravel: (r = 1) => T('g131_gravel', r, r, { rough: 1 }),
  tile: (r = 1) => T('subway_tile', r, r, { rough: 0.3 }), terrazzo: (r = 1) => T('terrazzo', r, r, { rough: 0.35 }), cardboard: (r = 1) => T('cardboard', r, r, { rough: 0.9 }), cork: () => P('#b89a6a', { roughness: 1 }),
  bark: (r = 1) => T('bark_oak', r, r, { rough: 1 }), plaster: (r = 1) => T('sg_plaster', r, r, { rough: 0.9 }), corten: (r = 1) => T('g144_corten', r, r, { rough: 0.85 }),
};
export const ground = (m, w, d, parent, y = 0.003) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, d), m); p.rotation.x = -PI / 2; p.position.y = y; p.receiveShadow = true; parent.add(p); return p; };
