// Rule engine for dressing the owner's PSX OBJ packs from library textures (the owner keeps the packs' own textures out
// on purpose). A model is one entry: E(file, base skin, options). Skins are short strings ('paint:#c8281e', 'wood',
// 'rubber', ...), all built through fill_kit's T() so the no-repeat shader, shared grade and colour matching apply.
// Shared part rules (by OBJ part / material name) come first: wheels, tyres and tracks are rubber, windows glass,
// hoses rubber, nets wire, lids a darker paint; then the entry's own rules; then zones by height; then the base.
import { THREE, objDress } from './psx_kit.js';
import { T, M, P, glass, sheet, text } from './fill_kit.js';
import { tex } from './kit.js';

const _sk = new Map();
function cut(name, tint = '#ffffff', rep = 1) { const t = tex(name).clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); t.needsUpdate = true; return new THREE.MeshStandardMaterial({ map: t, color: tint, alphaTest: 0.45, side: THREE.DoubleSide, roughness: 0.9 }); }
function stripes(a = '#c8281e', b = '#f0ece0') { const m = sheet(64, 64, (x, w, h) => { x.fillStyle = b; x.fillRect(0, 0, w, h); x.fillStyle = a; for (let i = -2; i < 4; i++) { x.beginPath(); x.moveTo(i * 32, h); x.lineTo(i * 32 + 16, h); x.lineTo(i * 32 + 16 + h, 0); x.lineTo(i * 32 + h, 0); x.fill(); } }, { roughness: 0.5 }); m.map.wrapS = m.map.wrapT = THREE.RepeatWrapping; return m; }
export function skin(s) { if (_sk.has(s)) return _sk.get(s); const [k, a, b] = s.split(':'); let m;
  switch (k) {
    case 'paint': m = T('g132_rustpaint', 1, 1, { match: a, matchAmt: 0.9, rough: 0.55, metal: 0.2 }); break;
    case 'eplastic': m = P(a, { roughness: 0.5 }); break;
    case 'oldpaint': m = T('g132_rustpaint', 1, 1, { tint: a, rough: 0.8, metal: 0.1, match: a, matchAmt: 0.5 }); break;
    case 'plastic': m = P(a, { roughness: 0.45 }); break;
    case 'ceramic': m = P(a || '#eceae4', { roughness: 0.15 }); break;
    case 'metal': m = M.galv(); break; case 'galv': m = M.galv(); break; case 'rust': m = M.rust(); break; case 'chrome': m = P('#c8ccd0', { roughness: 0.25, metalness: 0.75 }); break;
    case 'gun': m = T('g132_metal_scratched', 1, 1, { tint: '#4a4c50', rough: 0.4, metal: 0.6 }); break;
    case 'rubber': m = P('#1c1c1e', { roughness: 0.9 }); break;
    case 'glass': m = glass({ opacity: 0.55, color: '#3a4a52' }); break;
    case 'glow': m = new THREE.MeshStandardMaterial({ color: a || '#ffe0a8', emissive: new THREE.Color(a || '#ffe0a8'), emissiveIntensity: 1.6 }); break;
    case 'wood': m = T('wd_plank_b', 1, 1, { rough: 0.85, match: a || '#7a5c40' }); break;
    case 'oldwood': m = T('g144_wood_grey', 1, 1, { rough: 0.95, match: a || '#6a6258' }); break;
    case 'walnut': m = T('walnut_floor', 1, 1, { rough: 0.5 }); break; case 'ply': m = M.ply(); break; case 'osb': m = M.osb(); break;
    case 'bark': m = T('bark_oak', 1, 1, { rough: 1 }); break; case 'endgrain': m = P('#b08a5c', { roughness: 1 }); break;
    case 'tin': m = T('g141_rust_roof', 1, 1, { rough: 0.8, metal: 0.25 }); break;
    case 'concrete': m = M.concrete(1); break; case 'asphalt': m = T('city_asphalt', 1, 1, { rough: 0.95 }); break;
    case 'tile': m = T('subway_tile', 1, 1, { rough: 0.25, match: a || '#9ac8d4' }); break;
    case 'leather': m = T('op_leather', 1, 1, { match: a, rough: 0.55 }); break;
    case 'fabric': m = T('b82_chenille', 1, 1, { match: a, rough: 0.95 }); break;
    case 'canvas': m = T('b82_canvasgrey', 1, 1, { match: a || '#6a6448', rough: 0.95 }); break;
    case 'stone': m = T(a || 'fr_rock', 1, 1, { rough: 0.95 }); break;
    case 'net': m = cut('px_sw_wirefence', a || '#ffffff', 2); break;
    case 'cut': m = cut(a, b ? '#' + b : '#ffffff'); break;
    case 'stripes': m = stripes(a, b); break;
    default: m = P(a || '#888888'); }
  _sk.set(s, m); return m; }
const SHARED = [[/wheel|tire|tyre|tracks?\b|tread|trackmill/i, 'rubber'], [/glass|window|windshield|cockpit/i, 'glass'], [/hose|cable|strap/i, 'rubber'], [/\bnet\b|\.n$|wire/i, 'net']];
const MIL = [[/gun|cannon|barrel|mg0815|turret7/i, 'gun']];
// draw a sign face: { bg, fg, lines: [[text, size, style]], border, art }
function drawFace(F) { return (x, w, h) => { x.fillStyle = F.bg; x.fillRect(0, 0, w, h); if (F.border) { x.strokeStyle = F.border; x.lineWidth = Math.max(6, w / 40); x.strokeRect(x.lineWidth, x.lineWidth, w - 2 * x.lineWidth, h - 2 * x.lineWidth); }
  if (F.art) F.art(x, w, h);
  if (F.dart) { const c = w / 2, R = Math.min(w, h) * 0.46; for (let i = 0; i < 20; i++) { const a0 = (i - 0.5) * Math.PI / 10 - Math.PI / 2, a1 = a0 + Math.PI / 10; for (const [r0, r1, A, B] of [[0.94, 1, '#c8281e', '#2a8a4a'], [0.6, 0.94, '#1a1a1a', '#f0e8c8'], [0.54, 0.6, '#c8281e', '#2a8a4a'], [0.1, 0.54, '#1a1a1a', '#f0e8c8']]) { x.fillStyle = i % 2 ? A : B; x.beginPath(); x.arc(c, h / 2, R * r1, a0, a1); x.arc(c, h / 2, R * r0, a1, a0, true); x.fill(); } } x.fillStyle = '#c8281e'; x.beginPath(); x.arc(c, h / 2, R * 0.05, 0, 7); x.fill(); } const L = F.lines || [], n = L.length; L.forEach(([t, s = 0.22, st = 'bold'], i) => text(x, t, w / 2, h * (n === 1 ? 0.5 : 0.25 + 0.5 * i / Math.max(1, n - 1)), `${st} ${Math.round(h * s)}px Arial`, F.fg, w * 0.9)); }; }
export function E(file, base, o = {}) { return async () => {
  const keys = new Set([base]), rules = [...(o.parts || []), ...SHARED, ...(o.mil ? MIL : [])];
  const mtlMap = o.mtl || {}; for (const v of Object.values(mtlMap)) keys.add(v); for (const [, v] of rules) keys.add(v); for (const z of ['top', 'low', 'side', 'up', 'down']) if (o[z]) keys.add(o[z]); for (const b of o.bands || []) keys.add(b[2]); if (o.split) keys.add(o.split[2]); if (o.plate) keys.add('__plate');
  const mats = {}; for (const k of keys) mats[k] = k === '__plate' ? skin(o.plate.under || base) : skin(k);
  if (o.radial) keys.add(o.radial[1]); if (o.lamp) keys.add('glow'); for (const k of keys) if (!mats[k]) mats[k] = skin(k);
  const pick = (q) => { const h = (q.c.y - q.b.min.y) / Math.max(1e-6, q.b.max.y - q.b.min.y);
    if (o.plate && o.plate.test(q, h)) return '__plate';
    if (o.lamp && h > 0.9 && q.n.y < -0.5) return 'glow';
    if (o.radial) { const cx = (q.b.min.x + q.b.max.x) / 2, cz = (q.b.min.z + q.b.max.z) / 2; if (Math.hypot(q.c.x - cx, q.c.z - cz) < o.radial[0]) return o.radial[1]; }
    if (mtlMap[q.mtl]) return mtlMap[q.mtl];
    for (const [re, v] of rules) if (re.test(q.obj) || re.test(q.mtl)) return v;
    if (/lid$/i.test(q.obj) && o.lid) return o.lid;
    for (const [lo, hi, v, sideOnly] of o.bands || []) if (h >= lo && h <= hi && (!sideOnly || Math.abs(q.n.y) < 0.5)) return v;
    if (o.split) { const [ax, at, v] = o.split, f = (q.c[ax] - q.b.min[ax]) / Math.max(1e-6, q.b.max[ax] - q.b.min[ax]); if (at > 0 ? f > at : f < -at) return v; }
    if (o.top && q.n.y > 0.6 && h > 0.8) return o.top; if (o.up && q.n.y > 0.6) return o.up; if (o.down && q.n.y < -0.6) return o.down; if (o.low && h < 0.12) return o.low; if (o.side && Math.abs(q.n.y) < 0.5) return o.side;
    return base; };
  const g = await objDress(file, mats, pick, { tile: o.tile || 1, keepLines: !!o.lines, keepUV: o.keepUV || [], ...(o.size || {}) });
  if (o.plate && o.plate.face) { let pm = null; g.traverse((q) => { if (q.isMesh && q.material === mats.__plate) pm = q; });
    if (pm) { const geo = pm.geometry; geo.computeBoundingBox(); const bb = geo.boundingBox, s = bb.getSize(new THREE.Vector3()), c = bb.getCenter(new THREE.Vector3()), nrm = new THREE.Vector3(), na = geo.attributes.normal;
      for (let i = 0; i < na.count; i++) nrm.x += na.getX(i), nrm.z += na.getZ(i); nrm.y = 0; nrm.normalize(); const alongX = Math.abs(nrm.z) > Math.abs(nrm.x), W = alongX ? s.x : s.z, H = s.y, k = 0.92;
      const F = o.plate.face, px = Math.round(512 * Math.min(1, W / H)) || 64, py = Math.round(512 * Math.min(1, H / W)) || 64;
      const pl = new THREE.Mesh(new THREE.PlaneGeometry(W * k, H * k), sheet(px, py, drawFace(F), { roughness: 0.6 })); pl.position.copy(c).addScaledVector(nrm, (alongX ? s.z : s.x) / 2 + 0.005); pl.lookAt(pl.position.clone().add(nrm)); pm.parent.add(pl); } }
  if (o.after) o.after(g); return g; }; }
// a plate test: faces looking along the model's thin horizontal side, from height `from` up
export const front = (from = 0.5, to = 1.01) => (q, h) => { const s = q.b.getSize(new THREE.Vector3()), n = s.x < s.z ? q.n.x : q.n.z; return n > 0.8 && h >= from && h <= to; };
// animated water for the pool pieces (stands in for the pack's Godot water shader)
export async function makePxPoolWater() { const t = tex('px_sw_water').clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3); t.needsUpdate = true;
  const m = new THREE.MeshStandardMaterial({ map: t, color: '#7ac8d8', roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.82 }), p = new THREE.Mesh(new THREE.PlaneGeometry(8, 8, 1, 1), m); p.rotation.x = -Math.PI / 2; p.position.y = 0.02;
  const g = new THREE.Group(); g.add(p); g.userData.update = (s) => { t.offset.set(s * 0.02, s * 0.013); }; return g; }
