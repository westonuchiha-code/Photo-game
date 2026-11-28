// The PSX character bases as town people: the pack's FBX bases have no usable rig, so each one is rigged here onto the
// same skeleton the town's own people use (body97 makeBody: hips, spine, chest, neck, head, arm/fore/hand,
// thigh/shin/foot, facing +z) with the same walk pose, so makePeople can walk them like everyone else.
// Joints are read off the mesh (hip width, hand tips, toes); every vertex is weighted to its two nearest bones.
// preloadPxPeople() must have finished before pxPerson() (it is synchronous, like makePerson).
import { THREE, fbxSrc, pxMat } from './psx_kit.js';
import { PX_LOOKS } from './psx_people.js';
export { PX_LOOKS };
const BASES = { px_ch_male_pants_base: 'm', px_ch_male_shorts_base: 'm', px_ch_female_skirt_base: 'f', px_ch_female_pants_base: 'f' };
const HEAD_MAT = { m: 'Material.007', f: 'Material.008' }, H0 = 1.75;   // geometry is normalised to 1.75 m, people scale it
const _src = {}, _rig = {};
export async function preloadPxPeople() { const ks = Object.keys(BASES); const os = await Promise.all(ks.map(fbxSrc)); ks.forEach((k, i) => (_src[k] = os[i])); }
export const pxPeopleReady = () => Object.keys(_src).length === Object.keys(BASES).length;

function prep(base) {
  if (_rig[base]) return _rig[base]; const sex = BASES[base], src = _src[base]; src.updateMatrixWorld(true);
  // merge every mesh into one geometry (group 0 body, group 1 head) in the model's space
  const pos = [], nor = [], uv = [], idxB = [], idxH = []; let off = 0;
  src.traverse((o) => { if (!o.isMesh) return; const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry, p = g.attributes.position, n = g.attributes.normal, t = g.attributes.uv, m = o.matrixWorld, nm = new THREE.Matrix3().getNormalMatrix(m), v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).applyMatrix4(m); pos.push(v.x, v.y, v.z); v.fromBufferAttribute(n, i).applyMatrix3(nm).normalize(); nor.push(v.x, v.y, v.z); uv.push(t ? t.getX(i) : 0, t ? t.getY(i) : 0); }
    const mats = [].concat(o.material), groups = g.groups.length ? g.groups : [{ start: 0, count: p.count, materialIndex: 0 }];
    for (const gr of groups) { const head = (mats[gr.materialIndex] || mats[0]).name === HEAD_MAT[sex]; for (let i = gr.start; i < gr.start + gr.count; i++) (head ? idxH : idxB).push(off + i); }
    off += p.count; });
  // normalise: feet on the ground, centred, 1.75 m tall, facing +z (toes are in front of the ankles)
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, z0 = 1e9, z1 = -1e9; for (let i = 0; i < pos.length; i += 3) { x0 = Math.min(x0, pos[i]); x1 = Math.max(x1, pos[i]); y0 = Math.min(y0, pos[i + 1]); y1 = Math.max(y1, pos[i + 1]); z0 = Math.min(z0, pos[i + 2]); z1 = Math.max(z1, pos[i + 2]); }
  const k = H0 / (y1 - y0), cx = (x0 + x1) / 2, cz = (z0 + z1) / 2; for (let i = 0; i < pos.length; i += 3) { pos[i] = (pos[i] - cx) * k; pos[i + 1] = (pos[i + 1] - y0) * k; pos[i + 2] = (pos[i + 2] - cz) * k; }
  let fz = 0, fn = 0, az = 0, an = 0; for (let i = 0; i < pos.length; i += 3) { const y = pos[i + 1]; if (y < 0.03 * H0) { fz += pos[i + 2]; fn++; } else if (y < 0.12 * H0) { az += pos[i + 2]; an++; } }
  if (fn && an && fz / fn < az / an) for (let i = 0; i < pos.length; i += 3) { pos[i] = -pos[i]; pos[i + 2] = -pos[i + 2]; nor[i] = -nor[i]; nor[i + 2] = -nor[i + 2]; }
  // joints, read off the mesh
  const H = H0, hipY = 0.52 * H, shY = 0.815 * H, neckY = 0.855 * H, headY = 0.875 * H, kneeY = 0.285 * H, ankY = 0.045 * H, J = { hipY, shY, neckY, headY };
  const side = (s, f) => { let best = null; for (let i = 0; i < pos.length; i += 3) { const x = pos[i] * s, y = pos[i + 1]; if (x <= 0) continue; const v = f(x, y, pos[i + 2]); if (v !== null && (!best || v > best[0])) best = [v, pos[i], y, pos[i + 2]]; } return best; };
  let hx = 0, hn = 0, tz = 0, tn = 0; for (let i = 0; i < pos.length; i += 3) { const y = pos[i + 1]; if (y > 0.38 * H && y < 0.44 * H) { hx += Math.abs(pos[i]); hn++; } if (y > 0.75 * H && y < 0.8 * H && Math.abs(pos[i]) < 0.08 * H) { tz += pos[i + 2]; tn++; } }
  const hipX = hn ? hx / hn : 0.05 * H, torsoZ = tn ? tz / tn : 0, limbs = {};
  for (const s of [-1, 1]) {
    const tip = side(s, (x, y) => (y > 0.3 * H && y < 0.8 * H ? x : null)), toe = side(s, (x, y, z) => (y < 0.05 * H ? z : null));
    const sh = new THREE.Vector3(s * 0.105 * H, shY, torsoZ), hand = new THREE.Vector3(tip[1], tip[2], tip[3]), wr = sh.clone().lerp(hand, 0.84), el = sh.clone().lerp(wr, 0.5);
    const hip = new THREE.Vector3(s * hipX, hipY, 0), kn = new THREE.Vector3(s * hipX * 0.92, kneeY, 0.01 * H), an_ = new THREE.Vector3(s * hipX * 0.85, ankY, -0.005 * H), tp = new THREE.Vector3(s * hipX * 0.85, 0.01 * H, toe ? toe[3] : 0.07 * H);
    limbs[s] = { sh, el, wr, hand, hip, kn, an: an_, tp };
  }
  // bones (as body97: positions relative to the parent, no rotation) and segments for the weights
  const segs = [], add = (name, a, b, r, sideS = 0) => segs.push({ name, a, b, r, s: sideS });
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  add('hips', V(0, hipY - 0.06 * H, 0), V(0, hipY + 0.055 * H, 0), 0.12 * H); add('spine', V(0, hipY + 0.055 * H, 0), V(0, (hipY + shY) / 2 + 0.035 * H, torsoZ), 0.12 * H);
  add('chest', V(0, (hipY + shY) / 2 + 0.035 * H, torsoZ), V(0, neckY, torsoZ), 0.13 * H); add('neck', V(0, neckY, torsoZ), V(0, headY, torsoZ), 0.045 * H); add('head', V(0, headY, torsoZ), V(0, H, torsoZ), 0.09 * H);
  for (const s of [-1, 1]) { const L = limbs[s]; add('arm' + s, L.sh, L.el, 0.04 * H, s); add('fore' + s, L.el, L.wr, 0.035 * H, s); add('hand' + s, L.wr, L.hand, 0.035 * H, s);
    add('thigh' + s, L.hip, L.kn, 0.065 * H, s); add('shin' + s, L.kn, L.an, 0.05 * H, s); add('foot' + s, L.an, L.tp, 0.045 * H, s); }
  const order = segs.map((g) => g.name), n = pos.length / 3, si = new Uint16Array(n * 4), sw = new Float32Array(n * 4), p = new THREE.Vector3(), ab = new THREE.Vector3(), ap = new THREE.Vector3();
  for (let i = 0; i < n; i++) { p.set(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]); const sc = segs.map((g, j) => { ab.subVectors(g.b, g.a); ap.subVectors(p, g.a); const t = Math.max(0, Math.min(1, ap.dot(ab) / ab.lengthSq())); let d = ap.sub(ab.multiplyScalar(t)).length() / g.r; if (g.s && Math.sign(p.x) !== g.s && Math.abs(p.x) > 0.01 * H) d += 3; return [d, j]; }).sort((a, b) => a[0] - b[0]);
    const w0 = Math.exp(-sc[0][0] * sc[0][0] * 2), w1 = Math.exp(-sc[1][0] * sc[1][0] * 2) * 0.9, t = w0 + w1 || 1; si[i * 4] = sc[0][1]; si[i * 4 + 1] = sc[1][1]; sw[i * 4] = w0 / t; sw[i * 4 + 1] = w1 / t; }
  // the bases stand in an A-pose: swing the arms down to hang beside the body (vertices by their arm weight, about the shoulder)
  for (const sd of [-1, 1]) { const L = limbs[sd], cur = Math.atan2(L.hand.x - L.sh.x, -(L.hand.y - L.sh.y)), want = sd * 0.1, rot = want - cur, c0 = Math.cos(rot), s0 = Math.sin(rot);
    const turn = (v, w = 1) => { const c = Math.cos(rot * w), sn = Math.sin(rot * w), dx = v.x - L.sh.x, dy = v.y - L.sh.y; v.x = L.sh.x + dx * c - dy * sn; v.y = L.sh.y + dx * sn + dy * c; };
    const armIdx = new Set(['arm' + sd, 'fore' + sd, 'hand' + sd].map((nm) => order.indexOf(nm)));
    for (let i = 0; i < n; i++) { let w = 0; for (let k = 0; k < 2; k++) if (armIdx.has(si[i * 4 + k])) w += sw[i * 4 + k]; if (w < 0.01) continue; p.set(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]); turn(p, w); pos[i * 3] = p.x; pos[i * 3 + 1] = p.y;
      const nx = nor[i * 3], ny = nor[i * 3 + 1], c = Math.cos(rot * w), sn = Math.sin(rot * w); nor[i * 3] = nx * c - ny * sn; nor[i * 3 + 1] = nx * sn + ny * c; }
    for (const v of [L.el, L.wr, L.hand]) turn(v); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(si, 4)); geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(sw, 4)); geo.setIndex([...idxB, ...idxH]); geo.addGroup(0, idxB.length, 0); geo.addGroup(idxB.length, idxH.length, 1); geo.computeBoundingSphere();
  return (_rig[base] = { geo, order, limbs, J, torsoZ, sex });
}
export function pxPerson(seed = 1, look = null) {
  const L = look || PX_LOOKS[(seed * 7 + 3) % PX_LOOKS.length], [base, atlas, tone, sex] = L, R = prep(base), { J, limbs: Lm, torsoZ: tz } = R, H = H0;
  const g = new THREE.Group(), by = {}, mk = (name, parent, w) => { const b = new THREE.Bone(); b.name = name; b.userData.w = w.clone(); const pw = parent ? parent.userData.w : new THREE.Vector3(); b.position.copy(w).sub(pw); (parent || g).add(b); by[name] = b; return b; };
  const hips = mk('hips', null, new THREE.Vector3(0, J.hipY, 0)), spine = mk('spine', hips, new THREE.Vector3(0, J.hipY + 0.055 * H, 0)), chest = mk('chest', spine, new THREE.Vector3(0, (J.hipY + J.shY) / 2 + 0.035 * H, tz)), neck = mk('neck', chest, new THREE.Vector3(0, J.neckY, tz)), head = mk('head', neck, new THREE.Vector3(0, J.headY, tz)), limbs = {};
  for (const s of [-1, 1]) { const q = Lm[s], a = mk('arm' + s, chest, q.sh), f = mk('fore' + s, a, q.el), h = mk('hand' + s, f, q.wr), t = mk('thigh' + s, hips, q.hip), sh = mk('shin' + s, t, q.kn), ft = mk('foot' + s, sh, q.an); limbs[s] = { a, f, h, t, s: sh, ft }; }
  const mats = [pxMat(atlas, { rough: 0.85 }), pxMat('px_ch_head_' + (sex === 'f' ? 'female' : 'male') + '_' + tone + '_d', { rough: 0.85 })];
  const mesh = new THREE.SkinnedMesh(R.geo, mats); mesh.castShadow = true; g.add(mesh); g.updateMatrixWorld(true); mesh.bind(new THREE.Skeleton(R.order.map((nm) => by[nm])));
  const Lf = limbs[-1], Rt = limbs[1];
  g.userData.pose = (ph, k = 1) => { const sn = Math.sin(ph), cs = Math.cos(ph);   // body97's walk, k: 0 standing .. 1 a full stride
    Lf.t.rotation.x = -sn * 0.5 * k; Rt.t.rotation.x = sn * 0.5 * k; Lf.s.rotation.x = (Math.max(0, cs) * 0.9 + 0.05) * k; Rt.s.rotation.x = (Math.max(0, -cs) * 0.9 + 0.05) * k; Lf.ft.rotation.x = -Math.max(0, cs) * 0.25 * k; Rt.ft.rotation.x = -Math.max(0, -cs) * 0.25 * k;
    Lf.a.rotation.x = sn * 0.42 * k; Rt.a.rotation.x = -sn * 0.42 * k; Lf.f.rotation.x = -0.12 - Math.max(0, sn) * 0.4 * k; Rt.f.rotation.x = -0.12 - Math.max(0, -sn) * 0.4 * k;
    hips.position.y = J.hipY + (Math.abs(cs) * 0.03 - 0.03) * k; hips.rotation.y = sn * 0.08 * k; spine.rotation.y = -sn * 0.14 * k; hips.rotation.z = cs * 0.02 * k; neck.rotation.y = sn * 0.05 * k; };
  g.userData.sex = sex; g.userData.bones = { hips, spine, chest, neck, head, L: Lf, R: Rt }; g.userData.mesh = mesh; g.userData.spec = { hipY: J.hipY }; g.userData.noFinish = true; g.userData.px = true; g.userData.pose(0, 0);
  const r = ((seed * 9301 + 49297) % 233280) / 233280, h = sex === 'f' ? 1.6 + r * 0.1 : 1.72 + r * 0.1; g.scale.setScalar(h / H0); return g;
}
// for the library: one walking, and a few in a row
export async function makePxWalker() { await preloadPxPeople(); const g = pxPerson(3); let last = 0; g.userData.update = (t) => { g.userData.pose(t * 7, 1); last = t; }; return g; }
export async function makePxCrowd() { await preloadPxPeople(); const g = new THREE.Group(); const ps = PX_LOOKS.slice(0, 8).map((L, i) => { const p = pxPerson(i, L); p.position.x = (i - 3.5) * 0.8; g.add(p); return p; }); g.userData.update = (t) => ps.forEach((p, i) => p.userData.pose(t * 7 + i, 1)); return g; }
