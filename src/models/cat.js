// Stray cats from the blue-house photos, sculpted as one smooth surface each.
// Every cat is a signed-distance "clay" model: ellipsoids and tapered capsules for chest, ribcage,
// haunches, thighs, legs, paws, neck, skull, cheeks, muzzle, chin, flat triangular ears and a
// long tail, all blended with smooth-min, then meshed with surface nets. Fur colour is painted
// per vertex: grey mackerel tabby (stripes round the body, rings on legs and tail, an "M" on the
// forehead, pale muzzle, chest and paws) or tortoiseshell (black with orange/brown mottling).
// Eyes, nose and whiskers are separate small meshes. Local axes: cat faces +x, y up, feet at y=0.
//   makeCat(kind = 'tabby' | 'tortie', pose = 'sit' | 'lie', scale = 1)
import * as THREE from 'three';

// ---------------------------------------------------------------- SDF helpers
const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
function ellipsoid(c, r, part) {
  return { part, f: (x, y, z) => {
    const px = (x - c.x) / r.x, py = (y - c.y) / r.y, pz = (z - c.z) / r.z;
    const k0 = Math.hypot(px, py, pz);
    const k1 = Math.hypot(px / r.x, py / r.y, pz / r.z);
    return k1 === 0 ? -Math.min(r.x, r.y, r.z) : k0 * (k0 - 1) / k1;
  } };
}
function cone(a, b, ra, rb, part) {      // capsule whose radius tapers from ra to rb
  const bx = b.x - a.x, by = b.y - a.y, bz = b.z - a.z, bb = bx * bx + by * by + bz * bz;
  return { part, f: (x, y, z) => {
    const px = x - a.x, py = y - a.y, pz = z - a.z;
    const h = Math.max(0, Math.min(1, (px * bx + py * by + pz * bz) / bb));
    return Math.hypot(px - bx * h, py - by * h, pz - bz * h) - (ra + (rb - ra) * h);
  } };
}
function chain(pts, r0, r1, part) {      // tail: tapered capsules through a list of points
  const segs = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const t0 = i / (pts.length - 1), t1 = (i + 1) / (pts.length - 1);
    segs.push(cone(pts[i], pts[i + 1], r0 + (r1 - r0) * t0, r0 + (r1 - r0) * t1, part));
  }
  return segs;
}
function ear(base, tip, n, part) {       // flat triangular ear: tapered cone clipped to a thin slab
  const c = cone(base, tip, 0.024, 0.002, part);
  return { part, f: (x, y, z) => Math.max(c.f(x, y, z), Math.abs((x - base.x) * n.x + (y - base.y) * n.y + (z - base.z) * n.z) - 0.005) };
}
function smin(a, b, k) { const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * 0.25; }

// ---------------------------------------------------------------- the sculpt
function headParts(H, big = 1) {
  const s = big;
  const P = [];
  P.push(ellipsoid(v3(H.x, H.y, H.z), v3(0.048 * s, 0.045 * s, 0.054 * s), 'head'));
  for (const sz of [-1, 1]) P.push(ellipsoid(v3(H.x + 0.02 * s, H.y - 0.016 * s, H.z + sz * 0.027 * s), v3(0.03 * s, 0.028 * s, 0.028 * s), 'cheek'));
  for (const sz of [-1, 1]) P.push(ellipsoid(v3(H.x + 0.05 * s, H.y - 0.022 * s, H.z + sz * 0.011 * s), v3(0.018 * s, 0.016 * s, 0.017 * s), 'muzzle'));   // whisker pads
  P.push(ellipsoid(v3(H.x + 0.038 * s, H.y - 0.036 * s, H.z), v3(0.016 * s, 0.011 * s, 0.016 * s), 'chin'));
  P.push(ellipsoid(v3(H.x + 0.032 * s, H.y + 0.012 * s, H.z), v3(0.03 * s, 0.018 * s, 0.03 * s), 'head'));   // brow / nose bridge
  const ears = [];
  for (const sz of [-1, 1]) {
    const n = v3(0.93, 0, sz * 0.36).normalize();
    ears.push(ear(v3(H.x - 0.006 * s, H.y + 0.03 * s, H.z + sz * 0.03 * s), v3(H.x - 0.014 * s, H.y + 0.082 * s, H.z + sz * 0.05 * s), n, 'ear'));
  }
  return { parts: P, ears };
}
function catSDF(pose, kitten) {
  const parts = [];
  let H;
  const hs = kitten ? 1.15 : 1;          // kittens have proportionally bigger heads
  if (pose === 'lie') {
    // sphinx / loaf: lying on the belly, front legs forward, head up
    parts.push(ellipsoid(v3(-0.01, 0.072, 0), v3(0.15, 0.07, 0.082), 'body'));
    parts.push(ellipsoid(v3(-0.12, 0.074, 0.0), v3(0.085, 0.07, 0.085), 'body'));     // haunches
    for (const sz of [-1, 1]) parts.push(ellipsoid(v3(-0.09, 0.05, sz * 0.07), v3(0.085, 0.045, 0.035), 'thigh'));
    for (const sz of [-1, 1]) parts.push(ellipsoid(v3(-0.03, 0.016, sz * 0.085), v3(0.07, 0.016, 0.022), 'paw'));   // hind feet tucked along the side
    parts.push(ellipsoid(v3(0.11, 0.082, 0), v3(0.075, 0.072, 0.07), 'chest'));
    for (const sz of [-1, 1]) {
      parts.push(cone(v3(0.11, 0.05, sz * 0.035), v3(0.23, 0.02, sz * 0.037), 0.023, 0.017, 'leg'));
      parts.push(ellipsoid(v3(0.24, 0.016, sz * 0.037), v3(0.028, 0.016, 0.021), 'paw'));
    }
    parts.push(cone(v3(0.13, 0.1, 0), v3(0.17, 0.165, 0), 0.05, 0.04, 'neck'));
    H = v3(0.185, 0.19, 0);
    parts.push(...chain([v3(-0.19, 0.06, 0), v3(-0.23, 0.025, 0.05), v3(-0.19, 0.016, 0.13), v3(-0.08, 0.016, 0.16), v3(0.02, 0.016, 0.15)], 0.02, 0.012, 'tail'));
  } else {
    // sitting upright, front legs straight, tail wrapped round the front feet
    parts.push(ellipsoid(v3(-0.045, 0.085, 0), v3(0.1, 0.085, 0.082), 'body'));       // haunches / hips
    for (const sz of [-1, 1]) parts.push(ellipsoid(v3(-0.03, 0.072, sz * 0.058), v3(0.085, 0.068, 0.04), 'thigh'));
    parts.push(cone(v3(-0.035, 0.11, 0), v3(0.035, 0.235, 0), 0.075, 0.058, 'body'));  // back / ribcage rising to the shoulders
    parts.push(ellipsoid(v3(0.05, 0.17, 0), v3(0.05, 0.085, 0.058), 'chest'));
    for (const sz of [-1, 1]) {
      parts.push(cone(v3(0.055, 0.175, sz * 0.03), v3(0.072, 0.02, sz * 0.032), 0.022, 0.016, 'leg'));
      parts.push(ellipsoid(v3(0.08, 0.013, sz * 0.032), v3(0.027, 0.014, 0.02), 'paw'));
      parts.push(ellipsoid(v3(0.035, 0.013, sz * 0.07), v3(0.05, 0.014, 0.022), 'paw'));   // hind feet poking forward
    }
    parts.push(cone(v3(0.035, 0.235, 0), v3(0.065, 0.29, 0), 0.048, 0.04, 'neck'));
    H = v3(0.075, 0.315, 0);
    parts.push(...chain([v3(-0.13, 0.04, 0), v3(-0.13, 0.016, 0.07), v3(-0.06, 0.014, 0.115), v3(0.03, 0.014, 0.115), v3(0.1, 0.014, 0.085)], 0.02, 0.012, 'tail'));
  }
  const head = headParts(H, hs);
  return { body: parts, head: head.parts, ears: head.ears, H, hs };
}
function evaluator(spec) {
  return (x, y, z) => {
    let d = 1e9, part = 'body', best = 1e9;
    for (const p of spec.body) { const v = p.f(x, y, z); d = smin(d, v, 0.035); if (v < best) { best = v; part = p.part; } }
    let dh = 1e9;
    for (const p of spec.head) { const v = p.f(x, y, z); dh = smin(dh, v, 0.022); if (v < best) { best = v; part = p.part; } }
    for (const p of spec.ears) { const v = p.f(x, y, z); dh = smin(dh, v, 0.006); if (v < best - 0.002) { best = v; part = p.part; } }
    d = smin(d, dh, 0.03);
    return [d, part];
  };
}

// ---------------------------------------------------------------- surface nets
function surfaceNets(fn, min, max, step) {
  const nx = Math.ceil((max.x - min.x) / step) + 1, ny = Math.ceil((max.y - min.y) / step) + 1, nz = Math.ceil((max.z - min.z) / step) + 1;
  const vals = new Float32Array(nx * ny * nz);
  const id = (i, j, k) => i + nx * (j + ny * k);
  for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) vals[id(i, j, k)] = fn(min.x + i * step, min.y + j * step, min.z + k * step);
  const cid = (i, j, k) => i + (nx - 1) * (j + (ny - 1) * k);
  const cellV = new Int32Array((nx - 1) * (ny - 1) * (nz - 1)).fill(-1);
  const pos = [];
  const corner = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]];
  const edges = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
  const cv = new Float32Array(8);
  for (let k = 0; k < nz - 1; k++) for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
    let neg = 0;
    for (let c = 0; c < 8; c++) { cv[c] = vals[id(i + corner[c][0], j + corner[c][1], k + corner[c][2])]; if (cv[c] < 0) neg++; }
    if (neg === 0 || neg === 8) continue;
    let sx = 0, sy = 0, sz = 0, n = 0;
    for (const [a, b] of edges) {
      if ((cv[a] < 0) === (cv[b] < 0)) continue;
      const t = cv[a] / (cv[a] - cv[b]);
      sx += corner[a][0] + (corner[b][0] - corner[a][0]) * t;
      sy += corner[a][1] + (corner[b][1] - corner[a][1]) * t;
      sz += corner[a][2] + (corner[b][2] - corner[a][2]) * t;
      n++;
    }
    cellV[cid(i, j, k)] = pos.length / 3;
    pos.push(min.x + (i + sx / n) * step, min.y + (j + sy / n) * step, min.z + (k + sz / n) * step);
  }
  const idx = [];
  const quad = (a, b, c, d, flip) => {
    if (a < 0 || b < 0 || c < 0 || d < 0) return;
    if (flip) idx.push(a, c, b, a, d, c); else idx.push(a, b, c, a, c, d);
  };
  for (let k = 1; k < nz - 1; k++) for (let j = 1; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
    const a = vals[id(i, j, k)], b = vals[id(i + 1, j, k)];
    if ((a < 0) === (b < 0)) continue;
    quad(cellV[cid(i, j - 1, k - 1)], cellV[cid(i, j, k - 1)], cellV[cid(i, j, k)], cellV[cid(i, j - 1, k)], a < 0);
  }
  for (let k = 1; k < nz - 1; k++) for (let j = 0; j < ny - 1; j++) for (let i = 1; i < nx - 1; i++) {
    const a = vals[id(i, j, k)], b = vals[id(i, j + 1, k)];
    if ((a < 0) === (b < 0)) continue;
    quad(cellV[cid(i - 1, j, k - 1)], cellV[cid(i - 1, j, k)], cellV[cid(i, j, k)], cellV[cid(i, j, k - 1)], a < 0);
  }
  for (let k = 0; k < nz - 1; k++) for (let j = 1; j < ny - 1; j++) for (let i = 1; i < nx - 1; i++) {
    const a = vals[id(i, j, k)], b = vals[id(i, j, k + 1)];
    if ((a < 0) === (b < 0)) continue;
    quad(cellV[cid(i - 1, j - 1, k)], cellV[cid(i, j - 1, k)], cellV[cid(i, j, k)], cellV[cid(i - 1, j, k)], a < 0);
  }
  return { pos, idx };
}

// ---------------------------------------------------------------- fur colour
function hash3(x, y, z) { const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return s - Math.floor(s); }
function noise3(x, y, z) {
  const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
  const fx = x - ix, fy = y - iy, fz = z - iz;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy), w = fz * fz * (3 - 2 * fz);
  let r = 0;
  for (let c = 0; c < 8; c++) {
    const dx = c & 1, dy = (c >> 1) & 1, dz = (c >> 2) & 1;
    r += hash3(ix + dx, iy + dy, iz + dz) * (dx ? u : 1 - u) * (dy ? v : 1 - v) * (dz ? w : 1 - w);
  }
  return r;
}
const C = (h) => new THREE.Color(h);
function furColour(kind, x, y, z, part, H, out) {
  const n = noise3(x * 30, y * 30, z * 30), fine = noise3(x * 160, y * 160, z * 160);
  if (kind === 'tortie') {
    const m = noise3(x * 14 + 3, y * 14, z * 14 - 2) + n * 0.35;
    let c = C('#191411');
    if (m > 0.9) c = C('#a8622e'); else if (m > 0.8) c = C('#5e3620'); else if (m > 0.7) c = C('#33221a');
    if (part === 'muzzle' || part === 'chin') c = z > 0.004 && m > 0.55 ? C('#8a5230') : C('#221915');   // split-face blaze
    if (part === 'ear' && x > H.x - 0.012) c = C('#3a2622');
    out.copy(c).multiplyScalar(0.85 + fine * 0.3);
    return;
  }
  // grey mackerel tabby
  const base = C('#7d756b'), dark = C('#2f2a26'), light = C('#cfc6b6');
  let c = base.clone();
  let stripe = 0;
  if (part === 'body' || part === 'thigh' || part === 'neck') stripe = Math.sin(x * 110 + n * 4 + Math.abs(z) * 25);
  else if (part === 'leg') stripe = Math.sin(y * 130 + n * 3);
  else if (part === 'tail') stripe = Math.sin((x * 0.6 + z) * 120 + n * 3);
  else if (part === 'head' && y > H.y + 0.008) stripe = Math.sin(z * 170 + n * 3) * (x < H.x + 0.035 ? 1 : 0);   // forehead "M" lines
  else if (part === 'cheek') stripe = Math.sin((y - H.y) * 260 + Math.abs(z) * 80);
  if (stripe > 0.45) c.lerp(dark, 0.85);
  if (Math.abs(z) < 0.012 && (part === 'body' || part === 'neck') && y > 0.1) c.lerp(dark, 0.7);   // dark spine line
  if (part === 'muzzle' || part === 'chin' || part === 'paw') c.lerp(light, 0.85);
  if (part === 'chest' && x > 0.07) c.lerp(light, 0.55);
  if (part === 'tail' && /tip/.test(part)) c.copy(dark);
  if (part === 'ear' && x > H.x - 0.012) c.lerp(C('#c99a92'), 0.6);
  out.copy(c).multiplyScalar(0.82 + fine * 0.36);
}

// ---------------------------------------------------------------- build
const geoCache = {};
function catGeometry(kind, pose, kitten) {
  const key = `${kind}|${pose}|${kitten}`;
  if (geoCache[key]) return geoCache[key];
  const spec = catSDF(pose, kitten);
  const ev = evaluator(spec);
  const f = (x, y, z) => ev(x, y, z)[0];
  const min = pose === 'lie' ? v3(-0.28, -0.012, -0.21) : v3(-0.2, -0.012, -0.16);
  const max = pose === 'lie' ? v3(0.31, 0.32, 0.21) : v3(0.19, 0.46, 0.16);
  const { pos, idx } = surfaceNets(f, min, max, 0.005);
  // flatten the very bottom so the cat sits on the ground
  for (let i = 1; i < pos.length; i += 3) if (pos[i] < 0.002) pos[i] = 0.002;
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  // normals from the SDF gradient (smooth), colours from the fur pattern
  const nrm = new Float32Array(pos.length), col = new Float32Array(pos.length);
  const e = 0.0015, tmp = new THREE.Color();
  for (let i = 0; i < pos.length; i += 3) {
    const x = pos[i], y = pos[i + 1], z = pos[i + 2];
    let gx = f(x + e, y, z) - f(x - e, y, z), gy = f(x, y + e, z) - f(x, y - e, z), gz = f(x, y, z + e) - f(x, y, z - e);
    const l = Math.hypot(gx, gy, gz) || 1;
    nrm[i] = gx / l; nrm[i + 1] = gy / l; nrm[i + 2] = gz / l;
    furColour(kind, x, y, z, ev(x, y, z)[1], spec.H, tmp);
    col[i] = tmp.r; col[i + 1] = tmp.g; col[i + 2] = tmp.b;
  }
  geo.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  // make every triangle face outward (agree with the gradient)
  const ix = geo.index.array, a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  for (let t = 0; t < ix.length; t += 3) {
    a.fromArray(pos, ix[t] * 3); b.fromArray(pos, ix[t + 1] * 3); c.fromArray(pos, ix[t + 2] * 3);
    const fnrm = b.clone().sub(a).cross(c.clone().sub(a));
    const g = new THREE.Vector3(nrm[ix[t] * 3], nrm[ix[t] * 3 + 1], nrm[ix[t] * 3 + 2]);
    if (fnrm.dot(g) < 0) { const s = ix[t + 1]; ix[t + 1] = ix[t + 2]; ix[t + 2] = s; }
  }
  geoCache[key] = { geo, spec, f };
  return geoCache[key];
}

export function makeCat(kind = 'tabby', pose = 'sit', scale = 1) {
  const kitten = scale < 0.85;
  const { geo, spec, f } = catGeometry(kind, pose, kitten);
  // march in from the front along -x to find the face surface at (y, z)
  const onFace = (y, z, inset) => { let x = spec.H.x + 0.15; while (x > spec.H.x - 0.05 && f(x, y, z) > 0) x -= 0.0007; return x - inset; };
  const g = new THREE.Group();
  const body = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 }));
  body.castShadow = true; body.receiveShadow = true;
  g.add(body);
  const H = spec.H, s = spec.hs;
  // eyes: glossy iris with a vertical slit pupil, set into the face
  const iris = new THREE.MeshStandardMaterial({ color: kind === 'tortie' ? '#d6a62a' : '#9ab04a', emissive: kind === 'tortie' ? '#3a2804' : '#22300a', roughness: 0.15 });
  const pupil = new THREE.MeshBasicMaterial({ color: '#050505' });
  for (const sz of [-1, 1]) {
    const eye = new THREE.Group();
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.0135 * s, 16, 12), iris);
    ball.scale.set(0.55, 0.85, 1); eye.add(ball);
    const slit = new THREE.Mesh(new THREE.SphereGeometry(0.0118 * s, 10, 8), pupil);
    slit.scale.set(0.6, 0.78, 0.22); slit.position.x = 0.0015; eye.add(slit);
    const ey = H.y + 0.008 * s, ez = H.z + sz * 0.023 * s;
    eye.position.set(onFace(ey, ez, 0.004 * s), ey, ez);
    eye.rotation.y = -sz * 0.45;
    g.add(eye);
  }
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.008 * s, 10, 8), new THREE.MeshStandardMaterial({ color: kind === 'tortie' ? '#2a1a18' : '#c98a86', roughness: 0.5 }));
  nose.scale.set(0.7, 0.6, 1.2); nose.position.set(onFace(H.y - 0.01 * s, H.z, 0.001), H.y - 0.01 * s, H.z); g.add(nose);
  const wmat = new THREE.MeshBasicMaterial({ color: '#e8e4dc', transparent: true, opacity: 0.6 });
  for (const sz of [-1, 1]) for (let w = 0; w < 3; w++) {
    const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.0006, 0.0006, 0.075 * s, 3), wmat);
    wh.position.set(onFace(H.y - 0.022 * s, H.z + sz * 0.012 * s, 0.006) , H.y - 0.022 * s - w * 0.004, H.z + sz * 0.05 * s);
    wh.rotation.set(0, 0, 0); wh.rotation.x = Math.PI / 2; wh.rotation.z = sz * (0.25 - w * 0.12); wh.rotation.y = sz * 0.2;
    g.add(wh);
  }
  g.scale.setScalar(scale);
  return g;
}

export { ellipsoid, cone, smin, surfaceNets, v3, noise3 };
