// Loader for the owner's PSX asset packs (tools/import_psx.py puts them in assets/textures as px_*).
// Model files are fetched by URL string (the single-file builds serve assets/textures from their packs that way) and
// parsed here; FBX textures are not taken from the files (their paths point at the author's disk): each material is
// rebuilt from a px_ texture by its material name.
import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { tex } from './kit.js';
export { THREE };
const BASE = 'assets/textures/';
const BLANK = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
const mgr = new THREE.LoadingManager(); mgr.setURLModifier((u) => (/\.(png|jpe?g|tga|psd|bmp|tif)$/i.test(u) ? BLANK : u));
const bytes = (f) => fetch(BASE + f).then((r) => { if (!r.ok) throw new Error('missing ' + f); return r.arrayBuffer(); });
const _src = new Map();
export const fbxSrc = (name) => { const k = name + '.fbx'; if (!_src.has(k)) _src.set(k, bytes(k).then((b) => new FBXLoader(mgr).parse(b, BASE))); return _src.get(k); };
export const glbSrc = (name) => { const k = name + '.glb'; if (!_src.has(k)) _src.set(k, bytes(k).then((b) => new GLTFLoader().parseAsync(b, BASE))); return _src.get(k); };
// a material from a px_ texture (alpha-tested: grates, ferns and fences are cut out in their textures)
const _m = new Map();
export function pxMat(name, { emissive = null, double = false, rough = 0.85, metal = 0, glass = false } = {}) {
  const k = [name, emissive, double, rough, metal, glass].join('|'); if (_m.has(k)) return _m.get(k);
  const o = { map: tex(name), roughness: rough, metalness: metal, alphaTest: glass ? 0 : 0.5, side: double ? THREE.DoubleSide : THREE.FrontSide };
  if (emissive) { o.emissiveMap = tex(emissive); o.emissive = new THREE.Color('#ffffff'); o.emissiveIntensity = 1.4; }
  if (glass) Object.assign(o, { transparent: true, opacity: 0.6, depthWrite: false });
  const m = new THREE.MeshStandardMaterial(o); _m.set(k, m); return m;
}
const shadowsOn = (g) => { g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); return g; };
// stand a model on the ground at the origin, scaled so its height (or its largest side) is `size` metres
export function settle(o, { height = null, largest = null, scale = null } = {}) {
  const g = new THREE.Group(); g.add(o); o.updateMatrixWorld(true);
  let b = new THREE.Box3().setFromObject(o); const s = b.getSize(new THREE.Vector3());
  const k = scale ?? (height ? height / (s.y || 1) : largest ? largest / (Math.max(s.x, s.y, s.z) || 1) : 1); o.scale.multiplyScalar(k); o.updateMatrixWorld(true);
  b = new THREE.Box3().setFromObject(o); const c = b.getCenter(new THREE.Vector3()); o.position.x -= c.x; o.position.z -= c.z; o.position.y -= b.min.y;
  return shadowsOn(g);
}
// one named piece out of a kit FBX (the kits lay all their pieces out in a row), with materials by name
export async function fbxPiece(file, piece, mats, opts = {}) {
  const src = await fbxSrc(file), root = src.clone(false);
  const part = src.getObjectByName(piece); if (!part) throw new Error(`${file}: no ${piece}`);
  const c = part.clone(true); c.position.set(0, 0, 0);
  root.add(c); applyMats(root, mats); return settle(root, { scale: 0.01, ...opts });
}
// a whole FBX, all its materials replaced by one or more px_ textures
export async function fbxWhole(file, mats, opts = {}) { const o = (await fbxSrc(file)).clone(true); applyMats(o, mats); return settle(o, opts); }
function applyMats(o, mats) {
  o.traverse((q) => { if (!q.isMesh) return; const ms = [].concat(q.material).map((m) => { const f = typeof mats === 'function' ? mats(m.name) : mats[m.name] ?? mats['*']; return f || m; }); q.material = ms.length === 1 ? ms[0] : ms; });
}
// a rigged GLB (the monsters). Their files only carry a T-pose, so they are posed here: arms brought down to the sides
// (world-space aim, works for both rigs in the pack: Character Creator CC_Base_* and Mixamo), elbows bent a little, and
// a slow idle on top (breathing sway through the spine, now and then a sharp head twitch), played by userData.update(t).
const bone = (o, re) => { let f = null; o.traverse((q) => { if (!f && q.isBone && re.test(q.name)) f = q; }); return f; };
function aim(b, child, dir) {   // turn bone b so the direction from it to `child` points along world `dir`
  if (!b || !child) return; b.updateWorldMatrix(true, true);
  const p0 = b.getWorldPosition(new THREE.Vector3()), p1 = child.getWorldPosition(new THREE.Vector3()), cur = p1.sub(p0).normalize();
  const dq = new THREE.Quaternion().setFromUnitVectors(cur, dir.clone().normalize()), wq = b.getWorldQuaternion(new THREE.Quaternion());
  const pq = b.parent.getWorldQuaternion(new THREE.Quaternion()); b.quaternion.copy(pq.invert().multiply(dq.multiply(wq)));
}
export async function glbRig(file, { height = 2, hang = 0.15, seed = 1 } = {}) {
  const g = await glbSrc(file), o = SkeletonUtils.clone(g.scene); o.updateMatrixWorld(true);
  const B = (re) => bone(o, re);
  for (const [up, fo, ha, sx] of [[/(_L_Upperarm|:LeftArm)$/, /(_L_Forearm|:LeftForeArm)$/, /(_L_Hand|:LeftHand)$/, 1], [/(_R_Upperarm|:RightArm)$/, /(_R_Forearm|:RightForeArm)$/, /(_R_Hand|:RightHand)$/, -1]]) {
    const u = B(up), f = B(fo), h = B(ha); if (!u || !f) continue;
    // which way is the arm sticking out? hang it down from there, a touch forward and out
    u.updateWorldMatrix(true, true); const side = f.getWorldPosition(new THREE.Vector3()).sub(u.getWorldPosition(new THREE.Vector3())); side.y = 0; side.normalize();
    aim(u, f, new THREE.Vector3(side.x * 0.18, -1, side.z * 0.18 + 0.08)); aim(f, h, new THREE.Vector3(side.x * 0.1, -1, 0.35 + hang));
  }
  const out = settle(o, { height }), spine = B(/(Spine02|:Spine2|Spine1)$/), head = B(/(CC_Base_Head|:Head)$/), hips = B(/(CC_Base_Hip|:Hips)$/);
  const base = new Map([spine, head, hips].filter(Boolean).map((b) => [b, b.quaternion.clone()])), e = new THREE.Euler(), q = new THREE.Quaternion();
  let twitch = 0, next = 2 + seed % 3, tw = new THREE.Euler();
  out.userData.update = (t) => {
    if (spine) spine.quaternion.copy(base.get(spine)).multiply(q.setFromEuler(e.set(Math.sin(t * 1.1 + seed) * 0.05, Math.sin(t * 0.7 + seed) * 0.04, Math.sin(t * 0.9) * 0.03)));
    if (head) { if (t > next) { twitch = 1; next = t + 2.5 + ((seed * 7.3 + t * 13.1) % 4); tw.set(((t * 3.7) % 1 - 0.5) * 0.7, ((t * 5.3) % 1 - 0.5) * 1.1, ((t * 2.9) % 1 - 0.5) * 0.8); }
      twitch *= 0.93; head.quaternion.copy(base.get(head)).multiply(q.setFromEuler(e.set(tw.x * twitch + Math.sin(t * 0.8) * 0.05, tw.y * twitch, tw.z * twitch + 0.12))); }
    if (hips) hips.quaternion.copy(base.get(hips)).multiply(q.setFromEuler(e.set(0, Math.sin(t * 0.5 + seed) * 0.03, Math.sin(t * 1.1 + seed) * 0.015)));
  };
  return out;
}

// a long tool from an OBJ (handle along z, head at the +z end): faces well off the handle's axis or at the tip are the
// head; each part gets its own material (used while the pack's own texture is missing)
export const objSrc = (name) => { const k = name + '.obj'; if (!_src.has(k)) _src.set(k, fetch(BASE + k).then((r) => { if (!r.ok) throw new Error('missing ' + k); return r.text(); }).then((t) => { const o = new OBJLoader().parse(t.replace(/^l .*$/gm, '')); o.userData.lines = /^l /m.test(t) ? new OBJLoader().parse(t.replace(/^f .*$/gm, '')) : null; return o; })); return _src.get(k); };
export async function objTool(file, headMat, handleMat, { largest = 0.8, handleR = 0.032, tip = 0.07 } = {}) {
  const src = await objSrc(file); let geo = null; src.traverse((o) => { if (!geo && o.isMesh) geo = o.geometry; });
  const g = geo.index ? geo.toNonIndexed() : geo.clone(), p = g.attributes.position; let zmax = -1e9; for (let i = 0; i < p.count; i++) zmax = Math.max(zmax, p.getZ(i));
  const head = [], handle = [];
  for (let f = 0; f < p.count; f += 3) { let x = 0, y = 0, z = 0; for (let k = 0; k < 3; k++) { x += p.getX(f + k) / 3; y += p.getY(f + k) / 3; z += p.getZ(f + k) / 3; } (Math.hypot(x, y) > handleR || z > zmax - tip ? head : handle).push(f); }
  const order = [...handle, ...head], out = new THREE.BufferGeometry();
  for (const nm of Object.keys(g.attributes)) { const a = g.attributes[nm], arr = new a.array.constructor(order.length * 3 * a.itemSize); order.forEach((f, j) => { for (let k = 0; k < 3; k++) for (let c = 0; c < a.itemSize; c++) arr[(j * 3 + k) * a.itemSize + c] = a.array[(f + k) * a.itemSize + c]; }); out.setAttribute(nm, new THREE.BufferAttribute(arr, a.itemSize)); }
  if (!out.attributes.normal) out.computeVertexNormals(); out.addGroup(0, handle.length * 3, 0); out.addGroup(handle.length * 3, head.length * 3, 1);
  const m = new THREE.Mesh(out, [handleMat, headMat]); m.rotation.x = -Math.PI / 2; return settle(m, { largest });
}

// an OBJ dressed from the library: every face gets a material key from pick({ obj, mtl, n, c, b, ob }) (n face normal,
// c face centre, b whole-model box, ob the part's box) and real-world UVs (`tile` metres per repeat, by face direction),
// since the pack's own UVs point into atlases we don't use. Line elements are dropped unless keepLines (as dark rope).
export async function objDress(file, mats, pick, { scale = null, height = null, largest = null, tile = 1, keepLines = false, lineMat = null, keepUV = [] } = {}) {
  const src = await objSrc(file), parts = []; src.updateMatrixWorld(true);
  src.traverse((o) => { if (o.isMesh) parts.push(o); });
  const all = new THREE.Box3(); for (const o of parts) all.expandByObject(o); if (scale === null && height === null && largest === null) scale = 1;
  const keys = Object.keys(mats), buckets = new Map(keys.map((k) => [k, { p: [], n: [], u: [] }])), A = new THREE.Vector3(), B = new THREE.Vector3(), C = new THREE.Vector3(), N = new THREE.Vector3(), c = new THREE.Vector3();
  for (const o of parts) { const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry, p = g.attributes.position, ob = new THREE.Box3().setFromObject(o), mt = [].concat(o.material), grp = g.groups.length ? g.groups : [{ start: 0, count: p.count, materialIndex: 0 }];
    // faces wound inward (some pack parts are): vote by face normal against the direction from the part's centre, flip if most point in
    const oc = ob.getCenter(new THREE.Vector3()); let vote = 0; for (let f = 0; f < p.count; f += 3) { A.fromBufferAttribute(p, f); B.fromBufferAttribute(p, f + 1); C.fromBufferAttribute(p, f + 2); N.subVectors(B, A).cross(C.clone().sub(A)); c.copy(A).add(B).add(C).divideScalar(3).sub(oc); vote += Math.sign(N.dot(c)) * N.length(); }
    const flip = vote < 0;
    for (const gr of grp) { const mtl = (mt[gr.materialIndex] || mt[0]).name;
      for (let f = gr.start; f < gr.start + gr.count; f += 3) { A.fromBufferAttribute(p, f); B.fromBufferAttribute(p, f + 1); C.fromBufferAttribute(p, f + 2); if (flip) { const t = B.clone(); B.copy(C); C.copy(t); } N.subVectors(B, A).cross(C.clone().sub(A)).normalize(); c.copy(A).add(B).add(C).divideScalar(3);
        const k = pick({ obj: o.name, mtl, n: N, c, b: all, ob }); const bk = buckets.get(k) || buckets.get(keys[0]); const ax = Math.abs(N.x), ay = Math.abs(N.y), az = Math.abs(N.z);
        const ouv = keepUV.includes(k) && g.attributes.uv; [A, B, C].forEach((v, j) => { bk.p.push(v.x, v.y, v.z); bk.n.push(N.x, N.y, N.z); if (ouv) { bk.u.push(ouv.getX(f + j), ouv.getY(f + j)); return; } const [u, w] = ax >= ay && ax >= az ? [v.z, v.y] : ay >= az ? [v.x, v.z] : [v.x, v.y]; bk.u.push(u / tile, w / tile); }); } } }
  const g = new THREE.Group();
  for (const [k, bk] of buckets) { if (!bk.p.length) continue; const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(bk.p, 3)); geo.setAttribute('normal', new THREE.Float32BufferAttribute(bk.n, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(bk.u, 2)); g.add(new THREE.Mesh(geo, mats[k])); }
  if (keepLines && src.userData.lines) src.userData.lines.traverse((o) => { if (o.isLineSegments || o.isLine) { const l = o.clone(); l.material = lineMat || new THREE.LineBasicMaterial({ color: '#2a2622' }); g.add(l); } });
  return settle(g, { scale, height, largest });
}
