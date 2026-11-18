// Trees from the bark / tree photos. Each tree is generated from a seed:
// a trunk with a root flare, recursive branches (tubes sharing the bark
// material), and foliage. Bark textures wrap once around and repeat every
// ~1 m up the trunk, so they keep the real scale of the photos.
//   spruce  - tall cone of drooping needle sprays, holiday string lights (spruce photos)
//   cherry  - smooth grey bark with ring marks, a big knot, thin late-autumn crown
//   pale    - pale flaky-bark street tree, mostly bare, in a leaf-filled pit
//   oak     - deep-furrowed dark bark street tree, a few brown leaves left
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const loader = new THREE.TextureLoader();
const texCache = new Map();
function tex(name, color = true) {
  if (texCache.has(name)) return texCache.get(name);
  const t = loader.load(`assets/textures/${name}`);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  if (color) t.colorSpace = THREE.SRGBColorSpace;
  texCache.set(name, t);
  return t;
}
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

const barkMats = {};
function barkMat(kind) {
  if (barkMats[kind]) return barkMats[kind];
  barkMats[kind] = new THREE.MeshStandardMaterial({
    map: tex(`bark_${kind}.png`), normalMap: tex(`bark_${kind}_normal.png`, false),
    normalScale: new THREE.Vector2(1.2, 1.2), roughness: 0.95,
  });
  return barkMats[kind];
}

// A tapered limb along a curve. UVs: u wraps around once, v = metres / 1.0.
function limb(curve, r0, r1, radial = 10, segs = 12, flare = null) {
  const geo = new THREE.TubeGeometry(curve, segs, 1, radial, false);
  const pos = geo.attributes.position, uv = geo.attributes.uv, nrm = geo.attributes.normal;
  const len = curve.getLength();
  const p = new THREE.Vector3(), c = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    const t = uv.getY(i) === undefined ? 0 : uv.getX(i);   // TubeGeometry: u = along, v = around
    const ring = uv.getY(i);
    curve.getPointAt(Math.min(1, t), c);
    p.fromBufferAttribute(pos, i).sub(c);                 // unit-radius offset from the centre line
    let r = r0 + (r1 - r0) * t;
    if (flare) r *= flare(t, ring);
    p.multiplyScalar(r).add(c);
    pos.setXYZ(i, p.x, p.y, p.z);
    uv.setXY(i, ring * Math.max(1, Math.round(r0 * 6)), (t * len) / 1.0);
  }
  geo.computeVertexNormals();
  return geo;
}

// Recursive branching: returns geometries for all limbs, and the tip points
// (with direction) where foliage goes.
function grow(r, start, dir, length, radius, depth, opts, out) {
  const { bend = 0.25, spread = 0.7, children = 3, lift = 0.15 } = opts;
  const pts = [start.clone()];
  const d = dir.clone();
  const p = start.clone();
  for (let k = 1; k <= 4; k++) {
    d.add(new THREE.Vector3((r() - 0.5) * bend, lift * 0.3 + (r() - 0.5) * bend * 0.5, (r() - 0.5) * bend)).normalize();
    p.addScaledVector(d, length / 4);
    pts.push(p.clone());
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  out.geos.push(limb(curve, radius, radius * 0.55, depth > 1 ? 9 : 5, depth > 1 ? 10 : 5));
  if (depth <= 0 || radius < 0.012) {
    out.tips.push({ p: p.clone(), d: d.clone(), r: radius });
    return;
  }
  const n = children + (r() < 0.4 ? 1 : 0);
  for (let i = 0; i < n; i++) {
    const t = 0.45 + 0.55 * ((i + r() * 0.6) / n);
    const at = curve.getPointAt(t);
    const a = r() * Math.PI * 2;
    const side = new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
    const nd = dir.clone().multiplyScalar(1 - spread).addScaledVector(side, spread).normalize();
    nd.y = Math.max(nd.y, opts.minUp ?? 0.15);
    nd.normalize();
    grow(r, at, nd, length * (0.62 + r() * 0.18), radius * 0.55 * (1 - t * 0.25), depth - 1, opts, out);
  }
}

// Trunk with root flare: radius swells near the ground and pushes out into
// lobes (roots) at the very base.
function trunk(r, height, radius, lean, lobes) {
  const pts = [];
  for (let k = 0; k <= 6; k++) {
    const t = k / 6;
    pts.push(new THREE.Vector3(lean.x * t * height + (r() - 0.5) * 0.05 * t, t * height, lean.z * t * height + (r() - 0.5) * 0.05 * t));
  }
  const phase = r() * Math.PI * 2;
  const geo = limb(new THREE.CatmullRomCurve3(pts), radius, radius * 0.62, 24, 30, (t, ring) => {
    const base = 1 + 0.9 * Math.exp(-t * height * 3.2);                         // flare
    const lobe = 1 + 0.45 * Math.exp(-t * height * 5) * Math.max(0, Math.sin(ring * Math.PI * 2 * lobes + phase)) ** 2;
    return base * lobe;
  });
  return { geo, top: pts[pts.length - 1] };
}

// Leaves as instanced cards (the cut-out oak leaf), clustered around branch tips.
function leafCards(tips, count, r, { size = 0.1, tint = [0.07, 0.6, 0.45], spread = 0.5 } = {}) {
  const geo = new THREE.PlaneGeometry(size, size * 1.15);
  const mat = new THREE.MeshStandardMaterial({ map: tex('oak_leaf.png'), alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.9 });
  const inst = new THREE.InstancedMesh(geo, mat, count);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(1, 1, 1), v = new THREE.Vector3(), c = new THREE.Color();
  for (let i = 0; i < count; i++) {
    const tip = tips[Math.floor(r() * tips.length)];
    v.set(tip.p.x + (r() - 0.5) * spread, tip.p.y + (r() - 0.5) * spread * 0.7, tip.p.z + (r() - 0.5) * spread);
    q.setFromEuler(new THREE.Euler(r() * Math.PI, r() * Math.PI, r() * Math.PI));
    const k = 0.7 + r() * 0.6;
    inst.setMatrixAt(i, m4.compose(v, q, s.set(k, k, k)));
    c.setHSL(tint[0] + (r() - 0.5) * 0.04, tint[1] + (r() - 0.5) * 0.2, tint[2] + (r() - 0.5) * 0.2);
    inst.setColorAt(i, c);
  }
  inst.castShadow = true;
  return inst;
}

function finish(g, geos, kind) {
  const merged = mergeGeometries(geos, false);
  const mesh = new THREE.Mesh(merged, barkMat(kind));
  mesh.castShadow = mesh.receiveShadow = true;
  g.add(mesh);
}

// ---------------------------------------------------------------- spruce
export function makeSpruce({ seed = 1, height = 10 } = {}) {
  const r = rng(seed);
  const g = new THREE.Group();
  g.name = 'spruce_tree';
  const { geo, top } = trunk(r, height, 0.32, { x: 0, z: 0 }, 5);
  const geos = [geo];
  // knots (the round scars in the bark photo): short stubs low on the trunk
  for (let i = 0; i < 6; i++) {
    const y = 0.8 + r() * 2.2, a = r() * Math.PI * 2;
    const d = new THREE.Vector3(Math.cos(a), 0.1, Math.sin(a));
    const s = new THREE.Vector3(d.x * 0.2, y, d.z * 0.2);
    geos.push(limb(new THREE.LineCurve3(s, s.clone().addScaledVector(d, 0.14)), 0.07, 0.06, 8, 1));
  }
  // whorls of drooping branches, longer at the bottom, each carrying needle sprays
  const sprayGeo = new THREE.PlaneGeometry(1, 0.5);
  sprayGeo.translate(0.5, 0, 0);
  const sprayMat = new THREE.MeshStandardMaterial({ map: tex('spruce_spray.png'), alphaTest: 0.35, side: THREE.DoubleSide, roughness: 0.85 });
  const sprays = [];
  const lightsAt = [];
  for (let y = 1.4; y < height - 0.3; y += 0.3) {
    const f = 1 - (y - 1.6) / (height - 1.6);          // 1 at bottom, 0 at top
    const L = 0.5 + 3.4 * f;
    const n = 6 + Math.round(4 * f);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + r() * 0.5;
      const d = new THREE.Vector3(Math.cos(a), -0.25 - r() * 0.2, Math.sin(a)).normalize();
      const s = new THREE.Vector3(0, y, 0);
      const mid = s.clone().addScaledVector(d, L * 0.5).add(new THREE.Vector3(0, 0.12, 0));
      const end = s.clone().addScaledVector(d, L);
      geos.push(limb(new THREE.QuadraticBezierCurve3(s, mid, end), 0.022 * (0.5 + f), 0.006, 5, 4));
      // needle sprays along the branch, angled down and out
      for (let k = 0; k < 5 + Math.round(7 * f); k++) {
        const t = 0.15 + 0.85 * r();
        const p = new THREE.Vector3().lerpVectors(s, end, t);
        sprays.push({ p, a: -a + (r() - 0.5) * 1.6, droop: 0.2 + r() * 0.5, k: 0.75 + 0.9 * (1 - t) * (0.4 + f) });
        if (r() < 0.2) lightsAt.push(p.clone().add(new THREE.Vector3((r() - 0.5) * 0.3, -0.12, (r() - 0.5) * 0.3)));
      }
    }
  }
  finish(g, geos, 'spruce');
  const inst = new THREE.InstancedMesh(sprayGeo, sprayMat, sprays.length);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), c = new THREE.Color();
  sprays.forEach((s, i) => {
    q.setFromEuler(new THREE.Euler(r() * 0.6 - 0.3, s.a, -s.droop, 'YXZ'));
    sc.set(s.k * 1.3, s.k * 1.3, 1);
    inst.setMatrixAt(i, m4.compose(s.p, q, sc));
    c.setHSL(0.42, 0.25 + r() * 0.15, 0.3 + r() * 0.2);
    inst.setColorAt(i, c);
  });
  inst.castShadow = true;
  g.add(inst);
  // the multicolour holiday lights in the photo
  const bulbs = new THREE.InstancedMesh(new THREE.SphereGeometry(0.035, 6, 4), new THREE.MeshBasicMaterial({ toneMapped: false }), lightsAt.length);
  const palette = [[2.4, 0.3, 0.3], [0.3, 2.2, 0.4], [0.3, 0.6, 2.6], [2.4, 1.6, 0.3], [2.0, 0.4, 2.0], [2.2, 2.2, 2.0]];
  lightsAt.forEach((p, i) => {
    bulbs.setMatrixAt(i, m4.makeTranslation(p.x, p.y, p.z));
    bulbs.setColorAt(i, c.setRGB(...palette[i % palette.length]));
  });
  g.add(bulbs);
  const glow = new THREE.PointLight('#c08aff', 3, 9, 2);
  glow.position.set(0, 3, 0);
  g.add(glow);
  g.userData.radius = 0.45;
  return g;
}

// ---------------------------------------------------------------- deciduous
function deciduous(kind, { seed = 1, height = 3.2, radius = 0.17, lean = { x: 0.03, z: 0.02 }, depth = 3, leaves = 500, leafTint, opts = {} }) {
  const r = rng(seed);
  const g = new THREE.Group();
  g.name = `${kind}_tree`;
  const { geo, top } = trunk(r, height, radius, lean, 4);
  const out = { geos: [geo], tips: [] };
  const nMain = 3 + (r() < 0.5 ? 1 : 0);
  for (let i = 0; i < nMain; i++) {
    const a = (i / nMain) * Math.PI * 2 + r();
    const d = new THREE.Vector3(Math.cos(a) * 0.55, 0.85, Math.sin(a) * 0.55).normalize();
    const start = top.clone().add(new THREE.Vector3(0, -0.4 * r(), 0));
    grow(r, start, d, 2.2 + r() * 0.8, radius * 0.6, depth, { children: 3, spread: 0.55, bend: 0.35, lift: 0.2, minUp: 0.05, ...opts }, out);
  }
  g.userData.extra?.(g, r, out);
  finish(g, out.geos, kind);
  if (leaves) g.add(leafCards(out.tips, leaves, r, { tint: leafTint }));
  g.userData.radius = radius * 1.9;
  g.userData.tips = out.tips;
  return g;
}

// Cherry: smooth grey bark with horizontal ring marks; one big knot bulge on the trunk.
export function makeCherry({ seed = 3 } = {}) {
  const g = deciduous('cherry', { seed, height: 2.4, radius: 0.15, depth: 3, leaves: 650, leafTint: [0.03, 0.65, 0.42] });
  const r = rng(seed + 99);
  const knot = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 12), barkMat('cherry'));
  knot.scale.set(1, 1.5, 0.7);
  knot.position.set(0.12, 1.5, 0.05);
  knot.rotation.y = r() * Math.PI;
  g.add(knot);
  return g;
}

// Pale flaky bark: tall straight street tree, almost bare.
export function makePaleTree({ seed = 5 } = {}) {
  return deciduous('pale', { seed, height: 3.6, radius: 0.15, depth: 3, leaves: 160, leafTint: [0.11, 0.55, 0.55] });
}

// Oak: deep furrowed bark, a slight lean, some brown leaves hanging on.
export function makeOak({ seed = 7 } = {}) {
  return deciduous('oak', { seed, height: 3.0, radius: 0.19, lean: { x: 0.05, z: -0.03 }, depth: 3, leaves: 420, leafTint: [0.07, 0.45, 0.35] });
}

// Square tree pit filled with leaf litter, with a low concrete edge.
export function makeTreePit(w = 1.4, d = 1.4) {
  const g = new THREE.Group();
  g.name = 'tree_pit';
  const litter = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ map: tex('leaf_litter.png'), roughness: 1 }));
  litter.material.map.repeat?.set(w / 0.6, d / 0.6);
  litter.rotation.x = -Math.PI / 2;
  litter.position.y = 0.012;
  g.add(litter);
  const edge = new THREE.MeshStandardMaterial({ color: '#9d9a93', roughness: 0.9 });
  for (const [x, z, sx, sz] of [[0, -d / 2, w + 0.1, 0.05], [0, d / 2, w + 0.1, 0.05], [-w / 2, 0, 0.05, d], [w / 2, 0, 0.05, d]]) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(sx, 0.05, sz), edge);
    b.position.set(x, 0.025, z);
    g.add(b);
  }
  return g;
}

// Round mulch bed (the red mulch under the spruce).
export function makeMulchBed(radius = 3) {
  const t = loader.load('assets/textures/mulch.png');   // own copy so the repeat is ours
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.repeat.set(radius / 0.5, radius / 0.5);
  const m = new THREE.Mesh(new THREE.CircleGeometry(radius, 40), new THREE.MeshStandardMaterial({ map: t, roughness: 1 }));
  m.rotation.x = -Math.PI / 2;
  m.position.y = 0.01;
  m.name = 'mulch_bed';
  return m;
}
